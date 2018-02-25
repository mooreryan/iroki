describe("fn", function () {
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
  });
});