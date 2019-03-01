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
