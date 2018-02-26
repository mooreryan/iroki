// Depends on fn.math

// Pt
fn.pt.is_zero = function (pt) {
  return pt.x === 0 && pt.y === 0;
};

fn.pt.mag = function (pt) {
  return Math.sqrt(Math.pow(pt.x, 2) + Math.pow(pt.y, 2));
};

fn.pt.new = function (x, y) {
  return { x : x, y : y };
};

fn.pt.to_s = function (pt) {
  return "(" + fn.math.round(pt.x, 2) + ", " + fn.math.round(pt.y, 2) + ")";
};
