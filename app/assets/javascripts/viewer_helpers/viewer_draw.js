// Actual drawing functions

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

function draw_arcs() {
  // TODO only draw on circular trees.

  function dot_angle_to_arc_angle(dot_angle) {
    return fn.math.degrees_to_radians(dot_angle + 90);
  }

  var num_arc_sets = how_many_arc_sets(name2md);

  // This has all the leaves in topological order (at least in the circle tree mode).
  var leaves        = ROOT.leaves();
  var arc_padding   = global.html.val.arcs_padding;
  var arc_size      = global.html.val.arcs_height;
  var corner_radius = global.html.val.arcs_cap_radius;

  // Make sure there are no arcs on the figure
  for (i = 0; i < num_arc_sets; ++i) {
    d3.select("#arcs-container-" + (i + 1)).remove();
  }

  if (global.html.val.arcs_show) {
    for (var i = 0; i < num_arc_sets; ++i) {
      var arc_color_category = "arc" + (i + 1) + "_color";

      var arc_data = set_up_arc_data(leaves, arc_color_category);

      var arcs = d3.select("#chart-container")
                   .append("g").attr("id", "arcs-container-" + (i + 1))
                   .selectAll("path").data(arc_data.arc_start_nodes);

      if (i === 0) {
        var inner_radius = leaves[0].y + arc_padding;
      }
      else {
        var inner_radius = leaves[0].y + arc_padding + (i * arc_size) + (i * arc_padding);
      }
      var outer_radius = inner_radius + arc_size;

      var max_corner_radius = (outer_radius - inner_radius) / 2;

      arcs.enter().append("path")
          .attr("d", function (d, i) {

            var start = pick_transform(d)
              .match(/^rotate\(([0-9]+\.*[0-9]*)\)/);

            var next_start = pick_transform(leaves[arc_data.arc_stop_indices[(i + 1) % arc_data.arc_stop_indices.length]])
              .match(/^rotate\(([0-9]+\.*[0-9]*)\)/);

            // TODO assert start and next_start

            var arc_ang = dot_angle_to_arc_angle(parseFloat(start[1]));

            var next_arc_ang = dot_angle_to_arc_angle(parseFloat(next_start[1]));

            var arc_generator = d3.arc()
                                  .cornerRadius(corner_radius)
                                  .innerRadius(inner_radius)
                                  .outerRadius(outer_radius)
                                  .startAngle(arc_ang)
                                  .endAngle(next_arc_ang);

            return arc_generator();
          })
          .attr("fill", function (d) {
            return d.metadata[arc_color_category] || "none";
          })
          .merge(arcs);

      arcs.exit().remove();
    }
  }
}

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

function draw_leaf_labels() {

  labels = d3.select("#leaf-label-container")
             .selectAll("text")
             .data(ROOT.descendants().filter(is_leaf));

  if (SHOW_LEAF_LABELS) {
    labels.exit().remove();

    // TODO clean up duplicates
    labels
      .enter().append("text")
      .attr("class", "leaf")
      // .attr("font-size", 0)
      .attr("dy", text_y_offset)
      .attr("dx", function (d) {
        return text_x_offset(d, VAL_LEAF_LABEL_PADDING);
      })
      .attr("text-anchor", text_anchor)
      .attr("transform", function (d) {
        return pick_transform(d);
      })
      .text(function (d) {
        var new_name = d.metadata.new_name;

        return new_name ? new_name : d.data.name;
      })
      .attr("font-size", function (d) {
        var size = d.metadata.leaf_label_size;
        return size ? size : LEAF_LABEL_SIZE;
      })
      .attr("font-family", function (d) {
        var font = d.metadata.leaf_label_font;
        return font ? font : VAL_LEAF_LABEL_FONT;
      })
      .attr("fill", function (d) {
        var color = d.metadata.leaf_label_color;
        return color ? color : VAL_LEAF_LABEL_COLOR;
      })
      .on("click", toggle_selected);

    labels
    // What to do for merging
      .merge(labels)
      // Same things that may change
      .attr("dy", text_y_offset)
      .attr("dx", function (d) {
        return text_x_offset(d, VAL_LEAF_LABEL_PADDING);
      })
      .attr("text-anchor", text_anchor)
      .attr("transform", function (d) {
        return pick_transform(d);
      })
      .text(function (d) {
        var new_name = d.metadata.new_name;

        return new_name ? new_name : d.data.name;
      })
      .attr("font-size", function (d) {
        var size = d.metadata.leaf_label_size;
        return size ? size : LEAF_LABEL_SIZE;
      })
      .attr("font-family", function (d) {
        var font = d.metadata.leaf_label_font;
        return font ? font : VAL_LEAF_LABEL_FONT;
      })
      .attr("fill", function (d) {
        var color = d.metadata.leaf_label_color;
        return color ? color : VAL_LEAF_LABEL_COLOR;
      })
      .on("click", toggle_selected);

  }
  else {
    labels
    // .attr("font-size", 0)
      .remove();

    // If labels get removed, then we want all the nodes unselected.
    ROOT.descendants().forEach(function (node) {
      node.is_selected = false;
    });
  }
}

function draw_svg() {
  if (document.getElementById("svg-tree")) {
    svg.merge(svg)
       .attr("width", the_width * 1)
       .attr(global.html.id.tree_height, the_height * 1)
       .style("background-color", "white"); // TODO make bg color an option
  }
  else {
    // First remove loading message if there is one.
    // utils__set_status_msg_to_done();
    // d3.select("#loading-message").remove();

    // And add the svg.
    svg = d3.select("#tree-div")
            .append("svg")
            .attr("id", "svg-tree")
            .attr("width", the_width * 1)
            .attr("height", the_height * 1)
            .style("background-color", "white"); // TODO make bg color an option
  }
}

function draw_chart() {
  var chart_width, chart_height;
  var chart_transform_width, chart_transform_height;
  if (LAYOUT_CIRCLE) {
    chart_width  = the_width;
    chart_height = the_height;

    chart_transform_width  = the_width;
    chart_transform_height = the_height;
  }
  else {
    chart_width  = the_width * 1;
    chart_height = the_height * 1;

    chart_transform_width  = the_width * padding;
    chart_transform_height = the_height * padding;
  }

  if (document.getElementById("chart-container")) {
    chart.merge(chart)
         .attr("width", chart_width)
         .attr("height", chart_height)
         .attr("transform",
           "rotate(" + TREE_ROTATION + " " + the_width + " " + the_height + ") " +
           "translate(" + chart_transform_width + ", " + chart_transform_height + ")");
  }
  else {
    chart = svg.append("g")
               .attr("id", "chart-container")
               .attr("width", chart_width)
               .attr("height", chart_height)
               .attr("transform",
                 "rotate(" + TREE_ROTATION + " " + the_width + " " + the_height + ") " +
                 "translate(" + chart_transform_width + ", " + chart_transform_height + ")");
  }
}

function draw_links() {

  // reset the bio root warnings container
  biological_root_sibling_warnings = [];

  link = d3.select("#link-container")
           .selectAll("path")
           .data(ROOT.links());

  link.enter().append("path")
      .attr("fill", "none")
      .attr("stroke", "#000")
      .each(function (d) {
        d.target.linkNode = this;
      })
      .attr("d", link_path)
      .attr("stroke", function (d) {
        return get_branch_md_val(d.target, "branch_color", SELECTED_BRANCH_COLOR);
      })
      .attr("stroke-width", function (d) {
        return get_branch_md_val(d.target, "branch_width", SELECTED_BRANCH_WIDTH);
      });

  // .attr("stroke", function(d) { return d.target.color; });

  link.merge(link)
      .attr("fill", "none")
      .attr("stroke", "#000")
      .each(function (d) {
        d.target.linkNode = this;
      })
      .attr("d", link_path)
      .attr("stroke", function (d) {
        return get_branch_md_val(d.target, "branch_color", SELECTED_BRANCH_COLOR);
      })
      .attr("stroke-width", function (d) {
        return get_branch_md_val(d.target, "branch_width", SELECTED_BRANCH_WIDTH);
      });

  if (biological_root_sibling_warnings.length > 0 && !biological_root_sibling_warnings_already_warned) {
    // There were some warnings.
    alert(biological_root_sibling_warnings.join("\n"));
    biological_root_sibling_warnings_already_warned = true;
  }
}

function draw_link_extensions() {
  // Link extensions should never be drawn with radial layouts
  if (!LAYOUT_RADIAL) {
    linkExtension = d3.select("#link-extension-container")
                      .selectAll("path")
                      .data(ROOT.links().filter(function (d) {
                        return !d.target.children;
                      }));

    // var starts = root.links().filter(function(d) {
    //   return !d.target.children;
    // }).map(function(d) {
    //   return { "the_x" : d.target[the_x], "the_y" : d.target[the_y] };
    // });

    if (VAL_LEAF_LABEL_ALIGN) {
      linkExtension.exit().remove();

      // Draw the link extensions.  Don't need merge because they are either on or off.
      linkExtension
        .enter().append("path")
      // Start from the tip of the actual branch
      //   .attr("d", function (d, i)
      //   {
      //     return "M " + starts[i].the_x + " " + starts[i].the_y + "L " + starts[i].the_x + " " + starts[i].the_y
      //   })
        .attr("fill", "none")
        .attr("stroke", "#000")
        .attr("stroke-opacity", "0.35")
        .attr("stroke-width", SELECTED_BRANCH_WIDTH > 2 ? 2 : SELECTED_BRANCH_WIDTH)
        .attr("stroke-dasharray", "1, 5")
        .attr("class", "dotted-links")
        .each(function (d) {
          d.target.linkExtensionNode = this;
        })
        .attr("d", link_extension_path);
    }
    else {
      linkExtension
      // .attr("d", function(d, i) {
      //   return "M " + starts[i].the_x + " " + starts[i].the_y + "L " + starts[i].the_x + " " + starts[i].the_y
      // })
        .remove();
    }
  }
}

/**
 *
 * @param user_changed set this to true if the user triggered this (through even listener)
 */
function draw_scale_bar(user_changed) {
  d3.select("#scale-bar-container").remove();

  if (SHOW_SCALE_BAR) {
    var lengths;
    var mean_length;

    var SCALE_BAR_PADDING      = 50; // in pixels
    var SCALE_BAR_TEXT_PADDING = 5;


    var first_link = ROOT.links()[0];
    var pixels_per_unit_length;

    if (LAYOUT_RADIAL) {
      lengths = ROOT.descendants().map(function (d) {
        return d.data.branch_length;
      });

      pixels_per_unit_length = RADIAL_LAYOUT_WEIGHT * Math.sqrt(Math.pow(first_link.target.radial_layout_info.x - first_link.source.radial_layout_info.x, 2) + Math.pow(first_link.target.radial_layout_info.y - first_link.source.radial_layout_info.y, 2)) / first_link.target.data.branch_length;

    }
    else {
      if (TREE_BRANCH_STYLE == TREE_BRANCH_NORMAL) {
        lengths                = ROOT.descendants().map(function (d) {
          return d.data.branch_length;
        });
        pixels_per_unit_length = (first_link.target.radius - first_link.source.radius) / first_link.target.data.branch_length;

      }
      else {
        lengths = ROOT.descendants().map(function (d) {
          return d.height;
        });

        // The source height will be higher than the target height as the leaf nodes have a height of 0 and internal nodes add 1 for each speciation event.
        pixels_per_unit_length = (first_link.target.y - first_link.source.y) / (first_link.source.height - first_link.target.height);
      }
    }


    var rotated_rectangle = LAYOUT_STRAIGHT && TREE_ROTATION === ROTATED;
    mean_length           = fn.math.round(ary_mean(lengths), ROUNDING_PRECISION);

    var min_scale_bar_size;
    if (LAYOUT_CIRCLE) {
      min_scale_bar_size = 50; // circles look a bit smaller so make this half.
    }
    else if (LAYOUT_STRAIGHT) {
      min_scale_bar_size = 100;
    }
    else {
      min_scale_bar_size = 25;
    }

    var scale_bar_pixels;
    if (document.getElementById(global.html.id.scale_bar_autosize).checked) {
      scale_bar_pixels = mean_length * pixels_per_unit_length;
      jq(global.html.id.scale_bar_length).val(mean_length);
    }
    else {
      scale_bar_pixels = jq(global.html.id.scale_bar_length).val() * pixels_per_unit_length;

      if (isNaN(scale_bar_pixels)) {
        scale_bar_pixels = mean_length * pixels_per_unit_length;
        jq(global.html.id.scale_bar_length).val(mean_length);
      }
    }


    // If the original scale bar is smaller than the min size, bump up the size.
    if (scale_bar_pixels < min_scale_bar_size) {
      if (user_changed) {
        alert("Selected scale bar size was too small.  Using default.");
      }
      scale_bar_pixels = min_scale_bar_size;
      // scale_bar_label_text = fn.math.round(min_scale_bar_size / pixels_per_unit_length, ROUNDING_PRECISION);
    }

    // // Now that we have a minimum scale bar size, weight it by the slider value.
    // scale_bar_pixels *= SCALE_BAR_LENGTH;
    var scale_bar_label_text = fn.math.round(scale_bar_pixels / pixels_per_unit_length, ROUNDING_PRECISION);
    jq(global.html.id.scale_bar_length).val(scale_bar_label_text);


    var label_x, label_y;

    // New where to add it?
    var chart_container     = document.getElementById("chart-container");
    var chart_bbox          = chart_container.getBBox();
    var scale_bar_transform = "";

    // TODO not quite centered, take into account bounding box? Or center on svg?

    var path_d;
    var start_y, start_x;

    // For the straight layouts adjust the scale bar offset weight to half as much weighting.

    if (LAYOUT_STRAIGHT && TREE_ROTATION == NOT_ROTATED) {
      start_x = ((chart_bbox.width - scale_bar_pixels) / 2) + chart_bbox.x;
      start_y = (chart_bbox.height + SCALE_BAR_PADDING) * (1 + ((SCALE_BAR_OFFSET_WEIGHT - 1) / 4)); // Reduce the weighting power by a lot.

      path_d = "M " + start_x + " " + start_y +
        " L " + (start_x + scale_bar_pixels) + " " + start_y;

      label_x = start_x + (scale_bar_pixels / 2);
      label_y = start_y + SCALE_BAR_TEXT_PADDING;
    }
    else if (LAYOUT_RADIAL) {
      start_x = ((chart_bbox.width - scale_bar_pixels) / 2) + chart_bbox.x;
      start_y = (chart_bbox.height + SCALE_BAR_PADDING + chart_bbox.y) * (1 + ((SCALE_BAR_OFFSET_WEIGHT - 1) / 4)); // Reduce the weighting power by a lot.

      path_d = "M " + start_x + " " + start_y +
        " L " + (start_x + scale_bar_pixels) + " " + start_y;

      label_x = start_x + (scale_bar_pixels / 2);
      label_y = start_y + SCALE_BAR_TEXT_PADDING;
    }
    else if (rotated_rectangle) {
      start_x = (chart_bbox.x - SCALE_BAR_PADDING - (scale_bar_pixels / 2)) * (1 + ((SCALE_BAR_OFFSET_WEIGHT - 1) / 1.2)); // Reduce the weighting power by a bit.
      start_y = (chart_bbox.height / 2);

      path_d = "M " + start_x + " " + start_y +
        " L " + (start_x + scale_bar_pixels) + " " + start_y;

      label_x = start_x + (scale_bar_pixels / 2);
      label_y = start_y + SCALE_BAR_TEXT_PADDING;

    }
    else { // circular
      start_x = -(scale_bar_pixels / 2);

      // The chart bounding box height is the same as the width and it is centered, so the branches only extend half of that out.
      start_y = ((chart_bbox.height / 2) + SCALE_BAR_PADDING) * SCALE_BAR_OFFSET_WEIGHT;

      label_x             = start_x + (scale_bar_pixels / 2);
      label_y             = start_y + SCALE_BAR_TEXT_PADDING;
      path_d              = "M " + start_x + " " + start_y + " L " + (start_x + scale_bar_pixels) + " " + start_y;
      scale_bar_transform = "rotate(" + (-TREE_ROTATION) + ")";
    }

    var container = d3.select("#chart-container")
                      .append("g")
                      .attr("id", "scale-bar-container");

    container.append("path")
             .attr("id", "scale-bar")
             .attr("stroke", "black")
             .attr("stroke-width", SELECTED_BRANCH_WIDTH > 2 ? 2 : SELECTED_BRANCH_WIDTH)
             .attr("d", path_d)
             .attr("transform", scale_bar_transform);

    container.append("text")
             .attr("id", "scale-bar-text")
             .attr("dominant-baseline", "hanging")
             .attr("text-anchor", "middle")
             .attr("x", label_x)
             .attr("y", label_y)
             .text(scale_bar_label_text)
             .attr("transform", scale_bar_transform)
             .attr("font-family", defaults.leaf_label_font);

    if (rotated_rectangle) {
      var box           = document.getElementById("scale-bar-container").getBBox();
      var box_center_pt = (box.x + (box.width / 2)) + " " + (box.y + (box.height / 2));

      d3.select("#scale-bar-container")
        .attr("transform", "rotate(90 " + box_center_pt + ")");
    }
  }
}

// A magical function
function draw_tree(lock_metadata_opts) {
  // jq("status-msg").html("apple");
  utils__clear_elem("svg-tree");

  if (lock_metadata_opts) {
    set_options_by_metadata();
  }
  update_form_constants();

  set_up_hierarchy();

  draw_svg();

  draw_chart();

  chart.append("g").attr("id", "link-container");
  draw_links();

  chart.append("g").attr("id", "link-extension-container");
  draw_link_extensions();

  chart.append("g").attr("id", "inner-dot-container");
  draw_inner_dots();

  chart.append("g").attr("id", "inner-label-container");
  draw_inner_labels();

  chart.append("g").attr("id", "leaf-dot-container");
  draw_leaf_dots();

  // We need to add the correct number of containers to hold all the bars.
  chart.append("g").attr("id", "bars-container");
  for (i = 0; i < how_many_bar_sets(name2md); ++i) {
    d3.select("#bars-container").append("g")
      .attr("id", "bars-container-" + (i + 1));
  }
  draw_bars();

  chart.append("g").attr("id", "leaf-label-container");
  draw_leaf_labels();

  draw_scale_bar();


  // Adjust the svg size to fit the rotated chart.  Needs to be done down here as we need the bounding box.
  adjust_tree();

  // jq("status-msg").html("seanie");
}


