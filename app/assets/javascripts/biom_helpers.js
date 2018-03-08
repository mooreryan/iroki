var biom    = {};
biom.helper = {};

/*
biom.helper.add_zero_count_samples = function (counts, samples) {
  if (samples.length === 0) {
    throw Error("samples array must not be empty");
  }

  counts.forEach(function (row) {
    samples.forEach(function (sample) {
      row[sample] = 0;
    });
  });
};

// Sample idx starts at zero
biom.sample_to_angle = function (sample_idx, num_samples, angle_offset) {
  if (num_samples === 0) {
    throw Error("num_samples must be > 0");
  }
  return ((2 * Math.PI / num_samples) * sample_idx) + angle_offset;
};


// Will throw if any of the points are zero.
biom.centroids_from_points = function (all_points, non_zero_count_samples) {
  var centroids = {};


  fn.obj.each(all_points, function (leaf, points) {
    var samples     = json_keys(points);
    var num_samples = samples.length;
    var sum_x_numer = 0;
    var sum_y_numer = 0;
    var sum_denom   = 0;

    var new_points    = {};
    var sample_idx    = 0;
    var sample_angles = [];
    var i             = 0;
    var deg           = 360 / num_samples;
    for (i = 0; i < num_samples; ++i) {
      sample_angles.push(i * deg);
    }

    // Move zero points away from zero just a bit.
    fn.obj.each(points, function (sample, point) {
      if (fn.pt.is_zero(point)) {
        var angle  = fn.math.degrees_to_radians(sample_angles[sample_idx]);
        var radius = global.ZERO_REPLACEMENT_VAL;
        var x      = radius * Math.cos(angle);
        var y      = radius * Math.sin(angle);

        new_points[sample] = fn.pt.new(x, y);
      }
      else {
        new_points[sample] = fn.obj.deep_copy(point);
      }

      sample_idx += 1;
    });

    if (non_zero_count_samples[leaf] === "none") {
      // It has a zero count in every sample
      centroids[leaf] = fn.pt.new(0, 0);
    }
    else if (non_zero_count_samples[leaf] === "many" && samples.length === 2) {
      // Just set it to the midpoint of the line segment.
      var p1 = new_points[samples[0]];
      var p2 = new_points[samples[1]];

      var new_x = (p1.x + p2.x) / 2;
      var new_y = (p1.y + p2.y) / 2;

      centroids[leaf] = fn.pt.new(new_x, new_y);
    }
    else if (non_zero_count_samples[leaf] === "many" && samples.length >= 3) {
      var numerator   = { x: 0, y: 0 };
      var denominator = 0;

      var i = 0;
      for (i = 0; i < samples.length - 1; ++i) {
        var p1 = new_points[samples[i]];
        var p2 = new_points[samples[i + 1]];

        var area     = fn.pt.signed_area_origin_triangle(p1, p2);
        var centroid = fn.pt.centroid_origin_triangle(p1, p2);

        numerator.x += area * centroid.x;
        numerator.y += area * centroid.y;
        denominator += area;
      }

      // Catch the last point
      var p1 = new_points[samples[i]];
      var p2 = new_points[samples[0]];

      var area     = fn.pt.signed_area_origin_triangle(p1, p2);
      var centroid = fn.pt.centroid_origin_triangle(p1, p2);

      numerator.x += area * centroid.x;
      numerator.y += area * centroid.y;
      denominator += area;

      centroids[leaf] = fn.pt.new(numerator.x / denominator, numerator.y / denominator);
    }
    else {
      // It has a single sample with a non zero count.
      var non_zero_sample = non_zero_count_samples[leaf];
      var non_zero_point  = new_points[non_zero_sample];

      // Just take the point because we want it all the way out to the radius of the circle for that sample.
      centroids[leaf] = fn.pt.new(non_zero_point.x, non_zero_point.y);
    }
  });

  return centroids;
};

biom.helper.fake_samples = function (num_samples) {
  // Need to add fake samples with zero counts to ensure we have at least a triangle to get the centroid of.
  if (num_samples === 1) {
    return ["iroki_fake_1", "iroki_fake_2"];
  }
  else if (num_samples === 2) {
    return ["iroki_fake_1"];
  }
  else {
    return [];
  }
};

// Technically we want 1 - evenness to get it going the same way as chroma.
biom.inverse_evenness = function (parsed_biom) {
  var evenness_fn = function (counts) {
    return 1 - fn.diversity.evenness_entropy(counts);
  };
  var evenness    = {};

  parsed_biom.data.forEach(function (data_row) {
    var leaf_name = null;
    var counts    = [];

    // Get all the counts into an ary
    json_each(data_row, function (field, value) {
      if (field === "name") {
        leaf_name = value;
      }
      else if (!fn.utils.is_fake_field(field)) {
        counts.push(value);
      }
    });

    // Now calculate evenness
    evenness[leaf_name] = evenness_fn(counts);
  });

  return evenness;
};
*/

// TODO make sure all color tags are hex codes
// The orig_biom_str is for when the parsed_biom has the reduced dimensions so we can put the original dimensions onto the end of the file.
biom.make_counts_with_colors_html = function (parsed_biom, orig_biom_str, colors, color_details) {
  // biom csv
  // { data: [], errors: [], meta: {} }
  // in data the entries are like this: { name: leaf_name, sample1: 12, sample2: 10.5 }

  // colors
  // { leaf_name: "#00ff00", leaf2_name: "#ff00ff" }


  var points                 = fn.parsed_biom.leaf_sample_points(parsed_biom);
  var non_zero_count_samples = fn.parsed_biom.non_zero_count_samples(parsed_biom);
  var centroids              = biom.centroids_from_points(points, non_zero_count_samples);

  var evenness = biom.inverse_evenness(parsed_biom);

  // This is on the "new" biom string, i.e. it will us PC columns rather than original if the thing has been dimension reduced.
  var abundance = fn.parsed_biom.abundance_across(parsed_biom, g_val_avg_method).abundance;

  var parsed_orig_biom = null;
  if (orig_biom_str) {
    parsed_orig_biom = biom.parse_biom_file_str(orig_biom_str);
  }

  var fields = fn.obj.deep_copy(parsed_biom.meta.fields);

  // Make color the second field
  fields.splice(1, 0, "color", "hue", "chroma/saturation", "lightness", "centroid", "evenness", "abundance");

  var header_str = "<tr>";
  fields.forEach(function (field) {
    // Don't put the fake fields in the output.
    if (!fn.utils.is_fake_field(field)) {
      if (field === "color" || field === "lightness" || field === "abundance") {
        header_str += "<th class='thick-right-border'>" + field + "</th>";
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
        header_str += "<th class='thick-left-border'>" + field + "</th>";
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
    var this_leaf      = null;
    var table_rows_str = "<tr>";

    // Add on the parts from the biom file
    json_each(line_json, function (field, value) {
      if (!field.match(/iroki_fake_[12]/)) {
        if (field === "name") {
          this_leaf = value;
          // Get the color with this name
          // TODO set a default value if it is not in the hash

          this_color = colors[value];

          table_rows_str += td_tag(value);

          // Put the color column right after the name.
          table_rows_str += td_tag_with_background(this_color, this_color);

          // Add on the parts from the color info
          var hue        = color_details[value].hue;
          var chroma_val = fn.math.round(color_details[value].chroma, 2);
          var lightness  = fn.math.round(color_details[value].lightness, 2);

          // Flip hue around the circle if the angle is negative.
          hue = hue < 0 ? fn.math.round(hue + 360, 2) : fn.math.round(hue, 2);

          table_rows_str += (td_tag(hue) + td_tag(chroma_val) + "<td class='thick-right-border'>" + lightness + "</td>");

          // Add the centroid
          table_rows_str += td_tag(fn.pt.to_s(centroids[this_leaf]));

          // And now add in the evenness
          table_rows_str += td_tag(fn.math.round(1 - evenness[value], 2));

          // Finally the abundance.
          table_rows_str += ("<td class='thick-right-border'>" + fn.math.round(abundance[value], 2) + "</td>");
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
    "</style>";

  var md_str = "<!DOCTYPE html><head>" + style_str + "<title>Color table</title></head>";

  return md_str + "<body><table>" + header_str + table_rows.join("") + "</table></body></html>";
};

/**
 * Makes the mapping file string from the leaf name to colors obj.
 *
 * @param colors leaf_name => color_hex_code
 * @return {string} The mapping file string.  It will be passed in to the saveAs function.
 */
biom.mapping_file_str = function (colors) {
  var header  = "name\tbranch_color\tleaf_label_color\tleaf_dot_color\n";
  var strings = [];
  json_each(colors, function (leaf_name, color_hex_code) {
    var str = [leaf_name, color_hex_code, color_hex_code, color_hex_code].join("\t");

    strings.push(str);
  });

  return header + strings.join("\n");
};

// These have no specs
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
/**
 * This is the "main" function for dealing with biom data.
 *
 * It calls everything needed to save the color maps based on the biom file.
 *
 * TODO pass in all globals as kv pairs in params.
 *
 * @param params Includes the following keys: biom_str, keep_zero_counts, angle_offset
 * @return NOTHING!
 */
function biom__save_abundance_colors(params) {
  var str;
  // switch (g_val_reduce_dimension) {
  //   case g_ID_REDUCE_DIMENSION_NONE:
  //     str = biom_str;
  //     break;
  //   case g_ID_REDUCE_DIMENSION_AUTO_50:
  //     str = reduce_dimension(biom_str, "auto", 50);
  //     break;
  //   case g_ID_REDUCE_DIMENSION_AUTO_75:
  //     str = reduce_dimension(biom_str, "auto", 75);
  //     break;
  //   case g_ID_REDUCE_DIMENSION_AUTO_90:
  //     str = reduce_dimension(biom_str, "auto", 90);
  //     break;
  //   case g_ID_REDUCE_DIMENSION_1_PC:
  //     str = reduce_dimension(biom_str, "pc", 1);
  //     break;
  //   case g_ID_REDUCE_DIMENSION_2_PC:
  //     str = reduce_dimension(biom_str, "pc", 2);
  //     break;
  //   case g_ID_REDUCE_DIMENSION_3_PC:
  //     str = reduce_dimension(biom_str, "pc", 3);
  //     break;
  //   default:
  //     str = biom_str;
  //     break;
  // }


  var fully_parsed_biom = fn.parsed_biom.new(params);

  var biom_color_map_str = biom.mapping_file_str(fully_parsed_biom.color_hex_codes);

  if (g_val_download_legend) {
    // if (g_val_reduce_dimension === "reduce-dimension-none") {
    //   var html_str = biom.make_counts_with_colors_html(parsed_biom, false, colors, color_details);
    // }
    // else {
    //   var html_str = biom.make_counts_with_colors_html(parsed_biom, biom_str, colors, color_details);
    //
    // }

    // Make the tsv for sample legend.
    // var sample_color_legend_tsv_str  = fn.parsed_biom.sample_color_legend(parsed_biom, g_val_hue_angle_offset);
    // var sample_color_legend_html_str = fn.parsed_biom.sample_color_legend_html(parsed_biom, g_val_hue_angle_offset);

    // var zip = new JSZip();
    //
    // zip.folder("iroki_mapping")
    //    .file("mapping.txt", tsv_str)
    //    .file("counts_with_colors.html", html_str)
    //    .file("sample_approximate_starting_colors.txt", sample_color_legend_tsv_str)
    //    .file("sample_approximate_starting_colors.html", sample_color_legend_html_str);
    //
    // zip.generateAsync({
    //   type: "blob",
    //   compression: "DEFLATE",
    //   compressionOptions: {
    //     level: 1
    //   }
    // })
    //    .then(function (blob) {
    //      saveAs(blob, "iroki_mapping.zip");
    //    });
  }
  else {
    var blob = new Blob([biom_color_map_str], { type: "text/plain;charset=utf-8" });

    // Unicode standard does not recommend using the BOM for UTF-8, so pass in true to NOT put it in.
    saveAs(blob, "mapping.txt", true);
  }

}

function biom__save_abundance_colors_old(biom_str) {
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

  var points                 = fn.parsed_biom.leaf_sample_points(parsed_biom);
  var non_zero_count_samples = fn.parsed_biom.non_zero_count_samples(parsed_biom);
  var centroids              = biom.centroids_from_points(points, non_zero_count_samples);

  var ret_val = colors_from_centroids(centroids, parsed_biom);

  var colors          = ret_val[0];
  var color_details   = ret_val[1];
  debug_colors_json   = colors;
  debug_color_details = color_details;
  var tsv_str         = biom.mapping_file_str(colors);

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
  var centered_mat = apply_to_cols(lalolib.array2mat(ary), utils__vec_center);

  var svd_centered_mat = lalolib.svd(centered_mat, "thinU");

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
    sing_vals       = lalolib.diag(non_zero_sing_vals.slice(0, num_sing_vals));
    take_these_cols = range(num_sing_vals);
  }
  var u_component = lalolib.getCols(svd_centered_mat.U, take_these_cols);


  scores = lalolib.mul(u_component, sing_vals);


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
    var col = lalolib.getCols(M, [cidx]);

    new_ary.push(fn(col));
  }

  return lalolib.transposeMatrix(lalolib.array2mat(new_ary));
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

      lalolib.getRows(proj, [leaf_idx]).forEach(function (row_count) {
        row.push(row_count);
      });

      new_biom.push(row);
    });
  }


  return new_biom.map(function (row) {
    return row.join("\t");
  }).join("\n");
}


