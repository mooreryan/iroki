// Depends on fn.lalolib

fn.project = {};


fn.project.project = function (M, type, variance_cutoff) {
  var svd = fn.lalolib.svd.svd(M, true);

  if (type === "auto") {
    // We are automatically selecting the number of singular values to keep based on variance explained.
    fn.lalolib.svd.keep_X_percent_of_variance(svd, variance_cutoff);
  }
};

fn.project.reduce_dimension = function (biom_str, type, cutoff) {

};

fn.math.scale();

function thing(M) {
  var A = fn.lalolib.apply_to_cols(M, function (vals) {
    var min = fn.ary.min(vals);
    var max = fn.ary.max(vals);

    return vals.map(function (val) {
      return fn.math.scale(val, min, max, 0, 1);
    });
  }); console.log(lalolib.laloprint(A, true));
}
