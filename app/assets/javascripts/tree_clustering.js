var tree_clustering = {
  html: {
    // Submitting & reseting
    file_uploader: {
      id: "file-uploader"
    },
    submit_button: {
      id: "submit"
    },
    reset_button: {
      id: "reset"
    }
  }
};

var tc = tree_clustering;

tc.helpers = {};

tc.helpers.node_name = function (d) {
  return d.data.name;
};

tc.helpers.inner_nodes = function (root) {
  return root.descendants().filter(is_inner);
};

tc.helpers.leaf_nodes = function (root) {
  return root.descendants().filter(is_leaf);
};

tc.helpers.leaf_node_names = function (root) {
  return tc.helpers.leaf_nodes(root).map(tc.helpers.node_name);
};

tc.helpers.sort_by_branch_length = function (a, b) {
  return a.data.branch_length > b.data.branch_length;
};

tc.helpers.sort_by_number_of_descendants = function (a, b) {
  return a.value > b.value;
};

/**
 * MODIFIES ROOT!!!
 *
 * @param root
 * @returns {{}}
 */
tc.helpers.add_mean_branch_length = function () {
  ROOT.descendants().forEach(function (d) {
    if (is_inner(d)) {
      d.mean_branch_length = tc.helpers.mean_branch_length(d);
    }
  });
};

tc.helpers.nodes_for_deletion = function (root) {
  return tc.helpers
           .inner_nodes(root)
           .filter(tc.helpers.has_two_leaves)
           .sort(function (a, b) {
             return a.mean_branch_length > b.mean_branch_length;
           })
           .map(function (d) {
             var sorted_children = d.children.sort(function (a, b) {
               // Sort from smallest to largest branch length
               return a.data.branch_length > b.data.branch_length;
             });

             // The node name with the smallest branch length.
             return sorted_children[0].data.name;
           });
};

tc.helpers.has_two_leaves = function (node) {
  return node.value === 2;
};

tc.helpers.mean_branch_length = function (node) {
  var lengths = node.children.map(function (child) {
    return child.data.branch_length;
  });

  return fn.ary.mean(lengths);
};

tc.main = function (tree_str) {
  var parsed_newick = newick__parse(tree_str);

  // First set the sort function.
  cv.helpers.set_sort_function();
  // Then calculate the hierarchy.
  ROOT = d3.hierarchy(parsed_newick, function (d) {
    return d.branchset;
  })
           .sum(function (d) {
             return d.branchset ? 0 : 1;
           })
           .sort(cv.sort_fn);

  tc.helpers.add_mean_branch_length();

  var remove_these = tc.helpers.nodes_for_deletion(ROOT);

  var blob = new Blob([remove_these.join("\n")], { type: "text/plain;charset=utf-8" });
  saveAs(blob, "remove_these_ids.txt", true);
};

tc.upload_handler = function () {
  function upload_file(file_uploader, file_reader) {
    var file = file_uploader.files[0];
    if (file) {
      file_reader.readAsText(file);
    }
    else {
      alert("Don't forget to upload a file!");
    }
  }

  var file_reader    = new FileReader();
  file_reader.onload = function (event) {
    var tree_str = event.target.result;
    tc.main(tree_str);
  };

  var file_uploader = document.getElementById(tc.html.file_uploader.id);
  var submit_button = document.getElementById(tc.html.submit_button.id);
  var reset_button  = document.getElementById(tc.html.reset_button.id);

  // Submitting and reseting
  file_uploader.addEventListener("change", function () {
    undisable(cv.html.submit_button.id);
  });
  submit_button.addEventListener("click", function () {
    disable(cv.html.submit_button.id);
    upload_file(file_uploader, file_reader);
  });
  reset_button.addEventListener("click", function () {
    undisable(cv.html.submit_button.id);
  });
};