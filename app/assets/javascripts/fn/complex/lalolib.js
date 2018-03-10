fn.lalolib     = {}; // These interact with the LALOLib structures directly.
fn.lalolib.svd = {}; // For dealing with SVD

/**
 * Applies the func to each col in the Matrix M.
 *
 * @param M a lalolib Matrix
 * @param func a function that takes a column of values
 * @return returns either a Matrix with the function applied or a FloatArray if the func returns a single value for each column.
 * @throws {Error} if M is not a LALOLib matrix.
 */
fn.lalolib.apply_to_cols = function (M, func) {
  if (lalolib.type(M) !== "matrix") {
    throw Error("the type for M should be matrix, got: " + M.type());
  }

  var ncols = M.n;

  var new_ary = fn.ary.range(ncols).map(function (col_idx) {
    var col = lalolib.getCols(M, [col_idx]);

    return func(col);
  });

  var new_mat = lalolib.array2mat(new_ary);

  if (lalolib.type(new_mat) === "matrix") {
    return lalolib.transposeMatrix(new_mat);
  }
  else if (lalolib.type(new_mat) === "vector") {
    return new_mat;
  }
  else {
    throw Error("Wrong type for M.  Expected matrix or vector, got: " + lalolib.type(M));
  }
};

/**
 * Centers the matrix columnwise.  I.e., subtracts column means from each column.
 *
 * @param M
 * @return {Object} LALOLib matrix with columns centered.
 * @throws {Error} if M is not a matrix
 */
fn.lalolib.center_matrix = function (M) {
  return fn.lalolib.apply_to_cols(M, fn.ary.center);
};

/**
 * Gives the non-zero singular values for the svd object.
 *
 * @param svd
 * @param zero_cutoff Any number above this will be treated as non-zero, e.g., global.ZERO_REPLACEMENT_VAL
 * @returns {Array} LALOLib snazzy array with non zero singular values
 */
fn.lalolib.svd.non_zero_singular_values = function (svd, zero_cutoff) {
  function is_not_zero(val) {
    return val >= zero_cutoff;
  }

  var num_sing_vals      = svd.s.length;
  var non_zero_sing_vals = [];

  fn.ary.range(num_sing_vals).forEach(function (idx) {
    var sing_val = svd.s[idx];

    if (is_not_zero(sing_val)) {
      non_zero_sing_vals.push(sing_val);
    }
  });

  return lalolib.array2mat(non_zero_sing_vals);
};

/**
 * Returns the variance explained for each singular value.
 *
 * @param svd
 * @return {Array} LALOLib FloatArray, each entry is the variance explained associated with that singular value.
 */
fn.lalolib.svd.variance_explained = function (svd) {
  var sum_of_squares = 0;

  svd.s.forEach(function (sing_val) {
    sum_of_squares += Math.pow(sing_val, 2);
  });

  var variance_explained = svd.s.map(function (sing_val) {
    return Math.pow(sing_val, 2) / sum_of_squares * 100;
  });

  return variance_explained;
};

/**
 * Returns the cumulative for each singular value.
 *
 * @param svd
 * @return {Array} LALOLib FloatArray, each entry is the cumulative variance explained by that singular value and all those below it.
 */

fn.lalolib.svd.cumulative_variance = function (svd) {
  var variance_explained = fn.lalolib.svd.variance_explained(svd);
  var cum_variance       = 0;

  return variance_explained.map(function (variance) {
    cum_variance += variance;

    return cum_variance;
  });
};

fn.lalolib.svd.keep_X_percent_of_variance = function (non_zero_sing_vals, percent_variance_to_keep) {

};

fn.lalolib.svd.svd = function (M, center) {
  var the_matrix = center ? fn.lalolib.center_matrix(M) : M;

  return lalolib.svd(the_matrix, "thinU");
};
