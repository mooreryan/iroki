// TODO these tests depend on a lot of global vars being set correctly to the defaults.
describe("biom", function () {
  var biom_spec_helper = {
    TOLERANCE : 1e-3,
    PAPA_CONFIG : {
      delimiter : "\t",
      header : true,
      dynamicTyping : true,
      skipEmptyLines : true
    }
  };

  biom_spec_helper.expect_stringify_equal = function (actual, expected) {
    expect(JSON.stringify(expected)).to.equal(JSON.stringify(actual));
  };


  context("with single sample parsed biom", function () {
    // inspect_file.rb spec/test_files/biom_single_sample.txt
    var biom_str    = "name\tsample_1\ngeode\t5\nclock\t1\ntire\t2\nbanana\t9\neggplant\t10";
    var parsed_biom = Papa.parse(biom_str, biom_spec_helper.PAPA_CONFIG);

    var ret_val       = biom.colors_from_parsed_biom(parsed_biom);
    var colors        = ret_val[0];
    var color_details = ret_val[1];

    describe("colors_from_parsed_biom", function () {
      it("returns color info", function () {
        var expected = '[{"geode":{"_rgb":[255,33,155,1]},"clock":{"_rgb":[192,0,75,1]},"tire":{"_rgb":[213,1,92,1]},"banana":{"_rgb":[255,112,216,1]},"eggplant":{"_rgb":[255,122,231,1]}},{"geode":{"hue":0,"chroma":100,"lightness":56.666666666666664},"clock":{"hue":0,"chroma":100,"lightness":30},"tire":{"hue":0,"chroma":100,"lightness":36.666666666666664},"banana":{"hue":0,"chroma":100,"lightness":83.33333333333333},"eggplant":{"hue":0,"chroma":100,"lightness":90}}]';

        expect(JSON.stringify(ret_val)).to.equal(expected);
      });
    });

    describe("make_tsv_string", function () {
      it("makes the color map string", function () {
        var expected = "name\tbranch_color\tleaf_label_color\tleaf_dot_color\ngeode\t#ff219b\t#ff219b\t#ff219b\nclock\t#c0004b\t#c0004b\t#c0004b\ntire\t#d5015c\t#d5015c\t#d5015c\nbanana\t#ff70d8\t#ff70d8\t#ff70d8\neggplant\t#ff7ae7\t#ff7ae7\t#ff7ae7";

        var actual = biom.make_tsv_string(colors);

        expect(actual).to.equal(expected);
      });
    });

    describe("make_biom_with_colors_hmtl", function () {
      it("makes the counts_with_colors.html file", function () {
        // This is from the above biom str.
        var expected = "<!DOCTYPE html><head><style>table, th, td {border: 1px solid #2d2d2d; border-collapse: collapse} th, td {padding: 5px} th {text-align: left; border-bottom: 4px solid #2d2d2d} .thick-right-border {border-right: 3px solid #2d2d2d}.thick-left-border {border-left: 3px solid #2d2d2d}</style><title>Color table</title></head><body><table><tr>\n<th>name</th><th class='thick-right-border'>color</th><th>hue</th><th>chroma/saturation</th><th class='thick-right-border'>lightness</th><th>centroid</th><th>evenness</th><th class='thick-right-border'>abundance</th><th>sample_1</th></tr><tr><td>geode</td><td class='thick-right-border' style='background-color:#ff219b; color: white;'>#ff219b</td><td>0</td><td>100</td><td class='thick-right-border'>56.67</td><td>(0.5, 0)</td><td>1</td><td class='thick-right-border'>5</td><td>5</td></tr>\n<tr><td>clock</td><td class='thick-right-border' style='background-color:#c0004b; color: white;'>#c0004b</td><td>0</td><td>100</td><td class='thick-right-border'>30</td><td>(0.5, 0)</td><td>1</td><td class='thick-right-border'>1</td><td>1</td></tr>\n<tr><td>tire</td><td class='thick-right-border' style='background-color:#d5015c; color: white;'>#d5015c</td><td>0</td><td>100</td><td class='thick-right-border'>36.67</td><td>(0.5, 0)</td><td>1</td><td class='thick-right-border'>2</td><td>2</td></tr>\n<tr><td>banana</td><td class='thick-right-border' style='background-color:#ff70d8; color: black;'>#ff70d8</td><td>0</td><td>100</td><td class='thick-right-border'>83.33</td><td>(0.5, 0)</td><td>1</td><td class='thick-right-border'>9</td><td>9</td></tr>\n<tr><td>eggplant</td><td class='thick-right-border' style='background-color:#ff7ae7; color: black;'>#ff7ae7</td><td>0</td><td>100</td><td class='thick-right-border'>90</td><td>(0.5, 0)</td><td>1</td><td class='thick-right-border'>10</td><td>10</td></tr></table></body></html>";

        var actual = biom.make_counts_with_colors_html(parsed_biom, false, colors, color_details);

        expect(actual).to.equal(expected);
      });
    });

    describe("parse_biom_file_str", function () {
      it("returns parsed_biom from a biom file string", function () {
        var expected = '{"data":[{"name":"geode","sample_1":5},{"name":"clock","sample_1":1},{"name":"tire","sample_1":2},{"name":"banana","sample_1":9},{"name":"eggplant","sample_1":10}],"errors":[],"meta":{"delimiter":"\\t","linebreak":"\\n","aborted":false,"truncated":false,"cursor":57,"fields":["name","sample_1"]}}';

        var actual = JSON.stringify(biom.parse_biom_file_str(biom_str));

        expect(actual).to.equal(expected);
      });
    });
  });
});