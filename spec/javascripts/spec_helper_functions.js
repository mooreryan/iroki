var spec_helper = {
  TOLERANCE: 1e-3,
  BIOM_STR: "name\ts1\ts2\napple\t10\t0\npie\t0\t10\n",
  PAPA_CONFIG: {
    delimiter: "\t",
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true
  },
  SINGLE_SAMPLE_BIOM_STR: "name\tsample_1\ngeode\t5\nclock\t1\ntire\t2\nbanana\t9\neggplant\t10",
  SINGLE_SAMPLE_APPROX_START_COLORS: "name\tappoximate starting color\nsample_1\t#ed5e93\n",
  SINGLE_SAMPLE_APPROX_START_COLORS_HTML: "<!DOCTYPE html><head><style>table, th, td {border: 1px solid #2d2d2d; border-collapse: collapse} th, td {padding: 5px} th {text-align: left; border-bottom: 4px solid #2d2d2d} .thick-right-border {border-right: 3px solid #2d2d2d}.thick-left-border {border-left: 3px solid #2d2d2d}</style><title>Sample legend</title></head><body><table><tr><th class='thick-right-border'>name</th><th>appoximate starting color</th></tr><tr><td class='thick-right-border'>sample_1</td><td style='background-color: #ed5e93;'>#ed5e93</td></tr></table></body></html>",

  TWO_SAMPLE_BIOM_STR: "name\tsample_1\tsample_2\ngeode\t5\t5\nclock\t1\t10\ntire\t2\t9\nbanana\t9\t2\neggplant\t10\t1",
  THREE_SAMPLE_BIOM_STR: "name\tsample_1\tsample_2\tsample_3\ngeode\t25\t40\t50\nclock\t10\t15\t94\ntire\t5\t8\t80\nbanana\t100\t140\t11\neggplant\t90\t130\t14"
};

spec_helper.PARSED_BIOM = Papa.parse(spec_helper.BIOM_STR, spec_helper.PAPA_CONFIG);

spec_helper.expect_stringify_equal = function (actual, expected) {
  expect(JSON.stringify(actual)).to.equal(JSON.stringify(expected));
};

spec_helper.expect_points_to_be_equal = function (pt1, pt2) {
  expect(fn.pt.is_equal(pt1, pt2, 1e-6)).to.be.true;
};

spec_helper.single_sample = {};

spec_helper.single_sample.BIOM_STR = "name\tsample_1\ngeode\t5\nclock\t1\ntire\t2\nbanana\t9\neggplant\t10";

spec_helper.single_sample.PARSED_BIOM = Papa.parse(spec_helper.single_sample.BIOM_STR, spec_helper.PAPA_CONFIG);

spec_helper.single_sample.NON_ZERO_COUNT_SAMPLES = {
  geode: "sample_1",
  clock: "sample_1",
  tire: "sample_1",
  banana: "sample_1",
  eggplant: "sample_1"
};

spec_helper.single_sample.POINTS = {
  geode: {
    sample_1: fn.pt.new(1, 0)
  },
  clock: {
    sample_1: fn.pt.new(1, 0)
  },
  tire: {
    sample_1: fn.pt.new(1, 0)
  },
  banana: {
    sample_1: fn.pt.new(1, 0)
  },
  eggplant: {
    sample_1: fn.pt.new(1, 0)
  }
};

spec_helper.single_sample.CENTROIDS = {
  geode: fn.pt.new(1, 0),
  clock: fn.pt.new(1, 0),
  tire: fn.pt.new(1, 0),
  banana: fn.pt.new(1, 0),
  eggplant: fn.pt.new(1, 0)
};

//// TWO SAMPLES ////

spec_helper.two_samples = {};

spec_helper.two_samples.BIOM_STR = "name\tsample_1\tsample_2\ngeode\t5\t5\nclock\t1\t10\ntire\t2\t9\nbanana\t9\t2\neggplant\t10\t1\n";

spec_helper.two_samples.PARSED_BIOM = Papa.parse(spec_helper.two_samples.BIOM_STR, spec_helper.PAPA_CONFIG);

spec_helper.two_samples.NON_ZERO_COUNT_SAMPLES = {
  geode: "many",
  clock: "many",
  tire: "many",
  banana: "many",
  eggplant: "many"
};

spec_helper.two_samples.POINTS = {
  geode: {
    sample_1: fn.pt.new(0.5, 0),
    sample_2: fn.pt.new(-0.5, 0)
  },
  clock: {
    sample_1: fn.pt.new(0.1, 0),
    sample_2: fn.pt.new(-1, 0)
  },
  tire: {
    sample_1: fn.pt.new(0.2, 0),
    sample_2: fn.pt.new(-0.9, 0)
  },
  banana: {
    sample_1: fn.pt.new(0.9, 0),
    sample_2: fn.pt.new(-0.2, 0)
  },
  eggplant: {
    sample_1: fn.pt.new(1, 0),
    sample_2: fn.pt.new(-0.1, 0)
  }
};

spec_helper.two_samples.CENTROIDS = {
  geode: fn.pt.new(0, 0),
  clock: fn.pt.new(-0.45, 0),
  tire: fn.pt.new(-0.35, 0),
  banana: fn.pt.new(0.35, 0),
  eggplant: fn.pt.new(0.45, 0)
};

//// THREE SAMPLES ////
spec_helper.three_samples = {};

spec_helper.three_samples.BIOM_STR = "name\tsample_1\tsample_2\tsample_3\ngeode\t5\t5\t5\nclock\t1\t5\t10\ntire\t5\t1\t10\nbanana\t10\t1\t5\neggplant\t10\t5\t1\n";

spec_helper.three_samples.PARSED_BIOM = Papa.parse(spec_helper.three_samples.BIOM_STR, spec_helper.PAPA_CONFIG);

spec_helper.three_samples.NON_ZERO_COUNT_SAMPLES = {
  geode: "many",
  clock: "many",
  tire: "many",
  banana: "many",
  eggplant: "many"
};

spec_helper.three_samples.SAMPLE_ANGLES = {
  sample_1: 0,
  sample_2: 2 * Math.PI / 3, // 120 deg
  sample_3: 4 * Math.PI / 3  // 240 deg
};

spec_helper.three_samples.REL_ABUND_ACROSS_SAMPLES = {
  geode: {
    sample_1: 1,
    sample_2: 1,
    sample_3: 1
  },
  clock: {
    sample_1: 0.1,
    sample_2: 0.5,
    sample_3: 1
  },
  tire: {
    sample_1: 0.5,
    sample_2: 0.1,
    sample_3: 1
  },
  banana: {
    sample_1: 1,
    sample_2: 0.1,
    sample_3: 0.5
  },
  eggplant: {
    sample_1: 1,
    sample_2: 0.5,
    sample_3: 0.1
  }
};

spec_helper.three_samples.POINTS = {};

fn.obj.each(spec_helper.three_samples.REL_ABUND_ACROSS_SAMPLES, function (leaf, rel_counts) {
  spec_helper.three_samples.POINTS[leaf] = {};

  fn.obj.each(rel_counts, function (sample, rel_count) {
    var angle = spec_helper.three_samples.SAMPLE_ANGLES[sample];

    spec_helper.three_samples.POINTS[leaf][sample] = fn.pt.on_circle(angle, rel_count);
  });
});

spec_helper.three_samples.CENTROIDS = {
  geode: centroid_of_triangle(spec_helper.three_samples.POINTS.geode.sample_1, spec_helper.three_samples.POINTS.geode.sample_2, spec_helper.three_samples.POINTS.geode.sample_3),
  clock: centroid_of_triangle(spec_helper.three_samples.POINTS.clock.sample_1, spec_helper.three_samples.POINTS.clock.sample_2, spec_helper.three_samples.POINTS.clock.sample_3),
  tire: centroid_of_triangle(spec_helper.three_samples.POINTS.tire.sample_1, spec_helper.three_samples.POINTS.tire.sample_2, spec_helper.three_samples.POINTS.tire.sample_3),
  banana: centroid_of_triangle(spec_helper.three_samples.POINTS.banana.sample_1, spec_helper.three_samples.POINTS.banana.sample_2, spec_helper.three_samples.POINTS.banana.sample_3),
  eggplant: centroid_of_triangle(spec_helper.three_samples.POINTS.eggplant.sample_1, spec_helper.three_samples.POINTS.eggplant.sample_2, spec_helper.three_samples.POINTS.eggplant.sample_3)
};

//// SIX SAMPLES WITH ZEROS ////

spec_helper.six_samples = {};

spec_helper.six_samples.BIOM_STR = "name\ts1\ts2\ts3\ts4\ts5\ts6\n4___13\t0\t1\t1\t0\t1\t1\n4___5\t1\t1\t0\t1\t0\t1";

spec_helper.six_samples.PARSED_BIOM = Papa.parse(spec_helper.six_samples.BIOM_STR, spec_helper.PAPA_CONFIG);

spec_helper.six_samples.NON_ZERO_COUNT_SAMPLES = {
  "4___13": "many",
  "4___5": "many"
};

spec_helper.six_samples.SAMPLE_ANGLES = {
  s1: 0,
  s2: Math.PI / 3,     // 60 deg
  s3: 2 * Math.PI / 3, // 120 deg
  s4: Math.PI,         // 180 deg
  s5: 4 * Math.PI / 3, // 240 deg
  s6: 5 * Math.PI / 3  // 300 deg
};

spec_helper.six_samples.REL_ABUND_ACROSS_SAMPLES = {
  "4___13": {
    s1: 0,
    s2: 1,
    s3: 1,
    s4: 0,
    s5: 1,
    s6: 1
  },
  "4___5": {
    s1: 1,
    s2: 1,
    s3: 0,
    s4: 1,
    s5: 0,
    s6: 1
  }
};

spec_helper.six_samples.POINTS = {};

fn.obj.each(spec_helper.six_samples.REL_ABUND_ACROSS_SAMPLES, function (leaf, rel_counts) {
  spec_helper.six_samples.POINTS[leaf] = {};

  fn.obj.each(rel_counts, function (sample, rel_count) {
    var angle = spec_helper.six_samples.SAMPLE_ANGLES[sample];

    spec_helper.six_samples.POINTS[leaf][sample] = fn.pt.on_circle(angle, rel_count);
  });
});


spec_helper.six_samples.weights_4_13 = [global.ZERO_REPLACEMENT_VAL, 1, 1, global.ZERO_REPLACEMENT_VAL, 1, 1];
spec_helper.six_samples.weights_4_5  = [1, 1, global.ZERO_REPLACEMENT_VAL, 1, global.ZERO_REPLACEMENT_VAL, 1];
spec_helper.six_samples.THETAS       = [0, Math.PI / 3, 2 * Math.PI / 3, Math.PI, 4 * Math.PI / 3, 5 * Math.PI / 3];

spec_helper.six_samples.POINTS_SIMPLE = {
  "4___13": spec_helper.six_samples.weights_4_13.map(function (weight, idx) {
    var theta = spec_helper.six_samples.THETAS[idx];
    var x     = weight * Math.cos(theta);
    var y     = weight * Math.sin(theta);

    return fn.pt.new(x, y);
  }),
  "4___5": spec_helper.six_samples.weights_4_5.map(function (weight, idx) {
    var theta = spec_helper.six_samples.THETAS[idx];
    var x     = weight * Math.cos(theta);
    var y     = weight * Math.sin(theta);

    return fn.pt.new(x, y);
  })
};

spec_helper.tmp = null;
spec_helper.i   = 0;

spec_helper.six_samples.SIGNED_AREAS = {
  "4___13": [
    0.5 * (
      spec_helper.six_samples.POINTS_SIMPLE["4___13"][0].x * spec_helper.six_samples.POINTS_SIMPLE["4___13"][1].y +
      spec_helper.six_samples.POINTS_SIMPLE["4___13"][1].x * spec_helper.six_samples.POINTS_SIMPLE["4___13"][0].y),
    0.5 * (
      spec_helper.six_samples.POINTS_SIMPLE["4___13"][1].x * spec_helper.six_samples.POINTS_SIMPLE["4___13"][2].y +
      spec_helper.six_samples.POINTS_SIMPLE["4___13"][2].x * spec_helper.six_samples.POINTS_SIMPLE["4___13"][1].y),
    0.5 * (
      spec_helper.six_samples.POINTS_SIMPLE["4___13"][2].x * spec_helper.six_samples.POINTS_SIMPLE["4___13"][3].y +
      spec_helper.six_samples.POINTS_SIMPLE["4___13"][3].x * spec_helper.six_samples.POINTS_SIMPLE["4___13"][2].y),
    0.5 * (
      spec_helper.six_samples.POINTS_SIMPLE["4___13"][3].x * spec_helper.six_samples.POINTS_SIMPLE["4___13"][4].y +
      spec_helper.six_samples.POINTS_SIMPLE["4___13"][4].x * spec_helper.six_samples.POINTS_SIMPLE["4___13"][3].y),
    0.5 * (
      spec_helper.six_samples.POINTS_SIMPLE["4___13"][4].x * spec_helper.six_samples.POINTS_SIMPLE["4___13"][5].y +
      spec_helper.six_samples.POINTS_SIMPLE["4___13"][5].x * spec_helper.six_samples.POINTS_SIMPLE["4___13"][4].y),
    0.5 * (
      spec_helper.six_samples.POINTS_SIMPLE["4___13"][5].x * spec_helper.six_samples.POINTS_SIMPLE["4___13"][0].y +
      spec_helper.six_samples.POINTS_SIMPLE["4___13"][0].x * spec_helper.six_samples.POINTS_SIMPLE["4___13"][5].y)
  ],
  "4___5": [
    0.5 * (
      spec_helper.six_samples.POINTS_SIMPLE["4___5"][0].x * spec_helper.six_samples.POINTS_SIMPLE["4___5"][1].y +
      spec_helper.six_samples.POINTS_SIMPLE["4___5"][1].x * spec_helper.six_samples.POINTS_SIMPLE["4___5"][0].y),
    0.5 * (
      spec_helper.six_samples.POINTS_SIMPLE["4___5"][1].x * spec_helper.six_samples.POINTS_SIMPLE["4___5"][2].y +
      spec_helper.six_samples.POINTS_SIMPLE["4___5"][2].x * spec_helper.six_samples.POINTS_SIMPLE["4___5"][1].y),
    0.5 * (
      spec_helper.six_samples.POINTS_SIMPLE["4___5"][2].x * spec_helper.six_samples.POINTS_SIMPLE["4___5"][3].y +
      spec_helper.six_samples.POINTS_SIMPLE["4___5"][3].x * spec_helper.six_samples.POINTS_SIMPLE["4___5"][2].y),
    0.5 * (
      spec_helper.six_samples.POINTS_SIMPLE["4___5"][3].x * spec_helper.six_samples.POINTS_SIMPLE["4___5"][4].y +
      spec_helper.six_samples.POINTS_SIMPLE["4___5"][4].x * spec_helper.six_samples.POINTS_SIMPLE["4___5"][3].y),
    0.5 * (
      spec_helper.six_samples.POINTS_SIMPLE["4___5"][4].x * spec_helper.six_samples.POINTS_SIMPLE["4___5"][5].y +
      spec_helper.six_samples.POINTS_SIMPLE["4___5"][5].x * spec_helper.six_samples.POINTS_SIMPLE["4___5"][4].y),
    0.5 * (
      spec_helper.six_samples.POINTS_SIMPLE["4___5"][5].x * spec_helper.six_samples.POINTS_SIMPLE["4___5"][0].y +
      spec_helper.six_samples.POINTS_SIMPLE["4___5"][0].x * spec_helper.six_samples.POINTS_SIMPLE["4___5"][5].y)
  ]
};

spec_helper.six_samples.TRIANGLE_CENTROIDS = {
  "4___13": [
    fn.pt.new(
      (spec_helper.six_samples.POINTS_SIMPLE["4___13"][0].x + spec_helper.six_samples.POINTS_SIMPLE["4___13"][1].x) / 3,
      (spec_helper.six_samples.POINTS_SIMPLE["4___13"][0].y + spec_helper.six_samples.POINTS_SIMPLE["4___13"][1].y) / 3
    ),
    fn.pt.new(
      (spec_helper.six_samples.POINTS_SIMPLE["4___13"][1].x + spec_helper.six_samples.POINTS_SIMPLE["4___13"][2].x) / 3,
      (spec_helper.six_samples.POINTS_SIMPLE["4___13"][1].y + spec_helper.six_samples.POINTS_SIMPLE["4___13"][2].y) / 3
    ),
    fn.pt.new(
      (spec_helper.six_samples.POINTS_SIMPLE["4___13"][2].x + spec_helper.six_samples.POINTS_SIMPLE["4___13"][3].x) / 3,
      (spec_helper.six_samples.POINTS_SIMPLE["4___13"][2].y + spec_helper.six_samples.POINTS_SIMPLE["4___13"][3].y) / 3
    ),
    fn.pt.new(
      (spec_helper.six_samples.POINTS_SIMPLE["4___13"][3].x + spec_helper.six_samples.POINTS_SIMPLE["4___13"][4].x) / 3,
      (spec_helper.six_samples.POINTS_SIMPLE["4___13"][3].y + spec_helper.six_samples.POINTS_SIMPLE["4___13"][4].y) / 3
    ),
    fn.pt.new(
      (spec_helper.six_samples.POINTS_SIMPLE["4___13"][4].x + spec_helper.six_samples.POINTS_SIMPLE["4___13"][5].x) / 3,
      (spec_helper.six_samples.POINTS_SIMPLE["4___13"][4].y + spec_helper.six_samples.POINTS_SIMPLE["4___13"][5].y) / 3
    ),
    fn.pt.new(
      (spec_helper.six_samples.POINTS_SIMPLE["4___13"][5].x + spec_helper.six_samples.POINTS_SIMPLE["4___13"][0].x) / 3,
      (spec_helper.six_samples.POINTS_SIMPLE["4___13"][5].y + spec_helper.six_samples.POINTS_SIMPLE["4___13"][0].y) / 3
    )
  ],
  "4___5": [
    fn.pt.new(
      (spec_helper.six_samples.POINTS_SIMPLE["4___5"][0].x + spec_helper.six_samples.POINTS_SIMPLE["4___5"][1].x) / 3,
      (spec_helper.six_samples.POINTS_SIMPLE["4___5"][0].y + spec_helper.six_samples.POINTS_SIMPLE["4___5"][1].y) / 3
    ),
    fn.pt.new(
      (spec_helper.six_samples.POINTS_SIMPLE["4___5"][1].x + spec_helper.six_samples.POINTS_SIMPLE["4___5"][2].x) / 3,
      (spec_helper.six_samples.POINTS_SIMPLE["4___5"][1].y + spec_helper.six_samples.POINTS_SIMPLE["4___5"][2].y) / 3
    ),
    fn.pt.new(
      (spec_helper.six_samples.POINTS_SIMPLE["4___5"][2].x + spec_helper.six_samples.POINTS_SIMPLE["4___5"][3].x) / 3,
      (spec_helper.six_samples.POINTS_SIMPLE["4___5"][2].y + spec_helper.six_samples.POINTS_SIMPLE["4___5"][3].y) / 3
    ),
    fn.pt.new(
      (spec_helper.six_samples.POINTS_SIMPLE["4___5"][3].x + spec_helper.six_samples.POINTS_SIMPLE["4___5"][4].x) / 3,
      (spec_helper.six_samples.POINTS_SIMPLE["4___5"][3].y + spec_helper.six_samples.POINTS_SIMPLE["4___5"][4].y) / 3
    ),
    fn.pt.new(
      (spec_helper.six_samples.POINTS_SIMPLE["4___5"][4].x + spec_helper.six_samples.POINTS_SIMPLE["4___5"][5].x) / 3,
      (spec_helper.six_samples.POINTS_SIMPLE["4___5"][4].y + spec_helper.six_samples.POINTS_SIMPLE["4___5"][5].y) / 3
    ),
    fn.pt.new(
      (spec_helper.six_samples.POINTS_SIMPLE["4___5"][5].x + spec_helper.six_samples.POINTS_SIMPLE["4___5"][0].x) / 3,
      (spec_helper.six_samples.POINTS_SIMPLE["4___5"][5].y + spec_helper.six_samples.POINTS_SIMPLE["4___5"][0].y) / 3
    )
  ]

};

for (spec_helper.i = 0; spec_helper.i < 6; ++spec_helper.i) {
  var sum_num_x_4_13 = 0,
      sum_num_y_4_13 = 0,
      sum_num_x_4_5  = 0,
      sum_num_y_4_5  = 0,
      sum_den_4_13   = 0,
      sum_den_4_5    = 0;

  var area_4_13 = spec_helper.six_samples.SIGNED_AREAS["4___13"][spec_helper.i];
  var area_4_5  = spec_helper.six_samples.SIGNED_AREAS["4___5"][spec_helper.i];

  var centroid_4_13 = spec_helper.six_samples.TRIANGLE_CENTROIDS["4___13"][spec_helper.i];
  var centroid_4_5  = spec_helper.six_samples.TRIANGLE_CENTROIDS["4___5"][spec_helper.i];

  sum_num_x_4_13 += area_4_13 * centroid_4_13.x;
  sum_num_y_4_13 += area_4_13 * centroid_4_13.y;
  sum_num_x_4_5 += area_4_5 * centroid_4_5.x;
  sum_num_y_4_5 += area_4_5 * centroid_4_5.y;

  sum_den_4_13 += area_4_13;
  sum_den_4_5 += area_4_5;
}

spec_helper.six_samples.CENTROIDS = {
  "4___13": fn.pt.new(sum_num_x_4_13 / sum_den_4_13, sum_num_y_4_13 / sum_den_4_13),
  "4___5": fn.pt.new(sum_num_x_4_5 / sum_den_4_5, sum_num_y_4_5 / sum_den_4_5)
};

var a = {
  "4___13": {
    "x": -1.068312603546424e-17,
    "y": -8.546500828371392e-17
  }, "4___5": { "x": 0.2666666666666666, "y": 3.2049378106392736e-17 }
};

var b = {
  "4___13": { "x": 0.16667, "y": -0.28867513459481287 },
  "4___5": { "x": 0.5, "y": -0.28867513459481287 }
};


var a = {
  "4___13": { "x": -1.2225622990284e-22, "y": -1.8283663694429529e-16 },
  "4___5": { "x": 0.4999883335333293, "y": 0 }
};

var b = {
  "4___13": { "x": 0.16667, "y": -0.28867513459481287 },
  "4___5": { "x": 0.5, "y": -0.28867513459481287 }
};
