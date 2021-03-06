// Set window.alert to console logging for all specs.
window.alert = console.log;

var TODO = null;

var spec_helper = {
  TOLERANCE: 1e-3,
  BIOM_STR: "name\ts1\ts2\napple\t10\t0\npie\t0\t10\n",
  PAPA_CONFIG: PAPA_CONFIG, // THis is defined in parse_mapping_file.js
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

spec_helper.two_samples.NUM_SAMPLES  = 2;
spec_helper.two_samples.SAMPLE_NAMES = ["sample_1", "sample_2"];
spec_helper.two_samples.LEAF_NAMES   = ["geode", "clock", "tire", "banana", "eggplant"];
spec_helper.two_samples.COUNTS       = {
  geode: [5, 5],
  clock: [1, 10]
};

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

// spec_helper.three_samples.CENTROIDS = {
//   geode: centroid_of_triangle(spec_helper.three_samples.POINTS.geode.sample_1, spec_helper.three_samples.POINTS.geode.sample_2, spec_helper.three_samples.POINTS.geode.sample_3),
//   clock: centroid_of_triangle(spec_helper.three_samples.POINTS.clock.sample_1, spec_helper.three_samples.POINTS.clock.sample_2, spec_helper.three_samples.POINTS.clock.sample_3),
//   tire: centroid_of_triangle(spec_helper.three_samples.POINTS.tire.sample_1, spec_helper.three_samples.POINTS.tire.sample_2, spec_helper.three_samples.POINTS.tire.sample_3),
//   banana: centroid_of_triangle(spec_helper.three_samples.POINTS.banana.sample_1, spec_helper.three_samples.POINTS.banana.sample_2, spec_helper.three_samples.POINTS.banana.sample_3),
//   eggplant: centroid_of_triangle(spec_helper.three_samples.POINTS.eggplant.sample_1, spec_helper.three_samples.POINTS.eggplant.sample_2, spec_helper.three_samples.POINTS.eggplant.sample_3)
// };

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

//// General test ////
spec_helper.test_case = {};

spec_helper.test_case.BIOM_STR    = "name\ts1\ts2\ts3\ts4\ts5\ts6\napple\t0\t1\t2\t0\t3\t4\npie\t1\t2\t0\t3\t0\t4\n";
spec_helper.test_case.PARSED_BIOM = Papa.parse(fn.str.chomp(spec_helper.test_case.BIOM_STR), spec_helper.PAPA_CONFIG);

spec_helper.test_case.NUM_SAMPLES          = 6;
spec_helper.test_case.SAMPLE_NAMES         = ["s1", "s2", "s3", "s4", "s5", "s6"];
spec_helper.test_case.LEAF_NAMES           = ["apple", "pie"];
spec_helper.test_case.NUM_LEAVES           = 2;
spec_helper.test_case.SAMPLE_ANGLES        = [0, 60, 120, 180, 240, 300];
spec_helper.test_case.ZERO_REPLACEMENT_VAL = global.ZERO_REPLACEMENT_VAL;

spec_helper.test_case.APPROX_STARTING_COLORS = {
  s1: chroma.hcl(0, fn.color.var.approx_starting_chroma, fn.color.var.approx_starting_lightness).hex(),
  s2: chroma.hcl(60, fn.color.var.approx_starting_chroma, fn.color.var.approx_starting_lightness).hex(),
  s3: chroma.hcl(120, fn.color.var.approx_starting_chroma, fn.color.var.approx_starting_lightness).hex(),
  s4: chroma.hcl(180, fn.color.var.approx_starting_chroma, fn.color.var.approx_starting_lightness).hex(),
  s5: chroma.hcl(240, fn.color.var.approx_starting_chroma, fn.color.var.approx_starting_lightness).hex(),
  s6: chroma.hcl(300, fn.color.var.approx_starting_chroma, fn.color.var.approx_starting_lightness).hex()
};

spec_helper.test_case.SAMPLE_COLOR_LEGEND_TSV = "name\tappoximate starting color\ns1\t#ed5e93\ns2\t#d47a33\ns3\t#779d2c\ns4\t#00a98f\ns5\t#00a3ec\ns6\t#9083ed";

spec_helper.test_case.SAMPLE_COLOR_LEGEND_HTML = "<!DOCTYPE html><head><style>table, th, td {border: 1px solid #2d2d2d; border-collapse: collapse} th, td {padding: 5px} th {text-align: left; border-bottom: 4px solid #2d2d2d} .thick-right-border {border-right: 3px solid #2d2d2d}</style><title>Sample legend</title></head><body><table><tr><th class='thick-right-border'>name</th><th>appoximate starting color</th></tr><tr><td class='thick-right-border'>s1</td><td style='background-color: #ed5e93;'>#ed5e93</td></tr><tr><td class='thick-right-border'>s2</td><td style='background-color: #d47a33;'>#d47a33</td></tr><tr><td class='thick-right-border'>s3</td><td style='background-color: #779d2c;'>#779d2c</td></tr><tr><td class='thick-right-border'>s4</td><td style='background-color: #00a98f;'>#00a98f</td></tr><tr><td class='thick-right-border'>s5</td><td style='background-color: #00a3ec;'>#00a3ec</td></tr><tr><td class='thick-right-border'>s6</td><td style='background-color: #9083ed;'>#9083ed</td></tr></table></body></html>";

spec_helper.test_case.COUNTS = {
  apple: [0, 1, 2, 0, 3, 4],
  pie: [1, 2, 0, 3, 0, 4]
};

spec_helper.test_case.COUNT_MATRIX = lalolib.array2mat([
  spec_helper.test_case.COUNTS.apple,
  spec_helper.test_case.COUNTS.pie
]);

// This was checked against R values.  See svd.r
spec_helper.test_case.COUNT_MATRIX_SVD = JSON.parse('{"S":{"length":2,"m":2,"n":2,"size":[2,2],"type":"matrix","val":{"0":3.464101615137754,"1":0,"2":0,"3":0}},"U":{"length":2,"m":2,"n":2,"size":[2,2],"type":"matrix","val":{"0":0.7071067811865475,"1":-0.7071067811865475,"2":-0.7071067811865474,"3":-0.7071067811865474}},"s":{"0":3.464101615137754,"1":0}}');

spec_helper.test_case.COUNT_MATRIX_PCA_SCORES = lalolib.mul(spec_helper.test_case.COUNT_MATRIX_SVD.U, spec_helper.test_case.COUNT_MATRIX_SVD.S);

// The projection will give two singular values.
spec_helper.test_case.PROJECTION = fn.lalolib.first_n_cols(spec_helper.test_case.COUNT_MATRIX_PCA_SCORES, 2);


// These come from scaling the projection by hand
spec_helper.test_case.PROJECTION_LEAVES_1D = lalolib.array2mat([
  [1],
  [0]
]);
spec_helper.test_case.PROJECTION_SAMPLES_1D = lalolib.array2mat([0.3333333333333333, 0.3333333333333333, 0.8333333333333334, 0, 1, 0.5]);

spec_helper.test_case.COUNTS_WITH_ZEROS_REPLACED = {
  apple: [global.ZERO_REPLACEMENT_VAL, 1, 2, global.ZERO_REPLACEMENT_VAL, 3, 4],
  pie: [1, 2, global.ZERO_REPLACEMENT_VAL, 3, global.ZERO_REPLACEMENT_VAL, 4]
};

spec_helper.test_case.NON_ZERO_SAMPLES_FOR_EACH_LEAF = {
  apple: ["s2", "s3", "s5", "s6"],
  pie: ["s1", "s2", "s4", "s6"]
};

spec_helper.test_case.ABUNDANCE_ACROSS_ALL_SAMPLES = {
  apple: (1 + 2 + 3 + 4) / 6,
  pie: (1 + 2 + 3 + 4) / 6
};

spec_helper.test_case.ABUNDANCE_ACROSS_NONZERO_SAMPLES = {
  apple: (1 + 2 + 3 + 4) / 4,
  pie: (1 + 2 + 3 + 4) / 4
};

spec_helper.test_case.EVENNESS_ACROSS_ALL_SAMPLES = {
  apple: 0.7143002438742897,
  pie: 0.7143002438742897
};

spec_helper.test_case.EVENNESS_ACROSS_NONZERO_SAMPLES = {
  apple: 0.9232196723355077,
  pie: 0.9232196723355077
};

// The zeros get mapped to global.ZERO_REPLACEMENT_VAL, then all counts get divided by the max count (4).
spec_helper.test_case.POINTS = {
  apple: [
    fn.pt.on_circle(0, global.ZERO_REPLACEMENT_VAL / 4),
    fn.pt.on_circle(Math.PI / 3, 0.25),
    fn.pt.on_circle(2 * Math.PI / 3, 0.5),
    fn.pt.on_circle(Math.PI, global.ZERO_REPLACEMENT_VAL / 4),
    fn.pt.on_circle(4 * Math.PI / 3, 0.75),
    fn.pt.on_circle(5 * Math.PI / 3, 1)
  ],
  pie: [
    fn.pt.on_circle(0, 0.25),
    fn.pt.on_circle(Math.PI / 3, 0.5),
    fn.pt.on_circle(2 * Math.PI / 3, global.ZERO_REPLACEMENT_VAL / 4),
    fn.pt.on_circle(Math.PI, 0.75),
    fn.pt.on_circle(4 * Math.PI / 3, global.ZERO_REPLACEMENT_VAL / 4),
    fn.pt.on_circle(5 * Math.PI / 3, 1)
  ]
};

spec_helper.test_case.ORIGIN_TRIANGLES = {
  apple: [
    [
      fn.pt.on_circle(0, global.ZERO_REPLACEMENT_VAL / 4),
      fn.pt.on_circle(Math.PI / 3, 0.25),
    ],
    [
      fn.pt.on_circle(Math.PI / 3, 0.25),
      fn.pt.on_circle(2 * Math.PI / 3, 0.5)
    ],
    [
      fn.pt.on_circle(2 * Math.PI / 3, 0.5),
      fn.pt.on_circle(Math.PI, global.ZERO_REPLACEMENT_VAL / 4)
    ],
    [
      fn.pt.on_circle(Math.PI, global.ZERO_REPLACEMENT_VAL / 4),
      fn.pt.on_circle(4 * Math.PI / 3, 0.75)
    ],
    [
      fn.pt.on_circle(4 * Math.PI / 3, 0.75),
      fn.pt.on_circle(5 * Math.PI / 3, 1)
    ],
    [
      fn.pt.on_circle(5 * Math.PI / 3, 1),
      fn.pt.on_circle(0, global.ZERO_REPLACEMENT_VAL / 4)
    ]
  ],
  pie: [
    [
      fn.pt.on_circle(0, 0.25),
      fn.pt.on_circle(Math.PI / 3, 0.5)],
    [
      fn.pt.on_circle(Math.PI / 3, 0.5),
      fn.pt.on_circle(2 * Math.PI / 3, global.ZERO_REPLACEMENT_VAL / 4)
    ],
    [
      fn.pt.on_circle(2 * Math.PI / 3, global.ZERO_REPLACEMENT_VAL / 4),
      fn.pt.on_circle(Math.PI, 0.75)
    ],
    [
      fn.pt.on_circle(Math.PI, 0.75),
      fn.pt.on_circle(4 * Math.PI / 3, global.ZERO_REPLACEMENT_VAL / 4)
    ],
    [
      fn.pt.on_circle(4 * Math.PI / 3, global.ZERO_REPLACEMENT_VAL / 4),
      fn.pt.on_circle(5 * Math.PI / 3, 1)
    ],
    [
      fn.pt.on_circle(5 * Math.PI / 3, 1),
      fn.pt.on_circle(0, 0.25)
    ]
  ]
};


spec_helper.test_case.ALL_CENTROIDS = {
  apple: [
    fn.pt.centroid_origin_triangle(spec_helper.test_case.ORIGIN_TRIANGLES.apple[0][0], spec_helper.test_case.ORIGIN_TRIANGLES.apple[0][1]),
    fn.pt.centroid_origin_triangle(spec_helper.test_case.ORIGIN_TRIANGLES.apple[1][0], spec_helper.test_case.ORIGIN_TRIANGLES.apple[1][1]),
    fn.pt.centroid_origin_triangle(spec_helper.test_case.ORIGIN_TRIANGLES.apple[2][0], spec_helper.test_case.ORIGIN_TRIANGLES.apple[2][1]),
    fn.pt.centroid_origin_triangle(spec_helper.test_case.ORIGIN_TRIANGLES.apple[3][0], spec_helper.test_case.ORIGIN_TRIANGLES.apple[3][1]),
    fn.pt.centroid_origin_triangle(spec_helper.test_case.ORIGIN_TRIANGLES.apple[4][0], spec_helper.test_case.ORIGIN_TRIANGLES.apple[4][1]),
    fn.pt.centroid_origin_triangle(spec_helper.test_case.ORIGIN_TRIANGLES.apple[5][0], spec_helper.test_case.ORIGIN_TRIANGLES.apple[5][1])
  ],
  pie: [
    fn.pt.centroid_origin_triangle(spec_helper.test_case.ORIGIN_TRIANGLES.pie[0][0], spec_helper.test_case.ORIGIN_TRIANGLES.pie[0][1]),
    fn.pt.centroid_origin_triangle(spec_helper.test_case.ORIGIN_TRIANGLES.pie[1][0], spec_helper.test_case.ORIGIN_TRIANGLES.pie[1][1]),
    fn.pt.centroid_origin_triangle(spec_helper.test_case.ORIGIN_TRIANGLES.pie[2][0], spec_helper.test_case.ORIGIN_TRIANGLES.pie[2][1]),
    fn.pt.centroid_origin_triangle(spec_helper.test_case.ORIGIN_TRIANGLES.pie[3][0], spec_helper.test_case.ORIGIN_TRIANGLES.pie[3][1]),
    fn.pt.centroid_origin_triangle(spec_helper.test_case.ORIGIN_TRIANGLES.pie[4][0], spec_helper.test_case.ORIGIN_TRIANGLES.pie[4][1]),
    fn.pt.centroid_origin_triangle(spec_helper.test_case.ORIGIN_TRIANGLES.pie[5][0], spec_helper.test_case.ORIGIN_TRIANGLES.pie[5][1])
  ]
};

spec_helper.test_case.ALL_AREAS = {
  apple: [
    Math.abs(fn.pt.signed_area_origin_triangle(spec_helper.test_case.ORIGIN_TRIANGLES.apple[0][0], spec_helper.test_case.ORIGIN_TRIANGLES.apple[0][1])),
    Math.abs(fn.pt.signed_area_origin_triangle(spec_helper.test_case.ORIGIN_TRIANGLES.apple[1][0], spec_helper.test_case.ORIGIN_TRIANGLES.apple[1][1])),
    Math.abs(fn.pt.signed_area_origin_triangle(spec_helper.test_case.ORIGIN_TRIANGLES.apple[2][0], spec_helper.test_case.ORIGIN_TRIANGLES.apple[2][1])),
    Math.abs(fn.pt.signed_area_origin_triangle(spec_helper.test_case.ORIGIN_TRIANGLES.apple[3][0], spec_helper.test_case.ORIGIN_TRIANGLES.apple[3][1])),
    Math.abs(fn.pt.signed_area_origin_triangle(spec_helper.test_case.ORIGIN_TRIANGLES.apple[4][0], spec_helper.test_case.ORIGIN_TRIANGLES.apple[4][1])),
    Math.abs(fn.pt.signed_area_origin_triangle(spec_helper.test_case.ORIGIN_TRIANGLES.apple[5][0], spec_helper.test_case.ORIGIN_TRIANGLES.apple[5][1]))
  ],
  pie: [
    Math.abs(fn.pt.signed_area_origin_triangle(spec_helper.test_case.ORIGIN_TRIANGLES.pie[0][0], spec_helper.test_case.ORIGIN_TRIANGLES.pie[0][1])),
    Math.abs(fn.pt.signed_area_origin_triangle(spec_helper.test_case.ORIGIN_TRIANGLES.pie[1][0], spec_helper.test_case.ORIGIN_TRIANGLES.pie[1][1])),
    Math.abs(fn.pt.signed_area_origin_triangle(spec_helper.test_case.ORIGIN_TRIANGLES.pie[2][0], spec_helper.test_case.ORIGIN_TRIANGLES.pie[2][1])),
    Math.abs(fn.pt.signed_area_origin_triangle(spec_helper.test_case.ORIGIN_TRIANGLES.pie[3][0], spec_helper.test_case.ORIGIN_TRIANGLES.pie[3][1])),
    Math.abs(fn.pt.signed_area_origin_triangle(spec_helper.test_case.ORIGIN_TRIANGLES.pie[4][0], spec_helper.test_case.ORIGIN_TRIANGLES.pie[4][1])),
    Math.abs(fn.pt.signed_area_origin_triangle(spec_helper.test_case.ORIGIN_TRIANGLES.pie[5][0], spec_helper.test_case.ORIGIN_TRIANGLES.pie[5][1]))
  ]
};

var silly__nx    = 0;
var silly__ny    = 0;
var silly__denom = 0;

for (var i = 0; i < 6; ++i) {
  var centroid = spec_helper.test_case.ALL_CENTROIDS.apple[i];
  var area     = spec_helper.test_case.ALL_AREAS.apple[i];

  silly__nx += area * centroid.x;
  silly__ny += area * centroid.y;
  silly__denom += area;
}
var silly__apple_centroid = fn.pt.new(silly__nx / silly__denom, silly__ny / silly__denom);

silly__nx    = 0;
silly__ny    = 0;
silly__denom = 0;
for (var i = 0; i < 6; ++i) {
  var centroid = spec_helper.test_case.ALL_CENTROIDS.pie[i];
  var area     = spec_helper.test_case.ALL_AREAS.pie[i];

  silly__nx += area * centroid.x;
  silly__ny += area * centroid.y;
  silly__denom += area;
}
var silly__pie_centroid = fn.pt.new(silly__nx / silly__denom, silly__ny / silly__denom);

spec_helper.test_case.CENTROIDS_OF_WHOLE_SHAPE = {
  apple: silly__apple_centroid,
  pie: silly__pie_centroid
};

var silly__val_apple = Math.atan2(silly__apple_centroid.y, silly__apple_centroid.x);
silly__val_apple     = silly__val_apple < 0 ? silly__val_apple + (2 * Math.PI) : silly__val_apple;

var silly__val_pie = Math.atan2(silly__pie_centroid.y, silly__pie_centroid.x);
silly__val_pie     = silly__val_pie < 0 ? silly__val_pie + (2 * Math.PI) : silly__val_pie;

spec_helper.test_case.ANGLES_FROM_ORIGIN_TO_CENTROIDS = {
  apple: fn.math.radians_to_degrees(silly__val_apple),
  pie: fn.math.radians_to_degrees(silly__val_pie)
};


spec_helper.test_case.PARAMS_FOR_NEW = {
  biom_str: spec_helper.test_case.BIOM_STR,
  keep_zero_counts: true,
  angle_offset: 0,
  evenness_absolute: true,
  correct_luminance: true,

  biom_conversion_style: g_ID_BIOM_CONVERSION_STYLE_GEOMETRY
};

spec_helper.test_case.BIOM_WITH_COLORS_TSV = "name\tcolor\thue\tchroma/saturation\tlightness\tcentroid\tevenness\tabundance\ts1\ts2\ts3\ts4\ts5\ts6\napple\t#bfcde3\t274.23\t28.57\t60\t(0.03, -0.4)\t0.71\t1.67\t0\t1\t2\t0\t3\t4\npie\t#d9c6d9\t327\t28.57\t60\t(0.22, -0.14)\t0.71\t1.67\t1\t2\t0\t3\t0\t4";

spec_helper.test_case.BIOM_WITH_COLORS_HTML = "<!DOCTYPE html><head><style>table, th, td {border: 1px solid #2d2d2d; border-collapse: collapse} th, td {padding: 5px} th {text-align: left; border-bottom: 4px solid #2d2d2d} .thick-right-border {border-right: 3px solid #2d2d2d}.thick-left-border {border-left: 3px solid #2d2d2d}</style><title>Color table</title></head><body><table><tbody><tr><th>name</th><th class='thick-right-border'>color</th><th>hue</th><th>chroma/saturation</th><th class='thick-right-border'>lightness</th><th>centroid</th><th>evenness</th><th class='thick-right-border'>abundance</th><th>s1</th><th>s2</th><th>s3</th><th>s4</th><th>s5</th><th>s6</th></tr><tr><td>apple</td><td class='thick-right-border' style='background-color: #bfcde3; color: black;'>#bfcde3</td><td>274.23</td><td>28.57</td><td class='thick-right-border'>60</td><td>(0.03, -0.4)</td><td>0.71</td><td class='thick-right-border'>1.67</td><td>0</td><td>1</td><td>2</td><td>0</td><td>3</td><td>4</td></tr><tr><td>pie</td><td class='thick-right-border' style='background-color: #d9c6d9; color: black;'>#d9c6d9</td><td>327</td><td>28.57</td><td class='thick-right-border'>60</td><td>(0.22, -0.14)</td><td>0.71</td><td class='thick-right-border'>1.67</td><td>1</td><td>2</td><td>0</td><td>3</td><td>0</td><td>4</td></tr></tbody></table></body></html>";

spec_helper.test_case.APPROX_STARTING_COLORS_TSV = "name\tappoximate starting color\ns1\t#ed5e93\ns2\t#d47a33\ns3\t#779d2c\ns4\t#00a98f\ns5\t#00a3ec\ns6\t#9083ed";

spec_helper.test_case.APPROX_STARTING_COLORS_HTML = "<!DOCTYPE html><head><style>table, th, td {border: 1px solid #2d2d2d; border-collapse: collapse} th, td {padding: 5px} th {text-align: left; border-bottom: 4px solid #2d2d2d} .thick-right-border {border-right: 3px solid #2d2d2d}</style><title>Sample legend</title></head><body><table><tr><th class='thick-right-border'>name</th><th>appoximate starting color</th></tr><tr><td class='thick-right-border'>s1</td><td style='background-color: #ed5e93;'>#ed5e93</td></tr><tr><td class='thick-right-border'>s2</td><td style='background-color: #d47a33;'>#d47a33</td></tr><tr><td class='thick-right-border'>s3</td><td style='background-color: #779d2c;'>#779d2c</td></tr><tr><td class='thick-right-border'>s4</td><td style='background-color: #00a98f;'>#00a98f</td></tr><tr><td class='thick-right-border'>s5</td><td style='background-color: #00a3ec;'>#00a3ec</td></tr><tr><td class='thick-right-border'>s6</td><td style='background-color: #9083ed;'>#9083ed</td></tr></table></body></html>";


// This is used to test fn.parsed_biom.colors.  It only has just enough attrs to work with the default values need by that function.
spec_helper.test_case.FULLY_PARSED_BIOM = {
  abundance_across_samples_for_each_leaf: spec_helper.test_case.ABUNDANCE_ACROSS_ALL_SAMPLES,
  all_areas: spec_helper.test_case.ALL_AREAS,
  all_centroids: spec_helper.test_case.ALL_CENTROIDS,
  angles_from_origin_to_centroid: spec_helper.test_case.ANGLES_FROM_ORIGIN_TO_CENTROIDS,
  approx_starting_colors: spec_helper.test_case.APPROX_STARTING_COLORS,
  centroids_of_whole_shape: spec_helper.test_case.CENTROIDS_OF_WHOLE_SHAPE,
  color_details: {
    apple: {
      hue: 274.23327766710975,
      chroma: 28.56997561257103,
      lightness: 60
    },
    pie: {
      hue: 326.9951158048415,
      chroma: 28.56997561257103,
      lightness: 60
    }
  },
  color_hex_codes: {
    apple: "#bfcde3",
    pie: "#d9c6d9"
  },
  counts_for_each_leaf: spec_helper.test_case.COUNTS,
  evenness_across_samples_for_each_leaf: spec_helper.test_case.EVENNESS_ACROSS_ALL_SAMPLES,
  leaf_names: spec_helper.test_case.LEAF_NAMES,
  non_zero_samples_for_each_leaf: spec_helper.test_case.NON_ZERO_SAMPLES_FOR_EACH_LEAF,
  num_leaves: spec_helper.test_case.NUM_LEAVES,
  num_samples: spec_helper.test_case.NUM_SAMPLES,
  origin_triangles_for_each_leaf: spec_helper.test_case.ORIGIN_TRIANGLES,
  params: spec_helper.test_case.PARAMS_FOR_NEW,
  parsed_biom: spec_helper.test_case.PARSED_BIOM,
  points: spec_helper.test_case.POINTS,
  sample_angles: spec_helper.test_case.SAMPLE_ANGLES,
  sample_color_legend_html: spec_helper.test_case.SAMPLE_COLOR_LEGEND_HTML,
  sample_color_legend_tsv: spec_helper.test_case.SAMPLE_COLOR_LEGEND_TSV,
  sample_names: spec_helper.test_case.SAMPLE_NAMES,
  zero_replacement_val: spec_helper.test_case.ZERO_REPLACEMENT_VAL,

  biom_with_colors_tsv: spec_helper.test_case.BIOM_WITH_COLORS_TSV,
  biom_with_colors_html: spec_helper.test_case.BIOM_WITH_COLORS_HTML,

  approx_starting_colors_tsv: spec_helper.test_case.APPROX_STARTING_COLORS_TSV,
  approx_starting_colors_html: spec_helper.test_case.APPROX_STARTING_COLORS_HTML,

  count_matrix: spec_helper.test_case.COUNT_MATRIX,
  projection: spec_helper.test_case.PROJECTION,

  projection_leaves_1d: spec_helper.test_case.PROJECTION_LEAVES_1D,
  projection_samples_1d: spec_helper.test_case.PROJECTION_SAMPLES_1D
};

// See svd.r for how this was generated.
spec_helper.longley = {};

spec_helper.longley.DATA = lalolib.array2mat([
  [83.0, 234.289, 235.6, 159.0, 107.608, 60.323],
  [88.5, 259.426, 232.5, 145.6, 108.632, 61.122],
  [88.2, 258.054, 368.2, 161.6, 109.773, 60.171],
  [89.5, 284.599, 335.1, 165.0, 110.929, 61.187],
  [96.2, 328.975, 209.9, 309.9, 112.075, 63.221],
  [98.1, 346.999, 193.2, 359.4, 113.270, 63.639],
  [99.0, 365.385, 187.0, 354.7, 115.094, 64.989],
  [100.0, 363.112, 357.8, 335.0, 116.219, 63.761],
  [101.2, 397.469, 290.4, 304.8, 117.388, 66.019],
  [104.6, 419.180, 282.2, 285.7, 118.734, 67.857],
  [108.4, 442.769, 293.6, 279.8, 120.445, 68.169],
  [110.8, 444.546, 468.1, 263.7, 121.950, 66.513],
  [112.6, 482.704, 381.3, 255.2, 123.366, 68.655],
  [114.2, 502.601, 393.1, 251.4, 125.368, 69.564],
  [115.7, 518.173, 480.6, 257.2, 127.852, 69.331],
  [116.9, 554.894, 400.7, 282.7, 130.081, 70.551]
]);

spec_helper.longley.DAT_SMALL = lalolib.array2mat([
  [83.0, 234.289, 235.6, 159.0, 107.608, 60.323],
  [88.5, 259.426, 232.5, 145.6, 108.632, 61.122],
  [88.2, 258.054, 368.2, 161.6, 109.773, 60.171],
  [89.5, 284.599, 335.1, 165.0, 110.929, 61.187],
]);

spec_helper.longley.VARIANCE_EXPLAINED = lalolib.array2mat([6.494199e1, 2.995035e1, 5.099393e0, 6.961770e-3, 8.968655e-4, 4.073981e-4]);

spec_helper.longley.CUMULATIVE_VARIANCE = lalolib.array2mat([64.94199, 94.89234, 99.99173300000001, 99.99869477000001, 99.99959163550001, 99.9999990336]);

spec_helper.longley.PCA_SCORES = lalolib.array2mat([
  [-186.726165, -77.348106, -22.360443, -1.65548756, 0.097455233, 0.25636573],
  [-171.233252, -77.329495, -46.898743, 1.57600508, -0.509297106, 0.17787338],
  [-84.721500, -144.533833, 34.776957, -0.08830067, 0.006470772, 0.09758232],
  [-84.646204, -114.230684, 4.837244, -0.99437463, 0.109050816, -0.50342538],
  [-106.024495, 81.269033, 7.976789, 0.86240955, -0.240682167, -0.35417594],
  [-94.822982, 133.838443, 21.014042, 0.48269768, -0.521502916, -0.26686327],
  [-85.331192, 139.868039, 4.378067, -0.41717271, -0.257086517, 0.40321498],
  [16.965506, 25.342865, 81.765989, -0.59533803, 0.036522129, 0.22428574],
  [-3.807025, 52.917274, 7.944642, -1.49525560, 0.734344832, -0.38769768],
  [4.871515, 50.482247, -20.966119, 0.08286403, 1.099151451, 0.29451613],
  [29.343826, 47.149132, -32.203229, 1.40052544, 0.284859684, 0.28174724],
  [137.714865, -65.487975, 47.114894, 2.03785339, -0.117571682, 0.05302910],
  [111.141640, -9.186238, -24.963168, 1.20758709, 0.157380218, -0.51474328],
  [133.251631, -12.423212, -32.518316, 0.64604595, 0.089025423, -0.03003828],
  [201.017216, -53.791100, 7.927325, -0.50826525, -0.203559998, 0.29720190],
  [183.006618, 23.463609, -37.825933, -2.54179378, -0.764560172, -0.02887269]
]);

spec_helper.longley.PCA_SCORES_VAL = lalolib.array2mat([-186.72616480452814, 77.348106479156, -22.360442801294216, -1.6554875584308926, 0.09745523253610883, 0.25636572860814566, -171.23325151057952, 77.32949450961482, -46.898743132240014, 1.5760050811410937, -0.5092971061976254, 0.17787337905938197, -84.72149956306554, 144.53383254315833, 34.77695713202307, -0.08830066880472115, 0.006470771628065903, 0.09758231954998535, -84.64620365710546, 114.23068397221897, 4.837243852308278, -0.9943746266310005, 0.1090508159750152, -0.5034253842584725, -106.0244952882233, -81.26903345552802, 7.976789131043868, 0.8624095541516136, -0.24068216726916106, -0.35417594470432207, -94.82298242411407, -133.83844277357625, 21.014042430997357, 0.4826976838282579, -0.521502915689565, -0.26686327472546406, -85.33119181968192, -139.86803888530284, 4.378067370165573, -0.417172709883721, -0.2570865171243733, 0.40321498125299415, 16.965505532634978, -25.342864659197048, 81.7659886027255, -0.5953380341332015, 0.03652212876607287, 0.22428574382919078, -3.807025497567701, -52.91727409458905, 7.944642495831419, -1.4952555988584149, 0.734344832078596, -0.38769767607126787, 4.871514694847199, -50.482246983040696, -20.966118528251283, 0.08286402836854119, 1.0991514508118505, 0.2945161292326563, 29.34382574009882, -47.14913222507639, -32.20322929541268, 1.4005254401438811, 0.28485968446555837, 0.2817472442651618, 137.71486464478187, 65.48797470084418, 47.11489417060449, 2.0378533893388124, -0.11757168221594125, 0.05302910255177839, 111.14163989220734, 9.186237633329684, -24.963167729494963, 1.2075870885797981, 0.15738021838625474, -0.514743278994808, 133.2516306008887, 12.42321191993108, -32.518315813573025, 0.6460459542665415, 0.0890254233717728, -0.03003828208501691, 201.017215867455, 53.79110047127392, 7.927324898042413, -0.5082652454032199, -0.20355999754605697, 0.29720189900021055, 183.00661759195225, -23.46360915321702, -37.82593278347631, -2.5417937776734605, -0.7645601719763747, -0.028872686510279206]);

spec_helper.longley.PCA_SCORES_VAL_FIRST_TWO_COLS = lalolib.array2mat([-186.72616480452814, 77.348106479156, -171.23325151057952, 77.32949450961482, -84.72149956306554, 144.53383254315833, -84.64620365710546, 114.23068397221897, -106.0244952882233, -81.26903345552802, -94.82298242411407, -133.83844277357625, -85.33119181968192, -139.86803888530284, 16.965505532634978, -25.342864659197048, -3.807025497567701, -52.91727409458905, 4.871514694847199, -50.482246983040696, 29.34382574009882, -47.14913222507639, 137.71486464478187, 65.48797470084418, 111.14163989220734, 9.186237633329684, 133.2516306008887, 12.42321191993108, 201.017215867455, 53.79110047127392, 183.00661759195225, -23.46360915321702]);

spec_helper.longley.PCA_SCORES_FROM_ZERO = lalolib.array2mat([
  [0.00000, 67.18573, 24.53830, 0.8863062, 0.8620154, 0.77110901],
  [15.49291, 67.20434, 0.00000, 4.1177989, 0.2552631, 0.69261666],
  [102.00467, 0.00000, 81.67570, 2.4534931, 0.7710309, 0.61232560],
  [102.07996, 30.30315, 51.73599, 1.5474192, 0.8736110, 0.01131789],
  [80.70167, 225.80287, 54.87553, 3.4042033, 0.5238780, 0.16056733],
  [91.90318, 278.37228, 67.91279, 3.0244915, 0.2430573, 0.24788000],
  [101.39497, 284.40187, 51.27681, 2.1246211, 0.5074737, 0.91795826],
  [203.69167, 169.87670, 128.66473, 1.9464557, 0.8010823, 0.73902902],
  [182.91914, 197.45111, 54.84339, 1.0465382, 1.4989050, 0.12704560],
  [191.59768, 195.01608, 25.93262, 2.6246578, 1.8637116, 0.80925941],
  [216.06999, 191.68296, 14.69551, 3.9423192, 1.0494199, 0.79649052],
  [324.44103, 79.04586, 94.01364, 4.5796472, 0.6469885, 0.56777238],
  [297.86780, 135.34759, 21.93558, 3.7493809, 0.9219404, 0.00000000],
  [319.97780, 132.11062, 14.38043, 3.1878397, 0.8535856, 0.48470500],
  [387.74338, 90.74273, 54.82607, 2.0335285, 0.5610002, 0.81194518],
  [369.73278, 167.99744, 9.07281, 0.0000000, 0.0000000, 0.48587059]
]);

// Checked against R.  Also this is on the centered longley data.
spec_helper.longley.PROJECTION_SAMPLES_1D = JSON.parse('{"length":6,"m":6,"n":1,"size":[6,1],"type":"matrix","val":{"0":0.07848368082459646,"1":1,"2":0.822259291828756,"3":0.18102954580522598,"4":0.0400701729867867,"5":0}}');
