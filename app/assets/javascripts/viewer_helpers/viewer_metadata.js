//// Mapping file metadata helper functions
function add_metadata(root, name2md, match_style) {
  // Everything starts with black metadata.  Later functions should handle defualts with blank metadata later.
  add_blank_metadata(root);

  // We assume the name2md will not have any erros if it is not null as errors are caught early
  if (name2md !== null) {
    var names_with_matches_in_tree = [];

    if (match_style === "exact") {
      root.leaves().forEach(function (d) {
        var md = name2md[d.data.name];
        if (md) {
          push_unless_present(names_with_matches_in_tree, d.data.name);
          // If something has no metadata leave it as default.
          d.metadata = md;
        }
      });
    }
    else if (match_style === "partial") {
      json_each(name2md, function (name, metadata) {
        root.leaves().forEach(function (d) {
          // Since it's partial mapping, all leaves could match a single name.
          if (d.data.name.indexOf(name) !== -1) { // match
            push_unless_present(names_with_matches_in_tree, name);
            d.metadata = metadata;
          }
        });
      });
    }
    else {
      // TODO regex
    }

    if (names_with_matches_in_tree.length < json_keys(name2md).length) {
      var unused_names = [];
      json_keys(name2md).forEach(function (name) {
        if (names_with_matches_in_tree.indexOf(name) === -1) { // no match
          push_unless_present(unused_names, name);
        }
      });

      if (!EXTRA_NAME_WARNINGS) {
        alert("WARNING -- There were names in the mapping file that were not present in the tree (check your option for label matching (exact or partial)): " + unused_names.join(", "));

        EXTRA_NAME_WARNINGS = true;
      }
    }
  }
}

function add_blank_metadata(root) {
  root.leaves().forEach(function (d) {
    return d.metadata = {};
  });
}

function get_branch_md_val(node, branch_option, default_value) {
  function get_md_val(node, branch_option, default_value) {
    // First, get the metadata val for this node.
    var leaves  = get_leaves(node);
    var md_vals = [];

    leaves.forEach(function (leaf) {
      // TODO check if metadata is actually an attr of leaf.
      var val = leaf.metadata[branch_option];
      if (val) {
        push_unless_present(md_vals, val);
      }
      else {
        // Got undefined, push default value
        push_unless_present(md_vals, default_value);
      }
    });

    return md_vals.length === 1 ? md_vals[0] : default_value;
  }

  function get_sibling_md_val(node, branch_option, default_value) {
    var parent   = node.parent;
    var children = parent.children;

    // If there is more than one sibling, then things are strange just put the defualt value.
    if (children.length !== 2) {
      push_unless_present(biological_root_sibling_warnings, "WARNING -- The biological root has multiple sibling nodes.  The branches directly attached to the root will not be automatically styled, but will use the default values.  If the branch styling near the root looks strange, this is likely the reason.");
      return default_value;
    }
    else {
      var sibling = children[0] === node ? children[1] : children[0];
      return get_md_val(sibling, branch_option, default_value);
    }
  }

  var md_val_for_this_node = get_md_val(node, branch_option, default_value);

  if (is_silly(node)) {
    // This is a silly node and we need to check for odd rooting behavior.
    if (LAYOUT_RADIAL && TREE_IS_ROOTED_ON_A_LEAF_NODE) {
      // Give the styling of this node the same styling as its sibling (the biological root of the tree).
      return get_sibling_md_val(node, branch_option, default_value);
    }
    else if (LAYOUT_RADIAL && VAL_BIOLOGICALLY_ROOTED) {
      // The tree is rooted somewhere between two leaf nodes.  In this case the root is known to be biologically meaningful, so the biological node and the computational node are the same.  In this case coloring of clades coming from the root are colored normally.
      return md_val_for_this_node;
    }
    else if (LAYOUT_RADIAL) {
      // Same as above except that in this case the computational root is not biologically meaningful, so we don't want a case where the backbone of a radial tree is two different colors.  Only color this node's branch if it's sibling is the same color.
      var sibling_md_val = get_sibling_md_val(node, branch_option, default_value);
      if (sibling_md_val === md_val_for_this_node) {
        return md_val_for_this_node;
      }
      else {

        return default_value;
      }
    }
    else {
      return md_val_for_this_node;
    }
  }
  else {
    // This is a regular node so just style the branches normally.
    return md_val_for_this_node;
  }
}

// The node is silly if the tree is in radial layout and parent is the true root and one of the siblings is the biological root.  OR if the parent is a true root and the biological root and the node is depth 1.
function is_silly(node) {
  if (!LAYOUT_RADIAL) {
    return false;
  }
  // Is this branch attached to the root of the tree?
  else if (is_rooted_on_this_leaf_node(node)) {
    return false;
  }
  else if (node.depth === 1) {
    if (!TREE_IS_ROOTED_ON_A_LEAF_NODE) {
      return true;
    }
    else {
      // Check if has a sibling that is a leaf and a biological root
      var depth_one_nodes = node.parent.children;
      var i               = 0;
      for (i = 0; i < depth_one_nodes.length; ++i) {
        var sibling = depth_one_nodes[i];
        if (sibling !== node && is_rooted_on_this_leaf_node(sibling)) {
          return sibling;
        }
      }
    }
  }

  return false;
}

// Handles nicely the case where name2md isn't set.
function check_for_bar_options() {
  var category_names = [];

  if (name2md) {

    json_each(name2md, function (seq_name, metadata) {
      json_each(metadata, function (category_name, value) {
        push_unless_present(category_names, category_name);
      });
    });

    var i;
    for (i = 0; i < category_names.length; ++i) {
      if (category_names[i].match(/^bar[?:0-9]+_(?:height|color)$/)) {
        return true;
      }
    }
  }

  return false;
}

function check_for_arc_options() {
  var category_names = [];

  if (name2md) {

    json_each(name2md, function (seq_name, metadata) {
      json_each(metadata, function (category_name, value) {
        push_unless_present(category_names, category_name);
      });
    });

    var i;
    for (i = 0; i < category_names.length; ++i) {
      if (category_names[i].match(/^arc[?:0-9]+_color$/)) {
        return true;
      }
    }
  }

  return false;
}

function set_options_by_metadata() {
  var category_names = [];

  if (name2md) {

    json_each(name2md, function (seq_name, metadata) {
      json_each(metadata, function (category_name, value) {
        push_unless_present(category_names, category_name);
      });
    });

    var
      leaf_dot_options_present   = false,
      leaf_label_options_present = false;

    category_names.forEach(function (cat_name) {
      if (LEAF_DOT_OPTIONS.includes(cat_name)) {
        leaf_dot_options_present = true;
      }

      if (LEAF_LABEL_OPTIONS.includes(cat_name)) {
        leaf_label_options_present = true;
      }
    });

    // Show leaf dots if leaf dot options are present
    if (leaf_dot_options_present) {
      check(global.html.id.leaf_dots_show);
    }

    // Show leaf labels if leaf label options are present.
    if (leaf_label_options_present) {
      check(global.html.id.leaf_labels_show);
    }
  }
}

function is_rooted_on_this_leaf_node(d) {
  // Depth is 1 means it is one level from root.
  return is_leaf(d) && d.depth === 1;
}

// TODO you have to check for true or string in the output.
function is_rooted_on_a_leaf_node(d3_tree) {

  var children = d3_tree.children;
  var i        = 0;
  for (i = 0; i < children.length; ++i) {
    var child = children[i];
    if (is_rooted_on_this_leaf_node(child)) {
      if (child.data.name === "") {
        // TODO not sure if a leaf can ever have a blank name, but if it can "" will be falsey and mess up the results, so just return true.
        return true;
      }
      else {
        return child.data.name;
      }
    }
  }

  return false;
}

// TODO this will not work properly unless TREE_IS_ROOTED_ON_A_LEAF_NODE has been set.
function try_disable_bio_rooted() {
  if (LAYOUT_RADIAL && TREE_IS_ROOTED_ON_A_LEAF_NODE) {
    jq(global.html.id.biologically_rooted).prop("disabled", true);
  }
  else if (!LAYOUT_RADIAL) {
    jq(global.html.id.biologically_rooted).prop("disabled", true);
  }
  else {
    jq(global.html.id.biologically_rooted).prop("disabled", false);
  }
}


function get_leaves(target) {
  function get_leaves_iter(target) {
    if (is_leaf(target)) {
      leaves.push(target);
    }
    else {
      target.children.map(function (d) {
        leaves.push(get_leaves(d));
      });
    }
  }

  var leaves = [];
  get_leaves_iter(target);

  return flatten(leaves);
}
