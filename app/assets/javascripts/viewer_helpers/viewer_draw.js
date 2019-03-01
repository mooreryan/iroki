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

// Actual drawing functions

// Draw bars
function draw_bars() {

  var num_bar_sets = how_many_bar_sets(name2md);

  function get_min_bar_heights() {
    var i   = 0;
    var ary = [];
    for (i = 0; i < num_bar_sets; ++i) {
      // TODO deal with negative values in the bar heights.
      var this_min = fn.ary.min($.map(name2md, function (val) {
        var height = val["bar" + (i + 1) + "_height"];
        if (isNaN(height)) {
          // Just treat NaN as 0.  It wont affect the calculation.
          return 0;
        }
        else {
          return height;
        }
      }));

      ary.push(this_min);
    }

    return ary;
  }

  // Returns an ary with max heights for each set.
  function get_max_bar_heights() {
    var i   = 0;
    var ary = [];
    for (i = 0; i < num_bar_sets; ++i) {
      // TODO deal with negative values in the bar heights.
      var this_max = fn.ary.max($.map(name2md, function (val) {
        // Need to take absolute value incase there are negative bar values.
        var height = Math.abs(val["bar" + (i + 1) + "_height"]);

        if (isNaN(height)) {
          // Just treat NaN as 0.  It wont affect the calculation.
          return 0;
        }
        else {
          return height;
        }
      }));

      ary.push(this_max);
    }

    return ary;
  }

  // Scales bar height so the max size will be the one set by the user.
  function scale_bar_height(height, max, min) {
    // Heights can be negative, but we always want a positive value for rectangle attrs.  The flipping is taken care of elsewhere.

    // If there are negative values we need to scale bars by 1/2
    var scale_factor = min < 0 ? 2 : 1;

    return Math.abs((height / max) * VAL_BAR_HEIGHT) / scale_factor;
  }

  // TODO If there is more than 2 translate directives, this will braek
  function get_radius_from_translate(trans) {
    var regex = /translate\(([0-9]+),.*translate\(([0-9]+)/;
    var match = trans.match(regex);

    if (match) {
      return parseFloat(match[1]) + parseFloat(match[2]);
    }
    else {
      return 0;
    }
  }

  // Takes the old transform (the tip of the leaf) and adds some padding so each set of bars is nice and separated.
  // Max height is the one set by the user, not the one from the data
  // Min height should always be the min height of the first series
  function new_transform(d, transform, bar_set, max_height_user_opt, max_height_data, min_height_data) {
    // We need to move it a bit away from the tip as well as center it on the line.  We can do that by adding another translate command tacked on to the end.  In rectangle mode, the first number moves it to the right if positive, to the left if negative.  The second number moves it down if positive, up if negative.

    // need a bit of extra padding for sets 2 - N
    // TODO need to set the 10 to an inner bar padding option.
    var extra       = bar_set * 10;
    var nudge_horiz = VAL_BAR_PADDING + (bar_set * max_height_user_opt) + extra;

    // If there are some min heights less than 0, some bars will be going backwards and we'd like a little more nudge.
    if (min_height_data < 0) {
      // We also want to scale the min height in terms of this max and min.
      nudge_horiz += scale_bar_height(min_height_data, max_height_data, min_height_data);
    }


    // If the bar height is a negative number (e.g., negative fold change) we need to flip the bar 180 and adjust the verticle nudge.  But ONLY if the layout is circle.  (not yet implemented for rectangle)
    var barh = d.metadata["bar" + (i + 1) + "_height"];

    if (LAYOUT_CIRCLE && barh < 0) {
      var nudge_vert = VAL_BAR_WIDTH / 2;
    }
    else {
      // This will center it on the line
      var nudge_vert = -VAL_BAR_WIDTH / 2;
    }


    var ajusted_transform = transform + " translate(" + nudge_horiz + ", " + nudge_vert + ")";

    // Finally, if barh is negative we need to add a 180 degree rotation to get the bar going in the opposite direction.
    if (LAYOUT_CIRCLE && barh < 0) {
      ajusted_transform += " rotate(180)";
    }
    else if (LAYOUT_STRAIGHT && barh < 0) {
      // Do a little something different for rectangle layouts
      ajusted_transform += " rotate(180) translate(0, -" + VAL_BAR_WIDTH + ")";
    }

    return ajusted_transform;
  }

  if (VAL_BAR_SHOW) {
    // TODO if this is slow, you could move it into the parse mapping file function or just after parsing.
    var max_bar_heights = get_max_bar_heights();
    var min_bar_heights = get_min_bar_heights();

    var start_radii = [];

    for (var i = 0; i < num_bar_sets; ++i) {
      var bars = d3.select("#bars-container-" + (i + 1))
                   .selectAll("rect")
                   .data(ROOT.descendants().filter(is_leaf));

      bars
        .enter().append("rect")
        .merge(bars)
        .attr("transform", function (d) {
          // This will be the point of the tip of the branch to the leaf.
          var transform = pick_transform(d, true);
          // We only want to adjust for min bar height if the first series has min values
          var new_trans = new_transform(d, transform, i, VAL_BAR_HEIGHT, max_bar_heights[0], min_bar_heights[0]);

          if (start_radii[i] === undefined) {
            start_radii.push(get_radius_from_translate(new_trans));
          }

          return new_trans;
        })
        .attr("fill", function (d) {
          var val = d.metadata["bar" + (i + 1) + "_color"]; //.bar1_color;

          return val ? val : VAL_BAR_COLOR;
        })
        // This is right to left length in rectangle mode
        .attr("width", function (d) {
          // Check and see if height is specified in mapping file
          var val = d.metadata["bar" + (i + 1) + "_height"]; //.bar1_height;

          // If not, just use the max height default.  Users might want bars of all the same length but having different colors.
          return val || val === 0 ? scale_bar_height(val, max_bar_heights[i], min_bar_heights[i]) : 0;
        })
        // This is up and down length in rectangle mode
        .attr("height", function () {
          return VAL_BAR_WIDTH;
        });
    }

    var rad_circles = d3.select("#bars-container")
                        .selectAll("circle")
                        .data(start_radii);
    var rad_lines   = d3.select("#bars-container")
                        .selectAll("path")
                        .data(start_radii);

    // Draw the radii (only circle layout)
    if (VAL_BAR_SHOW_START_AXIS && LAYOUT_CIRCLE) {
      rad_circles.enter()
                 .append("circle")
                 .merge(rad_circles)
                 .attr("r", function (d) {
                   return d;
                 })
                 .attr("fill", "none")
                 // TODO currently uses the default bar color
                 .attr("stroke", VAL_BAR_COLOR)
                 .attr("stroke-width", 2);
    }
    else if (VAL_BAR_SHOW_START_AXIS && LAYOUT_STRAIGHT) {
      alert("Bar axes are currently only available in circular mode!");
      // rad_circles.enter()
      //            .append("circle")
      //            .merge(rad_circles)
      //            .attr("r", function (d) {
      //              return d;
      //            })
      //            .attr("fill", "none")
      //            // TODO currently uses the default bar color
      //            .attr("stroke", VAL_BAR_COLOR)
      //            .attr("stroke-width", 2);
    }
    else {
      rad_circles.remove();
    }
  }
  else {
    for (i = 0; i < num_bar_sets; ++i) {
      var bars = d3.select("#bars-container-" + (i + 1))
                   .selectAll("rect")
                   .data(ROOT.descendants().filter(is_leaf));

      bars.remove();

      d3.select("#bars-container")
        .selectAll("circle")
        .remove();
    }
  }
}

// Draw dots
function draw_inner_dots() {

  var no_root_dot = LAYOUT_RADIAL && (TREE_IS_ROOTED_ON_A_LEAF_NODE || !VAL_BIOLOGICALLY_ROOTED);

  var dat = no_root_dot ?
    ROOT.descendants().filter(function (d) {
      return is_inner(d) && !is_root(d);
    }) :
    ROOT.descendants().filter(is_inner);

  inner_dots = d3.select("#inner-dot-container")
                 .selectAll("circle")
                 .data(dat);

  if (SHOW_INNER_DOTS) {
    inner_dots
      .enter().append("circle")
      .attr("class", "inner")
      .attr("r", INNER_DOT_SIZE)
      .attr("transform", function (d) {
        return pick_transform(d);
      })
      .attr("fill", inner_dot_fill)
      .attr("stroke", inner_dot_stroke)
      .attr("stroke-width", inner_dot_stroke_width); // TODO make this an option.

    inner_dots.merge(inner_dots)
              .attr("r", INNER_DOT_SIZE)
              .attr("transform", function (d) {
                return pick_transform(d);
              })
              .attr("fill", inner_dot_fill)
              .attr("stroke", inner_dot_stroke)
              .attr("stroke-width", inner_dot_stroke_width); // TODO make this an option.


  }
  else {
    inner_dots
      .remove();
  }
}

function draw_leaf_dots() {
  leaf_dots = d3.select("#leaf-dot-container")
                .selectAll("circle")
                .data(ROOT.descendants().filter(is_leaf));

  if (SHOW_LEAF_DOTS) {
    leaf_dots
      .enter().append("circle")
      .attr("class", "leaf")
      .attr("transform", function (d) {
        return pick_transform(d);
      })
      .attr("r", function (d) {
        var val = d.metadata.leaf_dot_size;
        return val ? val : LEAF_DOT_SIZE;
      })
      .attr("fill", function (d) {
        var val = d.metadata.leaf_dot_color;
        return val ? val : VAL_LEAF_DOT_COLOR;
      });

    leaf_dots.merge(leaf_dots)
             .attr("transform", function (d) {
               return pick_transform(d);
             })
             .attr("r", function (d) {
               var val = d.metadata.leaf_dot_size;
               return val ? val : LEAF_DOT_SIZE;
             })
             .attr("fill", function (d) {
               var val = d.metadata.leaf_dot_color;
               return val ? val : VAL_LEAF_DOT_COLOR;
             });
  }
  else {
    leaf_dots
      .remove();
  }
}

function draw_inner_labels() {
  inner_labels = d3.select("#inner-label-container")
                   .selectAll("text")
                   .data(ROOT.descendants().filter(is_inner));

  if (SHOW_INNER_LABELS) {

    inner_labels.exit().remove();

    inner_labels
      .enter().append("text")
      .attr("class", "inner")
      // .attr("font-size", 0)
      .attr("dy", text_y_offset)
      .attr("dx", function (d) {
        return text_x_offset(d, null);
      })
      .attr("text-anchor", text_anchor)
      .attr("transform", function (d) {
        return pick_transform(d);
      })
      .text(function (d) {
        return d.data.name;
      })
      .attr("fill", VAL_INNER_LABEL_COLOR)
      .attr("font-size", INNER_LABEL_SIZE)
      .attr("font-family", VAL_INNER_LABEL_FONT);

    inner_labels
      .merge(inner_labels)
      .attr("dy", text_y_offset)
      .attr("dx", function (d) {
        return text_x_offset(d, null);
      })
      .attr("text-anchor", text_anchor)
      .attr("transform", function (d) {
        return pick_transform(d);
      })
      .attr("fill", VAL_INNER_LABEL_COLOR)
      .attr("font-size", INNER_LABEL_SIZE)
      .attr("font-family", VAL_INNER_LABEL_FONT);

  }
  else {
    inner_labels
    // .attr("font-size", 0)
      .remove();
  }
}
