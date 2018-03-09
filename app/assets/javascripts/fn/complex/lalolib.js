fn.lalolib = {}; // These interact with the LALOLib structures directly.

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