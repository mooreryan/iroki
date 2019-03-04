function viewer_form_add_listeners() {
  // Listeners for form elements.  Some redraw the whole tree, others update only parts of it.

  //// These listeners eventually call set_up_and_draw_everything()
  listener(global.html.id.mapping_file_matching_type, "change", function () {
    // First check that you actually have a tree and mapping file.
    if (tree_input && mapping_input) {
      utils__set_status_msg_to_rendering();

      setTimeout(function () {
        if (mapping_input) {
          name2md = parse_mapping_file(mapping_input);

          if (jq(global.html.id.mapping_file_matching_type).val() === "partial") {
            // Reshow the warning.
            if (has_non_specific_matching(tmp_root, name2md)) {
              name2md = null;
            }
          }
        }
        else {
          name2md = null;
        }
        // Draw tree and set on metadata option
        set_up_and_draw_everything(true);
        utils__set_status_msg_to_done();
      }, TIMEOUT);
    }
  });
  listener(global.html.id.tree_width, "change", function () {
    utils__set_status_msg_to_rendering();

    setTimeout(function () {
      // Make sure the input is not negative
      var w_val = jq(global.html.id.tree_width).val();

      var layout_value  = jq(global.html.id.tree_layout).val();
      var default_value = null;

      if (layout_value === viewer.html.layout.rectangular.id) {
        default_value = viewer.defaults.rectangular.width;
      }
      else if (layout_value === viewer.html.layout.circular.id) {
        default_value = viewer.defaults.circular.width;
      }
      else {
        default_value = viewer.defaults.radial.width;
      }

      if (isNaN(parseFloat(w_val))) {
        jq(global.html.id.tree_width).val(default_value);
      }

      if (w_val < 1) {
        jq(global.html.id.tree_width).val(default_value);
      }

      set_up_and_draw_everything();
      utils__set_status_msg_to_done();
    }, TIMEOUT);
  });
  listener(global.html.id.tree_height, "change", function () {
    utils__set_status_msg_to_rendering();

    setTimeout(function () {
      // Make sure the input is not negative
      var h_val = jq(global.html.id.tree_height).val();

      var layout_value  = jq(global.html.id.tree_layout).val();
      var default_value = null;

      if (layout_value === viewer.html.layout.rectangular.id) {
        default_value = viewer.defaults.rectangular.height;
      }
      else if (layout_value === viewer.html.layout.circular.id) {
        default_value = viewer.defaults.circular.height;
      }
      else {
        default_value = viewer.defaults.radial.height;
      }

      if (isNaN(parseFloat(h_val))) {
        jq(global.html.id.tree_height).val(default_value);
      }

      if (h_val < 1) {
        jq(global.html.id.tree_height).val(default_value);
      }

      set_up_and_draw_everything();
      utils__set_status_msg_to_done();
    }, TIMEOUT);
  });
  listener(global.html.id.tree_layout, "change", function () {
    utils__set_status_msg_to_rendering();
    setTimeout(function () {

      // First adjust the slider.
      var width_elem  = $("#" + global.html.id.tree_width);
      var height_elem = $("#" + global.html.id.tree_height);

      if (document.getElementById("rectangular-tree").selected) {
        width_elem
          .val(viewer.defaults.rectangular.width);

        height_elem
          .val(viewer.defaults.rectangular.height);
      }
      else if (document.getElementById("circular-tree").selected) {
        width_elem
          .val(viewer.defaults.circular.width);

        height_elem
          .val(viewer.defaults.circular.height);
      }
      else { // radial
        // The values look weird since they are polynomial transformed later.
        width_elem
          .val(viewer.defaults.radial.width);

        width_elem
          .val(viewer.defaults.radial.height);
      }

      set_up_and_draw_everything();
      utils__set_status_msg_to_done();
    }, TIMEOUT);
  });
  // This one needs longer timer to actually work.  Not sure why.
  listener(global.html.id.tree_sorting, "change", function () {
    utils__set_status_msg_to_rendering();

    setTimeout(function () {
      set_up_and_draw_everything();
      utils__set_status_msg_to_done();
    }, TIMEOUT * 2);
  });
  listener(global.html.id.tree_rotation, "change", function () {
    set_status_msg_wrapper(set_up_and_draw_everything);
  });
  listener(global.html.id.tree_padding, "change", function () {
    set_status_msg_wrapper(set_up_and_draw_everything);
  });

  //// These eventually call draw_tree()
  listener(global.html.id.tree_branch_style, "change", function () {
    set_status_msg_wrapper(draw_wrapper, draw_tree);
  });
  listener(global.html.id.biologically_rooted, "change", function () {
    set_status_msg_wrapper(draw_wrapper, draw_tree);
  });
  listener(global.html.id.branches_color, "change", function () {
    set_status_msg_wrapper(draw_wrapper, draw_tree);
  });
  listener(global.html.id.branches_width, "change", function () {
    set_status_msg_wrapper(draw_wrapper, draw_tree);
  });
  listener(global.html.id.inner_labels_color, "change", function () {
    set_status_msg_wrapper(draw_wrapper, draw_tree);
  });
  listener(global.html.id.inner_labels_font, "change", function () {
    set_status_msg_wrapper(draw_wrapper, draw_tree);
  });
  listener(global.html.id.inner_dots_show, "change", function () {
    set_status_msg_wrapper(draw_wrapper, draw_tree);
  });
  listener(global.html.id.inner_dots_size, "change", function () {
    set_status_msg_wrapper(draw_wrapper, draw_tree);
  });
  listener(global.html.id.inner_dots_color, "change", function () {
    set_status_msg_wrapper(draw_wrapper, draw_tree);
  });
  listener(global.html.id.inner_dots_cutoff_unfilled, "change", function () {
    set_status_msg_wrapper(function () {
      VAL_BOOTSTRAP_CUTOFF_UNFILLED_DOT = jq(global.html.id.inner_dots_cutoff_unfilled).val();
      // We just changed unfilled so update the filled one with a valid value.
      if (VAL_BOOTSTRAP_CUTOFF_UNFILLED_DOT > VAL_BOOTSTRAP_CUTOFF_FILLED_DOT) {
        // Set it to the upper val
        jq(global.html.id.inner_dots_cutoff_filled).val(VAL_BOOTSTRAP_CUTOFF_UNFILLED_DOT);
      }

      draw_wrapper(function () {
        draw_tree();
      });
    });
  });
  listener(global.html.id.inner_dots_cutoff_filled, "change", function () {
    set_status_msg_wrapper(function () {
      VAL_BOOTSTRAP_CUTOFF_FILLED_DOT = jq(global.html.id.inner_dots_cutoff_filled).val();

      // We just changed the filled one so update the unfilled one to be valid.
      if (VAL_BOOTSTRAP_CUTOFF_FILLED_DOT < VAL_BOOTSTRAP_CUTOFF_UNFILLED_DOT) {
        // Set it to the upper val
        jq(global.html.id.inner_dots_cutoff_unfilled).val(VAL_BOOTSTRAP_CUTOFF_FILLED_DOT);
      }

      draw_wrapper(function () {
        draw_tree();
      });
    });
  });

  //// These eventually call draw_inner_decorations
  listener(global.html.id.inner_labels_show, "change", function () {
    set_status_msg_wrapper(draw_wrapper, draw_inner_decorations);
  });
  listener(global.html.id.inner_labels_size, "change", function () {
    set_status_msg_wrapper(draw_wrapper, draw_inner_decorations);
  });

  //// Outer decoration show/unshow listeners need to draw link extensions (in case they need to be drawn), outer decorations, and scale bars.
  listener(global.html.id.leaf_labels_show, "change", function () {
    set_status_msg_wrapper(function () {
      draw_wrapper(function () {
        draw_link_extensions();
        draw_outer_decorations();
        draw_scale_bar();
      });
    });
  });
  listener(global.html.id.leaf_dots_show, "change", function () {
    set_status_msg_wrapper(function () {
      draw_wrapper(function () {
        draw_link_extensions();
        draw_outer_decorations();
        draw_scale_bar();
      });
    });
  });
  listener(global.html.id.leaf_dots_align, "change", function () {
    set_status_msg_wrapper(function () {
      // First sync all the align buttons.
      sync_align_buttons_and_vals(is_checked(global.html.id.leaf_dots_align), false);

      draw_wrapper(function () {
        draw_link_extensions();
        draw_outer_decorations();
        draw_scale_bar();
      });
    });
  });
  listener(global.html.id.bars_show, "change", function () {
    set_status_msg_wrapper(function () {
      // First, activate the align tip decorations opts if you are turning bars on.  If you do it here, as soon as bars are added, everything lines up, but the user can still turn it off later.
      if (is_checked(global.html.id.bars_show)) {
        // Check to see if there are any bar columns in the metadata file.  If not, we want to warnt he user that they should add some.
        // TODO might be nice to lock all the bar opts if there aren't any in a mapping file
        if (!check_for_bar_options()) {
          alert("WARNING -- you don't have any bar info in your mapping file.  Try adding some!");
        }

        sync_align_buttons_and_vals(true, false);
      }

      draw_wrapper(function () {
        draw_link_extensions();
        draw_outer_decorations();
        draw_scale_bar();
      });
    });
  });
  listener(global.html.id.bars_axis_show, "change", function () {
    set_status_msg_wrapper(function () {
      draw_wrapper(function () {
        draw_link_extensions();
        draw_outer_decorations();
        draw_scale_bar();
      });
    });
  });
  listener(global.html.id.bars_align, "change", function () {
    set_status_msg_wrapper(function () {
      // First sync all the align buttons.
      sync_align_buttons_and_vals(is_checked(global.html.id.bars_align), false);

      draw_wrapper(function () {
        draw_link_extensions();
        draw_outer_decorations();
        draw_scale_bar();
      });
    });
  });
  listener(global.html.id.bars_padding, "change", function () {
    set_status_msg_wrapper(function () {
      validate_bar_padding_input();

      draw_wrapper(function () {
        draw_link_extensions();
        draw_outer_decorations();
        draw_scale_bar();
      });
    });
  });
  listener(global.html.id.bars_height, "change", function () {
    set_status_msg_wrapper(function () {
      draw_wrapper(function () {
        draw_link_extensions();
        draw_outer_decorations();
        draw_scale_bar();
      });
    });
  });
  listener(global.html.id.bars_width, "change", function () {
    set_status_msg_wrapper(function () {
      draw_wrapper(function () {
        draw_link_extensions();
        draw_outer_decorations();
        draw_scale_bar();
      });
    });
  });
  listener(global.html.id.leaf_labels_size, "change", function () {
    set_status_msg_wrapper(function () {
      draw_wrapper(function () {
        draw_link_extensions();
        draw_outer_decorations();
        draw_scale_bar();
      });
    });
  });
  listener(global.html.id.leaf_labels_padding, "change", function () {
    set_status_msg_wrapper(function () {
      draw_wrapper(function () {
        draw_link_extensions();
        draw_outer_decorations();
        draw_scale_bar();
      });
    });
  });
  listener(global.html.id.leaf_labels_align, "change", function () {
    set_status_msg_wrapper(function () {
      // First sync all the align buttons.
      sync_align_buttons_and_vals(is_checked(global.html.id.leaf_labels_align), false);

      draw_wrapper(function () {
        draw_link_extensions();
        draw_outer_decorations();
        draw_scale_bar();
      });
    });
  });
  listener(global.html.id.leaf_labels_rotation, "change", function () {
    set_status_msg_wrapper(function () {
      draw_wrapper(function () {
        draw_link_extensions();
        draw_outer_decorations();
        draw_scale_bar();
      });
    });
  });
  listener(global.html.id.bars_color, "change", function () {
    set_status_msg_wrapper(function () {
      draw_wrapper(function () {
        draw_link_extensions();
        draw_outer_decorations();
        draw_scale_bar();
      });
    });
  });
  listener(global.html.id.leaf_labels_color, "change", function () {
    set_status_msg_wrapper(function () {
      draw_wrapper(function () {
        draw_link_extensions();
        draw_outer_decorations();
        draw_scale_bar();
      });
    });
  });
  listener(global.html.id.leaf_labels_font, "change", function () {
    set_status_msg_wrapper(function () {
      draw_wrapper(function () {
        draw_link_extensions();
        draw_outer_decorations();
        draw_scale_bar();
      });
    });
  });
  listener(global.html.id.leaf_dots_size, "change", function () {
    set_status_msg_wrapper(function () {
      draw_wrapper(function () {
        draw_link_extensions();
        draw_outer_decorations();
        draw_scale_bar();
      });
    });
  });
  listener(global.html.id.leaf_dots_color, "change", function () {
    set_status_msg_wrapper(function () {
      draw_wrapper(function () {
        draw_link_extensions();
        draw_outer_decorations();
        draw_scale_bar();
      });
    });
  });
  listener(global.html.id.arcs_show, "change", function () {
    set_status_msg_wrapper(function () {
      if (is_checked(global.html.id.arcs_show)) {
        if (!check_for_arc_options()) {
          alert("WARNING -- you don't have any arc info in your mapping file.  Try adding some!");
        }
      }

      draw_wrapper(function () {
        draw_link_extensions();
        draw_outer_decorations();
        draw_scale_bar();
      });
    });
  });
  listener(global.html.id.arcs_padding, "change", function () {
    set_status_msg_wrapper(function () {
      validate_bar_padding_input();

      draw_wrapper(function () {
        draw_link_extensions();
        draw_outer_decorations();
        draw_scale_bar();
      });
    });
  });
  listener(global.html.id.arcs_height, "change", function () {
    set_status_msg_wrapper(function () {
      draw_wrapper(function () {
        draw_link_extensions();
        draw_outer_decorations();
        draw_scale_bar();
      });
    });
  });
  listener(global.html.id.arcs_cap_radius, "change", function () {
    set_status_msg_wrapper(function () {
      draw_wrapper(function () {
        draw_link_extensions();
        draw_outer_decorations();
        draw_scale_bar();
      });
    });
  });

  //// These only need to call draw_scale_bar
  listener(global.html.id.scale_bar_show, "change", function () {
    set_status_msg_wrapper(draw_wrapper, draw_scale_bar);
  });
  listener(global.html.id.scale_bar_offset_weight, "change", function () {
    set_status_msg_wrapper(draw_wrapper, draw_scale_bar);
  });
  listener(global.html.id.scale_bar_autosize, "change", function () {
    utils__set_status_msg_to_rendering();

    setTimeout(function () {
      if (document.getElementById(global.html.id.scale_bar_autosize).checked) {
        jq(global.html.id.scale_bar_length).prop("disabled", true);
      }
      else {
        jq(global.html.id.scale_bar_length).prop("disabled", false);
      }

      draw_wrapper(draw_scale_bar);

      utils__set_status_msg_to_done();
    }, TIMEOUT);
  });
  listener(global.html.id.scale_bar_length, "change", function () {
    utils__set_status_msg_to_rendering();

    setTimeout(function () {

      update_form_constants();
      // the user caused this change
      draw_scale_bar(true);
      adjust_tree();
      utils__set_status_msg_to_done();
    }, TIMEOUT);
  });

  //// This one is different from the rest
  listener(global.html.id.viewer_size_fixed, "change", function () {
    update_viewer_size_fixed();
  });
}