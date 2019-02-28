var global = {};

global.html    = {};
global.html.id = {
  // Tree layout options
  tree_layout: "tree-shape",
  tree_layout_radial: "radial-tree",

  // Branch style options
  tree_branch_style: "tree-branch-style",
  tree_branch_style_normal: "normalogram",

  // Tree sorting
  tree_sorting: "tree-sort",
  tree_sorting_forward: "descending",
  tree_sorting_reverse: "ascending",
  tree_sorting_unsorted: "not-sorted",

  // Tree rotation
  tree_rotation: "tree-rotation",

  // Root
  biologically_rooted: "biological-root"
};

// Tree size options
global.html.id.tree_width = "width";
global.html.id.tree_height = "height";
global.html.id.tree_padding = "padding";

global.ZERO_REPLACEMENT_VAL = 1e-5;
