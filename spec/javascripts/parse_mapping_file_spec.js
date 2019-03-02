//= require spec_helper
//= require spec_helper_functions

context("parse_mapping_file.js", function () {
  var good_mapping_str = "name\tleaf_label_color\napple\tblue\npie\tgreen\n";
  var missing_col_str  = "name\tbranch_color\napple\tgreen\npie\n";


  context("helper functions defined in this file", function () {
    describe("is_bad_col_header()", function () {
      it("returns true if the header is not valid", function () {
        expect(is_bad_col_header("apple")).to.be.true;
      });

      it("returns false if the header is one of the leaf dot options", function () {
        LEAF_DOT_OPTIONS.forEach(function (opt) {
          expect(is_bad_col_header(opt)).to.be.false;
        });
      });

      it("returns false if the header is one of the leaf label options", function () {
        LEAF_LABEL_OPTIONS.forEach(function (opt) {
          expect(is_bad_col_header(opt)).to.be.false;
        });
      });
      it("returns false if the header is one of the branch options", function () {
        BRANCH_OPTIONS.forEach(function (opt) {
          expect(is_bad_col_header(opt)).to.be.false;
        });
      });
      it("returns false if header matches one of the bar options", function () {
        expect(is_bad_col_header("bar_height")).to.be.false;
        expect(is_bad_col_header("bar_color")).to.be.false;

        expect(is_bad_col_header("bar3_height")).to.be.false;
        expect(is_bad_col_header("bar3_color")).to.be.false;

        expect(is_bad_col_header("bar33_height")).to.be.false;
        expect(is_bad_col_header("bar33_color")).to.be.false;
      });
      it("returns false if header matches one of the arc options", function () {
        expect(is_bad_col_header("arc_color")).to.be.false;

        expect(is_bad_col_header("arc3_color")).to.be.false;

        expect(is_bad_col_header("arc33_color")).to.be.false;
      });
    });

    describe("bad_bar_fields()", function () {
      it("returns null if there are no bar options", function () {
        var fields = ["name", "dot_color"];

        expect(bad_bar_fields(fields)).to.be.null;
      });

      it("doesn't care about the field order", function () {
        var fields = ["name", "bar2_height", "bar1_color", "bar1_height", "bar2_color"];

        expect(bad_bar_fields(fields)).to.be.null;
      });

      it("returns null if the bar fields are fine", function () {
        var fields = ["name", "bar2_height", "bar1_height", "bar1_color"];

        expect(bad_bar_fields(fields)).to.be.null;
      });

      it("returns bad heights if bar heights skip a number", function () {
        var fields = ["name", "bar1_height", "bar3_height"];

        var actual   = bad_bar_fields(fields);
        var expected = ["height", ["bar3_height"]];

        alert("SOTIEN:  " + expected);

        spec_helper.expect_stringify_equal(actual, expected);
      });

      it("returns false if bar heights doesn't have a 1", function () {
        var fields = ["name", "bar2_height", "bar3_height"];

        var actual   = bad_bar_fields(fields);
        var expected = ["height", ["bar2_height", "bar3_height"]];

        spec_helper.expect_stringify_equal(actual, expected);
      });

      it("returns false if bar color doesn't have a matching height", function () {
        var fields = ["bar1_height", "bar3_color"];

        var actual   = bad_bar_fields(fields);
        var expected = ["color", ["bar3_color"]];

        spec_helper.expect_stringify_equal(actual, expected);
      });
    });

    describe("bad_arc_fields()", function () {
      it("returns null if there are no arc options", function () {
        var fields = ["name", "leaf_dot_color"];

        expect(bad_arc_fields(fields)).to.be.null;
      });

      it("doesn't care about the field order", function () {
        var fields = ["name", "arc2_color", "arc1_color"];

        expect(bad_arc_fields(fields)).to.be.null;
      });

      it("returns null if the arc fields are fine", function () {
        var fields = ["name", "arc1_color"];

        expect(bad_arc_fields(fields)).to.be.null;
      });

      it("returns bad colors if arc colors skip a number", function () {
        var fields = ["name", "arc1_color", "arc3_color"];

        var actual   = bad_arc_fields(fields);
        var expected = ["color", ["arc3_color"]];

        alert("SOTIEN:  " + expected);

        spec_helper.expect_stringify_equal(actual, expected);
      });

      it("returns false if arc colors doesn't have a 1", function () {
        var fields = ["name", "arc2_color", "arc3_color"];

        var actual   = bad_arc_fields(fields);
        var expected = ["color", ["arc2_color", "arc3_color"]];

        spec_helper.expect_stringify_equal(actual, expected);
      });
    });

    describe("has_papa_errors()", function () {
      it("returns true when the parsed csv has errors", function () {
        var csv = Papa.parse(chomp(missing_col_str), PAPA_CONFIG);

        expect(has_papa_errors(csv)).to.be.true;
      });

      it("returns false when the parsed csv has no errors", function () {
        var csv = Papa.parse(chomp(good_mapping_str), PAPA_CONFIG);

        expect(has_papa_errors(csv)).to.be.false;
      });
    });
  });

  describe("parse_mapping_file()", function () {
    var BLUE  = "#0000ff";
    var GREEN = "#008000";
    var BLACK = "#000000";

    it("returns the name2md object", function () {
      var expected = {
        "apple": { "leaf_label_color": BLUE },
        "pie": { "leaf_label_color": GREEN }
      };

      var actual = parse_mapping_file(good_mapping_str);

      spec_helper.expect_stringify_equal(actual, expected);
    });


    it("can handle R colors and Kelly colors", function () {
      var kelly_and_r_colors_str = "name\tleaf_label_color\nclock\tk_purple\ntire\tk_1\ngeode\tr_chocolate4";

      var r_chocolate4 = "#8B4513";
      var k_purple     = "#875692";

      var expected = {
        "clock": { "leaf_label_color": k_purple },
        "tire": { "leaf_label_color": k_purple },
        "geode": { "leaf_label_color": r_chocolate4 }
      };
      var actual   = parse_mapping_file(kelly_and_r_colors_str);

      spec_helper.expect_stringify_equal(actual, expected);
    });


    context("it does some preprocessing of mapping files", function () {
      it("strips spaces from the name column", function () {
        var with_spaces = "name\tbranch_color\n   apple    \t#ff00ff\n";

        var expected = {
          "apple": { "branch_color": "#ff00ff" }
        };
        var actual   = parse_mapping_file(with_spaces);

        spec_helper.expect_stringify_equal(actual, expected);
      });
    });

    context("it handles wonky input", function () {
      it("sets bad colors to black instead", function () {
        var bad_color_str = "name\tleaf_label_color\ngeode\tarstoien\n";

        var expected = {
          "geode": { "leaf_label_color": BLACK }
        };
        var actual   = parse_mapping_file(bad_color_str);

        spec_helper.expect_stringify_equal(actual, expected);
      });

      it("can handle hex codes without the starting # char", function () {
        var hex_codes_without_pound = "name\tbranch_color\ngeode\tFF00FF\n";

        var expected = {
          "geode": { "branch_color": "#ff00ff" }
        };
        var actual   = parse_mapping_file(hex_codes_without_pound);

        spec_helper.expect_stringify_equal(actual, expected);
      });

      it("can handle bar heights and colors", function () {
        var good_bar_stuff = "name\tbar1_height\tbar1_color\napple\t10\tptv_1\n";

        var expected = {
          "apple": { "bar1_height": 10, "bar1_color": "#EE7733" }
        };
        var actual = parse_mapping_file(good_bar_stuff);

        spec_helper.expect_stringify_equal(actual, expected);
      });

      it("can handle arc colors", function () {
        var good_stuff = "name\tarc1_color\napple\tptv_1\n";

        var expected = {
          "apple": { "arc1_color": "#EE7733" }
        };
        var actual = parse_mapping_file(good_stuff);

        spec_helper.expect_stringify_equal(actual, expected);
      });
    });

    context("returns null with bad mapping files", function () {
      it("if columns headers are no good", function () {
        var bad_col_header_str = "name\tleaf_label_color\tbad column\napple\tblue\t1\npie\tgreen\t2\n";

        expect(parse_mapping_file(bad_col_header_str)).to.be.null;
      });

      it("if a row name is duplicated", function () {
        var duplicate_row_str = "name\tleaf_label_color\napple\tblue\npie\tgreen\napple\tred\npie\tpink\n";

        expect(parse_mapping_file(duplicate_row_str)).to.be.null;
      });
      it("if there were Papa parsing errors", function () {
        expect(parse_mapping_file(missing_col_str)).to.be.null;
      });
      it("if there is no 'name' col header", function () {
        var no_name_col_str = "branch_color\tleaf_label_color\nbanana\tblue\ngeode\tgreen\n";

        expect(parse_mapping_file(no_name_col_str)).to.be.null;
      });
      it("if there are too few columns", function () {
        var too_few_cols_str = "name\napple\npie\n";

        expect(parse_mapping_file(too_few_cols_str)).to.be.null;
      });
      // It no longer does this.
      // it("if there are too many columns", function () {
      //   var too_many_cols_str = "name\tleaf_label_color\tleaf_label_color\tleaf_label_color\tleaf_label_color\tleaf_label_color\tleaf_label_color\tleaf_label_color\tleaf_label_color\tleaf_label_color\tleaf_label_color\tleaf_label_color\tleaf_label_color\tleaf_label_color\napple\tblue\tblue\tblue\tblue\tblue\tblue\tblue\tblue\tblue\tblue\tblue\tblue\tblue\n";
      //
      //   expect(parse_mapping_file(too_many_cols_str)).to.be.null;
      // });
      it("if there are duplicated column headers", function () {
        var duplicate_col_headers_str = "name\tleaf_label_color\tleaf_label_color\napple\tblue\tpurple\npie\tgreen\tpink\n";

        expect(parse_mapping_file(duplicate_col_headers_str)).to.be.null;
      });
      it("if there are bad bar headers", function () {
        var bad_bar_headers_str = "name\tbar3_height\napple\t30\n";

        expect(parse_mapping_file(bad_bar_headers_str)).to.be.null;
      });
      it("if there are bad arc headers", function () {
        var bad_arc_headers_str = "name\tarc3_color\napple\tblack\n";

        expect(parse_mapping_file(bad_arc_headers_str)).to.be.null;
      });

    });

    context("GitHub Issue 64", function () {
      var mapping_str = "name\tleaf_label_color\n00123\tblue\n00.0012\tgreen\n";

      it("doesn't convert names to numbers (via dynamicTyping in PapaParse)", function () {
        var expected = {
          "00123": { "leaf_label_color": BLUE },
          "00.0012": { "leaf_label_color": GREEN }
        };

        var actual = parse_mapping_file(mapping_str);

        spec_helper.expect_stringify_equal(actual, expected);
      });
    });
  });
});

