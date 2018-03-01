function signed_area_of_triangle(p1, p2, p3) {
  return ((p1.x * (p2.y - p3.y)) + (p2.x * (p3.y - p1.y)) + (p3.x * (p1.y - p2.y))) / 2;
}

function centroid_of_triangle(p1, p2, p3) {
  return { x: (p1.x + p2.x + p3.x) / 3, y: (p1.y + p2.y + p3.y) / 3 };
}

// TODO instead of calculating all triangles, could save some steps by removing p2 from the points obj and rerunning.  (this would also required using signed area)
biom.centroids_from_points = function (all_points, non_zero_count_samples) {
  var centroids = {};


  fn.obj.each(all_points, function (leaf, points) {
    var samples     = json_keys(points);
    var sum_x_numer = 0;
    var sum_y_numer = 0;
    var sum_denom   = 0;

    if (non_zero_count_samples[leaf] === "none") {

    }

    switch (non_zero_count_samples[leaf]) {
      case "none":
        // It has a zero count in every sample
        centroids[leaf] = fn.pt.new(0, 0);
        break;
      case "many":
        if (samples.length === 2) {
          // Just set it to the midpoint of the line segment.
          var p1 = points[samples[0]];
          var p2 = points[samples[1]];

          var new_x = (p1.x + p2.x) / 2;
          var new_y = (p1.y + p2.y) / 2;

          centroids[leaf] = fn.pt.new(new_x, new_y);
          break;
        }
        else if (samples.length === 3) {
          // There is only one triangle to do
          var p1 = points[samples[0]];
          var p2 = points[samples[1]];
          var p3 = points[samples[2]];


          var signed_area = signed_area_of_triangle(p1, p2, p3);
          var area        = Math.abs(signed_area);
          var centroid    = centroid_of_triangle(p1, p2, p3);

          sum_x_numer += area * centroid.x;
          sum_y_numer += area * centroid.y;
          sum_denom += area;
        }
        else {
          // There are at least 4 triangles.
          // For each triangle...
          for (var i = 0; i < samples.length; ++i) {
            if (i < samples.length - 2) {
              var p1 = points[samples[i]];
              var p2 = points[samples[i + 1]];
              var p3 = points[samples[i + 2]];
            }
            else if (i < samples.length - 1) {
              var p1 = points[samples[i]];
              var p2 = points[samples[i + 1]];
              var p3 = points[samples[0]];
            }
            else {
              var p1 = points[samples[i]];
              var p2 = points[samples[0]];
              var p3 = points[samples[1]];
            }

            var signed_area = signed_area_of_triangle(p1, p2, p3);
            var area        = Math.abs(signed_area);
            var centroid    = centroid_of_triangle(p1, p2, p3);

            sum_x_numer += area * centroid.x;
            sum_y_numer += area * centroid.y;
            sum_denom += area;
          }
        }

        centroids[leaf] = fn.pt.new(sum_x_numer / sum_denom, sum_y_numer / sum_denom);
        break;
      default:
        // It has a single sample with a non zero count.
        var non_zero_sample = non_zero_count_samples[leaf];
        var non_zero_point  = points[non_zero_sample];

        // Just take the point because we want it all the way out to the radius of the circle for that sample.
        centroids[leaf] = fn.pt.new(non_zero_point.x, non_zero_point.y);
        break;
    }
  });

  return centroids;
};


function colors_from_centroids(centroids, parsed_biom) {
  var num_samples  = fn.parsed_biom.num_real_samples(parsed_biom);
  var evenness     = {};
  var min_evenness = null;
  var max_evenness = null;
  if (g_val_chroma_method === g_ID_CHROMA_METHOD_EVENNESS_ABSOLUTE || g_val_chroma_method === g_ID_CHROMA_METHOD_EVENNESS_RELATIVE) {
    // Need to calculate the evenness and pass it to the color space function.
    evenness = biom.inverse_evenness(parsed_biom);

    // Set min and max evenness.
    json_each(evenness, function (leaf, val) {
      if (min_evenness === null || val < min_evenness) {
        min_evenness = val;
      }

      if (max_evenness === null || val > max_evenness) {
        max_evenness = val;
      }
    });
  }

  // Read: return value
  var ret_val       = fn.parsed_biom.abundance_across(parsed_biom, g_val_avg_method);
  var avg_counts    = ret_val.abundance;
  var min_avg_count = ret_val.min_val;
  var max_avg_count = ret_val.max_val;

  var colors         = {};
  var color_details  = {};
  var luminance_vals = [];
  json_each(centroids, function (leaf, pt) {
    var params     = {
      leaf: leaf,
      pt: pt,
      avg_counts: avg_counts,
      max_avg_count: max_avg_count,
      min_avg_count: min_avg_count,
      // It's inverse evenness (1 means completely uneven and maximum saturation).
      evenness: num_samples === 1 ? 1 : evenness[leaf],
      max_evenness: max_evenness,
      min_evenness: min_evenness
    };
    var return_val = get_color(params);

    colors[leaf] = return_val[0];
    luminance_vals.push(chroma.hex(return_val[0]).luminance());

    color_details[leaf]              = {};
    color_details[leaf]["hue"]       = return_val[1];
    color_details[leaf]["chroma"]    = return_val[2];
    color_details[leaf]["lightness"] = return_val[3];

  });

  // Now we need to check if we should correct the luminance.  We have to do it after all the colors have been calculating because we want the output scaling to run from the actual min luminance to the actual max luminance.  However, we want to use lightness values directly rather than the original luminance vals.
  if (g_val_correct_luminance) {
    var corrected_colors = {};
    var min_luminance    = fn.ary.min(luminance_vals);
    var max_luminance    = fn.ary.max(luminance_vals);

    if (g_val_color_space === g_ID_COLOR_SPACE_HSL) {
      // HSL lightness runs from 0 to 1
      var lightness_min_for_correction = g_val_lightness_min / 100;
      var lightness_max_for_correction = g_val_lightness_max / 100;
    }
    else {
      var lightness_min_for_correction = g_val_lightness_min;
      var lightness_max_for_correction = g_val_lightness_max;
    }

    json_each(colors, function (leaf, hex) {
      corrected_colors[leaf] = fn.color.correct_luminance(hex, color_details[leaf]["lightness"], lightness_min_for_correction, lightness_max_for_correction, min_luminance, max_luminance);
    });

    return [corrected_colors, color_details];
  }
  else {
    return [colors, color_details];
  }
}

function get_color(params) {
  var leaf          = params.leaf;
  var pt            = params.pt;
  var avg_counts    = params.avg_counts;
  var max_avg_count = params.max_avg_count;
  var min_avg_count = params.min_avg_count;
  var evenness      = params.evenness;
  var max_evenness  = params.max_evenness;
  var min_evenness  = params.min_evenness;

  var color_fn = chroma.hcl;


  // If it is absolute evenness, then don't "scale" the values, but run it from 0 to 1 naturally.
  if (g_val_chroma_method === g_ID_CHROMA_METHOD_EVENNESS_ABSOLUTE) {
    min_evenness = 0;
    max_evenness = 1;
  }

  if (g_val_abundant_samples_are === g_ID_ABUNDANT_SAMPLES_ARE_DARK) {
    // Flip min and max
    var new_lightness_min = g_val_lightness_max;
    var new_lightness_max = g_val_lightness_min;
  }
  else { // abundant samples are light
    var new_lightness_min = g_val_lightness_min;
    var new_lightness_max = g_val_lightness_max;
  }

  if (g_val_even_leaves_are === g_ID_EVEN_LEAVES_ARE_MORE_SATURATED) {
    // Flip the min and max
    var new_chroma_min = g_val_chroma_max;
    var new_chroma_max = g_val_chroma_min;
  }
  else {
    var new_chroma_min = g_val_chroma_min;
    var new_chroma_max = g_val_chroma_max;
  }

  if (g_val_color_space === g_ID_COLOR_SPACE_HSL) {
    // HSL saturation and lightness run from 0 to 1 rather than 0 to 100ish
    new_lightness_min /= 100;
    new_lightness_max /= 100;

    new_chroma_min /= 100;
    new_chroma_max /= 100;

    color_fn = chroma.hsl;
  }

  // the angle of the vector from origin to centroid.
  var hue = fn.math.radians_to_degrees(Math.atan2(pt.y, pt.x));

  // Use evenness of samples for chroma_val.  Eveness is oposite of chroma running 0 to 1, so subtract from 1.
  // Evenness naturally runs from 0 to 1 so just use the actual values rather than scaling the min to zero and max to 100.
  var chroma_val = fn.math.scale(evenness, min_evenness, max_evenness, new_chroma_min, new_chroma_max);


  var lightness = fn.math.scale(avg_counts[leaf] / max_avg_count, min_avg_count / max_avg_count, 1, new_lightness_min, new_lightness_max);

  var hex = color_fn(hue, chroma_val, lightness).hex();

  return [hex, hue, chroma_val, lightness];
}


function th_tag(str) {
  return "<th>" + str + "</th>";
}

function td_tag(str) {
  return "<td>" + str + "</td>";
}

function td_tag_with_background(str, color) {
  if (chroma.hex(color.hex()).luminance() < g_COLOR_IS_DARK) {
    var text_style = "color: white;";
  }
  else {
    var text_style = "color: black;";
  }

  return "<td class='thick-right-border' style='background-color:" + color + "; " + text_style + "'>" + str + "</td>";
}


var debug_biom_csv, debug_colors_json, debug_color_details;

// The "main" function
function biom__save_abundance_colors(biom_str) {
  var str;
  switch (g_val_reduce_dimension) {
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
    default:
      str = biom_str;
      break;
  }

  var parsed_biom = biom.parse_biom_file_str(str);
  console.log("right after parsing");
  console.log(JSON.stringify(parsed_biom));

  var points                 = fn.parsed_biom.leaf_sample_points(parsed_biom);
  var non_zero_count_samples = fn.parsed_biom.non_zero_count_samples(parsed_biom);
  var centroids              = biom.centroids_from_points(points, non_zero_count_samples);

  var ret_val = colors_from_centroids(centroids, parsed_biom);

  var colors          = ret_val[0];
  var color_details   = ret_val[1];
  debug_colors_json   = colors;
  debug_color_details = color_details;
  var tsv_str         = biom.make_tsv_string(colors);

  if (g_val_download_legend) {
    // TODO don't call parse_biom_file again, have a single function do it and pass that around.

    if (g_val_reduce_dimension === "reduce-dimension-none") {
      var html_str = biom.make_counts_with_colors_html(parsed_biom, false, colors, color_details);
    }
    else {
      var html_str = biom.make_counts_with_colors_html(parsed_biom, biom_str, colors, color_details);

    }

    // Make the tsv for sample legend.
    var sample_color_legend_tsv_str  = fn.parsed_biom.sample_color_legend(parsed_biom, g_val_hue_angle_offset);
    var sample_color_legend_html_str = fn.parsed_biom.sample_color_legend_html(parsed_biom, g_val_hue_angle_offset);

    var zip = new JSZip();

    zip.folder("iroki_mapping")
       .file("mapping.txt", tsv_str)
       .file("counts_with_colors.html", html_str)
       .file("sample_approximate_starting_colors.txt", sample_color_legend_tsv_str)
       .file("sample_approximate_starting_colors.html", sample_color_legend_html_str);

    zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: {
        level: 1
      }
    })
       .then(function (blob) {
         saveAs(blob, "iroki_mapping.zip");
       });
  }
  else {
    var blob = new Blob([tsv_str], { type: "text/plain;charset=utf-8" });

    // Unicode standard does not recommend using the BOM for UTF-8, so pass in true to NOT put it in.
    saveAs(blob, "mapping.txt", true);
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
  var centered_mat = apply_to_cols(array2mat(ary), utils__vec_center);

  var svd_centered_mat = svd(centered_mat, "thinU");

  // Check if any of the singular values are basically 0.
  var i                  = 0;
  var non_zero_sing_vals = [];
  for (i = 0; i < svd_centered_mat.s.length; ++i) {
    if (svd_centered_mat.s[i] > 1e-5) {
      non_zero_sing_vals.push(svd_centered_mat.s[i]);
    }
    else {
      break;
    }
  }

  if (type === "auto") {
    // Next we want to take only enough singular values to get the required % of the variance.
    var sum_of_sq = 0;
    non_zero_sing_vals.forEach(function (val) {
      sum_of_sq += Math.pow(val, 2);
    });
    var variance_exlained = non_zero_sing_vals.map(function (sing_val) {
      return Math.pow(sing_val, 2) / sum_of_sq * 100;
    });

    var cum_var_explained = 0;
    for (i = 0; i < non_zero_sing_vals.length; ++i) {
      if (cum_var_explained > cutoff) {
        break;
      }
      else {
        cum_var_explained += variance_exlained[i];
      }
    }

    var num_sing_vals = i;
  }
  else if (type === "pc") {
    var num_sing_vals = non_zero_sing_vals.length < cutoff ? non_zero_sing_vals.length : cutoff;
  }
  else {
    throw Error("Bad type in project function: " + type);
  }

  if (num_sing_vals === 0) {
    throw Error("Got no singular values....");
  }

  var scores, sing_vals, take_these_cols;
  if (num_sing_vals === 1) {
    sing_vals       = non_zero_sing_vals[0];
    take_these_cols = [0];
  }
  else {
    sing_vals       = diag(non_zero_sing_vals.slice(0, num_sing_vals));
    take_these_cols = range(num_sing_vals);
  }
  var u_component = getCols(svd_centered_mat.U, take_these_cols);


  scores = mul(u_component, sing_vals);


  if (num_sing_vals === 1) {
    var abs_min_val   = Math.abs(min(scores));
    var scaled_scores = scores.map(function (score) {
      return score + abs_min_val + 1;
    });
    return [num_sing_vals, scaled_scores];
  }
  else {
    return [num_sing_vals, apply_to_cols(scores, function (col) {
      var abs_min_val = Math.abs(min(col));
      return col.map(function (val) {
        return val + abs_min_val + 1;
      });
    })];
  }


}

function apply_to_cols(M, fn) {
  var cidx, ncols = M.n;

  var new_ary = [];

  for (cidx = 0; cidx < ncols; ++cidx) {
    var col = getCols(M, [cidx]);

    new_ary.push(fn(col));
  }

  return transposeMatrix(array2mat(new_ary));
}

function biom_to_ary(parsed_biom) {
  var biom         = parsed_biom;
  var leaf_names   = biom.data.map(function (obj) {
    return obj[biom.meta.fields[0]];
  });
  var sample_names = biom.meta.fields;
  sample_names.shift(); // remove the first field, it is 'name'

  var counts = biom.data.map(function (obj) {
    return sample_names.map(function (name) {
      return obj[name];
    });
  });

  return [leaf_names, counts];
}

// This function takes biom_str rather than parsed biom string since it returns a new adjusted biom string.  TODO: We could take the parsed biom string and return an adjusted parsed biom string if the parsing is a bottleneck.
function reduce_dimension(biom_str, type, cutoff) {
  var biom_ary      = biom_to_ary(biom.parse_biom_file_str(biom_str));
  var leaves        = biom_ary[0];
  var counts        = biom_ary[1];
  var tmp           = project(counts, type, cutoff);
  var num_sing_vals = tmp[0];
  var proj          = tmp[1];

  if (leaves.length !== proj.length) {
    throw Error("Length mismatch in leaves and projection");
  }

  // Make a fake biom str.
  var new_biom = [["name"]];
  var i        = 0;
  for (i = 0; i < num_sing_vals; ++i) {
    new_biom[0].push("pc_" + (i + 1));
  }

  if (num_sing_vals === 1) {
    leaves.forEach(function (leaf, leaf_idx) {
      var row = [leaf, proj[leaf_idx]];

      new_biom.push(row);
    });
  }
  else {
    leaves.forEach(function (leaf, leaf_idx) {
      var row = [leaf];

      getRows(proj, [leaf_idx]).forEach(function (row_count) {
        row.push(row_count);
      });

      new_biom.push(row);
    });
  }


  return new_biom.map(function (row) {
    return row.join("\t");
  }).join("\n");
}

// TODO need to make sure the defaults match up with the actual forms.
var g_COLOR_IS_DARK = 0.25;

var g_ID_COLOR_SPACE     = "color-space",
    g_ID_COLOR_SPACE_HCL = "color-space-hcl",
    g_ID_COLOR_SPACE_HSL = "color-space-hsl",
    g_val_color_space    = g_ID_COLOR_SPACE_HCL;

var g_ID_AVG_METHOD                        = "avg-method",
    g_ID_AVG_METHOD_ALL_SAMPLES_MEAN       = "avg-method-all-samples-mean",
    g_ID_AVG_METHOD_NONZERO_SAMPLES_MEAN   = "avg-method-nonzero-samples-mean",
    g_ID_AVG_METHOD_ALL_SAMPLES_MEDIAN     = "avg-method-all-samples-median",
    g_ID_AVG_METHOD_NONZERO_SAMPLES_MEDIAN = "avg-method-nonzero-samples-median",
    g_val_avg_method                       = g_ID_AVG_METHOD_NONZERO_SAMPLES_MEAN;

var g_ID_HUE_ANGLE_OFFSET  = "hue-angle-offset",
    g_val_hue_angle_offset = 0;

var g_ID_REDUCE_DIMENSION         = "reduce-dimension",
    g_ID_REDUCE_DIMENSION_NONE    = "reduce-dimension-none",
    g_ID_REDUCE_DIMENSION_AUTO_50 = "reduce-dimension-auto-50",
    g_ID_REDUCE_DIMENSION_AUTO_75 = "reduce-dimension-auto-75",
    g_ID_REDUCE_DIMENSION_AUTO_90 = "reduce-dimension-auto-90",
    g_ID_REDUCE_DIMENSION_1_PC    = "reduce-dimension-1-pc",
    g_ID_REDUCE_DIMENSION_2_PC    = "reduce-dimension-2-pc",
    g_ID_REDUCE_DIMENSION_3_PC    = "reduce-dimension-3-pc",
    g_val_reduce_dimension        = g_ID_REDUCE_DIMENSION_NONE;

var g_ID_ABUNDANT_SAMPLES_ARE       = "abundant-samples-are",
    g_ID_ABUNDANT_SAMPLES_ARE_LIGHT = "abundant-samples-are-light",
    g_ID_ABUNDANT_SAMPLES_ARE_DARK  = "abundant-samples-are-dark",
    g_val_abundant_samples_are      = g_ID_ABUNDANT_SAMPLES_ARE_LIGHT;

var g_ID_DOWNLOAD_LEGEND  = "download-legend",
    g_val_download_legend = true;

var g_ID_LIGHTNESS_MIN      = "lightness-min",
    g_ID_LIGHTNESS_MAX      = "lightness-max",
    g_DEFAULT_LIGHTNESS_MIN = 30,
    g_DEFAULT_LIGHTNESS_MAX = 90,
    g_val_lightness_min     = g_DEFAULT_LIGHTNESS_MIN,
    g_val_lightness_max     = g_DEFAULT_LIGHTNESS_MAX;

var g_ID_CHROMA_MIN      = "chroma-min",
    g_ID_CHROMA_MAX      = "chroma-max",
    g_DEFAULT_CHROMA_MIN = 0,
    g_DEFAULT_CHROMA_MAX = 100,
    g_val_chroma_min     = g_DEFAULT_CHROMA_MIN,
    g_val_chroma_max     = g_DEFAULT_CHROMA_MAX;


var g_ID_CHROMA_METHOD                   = "chroma-method",
    g_ID_CHROMA_METHOD_EVENNESS_ABSOLUTE = "chroma-method-evenness-absolute",
    g_ID_CHROMA_METHOD_EVENNESS_RELATIVE = "chroma-method-evenness-relative",
    g_val_chroma_method                  = g_ID_CHROMA_METHOD_EVENNESS_ABSOLUTE;

var g_ID_EVEN_LEAVES_ARE                = "even-leaves-are",
    g_ID_EVEN_LEAVES_ARE_LESS_SATURATED = "even-leaves-are-less-saturated",
    g_ID_EVEN_LEAVES_ARE_MORE_SATURATED = "even-leaves-are-more-saturated",
    g_val_even_leaves_are               = g_ID_EVEN_LEAVES_ARE_LESS_SATURATED;


var g_ID_CORRECT_LUMINANCE  = "correct-luminance",
    g_val_correct_luminance = true;

function update_form_vals() {

  // Color options
  g_val_color_space = jq(g_ID_COLOR_SPACE).val();

  g_val_hue_angle_offset = parseFloat(jq(g_ID_HUE_ANGLE_OFFSET).val());
  if (isNaN(g_val_hue_angle_offset) || g_val_hue_angle_offset < 0) {
    g_val_hue_angle_offset = 0;
    jq(g_ID_HUE_ANGLE_OFFSET).val(g_val_hue_angle_offset);
  }
  else if (g_val_hue_angle_offset >= 360) {
    g_val_hue_angle_offset = 359;
    jq(g_ID_HUE_ANGLE_OFFSET).val(g_val_hue_angle_offset);
  }
  var display_color = fn.color.approx_starting_color(g_val_hue_angle_offset);
  jq("hue-angle-offset-label").css("color", display_color);


  g_val_abundant_samples_are = jq(g_ID_ABUNDANT_SAMPLES_ARE).val();

  // Other options
  g_val_avg_method       = jq(g_ID_AVG_METHOD).val();
  g_val_reduce_dimension = jq(g_ID_REDUCE_DIMENSION).val();

  // Legend options
  g_val_download_legend = is_checked(g_ID_DOWNLOAD_LEGEND);

  // Lightness options
  g_val_lightness_min     = parseFloat(jq(g_ID_LIGHTNESS_MIN).val());
  g_val_lightness_max     = parseFloat(jq(g_ID_LIGHTNESS_MAX).val());
  g_val_correct_luminance = is_checked(g_ID_CORRECT_LUMINANCE);

  // Chroma opts
  g_val_chroma_method   = jq(g_ID_CHROMA_METHOD).val();
  g_val_chroma_min      = parseFloat(jq(g_ID_CHROMA_MIN).val());
  g_val_chroma_max      = parseFloat(jq(g_ID_CHROMA_MAX).val());
  g_val_even_leaves_are = jq(g_ID_EVEN_LEAVES_ARE).val();
}


// handle upload button


// Handle the biom upload form
function biom__upload_button() {
  function handleFiles() {
    submit_button.setAttribute("disabled", "");
    var file = uploader.files[0];
    if (file) {
      biom_reader.readAsText(file);
    }
    else {
      alert("Don't forget to select a biom file!");
    }
  }

  function undisable_and_update() {
    undisable("submit-button");
    undisable("reset-button");

    update_form_vals();
  }

  function listener(elem, action, fn) {
    elem.addEventListener(action, fn);
  }

  disable("submit-button");
  disable("reset-button");
  update_form_vals();


  var submit_id   = "submit-button";
  var uploader_id = "uploader";

  // Upload elements
  var uploader        = document.getElementById(uploader_id);
  var submit_button   = document.getElementById(submit_id);
  var download_legend = document.getElementById(g_ID_DOWNLOAD_LEGEND);

  var color_space_dropdown    = document.getElementById(g_ID_COLOR_SPACE);
  var hue_angle_offset_slider = document.getElementById(g_ID_HUE_ANGLE_OFFSET);
  var reduce_dimension_select = document.getElementById(g_ID_REDUCE_DIMENSION);

  // Lightness elements
  var abundant_samples_are_select = document.getElementById(g_ID_ABUNDANT_SAMPLES_ARE);
  var avg_method_dropdown         = document.getElementById(g_ID_AVG_METHOD);
  var lightness_min_input         = document.getElementById(g_ID_LIGHTNESS_MIN);
  var lightness_max_input         = document.getElementById(g_ID_LIGHTNESS_MAX);
  var correct_luminance           = document.getElementById(g_ID_CORRECT_LUMINANCE);

  // Chroma elements
  var chroma_method_input   = document.getElementById(g_ID_CHROMA_METHOD);
  var chroma_min_input      = document.getElementById(g_ID_CHROMA_MIN);
  var chroma_max_input      = document.getElementById(g_ID_CHROMA_MAX);
  var even_leaves_are_input = document.getElementById(g_ID_EVEN_LEAVES_ARE);

  var biom_reader = new FileReader();

  biom_reader.onload = function (event) {
    var biom_str = event.target.result;
    biom__save_abundance_colors(biom_str);
  };

  uploader.addEventListener("change", undisable_and_update);
  color_space_dropdown.addEventListener("change", undisable_and_update);
  avg_method_dropdown.addEventListener("change", undisable_and_update);
  hue_angle_offset_slider.addEventListener("change", undisable_and_update);
  reduce_dimension_select.addEventListener("change", undisable_and_update);
  abundant_samples_are_select.addEventListener("change", undisable_and_update);
  download_legend.addEventListener("change", undisable_and_update);
  chroma_method_input.addEventListener("change", undisable_and_update);
  even_leaves_are_input.addEventListener("change", undisable_and_update);
  correct_luminance.addEventListener("change", undisable_and_update);

  lightness_min_input.addEventListener("change", function () {
    undisable_and_update();

    // Make sure the vals are still good.
    if (isNaN(g_val_lightness_min)) {
      jq(g_ID_LIGHTNESS_MIN).val(g_DEFAULT_LIGHTNESS_MIN);
    }
    else if (g_val_lightness_min < 0) {
      jq(g_ID_LIGHTNESS_MIN).val(0);
    }
    else if (g_val_lightness_min > g_val_lightness_max) {
      jq(g_ID_LIGHTNESS_MIN).val(g_val_lightness_max);
    }
  });
  lightness_max_input.addEventListener("change", function () {
    undisable_and_update();

    // Make sure the vals are still good.
    if (isNaN(g_val_lightness_max)) {
      jq(g_ID_LIGHTNESS_MAX).val(g_DEFAULT_LIGHTNESS_MAX);
    }
    else if (g_val_lightness_max > 100) {
      jq(g_ID_LIGHTNESS_MAX).val(100);
    }
    else if (g_val_lightness_min > g_val_lightness_max) {
      jq(g_ID_LIGHTNESS_MAX).val(g_val_lightness_min);
    }
  });
  chroma_min_input.addEventListener("change", function () {
    undisable_and_update();

    // Make sure the vals are still good.
    if (isNaN(g_val_chroma_min)) {
      jq(g_ID_CHROMA_MIN).val(g_DEFAULT_CHROMA_MIN);
    }
    else if (g_val_chroma_min < 0) {
      jq(g_ID_CHROMA_MIN).val(0);
    }
    else if (g_val_chroma_min > g_val_chroma_max) {
      jq(g_ID_CHROMA_MIN).val(g_val_chroma_max);
    }
  });
  chroma_max_input.addEventListener("change", function () {
    undisable_and_update();

    // Make sure the vals are still good.
    if (isNaN(g_val_chroma_max)) {
      jq(g_ID_CHROMA_MAX).val(g_DEFAULT_CHROMA_MAX);
    }
    else if (g_val_chroma_max > 100) {
      jq(g_ID_CHROMA_MAX).val(100);
    }
    else if (g_val_chroma_min > g_val_chroma_max) {
      jq(g_ID_CHROMA_MAX).val(g_val_chroma_min);
    }
  });
  submit_button.addEventListener("click", function () {
    undisable("reset-button");

    update_form_vals();

    handleFiles();
  }, false);
  document.getElementById("reset-button").addEventListener("click", function () {
    disable("reset-button");

    // Turn the submit off because it will turn back on once a mapping file is uploaded.
    disable("submit-button");

    document.getElementById("biom-file-upload-form").reset();

    update_form_vals();
  });
}
