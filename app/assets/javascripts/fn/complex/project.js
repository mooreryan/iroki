fn.project = {};


fn.project.project = function (M, type, cutoff) {
  var M_centered = fn.lalolib.center_matrix(M);

  var svd = fn.lalolib.svd(M_centered);
};

fn.project.reduce_dimension = function (biom_str, type, cutoff) {

};