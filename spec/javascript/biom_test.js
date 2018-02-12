var biom_str = "name\tsample_1\tsample_2\tsample_3\ngeode\t25\t40\t50\nclock\t10\t15\t94\ntire\t5\t8\t80\nbanana\t100\t140\t11\neggplant\t90\t130\t14";

test('get_point() returns the point for a sample for a tree leaf', function() {
  var pt = { x: 1, y: 0 };

  expect(get_point(1, 0, 4)).toEqual(pt);
});

test('sample_to_angle() converts sample idx to an angle theta', function() {
  expect(sample_to_angle(1, 4)).toEqual(Math.PI / 2);
});

test('sample_counts_to_points() takes csv and return points', function() {
  var csv = parse_biom_file(biom_str);

  var expected_points = {
    "geode": {
      "sample_1": {
        "x": 0.5,
        "y": 0
      },
      "sample_2": {
        "x": -0.4,
        "y": 0.6928
      },
      "sample_3": {
        "x": -0.5,
        "y": -0.866
      }
    },
    "clock": {
      "sample_1": {
        "x": 0.1064,
        "y": 0
      },
      "sample_2": {
        "x": -0.0798,
        "y": 0.1382
      },
      "sample_3": {
        "x": -0.5,
        "y": -0.866
      }
    },
    "tire": {
      "sample_1": {
        "x": 0.0625,
        "y": 0
      },
      "sample_2": {
        "x": -0.05,
        "y": 0.0866
      },
      "sample_3": {
        "x": -0.5,
        "y": -0.866
      }
    },
    "banana": {
      "sample_1": {
        "x": 0.7143,
        "y": 0
      },
      "sample_2": {
        "x": -0.5,
        "y": 0.866
      },
      "sample_3": {
        "x": -0.0393,
        "y": -0.068
      }
    },
    "eggplant": {
      "sample_1": {
        "x": 0.6923,
        "y": 0
      },
      "sample_2": {
        "x": -0.5,
        "y": 0.866
      },
      "sample_3": {
        "x": -0.0538,
        "y": -0.0933
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

test('centroids_of_points() takes points and gives the centroids for each shape', function() {
  var points = {
    leaf1: {
      sample1: {
        x: 0, y: 0
      },
      sample2: {
        x: 1, y: 0
      },
      sample3: {
        x: 1, y: 1
      },
      sample4: {
        x: 0, y: 1
      }
    },
    leaf2: {
      sample1: {
        x: -1, y: 1
      },
      sample2: {
        x: -1, y: -1
      },
      sample3: {
        x: 1, y: 1
      },
      sample4: {
        x: 1, y: -1
      }
    }
  };

  var result = { leaf1: { x: 0.49999999999999994, y: 0.49999999999999994 }, leaf2: { x: 0, y: 0 } };

  expect(centroids_of_points(points)).toEqual(result);
});

// TODO Chroma doesn't work in the context of jest.  You need to set the chroma function in a global variable so that is accesible, but then you need to change the iroki code that uses it.
// test('colors_from_centroids() lalalal', function() {
//   var centroids = centroids_of_samples(biom_str);
//   var csv = parse_biom_file(biom_str);
//
//   expect(colors_from_centroids(centroids, csv)).toEqual(123);
// });

// test('parse_biom_file() returns a obj', function() {
//   var obj = {};
//
//   expect(parse_biom_file(biom_str)).toEqual(obj);
// });

test('centroids_of_samples() does some stuff', function() {
  var centroids = centroids_of_samples(biom_str);

  var expected = {"banana": {"x": 0.058333333333333355, "y": 0.266}, "clock": {"x": -0.15780000000000002, "y": -0.2426}, "eggplant": {"x": 0.04616666666666668, "y": 0.25756666666666667}, "geode": {"x": -0.13333333333333333, "y": -0.05773333333333333}, "tire": {"x": -0.1625, "y": -0.2598}};

  expect(centroids_of_samples(biom_str)).toEqual(expected);
});

test('json_to_tsv() takes key val pairs and makes a tsv string from it.', function() {
  var obj = { "a" : "is for apple", "b is" : "for banana" };
  var str = "a\tis for apple\nb is\tfor banana";

  expect(json_to_tsv(obj)).toEqual(str);
});