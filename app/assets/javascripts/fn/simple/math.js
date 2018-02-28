// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/log2
// See https://stackoverflow.com/questions/28296928/why-does-math-log10-work-on-some-systems-but-return-undefined-on-others
fn.math.log2 = Math.log2 || function (x) {
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

fn.math.degrees_to_radians = function (deg) {
  return deg / 180 * Math.PI;
};

fn.math.radians_to_degrees = function (rad) {
  return rad * 180 / Math.PI;
};

function utils__deg_to_rad(deg) {
  return deg / 180 * Math.PI;
}


function utils__rad_to_deg(rad) {
  return rad * 180 / Math.PI;
}

function utils__round_to(x, place) {
  return Math.round(place * x) / place;
}

function round_to(x, place) {
  return Math.round(place * x) / place;
}


