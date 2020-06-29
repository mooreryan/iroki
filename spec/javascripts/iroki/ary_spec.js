//= require ../spec_helper_functions

describe("IROKI", function () {
  describe("ary", function () {
    describe("in_place_numeric_sort", function () {
      it("sorts an array of numbers in place", function () {
        var ary = [1, 10.0, 2];

        IROKI.ary.in_place_numeric_sort(ary);

        spec_helper.expect_stringify_equal(ary, [1, 2, 10.0]);
      });

      it("actually works with strings and numbers", function() {
        // These seems pretty hackish, but it does "work".
        var ary = ["1", "10.0", 2];

        IROKI.ary.in_place_numeric_sort(ary);

        spec_helper.expect_stringify_equal(ary, ["1", 2, "10.0"]);
      })
    });
  });
});