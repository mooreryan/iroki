//= require spec_helper_functions

var qwfp, qfwpqwfp;

describe("parse_mapping_file()", function () {
  var BLUE  = "#0000ff";
  var GREEN = "#008000";

  context("GitHub Issue 64", function () {
    var mapping_str = "name\tleaf_label_color\n00123\tblue\n00.0012\tgreen\n";

    it("doesn't convert names to numbers (via dynamicTyping in PapaParse)", function () {
      var expected = JSON.stringify({
        "00123": { "leaf_label_color": BLUE },
        "00.0012": { "leaf_label_color": GREEN }
      });

      var actual = JSON.stringify(parse_mapping_file(mapping_str));

      expect(actual).to.equal(expected);
    });

  });
});