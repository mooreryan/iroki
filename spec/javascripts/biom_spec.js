// TODO these tests depend on a lot of global vars being set correctly to the defaults.
describe("biom", function () {
  var helper = {
    TOLERANCE: 1e-3,
    PAPA_CONFIG: {
      delimiter: "\t",
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true
    }
  };

  helper.it_doesnt_change_parsed_biom = function (fun, biom_str) {
    var parsed_biom      = Papa.parse(biom_str, helper.PAPA_CONFIG);
    var parsed_biom_copy = fn.obj.deep_copy(parsed_biom);

    // This is the function we are checking that it doesn't change it's input.
    fun(parsed_biom);

    helper.expect_stringify_equal(parsed_biom, parsed_biom_copy);
  };

  helper.expect_stringify_equal = function (actual, expected) {
    expect(JSON.stringify(actual)).to.equal(JSON.stringify(expected));
  };

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
        helper.expect_stringify_equal(biom.helper.fake_samples(0), []);
        helper.expect_stringify_equal(biom.helper.fake_samples(2), ["iroki_fake_1"]);
        helper.expect_stringify_equal(biom.helper.fake_samples(1), ["iroki_fake_1", "iroki_fake_2"]);
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

        helper.expect_stringify_equal(counts, expected);
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
    var biom_str = "name\tsample_1\ngeode\t5\nclock\t1\ntire\t2\nbanana\t9\neggplant\t10";

    describe("biom.sample_counts_to_points", function () {
      it("gives points for each leaf for each sample", function () {
        var pt = fn.pt.new(1, 0);
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

        var parsed_biom = biom.parse_biom_file_str(biom_str);
        var actual      = biom.sample_counts_to_points(parsed_biom);

        helper.expect_stringify_equal(actual, expected);
      });

      it("doesn't change parsed_biom", function () {
        helper.it_doesnt_change_parsed_biom(biom.sample_counts_to_points, biom_str);
      });
    });

    describe("centroids_of_samples", function () {
      it("returns the centroids of each leaf", function () {
        var pt = fn.pt.new(1, 0);

        var expected = {
          geode: pt,
          clock: pt,
          tire: pt,
          banana: pt,
          eggplant: pt
        };

        var parsed_biom = biom.parse_biom_file_str(biom_str);
        var actual      = biom.centroids_of_samples(parsed_biom);

        helper.expect_stringify_equal(actual, expected);
      });

      it("doesn't change parsed_biom", function () {
        helper.it_doesnt_change_parsed_biom(biom.centroids_of_samples, biom_str);
      });
    });

    describe("colors_from_parsed_biom", function () {
      it("returns color info", function () {
        var parsed_biom      = Papa.parse(biom_str, helper.PAPA_CONFIG);
        var parsed_biom_copy = fn.obj.deep_copy(parsed_biom);

        var expected = '[{"geode":{"_rgb":[255,33,155,1]},"clock":{"_rgb":[192,0,75,1]},"tire":{"_rgb":[213,1,92,1]},"banana":{"_rgb":[255,112,216,1]},"eggplant":{"_rgb":[255,122,231,1]}},{"geode":{"hue":0,"chroma":100,"lightness":56.666666666666664},"clock":{"hue":0,"chroma":100,"lightness":30},"tire":{"hue":0,"chroma":100,"lightness":36.666666666666664},"banana":{"hue":0,"chroma":100,"lightness":83.33333333333333},"eggplant":{"hue":0,"chroma":100,"lightness":90}}]';

        var actual = biom.colors_from_parsed_biom(parsed_biom);

        expect(JSON.stringify(actual)).to.equal(expected);
      });

      it("doesn't change parsed_biom", function () {
        helper.it_doesnt_change_parsed_biom(biom.colors_from_parsed_biom, biom_str);
      });
    });

    describe("inverse_evenness", function () {
      var parsed_biom      = Papa.parse(biom_str, helper.PAPA_CONFIG);
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

        helper.expect_stringify_equal(actual, expected);
      });

      it("doesn't change parsed_biom", function () {
        helper.expect_stringify_equal(parsed_biom, parsed_biom_copy);
      });
    });

    describe("make_tsv_string", function () {
      it("makes the color map string", function () {
        var biom_str      = "name\tsample_1\ngeode\t5\nclock\t1\ntire\t2\nbanana\t9\neggplant\t10";
        var parsed_biom   = Papa.parse(biom_str, helper.PAPA_CONFIG);
        var ret_val       = biom.colors_from_parsed_biom(parsed_biom);
        var colors        = ret_val[0];
        var color_details = ret_val[1];

        var expected = "name\tbranch_color\tleaf_label_color\tleaf_dot_color\ngeode\t#ff219b\t#ff219b\t#ff219b\nclock\t#c0004b\t#c0004b\t#c0004b\ntire\t#d5015c\t#d5015c\t#d5015c\nbanana\t#ff70d8\t#ff70d8\t#ff70d8\neggplant\t#ff7ae7\t#ff7ae7\t#ff7ae7";

        var actual = biom.make_tsv_string(colors);

        expect(actual).to.equal(expected);
      });
    });

    describe("make_biom_with_colors_hmtl", function () {
      it("makes the counts_with_colors.html file", function () {
        var parsed_biom   = Papa.parse(biom_str, helper.PAPA_CONFIG);
        var ret_val       = biom.colors_from_parsed_biom(parsed_biom);
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
        var biom_str = "name\tsample_1\ngeode\t5\nclock\t1\ntire\t2\nbanana\t9\neggplant\t10";

        var expected = '{"data":[{"name":"geode","sample_1":5},{"name":"clock","sample_1":1},{"name":"tire","sample_1":2},{"name":"banana","sample_1":9},{"name":"eggplant","sample_1":10}],"errors":[],"meta":{"delimiter":"\\t","linebreak":"\\n","aborted":false,"truncated":false,"cursor":57,"fields":["name","sample_1"]}}';

        var actual = JSON.stringify(biom.parse_biom_file_str(biom_str));

        expect(actual).to.equal(expected);
      });
    });
  });

  // These have two fake fields
  context("with two sample biom file", function () {
    var biom_str = "name\tsample_1\tsample_2\ngeode\t5\t5\nclock\t1\t10\ntire\t2\t9\nbanana\t9\t2\neggplant\t10\t1";

    describe("colors_from_parsed_biom", function () {
      it("returns color info", function () {
        // inspect_file.rb spec/test_files/biom_single_sample.txt
        var biom_str    = "name\tsample_1\tsample_2\ngeode\t5\t5\nclock\t1\t10\ntire\t2\t9\nbanana\t9\t2\neggplant\t10\t1";
        var parsed_biom = Papa.parse(biom_str, helper.PAPA_CONFIG);

        var ret_val = biom.colors_from_parsed_biom(parsed_biom);


        var expected = '[{"geode":{"_rgb":[71,71,71,1]},"clock":{"_rgb":[0,254,225,1]},"tire":{"_rgb":[152,243,225,1]},"banana":{"_rgb":[255,216,234,1]},"eggplant":{"_rgb":[255,215,241,1]}},{"geode":{"hue":7.016568964348905e-10,"chroma":0,"lightness":30},"clock":{"hue":180,"chroma":56.05030130784866,"lightness":90},"tire":{"hue":180,"chroma":31.596156436095836,"lightness":90},"banana":{"hue":2.0045678826123686e-15,"chroma":31.596156436095836,"lightness":90},"eggplant":{"hue":7.794697788552537e-16,"chroma":56.05030130784866,"lightness":90}}]';

        expect(JSON.stringify(ret_val)).to.equal(expected);
      });
    });

    describe("inverse_evenness", function () {
      it("gives the inverse of evenness", function () {
        var expected = {
          geode: 0,
          clock: 0.5605030130784866,
          tire: 0.31596156436095835,
          banana: 0.31596156436095835,
          eggplant: 0.5605030130784866
        };

        helper.test_inverse_evenness(biom_str, expected);
      });
    });


    describe("make_tsv_string", function () {
      it("makes the color map string", function () {
        // inspect_file.rb spec/test_files/biom_single_sample.txt
        var biom_str    = "name\tsample_1\tsample_2\ngeode\t5\t5\nclock\t1\t10\ntire\t2\t9\nbanana\t9\t2\neggplant\t10\t1";
        var parsed_biom = Papa.parse(biom_str, helper.PAPA_CONFIG);

        var ret_val = biom.colors_from_parsed_biom(parsed_biom);
        var colors  = ret_val[0];


        var expected = "name\tbranch_color\tleaf_label_color\tleaf_dot_color\ngeode\t#474747\t#474747\t#474747\nclock\t#d7ed7e\t#d7ed7e\t#d7ed7e\ntire\t#e6e6aa\t#e6e6aa\t#e6e6aa\nbanana\t#ffd9e1\t#ffd9e1\t#ffd9e1\neggplant\t#ffd8ec\t#ffd8ec\t#ffd8ec";

        var actual = biom.make_tsv_string(colors);

        expect(actual).to.equal(expected);
      });
    });

    describe("make_biom_with_colors_hmtl", function () {
      it("makes the counts_with_colors.html file", function () {
        // inspect_file.rb spec/test_files/biom_single_sample.txt
        var biom_str    = "name\tsample_1\tsample_2\ngeode\t5\t5\nclock\t1\t10\ntire\t2\t9\nbanana\t9\t2\neggplant\t10\t1";
        var parsed_biom = Papa.parse(biom_str, helper.PAPA_CONFIG);

        var ret_val       = biom.colors_from_parsed_biom(parsed_biom);
        var colors        = ret_val[0];
        var color_details = ret_val[1];


        // This is from the above biom str.
        var expected = "<!DOCTYPE html><head><style>table, th, td {border: 1px solid #2d2d2d; border-collapse: collapse} th, td {padding: 5px} th {text-align: left; border-bottom: 4px solid #2d2d2d} .thick-right-border {border-right: 3px solid #2d2d2d}.thick-left-border {border-left: 3px solid #2d2d2d}</style><title>Color table</title></head><body><table><tr>\\n<th>name</th><th class='thick-right-border'>color</th><th>hue</th><th>chroma/saturation</th><th class='thick-right-border'>lightness</th><th>centroid</th><th>evenness</th><th class='thick-right-border'>abundance</th><th>sample_1</th><th>sample_2</th></tr><tr><td>geode</td><td class='thick-right-border' style='background-color:#474747; color: white;'>#474747</td><td>0</td><td>0</td><td class='thick-right-border'>30</td><td>(0.17, 0.29)</td><td>1</td><td class='thick-right-border'>5</td><td>5</td><td>5</td></tr>\\n<tr><td>clock</td><td class='thick-right-border' style='background-color:#00fee1; color: black;'>#00fee1</td><td>180</td><td>56.05</td><td class='thick-right-border'>90</td><td>(-0.13, 0.29)</td><td>0.44</td><td class='thick-right-border'>5.5</td><td>1</td><td>10</td></tr>\\n<tr><td>tire</td><td class='thick-right-border' style='background-color:#98f3e1; color: black;'>#98f3e1</td><td>180</td><td>31.6</td><td class='thick-right-border'>90</td><td>(-0.09, 0.29)</td><td>0.68</td><td class='thick-right-border'>5.5</td><td>2</td><td>9</td></tr>\\n<tr><td>banana</td><td class='thick-right-border' style='background-color:#ffd8ea; color: black;'>#ffd8ea</td><td>0</td><td>31.6</td><td class='thick-right-border'>90</td><td>(0.3, 0.06)</td><td>0.68</td><td class='thick-right-border'>5.5</td><td>9</td><td>2</td></tr>\\n<tr><td>eggplant</td><td class='thick-right-border' style='background-color:#ffd7f1; color: black;'>#ffd7f1</td><td>0</td><td>56.05</td><td class='thick-right-border'>90</td><td>(0.32, 0.03)</td><td>0.44</td><td class='thick-right-border'>5.5</td><td>10</td><td>1</td></tr></table></body></html>";

        var actual = biom.make_counts_with_colors_html(parsed_biom, false, colors, color_details);

        expect(actual).to.equal(expected);
      });
    });

    describe("parse_biom_file_str", function () {
      it("returns parsed_biom from a biom file string", function () {
        // inspect_file.rb spec/test_files/biom_single_sample.txt
        var biom_str = "name\tsample_1\tsample_2\ngeode\t5\t5\nclock\t1\t10\ntire\t2\t9\nbanana\t9\t2\neggplant\t10\t1";

        var expected = '{"data":[{"name":"geode","sample_1":5,"sample_2":5},{"name":"clock","sample_1":1,"sample_2":10},{"name":"tire","sample_1":2,"sample_2":9},{"name":"banana","sample_1":9,"sample_2":2},{"name":"eggplant","sample_1":10,"sample_2":1}],"errors":[],"meta":{"delimiter":"\\t","linebreak":"\\n","aborted":false,"truncated":false,"cursor":77,"fields":["name","sample_1","sample_2"]}}';

        var actual = JSON.stringify(biom.parse_biom_file_str(biom_str));

        expect(actual).to.equal(expected);
      });
    });
  });

  // These have zero fake fields
  context("with three sample parsed biom", function () {
    var biom_str = "name\tsample_1\tsample_2\tsample_3\ngeode\t25\t40\t50\nclock\t10\t15\t94\ntire\t5\t8\t80\nbanana\t100\t140\t11\neggplant\t90\t130\t14";

    describe("colors_from_parsed_biom", function () {
      it("returns color info", function () {
        // inspect_file.rb spec/test_files/biom.txt
        var biom_str = "name\tsample_1\tsample_2\tsample_3\ngeode\t25\t40\t50\nclock\t10\t15\t94\ntire\t5\t8\t80\nbanana\t100\t140\t11\neggplant\t90\t130\t14";

        var parsed_biom = Papa.parse(biom_str, helper.PAPA_CONFIG);

        var ret_val = biom.colors_from_parsed_biom(parsed_biom);

        var expected = '[{"geode":{"_rgb":[112,119,119,1]},"clock":{"_rgb":[44,132,167,1]},"tire":{"_rgb":[0,86,143,1]},"banana":{"_rgb":[254,221,181,1]},"eggplant":{"_rgb":[235,213,184,1]}},{"geode":{"hue":-156.5867755536295,"chroma":3.404644946053126,"lightness":38.35443037974683},"clock":{"hue":-123.04128773812396,"chroma":40.33773333489108,"lightness":39.87341772151898},"tire":{"hue":-122.02444693243702,"chroma":54.69661049968042,"lightness":30},"banana":{"hue":77.63064628010596,"chroma":24.51002344080716,"lightness":90},"eggplant":{"hue":79.84167021375798,"chroma":21.487591889330528,"lightness":83.54430379746834}}]';

        expect(JSON.stringify(ret_val)).to.equal(expected);
      });
    });

    describe("inverse_evenness", function () {
      it("gives the inverse of evenness", function () {
        var expected = {
          geode: 0.03404644946053126,
          clock: 0.4033773333489108,
          tire: 0.5469661049968042,
          banana: 0.2451002344080716,
          eggplant: 0.21487591889330526
        };

        helper.test_inverse_evenness(biom_str, expected);
      });
    });

    describe("make_tsv_string", function () {
      it("makes the color map string", function () {
        // inspect_file.rb spec/test_files/biom.txt
        var biom_str = "name\tsample_1\tsample_2\tsample_3\ngeode\t25\t40\t50\nclock\t10\t15\t94\ntire\t5\t8\t80\nbanana\t100\t140\t11\neggplant\t90\t130\t14";

        var parsed_biom = Papa.parse(biom_str, helper.PAPA_CONFIG);

        var ret_val = biom.colors_from_parsed_biom(parsed_biom);
        var colors  = ret_val[0];


        var expected = "name\tbranch_color\tleaf_label_color\tleaf_dot_color\ngeode\t#707777\t#707777\t#707777\nclock\t#2c84a7\t#2c84a7\t#2c84a7\ntire\t#00568f\t#00568f\t#00568f\nbanana\t#feddb5\t#feddb5\t#feddb5\neggplant\t#ebd5b8\t#ebd5b8\t#ebd5b8";

        var actual = biom.make_tsv_string(colors);

        expect(actual).to.equal(expected);
      });
    });

    describe("make_biom_with_colors_hmtl", function () {
      it("makes the counts_with_colors.html file", function () {
        // inspect_file.rb spec/test_files/biom.txt
        var biom_str = "name\tsample_1\tsample_2\tsample_3\ngeode\t25\t40\t50\nclock\t10\t15\t94\ntire\t5\t8\t80\nbanana\t100\t140\t11\neggplant\t90\t130\t14";

        var parsed_biom = Papa.parse(biom_str, helper.PAPA_CONFIG);

        var ret_val       = biom.colors_from_parsed_biom(parsed_biom);
        var colors        = ret_val[0];
        var color_details = ret_val[1];


        // This is from the above biom str.
        var expected = "<!DOCTYPE html><head><style>table, th, td {border: 1px solid #2d2d2d; border-collapse: collapse} th, td {padding: 5px} th {text-align: left; border-bottom: 4px solid #2d2d2d} .thick-right-border {border-right: 3px solid #2d2d2d}.thick-left-border {border-left: 3px solid #2d2d2d}</style><title>Color table</title></head><body><table><tr><th>name</th><th class='thick-right-border'>color</th><th>hue</th><th>chroma/saturation</th><th class='thick-right-border'>lightness</th><th>centroid</th><th>evenness</th><th class='thick-right-border'>abundance</th><th>sample_1</th><th>sample_2</th><th>sample_3</th></tr><tr><td>geode</td><td class='thick-right-border' style='background-color:#707777; color: white;'>#707777</td><td>203.41</td><td>3.4</td><td class='thick-right-border'>38.35</td><td>(-0.13, -0.06)</td><td>0.97</td><td class='thick-right-border'>38.33</td><td>25</td><td>40</td><td>50</td></tr><tr><td>clock</td><td class='thick-right-border' style='background-color:#2c84a7; color: white;'>#2c84a7</td><td>236.96</td><td>40.34</td><td class='thick-right-border'>39.87</td><td>(-0.16, -0.24)</td><td>0.6</td><td class='thick-right-border'>39.67</td><td>10</td><td>15</td><td>94</td></tr><tr><td>tire</td><td class='thick-right-border' style='background-color:#00568f; color: white;'>#00568f</td><td>237.98</td><td>54.7</td><td class='thick-right-border'>30</td><td>(-0.16, -0.26)</td><td>0.45</td><td class='thick-right-border'>31</td><td>5</td><td>8</td><td>80</td></tr><tr><td>banana</td><td class='thick-right-border' style='background-color:#feddb5; color: black;'>#feddb5</td><td>77.63</td><td>24.51</td><td class='thick-right-border'>90</td><td>(0.06, 0.27)</td><td>0.75</td><td class='thick-right-border'>83.67</td><td>100</td><td>140</td><td>11</td></tr><tr><td>eggplant</td><td class='thick-right-border' style='background-color:#ebd5b8; color: black;'>#ebd5b8</td><td>79.84</td><td>21.49</td><td class='thick-right-border'>83.54</td><td>(0.05, 0.26)</td><td>0.79</td><td class='thick-right-border'>78</td><td>90</td><td>130</td><td>14</td></tr></table></body></html>";

        var actual = biom.make_counts_with_colors_html(parsed_biom, false, colors, color_details);

        expect(actual).to.equal(expected);
      });
    });

    describe("parse_biom_file_str", function () {
      it("returns parsed_biom from a biom file string", function () {
        // inspect_file.rb spec/test_files/biom.txt
        var biom_str = "name\tsample_1\tsample_2\tsample_3\ngeode\t25\t40\t50\nclock\t10\t15\t94\ntire\t5\t8\t80\nbanana\t100\t140\t11\neggplant\t90\t130\t14";


        var expected = '{"data":[{"name":"geode","sample_1":25,"sample_2":40,"sample_3":50},{"name":"clock","sample_1":10,"sample_2":15,"sample_3":94},{"name":"tire","sample_1":5,"sample_2":8,"sample_3":80},{"name":"banana","sample_1":100,"sample_2":140,"sample_3":11},{"name":"eggplant","sample_1":90,"sample_2":130,"sample_3":14}],"errors":[],"meta":{"delimiter":"\\t","linebreak":"\\n","aborted":false,"truncated":false,"cursor":110,"fields":["name","sample_1","sample_2","sample_3"]}}';

        var actual = JSON.stringify(biom.parse_biom_file_str(biom_str));

        expect(actual).to.equal(expected);
      });
    });
  });
});