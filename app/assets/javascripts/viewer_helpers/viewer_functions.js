viewer.fn = {};

//// Warning about bad options
viewer.fn.warn_about_arcs_show = function () {
  if (
    global.html.val.tree_layout === global.html.id.tree_layout_rectangular ||
    global.html.val.tree_layout === global.html.id.tree_layout_radial
  ) {
    alert(global.warnings.arcs_show);

    jq(global.html.id.arcs_show).prop("checked", false);

    global.html.val.arcs_show = false;
  }
};

viewer.fn.warn_about_bars_axis_show = function () {
  if (
    global.html.val.tree_layout === global.html.id.tree_layout_radial
  ) {
    alert(global.warnings.bars_axis_show);

    jq(global.html.id.bars_axis_show).prop("checked", false);

    global.html.val.bars_axis_show = false;
  }
};

//// Reseting options

viewer.fn.reset_tree_format_opts_to_defaults = function () {
  // Tree options
  jq(global.html.id.tree_width).val(viewer.defaults.radial.width);
  jq(global.html.id.tree_height).prop("disabled", true).val(viewer.defaults.radial.height);
  jq(global.html.id.tree_padding).val(viewer.defaults.tree_padding);
  jq(global.html.id.tree_rotation).val(viewer.defaults.tree_rotation);

  jq(global.html.id.tree_layout).val(global.html.id.tree_layout_radial);

  jq(global.html.id.tree_branch_style).val(global.html.id.tree_branch_style_normal);

  jq(global.html.id.tree_sorting).val(global.html.id.tree_sorting_forward);

  check(global.html.id.biologically_rooted);
};

viewer.fn.reset_scale_bar_opts_to_defaults = function () {
  // Scale bar options
  jq(global.html.id.scale_bar_show)
    .prop("checked", viewer.defaults.scale_bar_show_is_checked);
  jq(global.html.id.scale_bar_autosize)
    .prop("checked", viewer.defaults.scale_bar_autosize_is_checked);
  jq(global.html.id.scale_bar_length)
    .val(viewer.defaults.scale_bar_length)
    .prop("disabled", viewer.defaults.scale_bar_length_is_disabled);
  jq(global.html.id.scale_bar_offset_weight)
    .val(viewer.defaults.scale_bar_offset_weight);
};

viewer.fn.reset_label_opts_to_defaults = function () {
  uncheck(global.html.id.inner_labels_show);
  jq(global.html.id.inner_labels_size).val(viewer.defaults.inner_labels_size);

  jq(global.html.id.leaf_labels_show)
    .prop("checked", viewer.defaults.leaf_labels_show);
  jq(global.html.id.leaf_labels_align)
    .prop("checked", viewer.defaults.leaf_labels_align);

  jq(global.html.id.leaf_labels_size).val(viewer.defaults.leaf_labels_size);
  jq(global.html.id.leaf_labels_padding).val(viewer.defaults.leaf_labels_padding);

  // not checked, not disabled
  sync_align_buttons_vals(false, false);

  jq(global.html.id.leaf_labels_color).val(viewer.defaults.leaf_labels_color);
  jq(global.html.id.leaf_labels_font).val(viewer.defaults.leaf_labels_font);

  jq(global.html.id.inner_labels_color).val(viewer.defaults.inner_labels_color);
  jq(global.html.id.inner_labels_font).val(viewer.defaults.inner_labels_font);
};

viewer.fn.reset_dot_opts_to_defaults = function () {
  // Inner dot options
  jq(global.html.id.inner_dots_show).val(viewer.defaults.inner_dots_show);
  jq(global.html.id.inner_dots_size).val(viewer.defaults.inner_dots_size);
  jq(global.html.id.inner_dots_cutoff_filled).val(viewer.defaults.inner_dots_cutoff_filled);
  jq(global.html.id.inner_dots_cutoff_unfilled).val(viewer.defaults.inner_dots_cutoff_unfilled);

  // Leaf dot options
  uncheck(global.html.id.leaf_dots_show);
  jq(global.html.id.leaf_dots_size).val(viewer.defaults.leaf_dots_size);

  jq(global.html.id.leaf_dots_color).val(viewer.defaults.leaf_dots_color);
  jq(global.html.id.inner_dots_color).val(viewer.defaults.inner_dots_color);
};

viewer.fn.reset_bar_opts_to_defaults = function () {
  // Bar options
  jq(global.html.id.bars_show).prop("checked", viewer.defaults.bars_show);
  jq(global.html.id.bars_axis_show).prop("checked", viewer.defaults.bars_axis_show);
  jq(global.html.id.bars_axis_show).prop("disabled", !viewer.defaults.bars_axis_show);
  jq(global.html.id.bars_color).val(viewer.defaults.bars_color);
  jq(global.html.id.bars_height).val(viewer.defaults.bars_height);
  jq(global.html.id.bars_width).val(viewer.defaults.bars_width);
  jq(global.html.id.bars_padding).val(viewer.defaults.bars_padding);
};

viewer.fn.reset_arc_opts_to_defaults = function () {
  // arc options
  jq(global.html.id.arcs_show).prop("checked", viewer.defaults.arcs_show);
  jq(global.html.id.arcs_padding).val(viewer.defaults.arcs_padding);
  jq(global.html.id.arcs_height).val(viewer.defaults.arcs_height);
  jq(global.html.id.arcs_cap_radius).val(viewer.defaults.arcs_cap_radius);
};

viewer.fn.reset_branch_opts_to_defaults = function () {
  // Branch options
  jq(global.html.id.branches_color).val(viewer.defaults.branches_color);
  jq(global.html.id.branches_width).val(viewer.defaults.branches_width);
};

viewer.fn.reset_viewer_opts_to_defaults = function () {
  // Viewer options
  jq(global.html.id.viewer_size_fixed).prop("checked", viewer.defaults.viewer_size_fixed);
};

// Currently, these are all the defaults for the radial tree.
viewer.fn.reset_all_to_defaults = function () {
  EXTRA_NAME_WARNINGS = false;

  // The set_options_by_metadata function will change the value of the *_options_present vars, but if you change the mapping file to a new one, these don't appear to get changed back.

  // Set these to null as this function is called when clicking the submit or reset buttons.  Either of which will re-set these anyway.  But doing this avoids some weird bugs where the mapping file is still hanging around after hitting reset.  See https://github.com/mooreryan/iroki_web/issues/32.
  tree_input    = null;
  mapping_input = null;
  // name2md = null;

  viewer.fn.reset_tree_format_opts_to_defaults();
  viewer.fn.reset_scale_bar_opts_to_defaults();
  viewer.fn.reset_label_opts_to_defaults();
  viewer.fn.reset_dot_opts_to_defaults();
  viewer.fn.reset_bar_opts_to_defaults();
  viewer.fn.reset_arc_opts_to_defaults();
  viewer.fn.reset_branch_opts_to_defaults();
  viewer.fn.reset_viewer_opts_to_defaults();
};

//// Random utils
function ary_mean(ary) {
  var num_elems = ary.length;
  var total     = 0;
  ary.map(function (d) {
    total += d;
  });

  return total / num_elems;
}

function flatten(ary) {
  function flatten_iter(ary) {
    for (var i = 0; i < ary.length; ++i) {
      var val = ary[i];
      if (Array.isArray(val)) {
        flatten_iter(val);
      }
      else {
        flat_ary.push(val);
      }
    }
  }

  var flat_ary = [];
  flatten_iter(ary);

  return flat_ary;
}

function ary_min_max(ary) {
  var min = null;
  var max = null;
  ary.forEach(function (val) {
    if (!max || val > max) {
      max = val;
    }

    if (!min || val < min) {
      min = val;
    }
  });

  return { min: min, max: max };
}


//// Tiny javascript element helpers
function set_value_of(id, val) {
  var elem   = document.getElementById(id);
  elem.value = val;
}


//// Tiny jquery helpers (lots of things depend on these)
function jq(id) {
  return $("#" + id);
}

function disable(id) {
  return jq(id).prop("disabled", true);
}

function undisable(id) {
  return jq(id).prop("disabled", false);
}

function check(id) {
  $("#" + id).prop("checked", true);
}

function uncheck(id) {
  $("#" + id).prop("checked", false);
}

function is_checked(id) {
  return jq(id).prop("checked");
}

//// Boolean type functions for checking nodes of a parsed tree
function is_root(d) {
  return d.depth === 0;
}

function is_leaf(d) {
  return d.value === 1;
}

function is_inner(d) {
  return !is_leaf(d);
}

function is_root_node(d) {
  return d.depth === 1;
}




