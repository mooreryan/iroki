describe("fn", function () {
  var fn_spec_globals = { tolerance : 1e-3 };

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

        expect(actual_luminance).to.closeTo(expected_luminance, fn_spec_globals.tolerance);
      });

      it("scales lightness first to the new luminance scale", function () {
        var expected_luminance = 0.25;
        var actual_luminance   = fn.color.correct_luminance(hex, lightness, old_min, old_max, new_min, 0.5).luminance();

        expect(actual_luminance).to.closeTo(actual_luminance, fn_spec_globals.tolerance);
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

        expect(actual).to.be.closeTo(expected, fn_spec_globals.tolerance);
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
    });
  });
});