fn.ary._throw_if_empty = function (ary) {
  if (ary.length === 0) {
    throw Error("Can't take max of empty array.");
  }
};

fn.ary.deep_copy = function (ary) {
  return JSON.parse(JSON.stringify(ary));
};

fn.ary.max = function (ary) {
  fn.ary._throw_if_empty(ary);

  return ary.reduce(function (a, b) {
    return Math.max(a, b);
  });
};

fn.ary.min = function (ary) {
  fn.ary._throw_if_empty(ary);

  return ary.reduce(function (a, b) {
    return Math.min(a, b);
  });
};

fn.ary.sum = function (ary) {
  fn.ary._throw_if_empty(ary);

  return ary.reduce(function (a, b) {
    return a + b;
  }, 0);
};
