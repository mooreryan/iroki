function ary_min_max(ary)
{
  var min = null;
  var max = null;
  ary.forEach(function(val){
    if (!max || val > max) {
      max = val;
    }

    if (!min || val < min) {
      min = val;
    }
  });

  return { min: min, max: max };
}



function parse_biom_file(str)
{
  // Parse mapping string.
  var csv = Papa.parse(chomp(str), PAPA_CONFIG);

  // TODO test
  // Check for erros
  if (has_papa_errors(csv)) {
    return null;
  }

  // TODO test
  if (csv.meta.fields.indexOf("name") === -1) {
    alert("ERROR -- Missing the 'name' column header in the biom file.");
    return null;
  }

  // TODO check for duplicated sample name headers.

  var column_info = {};


  csv.meta.fields.forEach(function(field) {
    column_info[field] = [];
  });

  csv.data.map(function(line) {
    json_each(line, function(col_header, col_data) {
      column_info[col_header].push(col_data);
    })
  });

  var scaled_counts = {};

  json_each(column_info, function(sample_name, ary) {
    if (sample_name !== "name") {
      // Key is one of the samples with the counts.
      var min_max = ary_min_max(ary);
      var min = min_max.min;
      var max_minus_min = min_max.max - min;

      scaled_counts[sample_name] = ary.map(function(count) {
        return (count - min) / max_minus_min;
      });
    }
  });

  return csv;
}

function round_to(x, place)
{
  return Math.round(place * x) / place;
}

// TODO should this be multiplyed by two?
function get_point(count, sample_idx, num_samples)
{
  var angle = sample_to_angle(sample_idx, num_samples, deg_to_rad(g_val_hue_angle_offset));

  var pt = {
    x: count * Math.cos(angle),
    y: count * Math.sin(angle)
  };

  return pt;
}

// Sample idx starts at zero
function sample_to_angle(sample_idx, num_samples, angle_offset)
{
  return ((2 * Math.PI / num_samples) * sample_idx) + angle_offset;
}

// Count data is from the csv.data from Papa.
// samples is from csv.meta.fields
function sample_counts_to_points(csv)
{
  var count_data = csv.data;
  var samples = csv.meta.fields;

  // subtract 1 to account for the 'name' field
  var num_samples = samples.length - 1;

  if (num_samples === 1) {
    // Need to add fake samples with zero counts to ensure we have at least a triangle to get the centroid of.
    var fake_samples = ["iroki_fake_1", "iroki_fake_2"];
  } else if (num_samples === 2) {
    var fake_samples = ["iroki_fake_1"];
  } else {
    var fake_samples = [];
  }

  if (fake_samples.length > 0) {
    count_data.forEach(function(row) {
      fake_samples.forEach(function(name) {
        // TODO this will break if one of these sample names is used.
        row[name] = 0;
      });
    });

    fake_samples.forEach(function(name) { samples.push(name); });
  }

  // TODO check to see if the json keeps the order.
  var points = {};

  count_data.forEach(function(row) {
    var leaf_name = "";

    // First you need the max count.
    var max_count = 0;
    var min_count = null;
    var min_non_zero_count = null;
    json_each(row, function(sample_name, count) {
      if (sample_name !== "name") {
        if (max_count < count) {
          max_count = count;
        }

        if (min_count === null || min_count > count) {
          min_count = count;
        }

        if (count !== 0 && (min_non_zero_count === null || min_non_zero_count > count)) {
          min_non_zero_count = count;
        }
      }
    });

    // If the smallest non-zero val is smaller than 1e-5 take a tenth of that or else just take 1e-5.  It should be small enoughnot to matter most of the time.
    var zero_replacement_val = min_non_zero_count < 1e-5 ? min_non_zero_count * 0.1 : 1e-5;

    samples.forEach(function(sample, sample_idx) {
      // The first thing is 'name' not a sample.
      var true_sample_idx = sample_idx - 1;


      if (sample === "name") {  // It isn't a sample, but the name of the row/otu
        leaf_name = row[sample];
        points[leaf_name] = {};
      } else  { // it is a sample not the name of the row/otu
        var count = null;
        if (max_count === 0 || row[sample] === 0) {
          // Set it to a tiny number that won't get rounded to zero.
          count = zero_replacement_val;
        } else {
          count = row[sample] / max_count;
        }

        var pt = get_point(count, true_sample_idx, num_samples);

        points[leaf_name][sample] = pt;
      }
    });
  });

  return points;
}


function signed_area_of_triangle(p1, p2, p3)
{
  return ((p1.x * (p2.y - p3.y)) + (p2.x * (p3.y - p1.y)) + (p3.x * (p1.y - p2.y))) / 2;
}

function centroid_of_triangle(p1, p2, p3)
{
  return { x: (p1.x + p2.x + p3.x) / 3, y: (p1.y + p2.y + p3.y) / 3 };
}

// TODO instead of calculating all triangles, could save some steps by removing p2 from the points obj and rerunning.  (this would also required using signed area)
// TODO needs at least 3 samples.
function centroids_of_points(all_points)
{

  var centroids = {};

  json_each(all_points, function(leaf, points) {
    var samples = json_keys(points);
    var sum_x_numer = 0;
    var sum_y_numer = 0;
    var sum_denom = 0;

    // For each triangle...
    for (var i = 0; i < samples.length; ++i) {
      if (i < samples.length - 2) {
        var p1 = points[samples[i]    ];
        var p2 = points[samples[i + 1]];
        var p3 = points[samples[i + 2]];
      } else if (i < samples.length - 1) {
        var p1 = points[samples[i]    ];
        var p2 = points[samples[i + 1]];
        var p3 = points[samples[0]    ];
      } else {
        var p1 = points[samples[i]];
        var p2 = points[samples[0]];
        var p3 = points[samples[1]];
      }

      var signed_area = signed_area_of_triangle(p1, p2, p3);
      var area = Math.abs(signed_area);
      var centroid = centroid_of_triangle(p1, p2, p3);

      sum_x_numer += area * centroid.x;
      sum_y_numer += area * centroid.y;
      sum_denom += area;
    }

    centroids[leaf] = {
      x: sum_x_numer / sum_denom,
      y: sum_y_numer / sum_denom
    };
  });

  return centroids;
}

function centroids_of_samples(biom_txt)
{
  var points = sample_counts_to_points(parse_biom_file(biom_txt));

  return centroids_of_points(points);
}

function colors_from_centroids(centroids, csv)
{
  var avg_counts = {};
  var max_avg_count = 0;
  var min_avg_count = 999999999;
  csv.data.forEach(function(row) {

    var n = 0;
    var this_leaf = "";
    json_each(row, function(col_name, val) {
      var count_this_value = val > 0 || g_val_avg_method === g_ID_AVG_METHOD_ALL_SAMPLES_MEAN;

      if (col_name === "name") {
        this_leaf = val;
        avg_counts[this_leaf] = 0;
      } else if (count_this_value) {
        avg_counts[this_leaf] += val;
        n += 1;
      }
    });

    // TODO this will blow up if an OTU has all 0 sample counts.
    avg_counts[this_leaf] /= n;

    if (max_avg_count < avg_counts[this_leaf]) {
      max_avg_count = avg_counts[this_leaf];
    }
    if (min_avg_count > avg_counts[this_leaf]) {
      min_avg_count = avg_counts[this_leaf];
    }
  });

  var colors = {};
  json_each(centroids, function(leaf, pt) {
    colors[leaf] = g_color_space_fn(leaf, pt, avg_counts, max_avg_count, min_avg_count); });

  return colors;
}

function mag(pt) {
  return Math.sqrt(Math.pow(pt.x, 2) + Math.pow(pt.y, 2));
}

function rad_to_deg(rad) {
  return rad * 180 / Math.PI;
}

function get_hcl_color(leaf, pt, avg_counts, max_avg_count, min_avg_count) {
  // the angle of the vector from origin to centroid.
  var hue = rad_to_deg(Math.atan2(pt.y, pt.x));

  // double it cos the max is half the radius but should be 1.
  // TODO is this still correct for the 1 and 2 sample biom files?
  var chroma_val = mag(pt) * 2 * 100;

  var lightness = scale(avg_counts[leaf] / max_avg_count, min_avg_count / max_avg_count, 1, 20, 85);

  var hex = chroma.hcl(hue, chroma_val, lightness).hex();

  return hex;

}
function get_hsl_color(leaf, pt, avg_counts, max_avg_count, min_avg_count) {
  // the angle of the vector from origin to centroid.
  var hue = rad_to_deg(Math.atan2(pt.y, pt.x));

  // double it cos the max is half the radius but should be 1.
  var saturation = mag(pt) * 2;

  var lightness = scale(avg_counts[leaf] / max_avg_count, min_avg_count / max_avg_count, 1, 0.2, 0.85);

  return chroma.hsl(hue, saturation, lightness).hex();


}


function max(ary) {
  return ary.reduce(function(a, b) {
    return Math.max(a, b);
  });
}
function min(ary) {
  return ary.reduce(function(a, b) {
    return Math.min(a, b);
  });
}
function scale(val, old_min, old_max, new_min, new_max) {

  // This can happen if you use the mean across non-zero samples.
  if (old_max - old_min === 0) {
    // TODO better default value than this?
    return (new_min + new_max) / 2;
  } else {
    return ((((new_max - new_min) * (val - old_min)) / (old_max - old_min)) + new_min);
  }
}

function biom__colors_from_biom_str(biom_str) {
  var centroids = centroids_of_samples(biom_str)
  var biom_csv = parse_biom_file(biom_str);

  return colors_from_centroids(centroids, biom_csv);
}

function json_to_tsv(json) {
  var strings = ["name\tbranch_color\tleaf_label_color\tleaf_dot_color"];
  json_each(json, function(key, val) {
    var str = [key, val, val, val].join("\t");

    strings.push(str);
  });

  return strings.join("\n");
}

function biom__save_abundance_colors(biom_str) {
  var str;
  switch(g_val_reduce_dimension) {
    case g_ID_REDUCE_DIMENSION_NONE:
      str = biom_str;
      break;
    case g_ID_REDUCE_DIMENSION_AUTO_50:
      str = reduce_dimension(biom_str, "auto", 50);
      break;
    case g_ID_REDUCE_DIMENSION_AUTO_75:
      str = reduce_dimension(biom_str, "auto", 75);
      break;
    case g_ID_REDUCE_DIMENSION_AUTO_90:
      str = reduce_dimension(biom_str, "auto", 90);
      break;
    case g_ID_REDUCE_DIMENSION_1_PC:
      str = reduce_dimension(biom_str, "pc", 1);
      break;
    case g_ID_REDUCE_DIMENSION_2_PC:
      str = reduce_dimension(biom_str, "pc", 2);
      break;
    case g_ID_REDUCE_DIMENSION_3_PC:
      str = reduce_dimension(biom_str, "pc", 3);
      break;
    case g_ID_REDUCE_DIMENSION_4_PC:
      str = reduce_dimension(biom_str, "pc", 4);
      break;
    case g_ID_REDUCE_DIMENSION_5_PC:
      str = reduce_dimension(biom_str, "pc", 5);
      break;
    default:
      str = biom_str;
      break;
  }

  var colors = biom__colors_from_biom_str(str);
  var tsv_str = json_to_tsv(colors);

  var blob = new Blob([tsv_str], {type: "text/plain;charset=utf-8"});

  saveAs(blob, "mapping.txt");
}

var g_ID_COLOR_SPACE = "color-space",
  g_ID_COLOR_SPACE_HCL = "color-space-hcl",
  g_ID_COLOR_SPACE_HSL = "color-space-hsl",
  g_val_color_space,
  g_color_space_fn;

var g_ID_AVG_METHOD = "avg-method",
  g_ID_AVG_METHOD_ALL_SAMPLES_MEAN = "avg-method-all-samples-mean",
  g_ID_AVG_METHOD_NONZERO_SAMPLES_MEAN = "avg-method-nonzero-samples-mean",
  g_ID_AVG_METHOD_ALL_SAMPLES_MEDIAN = "avg-method-all-samples-median",
  g_ID_AVG_METHOD_NONZERO_SAMPLES_MEDIAN = "avg-method-nonzero-samples-median",
  g_val_avg_method;

var g_ID_HUE_ANGLE_OFFSET = "hue-angle-offset",
  g_val_hue_angle_offset;

var g_ID_REDUCE_DIMENSION = "reduce-dimension",
  g_ID_REDUCE_DIMENSION_NONE = "reduce-dimension-none",
  g_ID_REDUCE_DIMENSION_AUTO_50 = "reduce-dimension-auto-50",
  g_ID_REDUCE_DIMENSION_AUTO_75 = "reduce-dimension-auto-75",
  g_ID_REDUCE_DIMENSION_AUTO_90 = "reduce-dimension-auto-90",
  g_ID_REDUCE_DIMENSION_1_PC = "reduce-dimension-1-pc",
  g_ID_REDUCE_DIMENSION_2_PC = "reduce-dimension-2-pc",
  g_ID_REDUCE_DIMENSION_3_PC = "reduce-dimension-3-pc",
  g_ID_REDUCE_DIMENSION_4_PC = "reduce-dimension-4-pc",
  g_ID_REDUCE_DIMENSION_5_PC = "reduce-dimension-5-pc",
  g_val_reduce_dimension;

// handle upload button
function biom__upload_button() {
  function set_color_space_fn(g_val_color_space) {
    switch (g_val_color_space) {
      case g_ID_COLOR_SPACE_HCL:
        g_color_space_fn = get_hcl_color;
        break;
      case g_ID_COLOR_SPACE_HSL:
        g_color_space_fn = get_hsl_color;
        break;
      default:
        g_color_space_fn = get_hcl_color;
        break;
    }
  }

  disable("submit-button");
  disable("reset-button");
  g_val_color_space = jq(g_ID_COLOR_SPACE).val();
  set_color_space_fn(g_val_color_space);

  g_val_avg_method = jq(g_ID_AVG_METHOD).val();

  // The input is in degrees.
  g_val_hue_angle_offset = parseFloat(jq(g_ID_HUE_ANGLE_OFFSET).val());

  var display_color = chroma.hcl(g_val_hue_angle_offset, 60, 70).hex();
  jq("hue-angle-offset-label").css("color", display_color);

  g_val_reduce_dimension =  jq(g_ID_REDUCE_DIMENSION).val();


  var submit_id = "submit-button";
  var uploader_id = "uploader";

  var uploader = document.getElementById(uploader_id);
  var submit_button = document.getElementById(submit_id);
  var color_space_dropdown = document.getElementById(g_ID_COLOR_SPACE);
  var avg_method_dropdown = document.getElementById(g_ID_AVG_METHOD);
  var hue_angle_offset_slider = document.getElementById(g_ID_HUE_ANGLE_OFFSET);
  var reduce_dimension_select = document.getElementById(g_ID_REDUCE_DIMENSION);
  
  var biom_reader = new FileReader();

  biom_reader.onload = function(event) {
    var biom_str = event.target.result;
    biom__save_abundance_colors(biom_str);
  };

  uploader.addEventListener("change", function(){
    undisable("submit-button");
    undisable("reset-button");
  });
  color_space_dropdown.addEventListener("change", function() {
    undisable("submit-button");
    undisable("reset-button");

    g_val_color_space = jq(g_ID_COLOR_SPACE).val();
    set_color_space_fn(g_val_color_space);
  });
  avg_method_dropdown.addEventListener("change", function() {
    undisable("submit-button");
    undisable("reset-button");

    g_val_avg_method = jq(g_ID_AVG_METHOD).val();
  });
  hue_angle_offset_slider.addEventListener("change", function() {
    undisable("submit-button");
    undisable("reset-button");

    g_val_hue_angle_offset = parseFloat(jq(g_ID_HUE_ANGLE_OFFSET).val());
    if (isNaN(g_val_hue_angle_offset) || g_val_hue_angle_offset < 0) {
      g_val_hue_angle_offset = 0;
      jq(g_ID_HUE_ANGLE_OFFSET).val(g_val_hue_angle_offset)
    } else if (g_val_hue_angle_offset >= 360) {
      g_val_hue_angle_offset = 359;
      jq(g_ID_HUE_ANGLE_OFFSET).val(g_val_hue_angle_offset)
    }
    display_color = chroma.hcl(g_val_hue_angle_offset, 60, 70).hex();
    jq("hue-angle-offset-label").css("color", display_color);

  });
  reduce_dimension_select.addEventListener("change", function() {
    undisable("submit-button");
    undisable("reset-button");

    g_val_reduce_dimension = jq(g_ID_REDUCE_DIMENSION).val();
  });
  submit_button.addEventListener("click", function() {
    undisable("reset-button");
    handleFiles();
  }, false);
  document.getElementById("reset-button").addEventListener("click", function() {
    disable("reset-button");
    undisable("submit-button");


    document.getElementById("biom-file-upload-form").reset();

    // Reset the color back to normal.
    g_val_hue_angle_offset = parseFloat(jq(g_ID_HUE_ANGLE_OFFSET).val());
    if (isNaN(g_val_hue_angle_offset) || g_val_hue_angle_offset < 0) {
      g_val_hue_angle_offset = 0;
      jq(g_ID_HUE_ANGLE_OFFSET).val(g_val_hue_angle_offset)
    } else if (g_val_hue_angle_offset >= 360) {
      g_val_hue_angle_offset = 359;
      jq(g_ID_HUE_ANGLE_OFFSET).val(g_val_hue_angle_offset)
    }
    console.log(g_val_hue_angle_offset);
    display_color = chroma.hcl(g_val_hue_angle_offset, 60, 70).hex();
    jq("hue-angle-offset-label").css("color", display_color);
  });

  function handleFiles() {
    submit_button.setAttribute("disabled", "");
    var file = uploader.files[0];
    if (file) {
      biom_reader.readAsText(file);
    } else {
      alert("Don't forget to select a biom file!");
    }
  }
}


/*
function mat__elem_at(M, ridx, cidx) {
  // M.n is the number of columns.
  // M.val is the raw data
  return M.val[ridx * M.n + cidx];
}
*/

function project(ary, type, cutoff) {
  var centered_mat = apply_to_cols(array2mat(ary), vec__center);

  var svd_centered_mat = svd(centered_mat, "thinU");

  // Check if any of the singular values are basically 0.
  var i = 0;
  var non_zero_sing_vals = [];
  for (i = 0; i < svd_centered_mat.s.length; ++i) {
    if (svd_centered_mat.s[i] > 1e-5) {
      non_zero_sing_vals.push(svd_centered_mat.s[i]);
    } else {
      break;
    }
  }

  if (type === "auto") {
    // Next we want to take only enough singular values to get the required % of the variance.
    var sum_of_sq = 0;
    non_zero_sing_vals.forEach(function(val) {
      sum_of_sq += Math.pow(val, 2);
    });
    var variance_exlained = non_zero_sing_vals.map(function(sing_val) {
      return Math.pow(sing_val, 2) / sum_of_sq * 100;
    });

    var cum_var_explained = 0;
    for (i = 0; i < non_zero_sing_vals.length; ++i) {
      if (cum_var_explained > cutoff) {
        break;
      } else {
        cum_var_explained += variance_exlained[i];
      }
    }

    var num_sing_vals = i;
  } else if (type === "pc") {
    var num_sing_vals = non_zero_sing_vals.length < cutoff ? non_zero_sing_vals.length : cutoff;
  } else {
    throw Error("Bad type in project function: " + type);
  }

  if (num_sing_vals === 0) {
    throw Error("Got no singular values....");
  }

  var scores, sing_vals, take_these_cols;
  if (num_sing_vals === 1) {
    sing_vals = non_zero_sing_vals[0];
    take_these_cols = [0];
  } else {
    sing_vals = diag(non_zero_sing_vals.slice(0, num_sing_vals));
    take_these_cols = range(num_sing_vals);
  }
  var u_component = getCols(svd_centered_mat.U, take_these_cols);



  scores = mul(u_component, sing_vals);


  if (num_sing_vals === 1) {
    var abs_min_val = Math.abs(min(scores));
    var scaled_scores = scores.map(function(score) { return score + abs_min_val + 1});
    return [num_sing_vals, scaled_scores];
  } else {
    return [num_sing_vals, apply_to_cols(scores, function(col) {
      var abs_min_val = Math.abs(min(col));
      return col.map(function(val) {
        return val + abs_min_val + 1;
      });
    })];
  }


}

// var ary = [
//   [ 25,  40,  50, 34  ],
//   [ 10,  15,  94, 110 ],
//   [ 5,   8,   80, 100 ],
//   [ 100, 140, 11, 20  ],
//   [ 90,  130, 14, 15  ]
// ];
//
// If num_dimensions is more than possible, just take as many as possible.
// Projects an array of arrays into a lower dimension using SVD.  Rows are OTUs, cols are samples.
/*
function project_auto(ary, min_variance) {
  var centered_mat = apply_to_cols(array2mat(ary), vec__center);

  var svd_centered_mat = svd(centered_mat, "thinU");

  // Check if any of the singular values are basically 0.
  var i = 0;
  var non_zero_sing_vals = [];
  for (i = 0; i < svd_centered_mat.s.length; ++i) {
    if (svd_centered_mat.s[i] > 1e-5) {
      non_zero_sing_vals.push(svd_centered_mat.s[i]);
    } else {
      break;
    }
  }

  // Next we want to take only enough singular values to get the required % of the variance.
  var sum_of_sq = 0;
  non_zero_sing_vals.forEach(function(val) {
    sum_of_sq += Math.pow(val, 2);
  });
  var variance_exlained = non_zero_sing_vals.map(function(sing_val) {
    return Math.pow(sing_val, 2) / sum_of_sq * 100;
  });
  console.log("var expl: " + variance_exlained);

  var cum_var_explained = 0;
  for (i = 0; i < non_zero_sing_vals.length; ++i) {
    if (cum_var_explained > min_variance) {
      break;
    } else {
      cum_var_explained += variance_exlained[i];
    }
  }

  var num_sing_vals = i;

  console.log("num_sing_vals: " + num_sing_vals);
  if (num_sing_vals === 0) {
    throw Error("Got no singular values....");
  }

  var scores, sing_vals, take_these_cols;
  if (num_sing_vals === 1) {
    sing_vals = non_zero_sing_vals[0];
    take_these_cols = [0];
  } else {
    sing_vals = diag(non_zero_sing_vals.slice(0, num_sing_vals));
    take_these_cols = range(num_sing_vals);
  }
  var u_component = getCols(svd_centered_mat.U, take_these_cols);



  scores = mul(u_component, sing_vals);


  if (num_sing_vals === 1) {
    var abs_min_val = Math.abs(min(scores));
    var scaled_scores = scores.map(function(score) { return score + abs_min_val + 1});
    return [num_sing_vals, scaled_scores];
  } else {
    return [num_sing_vals, apply_to_cols(scores, function(col) {
      var abs_min_val = Math.abs(min(col));
      return col.map(function(val) {
        return val + abs_min_val + 1;
      });
    })];
  }
}
*/

/*
function project_pc(ary, num_dimensions) {
  if (num_dimensions === undefined || num_dimensions < 1) {
    num_dimensions = 1;
  }

  var centered_mat = apply_to_cols(array2mat(ary), vec__center);

  var svd_centered_mat = svd(centered_mat, "thinU");

  // Check if any of the singular values are basically 0.
  var i = 0;
  var non_zero_sing_vals = [];
  for (i = 0; i < svd_centered_mat.s.length; ++i) {
    if (svd_centered_mat.s[i] > 1e-5) {
      non_zero_sing_vals.push(svd_centered_mat.s[i]);
    } else {
      break;
    }
  }

  var num_sing_vals = non_zero_sing_vals.length < num_dimensions ? non_zero_sing_vals.length : num_dimensions;

  console.log("num_sing_vals: " + num_sing_vals);
  if (num_sing_vals === 0) {
    throw Error("There were non-zero singular values.");
  }

  var scores, sing_vals, take_these_cols;
  if (num_sing_vals === 1) {
    sing_vals = non_zero_sing_vals[0];
    take_these_cols = [0];
  } else {
    sing_vals = diag(non_zero_sing_vals.slice(0, num_sing_vals));
    take_these_cols = range(num_sing_vals);
  }
  var u_component = getCols(svd_centered_mat.U, take_these_cols);



  scores = mul(u_component, sing_vals);


  if (num_sing_vals === 1) {
    var abs_min_val = Math.abs(min(scores));
    var scaled_scores = scores.map(function(score) { return score + abs_min_val + 1});
    return [num_sing_vals, scaled_scores];
  } else {
    return [num_sing_vals, apply_to_cols(scores, function(col) {
      var abs_min_val = Math.abs(min(col));
      return col.map(function(val) {
        return val + abs_min_val + 1;
      });
    })];
  }
}
*/

function apply_to_cols(M, fn)
{
  var cidx, ncols = M.n;

  var new_ary = [];

  for (cidx = 0; cidx < ncols; ++cidx) {
    var col = getCols(M, [cidx]);

    new_ary.push(fn(col));
  }

  return transposeMatrix(array2mat(new_ary));
}

/*
// Input is a LALOLib vector.
function vec__scale_0_to_1(vec) {
  var abs_col_min = Math.abs(min(vec));

  // TODO take abs value of max as well in case it is a negative number?
  var col_max = max(vec);
  var col_min = min(vec);

  if (col_min === col_max) {
    // All the numbers in the original are the same, so just set it to 0.5
    return vec.map(function(val) { return 0.5 });
  } else {
    return vec.map(function(val) {
      return (val + abs_col_min) / (col_max + abs_col_min);
    });
  }
}
*/

function vec__center(vec) {
  var total = sum(vec);
  var mean = total / vec.length;

  return vec.map(function(val) {
    return val - mean;
  });
}

function biom_to_ary(biom_str) {
  var biom = parse_biom_file(biom_str);
  var leaf_names = biom.data.map(function(obj) { return obj[biom.meta.fields[0]] });
  var sample_names = biom.meta.fields;
  sample_names.shift(); // remove the first field, it is 'name'

  var counts =  biom.data.map(function(obj) {
    return sample_names.map(function(name) {
      return obj[name];
    });
  });

  return [leaf_names, counts];
}

function reduce_dimension(biom_str, type, cutoff) {
  var biom_ary = biom_to_ary(biom_str);
  var leaves = biom_ary[0];
  var counts = biom_ary[1];
  var tmp = project(counts, type, cutoff);
  var num_sing_vals = tmp[0];
  var proj = tmp[1];

  if (leaves.length !== proj.length) {
    throw Error("Length mismatch in leaves and projection");
  }

  // This is for making an fake csv biom obj.
  // var all_objs = [];
  // if (num_sing_vals === 1) {
  //   leaves.forEach(function(leaf, leaf_idx) {
  //     var obj = {};
  //
  //     obj.name = leaf;
  //     obj.pc_1 = proj[leaf_idx];
  //     all_objs.push(obj);
  //   });
  // } else {
  //   leaves.forEach(function(leaf, leaf_idx) {
  //     var obj = {};
  //     obj.name = leaf;
  //
  //     var row = getRows(proj, [leaf_idx]);
  //     row.forEach(function(count, pc_idx) {
  //       obj["pc_" + pc_idx] = count;
  //     });
  //
  //     all_objs.push(obj);
  //   });
  // }

  // Make a fake biom str.
  var new_biom = [["name"]];
  var i = 0;
  for (i = 0; i < num_sing_vals; ++i) {
    new_biom[0].push("pc_" + i);
  }

  if (num_sing_vals === 1) {
    leaves.forEach(function(leaf, leaf_idx) {
      var row = [leaf, proj[leaf_idx]];

      new_biom.push(row);
    });
  } else {
    leaves.forEach(function(leaf, leaf_idx) {
      var row = [leaf];

      getRows(proj, [leaf_idx]).forEach(function(row_count) {
        row.push(row_count);
      });

      new_biom.push(row);
    });
  }


  return new_biom.map(function(row) { return row.join("\t"); }).join("\n");
}
