// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/log2
// See https://stackoverflow.com/questions/28296928/why-does-math-log10-work-on-some-systems-but-return-undefined-on-others
fn.math.log2 = Math.log2 || function(x) {
  return Math.log(x) * Math.LOG2E;
};

// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round
fn.math.round = function (number, precision) {
  var factor            = Math.pow(10, precision);
  var tempNumber        = number * factor;
  var roundedTempNumber = Math.round(tempNumber);
  return roundedTempNumber / factor;
};

fn.math.scale = function (val, old_min, old_max, new_min, new_max) {
  // This can happen if you use the mean across non-zero samples.
  if (old_max - old_min === 0) {
    // TODO better default value than this?
    return (new_min + new_max) / 2;
  }
  else {
    return ((((new_max - new_min) * (val - old_min)) / (old_max - old_min)) + new_min);
  }
};
