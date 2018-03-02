var biom    = {};
biom.helper = {};

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

biom.make_tsv_string = function (json) {
  var header  = "name\tbranch_color\tleaf_label_color\tleaf_dot_color\n";
  var strings = [];
  json_each(json, function (key, val) {
    var str = [key, val, val, val].join("\t");

    strings.push(str);
  });

  return header + strings.join("\n");
};


biom.parse_biom_file_str = function (str) {
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
    });
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
};

// Sample idx starts at zero
biom.sample_to_angle = function (sample_idx, num_samples, angle_offset) {
  if (num_samples === 0) {
    throw Error("num_samples must be > 0");
  }
  return ((2 * Math.PI / num_samples) * sample_idx) + angle_offset;
};
