//= require spec_helper
//= require spec_helper_functions

describe("viewer draw helper functions", function () {
  describe("set_up_arc_data()", function () {
    it("returns the data to make the arcs", function () {
      var leaves = [
        { name: "0", metadata: { arc1_color: "black" } },
        { name: "1", metadata: { arc1_color: "black" } },
        { name: "2", metadata: { arc1_color: "black" } },
        { name: "3", metadata: { arc1_color: "green" } },
        { name: "4", metadata: { arc1_color: "blue" } },
        { name: "5", metadata: { arc1_color: "blue" } },
        { name: "6", metadata: { arc1_color: "blue" } },
        { name: "7", metadata: { arc1_color: "orange" } },
      ];

      var actual = set_up_arc_data(leaves, "arc1_color");

      var expected = {
        arc_start_nodes: [
          { name: "0", metadata: { arc1_color: "black" } },
          { name: "3", metadata: { arc1_color: "green" } },
          { name: "4", metadata: { arc1_color: "blue" } },
          { name: "7", metadata: { arc1_color: "orange" } },
        ],
        arc_stop_indices: [0, 2, 3, 6, 7],
      };

      spec_helper.expect_stringify_equal(actual, expected);
    });
  });
})
;