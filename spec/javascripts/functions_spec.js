describe("fn", function () {
  var fn_spec_helper = {
    TOLERANCE : 1e-3,
    BIOM_STR : "name\ts1\ts2\napple\t10\t0\npie\t0\t10\n",
    PAPA_CONFIG : {
      delimiter : "\t",
      header : true,
      dynamicTyping : true,
      skipEmptyLines : true
    }
  };

  fn_spec_helper.PARSED_BIOM = Papa.parse(fn_spec_helper.BIOM_STR, fn_spec_helper.PAPA_CONFIG);

  fn_spec_helper.expect_stringify_equal = function (actual, expected) {
    expect(JSON.stringify(expected)).to.equal(JSON.stringify(actual));
  };


  describe("ary", function () {
    describe("deep_copy", function () {
      it("makes a new copy not a reference", function () {
        var a = [1, 2, 3];
        var b = fn.ary.deep_copy(a);
        b[1]  = "apple";

        expect(a).to.have.members([1, 2, 3]);
      });
    });

    describe("max", function () {
      it("returns the largest num in an array", function () {
        var ary = [1, 3, 1, 3];

        expect(fn.ary.max(ary)).to.equal(3);
      });

      it("works with a single element", function () {
        expect(fn.ary.max([1])).to.equal(1);
      });

      it("throws an error if the array is empty", function () {

        expect(function () {
          fn.ary.max([]);
        }).to.throw();
      });
    });

    describe("min", function () {
      it("returns the largest num in an array", function () {
        var ary = [1, 3, 1, 3];

        expect(fn.ary.min(ary)).to.equal(1);
      });

      it("works with a single element", function () {
        expect(fn.ary.min([1])).to.equal(1);
      });

      it("throws an error if the array is empty", function () {

        expect(function () {
          fn.ary.min([]);
        }).to.throw();
      });
    });

    describe("sum", function () {
      it("throws an error if the array is empty", function () {
        expect(function () {
          fn.ary.sum([]);
        }).to.throw();
      });

      it("returns the sum of the ary", function () {
        var ary = [1, 2, 3];

        expect(fn.ary.sum(ary)).to.equal(6);
      });
    });
  });

  describe("color", function () {
    describe("correct_luminance", function () {
      var hex       = "#4682e6";
      var lightness = 50;
      var old_min   = 0;
      var old_max   = 100;
      var new_min   = 0;
      var new_max   = 1;

      it("returns a chroma rgb");

      it("throws if lightness is a bad value", function () {
        expect(function () {
          fn.color.correct_luminance(hex, -100, old_min, old_max, new_min, new_max);
        }).to.throw();
      });

      it("makes luminance proportional to lightness", function () {
        var expected_luminance = 0.5;
        var actual_luminance   = fn.color.correct_luminance(hex, lightness, old_min, old_max, new_min, new_max).luminance();

        expect(actual_luminance).to.closeTo(expected_luminance, fn_spec_helper.TOLERANCE);
      });

      it("scales lightness first to the new luminance scale", function () {
        var expected_luminance = 0.25;
        var actual_luminance   = fn.color.correct_luminance(hex, lightness, old_min, old_max, new_min, 0.5).luminance();

        expect(actual_luminance).to.closeTo(actual_luminance, fn_spec_helper.TOLERANCE);
      });
    });

    describe("approximate_starting_color", function () {
      it("takes a hue angle and returns the approx starting hex code", function () {
        var starting_hue = 0;

        var expected = chroma.hcl(starting_hue, fn.color.var.approx_starting_chroma, fn.color.var.approx_starting_lightness).hex();
        var actual   = fn.color.approx_starting_color(starting_hue);

        expect(actual).to.equal(expected);
      });
    });
  });

  describe("diversity", function () {
    describe("shannon_entropy", function () {
      it("throws if the ary is empty", function () {
        var func = function () {
          fn.diversity.shannon_entropy([]);
        };
        expect(func).to.throw();
      });

      it("counts with one elem return 0", function () {
        expect(fn.diversity.shannon_entropy([1])).to.equal(0);
      });

      it("returns shannon entropy with base 2", function () {
        var expected = 1.485;
        var actual   = fn.math.round(fn.diversity.shannon_entropy([5, 3, 2]), 3);
        expect(actual).to.equal(expected);
      });

      it("is with zero counts", function () {
        var expected = 1;
        var actual   = fn.diversity.shannon_entropy([10, 0, 10]);

        expect(actual).to.equal(expected);
      });

      it("is zero if all counts are zero", function () {
        var expected = 0;
        var actual   = fn.diversity.shannon_entropy([0, 0, 0]);

        expect(actual).to.equal(expected);
      });
    });

    describe("evenness_entropy", function () {
      it("throws if the ary is empty", function () {
        var func = function () {
          fn.diversity.evenness_entropy([]);
        };
        expect(func).to.throw();
      });

      it("counts with one elem return 1", function () {
        expect(fn.diversity.evenness_entropy([1])).to.equal(1);
      });

      it("counts with all even proportion equal 1", function () {
        var expected = 1;
        var actual   = fn.diversity.evenness_entropy([5, 5, 5]);

        expect(actual).to.be.closeTo(expected, fn_spec_helper.TOLERANCE);
      });

      it("with proportion 1, evenness is 0", function () {
        var expected = 0;
        var actual   = fn.diversity.evenness_entropy([10, 0, 0]);

        expect(actual).to.equal(expected);
      });

      // TODO not sure what the actual behavior here should be
      it("is 0 if all counts are zero", function () {
        var expected = 0;
        var actual   = fn.diversity.evenness_entropy([0, 0, 0]);

        expect(actual).to.equal(expected);
      });
    });

  });

  describe("html", function () {
    describe("tag", function () {
      var tag = "th";
      var str = "apple";

      it("wraps the str in a tag", function () {
        expect(fn.html.tag(tag, str)).to.equal("<th>apple</th>");
      });

      it("will add whatever attr you pass in", function () {
        var attr = "class='silly-thing'";

        expect(fn.html.tag(tag, str, attr)).to.equal("<th class='silly-thing'>apple</th>");
      });

      it("gives an empty tag with empty string", function () {
        expect(fn.html.tag(tag, "")).to.equal("<th></th>");
      });
    });
  });

  describe("math", function () {
    describe("round", function () {
      it("rounds to a certain precesion", function () {
        expect(fn.math.round(4.41, 1)).to.equal(4.4);
      });
    });

    describe("scale", function () {
      it("returns avg of new_min and new_max if old_min and old_max are equal", function () {
        var val     = 1,
            old_min = 1,
            old_max = 1,
            new_min = 10,
            new_max = 20;

        var expected = 15,
            actual   = fn.math.scale(val, old_min, old_max, new_min, new_max);

        expect(actual).to.equal(expected);
      });

      it("scales the val", function () {
        var val     = 15,
            old_min = 10,
            old_max = 20,
            new_min = 100,
            new_max = 200;

        var expected = 150,
            actual   = fn.math.scale(val, old_min, old_max, new_min, new_max);

        expect(actual).to.equal(expected);
      });
    });
  });

  describe("parsed_biom", function () {
    describe("sample_angles", function () {
      it("returns the fields and angles", function () {
        var angle_offset = 0;
        var fields       = ["s1", "s2"];
        var angles       = [0, 180];
        var expected     = [fields, angles];
        var actual       = fn.parsed_biom.sample_angles(fn_spec_helper.PARSED_BIOM, angle_offset);

        fn_spec_helper.expect_stringify_equal(actual, expected);
      });

      it("handles a single sample biom file");
      it("hangles a two sample biom file");
      it("can take an angle offset");
    });

    describe("sample_fields", function () {
      it("returns only the sample fields", function () {
        var biom        = "name\ts1\ts2\tiroki_fake_1\tiroki_fake_2\napple\t10\t20\t0\t0\npie\t20\t10\t0\t0";
        var parsed_biom = Papa.parse(biom, fn_spec_helper.PAPA_CONFIG);

        var expected = ["s1", "s2"];
        var actual   = fn.parsed_biom.sample_fields(parsed_biom);

        fn_spec_helper.expect_stringify_equal(actual, expected);
      });
    });

    describe("num_real_samples", function () {
      it("counts the actual samples", function () {
        var biom        = "name\ts1\ts2\tiroki_fake_1\tiroki_fake_2\napple\t10\t20\t0\t0\npie\t20\t10\t0\t0";
        var parsed_biom = Papa.parse(biom, fn_spec_helper.PAPA_CONFIG);

        var expected = 2;
        var actual   = fn.parsed_biom.num_real_samples(parsed_biom);

        expect(actual).to.equal(expected);
      });
    });

    describe("abundance_across", function () {
      it("calculates relative abundance across all samples", function () {
        var expected = {
          abundance : { apple: 5, pie: 5},
          min_val : 5,
          max_val : 5
        };

        var actual = fn.parsed_biom.abundance_across(fn_spec_helper.PARSED_BIOM, g_ID_AVG_METHOD_ALL_SAMPLES_MEAN);
        
        fn_spec_helper.expect_stringify_equal(actual, expected)
      });

      it("calculates relative abundance across non-zero samples", function() {
        var expected = {
          abundance : { apple: 10, pie: 10},
          min_val : 10,
          max_val : 10
        };

        var actual = fn.parsed_biom.abundance_across(fn_spec_helper.PARSED_BIOM, g_ID_AVG_METHOD_NONZERO_SAMPLES_MEAN);

        fn_spec_helper.expect_stringify_equal(actual, expected)
      });

      it("handles leaves with all zero counts");
    });

    describe("sample_color_legend", function () {
      it("handles an angle offset");
      it("gives the sample to starting color string", function () {
        var angle_offset = 0;
        // Made with the inspect_file.rb program from fn_spec_helper.BIOM_STR
        var expected     = "name\tappoximate starting color\ns1\t#ed5e93\ns2\t#00a98f\n";
        var actual       = fn.parsed_biom.sample_color_legend(fn_spec_helper.PARSED_BIOM, angle_offset);

        expect(actual).to.equal(expected);
      });
    });

    describe("sample_color_legend_html", function () {
      it("handles an angle offset");
      it("gives the sample to starting color html output", function () {
        // Made with the inspect_file.rb program from fn_spec_helper.BIOM_STR
        var expected = "<!DOCTYPE html><head><style>table, th, td {border: 1px solid #2d2d2d; border-collapse: collapse} th, td {padding: 5px} th {text-align: left; border-bottom: 4px solid #2d2d2d} .thick-right-border {border-right: 3px solid #2d2d2d}.thick-left-border {border-left: 3px solid #2d2d2d}</style><title>Sample legend</title></head><body><table><tr><th class='thick-right-border'>name</th><th>appoximate starting color</th></tr><tr><td class='thick-right-border'>s1</td><td style='background-color: #ed5e93;'>#ed5e93</td></tr><tr><td class='thick-right-border'>s2</td><td style='background-color: #00a98f;'>#00a98f</td></tr></table></body></html>";

        var angle_offset = 0;

        var actual = fn.parsed_biom.sample_color_legend_html(fn_spec_helper.PARSED_BIOM, angle_offset);

        expect(actual).to.equal(expected);
      });
    });
  });

  describe("pt", function () {
    describe("is_zero", function () {
      it("is true if both x and y are 0", function () {
        var pt = { x : 0, y : 0 };
        expect(fn.pt.is_zero(pt)).to.be.true;
      });

      it("is false otherwise", function () {
        var pt = { x : 0.01, y : 0 };

        expect(fn.pt.is_zero(pt)).to.be.false;
      });
    });

    describe("mag", function () {
      it("gives the magnitude of the vector from origin to pt", function () {
        var pt       = { x : 3, y : 4 };
        var expected = 5;

        expect(fn.pt.mag(pt)).to.equal(5);
      });

      it("is zero if pt is the origin", function () {
        expect(fn.pt.mag({ x : 0, y : 0 })).to.equal(0);
      });
    });

    describe("new", function () {
      it("takes two vals and gives a pt", function () {
        var expected = { x : 3, y : 4 };
        var actual   = fn.pt.new(3, 4);

        fn_spec_helper.expect_stringify_equal(actual, expected);
      });
    });

    describe("to_s", function () {
      it("gives a pretty printed string", function () {
        var expected = "(3, 4)";
        var pt       = { x : 3, y : 4 };
        var actual   = fn.pt.to_s(pt);

        fn_spec_helper.expect_stringify_equal(actual, expected);
      });
    });
  });

  describe("str", function () {
    describe("chomp", function () {
      it("removes nl from end", function () {
        var str      = "apple\n";
        var expected = "apple";

        expect(fn.str.chomp(str)).to.equal(expected);
      });

      it("removes cr from end", function () {
        var str      = "apple\r";
        var expected = "apple";

        expect(fn.str.chomp(str)).to.equal(expected);
      });

      it("removes crnl from end", function () {
        var str      = "apple\r\n";
        var expected = "apple";

        expect(fn.str.chomp(str)).to.equal(expected);
      });

      it("returns same string if no newlines", function () {
        expect(fn.str.chomp("apple")).to.equal("apple");
      });
    });
  });

  describe("utils", function () {
    describe("is_fake_field", function () {
      it("identifies fake fields", function () {
        var fields   = ["s1", "iroki_fake_1", "iroki_fake_2"];
        var expected = [null, 1, 1];
        var actual   = fields.map(function (field) {
          var match = fn.utils.is_fake_field(field);
          return match ? match.length : null;
        });

        expect(actual).to.have.members(expected);
      });
    });

    describe("is_sample_field", function () {
      it("identifies sample fields", function () {
        var fields   = ["name", "s1", "iroki_fake_1", "iroki_fake_2"];
        var expected = [false, true, false, false];

        var actual = fields.map(function (field) {
          return fn.utils.is_sample_field(field);
        });

        expect(actual).to.have.members(expected);
      });
    });
  });
});