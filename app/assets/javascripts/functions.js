var fn         = {}; // function
fn.ary         = {}; // array
fn.color       = {}; // dealing with chroma api and colors
fn.diversity   = {};
fn.html        = {};
fn.math        = {};
fn.parsed_biom = {}; // dealing with the Papa parsed biom string
fn.pt          = {}; // point
fn.str         = {};
fn.utils       = {};

fn.ary._throw_if_empty = function (ary) {
  if (ary.length === 0) {
    throw Error("Can't take max of empty array.");
  }
};

fn.ary.deep_copy = function (ary) {
  return JSON.parse(JSON.stringify(ary));
};

fn.ary.max = function (ary) {
  fn.ary._throw_if_empty(ary);

  return ary.reduce(function (a, b) {
    return Math.max(a, b);
  });
};

fn.ary.min = function (ary) {
  fn.ary._throw_if_empty(ary);

  return ary.reduce(function (a, b) {
    return Math.min(a, b);
  });
};

fn.ary.sum = function (ary) {
  fn.ary._throw_if_empty(ary);

  return ary.reduce(function (a, b) {
    return a + b;
  }, 0);
};

// lightness values should run from 0 to 100
fn.color.correct_luminance = function (hex, lightness, old_min, old_max, new_min, new_max) {
  if (lightness < 0 || lightness > 100) {
    throw Error("Lightness should be between 0 and 100.  Got: " + lightness);
  }

  var new_luminance = fn.math.scale(lightness, old_min, old_max, new_min, new_max);

  return chroma.hex(hex).luminance(new_luminance);
};

// Take a hue angle 0-360, and spit out an approx starting color as a hex code.
fn.color.approx_starting_color = function (hue) {
  var chroma_val = 60,
      lightness  = 60;

  return chroma.hcl(hue, chroma_val, lightness).hex();
};

fn.diversity.shannon_entropy = function (ary) {
  // First convert counts to proportions
  var ary_sum = fn.ary.sum(ary);

  return -fn.ary.sum(ary.map(function (val) {
    if (val === 0) {
      return 0;
    }
    else {
      var proportion = val / ary_sum;

      return proportion * Math.log2(proportion);
    }
  }));
};

fn.diversity.shannon_diversity = function (ary) {
  return Math.pow(2, fn.diversity.shannon_entropy(ary));
};

fn.diversity.evenness_entropy = function (ary) {
  var ary_len = ary.length;
  if (ary_len === 0) {
    throw Error("ary len must be > 0");
  }
  else if (ary_len === 1) {
    return 1;
  }
  else {
    var shannon_max = Math.log2(ary.length);

    return fn.diversity.shannon_entropy(ary) / shannon_max;
  }
};

fn.diversity.evenness_diversity = function (ary) {
  var shannon_max = ary.length;

  return fn.diversity.shannon_diversity(ary) / shannon_max;
};

// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round
fn.math.round = function (number, precision) {
  var factor            = Math.pow(10, precision);
  var tempNumber        = number * factor;
  var roundedTempNumber = Math.round(tempNumber);
  return roundedTempNumber / factor;
};

fn.html.tag = function (tag, str, attr) {
  if (attr !== undefined) {
    return "<" + tag + " " + attr + ">" + str + "</" + tag + ">";
  }
  else {
    return "<" + tag + ">" + str + "</" + tag + ">";
  }
};

fn.math.scale = function (val, old_min, old_max, new_min, new_max) {
  // This can happen if you use the mean across non-zero samples.
  if (old_max - old_min === 0) {
    // TODO better default value than this?
    return (new_min + new_max) / 2;
  }
  else {
    return ((((new_max - new_min) * (val - old_min)) / (old_max - old_min)) + new_min);
  }
};

// Parsed biom
fn.parsed_biom.sample_angles = function (parsed_biom, angle_offset) {
  var fields      = fn.parsed_biom.sample_fields(parsed_biom);
  var num_samples = fields.length;

  var sample_angles = fields.map(function (field, idx) {
    return rad_to_deg(sample_to_angle(idx, num_samples, angle_offset));
  });

  // Don't use an object in case there are duplicated sample names in the biom file.
  return [fields, sample_angles];
};

// Returns the sample fields.
fn.parsed_biom.sample_fields = function (parsed_biom) {
  var fields = [];

  parsed_biom.meta.fields.forEach(function (field) {
    if (fn.utils.is_sample_field(field)) {
      fields.push(field);
    }
  });

  return fields;
};

fn.parsed_biom.num_real_samples = function (parsed_biom) {
  var num_fake_samples = 0;
  parsed_biom.meta.fields.forEach(function (field) {
    if (field === "name" || fn.utils.is_fake_field(field)) {
      num_fake_samples += 1;
    }
  });

  return parsed_biom.meta.fields.length - num_fake_samples;
};

fn.parsed_biom.rel_abundance = function (parsed_biom, avg_method) {
  var abundance      = {};
  var abundance_vals = [];

  parsed_biom.data.forEach(function (leaf_row) {
    var counted_samples = 0;
    var leaf            = null;
    var count           = null;

    // Fields will be name, sample 1, sample 2, ...
    json_each(leaf_row, function (field, val) {
      var count_this_value = val > 0 || avg_method === g_ID_AVG_METHOD_ALL_SAMPLES_MEAN;

      if (field === "name") {
        leaf            = val;
        abundance[leaf] = 0;
      }
      else if (count_this_value) {
        count = val;
        abundance[leaf] += count;
        counted_samples += 1;
      }
    });

    if (counted_samples > 0) {
      abundance[leaf] /= counted_samples;
    } // else it will still be 0

    abundance_vals.push(abundance[leaf]);
  });

  var min_abundance_val = fn.ary.min(abundance_vals);
  var max_abundance_val = fn.ary.max(abundance_vals);

  return {
    abundance : abundance,
    min_val : min_abundance_val,
    max_val : max_abundance_val
  };
};

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

// Pt
fn.pt.is_zero = function (pt) {
  return pt.x === 0 && pt.y === 0;
};

fn.pt.mag = function (pt) {
  return Math.sqrt(Math.pow(pt.x, 2) + Math.pow(pt.y, 2));
};

fn.pt.new = function (x, y) {
  return { x : x, y : y };
};

fn.pt.to_s = function (pt) {
  return "(" + fn.math.round(pt.x, 2) + ", " + fn.math.round(pt.y, 2) + ")";
};

fn.str.chomp = function (str) {
  return str.replace(/\r?\n?$/, "");
};

fn.utils.is_fake_field = function (field) {
  return field.match(/iroki_fake_[12]/);
};

fn.utils.is_sample_field = function (field) {
  return field !== "name" && !fn.utils.is_fake_field(field);
};