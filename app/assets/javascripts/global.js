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
global.html.id.tree_width   = "width";
global.html.id.tree_height  = "height";
global.html.id.tree_padding = "padding";

// Scale bar options
global.html.id.scale_bar_show = "show-scale-bar";
global.html.id.scale_bar_offset_weight = "scale-bar-offset-weight";
global.html.id.scale_bar_autosize = "scale-bar-auto-size";
global.html.id.scale_bar_length = "scale-bar-length";

// Label options
global.html.id.inner_labels_show = "show-inner-labels";
global.html.id.inner_labels_size = "inner-label-size";
global.html.id.inner_labels_color = "inner-label-color";
global.html.id.inner_labels_font = "inner-label-font";
// TODO this ID matches the leaf label font ID for helvetica
global.html.id.inner_labels_font_helvetica = "helvetica";

global.ZERO_REPLACEMENT_VAL = 1e-5;
