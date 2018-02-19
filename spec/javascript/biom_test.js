if (g_val_hue_angle_offset === undefined) {
  g_val_hue_angle_offset = 0;
}

var biom_str = "name\tsample_1\tsample_2\tsample_3\ngeode\t25\t40\t50\nclock\t10\t15\t94\ntire\t5\t8\t80\nbanana\t100\t140\t11\neggplant\t90\t130\t14";

test('get_point() returns the point for a sample for a tree leaf', function () {
  var pt = { x : 1, y : 0 };

  expect(get_point(1, 0, 4)).toEqual(pt);
});

test('sample_to_angle() converts sample idx to an angle theta', function () {
  expect(sample_to_angle(1, 4, 0)).toEqual(Math.PI / 2);
});

test('sample_counts_to_points() takes csv and return points', function () {
  var csv = parse_biom_file_str(biom_str);

  var expected_points = {
    "geode" : {
      "sample_1" : {
        "x" : 0.5,
        "y" : 0
      },
      "sample_2" : {
        "x" : -0.39999999999999986,
        "y" : 0.692820323027551
      },
      "sample_3" : {
        "x" : -0.5000000000000004,
        "y" : -0.8660254037844384
      }
    },
    "clock" : {
      "sample_1" : {
        "x" : 0.10638297872340426,
        "y" : 0
      },
      "sample_2" : {
        "x" : -0.07978723404255315,
        "y" : 0.1381955431570913
      },
      "sample_3" : {
        "x" : -0.5000000000000004,
        "y" : -0.8660254037844384
      }
    },
    "tire" : {
      "sample_1" : {
        "x" : 0.0625,
        "y" : 0
      },
      "sample_2" : {
        "x" : -0.04999999999999998,
        "y" : 0.08660254037844388
      },
      "sample_3" : {
        "x" : -0.5000000000000004,
        "y" : -0.8660254037844384
      }
    },
    "banana" : {
      "sample_1" : {
        "x" : 0.7142857142857143,
        "y" : 0
      },
      "sample_2" : {
        "x" : -0.4999999999999998,
        "y" : 0.8660254037844387
      },
      "sample_3" : {
        "x" : -0.03928571428571432,
        "y" : -0.06804485315449159
      }
    },
    "eggplant" : {
      "sample_1" : {
        "x" : 0.6923076923076923,
        "y" : 0
      },
      "sample_2" : {
        "x" : -0.4999999999999998,
        "y" : 0.8660254037844387
      },
      "sample_3" : {
        "x" : -0.0538461538461539,
        "y" : -0.09326427425370876
      }
    }
  };

  expect(sample_counts_to_points(csv)).toEqual(expected_points);
});

// test('get_signed_area() takes points and gives the signed area of a polygon', function() {
//   var points = {
//     leaf1: {
//       sample1: {
//         x: 0, y: 0
//       },
//       sample2: {
//         x: 1, y: 0
//       },
//       sample3: {
//         x: 1, y: 1
//       },
//       sample4: {
//         x: 0, y: 1
//       }
//     },
//     leaf2: {
//       sample1: {
//         x: -1, y: 1
//       },
//       sample2: {
//         x: -1, y: -1
//       },
//       sample3: {
//         x: 1, y: 1
//       },
//       sample4: {
//         x: 1, y: -1
//       }
//     }
//   };
//
//   var result = { leaf1: 1, leaf2: 0 };
//
//   expect(get_signed_area(points)).toEqual(result);
// });

test('centroids_of_points() takes points and gives the centroids for each shape', function () {
  var points = {
    leaf1 : {
      sample1 : {
        x : 0, y : 0
      },
      sample2 : {
        x : 1, y : 0
      },
      sample3 : {
        x : 1, y : 1
      },
      sample4 : {
        x : 0, y : 1
      }
    },
    leaf2 : {
      sample1 : {
        x : -1, y : 1
      },
      sample2 : {
        x : -1, y : -1
      },
      sample3 : {
        x : 1, y : 1
      },
      sample4 : {
        x : 1, y : -1
      }
    }
  };

  var result = {
    leaf1 : { x : 0.49999999999999994, y : 0.49999999999999994 },
    leaf2 : { x : 0, y : 0 }
  };

  expect(centroids_of_points(points)).toEqual(result);
});

// TODO Chroma doesn't work in the context of jest.  You need to set the chroma function in a global variable so that is accesible, but then you need to change the iroki code that uses it.
// test('colors_from_centroids() lalalal', function() {
//   var centroids = centroids_of_samples(biom_str);
//   var csv = parse_biom_file_str(biom_str);
//
//   expect(colors_from_centroids(centroids, csv)).toEqual(123);
// });

// test('parse_biom_file_str() returns a obj', function() {
//   var obj = {};
//
//   expect(parse_biom_file_str(biom_str)).toEqual(obj);
// });

test('centroids_of_samples() does some stuff', function () {
  var centroids = centroids_of_samples(biom_str);

  var expected = {
    "banana" : {
      "x" : 0.05833333333333338,
      "y" : 0.26599351687664907
    },
    "clock" : { "x" : -0.15780141843971646, "y" : -0.24260995354244905 },
    "eggplant" : { "x" : 0.04615384615384621, "y" : 0.25758704317691 },
    "geode" : { "x" : -0.13333333333333344, "y" : -0.05773502691896245 },
    "tire" : { "x" : -0.16250000000000014, "y" : -0.2598076211353315 }
  };

  expect(centroids_of_samples(biom_str)).toEqual(expected);
});

test('make_tsv() takes key val pairs and makes a tsv string from it.', function () {
  var obj = { "a" : "is for apple", "b is" : "for banana" };
  var str = "name\tbranch_color\tleaf_label_color\tleaf_dot_color\na\tis for apple\tis for apple\tis for apple\nb is\tfor banana\tfor banana\tfor banana";

  expect(make_tsv_string(obj)).toEqual(str);
});