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
    throw Error("the type for M should be matrix, got: " + lalolib.type(M));
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
    throw Error("Wrong type for M.  Expected matrix or vector, got: " + lalolib.type(new_mat));
  }
};

fn.lalolib.scale_columns = function (M, new_min, new_max) {
  var func = function (vals) {
    var old_min = fn.ary.min(vals);
    var old_max = fn.ary.max(vals);


    return vals.map(function (val) {
      return fn.math.scale(val, old_min, old_max, new_min, new_max);
    });
  };

  return fn.lalolib.apply_to_cols(M, func);
};

/**
 * Returns a new lalolib Matrix with only the number of columns selected.
 *
 * Use this to take only a certain number of PC's from the SVD, for example.
 *
 * @param M
 * @param num_cols_to_take
 * @return {Matrix} This matrix will have the same number of rows as M, and num_cols_to_take number of columns.
 * @throws {Error} if num_cols_to_take > actual number of columns.
 */
fn.lalolib.first_n_cols = function (M, num_cols_to_take) {
  /**
   * Entries are stored rowwise in a single vector.  This is the accessor.
   *
   * @param M
   * @param ridx Row index
   * @param cidx Column index
   * @return The value at ridx, cidx
   * @throws {Error} If ridx is out of bounds.
   * @throws {Error} If cidx is out of bounds.
   */
  function get_val(M, ridx, cidx) {
    var num_rows = M.m;
    var num_cols = M.n;

    if (ridx >= num_rows) {
      throw Error("ridx was " + ridx + " but there are only " + num_rows + " rows.");
    }
    if (cidx >= num_rows) {
      throw Error("cidx was " + cidx + " but there are only " + num_cols + " columns.");
    }

    return M.val[ridx * num_cols + cidx];
  }

  /**
   * Entries are stored rowwise in a single vector.  This is the setter.
   *
   * @param M
   * @param ridx Row index
   * @param cidx Column index
   * @param val The value you want to set at ridx, cidx
   * @throws {Error} If ridx is out of bounds.
   * @throws {Error} If cidx is out of bounds.
   */
  function set_val(M, ridx, cidx, val) {
    var num_rows = M.m;
    var num_cols = M.n;

    if (ridx >= num_rows) {
      throw Error("ridx was " + ridx + " but there are only " + num_rows + " rows.");
    }
    if (cidx >= num_rows) {
      throw Error("cidx was " + cidx + " but there are only " + num_cols + " columns.");
    }

    M.val[ridx * num_cols + cidx] = val;
  }

  var num_rows = M.m;
  var num_cols = M.n;

  if (num_cols_to_take > num_cols) {
    throw Error("num_cols_to_take (" + num_cols_to_take + ") is greater than actual number of columns (" + num_cols + ")");
  }

  // Get a new matrix of zero vals.
  var new_M = new lalolib.Matrix(num_rows, num_cols_to_take);

  // Fill in the values.
  for (var i = 0; i < num_rows; ++i) {
    for (var j = 0; j < num_cols_to_take; ++j) {
      var val = get_val(M, i, j);
      set_val(new_M, i, j, val);
    }
  }

  return new_M;
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

/**
 * Returns just enough singular values to get at least as much variance as requested.
 *
 * @param svd
 * @param percent_to_keep Keep at least this much percentage of the variance (from 0 - 100).
 *
 * @returns {Array} lalolib array with singular values
 */
fn.lalolib.svd.keep_X_percent_of_variance = function (svd, percent_to_keep) {
  var cum_variance = fn.lalolib.svd.cumulative_variance(svd);
  var sing_vals    = [];

  for (var i = 0; i < cum_variance.length; ++i) {
    if (cum_variance[i] > percent_to_keep) {
      sing_vals.push(svd.s[i]);
      break;
    }
    else {
      sing_vals.push(svd.s[i]);
    }
  }

  return lalolib.array2mat(sing_vals);
};

/**
 * Calculate PCA "scores".
 *
 * @param svd
 * @return {Object} a lalolib matrix of pca scores.
 */
fn.lalolib.svd.pca_scores = function (svd) {
  return lalolib.mul(svd.U, svd.S);
};

/**
 * Scale the PCA scores so that they start at 0.
 *
 * @param pca_scores
 * @return {Object} lalolib matrix of scaled pca scores.
 */
fn.lalolib.svd.pca_scores_from_zero = function (pca_scores) {
  /**
   * Make the min value zero, and scale the rest from that.
   *
   * @param vals
   * @return {Array} an array with values scaled from zero
   */
  var func = function (vals) {
    var min_val = Math.abs(fn.ary.min(vals));

    return vals.map(function (val) {
      return val + min_val;
    });
  };

  return fn.lalolib.apply_to_cols(pca_scores, func);
};

/**
 * Calculates the SVD for the given matrix with the option to center the data columnwise first.
 *
 * @param M the matrix
 * @param center pass true if you want to center the values first.
 * @return {*|{U, S, V, s}}
 */
fn.lalolib.svd.svd_old = function (M, center) {
  var the_matrix = center ? fn.lalolib.center_matrix(M) : M;
  var jawn       = lalolib.svd(the_matrix, "thinU");

  return jawn;
};

/**
 * Wrapper for calculating SVD.
 *
 * Will switch to numeric.js implementation of SVD if lalolib's fails.
 *
 * TODO needs specs
 *
 * @param M
 * @param center
 * @return {*}
 */
fn.lalolib.svd.svd = function (M, center) {
  var the_matrix = center ? fn.lalolib.center_matrix(M) : M;

  var svd            = null,
      numeric_matrix = null,
      numeric_svd    = null;

  try {
    svd = lalolib.svd(the_matrix, "thinU");
  }
  catch (error) {
    console.log("lalolib.svd() failed with error: " + error + ".  Trying numeric.svd() instead.");
    var num_rows = the_matrix.m;
    var num_cols = the_matrix.n;

    if (num_rows < num_cols) {
      // We need to transpose it for numeric.svd()
      numeric_matrix = fn.lalolib.mat2array(lalolib.transposeMatrix(the_matrix));
      numeric_svd    = numeric.svd(numeric_matrix);

      // Need to make a fake lalolib svd output object.  Since we need to transpose the matrix, we need to swap V and U matrices so that things will still work later (like pca_scores).
      svd = {
        S: lalolib.array2mat(numeric.diag(numeric_svd.S)),
        U: lalolib.array2mat(numeric_svd.V),
        V: undefined,
        s: lalolib.array2mat(numeric_svd.S)
      };
    }
    else {
      numeric_matrix = fn.lalolib.mat2array(the_matrix);
      numeric_svd    = numeric.svd(numeric_matrix);

      // Need to make a fake lalolib svd output object
      svd = {
        S: lalolib.array2mat(numeric.diag(numeric_svd.S)),
        U: lalolib.array2mat(numeric_svd.U),
        V: undefined,
        s: lalolib.array2mat(numeric_svd.S)
      };
    }
  }

  return svd;
};

/**
 * Converts a lalolib matrix into an array of arrays.
 *
 * Use this when you need to switch to numeric.js
 *
 * TODO needs tests.
 *
 * @param M
 * @return {Array}
 */
fn.lalolib.mat2array = function (M) {
  function get_val(M, ridx, cidx) {
    var num_rows = M.m;
    var num_cols = M.n;

    if (ridx >= num_rows) {
      throw Error("ridx was " + ridx + " but there are only " + num_rows + " rows.");
    }
    if (cidx >= num_cols) {
      throw Error("cidx was " + cidx + " but there are only " + num_cols + " columns.");
    }

    return M.val[ridx * num_cols + cidx];
  }

  var rows = [];
  for (var i = 0; i < M.m; ++i) {
    var row = [];
    for (var j = 0; j < M.n; ++j) {
      row.push(get_val(M, i, j));
    }

    rows.push(row);
  }

  return rows;
};