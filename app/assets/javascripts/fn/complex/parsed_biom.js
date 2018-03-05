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
 * Gives the names of all leaves in the biom file.
 *
 * @param parsed_biom The output from parse_biom_file_str
 * @return {Array}
 */
fn.parsed_biom.leaf_names = function (parsed_biom) {
  var leaf_names = [];
  parsed_biom.data.forEach(function (data_row) {
    leaf_names.push(data_row.name);
  });

  return leaf_names;
};

/**
 * Returns the number of samples in a biom file.
 *
 * @param parsed_biom The output from parse_biom_file_str
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
 * Gives the angle for each leaf when there is only a single sample in the biom file.
 *
 * It's meant to be used for hue angles.  It is analagous to angles_from_origin_to_centroid for when the biom file has only a single sample.
 *
 * @param leaf_names
 * @param sample_angles In this case the length should be one.
 * @return {Object} leaf_name => angle
 * @throws {Error} if the length of sample angles > 1
 */
fn.parsed_biom.angles_from_single_sample_biom = function (leaf_names, sample_angles) {
  if (sample_angles.length > 1) {
    throw Error("samples_angles.length > 1");
  }

  var obj = {};

  leaf_names.forEach(function (leaf_name) {
    obj[leaf_name] = sample_angles[0];
  });

  return obj;
};

/**
 * Gives sample angles for each leaf in a two sample biom file.
 *
 * @param sample_angles
 * @param counts_for_each_leaf
 * @return {Object} leaf_name => sample_angle
 */
fn.parsed_biom.angles_from_two_sample_biom = function (sample_angles, counts_for_each_leaf) {
  if (sample_angles.length !== 2) {
    throw Error("samples_angles.length !== 2 (was " + sample_angles.length + ")");
  }

  fn.obj.each(counts_for_each_leaf, function (leaf, sample_counts) {
    if (sample_counts.length !== 2) {
      throw Error("leaf " + leaf + " did not have two sample counts");
    }
  });

  var angles = {};

  fn.obj.each(counts_for_each_leaf, function (leaf_name, counts) {
    var s1_count = counts[0];
    var s2_count = counts[1];

    var s1_angle = sample_angles[0];
    var s2_angle = sample_angles[1];

    if (s1_count >= s2_count) {
      angles[leaf_name] = s1_angle;
    }
    else {
      angles[leaf_name] = s2_angle;
    }
  });

  return angles;
};


/**
 * Gives approximate starting colors based on average values for chroma and lightness for each sample.
 *
 * @param sample_names
 * @param sample_angles
 * @return {Object} sample_name => color_hex_code
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

/**
 * Makes the sample color legend tsv.
 *
 * @param approx_starting_colors
 * @return {string} tsv sample legend
 */
fn.parsed_biom.sample_color_legend_tsv = function (approx_starting_colors) {
  var sample_legend = ["name\tappoximate starting color"];

  fn.obj.each(approx_starting_colors, function (sample, color) {
    sample_legend.push([sample, color].join("\t"));
  });

  return sample_legend.join("\n");
};

/**
 * Makes the sample color legend html string.
 *
 * @param sample_color_legend_tsv
 * @return {string} an html string of the sample starting color legend
 */
fn.parsed_biom.sample_color_legend_html = function (sample_color_legend_tsv) {
  var rows = fn.str.chomp(sample_color_legend_tsv).split("\n").map(function (row, row_idx) {
    function is_header_row(row_idx) {
      return row_idx === 0;
    }

    var fields = row.split("\t");

    var tag = is_header_row(row_idx) ? "th" : "td";

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
    "</style>";

  var table = fn.html.tag("table", rows);
  var body  = fn.html.tag("body", table);
  var head  = fn.html.tag("head", style_str + fn.html.tag("title", "Sample legend"));

  return "<!DOCTYPE html>" + head + body + "</html>";
};

// TODO everything from here down needs specs

/**
 * Return an object with all the info you need for working with the parsed biom.
 *
 * @param params Object with keys: biom_str, replace_zeros (replace zero counts with small value), keep_zero_counts (mean across all samples).
 * @return {Object}
 */
fn.parsed_biom.new = function (params) {
  var biom_str         = params.biom_str;
  var keep_zero_counts = params.keep_zero_counts;
  var angle_offset     = params.angle_offset;

  var obj = {};

  // Include the params
  obj.params = {
    biom_str: biom_str,
    keep_zero_counts: keep_zero_counts,
    angle_offset: angle_offset
  };

  obj.parsed_biom = fn.parsed_biom.parse_biom_file_str(biom_str);

  obj.leaf_names = fn.parsed_biom.leaf_names(obj.parsed_biom);
  obj.num_leaves = obj.leaf_names.length;

  obj.num_samples   = fn.parsed_biom.num_samples(obj.parsed_biom);
  obj.sample_names  = fn.parsed_biom.sample_names(obj.parsed_biom);
  obj.sample_angles = fn.parsed_biom.sample_angles(obj.num_samples, angle_offset);

  obj.approx_starting_colors   = fn.parsed_biom.approx_starting_colors(obj.sample_names, obj.sample_angles);
  obj.sample_color_legend_tsv  = fn.parsed_biom.sample_color_legend_tsv(obj.approx_starting_colors);
  obj.sample_color_legend_html = fn.parsed_biom.sample_color_legend_html(obj.sample_color_legend_tsv);

  obj.counts_for_each_leaf           = fn.parsed_biom.counts_for_each_leaf(obj.parsed_biom);
  obj.non_zero_samples_for_each_leaf = fn.parsed_biom.non_zero_samples_for_each_leaf(obj.parsed_biom);

  obj.abundance_across_samples_for_each_leaf = fn.parsed_biom.abundance_across_samples_for_each_leaf(obj.parsed_biom, keep_zero_counts);
  obj.evenness_across_samples_for_each_leaf  = fn.parsed_biom.evenness_across_samples_for_each_leaf(obj.counts_for_each_leaf, keep_zero_counts);

  obj.zero_replacement_val = fn.parsed_biom.zero_replacement_val(obj.counts_for_each_leaf);

  obj.points = fn.parsed_biom.points(obj.counts_for_each_leaf, obj.num_samples);

  if (obj.num_samples === 1) {
    obj.angles_from_origin_to_centroid = fn.parsed_biom.angles_from_single_sample_biom(obj.leaf_names, obj.sample_angles);
  }
  else if (obj.num_samples === 2) {
    obj.angles_from_origin_to_centroid = fn.parsed_biom.angles_from_two_sample_biom(obj.sample_angles, obj.counts_for_each_leaf);
  }
  else {
    obj.origin_triangles_for_each_leaf = fn.parsed_biom.origin_triangles_for_each_leaf(obj.points);

    obj.all_areas     = fn.parsed_biom.all_areas(obj.origin_triangles_for_each_leaf);
    obj.all_centroids = fn.parsed_biom.all_centroids(obj.origin_triangles_for_each_leaf);

    obj.centroids_of_whole_shape = fn.parsed_biom.centroids_of_whole_shape(obj.all_areas, obj.all_centroids);

    obj.angles_from_origin_to_centroid = fn.parsed_biom.angles_from_origin_to_centroid(obj.centroids_of_whole_shape);
  }

  var return_value  = fn.parsed_biom.colors("TODO");
  obj.colors        = return_value.colors;
  obj.color_details = return_value.color_details;

  return obj;
};


/**
 * Thingy!
 *
 * @param fully_parsed_biom
 * @param opts
 * @return {{color_hex_codes: {}, color_details: {}}}
 */
fn.parsed_biom.colors = function (fully_parsed_biom, opts) {
  /**
   * Return the passed in opt or the default if that opt was not passed in.
   *
   * @param opt The option you want, e.g., "lightness_min"
   * @return Either the default for that opt or the passed in option.
   * @throws {Error} if there is no default value for the requested option
   */
  function opt_or_default(opt) {
    var defaults = {
      lightness_min: 30,
      lightness_max: 90,
      lightness_reversed: false,

      chroma_min: 0,
      chroma_max: 100,
      chroma_reversed: false,

      evenness_absolute: false,

      correct_luminance: false
    };

    if (defaults[opt] === undefined) {
      throw Error("There is no defualt value for opt: " + opt);
    }

    return opts[opt] === undefined ? defaults[opt] : opts[opt];
  }


  var opt_lightness_min      = opt_or_default("lightness_min");
  var opt_lightness_max      = opt_or_default("lightness_max");
  var opt_lightness_reversed = opt_or_default("lightness_reversed");

  var opt_chroma_min      = opt_or_default("chroma_min");
  var opt_chroma_max      = opt_or_default("chroma_max");
  var opt_chroma_reversed = opt_or_default("chroma_reversed");

  var opt_evenness_absolute = opt_or_default("evenness_absolute");

  var opt_correct_luminance = opt_or_default("correct_luminance");

  // Get min and max evenness (for scaling)
  if (opt_evenness_absolute) {
    var evenness_min = 0;
    var evenness_max = 1;
  }
  else {
    var evenness_vals = fn.obj.vals(fully_parsed_biom.evenness_across_samples_for_each_leaf);
    var evenness_min  = fn.ary.min(evenness_vals);
    var evenness_max  = fn.ary.max(evenness_vals);
  }

  // Get min and max abundance vals (for scaling)
  var abundance_vals = fn.obj.vals(fully_parsed_biom.abundance_across_samples_for_each_leaf);
  var abundance_min  = fn.ary.min(abundance_vals);
  var abundance_max  = fn.ary.max(abundance_vals);

  var color_hex_codes    = {};
  var color_details      = {};
  var all_lightness_vals = [];
  var all_luminance_vals = [];

  obj.leaf_names.forEach(function (leaf_name, leaf_idx) {
    var evenness_val  = obj.evenness_across_samples_for_each_leaf[leaf_name];
    var abundance_val = obj.abundance_across_samples_for_each_leaf[leaf_name];
    var hue_angle     = obj.angles_from_origin_to_centroid[leaf_name];

    var hue_val = hue_angle;

    if (opt_chroma_reversed) {
      // Swap the new min and new max to reverse the scale
      var chroma_val = fn.math.scale(evenness_val, evenness_min, evenness_max, opt_chroma_max, opt_chroma_min);
    }
    else {
      var chroma_val = fn.math.scale(evenness_val, evenness_min, evenness_max, opt_chroma_min, opt_chroma_max);
    }

    if (opt_lightness_reversed) {
      // Swap the new min and new max to reverse the scale
      var lightness_val = fn.math.scale(abundance_val, abundance_min, abundance_max, opt_lightness_max, opt_lightness_min);
    }
    else {
      var lightness_val = fn.math.scale(abundance_val, abundance_min, abundance_max, opt_lightness_min, opt_lightness_max);
    }

    color_details[leaf_name].hue       = hue_val;
    color_details[leaf_name].chroma    = chroma_val;
    color_details[leaf_name].lightness = lightness_val;
    all_lightness_vals.push(lightness_val);

    var hcl = chroma.hcl(hue_val, chroma_val, lightness_val);

    all_luminance_vals.push(hcl.luminance());

    color_hex_codes[leaf_name] = hcl.hex();
  });

  if (opt_correct_luminance) {
    var corrected_color_hex_codes = {};

    var luminance_min = fn.ary.min(all_luminance_vals);
    var luminance_max = fn.ary.max(all_luminance_vals);

    var lightness_min = fn.ary.min(all_lightness_vals);
    var lightness_max = fn.ary.max(all_lightness_vals);

    fn.obj.each(color_hex_codes, function (leaf_name, hex_code) {
      var old_luminance = chroma.hex(hex_code).luminance();
      var new_hex_code  = fn.math.scale(old_luminance, luminance_min, luminance_max, lightness_min, lightness_max);

      corrected_color_hex_codes[leaf_name] = new_hex_code;
    });

    return { color_hex_codes: corrected_color_hex_codes, color_details: color_details };
  }
  else {
    return { color_hex_codes: color_hex_codes, color_details: color_details };
  }
};

// TODO needs to know if dimension reduction was done.
fn.parsed_biom.leaf_color_legend_tsv = function (TODO) {
  return TODO;
};

fn.parsed_biom.leaf_color_legend_html = function (leaf_color_legend_tsv) {
  return leaf_color_legend_tsv;
};


