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

biom.make_tsv_string = function (json) {
  var header  = "name\tbranch_color\tleaf_label_color\tleaf_dot_color\n";
  var strings = [];
  json_each(json, function (key, val) {
    var str = [key, val, val, val].join("\t");

    strings.push(str);
  });

  return header + strings.join("\n");
};



