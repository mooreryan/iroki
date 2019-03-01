// Depending on the tree rotation, you need to have a different test for whether the labels flip.
function circular_label_flipping_test(x) {
  // Returns the value at the bottom of the circle
  function circle_key_points(rot) {
    var bottom, top;

    if (rot <= 90) {
      bottom = 90 - rot;
      top    = bottom + 180;
    }
    else if (rot <= 270) {
      bottom = 360 - (rot - 90);
      top    = bottom - 180;
    }
    else {
      bottom = 360 - (rot - 90);
      top    = bottom + 180;
    }

    return { "bottom": bottom, "top": top };
  }

  var key_points = circle_key_points(TREE_ROTATION);

  if (TREE_ROTATION <= 90 || TREE_ROTATION > 270) {
    return x < key_points.bottom || x > key_points.top;
  }
  else {
    return x < key_points.bottom && x > key_points.top;
  }
}

// These functions update the layout
function circle_transform(d, x, y, is_bar) {
  if (is_bar) {
    // Bars never get the final rotation.
    return "rotate(" + d[x] +
      ") translate(" + d[y] + ", 0)";
  }
  else {
    return "rotate(" + d[x] +
      ") translate(" + d[y] + ", 0)" +
      (circular_label_flipping_test(d[x]) ? "" : " rotate(180)");
  }
}

function rectangle_transform(d, x, y, is_bar) {
  // TODO if you add back in the ability to rotate rectangles, you'll need to handle bar rotation seperately.
  return "rotate(0) translate(" + d[x] + " " + d[y] + ") rotate(" +
    LABEL_ROTATION + ")";
}

// TODO when picking transform for bars, we don't want the final rotate_by at all (or just set it to 0).
function pick_transform(d, is_bar) {
  if (LAYOUT_CIRCLE && is_leaf(d)) {
    return circle_transform(d, the_x, VAL_LEAF_LABEL_ALIGN ? "y" : the_y, is_bar);
  }
  else if (LAYOUT_CIRCLE) {
    return circle_transform(d, the_x, the_y, is_bar);
  }
  else if (LAYOUT_STRAIGHT && is_leaf(d)) {
    return rectangle_transform(d, the_x, VAL_LEAF_LABEL_ALIGN ? "y" : the_y, is_bar);
  }
  else if (LAYOUT_STRAIGHT) {
    return rectangle_transform(d, the_x, the_y, is_bar);
  }
  else {
    var rotate_by = utils__rad_to_deg(Math.atan2((d.radial_layout_info.y - d.radial_layout_info.parent_y), (d.radial_layout_info.x - d.radial_layout_info.parent_x)));

    if (!is_bar) {
      // Check the adjustments if we are not a bar.
      if (-90 < rotate_by && rotate_by < 90) {
        // Don't change rotate by
      }
      else if (rotate_by >= 90) { // TODO which should have the equal part
        rotate_by += 180; // TODO also flip the text-anchor to end
      }
      else if (rotate_by <= -90) {
        rotate_by -= 180; // TODO also flip the text anchor to end
      }
    }

    if (isNaN(rotate_by)) {
      rotate_by = 0;
    }

    return "rotate(0) translate(" + (d.radial_layout_info.x * RADIAL_LAYOUT_WEIGHT) + " " + (d.radial_layout_info.y * RADIAL_LAYOUT_WEIGHT) + ") rotate(" + rotate_by + ")"; // TODO labels will need rotation for radial layouts
  }
}

// Stuff dealing with text label positioning
function text_x_offset(d, padding) {
  // Set padding to 0 if it is not passed in.
  if (!padding) {
    padding = 0;
  }
  else {
    // Use the 16 px == 1 em convention
    padding /= 16;
  }

  var positive_padding = 0.6 + padding + "em";
  var negative_padding = -0.6 - padding + "em";


  // TODO replace these with function params
  // var test = TREE_ROTATION == ROTATED ? d[the_x] < 180 : (d[the_x] < 90 || d[the_x] > 270);

  if (LAYOUT_CIRCLE) { // circular
    if (circular_label_flipping_test(d[the_x])) {
      return positive_padding;
    }
    else {
      return negative_padding;
    }
  }
  else if (LAYOUT_RADIAL) {
    // Positive moves text anchor start labels away from branch tip, but moves text anchor end labels closer to the branch tip.
    var rotate_by = utils__rad_to_deg(Math.atan2((d.radial_layout_info.y - d.radial_layout_info.parent_y), (d.radial_layout_info.x - d.radial_layout_info.parent_x)));

    if (-90 < rotate_by && rotate_by < 90) {
      // Don't change rotate by
      // return "start";
      return positive_padding;
    }
    else if (rotate_by >= 90) { // TODO which should have the equal part
      // rotate_by += 180; // TODO also flip the text-anchor to end
      // return "end";
      return negative_padding;
    }
    else if (rotate_by <= -90) {
      // rotate_by -= 180; // TODO also flip the text anchor to end
      // return "end";
      return negative_padding;

    }

    return "1.0em"; // TODO radial layout placeholder
  }
  else {
    if (LABEL_ROTATION === 90) {
      return positive_padding; // They're going up and down so move away from branch
    }
    else if (LABEL_ROTATION === -90) {
      return negative_padding;
    }
    else {
      return "0em";
    }
  }
}
function text_y_offset(d) {
  if (LAYOUT_CIRCLE) { // circular
    return "0.2em";  // center the label on the branch;
  }
  else if (LAYOUT_RADIAL) {
    return "0.3em";
  }
  else {
    if (TREE_ROTATION === 0) {
      if (LABEL_ROTATION === 90 || LABEL_ROTATION === -90) {
        return "0.3em"; // They're going up and down so center them
      }
      else {
        return "1.2em";
      }
    }
    else {
      if (LABEL_ROTATION === 0 || LABEL_ROTATION === 45) {
        return "1.2em";
      }
      else if (LABEL_ROTATION === 90) {
        return "0.3em";
      }
      else if (LABEL_ROTATION === 135 || LABEL_ROTATION === 180) {
        return "-1.2em";
      }
    }
  }
}
function circular_text_anchor(d) {
  return circular_label_flipping_test(d[the_x]) ? "start" : "end";
}
function straight_text_anchor(d) {
  if (TREE_ROTATION == 0) {
    if (LABEL_ROTATION == 0) {
      return "middle";
    }
    else if (LABEL_ROTATION < 0) {
      return "end";
    }
    else {
      return "start";
    }
  }
  else {
    if (LABEL_ROTATION == 0 || LABEL_ROTATION == 180) {
      return "middle";
    }
    else {
      return "start";
    }
  }
}
function radial_text_anchor(d) {
  var rotate_by = utils__rad_to_deg(Math.atan2((d.radial_layout_info.y - d.radial_layout_info.parent_y), (d.radial_layout_info.x - d.radial_layout_info.parent_x)));

  if (-90 < rotate_by && rotate_by < 90) {
    // Don't change rotate by
    return "start";
  }
  else if (rotate_by >= 90) { // TODO which should have the equal part
    // rotate_by += 180; // TODO also flip the text-anchor to end
    return "end";
  }
  else if (rotate_by <= -90) {
    // rotate_by -= 180; // TODO also flip the text anchor to end
    return "end";
  }
}
function text_anchor(d) {
  if (LAYOUT_CIRCLE) {
    return circular_text_anchor(d);
  }
  else if (LAYOUT_STRAIGHT) {
    return straight_text_anchor(d);
  }
  else {
    return radial_text_anchor(d);
  }
}

// Summing tree stuff
// Set the radius of each node by recursively summing and scaling the distance from the root.
function setRadius(d, y0, k) {
  d.radius = (y0 += d.data.branch_length) * k;
  if (d.children) {
    d.children.forEach(function (d) {
      setRadius(d, y0, k);
    });
  }
}

// Compute the maximum cumulative length of any node in the tree.
function maxLength(d) {
  return d.data.branch_length + (d.children ? d3.max(d.children, maxLength) : 0);
}



// Setting up the tree data structure for plotting
function set_up_hierarchy() {
  // Circles specify 360 and the RADIUS, but the width is a diameter.
  circle_cluster = d3.cluster()
                     .size([360, the_width / 2])
                     .separation(function (a, b) {
                       return 1;
                     });

  rectangle_cluster = d3.cluster()
                        .size([the_width * 1, the_height * 1])
                        .separation(function (a, b) {
                          return 1;
                        });

  ROOT = d3.hierarchy(parsed_newick, function (d) {
    return d.branchset;
  })
           .sum(function (d) {
             return d.branchset ? 0 : 1;
           })
           .sort(sort_function);

  TREE_IS_ROOTED_ON_A_LEAF_NODE = is_rooted_on_a_leaf_node(ROOT);
  try_disable_bio_rooted();

  // Add metadata if it is available.
  if (name2md) {
    add_metadata(ROOT, name2md, MATCHING_TYPE);
  }
  else {
    add_blank_metadata(ROOT);
  }

  // Set the root branch length to zero each time.
  if (LAYOUT_CIRCLE) {
    circle_cluster(ROOT);
    setRadius(ROOT, ROOT.data.branch_length = 0, (the_width / 2) / maxLength(ROOT));

  }
  else if (LAYOUT_STRAIGHT) {
    rectangle_cluster(ROOT);
    // TODO should this be width or height
    setRadius(ROOT, ROOT.data.branch_length = 0, (the_height * 1) / maxLength(ROOT));
  }
  else { // LAYOUT_RADIAL
    radial_cluster(ROOT);
    // TODO should this actually be the same as for straight layout?
    setRadius(ROOT, ROOT.data.branch_length = 0, (the_height * 1) / maxLength(ROOT));

  }
}



// Link helpers
function straight_link(d) {
  return "M " + (d.source[the_x] - the_width) + " " + d.source[the_y] + " L " + (d.target[the_x] - the_height) + " " + d.target[the_y];
}
function link_radial(d) {
  var start_point = (d.target.radial_layout_info.parent_x * RADIAL_LAYOUT_WEIGHT) + " " + (d.target.radial_layout_info.parent_y * RADIAL_LAYOUT_WEIGHT);
  var end_point   = (d.target.radial_layout_info.x * RADIAL_LAYOUT_WEIGHT) + " " + (d.target.radial_layout_info.y * RADIAL_LAYOUT_WEIGHT);

  return "M " + start_point + " L " + end_point;
}
function linkCircle(d) {
  return linkStep(d.source[the_x], d.source[the_y], d.target[the_x], d.target[the_y]);
}
function rectangle_link(d, x, y) {
  var start_point, mid_point, end_point;

  start_point = d.source[x] + " " + d.source[y];
  end_point   = d.target[x] + " " + d.target[y];

  // Only side to side is an option
  mid_point = d.target[x] + " " + d.source[y];

  // if (document.getElementById("up-and-down").selected) {
  //   mid_point = (d.target[the_x] - (the_width - the_width)) + " " + d.source[the_y];
  // } else {
  //   mid_point = (d.source[the_x] - (the_width - the_width)) + " " + d.target[the_y];
  // }

  return "M " + start_point + " L " + mid_point + " L " + end_point;
}
// Like d3.svg.diagonal.radial, but with square corners.
function linkStep(startAngle, startRadius, endAngle, endRadius) {
  var c0 = Math.cos(startAngle = (startAngle) / 180 * Math.PI),
      s0 = Math.sin(startAngle),
      c1 = Math.cos(endAngle = (endAngle) / 180 * Math.PI),
      s1 = Math.sin(endAngle);
  return "M" + startRadius * c0 + "," + startRadius * s0
    + (endAngle === startAngle ? "" : "A" + startRadius + "," + startRadius + " 0 0 " + (endAngle > startAngle ? 1 : 0) + " " + startRadius * c1 + "," + startRadius * s1)
    + "L" + endRadius * c1 + "," + endRadius * s1;
}
function link_path(d) {

  if (LAYOUT_CIRCLE) {
    return linkCircle(d);
  }
  else if (LAYOUT_STRAIGHT) {
    return rectangle_link(d, the_x, the_y);
  }
  else {
    return link_radial(d);
  }
}
function link_extension_path(d) {
  // TODO need an option for labels lined up on the radius or labels at the end of the links.
  // the_width here is actually the diameter, not the radius.
  function linkCircleExtension(d) {
    return linkStep(d.target[the_x], d.target[the_y], d.target[the_x], the_width / 2);
  }
  function link_rectangle_extension(d, x, y) {
    var start_point = d.target[x] + " " + d.target["radius"];
    var end_point   = d.target[x] + " " + d.target["y"];

    return "M " + start_point + " L " + end_point;
  }


  if (LAYOUT_CIRCLE) {
    return linkCircleExtension(d);
  }
  else {
    return link_rectangle_extension(d, the_x, "y");
  }
}



// Updating helpers
// Start here.  TODO this function is wonky.
function update_viewer_size_fixed() {
  var is_checked = jq(global.html.id.viewer_size_fixed).prop("checked");
  if (is_checked) {
    jq("tree-div").attr("style", "overflow: scroll; display: block; height: " + (verge.viewportH() * 0.8) + "px;");
  }
  else {
    jq("tree-div").attr("style", null);
  }
}
function update_form_constants() {

  // Make sure the bootstrap cutoffs are good
  set_and_validate_bootstrap_cutoff_input();

  // Make sure bar padding text input is good
  validate_bar_padding_input();

  VAL_BIOLOGICALLY_ROOTED = is_checked(global.html.id.biologically_rooted);
  // try_disable_bio_rooted();

  VAL_LEAF_LABEL_COLOR = jq(global.html.id.leaf_labels_color).val();
  VAL_LEAF_LABEL_FONT  = jq(global.html.id.leaf_labels_font).val();

  VAL_INNER_LABEL_COLOR = jq(global.html.id.inner_labels_color).val();
  VAL_INNER_LABEL_FONT  = jq(ID_INNER_LABEL_FONT).val();

  SELECTED_BRANCH_COLOR = document.getElementById(global.html.id.branches_color).value;
  SELECTED_BRANCH_WIDTH = parseInt(document.getElementById(global.html.id.branches_width).value);

  VAL_LEAF_DOT_COLOR  = jq(global.html.id.leaf_dots_color).val();
  VAL_INNER_DOT_COLOR = jq(global.html.id.inner_dots_color).val();


  MATCHING_TYPE = document.getElementById(ID_MATCHING_TYPE).value;

  // Get sorting options
  SORT_NONE       = "not-sorted";
  SORT_ASCENDING  = "ascending";
  SORT_DESCENDING = "descending";
  SORT_STATE      = document.getElementById(global.html.id.tree_sorting).value;

  if (SORT_STATE === SORT_NONE) {
    sort_function = sort_none;
  }
  else if (SORT_STATE === SORT_ASCENDING) {
    sort_function = sort_ascending;
  }
  else {
    sort_function = sort_descending;
  }

  SHOW_SCALE_BAR          = document.getElementById(global.html.id.scale_bar_show).checked;
  SCALE_BAR_OFFSET_WEIGHT = parseFloat(document.getElementById(global.html.id.scale_bar_offset_weight).value);
  SCALE_BAR_LENGTH        = parseFloat(document.getElementById(global.html.id.scale_bar_length).value);


  LAYOUT_CIRCLE   = document.getElementById("circular-tree").selected;
  LAYOUT_STRAIGHT = document.getElementById("rectangular-tree").selected;
  LAYOUT_RADIAL   = document.getElementById(global.html.id.tree_layout_radial).selected;

  // Enable the save button
  document.getElementById("save-svg").removeAttribute("disabled");
  document.getElementById("save-png").removeAttribute("disabled");

  // Bars
  VAL_BAR_SHOW            = document.getElementById(global.html.id.bars_show).checked;
  VAL_BAR_SHOW_START_AXIS = is_checked(global.html.id.bars_axis_show);
  VAL_BAR_PADDING         = validate_bar_padding_input(global.html.id.bars_padding);
  VAL_BAR_WIDTH           = jq(global.html.id.bars_width).val();
  VAL_BAR_HEIGHT          = jq(global.html.id.bars_height).val();
  VAL_BAR_COLOR           = jq(global.html.id.bars_color).val();

  // Dots
  VAL_SHOW_INNER_DOTS = jq(global.html.id.inner_dots_show).val();
  SHOW_INNER_DOTS     = document.getElementById(global.html.id.inner_dots_show).checked;
  SHOW_LEAF_DOTS      = document.getElementById(global.html.id.leaf_dots_show).checked;
  INNER_DOT_SIZE      = parseInt(document.getElementById(global.html.id.inner_dots_size).value);
  LEAF_DOT_SIZE       = parseInt(document.getElementById(global.html.id.leaf_dots_size).value);

  switch (VAL_SHOW_INNER_DOTS) {
    case global.html.id.inner_dots_show_none:
      disable(global.html.id.inner_dots_size);
      SHOW_INNER_DOTS = false;

      break;
    case global.html.id.inner_dots_show_normal:
      undisable(global.html.id.inner_dots_size);
      SHOW_INNER_DOTS = true;

      break;
    case global.html.id.inner_dots_show_bootstrap:
      undisable(global.html.id.inner_dots_size);
      SHOW_INNER_DOTS = true;

      break;
    default:
      // Something weird happened, just disable it.
      disable(global.html.id.inner_dots_size);
      SHOW_INNER_DOTS = false;

      break;
  }

  if (SHOW_LEAF_DOTS) {
    undisable(global.html.id.leaf_dots_size);
  }
  else {
    disable(global.html.id.leaf_dots_size);
  }


  INNER_LABEL_SIZE       = parseInt(document.getElementById(global.html.id.inner_labels_size).value);
  LEAF_LABEL_SIZE        = parseInt(document.getElementById(global.html.id.leaf_labels_size).value);
  VAL_LEAF_LABEL_PADDING = validate_leaf_label_padding_input(global.html.id.leaf_labels_padding);

  TREE_BRANCH_CLADOGRAM = "cladogram";
  TREE_BRANCH_NORMAL    = "normalogram";
  if (LAYOUT_RADIAL) {
    TREE_BRANCH_STYLE = "normalogram";
    $("#" + global.html.id.tree_branch_style).prop("disabled", true);
  }
  else {
    $("#" + global.html.id.tree_branch_style).prop("disabled", false);
    TREE_BRANCH_STYLE = document.getElementById(global.html.id.tree_branch_style).value;
  }

  if (LAYOUT_STRAIGHT) {
    // It could be coming from the circle which has a different slider behavior
    elem          = document.getElementById(global.html.id.tree_rotation);
    TREE_ROTATION = 270;
    elem.setAttribute("disabled", "");
    // var val = parseInt(elem.value);
    // if (val < 180) { // The slider will jump to the beginning so set it to 0.
    //   TREE_ROTATION = 0;
    //   elem.setAttribute("value", "0");
    // }
    // else {
    //   TREE_ROTATION = 270;
    //   elem.setAttribute("value", "270");
    // }
    // elem.setAttribute("min", "0");
    // elem.setAttribute("max", "270");
    // elem.setAttribute("step", "270");
  }
  else {
    // Works for both circular and radial
    elem = document.getElementById(global.html.id.tree_rotation);
    elem.removeAttribute("disabled");

    TREE_ROTATION = parseInt(elem.value);
    // Flip tree rotation to 0
    TREE_ROTATION = TREE_ROTATION == 360 ? 0 : TREE_ROTATION;
    elem.setAttribute("min", "0");
    elem.setAttribute("max", "360");
    elem.setAttribute("step", "1");
  }

  if (LAYOUT_STRAIGHT && TREE_ROTATION == ROTATED) { // ie rectangle tree on its side
    LABEL_ROTATION = parseInt(document.getElementById(global.html.id.leaf_labels_rotation).value) + 90;
  }
  else {
    LABEL_ROTATION = parseInt(document.getElementById(global.html.id.leaf_labels_rotation).value);
  }
  SHOW_INNER_LABELS = document.getElementById(global.html.id.inner_labels_show).checked;
  SHOW_LEAF_LABELS  = document.getElementById(global.html.id.leaf_labels_show).checked;

  // Show or hide align tip labels TODO also account for bars here
  if (
    (!SHOW_LEAF_LABELS && !SHOW_LEAF_DOTS && !VAL_BAR_SHOW) ||
    TREE_BRANCH_STYLE === TREE_BRANCH_CLADOGRAM ||
    LAYOUT_RADIAL
  ) {
    // not checked, disabled.
    sync_align_buttons_and_vals(false, true);
    // document.getElementById(global.html.id.leaf_labels_align).setAttribute("disabled", "");
    // document.getElementById(global.html.id.leaf_labels_align).removeAttribute("checked");
    // VAL_LEAF_LABEL_ALIGN = false;
  }
  else {
    undisable(global.html.id.leaf_labels_align);
    VAL_LEAF_LABEL_ALIGN = is_checked(global.html.id.leaf_labels_align);
    sync_align_buttons_and_vals(VAL_LEAF_LABEL_ALIGN, false);
  }

  // Show/hide labels size
  if (SHOW_LEAF_LABELS) {
    document.getElementById(global.html.id.leaf_labels_size).removeAttribute("disabled");
    document.getElementById(global.html.id.leaf_labels_padding).removeAttribute("disabled");
  }
  else {
    document.getElementById(global.html.id.leaf_labels_size).setAttribute("disabled", "");
    document.getElementById(global.html.id.leaf_labels_padding).setAttribute("disabled", "");
  }

  // If it's circle the label rotation gets disabled
  if (LAYOUT_STRAIGHT && (SHOW_LEAF_LABELS || SHOW_INNER_LABELS)) {
    document.getElementById(global.html.id.leaf_labels_rotation).removeAttribute("disabled");
  }
  else {
    document.getElementById(global.html.id.leaf_labels_rotation).setAttribute("disabled", "");
  }

  if (SHOW_INNER_LABELS) {
    document.getElementById(global.html.id.inner_labels_size).removeAttribute("disabled");
  }
  else {
    document.getElementById(global.html.id.inner_labels_size).setAttribute("disabled", "");
  }

  // Set the height to match the width
  if (LAYOUT_CIRCLE || LAYOUT_RADIAL) {
    // Disable the height slider
    elem          = document.getElementById(global.html.id.tree_height);
    elem.disabled = true;

    width  = size_transform(parseInt(document.getElementById(global.html.id.tree_width).value));
    height = width;

    padding = parseFloat(document.getElementById(global.html.id.tree_padding).value);

    set_value_of(global.html.id.tree_height, width);

    $("#width-label").html("Size");

  }
  else {
    elem          = document.getElementById(global.html.id.tree_height);
    elem.disabled = false;

    width  = size_transform(parseInt(document.getElementById(global.html.id.tree_width).value));
    height = size_transform(parseInt(document.getElementById(global.html.id.tree_height).value));

    padding = parseFloat(document.getElementById(global.html.id.tree_padding).value);

    $("#width-label").html("Horizontal");
  }

  elem                 = document.getElementById(global.html.id.tree_width);
  RADIAL_LAYOUT_WEIGHT = size_transform(elem.value);

  //  padding is the total % of padding.  If it is set to 0.1, then the inner width will be 90% of the svg.
  width  = Math.round(width * (1 - padding));
  height = Math.round(height * (1 - padding));

  if (TREE_ROTATION == ROTATED) {
    // Need to flip height and width
    the_width  = height;
    the_height = width;

    the_width  = height;
    the_height = width;

  }
  else {

    the_width  = width;
    the_height = height;

    the_width  = width;
    the_height = height;
  }
  the_x = "x";
  the_y = TREE_BRANCH_STYLE == TREE_BRANCH_CLADOGRAM ? "y" : "radius";

  update_viewer_size_fixed();
}


// Adjusting tree size
function resize_svg_straight_layout(svg_id, chart_id) {

  var the_chart = document.getElementById(chart_id);
  var the_svg   = document.getElementById(svg_id);

  var chart_bbox = the_chart.getBBox();
  the_chart.setAttribute(global.html.id.tree_width, chart_bbox.width);
  the_chart.setAttribute(global.html.id.tree_height, chart_bbox.height);

  var new_svg_height, new_svg_width;

  var chart_bbox_width_padding  = chart_bbox.width * padding;
  var chart_bbox_height_padding = chart_bbox.height * padding;

  var g_chart_transform;
  // var g_chart_rotation;
  // var g_chart_translation

  if (LAYOUT_STRAIGHT && TREE_ROTATION == ROTATED) {

    new_svg_height = chart_bbox.width + (2 * chart_bbox_width_padding);
    new_svg_width  = chart_bbox.height + (2 * chart_bbox_height_padding);

    g_chart_transform = "rotate(270) translate(" +
      -(new_svg_height + chart_bbox.x - chart_bbox_width_padding) + " " +
      chart_bbox_height_padding + ")";

  }
  else if (LAYOUT_STRAIGHT || LAYOUT_RADIAL) {
    new_svg_width  = chart_bbox.width + (2 * chart_bbox_width_padding);
    new_svg_height = chart_bbox.height + (2 * chart_bbox_height_padding);

    g_chart_transform = "rotate(0) translate(" +
      // TODO sometimes the bbox x and y values are negative
      (chart_bbox_width_padding - chart_bbox.x) + " " +
      (chart_bbox_height_padding - chart_bbox.y) + ")";
  }
  else if (LAYOUT_CIRCLE) {
    var radius     = chart_bbox.width > chart_bbox.height ? chart_bbox.width / 2 : chart_bbox.height / 2;
    var diameter   = radius * 2;
    var padding_px = diameter * padding;

    // This is actually the length of the diagonal plus padding.
    var diameter_with_padding = Math.sqrt(Math.pow(diameter, 2) * 2) + (padding_px * 2);

    new_svg_width  = diameter_with_padding;
    new_svg_height = diameter_with_padding;

    g_chart_transform = "translate(" + (new_svg_width / 2) + "," + (new_svg_height / 2) +
      ") rotate(" + TREE_ROTATION + ")";

    the_chart.setAttribute(global.html.id.tree_width, new_svg_width);
    the_chart.setAttribute(global.html.id.tree_height, new_svg_height);
  }

  // Update elements
  the_svg.setAttribute(global.html.id.tree_width, new_svg_width);
  the_svg.setAttribute(global.html.id.tree_height, new_svg_height);

  the_chart.setAttribute("transform", g_chart_transform);
}
function adjust_tree() {
  resize_svg_straight_layout("svg-tree", "chart-container");
}



// Sorting functions
function sort_descending(a, b) {
  return (a.value - b.value) || d3.ascending(a.data.branch_length, b.data.branch_length);
}

function sort_ascending(a, b) {
  return (b.value - a.value) || d3.descending(a.data.branch_length, b.data.branch_length);
}

function sort_none(a, b) {
  return 0;
}
