function parse_biom_file_str(str) {
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


  csv.meta.fields.forEach(function (field) {
    column_info[field] = [];
  });

  csv.data.map(function (line) {
    json_each(line, function (col_header, col_data) {
      column_info[col_header].push(col_data);
    })
  });

  var scaled_counts = {};

  json_each(column_info, function (sample_name, ary) {
    if (sample_name !== "name") {
      // Key is one of the samples with the counts.
      var min_max       = utils__ary_min_max(ary);
      var min           = min_max.min;
      var max_minus_min = min_max.max - min;

      scaled_counts[sample_name] = ary.map(function (count) {
        return (count - min) / max_minus_min;
      });
    }
  });

  return csv;
}

function round_to(x, place) {
  return Math.round(place * x) / place;
}

// TODO should this be multiplyed by two?
function get_point(count, sample_idx, num_samples) {
  var angle = sample_to_angle(sample_idx, num_samples, utils__deg_to_rad(g_val_hue_angle_offset));

  var pt = {
    x : count * Math.cos(angle),
    y : count * Math.sin(angle)
  };

  return pt;
}

// Sample idx starts at zero
function sample_to_angle(sample_idx, num_samples, angle_offset) {
  return ((2 * Math.PI / num_samples) * sample_idx) + angle_offset;
}

// Count data is from the csv.data from Papa.
// samples is from csv.meta.fields
function sample_counts_to_points(csv) {
  var count_data = csv.data;
  var samples    = csv.meta.fields;

  // subtract 1 to account for the 'name' field
  var num_samples = samples.length - 1;

  if (num_samples === 1) {
    // Need to add fake samples with zero counts to ensure we have at least a triangle to get the centroid of.
    var fake_samples = ["iroki_fake_1", "iroki_fake_2"];
  }
  else if (num_samples === 2) {
    var fake_samples = ["iroki_fake_1"];
  }
  else {
    var fake_samples = [];
  }

  if (fake_samples.length > 0) {
    count_data.forEach(function (row) {
      fake_samples.forEach(function (name) {
        // TODO this will break if one of these sample names is used.
        row[name] = 0;
      });
    });

    fake_samples.forEach(function (name) {
      samples.push(name);
    });
  }

  // TODO check to see if the json keeps the order.
  var points = {};

  count_data.forEach(function (row) {
    var leaf_name = "";

    // First you need the max count.
    var max_count          = 0;
    var min_count          = null;
    var min_non_zero_count = null;
    json_each(row, function (sample_name, count) {
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

    samples.forEach(function (sample, sample_idx) {
      // The first thing is 'name' not a sample.
      var true_sample_idx = sample_idx - 1;


      if (sample === "name") {  // It isn't a sample, but the name of the row/otu
        leaf_name         = row[sample];
        points[leaf_name] = {};
      }
      else { // it is a sample not the name of the row/otu
        var count = null;
        if (max_count === 0 || row[sample] === 0) {
          // Set it to a tiny number that won't get rounded to zero.
          count = zero_replacement_val;
        }
        else {
          count = row[sample] / max_count;
        }

        var pt = get_point(count, true_sample_idx, num_samples);
        console.log("leaf: " + leaf_name + " sample: " + sample + " sample_idx: " + sample_idx + " pt: " + JSON.stringify(pt));

        points[leaf_name][sample] = pt;
      }
    });
  });

  return points;
}

function signed_area_of_triangle(p1, p2, p3) {
  return ((p1.x * (p2.y - p3.y)) + (p2.x * (p3.y - p1.y)) + (p3.x * (p1.y - p2.y))) / 2;
}

function centroid_of_triangle(p1, p2, p3) {
  return { x : (p1.x + p2.x + p3.x) / 3, y : (p1.y + p2.y + p3.y) / 3 };
}

// TODO instead of calculating all triangles, could save some steps by removing p2 from the points obj and rerunning.  (this would also required using signed area)
function centroids_of_points(all_points, non_zero_count_samples) {
  function get_non_zero_points(pts) {
    var non_zero_points = [];

    pts.forEach(function (pt) {
      if (!fn.pt.is_zero(pt)) {
        non_zero_points.push(pt);
      }
    });

    return non_zero_points;
  }

  var centroids = {};

  json_each(all_points, function (leaf, points) {
    var samples     = json_keys(points);
    var sum_x_numer = 0;
    var sum_y_numer = 0;
    var sum_denom   = 0;


    switch (non_zero_count_samples[leaf]) {
      case "none":
        // It has a zero count in every sample
        centroids[leaf] = fn.pt.new(0, 0);
        break;
      case "many":
        // Just do the regular stuff
        if (samples.length < 3) {
          // This should never happen as fake samples get added on to make sure there are at least 3.
          throw Error("Leaf " + leaf + " had less than 3 samples.  Got " + samples.length);
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
        centroids[leaf]     = fn.pt.new(non_zero_point.x / 2, non_zero_point.y / 2);
        break;
    }
  });

  return centroids;
}


function get_non_zero_count_samples(parsed_biom) {
  var obj = {};
  parsed_biom.data.forEach(function (data_row) {
    var leaf_name              = "";
    var non_zero_count_samples = [];
    json_each(data_row, function (field, value) {
      if (field === "name") {
        leaf_name = value;
      }
      else if (value !== 0) {
        non_zero_count_samples.push(field);
      }
    });

    switch (non_zero_count_samples.length) {
      case 0:
        obj[leaf_name] = "none";
        break;
      case 1:
        obj[leaf_name] = non_zero_count_samples[0];
        break;
      default:
        obj[leaf_name] = "many";
        break;
    }
  });

  return obj;
}

function centroids_of_samples(parsed_biom) {
  var points                 = sample_counts_to_points(parsed_biom);
  var non_zero_count_samples = get_non_zero_count_samples(parsed_biom);

  return centroids_of_points(points, non_zero_count_samples);
}

function shannon_evenness(parsed_biom) {
  var evenness = {};

  parsed_biom.data.forEach(function (data_row) {
    var leaf_name = null;
    var counts    = [];

    // Get all the counts into an ary
    json_each(data_row, function (field, value) {
      if (field === "name") {
        leaf_name = value;
      }
      else {
        counts.push(value);
      }
    });

    // Now calculate evenness
    evenness[leaf_name] = fn.diversity.evenness(counts);
  });

  return evenness;
}

function colors_from_centroids(centroids, parsed_biom) {
  var evenness = {};
  var min_evenness = null;
  var max_evenness = null;
  if (g_val_chroma_method === g_ID_CHROMA_METHOD_EVENNESS) {
    // Need to calculate the evenness and pass it to the color space function.
    evenness = shannon_evenness(parsed_biom);

    // Set min and max evenness.
    json_each(evenness, function(leaf, val) {
      if (min_evenness === null || val < min_evenness) {
        min_evenness = val;
      }

      if (max_evenness === null || val > max_evenness) {
        max_evenness = val;
      }
    });
  }

  var avg_counts    = {};
  var max_avg_count = 0;
  var min_avg_count = 999999999;
  parsed_biom.data.forEach(function (row) {

    var n         = 0;
    var this_leaf = "";
    json_each(row, function (col_name, val) {
      var count_this_value = val > 0 || g_val_avg_method === g_ID_AVG_METHOD_ALL_SAMPLES_MEAN;

      if (col_name === "name") {
        this_leaf             = val;
        avg_counts[this_leaf] = 0;
      }
      else if (count_this_value) {
        avg_counts[this_leaf] += val;
        n += 1;
      }
    });

    if (n === 0) {
      avg_counts[this_leaf] = 0;
    }
    else {
      avg_counts[this_leaf] /= n;
    }

    if (max_avg_count < avg_counts[this_leaf]) {
      max_avg_count = avg_counts[this_leaf];
    }
    if (min_avg_count > avg_counts[this_leaf]) {
      min_avg_count = avg_counts[this_leaf];
    }
  });

  var colors        = {};
  var color_details = {};
  json_each(centroids, function (leaf, pt) {
    var return_val = g_color_space_fn(leaf, pt, avg_counts, max_avg_count, min_avg_count, evenness[leaf], max_evenness, min_evenness);

    colors[leaf] = return_val[0];

    color_details[leaf]              = {};
    color_details[leaf]["hue"]       = return_val[1];
    color_details[leaf]["chroma"]    = return_val[2];
    color_details[leaf]["lightness"] = return_val[3];

  });

  return [colors, color_details];
}

function mag(pt) {
  return Math.sqrt(Math.pow(pt.x, 2) + Math.pow(pt.y, 2));
}

function rad_to_deg(rad) {
  return rad * 180 / Math.PI;
}

function get_hcl_color(leaf, pt, avg_counts, max_avg_count, min_avg_count, evenness, max_evenness, min_evenness) {
  if (g_val_abundant_samples_are === g_ID_ABUNDANT_SAMPLES_ARE_DARK) {
    var new_lightness_min = g_val_lightness_max;
    var new_lightness_max = g_val_lightness_min;
  }
  else { // abundant samples are light
    var new_lightness_min = g_val_lightness_min;
    var new_lightness_max = g_val_lightness_max;
  }

  // the angle of the vector from origin to centroid.
  var hue = rad_to_deg(Math.atan2(pt.y, pt.x));

  // double it cos the max is half the radius but should be 1.
  // TODO is this still correct for the 1 and 2 sample biom files?
  // START HERE TODO this is not quite right.
  console.log("leaf: " + leaf + " mag(pt) " + mag(pt) + " pt: " + JSON.stringify(pt));

  if (evenness) {
    // Use evenness of samples for chroma_val.  Eveness is oposite of chroma running 0 to 1, so subtract from 1.
    var chroma_val = fn.math.scale(1 - evenness, min_evenness, max_evenness, 0, 100);
    console.log("using evenness");
  }
  else {
    // Use magnitude of hue angle vector.
    console.log("using magnitude");
    var chroma_val = mag(pt) * 2 * 100;
  }

  var lightness = fn.math.scale(avg_counts[leaf] / max_avg_count, min_avg_count / max_avg_count, 1, new_lightness_min, new_lightness_max);

  return [chroma.hcl(hue, chroma_val, lightness).hex(), hue, chroma_val, lightness];

}

function get_hsl_color(leaf, pt, avg_counts, max_avg_count, min_avg_count, evenness, max_evenness, min_evenness) {
  if (g_val_abundant_samples_are === g_ID_ABUNDANT_SAMPLES_ARE_DARK) {
    var new_lightness_min = g_val_lightness_max / 100;
    var new_lightness_max = g_val_lightness_min / 100;
  }
  else { // abundant samples are light
    var new_lightness_min = g_val_lightness_min / 100;
    var new_lightness_max = g_val_lightness_max / 100;
  }

  // the angle of the vector from origin to centroid.
  var hue = rad_to_deg(Math.atan2(pt.y, pt.x));

  if (evenness) {
    // Use evenness of samples for chroma_val
    var saturation = fn.math.scale(1 - evenness, min_evenness, max_evenness, 0, 100);
    console.log("using evenness");
  }
  else {
    // Use magnitude of hue angle vector.
    console.log("using magnitude");
    // double it cos the max is half the radius but should be 1.
    var saturation = mag(pt) * 2;
  }

  var lightness = fn.math.scale(avg_counts[leaf] / max_avg_count, min_avg_count / max_avg_count, 1, new_lightness_min, new_lightness_max);

  return [chroma.hsl(hue, saturation, lightness).hex(), hue, saturation, lightness];
}

// TODO make sure all color tags are hex codes
// The orig_biom_str is for when the parsed_biom has the reduced dimensions so we can put the original dimensions onto the end of the file.
function make_biom_with_colors_html(parsed_biom, orig_biom_str, colors, color_details) {
  // biom csv
  // { data: [], errors: [], meta: {} }
  // in data the entries are like this: { name: leaf_name, sample1: 12, sample2: 10.5 }

  // colors
  // { leaf_name: "#00ff00", leaf2_name: "#ff00ff" }

  function th_tag(str) {
    return "<th>" + str + "</th>";
  }

  function td_tag(str) {
    return "<td>" + str + "</td>";
  }

  function td_tag_with_background(str, color) {
    return "<td class='thick-right-border' style='background-color:" + color + ";'>" + str + "</td>";
  }

  var evenness = shannon_evenness(parsed_biom);

  var parsed_orig_biom = null;
  if (orig_biom_str) {
    parsed_orig_biom = parse_biom_file_str(orig_biom_str);
  }

  var fields = parsed_biom.meta.fields;

  // Make color the second field
  fields.splice(1, 0, "color", "hue angle", "chroma/saturation", "lightness", "evenness");

  var header_str = "<tr>\n";
  fields.forEach(function (field) {
    // Don't put the fake fields in the output.
    if (!field.match(/iroki_fake_[12]/)) {
      if (field === "color" || field === "lightness" || field === "evenness") {
        header_str += "<th class='thick-right-border'>" + field + "</th>"
      }
      else {
        header_str += th_tag(field);
      }
    }
  });

  if (parsed_orig_biom) {
    // Add on the original header fields.
    var original_fields = parsed_orig_biom.meta.fields;
    // remove the name field
    original_fields.shift();

    original_fields.forEach(function (field, idx) {
      if (idx === 0) {
        header_str += "<th class='thick-left-border'>" + field + "</th>"
      }
      else {
        header_str += th_tag(field);
      }
    });
  }
  header_str += "</tr>";

  var table_rows = [];
  parsed_biom.data.forEach(function (line_json, line_idx) {
    var this_color     = null;
    var table_rows_str = "<tr>";

    // Add on the parts from the biom file
    json_each(line_json, function (field, value) {
      if (!field.match(/iroki_fake_[12]/)) {
        if (field === "name") {
          // Get the color with this name
          // TODO set a default value if it is not in the hash
          this_color = colors[value];

          table_rows_str += td_tag(value);

          // Put the color column right after the name.
          table_rows_str += td_tag_with_background(this_color, this_color);

          // Add on the parts from the color info
          var hue       = color_details[value].hue
          var chroma    = fn.math.round(color_details[value].chroma, 2);
          var lightness = fn.math.round(color_details[value].lightness, 2);

          // Flip hue around the circle if the angle is negative.
          hue = hue < 0 ? fn.math.round(hue + 360, 2) : fn.math.round(hue, 2);

          table_rows_str += (td_tag(hue) + td_tag(chroma) + "<td class='thick-right-border'>" + lightness + "</td>");

          // And now add in the evenness
          table_rows_str += ("<td class='thick-right-border'>" + fn.math.round(evenness[value], 2) + "</td>");
        }
        else {
          table_rows_str += td_tag(fn.math.round(value, 2));
        }
      }
    });

    if (parsed_orig_biom) {
      var orig_data      = parsed_orig_biom.data[line_idx];
      var orig_val_count = 0;
      json_each(orig_data, function (field, value) {
        if (field !== "name") {
          if (orig_val_count === 0) {
            table_rows_str += ("<td class='thick-left-border'>" + fn.math.round(value, 2) + "</td>");
          }
          else {
            table_rows_str += td_tag(fn.math.round(value, 2));
          }

          orig_val_count += 1;
        }
      });
    }

    // Finish off the row
    table_rows_str += "</tr>";
    table_rows.push(table_rows_str);
  });

  var style_str = "<style>" +
    "table, th, td {border: 1px solid #2d2d2d; border-collapse: collapse} " +
    "th, td {padding: 5px} " +
    "th {text-align: left; border-bottom: 4px solid #2d2d2d} " +
    ".thick-right-border {border-right: 3px solid #2d2d2d}" +
    ".thick-left-border {border-left: 3px solid #2d2d2d}" +
    "</style>"

  var md_str = "<!DOCTYPE html><head>" + style_str + "<title>Color table</title></head>";

  return md_str + "<body><table>" + header_str + table_rows.join("\n") + "</table></body></html>";
}

var debug_biom_csv, debug_colors_json, debug_color_details;

function biom__colors_from_biom_str(parsed_biom) {
  var centroids = centroids_of_samples(parsed_biom);

  debug_biom_csv = parsed_biom;

  return colors_from_centroids(centroids, parsed_biom);
}

function make_tsv_string(json) {
  var header  = "name\tbranch_color\tleaf_label_color\tleaf_dot_color\n";
  var strings = [];
  json_each(json, function (key, val) {
    var str = [key, val, val, val].join("\t");

    strings.push(str);
  });

  return header + strings.join("\n");
}

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

  var parsed_biom = parse_biom_file_str(str);

  var ret_val         = biom__colors_from_biom_str(parsed_biom);
  var colors          = ret_val[0];
  var color_details   = ret_val[1];
  debug_colors_json   = colors;
  debug_color_details = color_details;
  var tsv_str         = make_tsv_string(colors);

  if (g_val_download_legend) {
    // TODO don't call parse_biom_file again, have a single function do it and pass that around.

    if (g_val_reduce_dimension === "reduce-dimension-none") {
      var html_str = make_biom_with_colors_html(parsed_biom, false, colors, color_details);
    }
    else {
      var html_str = make_biom_with_colors_html(parsed_biom, biom_str, colors, color_details);

    }

    var zip = new JSZip();

    zip.folder("iroki_mapping")
       .file("mapping.txt", tsv_str)
       .file("counts_with_colors.html", html_str);

    zip.generateAsync({ type : "blob" })
       .then(function (blob) {
         saveAs(blob, "iroki_mapping.zip");
       });
  }
  else {
    var blob = new Blob([tsv_str], { type : "text/plain;charset=utf-8" });

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
      return score + abs_min_val + 1
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
    return obj[biom.meta.fields[0]]
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
  var biom_ary      = biom_to_ary(parse_biom_file_str(biom_str));
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


var g_ID_COLOR_SPACE     = "color-space",
    g_ID_COLOR_SPACE_HCL = "color-space-hcl",
    g_ID_COLOR_SPACE_HSL = "color-space-hsl",
    g_val_color_space,
    g_color_space_fn;

var g_ID_AVG_METHOD                        = "avg-method",
    g_ID_AVG_METHOD_ALL_SAMPLES_MEAN       = "avg-method-all-samples-mean",
    g_ID_AVG_METHOD_NONZERO_SAMPLES_MEAN   = "avg-method-nonzero-samples-mean",
    g_ID_AVG_METHOD_ALL_SAMPLES_MEDIAN     = "avg-method-all-samples-median",
    g_ID_AVG_METHOD_NONZERO_SAMPLES_MEDIAN = "avg-method-nonzero-samples-median",
    g_val_avg_method;

var g_ID_HUE_ANGLE_OFFSET = "hue-angle-offset",
    g_val_hue_angle_offset;

var g_ID_REDUCE_DIMENSION         = "reduce-dimension",
    g_ID_REDUCE_DIMENSION_NONE    = "reduce-dimension-none",
    g_ID_REDUCE_DIMENSION_AUTO_50 = "reduce-dimension-auto-50",
    g_ID_REDUCE_DIMENSION_AUTO_75 = "reduce-dimension-auto-75",
    g_ID_REDUCE_DIMENSION_AUTO_90 = "reduce-dimension-auto-90",
    g_ID_REDUCE_DIMENSION_1_PC    = "reduce-dimension-1-pc",
    g_ID_REDUCE_DIMENSION_2_PC    = "reduce-dimension-2-pc",
    g_ID_REDUCE_DIMENSION_3_PC    = "reduce-dimension-3-pc",
    g_ID_REDUCE_DIMENSION_4_PC    = "reduce-dimension-4-pc",
    g_ID_REDUCE_DIMENSION_5_PC    = "reduce-dimension-5-pc",
    g_val_reduce_dimension;

var g_ID_ABUNDANT_SAMPLES_ARE       = "abundant-samples-are",
    g_ID_ABUNDANT_SAMPLES_ARE_LIGHT = "abundant-samples-are-light",
    g_ID_ABUNDANT_SAMPLES_ARE_DARK  = "abundant-samples-are-dark",
    g_val_abundant_samples_are;

var g_ID_DOWNLOAD_LEGEND = "download-legend",
    g_val_download_legend;

var g_ID_LIGHTNESS_MIN      = "lightness-min",
    g_ID_LIGHTNESS_MAX      = "lightness-max",
    g_DEFAULT_LIGHTNESS_MIN = 25,
    g_DEFAULT_LIGHTNESS_MAX = 85,
    g_val_lightness_min, // default 20
    g_val_lightness_max; // default 80

var g_ID_CHROMA_METHOD           = "chroma-method",
    g_ID_CHROMA_METHOD_MAGNITUDE = "chroma-method-magnitude",
    g_ID_CHROMA_METHOD_EVENNESS  = "chroma-method-evenness",
    g_val_chroma_method;

function update_form_vals() {
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

  // Color options
  g_val_color_space = jq(g_ID_COLOR_SPACE).val();
  set_color_space_fn(g_val_color_space);

  g_val_hue_angle_offset = parseFloat(jq(g_ID_HUE_ANGLE_OFFSET).val());
  if (isNaN(g_val_hue_angle_offset) || g_val_hue_angle_offset < 0) {
    g_val_hue_angle_offset = 0;
    jq(g_ID_HUE_ANGLE_OFFSET).val(g_val_hue_angle_offset)
  }
  else if (g_val_hue_angle_offset >= 360) {
    g_val_hue_angle_offset = 359;
    jq(g_ID_HUE_ANGLE_OFFSET).val(g_val_hue_angle_offset)
  }
  var display_color = chroma.hcl(g_val_hue_angle_offset, 60, 70).hex();
  jq("hue-angle-offset-label").css("color", display_color);


  g_val_abundant_samples_are = jq(g_ID_ABUNDANT_SAMPLES_ARE).val();

  // Other options
  g_val_avg_method       = jq(g_ID_AVG_METHOD).val();
  g_val_reduce_dimension = jq(g_ID_REDUCE_DIMENSION).val();

  // Legend options
  g_val_download_legend = is_checked(g_ID_DOWNLOAD_LEGEND);

  // Lightness options
  g_val_lightness_min = parseFloat(jq(g_ID_LIGHTNESS_MIN).val());
  g_val_lightness_max = parseFloat(jq(g_ID_LIGHTNESS_MAX).val());

  // Chroma opts
  g_val_chroma_method = jq(g_ID_CHROMA_METHOD).val();
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

  disable("submit-button");
  disable("reset-button");
  update_form_vals();


  var submit_id   = "submit-button";
  var uploader_id = "uploader";

  var uploader                    = document.getElementById(uploader_id);
  var submit_button               = document.getElementById(submit_id);
  var color_space_dropdown        = document.getElementById(g_ID_COLOR_SPACE);
  var avg_method_dropdown         = document.getElementById(g_ID_AVG_METHOD);
  var hue_angle_offset_slider     = document.getElementById(g_ID_HUE_ANGLE_OFFSET);
  var reduce_dimension_select     = document.getElementById(g_ID_REDUCE_DIMENSION);
  var abundant_samples_are_select = document.getElementById(g_ID_ABUNDANT_SAMPLES_ARE);
  var download_legend             = document.getElementById(g_ID_DOWNLOAD_LEGEND);
  var lightness_min_input         = document.getElementById(g_ID_LIGHTNESS_MIN);
  var lightness_max_input         = document.getElementById(g_ID_LIGHTNESS_MAX);
  var chroma_method_input         = document.getElementById(g_ID_CHROMA_METHOD);

  var biom_reader = new FileReader();

  biom_reader.onload = function (event) {
    var biom_str = event.target.result;
    biom__save_abundance_colors(biom_str);
  };

  uploader.addEventListener("change", function () {
    undisable_and_update();
  });
  color_space_dropdown.addEventListener("change", function () {
    undisable_and_update();
  });
  avg_method_dropdown.addEventListener("change", function () {
    undisable_and_update();
  });
  hue_angle_offset_slider.addEventListener("change", function () {
    undisable_and_update();
  });
  reduce_dimension_select.addEventListener("change", function () {
    undisable_and_update();
  });
  abundant_samples_are_select.addEventListener("change", function () {
    undisable_and_update();
  });
  download_legend.addEventListener("change", function () {
    undisable_and_update();
  });
  chroma_method_input.addEventListener("change", function () {
    undisable_and_update();
  });
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
