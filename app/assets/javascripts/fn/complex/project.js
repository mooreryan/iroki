fn.project = {};

fn.project.center_matrix = function (M) {
  if (M.type())
  return fn.lalolib.apply_to_cols(M, fn.ary.center);
}


fn.project.project = function (ary, type, cutoff) {

};

fn.project.reduce_dimension = function (biom_str, type, cutoff) {

};