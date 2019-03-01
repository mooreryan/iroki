// TODO merge this with the other padding validation function.
function validate_leaf_label_padding_input(id) {
  var raw_val = jq(id).val();

  // Basic decimal number matcher
  if (raw_val && !raw_val.match(/^\d*\.?\d*$/)) {
    // Set the user option
    jq(id).val(viewer.defaults.leaf_labels_padding);
    // And return the actual usable value
    return viewer.defaults.leaf_labels_padding;
  }

  // If raw_val is undefined, then this will be NaN.
  var val = parseFloat(raw_val);

  // First check if it's NaN.  If so, use default value
  if (isNaN(val)) {

    // Set the user option
    jq(id).val(viewer.defaults.leaf_labels_padding);
    // And return the actual usable value
    return viewer.defaults.leaf_labels_padding;
  }
  else if (val > viewer.defaults.leaf_labels_padding_max) {
    jq(id).val(viewer.defaults.leaf_labels_padding_max);
    return viewer.defaults.leaf_labels_padding_max;
  }
  else if (val < viewer.defaults.leaf_labels_padding_min) {
    jq(id).val(viewer.defaults.leaf_labels_padding_min);
    return viewer.defaults.leaf_labels_padding_min;
  }
  else {
    // It's fine return the actual val.
    return val;
  }
}

// Check that the bar padding text input is good and return appropriate values if it is not.
function validate_bar_padding_input(id) {
  var raw_val = jq(id).val();

  // Basic decimal number matcher
  if (raw_val && !raw_val.match(/^\d*\.?\d*$/)) {
    // Set the user option
    jq(id).val(viewer.defaults.bars_padding);
    // And return the actual usable value
    return viewer.defaults.bars_padding;
  }

  // If raw_val is undefined, then this will be NaN.
  var val = Math.round(parseFloat(raw_val));

  // First check if it's NaN.  If so, use default value
  if (isNaN(val)) {

    // Set the user option
    jq(id).val(viewer.defaults.bars_padding);
    // And return the actual usable value
    return viewer.defaults.bars_padding;
  }
  else if (val > viewer.defaults.bars_padding_max) {
    jq(id).val(viewer.defaults.bars_padding_max);
    return viewer.defaults.bars_padding_max;
  }
  else if (val < viewer.defaults.bars_padding_min) {
    jq(id).val(viewer.defaults.bars_padding_min);
    return viewer.defaults.bars_padding_min;
  }
  else {
    // It's fine return the actual val.
    return val;
  }

}

function set_and_validate_bootstrap_cutoff_input() {
  VAL_BOOTSTRAP_CUTOFF_UNFILLED_DOT = parseFloat(jq(global.html.id.inner_dots_cutoff_unfilled).val());
  VAL_BOOTSTRAP_CUTOFF_FILLED_DOT   = parseFloat(jq(global.html.id.inner_dots_cutoff_filled).val());

  // First check if either are NaN, if so use the default value.
  if (isNaN(VAL_BOOTSTRAP_CUTOFF_UNFILLED_DOT)) {
    // Set it to the deault value.
    jq(global.html.id.inner_dots_cutoff_unfilled).val(viewer.defaults.inner_dots_cutoff_unfilled);
    VAL_BOOTSTRAP_CUTOFF_UNFILLED_DOT = viewer.defaults.inner_dots_cutoff_unfilled;
  }

  if (isNaN(VAL_BOOTSTRAP_CUTOFF_FILLED_DOT)) {
    // Set it to the deault value.
    jq(global.html.id.inner_dots_cutoff_filled).val(viewer.defaults.inner_dots_cutoff_filled);
    VAL_BOOTSTRAP_CUTOFF_FILLED_DOT = viewer.defaults.inner_dots_cutoff_filled;
  }

  // TODO this should be an else.

  // Make sure that the bootstrap values are okay.
  // TODO the corresponding VAL vars should also be changed.
  if (VAL_BOOTSTRAP_CUTOFF_UNFILLED_DOT > MAX_BOOTSTRAP_VAL) {
    jq(global.html.id.inner_dots_cutoff_unfilled).val(MAX_BOOTSTRAP_VAL);
  }
  if (VAL_BOOTSTRAP_CUTOFF_FILLED_DOT > MAX_BOOTSTRAP_VAL) {
    jq(global.html.id.inner_dots_cutoff_filled).val(MAX_BOOTSTRAP_VAL);
  }
  if (VAL_BOOTSTRAP_CUTOFF_UNFILLED_DOT < 0) {
    jq(global.html.id.inner_dots_cutoff_unfilled).val(0);
  }
  if (VAL_BOOTSTRAP_CUTOFF_FILLED_DOT < 0) {
    jq(global.html.id.inner_dots_cutoff_filled).val(0);
  }

}

var sync_align_buttons_and_vals = function (checked, disabled) {
  jq(global.html.id.leaf_labels_align).prop("checked", checked);
  jq(global.html.id.leaf_dots_align).prop("checked", checked);
  jq(global.html.id.bars_align).prop("checked", checked);

  jq(global.html.id.leaf_labels_align).prop("disabled", disabled);
  jq(global.html.id.leaf_dots_align).prop("disabled", disabled);
  jq(global.html.id.bars_align).prop("disabled", disabled);

  // Make sure the val variable is also set so that everything is sync'd.
  VAL_LEAF_LABEL_ALIGN = checked;
};
