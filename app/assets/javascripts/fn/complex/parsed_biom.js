/*

fn.parsed_biom.sample_color_legend = function (parsed_biom, angle_offset) {
  var sample_angle_ret_val          = fn.parsed_biom.sample_angles(parsed_biom, angle_offset);
  var sample_names                  = sample_angle_ret_val[0];
  var sample_angles                 = sample_angle_ret_val[1];
  var sample_approx_starting_colors = sample_angles.map(function (hue_angle) {
    return fn.color.approx_starting_color(hue_angle);
  });

  var sample_legend_str = "name\tappoximate starting color\n";
  sample_names.forEach(function (name, idx) {
    sample_legend_str += [name, sample_approx_starting_colors[idx]].join("\t") + "\n";
  });

  return sample_legend_str;
};

fn.parsed_biom.sample_color_legend_html = function (parsed_biom, angle_offset) {
  var tsv = fn.parsed_biom.sample_color_legend(parsed_biom, angle_offset);

  var rows = fn.str.chomp(tsv).split("\n").map(function (row, row_idx) {
    var fields = row.split("\t");

    var tag = row_idx === 0 ? "th" : "td";

    var row_str = fields.map(function (field, col_idx) {
      if (col_idx === 0) {
        return fn.html.tag(tag, field, "class='thick-right-border'");
      }
      else if (row_idx >= 1 && col_idx === 1) {
        return fn.html.tag(tag, field, "style='background-color: " + field + ";'");
      }
      else {
        return fn.html.tag(tag, field);
      }
    }).join("");

    return fn.html.tag("tr", row_str);
  }).join("");

  var style_str = "<style>" +
    "table, th, td {border: 1px solid #2d2d2d; border-collapse: collapse} " +
    "th, td {padding: 5px} " +
    "th {text-align: left; border-bottom: 4px solid #2d2d2d} " +
    ".thick-right-border {border-right: 3px solid #2d2d2d}" +
    ".thick-left-border {border-left: 3px solid #2d2d2d}" +
    "</style>";

  var table = fn.html.tag("table", rows);
  var body  = fn.html.tag("body", table);
  var head  = fn.html.tag("head", style_str + fn.html.tag("title", "Sample legend"));

  return "<!DOCTYPE html>" + head + body + "</html>";
};
*/

/**
 * Parses the biom file string with Papa.parse.
 *
 * @param {String} str The biom file string.
 * @return {Object} a Papa parsed object.
 * @throws {Error} if the first column field is not 'name'
 */
fn.parsed_biom.parse_biom_file_str = function (str) {
  // Parse mapping string.
  var csv = Papa.parse(chomp(str), PAPA_CONFIG);

  // TODO test
  // Check for erros
  if (has_papa_errors(csv)) {
    return null;
  }

  // TODO test
  if (csv.meta.fields.indexOf("name") === -1) {
    throw Error("'name' must be the header value for the first column");
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

/**
 * Returns the number of samples in a biom file.
 *
 * @param parsed_biom
 * @return {number} The number of samples in the biom file.
 */
fn.parsed_biom.num_samples = function (parsed_biom) {
  return parsed_biom.meta.fields.length - 1;
};

/**
 * Returns the names of the samples in the biom file.
 *
 * @param parsed_biom
 * @return {Array} names of fields
 */
fn.parsed_biom.sample_names = function (parsed_biom) {
  var fields = fn.obj.deep_copy(parsed_biom.meta.fields);
  fields.shift();

  return fields;
};

/**
 * For each leaf, returns an array of counts across all samples.
 *
 * @param parsed_biom
 * @return {Object} "leaf name" => [s1_count, s2_count, ...]
 */
fn.parsed_biom.counts_for_each_leaf = function (parsed_biom) {
  var counts = {};

  parsed_biom.data.forEach(function (count_data) {
    var leaf_name = null;
    fn.obj.each(count_data, function (field, value) {
      if (field === "name") {
        leaf_name         = value;
        counts[leaf_name] = [];
      }
      else {
        counts[leaf_name].push(value);
      }
    });
  });

  return counts;
};

/**
 * Gives the names of each non-zero count sample for each leaf.
 *
 * @param parsed_biom
 * @return {Object}
 */
fn.parsed_biom.non_zero_samples_for_each_leaf = function (parsed_biom) {
  var obj = {};

  parsed_biom.data.forEach(function (count_data) {
    var leaf_name = null;
    fn.obj.each(count_data, function (field, value) {
      if (field === "name") {
        leaf_name      = value;
        obj[leaf_name] = [];
      }
      else if (value !== 0) {
        obj[leaf_name].push(field);
      }
    });
  });

  return obj;
};

/**
 * It gives mean abundance across samples for each leaf.
 *
 * @param parsed_biom
 * @param keep_zero_counts Pass true if you want mean across all samples.  Pass false if you want mean across samples with count > 0.
 * @return {Object}
 */
fn.parsed_biom.abundance_across_samples_for_each_leaf = function (parsed_biom, keep_zero_counts) {
  var counts    = {};
  var abundance = {};

  parsed_biom.data.forEach(function (count_data) {
    var leaf_name = null;
    fn.obj.each(count_data, function (field, value) {
      if (field === "name") {
        leaf_name         = value;
        counts[leaf_name] = [];
      }
      else if (keep_zero_counts || value > 0) {
        counts[leaf_name].push(value);
      }
    });

    fn.obj.each(counts, function (leaf, counts) {
      abundance[leaf] = fn.ary.mean(counts);
    });
  });

  return abundance;
};

/**
 * It gives evenness across samples for each leaf.
 *
 * @param {Object} counts_for_each_leaf (leaf_name => [s1_count, s2_count, ...)
 * @param keep_zero_counts Pass true if you want evenness across all samples.  Pass false if you want evenness across samples with count > 0.
 * @return {Object} an object like so: leaf_name => evenness
 */
fn.parsed_biom.evenness_across_samples_for_each_leaf = function (counts_for_each_leaf, keep_zero_counts) {
  var obj = {};

  fn.obj.each(counts_for_each_leaf, function (leaf, count_vals) {
    var counts = null;
    if (keep_zero_counts) {
      counts = count_vals;
    }
    else {
      counts = fn.ary.filter_out_zeros(count_vals);
    }

    obj[leaf] = fn.diversity.evenness_entropy(counts);
  });

  return obj;
};

/**
 * Returns the zero replacement value for this data set.
 *
 * If there is a count that is less than global.ZERO_REPLACEMENT_VALUE, then return half of that count.  Else return global.ZERO_REPLACEMENT_VALUE.
 *
 * This is used to move zero counts slightly away from zero so that we can calculate area and centroid of all triangles later.
 *
 * @param counts_for_each_leaf
 * @return {number} zero replacement value
 */
fn.parsed_biom.zero_replacement_val = function (counts_for_each_leaf) {
  var zero_replacement_val = global.ZERO_REPLACEMENT_VAL;

  fn.obj.each(counts_for_each_leaf, function (leaf, counts) {
    counts.forEach(function (count) {
      if (0 < count && count < zero_replacement_val) {
        zero_replacement_val = count;
      }
    });
  });

  if (zero_replacement_val === global.ZERO_REPLACEMENT_VAL) {
    return zero_replacement_val;
  }
  else {
    return zero_replacement_val / 2;
  }
};

/**
 * Returns a new count obj with zeros replaced by appropiate non-zero replacement value.
 *
 * @param counts_for_each_leaf
 * @return {Object} e.g., leaf_name => [s1_count, s2_count]
 */
fn.parsed_biom.replace_zeros = function (counts_for_each_leaf) {
  // First get the zero replacement value.
  var zero_replacement_val = fn.parsed_biom.zero_replacement_val(counts_for_each_leaf);

  var new_counts = {};

  // Then replace the zeros
  fn.obj.each(counts_for_each_leaf, function (leaf, counts) {
    new_counts[leaf] = counts.map(function (count) {
      if (count === 0) {
        return zero_replacement_val;
      }
      else {
        return count;
      }
    });
  });

  return new_counts;
};


/**
 * Returns an array of sample angles (in degrees) for each sample in the biom file.
 *
 * If the angle offset makes the last angles go over 360, they will be modulo 360 to get back under 360.
 *
 * @param num_samples
 * @param angle_offset offset the starting angle by this number of degrees
 * @return {Array} e.g., [0, 90, 180, 270] for 4 samples
 * @throws {Error} if num_samples === 0
 */
fn.parsed_biom.sample_angles = function (num_samples, angle_offset) {
  if (num_samples === 0) {
    throw Error("num_samples cannot be zero");
  }

  if (angle_offset === undefined) {
    angle_offset = 0;
  }

  var angle  = 360 / num_samples;
  var angles = [];

  for (var i = 0; i < num_samples; ++i) {
    var new_angle = (i * angle + angle_offset) % 360;

    angles.push(new_angle);
  }

  return angles;
};

/**
 * Converts counts to points on the unit circle for each leaf.
 *
 * @param counts_for_each_leaf
 * @param num_samples
 * @return {Object} e.g., leaf_name => [s1_point, s2_point, ...]
 */
fn.parsed_biom.points = function (counts_for_each_leaf, num_samples) {
  // First get an array where the zeros are replaced.
  var new_counts    = fn.parsed_biom.replace_zeros(counts_for_each_leaf);
  var sample_angles = fn.parsed_biom.sample_angles(num_samples);

  var obj = {};

  fn.obj.each(new_counts, function (leaf, counts) {
    var max_count = fn.ary.max(counts);
    obj[leaf]     = counts.map(function (count, sample_idx) {
      var angle     = sample_angles[sample_idx];
      var rel_count = count / max_count;

      return fn.pt.on_circle(fn.math.degrees_to_radians(angle), rel_count);
    });
  });

  return obj;
};

/**
 * Returns all origin triangles for each leaf given pints_for_each_leaf.
 *
 * An origin triangle is just two points because the origin is implicit.
 *
 * @param points_for_each_leaf
 * @return {Object} e.g., leaf_name => [[p1, p2], [p2, p3], [p3, p1]]
 */
fn.parsed_biom.origin_triangles_for_each_leaf = function (points_for_each_leaf) {
  var obj = {};

  fn.obj.each(points_for_each_leaf, function (leaf, pts) {
    obj[leaf] = fn.pt.origin_triangles(pts);
  });

  return obj;
};

/**
 * Given an array of origin triangles, get the centroids.
 *
 * @param origin_triangles e.g., [[p1, p2], [p2, p3], [p3, p1]]
 * @return {Array} centroids e.g., [fn.pt.new(...), fn.pt.new(...), ...]
 */
fn.parsed_biom.centroids_of_origin_triangles = function (origin_triangles) {
  return origin_triangles.map(function (origin_triangle) {
    var p1 = origin_triangle[0];
    var p2 = origin_triangle[1];

    return fn.pt.centroid_origin_triangle(p1, p2);
  });
};

/**
 * Given origin triangles for each leaf, return the centroids of all origin triangles for each leaf.
 *
 * @param origin_triangles_for_each_leaf
 * @return {Object} e.g., leaf_name => [centroid, centroid, ...]
 */
fn.parsed_biom.all_centroids = function (origin_triangles_for_each_leaf) {
  var obj = {};

  fn.obj.each(origin_triangles_for_each_leaf, function (leaf, triangles) {
    obj[leaf] = fn.parsed_biom.centroids_of_origin_triangles(triangles);
  });

  return obj;
};

/**
 * Takes an array of origin triangles and gives the area for each of them.
 *
 * @param origin_triangles e.g., [[p1, p2], [p2, p3], [p3, p1]]
 * @return {number} area of triangle (abs val of signed area)
 */
fn.parsed_biom.areas_of_origin_triangles = function (origin_triangles) {
  return origin_triangles.map(function (origin_triangle) {
    var p1 = origin_triangle[0];
    var p2 = origin_triangle[1];

    return Math.abs(fn.pt.signed_area_origin_triangle(p1, p2));
  });
};

/**
 * Given origin triangles for each leaf, return the areas of all origin triangles for each leaf.
 *
 * @param origin_triangles_for_each_leaf
 * @return {Object} e.g., leaf_name => [area, area, ...]
 */
fn.parsed_biom.all_areas = function (origin_triangles_for_each_leaf) {
  var obj = {};

  fn.obj.each(origin_triangles_for_each_leaf, function (leaf, triangles) {
    obj[leaf] = fn.parsed_biom.areas_of_origin_triangles(triangles);
  });

  return obj;
};

/**
 * Gives the centroid off the whole abundance shape.
 *
 * Weights the centroid of each individual origin triangle by the area, adds all that up then divideds by the total area.
 *
 * @param all_areas
 * @param all_centroids
 * @return {Object} leaf_name => centroid
 */
fn.parsed_biom.centroids_of_whole_shape = function (all_areas, all_centroids) {
  var obj = {};

  fn.obj.each(all_areas, function (leaf, areas) {
    var centroids = all_centroids[leaf];

    if (areas.length !== centroids.length) {
      throw Error("Length mismatch between areas and lengths.");
    }

    var weighted_centroid_x = 0;
    var weighted_centroid_y = 0;
    var total_area          = 0;

    areas.forEach(function (area, idx) {
      var centroid = centroids[idx];

      weighted_centroid_x += area * centroid.x;
      weighted_centroid_y += area * centroid.y;

      total_area += area;
    });

    var new_centroid_x = weighted_centroid_x / total_area;
    var new_centroid_y = weighted_centroid_y / total_area;

    obj[leaf] = fn.pt.new(new_centroid_x, new_centroid_y);
  });

  return obj;
};

/**
 * Return the angle from the origin to the centroid for each leaf.
 *
 * @param centroids_of_whole_shape
 * @return {Object} leaf_name => angle (in degrees, can be negative)
 */
fn.parsed_biom.angles_from_origin_to_centroid = function (centroids_of_whole_shape) {
  var obj = {};

  fn.obj.each(centroids_of_whole_shape, function (leaf, centroid) {
    var angle = fn.math.radians_to_degrees(Math.atan2(centroid.y, centroid.x));

    if (angle < 0) {
      // If the angle is negative, flip it around the circle to get a positive angle.
      obj[leaf] = angle + 360;
    }
    else {
      obj[leaf] = angle;
    }
  });

  return obj;
};

/**
 * Gives approximate starting colors based on average values for chroma and lightness for each sample.
 *
 * @param sample_names
 * @param sample_angles
 * @returns {Object} sample_name => color_hex_code
 */
fn.parsed_biom.approx_starting_colors = function (sample_names, sample_angles) {
  var obj = {};

  sample_angles.map(function (angle, idx) {
    var name = sample_names[idx];

    var starting_color = fn.color.approx_starting_color(angle);

    obj[name] = starting_color;
  });

  return obj;
};

fn.parsed_biom.sample_color_legend_tsv = function (approx_starting_colors) {
  var sample_legend = ["name\tappoximate starting color"];

  fn.obj.each(approx_starting_colors, function (sample, color) {
    sample_legend.push([sample, color].join("\t"));
  });

  return sample_legend.join("\n");
};

/**
 * Return an object with all the info you need for working with the parsed biom.
 *
 * @param params Object with keys: biom_str, replace_zeros (replace zero counts with small value), keep_zero_counts (mean across all samples).
 * @return {Object}
 */
fn.parsed_biom.new = function (params) {
  var biom_str         = params.biom_str;
  var replace_zeros    = params.replace_zeros;
  var keep_zero_counts = params.keep_zero_counts;
  var angle_offset     = params.angle_offset;

  var obj = {};

  // Include the params
  obj.params = {
    biom_str: biom_str,
    replace_zeros: replace_zeros,
    keep_zero_counts: keep_zero_counts,
    angle_offset: angle_offset
  };

  obj.parsed_biom = fn.parsed_biom.parse_biom_file_str(biom_str);

  obj.num_samples   = fn.parsed_biom.num_samples(obj.parsed_biom);
  obj.sample_names  = fn.parsed_biom.sample_names(obj.parsed_biom);
  obj.sample_angles = fn.parsed_biom.sample_angles(obj.num_samples, angle_offset);

  obj.counts_for_each_leaf                   = fn.parsed_biom.counts_for_each_leaf(obj.parsed_biom);
  obj.non_zero_samples_for_each_leaf         = fn.parsed_biom.non_zero_samples_for_each_leaf(obj.parsed_biom);
  obj.abundance_across_samples_for_each_leaf = fn.parsed_biom.abundance_across_samples_for_each_leaf(obj.parsed_biom, keep_zero_counts);

  obj.evenness_across_samples_for_each_leaf = fn.parsed_biom.evenness_across_samples_for_each_leaf(obj.counts_for_each_leaf, keep_zero_counts);

  obj.zero_replacement_val = fn.parsed_biom.zero_replacement_val(obj.counts_for_each_leaf);

  obj.points = fn.parsed_biom.points(obj.counts_for_each_leaf, obj.num_samples);

  obj.origin_triangles_for_each_leaf = fn.parsed_biom.origin_triangles_for_each_leaf(obj.points);

  obj.all_areas     = fn.parsed_biom.all_areas(obj.origin_triangles_for_each_leaf);
  obj.all_centroids = fn.parsed_biom.all_centroids(obj.origin_triangles_for_each_leaf);

  obj.centroids_of_whole_shape = fn.parsed_biom.centroids_of_whole_shape(obj.all_areas, obj.all_centroids);

  obj.angles_from_origin_to_centroid = fn.parsed_biom.angles_from_origin_to_centroid(obj.centroids_of_whole_shape);

  return obj;
};