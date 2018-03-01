//= require spec_helper_functions

// TODO these tests depend on a lot of global vars being set correctly to the defaults.
describe("biom", function () {
  spec_helper.it_doesnt_change_parsed_biom = function (fun, biom_str) {
    var parsed_biom      = Papa.parse(biom_str, spec_helper.PAPA_CONFIG);
    var parsed_biom_copy = fn.obj.deep_copy(parsed_biom);

    // This is the function we are checking that it doesn't change it's input.
    fun(parsed_biom);

    spec_helper.expect_stringify_equal(parsed_biom, parsed_biom_copy);
  };

  function test_centroids_from_points(all_points, non_zero_count_samples, expected) {
    describe("centroids_from_points", function () {
      it("gives centroids from a set of points", function () {
        var actual = biom.centroids_from_points(all_points, non_zero_count_samples);

        spec_helper.expect_stringify_equal(actual, expected);
      });
    });
  }


  // TODO eventually these should move into their own namespace.
  context("helper functions", function () {
    describe("sample_to_angle", function () {
      it("gives the angle of a sample by its index", function () {
        expect(biom.sample_to_angle(0, 1, 0)).to.equal(0);
        expect(biom.sample_to_angle(1, 2, 0)).to.equal(Math.PI);
        expect(biom.sample_to_angle(0, 10, 0)).to.equal(0);
        expect(biom.sample_to_angle(2, 4, 0)).to.equal(Math.PI);
      });


      it("handles angle offsets", function () {
        var offset = Math.PI / 2; // 90 deg

        expect(biom.sample_to_angle(0, 1, offset)).to.equal(offset);
        expect(biom.sample_to_angle(1, 2, offset)).to.equal(Math.PI + offset);
        expect(biom.sample_to_angle(0, 10, offset)).to.equal(offset);
        expect(biom.sample_to_angle(2, 4, offset)).to.equal(Math.PI + offset);
      });


      it("throws if num_samples is 0", function () {
        expect(function () {
          biom.sample_to_angle(0, 0, 0);
        }).to.throw();
      });


    });
  });

  // These are namespaced helper functions
  describe("helper", function () {
    describe("fake_samples", function () {
      it("returns fake samples if needed", function () {
        spec_helper.expect_stringify_equal(biom.helper.fake_samples(0), []);
        spec_helper.expect_stringify_equal(biom.helper.fake_samples(2), ["iroki_fake_1"]);
        spec_helper.expect_stringify_equal(biom.helper.fake_samples(1), ["iroki_fake_1", "iroki_fake_2"]);
      });


    });

    describe("add_zero_count_samples", function () {
      it("adds zero counts for the supplied (fake) samples", function () {
        var counts       = [{ apple: 5 }, { peach: 10 }];
        var fake_samples = ["pie", "tasty"];
        var expected     = [
          { apple: 5, pie: 0, tasty: 0 },
          { peach: 10, pie: 0, tasty: 0 }
        ];

        biom.helper.add_zero_count_samples(counts, fake_samples);

        spec_helper.expect_stringify_equal(counts, expected);
      });

      it("throws if samples array is empty", function () {
        expect(function () {
          biom.helper.add_zero_count_samples({ apple: 5 }, []);
        }).to.throw();
      });
    });
  });


  // These have one fake field
  context("with single sample biom file", function () {

    describe("centroids_from_points", function () {
      test_centroids_from_points(spec_helper.single_sample.POINTS, spec_helper.single_sample.NON_ZERO_COUNT_SAMPLES, spec_helper.single_sample.CENTROIDS);
    });


    describe("inverse_evenness", function () {
      var parsed_biom = Papa.parse(spec_helper.single_sample.BIOM_STR, spec_helper.PAPA_CONFIG);
      // var parsed_biom      = Papa.parse();

      var parsed_biom_copy = fn.obj.deep_copy(parsed_biom);
      it("gives the inverse of evenness", function () {
        var expected = {
          geode: 0,
          clock: 0,
          tire: 0,
          banana: 0,
          eggplant: 0
        };

        var actual = biom.inverse_evenness(parsed_biom);

        spec_helper.expect_stringify_equal(actual, expected);
      });

      it("doesn't change parsed_biom", function () {
        spec_helper.expect_stringify_equal(parsed_biom, parsed_biom_copy);
      });
    });

    describe("make_tsv_string", function () {

      it("makes the color map string", function () {
        var parsed_biom            = Papa.parse(spec_helper.single_sample.BIOM_STR, spec_helper.PAPA_CONFIG);
        var points                 = fn.parsed_biom.leaf_sample_points(parsed_biom);
        var non_zero_count_samples = fn.parsed_biom.non_zero_count_samples(parsed_biom);
        var centroids              = biom.centroids_from_points(points, non_zero_count_samples);
        var ret_val                = colors_from_centroids(centroids, parsed_biom);
        var colors                 = ret_val[0];

        var expected = "name\tbranch_color\tleaf_label_color\tleaf_dot_color\ngeode\t#ff219b\t#ff219b\t#ff219b\nclock\t#c0004b\t#c0004b\t#c0004b\ntire\t#d5015c\t#d5015c\t#d5015c\nbanana\t#ff70d8\t#ff70d8\t#ff70d8\neggplant\t#ff7ae7\t#ff7ae7\t#ff7ae7";

        var actual = biom.make_tsv_string(colors);

        expect(actual).to.equal(expected);
      });
    });

    describe("make_biom_with_colors_hmtl", function () {
      it("makes the counts_with_colors.html file", function () {
        var parsed_biom            = Papa.parse(spec_helper.single_sample.BIOM_STR, spec_helper.PAPA_CONFIG);
        var points                 = fn.parsed_biom.leaf_sample_points(parsed_biom);
        var non_zero_count_samples = fn.parsed_biom.non_zero_count_samples(parsed_biom);
        var centroids              = biom.centroids_from_points(points, non_zero_count_samples);

        var ret_val       = colors_from_centroids(centroids, parsed_biom);
        var colors        = ret_val[0];
        var color_details = ret_val[1];

        // This is from the above biom str.
        var expected = "<!DOCTYPE html><head><style>table, th, td {border: 1px solid #2d2d2d; border-collapse: collapse} th, td {padding: 5px} th {text-align: left; border-bottom: 4px solid #2d2d2d} .thick-right-border {border-right: 3px solid #2d2d2d}.thick-left-border {border-left: 3px solid #2d2d2d}</style><title>Color table</title></head><body><table><tr><th>name</th><th class='thick-right-border'>color</th><th>hue</th><th>chroma/saturation</th><th class='thick-right-border'>lightness</th><th>centroid</th><th>evenness</th><th class='thick-right-border'>abundance</th><th>sample_1</th></tr><tr><td>geode</td><td class='thick-right-border' style='background-color:#ff219b; color: white;'>#ff219b</td><td>0</td><td>100</td><td class='thick-right-border'>56.67</td><td>(1, 0)</td><td>1</td><td class='thick-right-border'>5</td><td>5</td></tr><tr><td>clock</td><td class='thick-right-border' style='background-color:#c0004b; color: white;'>#c0004b</td><td>0</td><td>100</td><td class='thick-right-border'>30</td><td>(1, 0)</td><td>1</td><td class='thick-right-border'>1</td><td>1</td></tr><tr><td>tire</td><td class='thick-right-border' style='background-color:#d5015c; color: white;'>#d5015c</td><td>0</td><td>100</td><td class='thick-right-border'>36.67</td><td>(1, 0)</td><td>1</td><td class='thick-right-border'>2</td><td>2</td></tr><tr><td>banana</td><td class='thick-right-border' style='background-color:#ff70d8; color: black;'>#ff70d8</td><td>0</td><td>100</td><td class='thick-right-border'>83.33</td><td>(1, 0)</td><td>1</td><td class='thick-right-border'>9</td><td>9</td></tr><tr><td>eggplant</td><td class='thick-right-border' style='background-color:#ff7ae7; color: black;'>#ff7ae7</td><td>0</td><td>100</td><td class='thick-right-border'>90</td><td>(1, 0)</td><td>1</td><td class='thick-right-border'>10</td><td>10</td></tr></table></body></html>";

        var actual = biom.make_counts_with_colors_html(parsed_biom, false, colors, color_details);

        expect(actual).to.equal(expected);
      });
    });

    describe("parse_biom_file_str", function () {
      it("returns parsed_biom from a biom file string", function () {
        var expected = '{"data":[{"name":"geode","sample_1":5},{"name":"clock","sample_1":1},{"name":"tire","sample_1":2},{"name":"banana","sample_1":9},{"name":"eggplant","sample_1":10}],"errors":[],"meta":{"delimiter":"\\t","linebreak":"\\n","aborted":false,"truncated":false,"cursor":57,"fields":["name","sample_1"]}}';

        var actual = JSON.stringify(biom.parse_biom_file_str(spec_helper.single_sample.BIOM_STR));

        expect(actual).to.equal(expected);
      });
    });
  });
});