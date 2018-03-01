//= require spec_helper_functions

describe("fn", function () {
  describe("parsed_biom", function () {
    describe("sample_angles", function () {
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

    describe("sample_fields", function () {
      it("returns only the sample fields", function () {
        var biom        = "name\ts1\ts2\tiroki_fake_1\tiroki_fake_2\napple\t10\t20\t0\t0\npie\t20\t10\t0\t0";
        var parsed_biom = Papa.parse(biom, spec_helper.PAPA_CONFIG);

        var expected = ["s1", "s2"];
        var actual   = fn.parsed_biom.sample_fields(parsed_biom);

        spec_helper.expect_stringify_equal(actual, expected);
      });
    });

    describe("num_real_samples", function () {
      it("counts the actual samples", function () {
        var biom        = "name\ts1\ts2\tiroki_fake_1\tiroki_fake_2\napple\t10\t20\t0\t0\npie\t20\t10\t0\t0";
        var parsed_biom = Papa.parse(biom, spec_helper.PAPA_CONFIG);

        var expected = 2;
        var actual   = fn.parsed_biom.num_real_samples(parsed_biom);

        expect(actual).to.equal(expected);
      });
    });

    describe("abundance_across", function () {
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

    describe("sample_color_legend", function () {
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

    describe("sample_color_legend_html", function () {
      it("handles an angle offset");
      it("gives the sample to starting color html output", function () {
        // Made with the inspect_file.rb program from helper.BIOM_STR
        var expected = "<!DOCTYPE html><head><style>table, th, td {border: 1px solid #2d2d2d; border-collapse: collapse} th, td {padding: 5px} th {text-align: left; border-bottom: 4px solid #2d2d2d} .thick-right-border {border-right: 3px solid #2d2d2d}.thick-left-border {border-left: 3px solid #2d2d2d}</style><title>Sample legend</title></head><body><table><tr><th class='thick-right-border'>name</th><th>appoximate starting color</th></tr><tr><td class='thick-right-border'>s1</td><td style='background-color: #ed5e93;'>#ed5e93</td></tr><tr><td class='thick-right-border'>s2</td><td style='background-color: #00a98f;'>#00a98f</td></tr></table></body></html>";

        var angle_offset = 0;

        var actual = fn.parsed_biom.sample_color_legend_html(spec_helper.PARSED_BIOM, angle_offset);

        expect(actual).to.equal(expected);
      });
    });

    describe("non_zero_count_samples", function () {
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
  });
});