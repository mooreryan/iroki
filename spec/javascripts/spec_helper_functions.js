var TODO = null;

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
  correct_luminance: true
};

spec_helper.test_case.BIOM_WITH_COLORS_TSV = "name\tcolor\thue\tchroma/saturation\tlightness\tcentroid\tevenness\tabundance\ts1\ts2\ts3\ts4\ts5\ts6\napple\t#94d3ff\t274.23\t71.43\t60\t(0.03, -0.4)\t0.71\t1.67\t0\t1\t2\t0\t3\t4\npie\t#edbced\t327\t71.43\t60\t(0.22, -0.14)\t0.71\t1.67\t1\t2\t0\t3\t0\t4";

spec_helper.test_case.BIOM_WITH_COLORS_HTML = "<!DOCTYPE html><head><style>table, th, td {border: 1px solid #2d2d2d; border-collapse: collapse} th, td {padding: 5px} th {text-align: left; border-bottom: 4px solid #2d2d2d} .thick-right-border {border-right: 3px solid #2d2d2d}.thick-left-border {border-left: 3px solid #2d2d2d}</style><title>Color table</title></head><body><table><tbody><tr><th>name</th><th class='thick-right-border'>color</th><th>hue</th><th>chroma/saturation</th><th class='thick-right-border'>lightness</th><th>centroid</th><th>evenness</th><th class='thick-right-border'>abundance</th><th>s1</th><th>s2</th><th>s3</th><th>s4</th><th>s5</th><th>s6</th></tr><tr><td>apple</td><td class='thick-right-border' style='background-color: #94d3ff; color: black;'>#94d3ff</td><td>274.23</td><td>71.43</td><td class='thick-right-border'>60</td><td>(0.03, -0.4)</td><td>0.71</td><td class='thick-right-border'>1.67</td><td>0</td><td>1</td><td>2</td><td>0</td><td>3</td><td>4</td></tr><tr><td>pie</td><td class='thick-right-border' style='background-color: #edbced; color: black;'>#edbced</td><td>327</td><td>71.43</td><td class='thick-right-border'>60</td><td>(0.22, -0.14)</td><td>0.71</td><td class='thick-right-border'>1.67</td><td>1</td><td>2</td><td>0</td><td>3</td><td>0</td><td>4</td></tr></tbody></table></body></html>";

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
      chroma: 71.43002438742897,
      lightness: 60
    },
    pie: {
      hue: 326.9951158048415,
      chroma: 71.43002438742897,
      lightness: 60
    }
  },
  color_hex_codes: {
    apple: "#94d3ff",
    pie: "#edbced"
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
  approx_starting_colors_html: spec_helper.test_case.APPROX_STARTING_COLORS_HTML
};
