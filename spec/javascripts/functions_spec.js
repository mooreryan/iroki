//= require spec_helper_functions

describe("fn", function () {
  describe("ary", function () {
    describe("filter_out_zeros", function () {
      it("returns a copy without the zeros", function () {
        var ary      = ["apple", 0, 1, 2, "pie", 0];
        var expected = ["apple", 1, 2, "pie"];
        var actual   = fn.ary.filter_out_zeros(ary);

        spec_helper.expect_stringify_equal(actual, expected);
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

    describe("mean", function () {
      it("takes the mean of the array", function () {
        expect(fn.ary.mean([1, 0, -1])).to.equal(0);
        expect(fn.ary.mean([1])).to.equal(1);
      });

      it("handles arrays that aren't all numbers");
      it("handles zero length arrays");
    });

    describe("range", function () {
      it("returns an array starting at zero with the requested number of elements", function () {
        spec_helper.expect_stringify_equal(fn.ary.range(0), []);
        spec_helper.expect_stringify_equal(fn.ary.range(1), [0]);
        spec_helper.expect_stringify_equal(fn.ary.range(2), [0, 1]);
        spec_helper.expect_stringify_equal(fn.ary.range(3), [0, 1, 2]);
      });

      it("can start the range from a number other than zero", function () {
        spec_helper.expect_stringify_equal(fn.ary.range(0, 0), []);
        spec_helper.expect_stringify_equal(fn.ary.range(1, 0), [0]);
        spec_helper.expect_stringify_equal(fn.ary.range(2, 0), [0, 1]);
        spec_helper.expect_stringify_equal(fn.ary.range(3, 0), [0, 1, 2]);

        spec_helper.expect_stringify_equal(fn.ary.range(1, -3), [-3]);
        spec_helper.expect_stringify_equal(fn.ary.range(2, 4), [4, 5]);
        spec_helper.expect_stringify_equal(fn.ary.range(3, -1), [-1, 0, 1]);
      });
    });

    describe("center", function () {
      it("subtracts the mean of all values in ary from each value", function () {
        var ary = [1, 2, 3, 4, 5];

        var expected = [-2, -1, 0, 1, 2];
        var actual   = fn.ary.center(ary);

        spec_helper.expect_stringify_equal(actual, expected);
      });

      it("throws if the array is empty", function () {
        var func = function () {
          fn.ary.center([]);
        };

        expect(func).to.throw();
      });

      it("throws if the mean is NaN", function () {
        var func = function () {
          fn.ary.center(["apple", 2, 3]);
        };

        expect(func).to.throw();
      });
    });

    describe("take", function () {
      it("takes the first N elements", function () {
        var ary      = [1, 2, 3];
        var expected = [1, 2];
        var actual   = fn.ary.take(ary, 2);

        spec_helper.expect_stringify_equal(actual, expected);
      });

      it("the array returned doesn't have references to original objects", function() {
        var ary = [{a: 10, b: 10}, {a: 100, b: 100}];
        var orig_ary = fn.obj.deep_copy(ary);
        var first_part = fn.ary.take(ary, 1);
        first_part[0].a = 1000;

        spec_helper.expect_stringify_equal(ary, orig_ary);
      });

      context("when number requested is more than the length", function () {
        it("returns as many elements as possible", function () {
          var ary      = [1, 2, 3];
          var expected = [1, 2, 3];
          var actual   = fn.ary.take(ary, 200);

          spec_helper.expect_stringify_equal(actual, expected);
        });
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

        expect(actual_luminance).to.closeTo(expected_luminance, spec_helper.TOLERANCE);
      });

      it("scales lightness first to the new luminance scale", function () {
        var expected_luminance = 0.25;
        var actual_luminance   = fn.color.correct_luminance(hex, lightness, old_min, old_max, new_min, 0.5).luminance();

        expect(actual_luminance).to.closeTo(actual_luminance, spec_helper.TOLERANCE);
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

        expect(actual).to.be.closeTo(expected, spec_helper.TOLERANCE);
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

    describe("degrees_to_radians", function () {
      it("converts degrees to radians", function () {
        expect(fn.math.degrees_to_radians(0)).to.equal(0);
        expect(fn.math.degrees_to_radians(90)).to.equal(Math.PI / 2);
        expect(fn.math.degrees_to_radians(180)).to.equal(Math.PI);
        expect(fn.math.degrees_to_radians(270)).to.equal(3 * Math.PI / 2);
      });
    });

    describe("radians_to_degrees", function () {
      it("converts radians to degrees", function () {
        expect(fn.math.radians_to_degrees(0)).to.equal(0);
        expect(fn.math.radians_to_degrees(Math.PI / 2)).to.equal(90);
        expect(fn.math.radians_to_degrees(Math.PI)).to.equal(180);
        expect(fn.math.radians_to_degrees(3 * Math.PI / 2)).to.equal(270);
      });
    });

  });

  describe("obj", function () {
    describe("deep_copy", function () {
      it("makes a new copy not a reference", function () {
        var a = [1, 2, 3];
        var b = fn.obj.deep_copy(a);
        b[1]  = "apple";

        expect(a).to.have.members([1, 2, 3]);
      });
    });

    describe("each", function () {
      it("applies the func for each key values pair", function () {
        var obj      = { a: 1, b: 2 };
        var ary      = [];
        var expected = ["a", 1, "b", 2];

        fn.obj.each(obj, function (key, val) {
          ary.push(key);
          ary.push(val);
        });

        spec_helper.expect_stringify_equal(ary, expected);
      });
    });

    describe("vals", function () {
      it("gives the values of an obj", function () {
        var actual   = fn.obj.vals({ a: 1, b: "apple" });
        var expected = [1, "apple"];

        spec_helper.expect_stringify_equal(actual, expected);
      });

      it("gives an empty array if there are no keys", function () {
        spec_helper.expect_stringify_equal(fn.obj.vals({}), []);
      });
    });

    describe("min_val", function () {
      it("returns NaN if there are non float parseable things", function () {
        var obj    = { apple: "pie", peach: 234 };
        var actual = fn.obj.min_val(obj);

        expect(actual).to.be.NaN;
      });

      it("returns the min val", function () {
        var obj      = { apple: -3, peach: 234 };
        var expected = -3;
        var actual   = fn.obj.min_val(obj);

        expect(actual).to.equal(expected);

      });
    });

    describe("max_val", function () {
      it("returns NaN if there are non float parseable things", function () {
        var obj    = { apple: "pie", peach: 234 };
        var actual = fn.obj.max_val(obj);

        expect(actual).to.be.NaN;
      });

      it("returns the max val", function () {
        var obj      = { apple: -3, peach: 234 };
        var expected = 234;
        var actual   = fn.obj.max_val(obj);

        expect(actual).to.equal(expected);
      });
    });

    describe("min_numeric_val", function () {
      it("returns the smallest thing that can be parsed into a float", function () {
        var obj      = { apple: "pie", is: "3", good: -3, yay: 3.2 };
        var expected = -3;
        var actual   = fn.obj.min_numeric_val(obj);

        expect(actual).to.equal(expected);
      });
    });

    describe("max_numeric_val", function () {
      it("returns the smallest thing that can be parsed into a float", function () {
        var obj      = { apple: "pie", is: "3", good: -3, yay: 3.2 };
        var expected = 3.2;
        var actual   = fn.obj.max_numeric_val(obj);

        expect(actual).to.equal(expected);
      });
    });

    describe("numeric_vals", function () {
      it("returns only numeric parseable vals", function () {
        var obj      = { a: "apple", b: 2.3, c: "3" };
        var expected = [2.3, "3"];
        var actual   = fn.obj.numeric_vals(obj);

        spec_helper.expect_stringify_equal(actual, expected);
      });
    });

  });

  describe("pt", function () {
    describe("is_zero", function () {
      it("is true if both x and y are 0", function () {
        var pt = { x: 0, y: 0 };
        expect(fn.pt.is_zero(pt)).to.be.true;
      });

      it("is false otherwise", function () {
        var pt = { x: 0.01, y: 0 };

        expect(fn.pt.is_zero(pt)).to.be.false;
      });
    });

    describe("is_equal", function () {
      it("is true if two points are within a certain tolerance", function () {
        expect(fn.pt.is_equal(fn.pt.new(1, 1), fn.pt.new(1, 1.05), 0.1)).to.be.true;
      });

      it("is false if two points are outside the tolerance", function () {
        expect(fn.pt.is_equal(fn.pt.new(1, 1), fn.pt.new(1, 1.05), 0.01)).to.be.false;
      });
    });

    describe("mag", function () {
      it("gives the magnitude of the vector from origin to pt", function () {
        var pt       = { x: 3, y: 4 };
        var expected = 5;

        expect(fn.pt.mag(pt)).to.equal(5);
      });

      it("is zero if pt is the origin", function () {
        expect(fn.pt.mag({ x: 0, y: 0 })).to.equal(0);
      });
    });

    describe("new", function () {
      it("takes two vals and gives a pt", function () {
        var expected = { x: 3, y: 4 };
        var actual   = fn.pt.new(3, 4);

        spec_helper.expect_stringify_equal(actual, expected);
      });
    });

    describe("on_circle", function () {
      it("gives the point on the circle", function () {

        spec_helper.expect_points_to_be_equal(fn.pt.on_circle(0, 1), fn.pt.new(1, 0));
        spec_helper.expect_points_to_be_equal(fn.pt.on_circle(Math.PI / 2, 1), fn.pt.new(0, 1));
        spec_helper.expect_points_to_be_equal(fn.pt.on_circle(Math.PI, 1), fn.pt.new(-1, 0));
        spec_helper.expect_points_to_be_equal(fn.pt.on_circle(3 * Math.PI / 2, 1), fn.pt.new(0, -1));
        spec_helper.expect_points_to_be_equal(fn.pt.on_circle(2 * Math.PI, 1), fn.pt.new(1, 0));
      });
    });

    describe("to_s", function () {
      it("gives a pretty printed string", function () {
        var expected = "(3, 4)";
        var pt       = { x: 3, y: 4 };
        var actual   = fn.pt.to_s(pt);

        spec_helper.expect_stringify_equal(actual, expected);
      });
    });

    describe("fn.pt.signed_area_origin_triangle", function () {
      it("gives signed area of the origin triangle", function () {
        var p1       = fn.pt.new(1, 0);
        var p2       = fn.pt.new(0, 1);
        var expected = 0.5;
        var actual   = fn.pt.signed_area_origin_triangle(p1, p2);

        expect(actual).to.equal(expected);
      });

      it("handles weird triangles", function () {
        var x1 = Math.cos(Math.PI / 3);
        var y1 = Math.sin(Math.PI / 3);

        var x2 = Math.cos(Math.PI / 4);
        var y2 = Math.cos(Math.PI / 4);

        var p1 = fn.pt.new(x1, y1);
        var p2 = fn.pt.new(x2, y2);

        var expected = (0.5 * (x1 * y2 - x2 * y1));
        var actual   = fn.pt.signed_area_origin_triangle(p1, p2);

        expect(actual).to.equal(expected);
      });

      it("throws if one of the points is zero", function () {
        expect(function () {
          fn.pt.signed_area_origin_triangle(fn.pt.new(0, 0), fn.pt.new(1, 0));
        }).to.throw();

        expect(function () {
          fn.pt.signed_area_origin_triangle(fn.pt.new(1, 0), fn.pt.new(0, 0));
        }).to.throw();
      });
    });

    describe("fn.pt.centroid_origin_triangle", function () {
      it("gives signed area of the origin triangle", function () {
        var p1       = fn.pt.new(1, 0);
        var p2       = fn.pt.new(0, 1);
        var expected = fn.pt.new(1 / 3, 1 / 3);
        var actual   = fn.pt.centroid_origin_triangle(p1, p2);

        spec_helper.expect_points_to_be_equal(actual, expected);
      });

      it("handles weird triangles", function () {
        var x1 = Math.cos(Math.PI / 3);
        var y1 = Math.sin(Math.PI / 3);

        var x2 = Math.cos(Math.PI / 4);
        var y2 = Math.cos(Math.PI / 4);

        var p1 = fn.pt.new(x1, y1);
        var p2 = fn.pt.new(x2, y2);

        var expected = fn.pt.new((x1 + x2) / 3, (y1 + y2) / 3);
        var actual   = fn.pt.centroid_origin_triangle(p1, p2);

        spec_helper.expect_points_to_be_equal(actual, expected);
      });

      it("throws if one of the points is zero", function () {
        expect(function () {
          fn.pt.centroid_origin_triangle(fn.pt.new(0, 0), fn.pt.new(1, 0));
        }).to.throw();

        expect(function () {
          fn.pt.centroid_origin_triangle(fn.pt.new(1, 0), fn.pt.new(0, 0));
        }).to.throw();
      });
    });

    describe("fn.pt.origin_triangles", function () {
      it("returns each origin triangle for a set of points", function () {
        var p1 = fn.pt.new(1, 0);
        var p2 = fn.pt.new(0, 1);
        var p3 = fn.pt.new(-1, 0);
        var p4 = fn.pt.new(0, -1);

        var points   = [p1, p2, p3, p4];
        var expected = [[p1, p2], [p2, p3], [p3, p4], [p4, p1]];

        var actual = fn.pt.origin_triangles(points);

        spec_helper.expect_stringify_equal(actual, expected);


      });

      context("it throws with less than two points", function () {
        var points = [fn.pt.new(1, 0)];
        var func   = function () {
          fn.pt.origin_triangles(points);
        };

        expect(func).to.throw();
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