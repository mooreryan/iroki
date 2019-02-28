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
global.html.id.scale_bar_show          = "show-scale-bar";
global.html.id.scale_bar_offset_weight = "scale-bar-offset-weight";
global.html.id.scale_bar_autosize      = "scale-bar-auto-size";
global.html.id.scale_bar_length        = "scale-bar-length";

// Label options
global.html.id.inner_labels_show           = "show-inner-labels";
global.html.id.inner_labels_size           = "inner-label-size";
global.html.id.inner_labels_color          = "inner-label-color";
global.html.id.inner_labels_font           = "inner-label-font";
// TODO this ID matches the leaf label font ID for helvetica
global.html.id.inner_labels_font_helvetica = "inner-label-font-helvetica";

// Leaf label options
global.html.id.leaf_labels_show           = "show-leaf-labels";
global.html.id.leaf_labels_size           = "leaf-label-size";
global.html.id.leaf_labels_padding        = "leaf-label-padding";
global.html.id.leaf_labels_align          = "align-tip-labels";
global.html.id.leaf_labels_rotation       = "label-rotation";
global.html.id.leaf_labels_color          = "leaf-label-color";
global.html.id.leaf_labels_font           = "leaf-label-font";
global.html.id.leaf_labels_font_helvetica = "leaf-label-font-helvetica";

// Inner dots
global.html.id.inner_dots_show            = "show-inner-dots";
global.html.id.inner_dots_show_none       = "show-inner-dots-none";
global.html.id.inner_dots_show_normal     = "show-inner-dots-normal";
global.html.id.inner_dots_show_bootstrap  = "show-inner-dots-bootstrap";
global.html.id.inner_dots_cutoff_unfilled = "bootstrap-cutoff-unfilled-dot";
global.html.id.inner_dots_cutoff_filled   = "bootstrap-cutoff-filled-dot";
global.html.id.inner_dots_color           = "inner-dot-color";
global.html.id.inner_dots_size            = "inner-dot-size";

// Leaf dots
global.html.id.leaf_dots_show  = "show-leaf-dots";
global.html.id.leaf_dots_align = "align-leaf-dots";
global.html.id.leaf_dots_color = "leaf-dot-color";
global.html.id.leaf_dots_size  = "leaf-dot-size";

// Bars option
global.html.id.bars_show      = "show-bars";
global.html.id.bars_color     = "bar-color";
global.html.id.bars_height    = "bar-height";
global.html.id.bars_width     = "bar-width";
global.html.id.bars_padding   = "bar-padding";
global.html.id.bars_align     = "align-bars";
global.html.id.bars_axis_show = "show-bar-start-axis";

global.ZERO_REPLACEMENT_VAL = 1e-5;
