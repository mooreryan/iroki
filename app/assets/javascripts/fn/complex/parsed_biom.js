// Depends on fn.utils fn.color fn.str fn.html biom

// Parsed biom
fn.parsed_biom.sample_angles = function (parsed_biom, angle_offset) {
  var fields      = fn.parsed_biom.sample_fields(parsed_biom);
  var num_samples = fields.length;

  var sample_angles = fields.map(function (field, idx) {
    return fn.math.radians_to_degrees(biom.sample_to_angle(idx, num_samples, angle_offset));
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

fn.parsed_biom.abundance_across = function (parsed_biom, avg_method) {
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

    // TODO when does this happen, when a leaf has all zero counts?
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

// Returns info on non zero samples.  If there is only one, return that sample name.
fn.parsed_biom.non_zero_count_samples = function (parsed_biom) {
  var obj = {};

  parsed_biom.data.forEach(function (counts) {
    var leaf_name              = "";
    var non_zero_count_samples = [];
    fn.obj.each(counts, function (field, count) {
      if (field === "name") {
        leaf_name = count;
      }
      else if (count !== 0) {
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
};
