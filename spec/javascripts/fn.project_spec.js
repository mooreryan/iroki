//= require spec_helper_functions

describe("fn", function () {
  describe("fn.project", function () {
    describe("fn.project.project", function () {
      it("projects the data into the reduced space", function () {
        var expected = spec_helper.longley.PCA_SCORES_VAL;
        var M        = spec_helper.longley.DATA;

        var actual = fn.project.project(M).val;

        spec_helper.expect_stringify_equal(actual, expected);
      });
    });

    describe("fn.project.project_with_variance_cutoff", function () {
      it("returns pc scores with enough PCs to get the requested variance", function () {
        var expected = spec_helper.longley.PCA_SCORES_VAL_FIRST_TWO_COLS;
        var M        = spec_helper.longley.DATA;

        var actual = fn.project.project_with_variance_cutoff(M, 75).val;

        spec_helper.expect_stringify_equal(actual, expected);
      });
    });

    describe("fn.project.project_with_num_pcs_cutoff", function () {
      it("returns pc scores with only as many PCs as requested", function () {
        var expected = spec_helper.longley.PCA_SCORES_VAL_FIRST_TWO_COLS;
        var M        = spec_helper.longley.DATA;

        var actual = fn.project.project_with_num_pcs_cutoff(M, 2).val;

        spec_helper.expect_stringify_equal(actual, expected);
      });

      it("returns all PC's if you request more than there actually are", function() {
        var expected = spec_helper.longley.PCA_SCORES_VAL;
        var M        = spec_helper.longley.DATA;

        var actual = fn.project.project_with_num_pcs_cutoff(M, 200).val;

        spec_helper.expect_stringify_equal(actual, expected);
      })
    });
  });
});