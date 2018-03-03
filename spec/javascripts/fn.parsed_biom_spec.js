//= require spec_helper_functions

/*
describe("fn", function () {
  describe("fn.parsed_biom", function () {
    describe("fn.parsed_biom.abundance_across", function () {
      it("calculates relative abundance across all samples", function () {
        var expected = {
          abundance: { apple: 5, pie: 5 },
          min_val: 5,
          max_val: 5
        };

        var actual = fn.parsed_biom.abundance_across(spec_helper.PARSED_BIOM, g_ID_AVG_METHOD_ALL_SAMPLES_MEAN);

        spec_helper.expect_stringify_equal(actual, expected);
      });

      it("calculates relative abundance across non-zero samples", function () {
        var expected = {
          abundance: { apple: 10, pie: 10 },
          min_val: 10,
          max_val: 10
        };

        var actual = fn.parsed_biom.abundance_across(spec_helper.PARSED_BIOM, g_ID_AVG_METHOD_NONZERO_SAMPLES_MEAN);

        spec_helper.expect_stringify_equal(actual, expected);
      });

      it("handles leaves with all zero counts");
    });

    describe("fn.parsed_biom.leaf_sample_points", function () {
      it("gives points for each leaf for each sample", function () {
        var pt       = fn.pt.new(1, 0);
        var expected = {
          geode: {
            sample_1: pt
          },
          clock: {
            sample_1: pt
          },
          tire: {
            sample_1: pt
          },
          banana: {
            sample_1: pt
          },
          eggplant: {
            sample_1: pt
          }
        };

        var parsed_biom = biom.parse_biom_file_str(spec_helper.single_sample.BIOM_STR);
        var actual      = fn.parsed_biom.leaf_sample_points(parsed_biom);

        spec_helper.expect_stringify_equal(actual, expected);
      });

      it("doesn't change parsed_biom", function () {
        spec_helper.it_doesnt_change_parsed_biom(fn.parsed_biom.leaf_sample_points, spec_helper.single_sample.BIOM_STR);
      });
    });

    describe("fn.parsed_biom.non_zero_count_samples", function () {
      it("returns 'none' if the leaf has zero counts across", function () {

        var biom_str    = "name\ts1\ts2\napple\t0\t0";
        var parsed_biom = Papa.parse(biom_str, spec_helper.PAPA_CONFIG);
        var expected    = { apple: "none" };
        var actual      = fn.parsed_biom.non_zero_count_samples(parsed_biom);

        spec_helper.expect_stringify_equal(actual, expected);
      });

      it("returns 'many' if the leaf has 2 or more non zero counts", function () {
        var biom_str    = "name\ts1\ts2\napple\t1\t2";
        var parsed_biom = Papa.parse(biom_str, spec_helper.PAPA_CONFIG);
        var expected    = { apple: "many" };
        var actual      = fn.parsed_biom.non_zero_count_samples(parsed_biom);

        spec_helper.expect_stringify_equal(actual, expected);

      });
      it("returns the name of the sample if there is one non zero count sample", function () {
        var biom_str    = "name\ts1\ts2\napple\t1\t0";
        var parsed_biom = Papa.parse(biom_str, spec_helper.PAPA_CONFIG);
        var expected    = { apple: "s1" };
        var actual      = fn.parsed_biom.non_zero_count_samples(parsed_biom);

        spec_helper.expect_stringify_equal(actual, expected);
      });
    });

    describe("fn.parsed_biom.num_real_samples", function () {
      it("counts the actual samples", function () {
        var biom        = "name\ts1\ts2\tiroki_fake_1\tiroki_fake_2\napple\t10\t20\t0\t0\npie\t20\t10\t0\t0";
        var parsed_biom = Papa.parse(biom, spec_helper.PAPA_CONFIG);

        var expected = 2;
        var actual   = fn.parsed_biom.num_real_samples(parsed_biom);

        expect(actual).to.equal(expected);
      });
    });

    describe("fn.parsed_biom.sample_angles", function () {
      it("returns the fields and angles", function () {
        var angle_offset = 0;
        var fields       = ["s1", "s2"];
        var angles       = [0, 180];
        var expected     = [fields, angles];
        var actual       = fn.parsed_biom.sample_angles(spec_helper.PARSED_BIOM, angle_offset);

        spec_helper.expect_stringify_equal(actual, expected);
      });

      it("handles a single sample biom file");
      it("hangles a two sample biom file");
      it("can take an angle offset");
    });

    describe("fn.parsed_biom.sample_color_legend", function () {
      it("handles an angle offset");
      it("gives the sample to starting color string", function () {
        var angle_offset = 0;
        // Made with the inspect_file.rb program from helper.BIOM_STR
        var expected     = "name\tappoximate starting color\ns1\t#ed5e93\ns2\t#00a98f\n";
        var actual       = fn.parsed_biom.sample_color_legend(spec_helper.PARSED_BIOM, angle_offset);

        expect(actual).to.equal(expected);
      });

      context("with single sample biom", function () {
        it("gives sample starting color string", function () {
          var angle_offset = 0;
          var parsed_biom  = Papa.parse(spec_helper.SINGLE_SAMPLE_BIOM_STR, spec_helper.PAPA_CONFIG);
          var actual       = fn.parsed_biom.sample_color_legend(parsed_biom, angle_offset);

          expect(spec_helper.SINGLE_SAMPLE_APPROX_START_COLORS).to.equal(actual);
        });
      });
    });

    describe("fn.parsed_biom.sample_color_legend_html", function () {
      it("handles an angle offset");
      it("gives the sample to starting color html output", function () {
        // Made with the inspect_file.rb program from helper.BIOM_STR
        var expected = "<!DOCTYPE html><head><style>table, th, td {border: 1px solid #2d2d2d; border-collapse: collapse} th, td {padding: 5px} th {text-align: left; border-bottom: 4px solid #2d2d2d} .thick-right-border {border-right: 3px solid #2d2d2d}.thick-left-border {border-left: 3px solid #2d2d2d}</style><title>Sample legend</title></head><body><table><tr><th class='thick-right-border'>name</th><th>appoximate starting color</th></tr><tr><td class='thick-right-border'>s1</td><td style='background-color: #ed5e93;'>#ed5e93</td></tr><tr><td class='thick-right-border'>s2</td><td style='background-color: #00a98f;'>#00a98f</td></tr></table></body></html>";

        var angle_offset = 0;

        var actual = fn.parsed_biom.sample_color_legend_html(spec_helper.PARSED_BIOM, angle_offset);

        expect(actual).to.equal(expected);
      });
    });

    describe("fn.parsed_biom.sample_fields", function () {
      it("returns only the sample fields", function () {
        var biom        = "name\ts1\ts2\tiroki_fake_1\tiroki_fake_2\napple\t10\t20\t0\t0\npie\t20\t10\t0\t0";
        var parsed_biom = Papa.parse(biom, spec_helper.PAPA_CONFIG);

        var expected = ["s1", "s2"];
        var actual   = fn.parsed_biom.sample_fields(parsed_biom);

        spec_helper.expect_stringify_equal(actual, expected);
      });
    });
  });
});
*/

describe("fn", function () {
  describe("fn.parsed_biom", function () {
    describe("fn.parsed_biom.parse_biom_file_str", function () {
      it("returns parsed_biom from a biom file string", function () {
        var expected = '{"data":[{"name":"geode","sample_1":5},{"name":"clock","sample_1":1},{"name":"tire","sample_1":2},{"name":"banana","sample_1":9},{"name":"eggplant","sample_1":10}],"errors":[],"meta":{"delimiter":"\\t","linebreak":"\\n","aborted":false,"truncated":false,"cursor":57,"fields":["name","sample_1"]}}';

        var actual = JSON.stringify(fn.parsed_biom.parse_biom_file_str(spec_helper.single_sample.BIOM_STR));

        expect(actual).to.equal(expected);
      });

      it("throws if 'name' is not the first column header", function () {
        var str = "apple\tpie\ngood\t1\n";

        expect(function () {
          fn.parsed_biom.parse_biom_file_str(str);
        }).to.throw();
      });

      it("throws if there are no samples");
      it("handles negative counts");
    });

    describe("fn.parsed_biom.num_samples", function () {
      it("gives the number of samples", function () {
        var expected = spec_helper.test_case.NUM_SAMPLES;
        var actual   = fn.parsed_biom.num_samples(spec_helper.test_case.PARSED_BIOM);

        expect(actual).to.equal(expected);
      });
    });

    describe("fn.parsed_biom.sample_names", function () {
      it("returns the names of the samples", function () {
        var expected = spec_helper.test_case.SAMPLE_NAMES;
        var actual   = fn.parsed_biom.sample_names(spec_helper.test_case.PARSED_BIOM);

        spec_helper.expect_stringify_equal(actual, expected);
      });
    });

    describe("fn.parsed_biom.counts_for_each_leaf", function () {
      context("raw counts", function () {
        it("returns the counts for each leaf", function () {
          var expected = spec_helper.test_case.COUNTS;
          var actual   = fn.parsed_biom.counts_for_each_leaf(spec_helper.test_case.PARSED_BIOM);

          spec_helper.expect_stringify_equal(actual, expected);
        });
      });
    });


    describe("fn.parsed_biom.non_zero_samples_for_each_leaf", function () {
      it("returns non zero samples for each leaf", function () {
        var expected = spec_helper.test_case.NON_ZERO_SAMPLES_FOR_EACH_LEAF;
        var actual   = fn.parsed_biom.non_zero_samples_for_each_leaf(spec_helper.test_case.PARSED_BIOM);

        spec_helper.expect_stringify_equal(actual, expected);
      });
    });

    describe("fn.parsed_biom.abundance_across_samples_for_each_leaf", function () {
      context("keep zero counts", function () {
        it("returns mean abundance across all samples", function () {
          var expected = spec_helper.test_case.ABUNDANCE_ACROSS_ALL_SAMPLES;
          var actual   = fn.parsed_biom.abundance_across_samples_for_each_leaf(spec_helper.test_case.PARSED_BIOM, true);

          spec_helper.expect_stringify_equal(actual, expected);
        });
      });

      context("do not keep zero counts", function () {
        it("returns mean abundance across non zero samples", function () {
          var expected = spec_helper.test_case.ABUNDANCE_ACROSS_NONZERO_SAMPLES;
          var actual   = fn.parsed_biom.abundance_across_samples_for_each_leaf(spec_helper.test_case.PARSED_BIOM, false);

          spec_helper.expect_stringify_equal(actual, expected);
        });
      });
    });

    describe("fn.parsed_biom.evenness_across_samples_for_each_leaf", function () {
      context("keep zero counts", function () {
        it("returns evenness across all samples", function () {
          var expected = spec_helper.test_case.EVENNESS_ACROSS_ALL_SAMPLES;
          var actual   = fn.parsed_biom.evenness_across_samples_for_each_leaf(spec_helper.test_case.COUNTS, true);

          spec_helper.expect_stringify_equal(actual, expected);
        });
      });

      context("do not keep zero counts", function () {
        it("returns evenness across non zero samples", function () {
          var expected = spec_helper.test_case.EVENNESS_ACROSS_NONZERO_SAMPLES;
          var actual   = fn.parsed_biom.evenness_across_samples_for_each_leaf(spec_helper.test_case.COUNTS, false);

          spec_helper.expect_stringify_equal(actual, expected);
        });
      });
    });

    describe("fn.parsed_biom.zero_replacement_val", function () {
      context("with large minimum non-zero count", function () {
        it("it gives the normal global zero replacement val", function () {
          var counts = {
            apple: [0, 1, 2],
            pie: [1, 1, 1]
          };

          var expected = global.ZERO_REPLACEMENT_VAL;

          var actual = fn.parsed_biom.zero_replacement_val(counts);

          expect(actual).to.equal(expected);
        });
      });

      context("with tiny minimum non-zero count", function () {
        it("gives an even smaller val for zero replacement", function () {
          var counts = {
            apple: [0, global.ZERO_REPLACEMENT_VAL / 2, 2],
            pie: [1, 1, 1]
          };

          var expected = global.ZERO_REPLACEMENT_VAL / 4;

          var actual = fn.parsed_biom.zero_replacement_val(counts);

          expect(actual).to.equal(expected);
        });
      });
    });

    describe("fn.parsed_biom.replace_zeros", function () {
      context("with values > global.ZERO_REPLACEMENT_VAL", function () {
        it("returns an array with the zeros replaced", function () {
          var counts   = { apple: [0, 1, 2], pie: [0, 1, 2] };
          var expected = {
            apple: [global.ZERO_REPLACEMENT_VAL, 1, 2],
            pie: [global.ZERO_REPLACEMENT_VAL, 1, 2]
          };
          var actual   = fn.parsed_biom.replace_zeros(counts);

          spec_helper.expect_stringify_equal(actual, expected);
        });
      });

      context("with values <= global.ZERO_REPLACEMENT_VAL", function () {
        it("returns an array with the zeros replaced", function () {
          var tiny_val = global.ZERO_REPLACEMENT_VAL / 2;
          var counts   = { apple: [0, tiny_val, 2], pie: [0, tiny_val, 2] };
          var expected = {
            apple: [tiny_val / 2, tiny_val, 2],
            pie: [tiny_val / 2, tiny_val, 2]
          };
          var actual   = fn.parsed_biom.replace_zeros(counts);

          spec_helper.expect_stringify_equal(actual, expected);
        });
      });
    });


    describe("fn.parsed_biom.points", function () {
      it("gives the points for each leaf for each sample", function () {
        var expected = spec_helper.test_case.POINTS;
        var actual   = fn.parsed_biom.points(spec_helper.test_case.COUNTS, spec_helper.test_case.NUM_SAMPLES);

        spec_helper.expect_stringify_equal(actual, expected);
      });
    });


    describe("fn.parsed_biom.origin_triangles_for_each_leaf", function () {
      it("gives origin triangles for each leaf", function () {
        var expected = spec_helper.test_case.ORIGIN_TRIANGLES;
        var actual   = fn.parsed_biom.origin_triangles_for_each_leaf(spec_helper.test_case.POINTS);

        spec_helper.expect_stringify_equal(actual, expected);
      });
    });

    describe("fn.parsed_biom.centroids_of_origin_triangles", function () {
      it("gives the centroid for each origin triangle", function () {
        var x1 = Math.cos(0);
        var x2 = Math.cos(2 * Math.PI / 3);
        var x3 = Math.cos(4 * Math.PI / 3);

        var y1 = Math.sin(0);
        var y2 = Math.sin(2 * Math.PI / 3);
        var y3 = Math.sin(4 * Math.PI / 3);

        var p1 = fn.pt.new(x1, y1);
        var p2 = fn.pt.new(x2, y2);
        var p3 = fn.pt.new(x3, y3);

        var origin_triangles = [[p1, p2], [p2, p3], [p3, p1]];

        var expected = [
          fn.pt.new((x1 + x2) / 3, (y1 + y2) / 3),
          fn.pt.new((x2 + x3) / 3, (y2 + y3) / 3),
          fn.pt.new((x3 + x1) / 3, (y3 + y1) / 3)
        ];

        var actual = fn.parsed_biom.centroids_of_origin_triangles(origin_triangles);

        spec_helper.expect_stringify_equal(actual, expected);
      });
    });

    describe("fn.parsed_biom.all_centroids", function () {
      it("returns centroids for each triangle for each leaf", function () {
        var expected = spec_helper.test_case.ALL_CENTROIDS;
        var actual   = fn.parsed_biom.all_centroids(spec_helper.test_case.ORIGIN_TRIANGLES);

        spec_helper.expect_stringify_equal(actual, expected);
      });
    });

    describe("sample_angles", function () {
      it("it gives the samples angles", function () {
        var expected = spec_helper.test_case.SAMPLE_ANGLES;
        var actual   = fn.parsed_biom.sample_angles(spec_helper.test_case.NUM_SAMPLES);

        spec_helper.expect_stringify_equal(actual, expected);
      });

      it("throws if there are zero samples", function () {
        var func = function () {
          fn.parsed_biom.sample_angles(0);
        };

        expect(func).to.throw();
      });
    });
  });
});