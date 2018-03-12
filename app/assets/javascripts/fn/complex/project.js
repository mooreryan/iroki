// Depends on fn.lalolib

fn.project = {};

/**
 * Project rows of M into PC space.
 *
 * @param M
 * @return {Object}
 */
fn.project.project = function (M) {
  var svd = fn.lalolib.svd.svd(M, true);

  return fn.lalolib.svd.pca_scores(svd);
};

/**
 * Project rows of M into PC space only keeping a certain amount of variance.
 *
 * @param M
 * @param variance_cutoff We will keep as many PCs as it takes to account for AT LEAST this much variance.  The actual variance accounted for will be greater than or equal to this value.
 * @return {Matrix}
 */
fn.project.project_with_variance_cutoff = function (M, variance_cutoff) {
  var svd = fn.lalolib.svd.svd(M, true);

  // We are automatically selecting the number of singular values to keep based on variance explained.
  var num_singular_values = fn.lalolib.svd.keep_X_percent_of_variance(svd, variance_cutoff).length;

  var pca_scores = fn.lalolib.svd.pca_scores(svd);

  return fn.lalolib.first_n_cols(pca_scores, num_singular_values);
};

/**
 * Project rows of M into PC space only keeping a certain number of PCs.
 *
 * @param M
 * @param num_pcs_to_keep
 * @return {Matrix}
 */
fn.project.project_with_num_pcs_cutoff = function (M, num_pcs_to_keep) {
  var svd = fn.lalolib.svd.svd(M, true);

  var pca_scores = fn.lalolib.svd.pca_scores(svd);

  var num_cols = pca_scores.n;
  if (num_pcs_to_keep > num_cols) {
    return fn.lalolib.first_n_cols(pca_scores, num_cols);
  }
  else {
    return fn.lalolib.first_n_cols(pca_scores, num_pcs_to_keep);
  }
};
