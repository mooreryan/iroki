//= require spec_helper_functions

describe("fn", function () {
  describe("fn.lalolib", function () {
    describe("fn.lalolib.apply_to_cols", function () {
      it("returns a new matrix with the function applied to each column in M", function () {
        var func = function (vals) {
          return vals.map(function (val) {
            return val * 10;
          });
        };

        var ary = [[1, 2, 3], [10, 20, 30]];
        var M   = lalolib.array2mat(ary);

        var expected = lalolib.array2mat([[10, 20, 30], [100, 200, 300]]);
        var actual   = fn.lalolib.apply_to_cols(M, func);

        spec_helper.expect_stringify_equal(actual, expected);
      });

      it("takes a function that takes the whole column as a parameter", function () {
        var func = fn.ary.mean;
        var ary  = [[1, 2, 3], [2, 3, 4]];
        var M    = lalolib.array2mat(ary);

        var expected = lalolib.array2mat([1.5, 2.5, 3.5]);
        var actual   = fn.lalolib.apply_to_cols(M, func);

        spec_helper.expect_stringify_equal(actual, expected);
      });

      it("throws if the type of M is not a matrix", function () {
        var func = function () {
          var f = fn.ary.mean;
          var M = lalolib.array2mat([1, 2]);

          fn.lalolib.apply_to_cols(M, f);
        };

        expect(func).to.throw();
      });
    });
  });
});