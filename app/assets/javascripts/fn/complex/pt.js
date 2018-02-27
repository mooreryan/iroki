// Depends on fn.math

// Pt
fn.pt.is_equal = function (pt1, pt2, tolerance) {
  return Math.abs(pt1.x - pt2.x) < tolerance && Math.abs(pt1.y - pt2.y) < tolerance;
};

fn.pt.is_zero = function (pt) {
  return pt.x === 0 && pt.y === 0;
};

fn.pt.mag = function (pt) {
  return Math.sqrt(Math.pow(pt.x, 2) + Math.pow(pt.y, 2));
};

fn.pt.new = function (x, y) {
  return { x : x, y : y };
};

// Takes angle in radians.  Gives a point on the circle with given radius.
fn.pt.on_circle = function (angle, radius) {
  return fn.pt.new(radius * Math.cos(angle), radius * Math.sin(angle));
};

fn.pt.to_s = function (pt) {
  return "(" + fn.math.round(pt.x, 2) + ", " + fn.math.round(pt.y, 2) + ")";
};
