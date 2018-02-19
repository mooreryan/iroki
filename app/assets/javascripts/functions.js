var fn = {};
fn.ary = {};
fn.math = {};

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

fn.ary.shannon = function (ary) {
  // First convert counts to proportions
  var ary_sum = fn.ary.sum(ary);

  return - fn.ary.sum(ary.map(function (val) {
    var proportion = val / ary_sum;

    return proportion * Math.log2(proportion);
  }));
};

fn.ary.evenness = function(ary) {
  var shannon_max = Math.log2(ary.length);

  return fn.ary.shannon(ary) / shannon_max;
};

// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round
fn.math.round = function(number, precision) {
  var factor = Math.pow(10, precision);
  var tempNumber = number * factor;
  var roundedTempNumber = Math.round(tempNumber);
  return roundedTempNumber / factor;
};