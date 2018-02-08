// This is a modified version of newick.js from https://github.com/jasondavies/newick.js
// Copyright 2011 Jason Davies
function newick__parse(tree_string)
{
  var quote_open = null;
  var quote_close = null;
  var quote_complete = null;

  var subtree;
  var errors = [];
  try {
    // Setting the branch length to 1 to handle the cases where a tree has no lengths.
    for(var ary = [],
          current_tree = { branch_length: 1 },
          tokens = tree_string.split(/\s*(;|\(|\)|,|:)\s*/),
          idx = 0;
        idx < tokens.length;
        idx++) {

      var token = tokens[idx];

      // Check if it is quoted.  If it is quoted and has split chars within it then it will only be one of the two.  If it is fully quoted it will be both.
      quote_open = token[0] === "'";
      quote_close = token[token.length-1] === "'";

      quote_complete = quote_open && quote_close;
      if (quote_complete) {
        // Remove the quotes, we don't want them in the name.
        token = token.replace(/'/g, "");
      }

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
          // This might be a name or a distance.
          var last_token = tokens[idx-1];

          if (last_token === ")" || last_token === "(" || last_token === ",") {
            current_tree.name = token;
          } else if (last_token === ":") {
            // The newick spec says branch length must follow the ':'.  So if you parseFloat(token) after a ':' and get NaN, either it's bad formatting of the input file, or they've got a colon in the name of a leaf node.
            var len = parseFloat(token);
            if (isNaN(len)) {
              current_tree.name += (":" + token);
              errors.push("WARNING -- Between token '" + tokens[idx-2] + "' and token '" + token + "' (the current token), there was a colon.  This is not allowed in the Newick spec.  The current name will be: '" + tokens[idx-2] + ":" + tokens[idx] + "'. If the current token looks like a distance, your Newick tree may be formatted incorrectly.  If the current name looks like a name from your tree's leaf nodes, you should be okay.");
            } else {
              current_tree.branch_length = parseFloat(token);
            }
          }
      }
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
