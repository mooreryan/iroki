// Depends on fn.math, and lalolib

fn.pt.helper = {};

fn.pt.helper.throw_if_any_are_zero = function (pts) {
  pts.forEach(function (pt) {
    if (fn.pt.is_zero(pt)) {
      throw Error("pt: " + fn.pt.to_s(pt) + " was zero.");
    }
  });
};

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
  return { x: x, y: y };
};

// Takes angle in radians.  Gives a point on the circle with given radius.
fn.pt.on_circle = function (angle, radius) {
  return fn.pt.new(radius * Math.cos(angle), radius * Math.sin(angle));
};

fn.pt.to_s = function (pt) {
  return "(" + fn.math.round(pt.x, 2) + ", " + fn.math.round(pt.y, 2) + ")";
};

fn.pt.signed_area_of_triangle = function (p1, p2, p3) {
  // Let the triangle go through the plane at z = 1
  var z = 1;

  // Embed the triangle in 3D space
  var ary    = [[p1.x, p2.x, p3.x], [p1.y, p2.y, p3.y], [z, z, z]];
  var matrix = lalolib.array2mat(ary);

  // The signed area of a triangle is 1/2 the determinant of the above matrix.
  return 0.5 * lalolib.det(matrix);
};

// Take a triangle through two points and the origin.  Get the signed area of that triangle.  Based off of the determint formula above.
fn.pt.signed_area_origin_triangle = function (p1, p2) {
  fn.pt.helper.throw_if_any_are_zero([p1, p2]);

  return 0.5 * (p1.x * p2.y - p2.x * p1.y);
};

// Given two points, draw a triangle through then and the origin.  Get the centroid of that.
fn.pt.centroid_origin_triangle = function (p1, p2) {
  fn.pt.helper.throw_if_any_are_zero([p1, p2]);

  var x = (p1.x + p2.x) / 3;
  var y = (p1.y + p2.y) / 3;

  return fn.pt.new(x, y);
};

fn.pt.origin_triangles = function (pts) {
  var num_points       = pts.length;
  if (num_points < 2) {
    throw Error("Not enough points.  Need at least two.");
  }

  var idx              = 0;
  var origin_triangles = [];
  var p1               = null, p2 = null;

  for (idx = 0; idx < num_points - 1; ++idx) {
    p1 = pts[idx];
    p2 = pts[idx + 1];

    origin_triangles.push([p1, p2]);
  }

  p1 = pts[idx];
  p2 = pts[0];

  origin_triangles.push([p1, p2]);

  return origin_triangles;
};