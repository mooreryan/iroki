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

    describe("center_matrix", function () {
      it("centers the columns of the matrix", function () {
        var M        = lalolib.array2mat([[1, 10], [-1, -10], [0, 0]]);
        var expected = lalolib.array2mat([[1, 10], [-1, -10], [0, 0]]);
        var actual   = fn.lalolib.center_matrix(M);

        spec_helper.expect_stringify_equal(actual, expected);
      });

      it("throws if the input M is not a matrix", function () {
        var func = function () {
          fn.lalolib.center_matrix([1, 2]);
        };

        expect(func).to.throw();
      });
    });

    describe("svd", function () {
      describe("variance_explained", function () {
        it("returns varaince explained by each PC", function () {
          var M   = spec_helper.longley.DATA;
          var svd = fn.lalolib.svd.svd(M, true);

          var expected = spec_helper.longley.VARIANCE_EXPLAINED;
          var actual   = fn.lalolib.svd.variance_explained(svd);

          actual.forEach(function (actual_val, idx) {
            expect(actual_val).to.be.closeTo(expected[idx], spec_helper.TOLERANCE);
          });
        });
      });

      describe("cumulative_variance", function () {
        it("returns varaince explained by each PC", function () {
          var M   = spec_helper.longley.DATA;
          var svd = fn.lalolib.svd.svd(M, true);

          var expected = spec_helper.longley.CUMULATIVE_VARIANCE;
          var actual   = fn.lalolib.svd.cumulative_variance(svd);

          actual.forEach(function (actual_val, idx) {
            expect(actual_val).to.be.closeTo(expected[idx], spec_helper.TOLERANCE);
          });
        });
      });

      describe("non_zero_singular_values", function () {
        it("returns all singular values above the zero cutoff", function () {
          var zero_cutoff = 0.01;
          var svd         = { s: [10, 1, 0.1, 0.01, 0.001, 0.0001] };

          var expected  = lalolib.array2mat([10, 1, 0.1, 0.01]);
          var actual = fn.lalolib.svd.non_zero_singular_values(svd, zero_cutoff);

          spec_helper.expect_stringify_equal(actual, expected);
        });
      });
    });
  });
});
