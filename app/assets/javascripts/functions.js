var fn         = {}; // function
fn.ary         = {}; // array
fn.color       = {}; // dealing with chroma api and colors
fn.diversity   = {};
fn.math        = {};
fn.parsed_biom = {}; // dealing with the Papa parsed biom string
fn.pt          = {}; // point

fn.ary.max = function (ary) {
  return ary.reduce(function (a, b) {
    return Math.max(a, b);
  });
};

fn.ary.min = function (ary) {
  return ary.reduce(function (a, b) {
    return Math.min(a, b);
  });
};

fn.ary.sum = function (ary) {
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
  var shannon_max = Math.log2(ary.length);

  return fn.diversity.shannon_entropy(ary) / shannon_max;
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