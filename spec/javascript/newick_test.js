// Testing to make sure it can handle a bunch of weird leaf names properly.

var tree_with_odd_number_of_single_quotes = "(apple, ('pie'good', lala));\n";
test('newick__parse() returns null when there is an odd number of single quotes.', function() {
  expect(newick__parse(tree_with_odd_number_of_single_quotes)).toBe(null);
});

var tree_with_colons = "(sean:ie,('ry:an', \"ame:lia\"));\n";
test('newick__parse() handles names with colons.', function() {
  var tree = newick__parse(tree_with_colons);
  var labels = newick__leaf_names(tree);
  var expected_labels = ["sean:ie", "ry:an", '"ame:lia"'];

  expect(labels).toEqual(expected_labels);
});

var tree_with_split_chars_in_single_quotes = "('apple':1, ('a(b);c,d:e':4, 'good'):8);\n";
test('newick__parse() handles split chars in single quoted labels.', function() {
  var tree = newick__parse(tree_with_split_chars_in_single_quotes);
  var labels = newick__leaf_names(tree);
  var expected_labels = ["apple", "a(b);c,d:e", "good"];

  expect(labels).toEqual(expected_labels);
});

var tree_with_commas_in_single_quotes = "(apple,('p,i,e', good));\n";
test('newick__parse() handles commas in single quoted labels.', function() {
  var tree = newick__parse(tree_with_commas_in_single_quotes);
  var labels = newick__leaf_names(tree);
  var expected_labels = ["apple", "p,i,e", "good"];

  expect(labels).toEqual(expected_labels);
});

var tree_with_spaces_no_quotes = "(apple pie, (is, really good));\n";
test('newick__parse() handles spaces even if they are not single quoted.', function() {
  var tree = newick__parse(tree_with_spaces_no_quotes);
  var labels = newick__leaf_names(tree);
  var expected_labels = ["apple pie", "is", "really good"];

  expect(labels).toEqual(expected_labels);
});

var tree_with_semicolons = "('sea;nie':1,(\"amelia\":1,\"ry;an\":1):1);";
test('newick__parse() handles semicolons in single quoted labels, but not in double quoted labels.', function() {
  var tree = newick__parse(tree_with_semicolons);
  var labels = newick__leaf_names(tree);
  var expected_labels = ["sea;nie", '"amelia"', '"ry'];

  expect(labels).toEqual(expected_labels);
});

var tree_with_quotes = "('seanie':1,(\"amelia\":2,ryan:1.5):3);";
test('newick__parse() keeps double quotes, drops single quotes.', function() {
  var tree = newick__parse(tree_with_quotes);
  var labels = newick__leaf_names(tree);
  var expected_labels = ["seanie", '"amelia"', "ryan"];

  expect(labels).toEqual(expected_labels);
});


// Get names from parsed newick file.
var tree_dup_leaf_names_str = "((Ryan:3,Ryan:40)ryan_clade:2.3,(Amelia:1,(Amelia:2,Amelia:1.5)small_amelia_clade:1.2)amelia_clade:3);\n";
test('newick__leaf_names() returns all leaf names in a tree', function() {
  var names = ["Ryan", "Ryan", "Amelia", "Amelia", "Amelia"];

  expect(newick__leaf_names(newick__parse(tree_dup_leaf_names_str))).toEqual(names);
});


