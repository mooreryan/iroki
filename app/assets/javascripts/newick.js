// This is a modified version of newick.js from https://github.com/jasondavies/newick.js
// Copyright 2011 Jason Davies

// TODO better error handling
function newick__parse(tree_string)
{
  var in_quoted_token = null;
  var quoted_token = null;
  var last_token = null;
  var do_switch = true;
  var just_finished_quoted_token = null;


  // TODO this doesn't handle the '' problem.
  var odd_number_of_single_quotes = (tree_string.match(/'/g) || []).length % 2 == 1;
  if (odd_number_of_single_quotes) {
    alert("ERROR -- there was an odd number of single quote characters.  You likely have a mismatch somewhere.");

    return null;
  }

  // Continue parsing
  var subtree;
  var errors = [];
  try {
    // Setting the branch length to 1 to handle the cases where a tree has no lengths.
    for(var ary = [],
          current_tree = { branch_length: 1 },
          tokens = tree_string.split(/\s*('|;|\(|\)|,|:)\s*/),
          idx = 0;
        idx < tokens.length;
        idx++) {

      var token = tokens[idx];
      // console.log("at start of if, token: " + token + " and quoted token: " + quoted_token);

      if (token == "'") {
        if (in_quoted_token) { // currently in a quoted token
          // This quote terminates the quoted token.
          token = quoted_token;

          // Do switch
          do_switch = true;
          just_finished_quoted_token = true;

          quoted_token = null;
          in_quoted_token = false;
        } else { // not in a quoted token. start one.

          do_switch = false;
          just_finished_quoted_token = false;

          in_quoted_token = true;
          quoted_token = "";
        }
      } else if (in_quoted_token) {

        do_switch = false;
        just_finished_quoted_token = false;
        // don't start the switch yet, add this token to the quoted_token
        quoted_token += token;
      } else {
        do_switch = true;
        just_finished_quoted_token = false;
      }

      if (do_switch) {
        switch(token) {
          case "(" : // start of a new (sub)tree
            subtree = { branch_length: 1 };

            current_tree.branchset = [subtree];

            ary.push(current_tree);

            current_tree = subtree;

            break;

          case ",":
            subtree = { branch_length: 1 };
            var last_branchset = ary[ary.length - 1];
            last_branchset.branchset.push(subtree);

            current_tree = subtree;

            break;

          case ")": // end of a (sub)tree
            current_tree = ary.pop();
            break;

          case ":":
            break;

          default:
            // Whitespace will end up here

            last_token = tokens[idx-1];

            // This might be a name or a distance.

            if (last_token === ")" || last_token === "(" || last_token === "," || just_finished_quoted_token) {
              current_tree.name = token;
            } else if (last_token === ":") {
              // The newick spec says branch length must follow the ':'.  So if you parseFloat(token) after a ':' and get NaN, either it's bad formatting of the input file, or they've got a colon in the name of a leaf node.
              var len = parseFloat(token);
              if (isNaN(len)) {
                current_tree.name += (":" + token);
                errors.push("WARNING -- Between token '" + tokens[idx-2] + "' and token '" + token + "', there was a colon that was not in a single quoted token.  This is not allowed in the Newick spec.  The current name will be: '" + tokens[idx-2] + ":" + tokens[idx] + "'. If the current token looks like a distance, your Newick tree may be formatted incorrectly.  If the current name looks like a name from your tree's leaf nodes, you should be okay.");
              } else {
                current_tree.branch_length = parseFloat(token);
              }
            }
        }
      }

      // console.log("after if, token: " + token + " and quoted_token: " + quoted_token);
    }
  }
  catch (err) {
    alert("ERROR -- there was a tree parsing error: " + err.message + ".  Check the format of the tree file.");
  }

  if (errors.length > 0) {
    alert(errors.join("\n"));
  }

  // TODO catch other weird output errors.
  if (JSON.stringify(current_tree) === JSON.stringify({})) {
    alert("ERROR -- there was a tree parsing error.  Check the format of the tree file.");

    return null;
  } else {
    return current_tree;
  }
}

// Some helper functions for dealing with trees.
function newick__leaf_names(tree)
{
  var names = [];
  function get_names(branchset)
  {
    branchset.forEach(function (set) {
      if (set.branchset) {
        // Not at a leaf yet, recurse
        get_names(set.branchset);
      } else {
        // it's a leaf, get the name
        names.push(set.name);
      }
    });
  }

  var branchset = tree.branchset;
  get_names(branchset);

  return names;
}