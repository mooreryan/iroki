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
 * @param scale Whether to scale the matrix to unit variance
 * @return {Matrix}
 */
fn.project.project_with_variance_cutoff = function (M, variance_cutoff, scale) {
  var svd = fn.lalolib.svd.svd(M, true, scale);

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
 * @param scale Whether to scale the matrix to unit variance
 * @return {Matrix}
 */
fn.project.project_with_num_pcs_cutoff = function (M, num_pcs_to_keep, scale) {
  var svd = fn.lalolib.svd.svd(M, true, scale);

  var pca_scores = fn.lalolib.svd.pca_scores(svd);

  var num_cols = pca_scores.n;
  if (num_pcs_to_keep > num_cols) {
    return fn.lalolib.first_n_cols(pca_scores, num_cols);
  }
  else {
    return fn.lalolib.first_n_cols(pca_scores, num_pcs_to_keep);
  }
};

/**
 *  * Pretty much like project_with_num_pcs_cutoff except that it differs in return value and always gives 2d projection.
 *
 * Mainly just used in the phylo disp.

 * @param M
 * @param scale
 * @returns {{proj_mat: Array, var_exp: *[]}}
 */
fn.project.project_2d_ret_var_exp = function (M, scale) {
  var num_pcs_to_keep = 2;
  var proj_mat;
  var svd = fn.lalolib.svd.svd(M, true, scale);

  var pca_scores = fn.lalolib.svd.pca_scores(svd);

  var num_cols = pca_scores.n;
  if (num_pcs_to_keep > num_cols) {
    proj_mat = fn.lalolib.first_n_cols(pca_scores, num_cols);
  }
  else {
    proj_mat = fn.lalolib.first_n_cols(pca_scores, num_pcs_to_keep);
  }

  var variance_explained = fn.lalolib.svd.variance_explained(svd);
  // TODO might blow up if passed 1d M
  var var_ary = variance_explained.slice(0, num_pcs_to_keep);

  return { proj_mat: fn.lalolib.mat2array(proj_mat), var_exp: var_ary}
};

/**
 * Return a 1D projection of the samples in PC space.
 *
 * The output is scaled from 0 to 1 for use in the chroma.js color scale functions.
 *
 * @param M
 * @param scale Whether to scale the matrix to unit variance
 * @returns {Matrix}
 */
fn.project.projection_samples_1d = function (M, scale) {
  // TODO make sure that the input M has the same order as the leaves.
  var svd = fn.lalolib.svd.svd(M, true, scale);

  // TODO this won't always work as unlike R, we have the full svd.
  var scores = fn.lalolib.scale_cols_from_0_to_1(lalolib.mul(svd.V, svd.S));

  return fn.lalolib.first_n_cols(scores, 1);
};

/**
 * Return a 1D projection of leaves in PC space.
 *
 * The output is scaled from 0 to 1 for use in the chroma.js color scale functions.
 *
 * @param M
 * @param scale Whether to scale the matrix to unit variance
 * @returns {Object}
 */
fn.project.projection_leaves_1d = function (M, scale) {
  return fn.lalolib.scale_cols_from_0_to_1(fn.project.project_with_num_pcs_cutoff(M, 1, scale));
};
