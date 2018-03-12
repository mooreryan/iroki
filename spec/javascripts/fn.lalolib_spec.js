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

    describe("fn.lalolib.scale_columns", function () {
      it("scales each column individually", function () {
        var M = lalolib.array2mat([
          [1, 50],
          [2, 40],
          [3, 30],
          [4, 20],
          [5, 10]
        ]);

        var new_min = 0,
            new_max = 1;

        var expected = lalolib.array2mat([
          [0, 1],
          [0.25, 0.75],
          [0.5, 0.5],
          [0.75, 0.25],
          [1, 0]
        ]);

        var actual = fn.lalolib.scale_columns(M, new_min, new_max);

        spec_helper.expect_stringify_equal(actual, expected);
      });
    });

    describe("fn.lalolib.first_n_cols", function () {
      it("takes the first n cols of the matrix", function () {
        var M = lalolib.array2mat([
          [1, 1, 1, 1],
          [2, 2, 2, 2],
          [3, 3, 3, 3]
        ]);

        var expected = lalolib.array2mat([
          [1, 1],
          [2, 2],
          [3, 3]
        ]);

        var actual = fn.lalolib.first_n_cols(M, 2);

        spec_helper.expect_stringify_equal(actual, expected);
      });

      it("throws if the number to take is > than number of cols");
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

          var expected = lalolib.array2mat([10, 1, 0.1, 0.01]);
          var actual   = fn.lalolib.svd.non_zero_singular_values(svd, zero_cutoff);

          spec_helper.expect_stringify_equal(actual, expected);
        });
      });

      describe("keep_X_percent_of_variance", function () {
        it("returns enough singular values to get the amount of variance you want", function () {
          var svd          = { s: lalolib.array2mat([10, 7, 5, 4, 1, 0.5, 0.1]) };
          var expected     = lalolib.array2mat([10, 7, 5]);
          var perc_to_keep = 90;

          var actual = fn.lalolib.svd.keep_X_percent_of_variance(svd, perc_to_keep);

          spec_helper.expect_stringify_equal(actual, expected);
        });
      });

      describe("pca_scores", function () {
        it("returns the pca scores", function () {
          // function same_sign(n1, n2) {
          //   return (n1 < 0 && n2 < 0) || (n1 > 0 && n2 > 0) || (n1 === 0 && n2 === 0) || (n1 === -0 && n2 === -0);
          // }

          var M   = spec_helper.longley.DATA;
          var svd = fn.lalolib.svd.svd(M, true);

          var expected = spec_helper.longley.PCA_SCORES;
          expected     = expected.val.map(function (v) {
            return Math.abs(v);
          });

          var actual = fn.lalolib.svd.pca_scores(svd);
          actual     = actual.val.map(function (v) {
            return Math.abs(v);
          });

          // TODO make sure the signs are actually either correct or completely opposite.
          actual.forEach(function (actual_val, idx) {
            expect(actual_val).to.be.closeTo(expected[idx], spec_helper.TOLERANCE);
          });
        });
      });

      describe("pca_scores_from_zero", function () {
        it("scales the scores to start at 0 instead of the min", function () {
          var expected = spec_helper.longley.PCA_SCORES_FROM_ZERO.val;
          var actual   = fn.lalolib.svd.pca_scores_from_zero(spec_helper.longley.PCA_SCORES).val;

          expected.forEach(function (expected_val, idx) {
            expect(actual[idx]).to.be.closeTo(expected_val, spec_helper.TOLERANCE);
          });
        });
      });
    });
  });
});
