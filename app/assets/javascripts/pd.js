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
      global.pd.fn.handle_data(newick_string, null);
    }
    else {
      alert("Something went wrong with the newick string!");
    }

    group_reader.onload = function (event) {
      var group_string = event.target.result;

      global.pd.fn.handle_data(newick_string, group_string);
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

global.pd.fn.parse_group_membership = function (group_string) {
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

    return group_membership;
  }
  else {
    alert("Upload a group file!");
    return null;
  }
};

global.pd.fn.handle_data = function (newick_string, group_string) {

  var group_membership = global.pd.fn.parse_group_membership(group_string);
  var parsed_newick    = newick__parse(newick_string);

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
    "<th>NodeCount</th>" +
    "<th>PairCount</th>" +
    "<th>PairDistTotal</th>" +
    "<th>PairDistMean</th>" +
    "<th>Dispersion</th>" +
    "</tr>"
  );

  var leaves = tree.leaves();

  fn.obj.each(group_membership, function (group, names) {
    var group_nodes = leaves.filter(function (node) {
      return names.includes(node.data.name);
    });

    var stats = global.pd.fn.calc_stats(group_nodes);

    results.append(global.pd.fn.make_table_row(group, stats));

    var jackknife_iters = 10;
    var jackknife_stats = global.pd.fn.jackknife_stats(leaves, group_nodes.length, jackknife_iters);

    results.append(
      global.pd.fn.make_table_row(
        group + "___",
        global.pd.fn.collate_jackknife_stats(jackknife_stats)
      )
    );
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
    // The node at the min depth is the least common ancestor.  The branch length of that node is not part of the dispance between the two nodes.
    if (n.depth !== min_depth) {
      len += n.data.branch_length;
    }
  });

  return len;
};

global.pd.fn.all_phylo_disp = function (leaves) {
  var n1, n2, disp;
  var disps = [];

  for (var i = 0; i < leaves.length - 1; ++i) {
    n1 = leaves[i];

    for (var j = i + 1; j < leaves.length; ++j) {
      n2 = leaves[j];

      disp = global.pd.fn.len_to(n1, n2);
      disps.push([n1, n2, disp]);
    }
  }
};

global.pd.fn.sort_all_phylo_disp = function (all_phylo_disp) {
  all_phylo_disp.sort(function (a, b) {
    var a_disp = a[2];
    var b_disp = b[2];

    if (a_disp < b_disp) {
      return -1;
    }
    else if (a_disp > b_disp) {
      return 1;
    }
    else {
      return 0;
    }
  });
};

/**
 * Returns the mean phylogenetic dispance between all nodes in the names arg.
 *
 * @param all the leaf nodes of the tree
 * @param names names of the nodes taht you care about
 * @returns {number}
 */
global.pd.fn.avg_phylo_disp = function (leaves, names) {
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

// See https://bost.ocks.org/mike/shuffle/
global.pd.fn.fy_shuf = function (array) {
  var m = array.length, t, i;

  // While there remain elements to shuffle…
  while (m) {

    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    t        = array[m];
    array[m] = array[i];
    array[i] = t;
  }

  return array;
};

global.pd.fn.make_table_row = function (group, stats) {
  var precision = 3;

  return "<tr><td>" +
    group +
    "</td><td>" +
    fn.math.round(stats.node_count, precision) +
    "</td><td>" +
    fn.math.round(stats.pair_count, precision) +
    "</td><td>" +
    fn.math.round(stats.sum, precision) +
    "</td><td>" +
    fn.math.round(stats.mean, precision) +
    "</td><td>" +
    fn.math.round(stats.disp, precision) +
    "</td></tr>";
};

// I shuffle the original array in place, so make sure that's what you want!  Also, I return shallow copies!
global.pd.fn.random_sample = function (ary, size) {
  return global.pd.fn.fy_shuf(ary).slice(0, size);
};

global.pd.fn.jackknife_stats = function (nodes, sample_size, iters) {
  var sample, stats, all_stats = [];
  for (var i = 0; i < iters; ++i) {
    sample = global.pd.fn.random_sample(nodes, sample_size);

    all_stats.push(global.pd.fn.calc_stats(sample));
  }

  return all_stats;
};

global.pd.fn.collate_jackknife_stats = function (jackknife_stats) {
  var mean_stats = {},
      node_count = 0,
      pair_count = 0,
      sum        = 0,
      mean       = 0,
      disp       = 0,
      len        = jackknife_stats.length;

  jackknife_stats.forEach(function (stats, i) {
    if (i === 0) {
      node_count = stats.node_count;
      pair_count = stats.pair_count;
    }

    sum += stats.sum;
    mean += stats.mean;
    disp += stats.disp;
  });

  return {
    node_count: node_count,
    pair_count: pair_count,
    sum: sum / len,
    mean: mean / len,
    disp: disp / len
  };
};


global.pd.fn.calc_stats = function (nodes) {
  // The total distance for all tip to tip pairs of nodes.
  var total = 0.0;

  // The number of tip to tip pairs.
  var npairs = 0;
  var n1, n2;

  for (var i = 0; i < nodes.length - 1; ++i) {
    n1 = nodes[i];

    for (var j = i + 1; j < nodes.length; ++j) {
      n2 = nodes[j];

      total += global.pd.fn.len_to(n1, n2);
      npairs += 1;
    }
  }

  return {
    node_count: nodes.length,
    pair_count: npairs,
    sum: total,
    mean: total / npairs,
    disp: total / nodes.length
  };

};

var t, l;
