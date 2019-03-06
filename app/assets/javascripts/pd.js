global.pd         = {};
global.pd.html    = {};
global.pd.html.id = {};

global.pd.html.id.upload_tree_form   = "pd-upload-tree-form";
global.pd.html.id.upload_tree_input  = "pd-uploader-tree";
global.pd.html.id.upload_tree_submit = "pd-submit";

global.pd.html.id.upload_group_input = "pd-group-names";

global.pd.html.id.results = "pd-results";


global.pd.fn = {};

global.pd.fn.main = function () {
  var tree_uploader  =
        document.getElementById(global.pd.html.id.upload_tree_input);
  var group_uploader =
        document.getElementById(global.pd.html.id.upload_group_input);
  var submit_button  =
        document.getElementById(global.pd.html.id.upload_tree_submit);
  var tree_reader    =
        new FileReader();
  var group_reader   =
        new FileReader();

  tree_reader.onload = function tree_reader_onload(event) {
    var newick_string = event.target.result;
    var group_file    = group_uploader.files[0];
    if (group_file) {
      group_reader.readAsText(group_file);
    }
    else if (newick_string) {
      global.pd.fn.handle_newick_string(newick_string, null);
    }
    else {
      alert("Something went wrong with the newick string!");
    }

    group_reader.onload = function (event) {
      var group_string = event.target.result;

      global.pd.fn.handle_newick_string(newick_string, group_string);
    };
  };

  submit_button.addEventListener("click", function pd_submit_handler() {
    var tree_file = tree_uploader.files[0];

    if (tree_file) {
      tree_reader.readAsText(tree_file);
    }
    else {
      alert("Don't forget a tree file!");
    }
  });
};

global.pd.fn.handle_newick_string = function (newick_string, group_string) {
  if (group_string) {
    var lines = group_string.split("\n");

    var group_membership = {};

    lines.forEach(function (line) {
      var ary = line.split("\t");

      var name  = ary[0];
      var group = ary[1];

      if (name && group) {
        if (group_membership[group] === undefined) {
          group_membership[group] = [name];
        }
        else {
          group_membership[group].push(name);
        }
      }
    });
  }
  else {
    alert("Upload a group file!");
  }

  var parsed_newick = newick__parse(newick_string);

  var tree =
        d3.hierarchy(parsed_newick, function hiearchy_from_newick(d) {
          return d.branchset;
        })
          .sum(function (d) {
            return d.branchset ? 0 : 1;
          })
          .sort(sort_ascending);

  t                = tree;
  l                = tree.leaves();
  global.pd.tree   = tree;
  global.pd.leaves = tree.leaves();

  var results = $("#" + global.pd.html.id.results);
  results.empty();

  results.append(
    "<tr>" +
    "<th>Group</th>" +
    "<th>PhyloDist</th>" +
    "<th>NormPhyloDist</th>" +
    "</tr>"
  );

  fn.obj.each(group_membership, function (group, names) {
    var dist = global.pd.fn.avg_phylo_dist(tree.leaves(), names);

    results.append("<tr><td>" + group + "</td><td>" + fn.math.round(dist, 2) + "</td><td>" + fn.math.round(dist / names.length, 2) + "</td></tr>");
  });
};

global.pd.fn.len_to_root = function (node) {
  var len   = 0;
  var depth = node.depth;

  var n = node;
  for (var i = 0; i < depth; ++i) {
    len += n.data.branch_length;

    n = n.parent;
  }

  return len;
};

global.pd.fn.avg_len_to_root = function (nodes) {
  return fn.ary.mean(nodes.map(function (d) {
    return global.pd.fn.len_to_root(d);
  }));
};

global.pd.fn.len_to = function (n1, n2) {
  var path      = n1.path(n2);
  var depths    = path.map(function (d) {
    return d.depth;
  });
  var min_depth = d3.min(depths);

  var len = 0;

  path.forEach(function (n) {
    // The node at the min depth is the least common ancestor.  The branch length of that node is not part of the distance between the two nodes.
    if (n.depth !== min_depth) {
      len += n.data.branch_length;
    }
  });

  return len;
};

/**
 * Returns the mean phylogenetic distance between all nodes in the names arg.
 *
 * @param all the leaf nodes of the tree
 * @param names names of the nodes taht you care about
 * @returns {number}
 */
global.pd.fn.avg_phylo_dist = function (leaves, names) {
  var total_len = 0;
  var node1, node2;

  // First get all the nodes in the names ary
  var nodes = leaves.filter(function (node) {
    return names.includes(node.data.name);
  });

  if (nodes.length === names.length) {
    for (var i = 0; i < nodes.length - 1; ++i) {
      node1 = nodes[i];

      for (var j = i + 1; j < nodes.length; ++j) {
        node2 = nodes[j];

        total_len += global.pd.fn.len_to(node1, node2);
      }
    }
  }
  else {
    return -1;
  }

  return total_len / nodes.length;
};

var t, l;