viewer.fn = {};

// Currently, these are all the defaults for the radial tree.
viewer.fn.reset_all_to_defaults = function() {
  EXTRA_NAME_WARNINGS = false;

  // The set_options_by_metadata function will change the value of the *_options_present vars, but if you change the mapping file to a new one, these don't appear to get changed back.

  // Set these to null as this function is called when clicking the submit or reset buttons.  Either of which will re-set these anyway.  But doing this avoids some weird bugs where the mapping file is still hanging around after hitting reset.  See https://github.com/mooreryan/iroki_web/issues/32.
  tree_input    = null;
  mapping_input = null;
  // name2md = null;

  // Tree options
  // jq(ID_MATCHING_TYPE).val("partial");

  // $("#" + global.html.id.tree_width).attr("min", 3).attr("max", 55).attr("step", 1).val(7);
  $("#" + global.html.id.tree_width).val(viewer.defaults.radial.width);
  $("#" + global.html.id.tree_height).prop("disabled", true).val(viewer.defaults.radial.height);
  $("#" + global.html.id.tree_padding).val(viewer.defaults.tree_padding);
  $("#" + global.html.id.tree_rotation).val(viewer.defaults.tree_rotation);

  jq(global.html.id.tree_layout).val(global.html.id.tree_layout_radial);

  jq(global.html.id.tree_branch_style).val(global.html.id.tree_branch_style_normal);

  jq(global.html.id.tree_sorting).val(global.html.id.tree_sorting_forward);

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

  // Inner label options
  uncheck(global.html.id.inner_labels_show);
  $("#" + global.html.id.inner_labels_size).val(viewer.defaults.inner_labels_size);

  // Leaf label options
  jq(global.html.id.leaf_labels_show)
    .prop("checked", viewer.defaults.leaf_labels_show);
  jq(global.html.id.leaf_labels_align)
    .prop("checked", viewer.defaults.leaf_labels_align);

  jq(global.html.id.leaf_labels_size).val(viewer.defaults.leaf_labels_size);
  jq(global.html.id.leaf_labels_padding).val(viewer.defaults.leaf_labels_padding);

  // not checked, not disabled
  sync_align_buttons_and_vals(false, false);
  jq(global.html.id.leaf_labels_rotation).val(viewer.defaults.leaf_labels_rotation);

  jq(global.html.id.leaf_labels_color).val(viewer.defaults.leaf_labels_color);
  jq(global.html.id.leaf_labels_font).val(viewer.defaults.leaf_labels_font);

  jq(global.html.id.inner_labels_color).val(viewer.defaults.inner_labels_color);
  jq(ID_INNER_LABEL_FONT).val(viewer.defaults.inner_labels_font);

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

  // Bar options
  jq(global.html.id.bars_show).prop("checked", viewer.defaults.bars_show);
  jq(global.html.id.bars_axis_show).prop("checked", viewer.defaults.bars_axis_show);
  jq(global.html.id.bars_color).val(viewer.defaults.bars_color);
  jq(global.html.id.bars_height).val(viewer.defaults.bars_height);
  jq(global.html.id.bars_width).val(viewer.defaults.bars_width);
  jq(global.html.id.bars_padding).val(viewer.defaults.bars_padding);

  // Branch options
  jq(global.html.id.branches_color).val(viewer.defaults.branches_color);
  jq(global.html.id.branches_width).val(viewer.defaults.branches_width);

  // Viewer options
  jq(global.html.id.viewer_size_fixed).prop("checked", viewer.defaults.viewer_size_fixed);


  check(global.html.id.biologically_rooted);
}