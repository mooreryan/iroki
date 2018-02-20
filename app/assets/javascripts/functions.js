var fn       = {};
fn.ary       = {};
fn.diversity = {};
fn.math      = {};
fn.pt        = {};

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

fn.diversity.shannon = function (ary) {
  // First convert counts to proportions
  var ary_sum = fn.ary.sum(ary);

  return -fn.ary.sum(ary.map(function (val) {
    if (val === 0) {
      return 0;
    }
    else {
      var proportion = val / ary_sum;

      return proportion * Math.log2(proportion);
    }
  }));
};

fn.diversity.evenness = function (ary) {
  var shannon_max = Math.log2(ary.length);

  return fn.diversity.shannon(ary) / shannon_max;
};

// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round
fn.math.round = function (number, precision) {
  var factor            = Math.pow(10, precision);
  var tempNumber        = number * factor;
  var roundedTempNumber = Math.round(tempNumber);
  return roundedTempNumber / factor;
};

fn.pt.is_zero = function (pt) {
  return pt.x === 0 && pt.y === 0;
};

fn.pt.new = function (x, y) {
  return { x : x, y : y };
};