var global = {};

global.html = {};

// To hold IDs of html elements
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

global.html.id.mapping_file_matching_type = "matching-type";

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

// Arcs options
global.html.id.arcs_show       = "arcs-show";
global.html.id.arcs_padding    = "arcs-padding";
global.html.id.arcs_height     = "arcs-height";
global.html.id.arcs_cap_radius = "arcs-cap-radius";

// Branch options
global.html.id.branches_color = "branch-color"; // #000
global.html.id.branches_width = "branch-width"; // 2

// Viewer options
global.html.id.viewer_size_fixed = "viewer-size-fixed";

// To hold values associated with html elements
global.html.val = {};

// Arcs values
global.html.val.arcs_show       = undefined;
global.html.val.arcs_padding    = undefined;
global.html.val.arcs_height     = undefined;
global.html.val.arcs_cap_radius = undefined;


global.ZERO_REPLACEMENT_VAL = 1e-5;

var viewer = {};

viewer.defaults = {
  // Defaults not specific to a certain layout.
  tree_rotation: 0,
  tree_padding: 0.05,

  // Defaults specific to a certain layout.
  radial: {
    width: 10,
    height: 10,
  },
  circular: {
    width: 22,
    height: 22
  },
  rectangular: {
    width: 22,
    height: 22
  }
};

viewer.html = {
  tree_width: {
    id: global.html.id.tree_width
  },

  layout: {
    id: "tree-shape",

    rectangular: {
      id: "rectangular-tree"
    },
    circular: {
      id: "circular-tree"
    },
  }
};


// This will be passed to all things that could be aligned (leaf labels, dots, bars, etc)
viewer.defaults.tip_decorations_align = false;

viewer.defaults.inner_labels_size  = 12;
viewer.defaults.inner_labels_color = "#000000";
viewer.defaults.inner_labels_font  = "Helvetica";

// Scale bar defaults
viewer.defaults.scale_bar_length              = 1;
viewer.defaults.scale_bar_length_is_disabled  = true;
viewer.defaults.scale_bar_offset_weight       = 1;
viewer.defaults.scale_bar_autosize_is_checked = true;
viewer.defaults.scale_bar_show_is_checked     = true;

// Leaf label defaults
viewer.defaults.leaf_labels_show        = true;
viewer.defaults.leaf_labels_size        = 16;
viewer.defaults.leaf_labels_padding     = 0;
viewer.defaults.leaf_labels_padding_min = 0;
viewer.defaults.leaf_labels_padding_max = 10000;
viewer.defaults.leaf_labels_align       = viewer.defaults.tip_decorations_align;
viewer.defaults.leaf_labels_rotation    = 0;
viewer.defaults.leaf_labels_color       = "#000000";
viewer.defaults.leaf_labels_font        = "Helvetica";

// Inner dot defaults
viewer.defaults.inner_dots_show            = global.html.id.inner_dots_show_none;
viewer.defaults.inner_dots_cutoff_unfilled = 0.5;
viewer.defaults.inner_dots_cutoff_filled   = 0.75;
viewer.defaults.inner_dots_color           = "#000000";
viewer.defaults.inner_dots_size            = 5;

// Leaf dots defaults
viewer.defaults.leaf_dots_show  = false;
viewer.defaults.leaf_dots_align = viewer.defaults.tip_decorations_align;
viewer.defaults.leaf_dots_color = "#000000";
viewer.defaults.leaf_dots_size  = 5;

// Bars defaults
viewer.defaults.bars_show        = false;
viewer.defaults.bars_axis_show   = false;
viewer.defaults.bars_padding     = 10;
viewer.defaults.bars_padding_min = 0;
viewer.defaults.bars_padding_max = 10000; // TODO this is just some silly default

viewer.defaults.bars_height = 100;
viewer.defaults.bars_width  = 10;
viewer.defaults.bars_align  = false;
viewer.defaults.bars_color  = "#000000";

// Arcs defaults
viewer.defaults.arcs_show       = false;
viewer.defaults.arcs_padding    = 10;
viewer.defaults.arcs_height     = 20;
viewer.defaults.arcs_cap_radius = 2;


// Branches default
viewer.defaults.branches_color = "#000000";
viewer.defaults.branches_width = 2;

// Viewer size defaults
viewer.defaults.viewer_size_fixed = true;

var MAPPING_CHANGED, TREE_CHANGED;

var OPTIONS_DIV;

// TODO get this from the CSS
var FORM_HEIGHT = 650;

// Round to 100ths place.
var ROUNDING_PRECISION = 2;

var LAYOUT_CIRCLE, LAYOUT_STRAIGHT, LAYOUT_RADIAL;
var TREE_BRANCH_STYLE, TREE_BRANCH_CLADOGRAM, TREE_BRANCH_NORMAL;
var the_x, the_y;
var SIZE, INNER_SIZE;
var width, padding, height;
var ROOT, svg, chart, data, circles, labels, inner_labels, leaf_labels,
    linkExtension, link, inner_dots, leaf_dots;

var SHOW_INNER_LABELS, SHOW_LEAF_LABELS;

var SHOW_SCALE_BAR;

var INNER_LABEL_SIZE, LEAF_LABEL_SIZE;
var SHOW_INNER_DOTS, SHOW_LEAF_DOTS;

var LABEL_ROTATION;
var ROTATION_STATE, ROTATED, NOT_ROTATED;

var INNER_DOT_SIZE, LEAF_DOT_SIZE;

var TREE_ROTATION;

var VIEWER_WIDTH, VIEWER_HEIGHT, VIEWER_SIZE_FIXED;

var SORT_STATE, SORT_NONE, SORT_ASCENDING, SORT_DESCENDING, sort_function;

var the_width, the_height, the_width, the_height, padding;

var SCALE_BAR_OFFSET_WEIGHT, SCALE_BAR_LENGTH;

// The name2md var will be set to null if there is no metadata mapping data.
var name2md = null;

var MATCHING_TYPE;

var EXTRA_NAME_WARNINGS       = false;
var MIN_LENGTH_IN_TREE;
var MIN_DEFUALT_BRANCH_LENGTH = 1e-10;
var NEW_LENGTH_FOR_ZERO_LENGTH_BRANCHES;

var LARGE_TREE_CUTOFF = 1000; // in number of nodes.  TODO tune this...phage proteomic tree is 5200, slow; tree of life 381, fast.

var SELECTED_BRANCH_COLOR, SELECTED_BRANCH_WIDTH;

// To hold temporary DOM elements
var elem;

var RADIAL_LAYOUT_WEIGHT = 1;

// These vars hold elem IDs
var ID_LAYOUT_RECTANGULAR = "rectangular-tree",
    ID_LAYOUT_CIRCULAR    = "circular-tree";

// var ID_SORT                        = "tree-sort",
//     ID_SORT_FORWARD                = "descending",
//     ID_SORT_REVERSE                = "ascending",
//     ID_SORT_UNSORTED               = "not-sorted";
var //ID_SCALE_BAR_SHOW          = "show-scale-bar",
    //ID_SCALE_BAR_OFFSET_WEIGHT = "scale-bar-offset-weight",
  ID_SCALE_BAR_AUTOSIZE  = "scale-bar-auto-size";
//ID_SCALE_BAR_LENGTH        = "scale-bar-length";
var ID_OPTIONS_ACCORDION = "options-accordion";
var ID_LEAF_LABEL_COLOR  = "leaf-label-color",
  VAL_LEAF_LABEL_COLOR,
  VAL_LEAF_LABEL_FONT,
  VAL_LEAF_LABEL_PADDING,
  VAL_LEAF_LABEL_ALIGN;


var
  VAL_INNER_LABEL_COLOR,
  VAL_INNER_LABEL_FONT;

// Bar option IDs
var VAL_BAR_SHOW,
    VAL_BAR_COLOR,
    VAL_BAR_HEIGHT,
    VAL_BAR_WIDTH,
    VAL_BAR_PADDING;

var ID_BAR_SHOW_START_AXIS = "show-bar-start-axis",
    VAL_BAR_SHOW_START_AXIS;

var VAL_LEAF_DOT_COLOR,
    VAL_INNER_DOT_COLOR;

var VAL_BIOLOGICALLY_ROOTED;

var ID_SHOW_INNER_DOTS           = "show-inner-dots",
    ID_SHOW_INNER_DOTS_NONE      = "show-inner-dots-none",
    ID_SHOW_INNER_DOTS_NORMAL    = "show-inner-dots-normal",
    ID_SHOW_INNER_DOTS_BOOTSTRAP = "show-inner-dots-bootstrap",
    VAL_SHOW_INNER_DOTS;

var VAL_BOOTSTRAP_CUTOFF_FILLED_DOT,
    VAL_BOOTSTRAP_CUTOFF_UNFILLED_DOT;

var ID_RESET_BUTTON = "reset";

var tmp_root;

var TREE_IS_ROOTED_ON_A_LEAF_NODE;

// TODO we have to check if we've already warned about this as it will try and warn each time the links are redrawn.
var biological_root_sibling_warnings = [],
    biological_root_sibling_warnings_already_warned;

// Any value higher than this will be dropped down to this value.  Some tree software puts the number of bootstrap trees with support rather than a percent so this number can get pretty high.
var MAX_BOOTSTRAP_VAL = 1e9;

var defaults = {
  "leaf_label_color": "#000000",
  "leaf_label_font": viewer.defaults.inner_labels_font,
  "leaf_label_size": 16,
  "leaf_dot_color": "#000000",
  "leaf_dot_size": 2,
  "new_name": null,
};

var md_cat_name2id = {
  "leaf_label_color": null,
  "leaf_label_font": null,
  "leaf_label_size": global.html.id.leaf_labels_size,
  "leaf_dot_color": null,
  "leaf_dot_size": global.html.id.leaf_dots_size,
  "new_name": null,
  "branch_width": global.html.id.branches_width,
  "branch_color": null
};

// Hold these as globals so that we can make sure the reset button resets them.
var mapping_input, tree_input;

var z;
var PREVIOUSLY_SELECTED = [];
var HISTORY_LIMIT       = 10;

var tree_debug;

var parsed_newick;

var circle_cluster, rectangle_cluster;

// For the setTimeout function.  10 ms.
var TIMEOUT = 10;
