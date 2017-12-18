// Copyright 2011 Jason Davies https://github.com/jasondavies/newick.js
function parseNewick(a)
{
  for(var e=[], r={}, s=a.split(/\s*(;|\(|\)|,|:)\s*/), t=0; t < s.length; t++) {
    var n = s[t];
    switch(n) {
      case "(" :
        var c = {};
        r.branchset = [c], e.push(r), r = c;
        break;

      case ",":
        var c = {};
        e[e.length-1].branchset.push(c), r = c;
        break;

      case ")": r = e.pop();
        break;

      case ":":
        break;

      default:
        var h = s[t-1];

        ")" == h || "(" == h || "," == h ? r.name = n : ":" == h && (r.length = parseFloat(n));
    }
  }
  return r
}

var d3 = require("d3");
var Papa = require('./papaparse.min.js');

var tree_str = "((geode:1, (clock:0.0, tire:5.3)Personmade:0.05)Round:6, (banana:1.7, eggplant:1.5)Fruit:3)ALL;\n";

function sort_descending(a, b)
{
  return (a.value - b.value) || d3.ascending(a.data.length, b.data.length);
}


var root = d3.hierarchy(parseNewick(tree_str), function(d) { return d.branchset; })
  .sum(function(d) { return d.branchset ? 0 : 1; })
  .sort(sort_descending);

var mapping_str = "name\tleaf_label_color\napple\tblue\npie\tgreen\n";
var tiny_mapping_str = "name\tleaf_label_color\nbanana\tblue\ngeode\tgreen\n";

var GREEN = "#008000";
var BLUE = "#0000ff";
var BLACK = "#000000";

// Bad mapping files
var bad_col_header_str = "name\tleaf_label_color\tbad column\napple\tblue\t1\npie\tgreen\t2\n";
var duplicate_row_str = "name\tleaf_label_color\napple\tblue\npie\tgreen\napple\tred\npie\tpink\n";
var non_specific_mapping_str = "name\tleaf_label_color\nan\tblue\ngeode\tgreen\neggplant\torange\n";
var missing_col_str = "name\tbranch_color\napple\tgreen\npie\n";
var no_name_col_str = "branch_color\tleaf_label_color\nbanana\tblue\ngeode\tgreen\n";
var too_many_cols_str = "name\tleaf_label_color\tleaf_label_color\tleaf_label_color\tleaf_label_color\tleaf_label_color\tleaf_label_color\tleaf_label_color\tleaf_label_color\tleaf_label_color\tleaf_label_color\tleaf_label_color\tleaf_label_color\tleaf_label_color\napple\tblue\tblue\tblue\tblue\tblue\tblue\tblue\tblue\tblue\tblue\tblue\tblue\tblue\n";
var too_few_cols_str = "name\napple\npie\n";
var duplicate_col_headers_str = "name\tleaf_label_color\tleaf_label_color\napple\tblue\tpurple\npie\tgreen\tpink\n";

var bad_color_str = "name\tleaf_label_color\ngeode\tarstoien\n";

var multi_tree_str = "(apple:1,(pie:1,tasty:1):1);\n(seanie:1,(amelia:1,ryan:1):1);\n"

var tree_with_semicolos = "('sea;nie':1,(amelia:1,\"ry;an\":1):1);";


//// TESTS

test('chomp() removes lf from end', function() {
  expect(chomp("apple\npie\n")).toBe("apple\npie");
});
test('chomp() removes cr from end', function() {
  expect(chomp("apple\rpie\r")).toBe("apple\rpie");
});
test('chomp() removes cr lf from end', function() {
  expect(chomp("apple\r\npie\r\n")).toBe("apple\r\npie");
});

test('json_keys() returns keys of json', function() {
  var json = {a: 1, b: 2};

  expect(json_keys(json)).toEqual(["a", "b"]);
});

test('json_each() applies the function to each k,v pair', function() {
  var ary = [];
  var obj = {a: 1, b: 2};
  json_each(obj, function(k, v) { ary.push(k); ary.push(v); });

  expect(ary).toEqual(["a", 1, "b", 2]);
});

test('bad_col_header() is true if the header is not valid', function() {
  expect(is_bad_col_header('apple')).toBe(true);
});
test('bad_col_header() is false if the header is valid', function() {
  expect(is_bad_col_header('new_name')).toBe(false);
});

test('has_non_specific_matching() returns true if there is non specific matching', function() {
  expect(has_non_specific_matching(root, parse_mapping_file(non_specific_mapping_str))).toBe(true);
});
test('has_non_specific_matching() returns false if there is not non-specific matching', function() {
  expect(has_non_specific_matching(root, parse_mapping_file(tiny_mapping_str))).toBe(false);
});

test('has_papa_errors() is true when the parsed csv has errors', function() {
  var csv = Papa.parse(chomp(missing_col_str), PAPA_CONFIG);

  expect(has_papa_errors(csv)).toBe(true);
});
test('has_papa_errors() is false when the parsed csv has no errors', function() {
  var csv = Papa.parse(chomp(mapping_str), PAPA_CONFIG);

  expect(has_papa_errors(csv)).toBe(false);
});


test('parse_mapping_file() returns the name2md object', function() {
  var obj = {
    "apple" : { "leaf_label_color" : BLUE },
    "pie" : { "leaf_label_color" : GREEN }
  };
  expect(parse_mapping_file(mapping_str)).toEqual(obj);
});
test('parse_mapping_file() returns null if columns headers are no good', function() {
  expect(parse_mapping_file(bad_col_header_str)).toBe(null);
});
test('parse_mapping_file() returns null if a row name is duplicated', function() {
  expect(parse_mapping_file(duplicate_row_str)).toBe(null);
});
test('parse_mapping_file() returns null if there were Papa parsing errors', function() {
  expect(parse_mapping_file(missing_col_str)).toBe(null);
});
test('parse_mapping_file() returns null if there is no "name" col header', function() {
  expect(parse_mapping_file(no_name_col_str)).toBe(null);
});
test('parse_mapping_file() returns null if there are too few columns', function() {
  expect(parse_mapping_file(too_few_cols_str)).toBe(null);
});
test('parse_mapping_file() returns null if there are too many columns', function() {
  expect(parse_mapping_file(too_many_cols_str)).toBe(null);
});
test('parse_mapping_file() returns null if there are duplicated column headers', function() {
  expect(parse_mapping_file(duplicate_col_headers_str)).toBe(null);
});
test('parse_mapping_file() sets bad colors to black instead', function(){
  var obj = {
    "geode" : { "leaf_label_color" : BLACK }
  };
  expect(parse_mapping_file(bad_color_str)).toEqual(obj);
});

test('push_unless_present() pushes an item if it is not there already', function() {
  var ary = [1,2];
  push_unless_present(ary, 3);
  expect(ary).toEqual([1,2,3]);
});
test('push_unless_present() doesnt push an item if it is already there', function() {
  var ary = [1,2];
  push_unless_present(ary, 1);
  expect(ary).toEqual([1,2]);
});

test('min_non_zero_len_in_tree() returns the length of the smallest branch in the tree', function(){
  expect(min_non_zero_len_in_tree(root)).toEqual(0.05);
});


test('has_multiple_trees() returns true if the neweck file looks like it has multiple trees', function () {
  expect(has_multiple_trees(multi_tree_str)).toEqual(true);
});
test('has_multiple_trees() returns false if the neweck file looks like it has a single tree', function () {
  expect(has_multiple_trees(tree_with_semicolos)).toEqual(false);
});