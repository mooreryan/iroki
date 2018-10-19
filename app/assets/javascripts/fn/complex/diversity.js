// Depends on fn.ary, fn.math

/**
 * @throws if the array is empty
 * @param counts
 * @returns {number}
 */
fn.diversity.shannon_entropy = function (counts) {
  fn.ary._throw_if_empty(counts);

  // First convert counts to proportions
  var ary_sum = fn.ary.sum(counts);

  return -fn.ary.sum(counts.map(function (val) {
    if (val === 0) {
      return 0;
    }
    else {
      var proportion = val / ary_sum;

      return proportion * fn.math.log2(proportion);
    }
  }));
};

/**
 * This is evenness calculated from the shannon entropy.
 *
 * @note If the array is empty, then the evenness entropy is set to 0.
 * @note If the array sums to 0, then it is set to 1.
 *
 * @todo not sure how to handle negative counts here
 *
 * @param counts
 * @returns {number}
 */
fn.diversity.evenness_entropy = function (counts) {
  var ary_len = counts.length;
  if (ary_len === 0) {
    throw Error("ary len must be > 0");
  }
  else if (ary_len === 1) {
    return 1;
  }
  else {
    var sum = fn.ary.sum(counts);

    if (sum === 0) {
      return 1;
    }
    else {
      var shannon_max = fn.math.log2(counts.length);

      return fn.diversity.shannon_entropy(counts) / shannon_max;
    }
  }
};

// fn.diversity.shannon_diversity = function (counts) {
//   return Math.pow(2, fn.diversity.shannon_entropy(counts));
// };

// fn.diversity.evenness_diversity = function (counts) {
//   var shannon_max = counts.length;
//
//   return fn.diversity.shannon_diversity(counts) / shannon_max;
// };
