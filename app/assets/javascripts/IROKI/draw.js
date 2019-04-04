var IROKI = (function (iroki) {
  /**
   * The draw module contains any code involed in drawing stuff (e.g., charts) to SVG or canvas.
   *
   * Most methods in here will use or depend upon D3.js.
   */
  iroki.draw = (function (draw) {

    var helpers = {};

    /**
     * Determines how many sets of bars are specified in the mapping file.
     *
     * @param name2md
     * @returns {number}
     */
    helpers.how_many_bar_sets = function (name2md) {
      if (name2md) {
        var first_thing = name2md[Object.keys(name2md)[0]];

        // TODO this is just to prevent an infinite loop.  Need a real check.
        var max  = 1000;
        var iter = 1;
        while (iter < max) {
          var idx = "bar" + iter + "_height";

          if (first_thing[idx] === undefined) {
            return iter - 1;
          }

          iter += 1;
        }
      }

      // If you've gotten here, there are no bar sets.
      return 0;
    };

    /**
     * Returns an array with the minimum bar height for each series of bars.
     *
     * @param num_bar_sets
     * @returns {Array} - ary[0] will be the min height for the first bar set, ary[1] will be the min for the 2nd bar set, and so on.
     *
     * @warning fn.ary.min() and $ from implicit global namespace are used in this function
     */
    helpers.get_min_bar_heights = function (num_bar_sets) {
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
    };

    /**
     * Returns an array with the maximum bar height for each series of bars.
     *
     * @param num_bar_sets
     * @returns {Array} - ary[0] will be the max height for the first bar set, ary[1] will be the max for the 2nd bar set, and so on.
     *
     * @warning fn.ary.max() and $ from implicit global namespace are used in this function
     */
    helpers.get_max_bar_heights = function (num_bar_sets) {
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
    };

    /**
     * If a bar series has negative heights (e.g., for fold change) each bar height would be 1/2 of what it would be otherwise.
     *
     * @param height - height of the current bar
     * @param max - max bar height in the bar series
     * @param min - min bar height in the bar series, can be negative
     * @returns {number} - scaled bar height, always between zero and the bar height set by the user option
     */
    helpers.scale_bar_height = function (height, max, min) {
      // Heights can be negative, but we always want a positive value for rectangle attrs.  The flipping is taken care of elsewhere.

      // If there are negative values we need to scale bars by 1/2
      var scale_factor = min < 0 ? 2 : 1;

      return Math.abs((height / max) * global.html.val.bars_height) / scale_factor;
    };

    // // TODO If there is more than 2 translate directives, this will braek
    // /**
    //  * Note that rectangle_transform does NOT put a comma in the translate.  So translate(10 20) rather than translate(10, 20).
    //  *
    //  * @param trans - the translate
    //  * @returns {number}
    //  */
    // helpers.get_radius_from_translate = function (trans) {
    //   var regex = /translate\(([0-9]+),+.*translate\(([0-9]+)/;
    //   var match = trans.match(regex);
    //
    //   if (match) {
    //     return parseFloat(match[1]) + parseFloat(match[2]);
    //   }
    //   else {
    //     return 0;
    //   }
    // };

    // Takes the old transform (the tip of the leaf) and adds some padding so each set of bars is nice and separated.
    // Max height is the one set by the user, not the one from the data
    // Min height should always be the min height of the first series
    helpers.new_transform = function (d, transform, bar_set, max_height_user_opt, max_height_data, min_height_data) {
      // We need to move it a bit away from the tip as well as center it on the line.  We can do that by adding another translate command tacked on to the end.  In rectangle mode, the first number moves it to the right if positive, to the left if negative.  The second number moves it down if positive, up if negative.

      // need a bit of extra padding for sets 2 - N
      // TODO need to set the 10 to an inner bar padding option.
      var extra = bar_set * 10;

      // This will be the new radius for the axis in circle layout and the actual right left adjustment in rectangle mode.
      var nudge_horiz = global.html.val.bars_padding + (bar_set * max_height_user_opt) + extra;

      if (min_height_data < 0) {
        // If there are bars going backwards, we need to move the "axis" farther out to account for the things going backwards.
        nudge_horiz += helpers.scale_bar_height(min_height_data, max_height_data, min_height_data);
      }

      // // If there are some min heights less than 0, some bars will be going backwards and we'd like a little more nudge.
      // if (min_height_data < 0) {
      //   // We also want to scale the min height in terms of this max and min.
      //   anudge_horiz += helpers.scale_bar_height(min_height_data, max_height_data, min_height_data);
      // }


      // If the bar height is a negative number (e.g., negative fold change) we need to flip the bar 180 and adjust the verticle nudge.  But ONLY if the layout is circle.  (not yet implemented for rectangle)
      var barh = d.metadata["bar" + (bar_set + 1) + "_height"];

      // Vertical nudge centers the bar on the branch/dot
      if (global.html.val.tree_layout_circular && barh < 0) {
        var nudge_vert = global.html.val.bars_width / 2;
      }
      else {
        // This will center it on the line
        var nudge_vert = -global.html.val.bars_width / 2;
      }


      var ajusted_transform = transform + " translate(" + nudge_horiz + ", " + nudge_vert + ")";

      // Finally, if barh is negative we need to add a 180 degree rotation to get the bar going in the opposite direction.
      if (global.html.val.tree_layout_circular && barh < 0) {
        ajusted_transform += " rotate(180)";
      }
      else if (global.html.val.tree_layout_rectangular && barh < 0) {
        // Do a little something different for rectangle layouts
        ajusted_transform += " rotate(180) translate(0, -" + global.html.val.bars_width + ")";
      }

      return ajusted_transform;
    };

    /**
     * Add the bars container svg g elements, but only if they haven't already been created.
     *
     * @param {string} id_chart_container
     * @param {string} id_bar_container
     * @param {number} num_bar_sets - most likely output from {@link how_many_bar_sets}
     */
    helpers.add_bars_containers = function (
      id_chart_container,
      id_bar_container,
      num_bar_sets
    ) {
      if (d3.select("#" + id_bar_container).empty()) {
        d3.select("#" + id_chart_container)
          .append("g")
          .attr("id", id_bar_container);

        for (var i = 0; i < num_bar_sets; ++i) {
          d3.select("#" + id_bar_container)
            .append("g")
            .attr("id", id_bar_container + "-" + (i + 1));
        }
      }
    };


    /**
     * Draws the bar chart on trees.
     *
     * @note If necessary, I will append the bars-container g elements.
     */
    draw.draw_bars = function () {
      var num_bar_sets = helpers.how_many_bar_sets(name2md);

      // First, add the bars containers if they aren't already made
      helpers.add_bars_containers(
        "chart-container",
        "bars-container",
        num_bar_sets
      );

      if (global.html.val.bars_show) {
        // TODO if this is slow, you could move it into the parse mapping file function or just after parsing.
        var max_bar_heights = helpers.get_max_bar_heights(num_bar_sets);
        var min_bar_heights = helpers.get_min_bar_heights(num_bar_sets);

        var start_radii = [];

        for (var i = 0; i < num_bar_sets; ++i) {
          // First we need to set the start_radius for this set of bars
          var first_datum = ROOT.descendants().filter(is_leaf)[0];

          var aextra       = i * 10;
          var anudge_horiz = global.html.val.bars_padding + (i * global.html.val.bars_height) + aextra;

          // If there are some min heights less than 0, some bars will be going backwards and we'd like a little more nudge.
          if (min_bar_heights[i] < 0) {
            // We also want to scale the min height in terms of this max and min.
            anudge_horiz += helpers.scale_bar_height(min_bar_heights[i], max_bar_heights[i], min_bar_heights[i]);
          }

          start_radii[i] = first_datum.y + anudge_horiz; // TODO axis bug

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
              var new_trans = helpers.new_transform(d, transform, i, global.html.val.bars_height, max_bar_heights[i], min_bar_heights[i]);

              return new_trans;
            })
            .attr("fill", function (d) {
              var val = d.metadata["bar" + (i + 1) + "_color"]; //.bar1_color;

              return val ? val : global.html.val.bars_color;
            })
            // This is right to left length in rectangle mode
            .attr("width", function (d) {
              // Check and see if height is specified in mapping file
              var val = d.metadata["bar" + (i + 1) + "_height"]; //.bar1_height;

              // If not, just use the max height default.  Users might want bars of all the same length but having different colors.
              return val || val === 0 ? helpers.scale_bar_height(val, max_bar_heights[i], min_bar_heights[i]) : 0;
            })
            // This is up and down length in rectangle mode
            .attr("height", function () {
              return global.html.val.bars_width;
            });
        }

        var rad_circles = d3.select("#bars-container")
                            .selectAll("circle")
                            .data(start_radii);
        var rad_lines   = d3.select("#bars-container")
                            .selectAll("path")
                            .data(start_radii);

        // Draw the radii (only circle layout)
        if (global.html.val.bars_axis_show && global.html.val.tree_layout_circular) {
          rad_circles.enter()
                     .append("circle")
                     .merge(rad_circles)
                     .attr("r", function (d) {
                       return d;
                     })
                     .attr("fill", "none")
                     // TODO currently uses the default bar color
                     .attr("stroke", global.html.val.bars_color)
                     .attr("stroke-width", 2);
        }
        else if (global.html.val.bars_axis_show && global.html.val.tree_layout_rectangular) {
          // these are in the correct order of the tree regardless of sorting. so the first thing will be at the bottom (of the screen on the tree) and the last item will be at the top.
          var leaves     = ROOT.leaves();
          var first_leaf = leaves[0];
          var last_leaf  = leaves[leaves.length - 1];

          rad_lines.enter()
                   .append("path")
                   .merge(rad_lines)
                   .attr("d", function (radius) {
                     // Need to adjust by 1/2 the width of the bar so the axis actually extends to cover the whole bar.
                     return "M" + (first_leaf.x - (global.html.val.bars_width / 2)) + "," + radius + " " +
                       "L" + (last_leaf.x + (global.html.val.bars_width / 2)) + "," + radius;
                   })
                   .attr("stroke", global.html.val.bars_color)
                   .attr("stroke-width", 2);
        }
        else {
          rad_circles.remove();
          rad_lines.remove();
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
    };

    return draw;
  }(iroki.draw || {}));

  return iroki;
}(IROKI || {}));