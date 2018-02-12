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
  var angle = sample_to_angle(sample_idx, num_samples);

  var pt = {
    x: count * Math.cos(angle),
    y: count * Math.sin(angle)
  };

  return pt;
}

// Sample idx starts at zero
function sample_to_angle(sample_idx, num_samples)
{
  return (2 * Math.PI / num_samples) * sample_idx;
}

// Count data is from the csv.data from Papa.
// samples is from csv.meta.fields
function sample_counts_to_points(csv)
{
  var count_data = csv.data;
  var samples = csv.meta.fields;

  console.log(count_data);
  console.log(samples);

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

  console.log(count_data);
  console.log(samples);




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
        console.log([leaf_name, sample, min_count, max_count, row[sample], count].join(" " ));

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
      if (col_name === "name") {
        this_leaf = val;
        avg_counts[this_leaf] = 0;
      } else {
        avg_counts[this_leaf] += val;
        n += 1;
      }
    });


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

  console.log([leaf, JSON.stringify(pt), hue, chroma_val, lightness].join(" "));

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
  return ((((new_max - new_min) * (val - old_min)) / (old_max - old_min)) + new_min);
}

function biom__colors_from_biom_str(biom_str) {
  var centroids = centroids_of_samples(biom_str)
  var biom_csv = parse_biom_file(biom_str);

  return colors_from_centroids(centroids, biom_csv);
}

function json_to_tsv(json) {
  var strings = ["name\tbranch_color\tleaf_label_color\tleaf_dot_color\tbranch_width\tleaf_dot_size"];
  json_each(json, function(key, val) {
    var str = [key, val, val, val, 10, 20].join("\t");

    strings.push(str);
  });

  return strings.join("\n");
}

function biom__save_abundance_colors(biom_str) {
  var colors = biom__colors_from_biom_str(biom_str);
  var tsv_str = json_to_tsv(colors);

  var blob = new Blob([tsv_str], {type: "text/plain;charset=utf-8"});

  saveAs(blob, "mapping.txt");
}

var g_ID_COLOR_SPACE = "color-space",
  g_ID_COLOR_SPACE_HCL = "color-space-hcl",
  g_ID_COLOR_SPACE_HSL = "color-space-hsl",
  g_val_color_space,
  g_color_space_fn;

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

  var submit_id = "submit-button";
  var uploader_id = "uploader";

  var uploader = document.getElementById(uploader_id);
  var submit_button = document.getElementById(submit_id);
  var color_space_dropdown = document.getElementById(g_ID_COLOR_SPACE);
  
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
  submit_button.addEventListener("click", function() {
    undisable("reset-button")
    handleFiles();
  }, false);
  document.getElementById("reset-button").addEventListener("click", function() {
    disable("reset-button");
    undisable("submit-button");
    document.getElementById("biom-file-upload-form").reset();
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
