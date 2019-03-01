// handle upload button
function upload_button(submit_id, uploader_id, callback) {
  // document.getElementById("everything")
  //   .setAttribute("style", "display: block; height: " + (verge.viewportH() * 0.8) + "px;");
  // document.getElementById("form-div")
  //   .setAttribute("style", "overflow: scroll; display: block; height: " + (verge.viewportH() * 0.8) + "px;");

  OPTIONS_DIV = document.getElementById("options-div");
  utils__clear_elem("options-div");
  utils__upload_tree_first();

  var uploader         = document.getElementById(uploader_id);
  var mapping_uploader = document.getElementById("mapping-file-uploader");

  var submit_button  = document.getElementById(submit_id);
  var tree_reader    = new FileReader();
  var mapping_reader = new FileReader();

  // The callback in this case is utils__load_dataset
  tree_reader.onload = function (tree_event) {
    var tree_str     = tree_event.target.result;
    var mapping_file = mapping_uploader.files[0];
    if (mapping_file) {
      mapping_reader.readAsText(mapping_file);
    }
    else {
      callback(tree_str, null);
    }

    mapping_reader.onload = function (mapping_event) {
      var mapping_str = mapping_event.target.result;

      callback(tree_str, mapping_str);
    };
  };

  uploader.addEventListener("change", function () {
    TREE_CHANGED = true;
    submit_button.removeAttribute("disabled");
  });
  mapping_uploader.addEventListener("change", function () {
    MAPPING_CHANGED = true;
    submit_button.removeAttribute("disabled");
  });
  submit_button.addEventListener("click", function () {
    if (MAPPING_CHANGED && !TREE_CHANGED) {
      // Don't reset
    }
    else {
      biological_root_sibling_warnings_already_warned = false;
      utils__clear_elem("svg-tree");
      viewer.fn.reset_all_to_defaults();
    }
    // $("#reset").prop("disabled", false);

    // Add a loading tree message.
    utils__set_status_msg_to_rendering();
    // d3.select("#tree-div")
    //   .append("p")
    //   .attr("id", "loading-message")
    //   .html("Loading tree! Please wait....");

    MAPPING_CHANGED = false;
    TREE_CHANGED    = false;

    handleFiles();
  }, false);
  document.getElementById(ID_RESET_BUTTON).addEventListener("click", function () {
    biological_root_sibling_warnings_already_warned = false;
    MAPPING_CHANGED                                 = false;
    TREE_CHANGED                                    = false;

    d3.select("#status-msg").html("Big new update (bar charts!!).  Please report any bugs on the contact page.");

    // Reset all sliders and options to default.
    viewer.fn.reset_all_to_defaults();

    utils__clear_elem("options-div");
    utils__upload_tree_first();

    utils__clear_elem("svg-tree");
    // $("#reset").prop("disabled", true);
    document.getElementById("save-svg").setAttribute("disabled", "");
    document.getElementById("save-png").setAttribute("disabled", "");
    document.getElementById("file-upload-form").reset();
    document.getElementById("mapping-upload-form").reset();


  });

  function handleFiles() {
    submit_button.setAttribute("disabled", "");
    var file = uploader.files[0];
    if (file) {
      tree_reader.readAsText(file);
    }
    else {
      // d3.select("#loading-message").remove();
      utils__set_status_msg_to_done();
      alert("Don't forget a tree file!");
    }
  }
}

// The mega function
function lalala(tree_input_param, mapping_input_param) {
  // First thing to do is set all options to defaults
  viewer.fn.reset_all_to_defaults();

  tree_input    = tree_input_param;
  mapping_input = mapping_input_param;

  // Check if there is more than one semicolon.  TODO this will give a false positive if there are semicolons within quoted names.

  if (tree_input.indexOf(";") !== tree_input.lastIndexOf(";")) {
    // There is more than one semicolon.
    alert("WARNING -- found more than one semicolon.  You may have multiple trees in your Newick file.  If so, only the last tree in the file will be shown.  Note: if you have quoted names with semicolons, you may not have multiple trees.  If some of the node names look weird (e.g., '\"E. co' when it should be 'E. coli'), you probably have semicolons within node names.");
  }

  var parsed_newick = newick__parse(tree_input);

  // debug
  tree_debug = parsed_newick;

  if (parsed_newick) {
    // Check for duplicated names.
    var duplicated_strings = has_duplicate_strings(newick__leaf_names(parsed_newick));
    if (duplicated_strings) {
      var err_str = "WARNING -- Your tree had some duplicated leaf names: ";
      var reps    = [];
      json_each(duplicated_strings, function (name, count) {
        str = name + " (" + count + " times)";
        reps.push(str);
      });

      alert(err_str + reps.join(", "));
    }

    tmp_root = d3.hierarchy(parsed_newick, function (d) {
      return d.branchset;
    })
                 .sum(function (d) {
                   return d.branchset ? 0 : 1;
                 })
                 .sort(sort_function);

    // If it is a big tree, uncheck the viewer size fixed button.  It goes way faster.
    if (tmp_root.descendants().length > LARGE_TREE_CUTOFF) {
      uncheck(global.html.id.viewer_size_fixed);
    }

    // Check if there is as many branchlengths as there are number of nodes.
    var num_colons;
    var colon_match = tree_input.match(/:/g);
    if (colon_match) {
      num_colons = colon_match.length;
    }
    else {
      num_colons = 0;
    }
    // Subtract off one to account for the root, which doesn't need to have a branch length in the newick file.
    var num_nodes = tmp_root.descendants().length - 1;
    if (num_nodes > num_colons) {
      alert("WARNING -- found more non-root nodes than colons.  This may indicate not every non-root node in the tree has a branch length.  Any nodes other than the root node that are missing the branch length will be assigned a branch length of 1.");
    }

    MIN_LENGTH_IN_TREE = min_non_zero_len_in_tree(tmp_root);

    var desc = tmp_root.descendants();
    for (var i = 0; i < desc.length; ++i) {
      if (desc[i].data.branch_length === 0) {
        alert("WARNING -- the tree has zero length branches. In the radial layout, they will be changed to " + MIN_DEFUALT_BRANCH_LENGTH + " or (0.5 * min branch length in tree), whichever is lower.");

        break;
      }
    }

    // Set the min tree length to bump up zero length branches to.
    if ((MIN_LENGTH_IN_TREE / 2) < MIN_DEFUALT_BRANCH_LENGTH) {
      NEW_LENGTH_FOR_ZERO_LENGTH_BRANCHES = (MIN_LENGTH_IN_TREE / 2);
    }
    else {
      NEW_LENGTH_FOR_ZERO_LENGTH_BRANCHES = MIN_DEFUALT_BRANCH_LENGTH;
    }


    if (mapping_input) {
      // Note that name2md will be null if there were any errors parsing the mapping file.  So it will be skipped if this is so.
      name2md = parse_mapping_file(mapping_input);

      // Need to set up a temporary root so that we can check for non specific matching in the mapping file.  TODO rewrite check function to use the parse newick to avoid the heirarchy call.

      // Also this will pop up a warning if there are any branches of length zero. and set the minbranch length.


      if (jq(ID_MATCHING_TYPE).val() === "partial") {
        if (has_non_specific_matching(tmp_root, name2md)) {
          // Reset name2md to null so we skip the mapping stuff and disabling certain features.
          name2md = null;
        }
      }
    }
    else {
      name2md = null;
    }

    function listener(id, action, fn) {
      d3.select("#" + id).on(action, fn);
    }



    // Set rotation constants
    ROTATED     = 270;
    NOT_ROTATED = 0;

    // Listen for save
    // See https://github.com/vibbits/phyd3/blob/9e5cf7edef72b1e8d4e8355eb5ab4668734816e5/js/phyd3.phylogram.js#L915
    d3.select("#save-svg").on("click", save_svg_data);
    d3.select("#save-png").on("click", save_png_data);

    // This is the listener for selecting label names
    d3.select("body").on("keydown", function () {
      var key_code = {
        a: 65,
        b: 66,
        c: 67,
        d: 83,
        f: null,
        u: 76,
        x: 88,
        arrow_left: 37,
        arrow_up: 38,
        arrow_right: 39,
        arrow_down: 40
      };

      function rebind_labels() {
        // And now rebind the data.
        var new_labels = d3.select("#leaf-label-container")
                           .selectAll("text")
                           .data(ROOT.descendants().filter(is_leaf));

        // And now add the selected class to the DOM elements that have just been selected.
        new_labels
          .merge(new_labels).classed("selected-label", function (d) {
          return d.is_selected;
        });
      }

      function clear_selected() {
        ROOT.descendants().forEach(function (node) {
          node.is_selected = false;
        });

        rebind_labels();
      }


      if (d3.event.shiftKey && d3.event.altKey && d3.event.keyCode === key_code.arrow_up) {
        add_previously_selected();

        var par     = null;
        var old_par = null;
        var pars    = [];

        d3.selectAll("text.selected-label").each(function (dat, idx, nodes) {
          par = dat.parent;
          // console.log("current dat: " + dat.data.name);
          // console.log("parent: " + par.data.name);

          while (par && par.is_selected) {
            // The root will not have a parent, so we want to keep the root in that case.
            old_par = par;
            par     = par.parent;
          }

          // If par is null that means you asked the root for a parent, so go back one to get a reference to the root again.
          if (!par) {
            par = old_par;
          }

          // Need to track all of them as you can have things selected on different clades from the start.
          push_unless_present(pars, par);
        });


        pars.forEach(function (par) {
          if (par) {
            par.is_selected = true;
            z               = par;
            par.descendants().forEach(function (node) {
              node.is_selected = true;
            });
          }
        });

        // This will ensure the correct classes are set!
        rebind_labels();

        select_branches();

      }
      else if (d3.event.shiftKey && d3.event.altKey && d3.event.keyCode === key_code.a) {
        // Select all!
        add_previously_selected();

        ROOT.descendants().forEach(function (node) {
          node.is_selected = true;
        });

        rebind_labels();

        select_branches();

      }
      else if (d3.event.shiftKey && d3.event.altKey && d3.event.keyCode === key_code.x) {
        // Clearing also clears the history.
        PREVIOUSLY_SELECTED = [];

        // This time we want to clear all is_selected attrs
        clear_selected();

        select_branches();

      }
      else if (d3.event.shiftKey && d3.event.altKey && d3.event.keyCode === key_code.arrow_down) {
        // Go back!

        var nodes = PREVIOUSLY_SELECTED.pop();
        // Make sure there is actually something to pop.
        if (nodes) {
          clear_selected();

          nodes.forEach(function (d) {
            d.is_selected = true;
          });
        }

        rebind_labels();

        select_branches();

      }
      else if (d3.event.shiftKey && d3.event.altKey && d3.event.keyCode === key_code.c) {
        // Copy the text!
        var selected_names = [];

        ROOT.descendants()
            .filter(function (d) {
              return is_leaf(d) && d.is_selected;
            })
            .forEach(function (d) {
              var name = null;
              if (d.data) {
                // We want to use the new name if it is available
                if (d.metadata && d.metadata.new_name) {
                  selected_names.push(d.metadata.new_name);
                }
                else if (d.data.name) {
                  // Else push the orig name.
                  selected_names.push(d.data.name);
                }
              }
            });

        // Create a temporary element to hold the text
        var text_elem = document.createElement("textarea");

        text_elem.innerHTML = selected_names.join("\n");
        document.body.appendChild(text_elem);
        text_elem.select();
        document.execCommand("copy");
        document.body.removeChild(text_elem);
      }

    });

    // Listeners for form elements.  Some redraw the whole tree, others update only parts of it.

    function set_msg_and_draw() {
      utils__set_status_msg_to_rendering();

      setTimeout(function () {
        draw_tree();
        utils__set_status_msg_to_done();
      });
    }

    function leaf_label_align_listener_actions() {
      update_form_constants();
      draw_link_extensions();
      draw_leaf_dots();
      draw_leaf_labels();
      draw_bars(); // bars may need to be adjusted if they're shown.
      draw_scale_bar();
      adjust_tree();
      utils__set_status_msg_to_done();
    }

    var TIMEOUT = 10;
    listener(ID_MATCHING_TYPE, "change", function () {
      // First check that you actually have a tree and mapping file.
      if (tree_input && mapping_input) {
        utils__set_status_msg_to_rendering();

        setTimeout(function () {
          if (mapping_input) {
            name2md = parse_mapping_file(mapping_input);

            if (jq(ID_MATCHING_TYPE).val() === "partial") {
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
          draw_tree(true);
          utils__set_status_msg_to_done();
        }, TIMEOUT);
      }
    });

    listener(global.html.id.tree_padding, "change", set_msg_and_draw);

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

        draw_tree();
        utils__set_status_msg_to_done();
      });
    });

    listener(viewer.html.tree_height.id, "change", function () {
      utils__set_status_msg_to_rendering();

      setTimeout(function () {
        // Make sure the input is not negative
        var h_val = jq(viewer.html.tree_height.id).val();

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
          jq(viewer.html.tree_height.id).val(default_value);
        }

        if (h_val < 1) {
          jq(viewer.html.tree_height.id).val(default_value);
        }

        draw_tree();
        utils__set_status_msg_to_done();
      });
    });

    // TODO no status-msg
    listener(global.html.id.tree_layout, "change", function () {
      utils__set_status_msg_to_rendering();
      setTimeout(function () {

        // First adjust the slider.
        var width_elem  = $("#" + global.html.id.tree_width);
        var height_elem = $("#" + global.html.id.tree_height);

        if (document.getElementById("rectangular-tree").selected) {
          width_elem
          // .attr("min", 15)
          // .attr("max", 150)
          // .attr("step", 1)
            .val(viewer.defaults.rectangular.width);

          height_elem
          // .attr("min", 15)
          // .attr("max", 150)
          // .attr("step", 1)
            .val(viewer.defaults.rectangular.height);
        }
        else if (document.getElementById("circular-tree").selected) {
          width_elem
          // .attr("min", 15)
          // .attr("max", 150)
          // .attr("step", 1)
            .val(viewer.defaults.circular.width);

          height_elem
          // .attr("min", 15)
          // .attr("max", 150)
          // .attr("step", 1)
            .val(viewer.defaults.circular.height);
        }
        else { // radial
          // The values look weird since they are polynomial transformed later.
          width_elem
          // .attr("min", 5)
          // .attr("max", 125)
          // .attr("step", 1)
            .val(viewer.defaults.radial.width);

          width_elem
          // .attr("min", 5)
          // .attr("max", 125)
          // .attr("step", 1)
            .val(viewer.defaults.radial.height);
        }

        draw_tree();
        utils__set_status_msg_to_done();
      }, 10);
    });
    listener(global.html.id.tree_branch_style, "change", function () {
      utils__set_status_msg_to_rendering();

      setTimeout(function () {
        redraw_tree();
        utils__set_status_msg_to_done();
      }, TIMEOUT);
    });

    listener(global.html.id.tree_rotation, "change", set_msg_and_draw);

    listener(global.html.id.biologically_rooted, "change", function () {
      // TODO which things actaully need to be updates?
      utils__set_status_msg_to_rendering();

      setTimeout(function () {

        update_form_constants();
        draw_links();
        draw_link_extensions();

        // Changing this option might need to draw root node dot, might not.
        draw_inner_dots();

        draw_scale_bar();
        adjust_tree();
        utils__set_status_msg_to_done();
      }, TIMEOUT);
    });

    // TODO needs longer timer to actually work.  Not sure why.
    listener(global.html.id.tree_sorting, "change", function () {
      utils__set_status_msg_to_rendering();

      setTimeout(function () {
        draw_tree();
        utils__set_status_msg_to_done();
      }, TIMEOUT * 2);
    });

    listener(global.html.id.scale_bar_show, "change", function () {
      utils__set_status_msg_to_rendering();

      setTimeout(function () {

        update_form_constants();
        draw_scale_bar();
        adjust_tree();
        utils__set_status_msg_to_done();
      }, TIMEOUT);
    });
    listener(global.html.id.scale_bar_offset_weight, "change", function () {
      utils__set_status_msg_to_rendering();

      setTimeout(function () {

        update_form_constants();
        draw_scale_bar();
        adjust_tree();
        utils__set_status_msg_to_done();
      }, TIMEOUT);
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


        update_form_constants();
        draw_scale_bar();
        adjust_tree();
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

    listener(global.html.id.inner_labels_show, "change", function () {
      utils__set_status_msg_to_rendering();

      setTimeout(function () {
        update_and_draw(draw_inner_labels);
        utils__set_status_msg_to_done();
      }, TIMEOUT);
    });
    listener(global.html.id.inner_labels_size, "change", function () {
      utils__set_status_msg_to_rendering();

      setTimeout(function () {
        update_and_draw(draw_inner_labels);
        utils__set_status_msg_to_done();
      }, TIMEOUT);
    });
    listener(global.html.id.leaf_labels_show, "change", function () {
      utils__set_status_msg_to_rendering();

      setTimeout(function () {

        update_form_constants();
        draw_link_extensions();
        draw_leaf_dots();
        draw_leaf_labels();
        draw_scale_bar();
        adjust_tree();
        utils__set_status_msg_to_done();
      }, TIMEOUT);
    });
    listener(global.html.id.leaf_labels_size, "change", function () {
      utils__set_status_msg_to_rendering();

      setTimeout(function () {
        update_and_draw(draw_leaf_labels);
        utils__set_status_msg_to_done();
      }, TIMEOUT);
    });
    listener(global.html.id.leaf_labels_padding, "change", function () {
      utils__set_status_msg_to_rendering();

      setTimeout(function () {
        update_and_draw(draw_leaf_labels);
        utils__set_status_msg_to_done();
      }, TIMEOUT);
    });
    listener(global.html.id.leaf_labels_align, "change", function () {
      utils__set_status_msg_to_rendering();

      setTimeout(function () {
        // First sync all the align buttons.
        sync_align_buttons_and_vals(is_checked(global.html.id.leaf_labels_align), false);

        leaf_label_align_listener_actions();
      }, TIMEOUT);
    });
    listener(global.html.id.leaf_labels_rotation, "change", function () {
      utils__set_status_msg_to_rendering();

      setTimeout(function () {

        update_form_constants();
        draw_inner_labels();
        draw_leaf_labels();
        draw_scale_bar();
        adjust_tree();
        utils__set_status_msg_to_done();
      }, TIMEOUT);
    });
    listener(global.html.id.leaf_labels_color, "change", function () {
      utils__set_status_msg_to_rendering();

      setTimeout(function () {

        update_form_constants();
        draw_inner_labels();
        draw_leaf_labels();
        draw_scale_bar();
        adjust_tree();
        utils__set_status_msg_to_done();
      }, TIMEOUT);
    });
    listener(global.html.id.leaf_labels_font, "change", function () {
      utils__set_status_msg_to_rendering();

      setTimeout(function () {

        update_form_constants();
        draw_inner_labels();
        draw_leaf_labels();
        draw_scale_bar();
        adjust_tree();
        utils__set_status_msg_to_done();
      }, TIMEOUT);
    });
    listener(global.html.id.inner_labels_color, "change", function () {
      utils__set_status_msg_to_rendering();

      setTimeout(function () {

        update_form_constants();
        draw_inner_labels();
        draw_leaf_labels();
        draw_scale_bar();
        adjust_tree();
        utils__set_status_msg_to_done();
      }, TIMEOUT);
    });
    listener(ID_INNER_LABEL_FONT, "change", function () {
      utils__set_status_msg_to_rendering();

      setTimeout(function () {

        update_form_constants();
        draw_inner_labels();
        draw_leaf_labels();
        draw_scale_bar();
        adjust_tree();
        utils__set_status_msg_to_done();
      }, TIMEOUT);
    });

    listener(global.html.id.inner_dots_show, "change", function () {
      utils__set_status_msg_to_rendering();

      setTimeout(function () {
        update_and_draw(draw_inner_dots);
        utils__set_status_msg_to_done();
      }, TIMEOUT);
    });
    listener(global.html.id.inner_dots_size, "change", function () {
      utils__set_status_msg_to_rendering();

      setTimeout(function () {
        update_and_draw(draw_inner_dots);
        utils__set_status_msg_to_done();
      }, TIMEOUT);
    });
    listener(global.html.id.leaf_dots_show, "change", function () {
      utils__set_status_msg_to_rendering();

      setTimeout(function () {

        update_form_constants();
        draw_link_extensions(); // may need to be removed.
        draw_leaf_dots();
        draw_leaf_labels();
        draw_scale_bar();
        adjust_tree();
        utils__set_status_msg_to_done();
      }, TIMEOUT);
    });
    listener(global.html.id.leaf_dots_align, "change", function () {
      utils__set_status_msg_to_rendering();

      setTimeout(function () {
        // First sync all the align buttons.
        sync_align_buttons_and_vals(is_checked(global.html.id.leaf_dots_align), false);

        leaf_label_align_listener_actions();
      }, TIMEOUT);
    });
    listener(global.html.id.leaf_dots_size, "change", function () {
      utils__set_status_msg_to_rendering();

      setTimeout(function () {
        update_and_draw(draw_leaf_dots);
        utils__set_status_msg_to_done();
      }, TIMEOUT);
    });
    listener(global.html.id.leaf_dots_color, "change", function () {
      utils__set_status_msg_to_rendering();

      setTimeout(function () {

        update_form_constants();

        draw_inner_dots();
        draw_leaf_dots();

        // Draw the labels too to keep them on top
        draw_inner_labels();
        draw_leaf_labels();

        draw_scale_bar();
        adjust_tree();
      });
    });
    listener(global.html.id.inner_dots_color, "change", function () {
      utils__set_status_msg_to_rendering();

      setTimeout(function () {

        update_form_constants();

        draw_inner_dots();
        draw_leaf_dots();

        // Draw the labels too to keep them on top
        draw_inner_labels();
        draw_leaf_labels();

        draw_scale_bar();
        adjust_tree();
      });
    });

    listener(global.html.id.inner_dots_cutoff_unfilled, "change", function () {
      utils__set_status_msg_to_rendering();

      VAL_BOOTSTRAP_CUTOFF_UNFILLED_DOT = jq(global.html.id.inner_dots_cutoff_unfilled).val();
      // We just changed unfilled so update the filled one with a valid value.
      if (VAL_BOOTSTRAP_CUTOFF_UNFILLED_DOT > VAL_BOOTSTRAP_CUTOFF_FILLED_DOT) {
        // Set it to the upper val
        jq(global.html.id.inner_dots_cutoff_filled).val(VAL_BOOTSTRAP_CUTOFF_UNFILLED_DOT);
      }

      setTimeout(function () {
        update_and_draw(draw_inner_dots);
        utils__set_status_msg_to_done();
      }, TIMEOUT);
    });
    listener(global.html.id.inner_dots_cutoff_filled, "change", function () {
      utils__set_status_msg_to_rendering();

      VAL_BOOTSTRAP_CUTOFF_FILLED_DOT = jq(global.html.id.inner_dots_cutoff_filled).val();

      // We just changed the filled one so update the unfilled one to be valid.
      if (VAL_BOOTSTRAP_CUTOFF_FILLED_DOT < VAL_BOOTSTRAP_CUTOFF_UNFILLED_DOT) {
        // Set it to the upper val
        jq(global.html.id.inner_dots_cutoff_unfilled).val(VAL_BOOTSTRAP_CUTOFF_FILLED_DOT);
      }


      setTimeout(function () {
        update_and_draw(draw_inner_dots);
        utils__set_status_msg_to_done();
      }, TIMEOUT);
    });

    // Bar listeners ///////////////////////////////////////////////
    listener(global.html.id.bars_show, "change", function () {
      utils__set_status_msg_to_rendering();

      setTimeout(function () {
        // First, activate the align tip decorations opts if you are turning bars on.  If you do it here, as soon as bars are added, everything lines up, but the user can still turn it off later.
        if (is_checked(global.html.id.bars_show)) {
          // Check to see if there are any bar columns in the metadata file.  If not, we want to warnt he user that they should add some.
          // TODO might be nice to lock all the bar opts if there aren't any in a mapping file
          if (!check_for_bar_options()) {
            alert("WARNING -- you don't have any bar info in your mapping file.  Try adding some!");
          }

          sync_align_buttons_and_vals(true, false);
        }

        // These are all the things that happen when leaf dots are drawn.  Pretty sure you need to redraw all the stuff up to the labels and tips and dots, then the bars, then the scale bar and tree adjust as adding bars will change the overall tree size.
        update_form_constants();
        draw_link_extensions(); // may need to be removed.
        draw_leaf_dots();
        draw_leaf_labels();
        draw_bars();
        draw_scale_bar();
        adjust_tree();
        utils__set_status_msg_to_done();
      }, TIMEOUT);
    });
    listener(global.html.id.bars_axis_show, "change", function () {
      utils__set_status_msg_to_rendering();

      setTimeout(function () {
        update_form_constants();
        draw_link_extensions(); // may need to be removed.
        draw_leaf_dots();
        draw_leaf_labels();
        draw_bars();
        draw_scale_bar();
        adjust_tree();
        utils__set_status_msg_to_done();
      }, TIMEOUT);
    });
    listener(global.html.id.bars_align, "change", function () {
      utils__set_status_msg_to_rendering();

      setTimeout(function () {
        // First sync all the align buttons.
        sync_align_buttons_and_vals(is_checked(global.html.id.bars_align), false);

        // Then do the rest of the actions.
        leaf_label_align_listener_actions();
      }, TIMEOUT);
    });
    listener(global.html.id.bars_padding, "change", function () {
      utils__set_status_msg_to_rendering();

      validate_bar_padding_input();

      setTimeout(function () {
        update_form_constants();
        draw_link_extensions(); // may need to be removed.
        draw_leaf_dots();
        draw_leaf_labels();
        draw_bars();
        draw_scale_bar();
        adjust_tree();
        utils__set_status_msg_to_done();
      }, TIMEOUT);
    });
    listener(global.html.id.bars_color, "change", function () {
      utils__set_status_msg_to_rendering();

      setTimeout(function () {
        update_and_draw(draw_bars);
        utils__set_status_msg_to_done();
      }, TIMEOUT);
    });
    listener(global.html.id.bars_height, "change", function () {
      utils__set_status_msg_to_rendering();

      setTimeout(function () {
        update_form_constants();
        draw_link_extensions(); // may need to be removed.
        draw_leaf_dots();
        draw_leaf_labels();
        draw_bars();
        draw_scale_bar();
        adjust_tree();
        utils__set_status_msg_to_done();
      }, TIMEOUT);
    });
    listener(global.html.id.bars_width, "change", function () {
      utils__set_status_msg_to_rendering();

      setTimeout(function () {
        update_form_constants();
        draw_link_extensions(); // may need to be removed.
        draw_leaf_dots();
        draw_leaf_labels();
        draw_bars();
        draw_scale_bar();
        adjust_tree();
        utils__set_status_msg_to_done();
      }, TIMEOUT);
    });


    listener(global.html.id.branches_color, "change", function () {
      utils__set_status_msg_to_rendering();

      setTimeout(function () {

        update_form_constants();
        draw_links();
        draw_link_extensions();
        draw_scale_bar();
        adjust_tree();
        utils__set_status_msg_to_done();
      }, TIMEOUT);
    });
    listener(global.html.id.branches_width, "change", function () {
      utils__set_status_msg_to_rendering();

      setTimeout(function () {

        update_form_constants();
        draw_links();
        draw_link_extensions();
        draw_scale_bar();
        adjust_tree();
        utils__set_status_msg_to_done();
      }, TIMEOUT);
    });


    listener(global.html.id.viewer_size_fixed, "change", function () {
      // utils__set_status_msg_to_rendering();
      update_viewer_size_fixed();
      // utils__set_status_msg_to_done();
    });

    utils__set_status_msg_to_rendering();

    // In the lalala function, this is the first time that draw_tree is called, so lock options by metadata if it is available.
    draw_tree(true);

    utils__set_status_msg_to_done();

    var circle_cluster, rectangle_cluster;


    function set_value_of(id, val) {
      var elem   = document.getElementById(id);
      elem.value = val;
    }

    // Choose sorting function
    function sort_descending(a, b) {
      return (a.value - b.value) || d3.ascending(a.data.branch_length, b.data.branch_length);
    }

    function sort_ascending(a, b) {
      return (b.value - a.value) || d3.descending(a.data.branch_length, b.data.branch_length);
    }

    function sort_none(a, b) {
      return 0;
    }

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

    function adjust_tree() {
      resize_svg_straight_layout("svg-tree", "chart-container");
    }

    function update_and_draw(draw_fn) {

      update_form_constants();
      draw_fn();
      draw_scale_bar();
      adjust_tree();
    }

    // Similar to draw_tree but meant to be called by a listener that doesn't need to recalculate the hierarchy and replace the svg and g chart as well.
    function redraw_tree() {

      update_form_constants();

      draw_links();
      draw_link_extensions();

      draw_inner_dots();
      draw_inner_labels();

      draw_leaf_dots();
      draw_leaf_labels();

      draw_scale_bar();

      adjust_tree();
    }

    // For redrawing tree even when you need to recalculate hierarchy and merge svg and g chart.
    function set_up_and_redraw() {

      update_form_constants();

      set_up_hierarchy();

      draw_svg();
      draw_chart();

      draw_links();
      draw_link_extensions();

      draw_inner_dots();
      draw_inner_labels();

      draw_leaf_dots();
      draw_leaf_labels();

      draw_scale_bar();

      adjust_tree();

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

    function straight_link(d) {
      return "M " + (d.source[the_x] - the_width) + " " + d.source[the_y] + " L " + (d.target[the_x] - the_height) + " " + d.target[the_y];
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

    function link_rectangle_extension(d, x, y) {
      var start_point = d.target[x] + " " + d.target["radius"];
      var end_point   = d.target[x] + " " + d.target["y"];

      return "M " + start_point + " L " + end_point;
    }

    function link_radial(d) {
      var start_point = (d.target.radial_layout_info.parent_x * RADIAL_LAYOUT_WEIGHT) + " " + (d.target.radial_layout_info.parent_y * RADIAL_LAYOUT_WEIGHT);
      var end_point   = (d.target.radial_layout_info.x * RADIAL_LAYOUT_WEIGHT) + " " + (d.target.radial_layout_info.y * RADIAL_LAYOUT_WEIGHT);

      return "M " + start_point + " L " + end_point;
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
      if (LAYOUT_CIRCLE) {
        return linkCircleExtension(d);
      }
      else {
        return link_rectangle_extension(d, the_x, "y");
      }
    }


    function linkCircle(d) {
      return linkStep(d.source[the_x], d.source[the_y], d.target[the_x], d.target[the_y]);
    }

    // TODO need an option for labels lined up on the radius or labels at the end of the links.
    // the_width here is actually the diameter, not the radius.
    function linkCircleExtension(d) {
      return linkStep(d.target[the_x], d.target[the_y], d.target[the_x], the_width / 2);
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
  }
  else {
    utils__set_status_msg_to_error();
  }
}

// These are for saving
function svg_elem_to_string(id) {
  var svg_elem = document.getElementById(id);

  if (svg_elem) {
    return (new XMLSerializer()).serializeToString(svg_elem);
  }
}

// TODO png should keep background color
function save_png_data() {
  var svg_string = svg_elem_to_string("svg-tree");

  var canvas = document.createElement("canvas");
  canvg(canvas, svg_string);
  canvas.toBlobHD(function (blob) {
    saveAs(blob, "tree.png");
  });
}

function save_svg_data() {
  saveAs(
    new Blob([svg_elem_to_string("svg-tree")],
      { type: "application/svg+xml" }),
    "tree.svg"
  );
}

// NOTES
//   // The svg is the outer container and it is NOT rotated.  So these flip.
//   // Height and width of the elem are the same regardless of roatation.
// In the rotated state, the g elem width (x) and height (y) stay the same, but the SVG must swap them.

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

//// Metadata helper functions
function add_metadata(root, name2md, match_style) {
  // Everything starts with black metadata.  Later functions should handle defualts with blank metadata later.
  add_blank_metadata(root);

  // We assume the name2md will not have any erros if it is not null as errors are caught early
  if (name2md !== null) {
    var names_with_matches_in_tree = [];

    if (match_style === "exact") {
      root.leaves().forEach(function (d) {
        var md = name2md[d.data.name];
        if (md) {
          push_unless_present(names_with_matches_in_tree, d.data.name);
          // If something has no metadata leave it as default.
          d.metadata = md;
        }
      });
    }
    else if (match_style === "partial") {
      json_each(name2md, function (name, metadata) {
        root.leaves().forEach(function (d) {
          // Since it's partial mapping, all leaves could match a single name.
          if (d.data.name.indexOf(name) !== -1) { // match
            push_unless_present(names_with_matches_in_tree, name);
            d.metadata = metadata;
          }
        });
      });
    }
    else {
      // TODO regex
    }

    if (names_with_matches_in_tree.length < json_keys(name2md).length) {
      var unused_names = [];
      json_keys(name2md).forEach(function (name) {
        if (names_with_matches_in_tree.indexOf(name) === -1) { // no match
          push_unless_present(unused_names, name);
        }
      });

      if (!EXTRA_NAME_WARNINGS) {
        alert("WARNING -- There were names in the mapping file that were not present in the tree (check your option for label matching (exact or partial)): " + unused_names.join(", "));

        EXTRA_NAME_WARNINGS = true;
      }
    }
  }
}

function add_blank_metadata(root) {
  root.leaves().forEach(function (d) {
    return d.metadata = {};
  });
}

function get_branch_md_val(node, branch_option, default_value) {
  function get_md_val(node, branch_option, default_value) {
    // First, get the metadata val for this node.
    var leaves  = get_leaves(node);
    var md_vals = [];

    leaves.forEach(function (leaf) {
      // TODO check if metadata is actually an attr of leaf.
      var val = leaf.metadata[branch_option];
      if (val) {
        push_unless_present(md_vals, val);
      }
      else {
        // Got undefined, push default value
        push_unless_present(md_vals, default_value);
      }
    });

    return md_vals.length === 1 ? md_vals[0] : default_value;
  }

  function get_sibling_md_val(node, branch_option, default_value) {
    var parent   = node.parent;
    var children = parent.children;

    // If there is more than one sibling, then things are strange just put the defualt value.
    if (children.length !== 2) {
      push_unless_present(biological_root_sibling_warnings, "WARNING -- The biological root has multiple sibling nodes.  The branches directly attached to the root will not be automatically styled, but will use the default values.  If the branch styling near the root looks strange, this is likely the reason.");
      return default_value;
    }
    else {
      var sibling = children[0] === node ? children[1] : children[0];
      return get_md_val(sibling, branch_option, default_value);
    }
  }

  var md_val_for_this_node = get_md_val(node, branch_option, default_value);

  if (is_silly(node)) {
    // This is a silly node and we need to check for odd rooting behavior.
    if (LAYOUT_RADIAL && TREE_IS_ROOTED_ON_A_LEAF_NODE) {
      // Give the styling of this node the same styling as its sibling (the biological root of the tree).
      return get_sibling_md_val(node, branch_option, default_value);
    }
    else if (LAYOUT_RADIAL && VAL_BIOLOGICALLY_ROOTED) {
      // The tree is rooted somewhere between two leaf nodes.  In this case the root is known to be biologically meaningful, so the biological node and the computational node are the same.  In this case coloring of clades coming from the root are colored normally.
      return md_val_for_this_node;
    }
    else if (LAYOUT_RADIAL) {
      // Same as above except that in this case the computational root is not biologically meaningful, so we don't want a case where the backbone of a radial tree is two different colors.  Only color this node's branch if it's sibling is the same color.
      var sibling_md_val = get_sibling_md_val(node, branch_option, default_value);
      if (sibling_md_val === md_val_for_this_node) {
        return md_val_for_this_node;
      }
      else {

        return default_value;
      }
    }
    else {
      return md_val_for_this_node;
    }
  }
  else {
    // This is a regular node so just style the branches normally.
    return md_val_for_this_node;
  }
}

// The node is silly if the tree is in radial layout and parent is the true root and one of the siblings is the biological root.  OR if the parent is a true root and the biological root and the node is depth 1.
function is_silly(node) {
  if (!LAYOUT_RADIAL) {
    return false;
  }
  // Is this branch attached to the root of the tree?
  else if (is_rooted_on_this_leaf_node(node)) {
    return false;
  }
  else if (node.depth === 1) {
    if (!TREE_IS_ROOTED_ON_A_LEAF_NODE) {
      return true;
    }
    else {
      // Check if has a sibling that is a leaf and a biological root
      var depth_one_nodes = node.parent.children;
      var i               = 0;
      for (i = 0; i < depth_one_nodes.length; ++i) {
        var sibling = depth_one_nodes[i];
        if (sibling !== node && is_rooted_on_this_leaf_node(sibling)) {
          return sibling;
        }
      }
    }
  }

  return false;
}

// Handles nicely the case where name2md isn't set.
function check_for_bar_options() {
  var category_names = [];

  if (name2md) {

    json_each(name2md, function (seq_name, metadata) {
      json_each(metadata, function (category_name, value) {
        push_unless_present(category_names, category_name);
      });
    });

    var i;
    for (i = 0; i < category_names.length; ++i) {
      if (category_names[i].match(/^bar[?:0-9]+_(?:height|color)$/)) {
        return true;
      }
    }
  }

  return false;
}

function set_options_by_metadata() {
  var category_names = [];

  if (name2md) {

    json_each(name2md, function (seq_name, metadata) {
      json_each(metadata, function (category_name, value) {
        push_unless_present(category_names, category_name);
      });
    });

    var
      leaf_dot_options_present   = false,
      leaf_label_options_present = false;

    category_names.forEach(function (cat_name) {
      if (LEAF_DOT_OPTIONS.includes(cat_name)) {
        leaf_dot_options_present = true;
      }

      if (LEAF_LABEL_OPTIONS.includes(cat_name)) {
        leaf_label_options_present = true;
      }
    });

    // Show leaf dots if leaf dot options are present
    if (leaf_dot_options_present) {
      check(global.html.id.leaf_dots_show);
    }

    // Show leaf labels if leaf label options are present.
    if (leaf_label_options_present) {
      check(global.html.id.leaf_labels_show);
    }
  }
}

function is_rooted_on_this_leaf_node(d) {
  // Depth is 1 means it is one level from root.
  return is_leaf(d) && d.depth === 1;
}

// TODO you have to check for true or string in the output.
function is_rooted_on_a_leaf_node(d3_tree) {

  var children = d3_tree.children;
  var i        = 0;
  for (i = 0; i < children.length; ++i) {
    var child = children[i];
    if (is_rooted_on_this_leaf_node(child)) {
      if (child.data.name === "") {
        // TODO not sure if a leaf can ever have a blank name, but if it can "" will be falsey and mess up the results, so just return true.
        return true;
      }
      else {
        return child.data.name;
      }
    }
  }

  return false;
}

function get_leaves(target) {
  function get_leaves_iter(target) {
    if (is_leaf(target)) {
      leaves.push(target);
    }
    else {
      target.children.map(function (d) {
        leaves.push(get_leaves(d));
      });
    }
  }

  var leaves = [];
  get_leaves_iter(target);

  return flatten(leaves);
}

//// End of the metadata helper functions



// For drawing the radial trees
function radial_cluster(root) {
  // Helpers
  function postorder_traversal(vertex) {
    if (is_leaf(vertex)) { // if deg(vertex) == 1
      vertex.radial_layout_info.num_leaves_in_subtree = 1;
    }
    else {
      vertex.children.forEach(function (child) {
        postorder_traversal(child);
        vertex.radial_layout_info.num_leaves_in_subtree += child.radial_layout_info.num_leaves_in_subtree;
      });
    }
  }

  function preorder_traversal(vertex) {
    if (vertex != root) {
      var parent = vertex.parent;


      var distance_to_parent = vertex.data.branch_length === 0 ? NEW_LENGTH_FOR_ZERO_LENGTH_BRANCHES : vertex.data.branch_length;

      var x = parent.radial_layout_info.x + distance_to_parent * Math.cos(vertex.radial_layout_info.wedge_border + (vertex.radial_layout_info.wedge_size / 2));
      var y = parent.radial_layout_info.y + distance_to_parent * Math.sin(vertex.radial_layout_info.wedge_border + (vertex.radial_layout_info.wedge_size / 2));
      ;

      vertex.radial_layout_info.x        = x;
      vertex.radial_layout_info.y        = y;
      vertex.radial_layout_info.parent_x = parent.radial_layout_info.x;
      vertex.radial_layout_info.parent_y = parent.radial_layout_info.y;

    }

    var current_vertex_wedge_border = vertex.radial_layout_info.wedge_border;

    if (is_inner(vertex)) { // leaves don't have a children attr
      vertex.children.forEach(function (child) {
        child.radial_layout_info.wedge_size   = (child.radial_layout_info.num_leaves_in_subtree / root.radial_layout_info.num_leaves_in_subtree) * 2 * Math.PI;
        child.radial_layout_info.wedge_border = current_vertex_wedge_border;
        current_vertex_wedge_border += child.radial_layout_info.wedge_size;
        preorder_traversal(child);
      });
    }
  }

  // Set defaults
  root.descendants().map(function (vertex) {
    if (vertex == root) {
      root.radial_layout_info = {
        "name": root.data.name,
        "x": 0,
        "y": 0,
        "num_leaves_in_subtree": 0,
        "wedge_size": 2 * Math.PI,
        "wedge_border": utils__deg_to_rad(TREE_ROTATION)
      };
    }
    else {
      vertex.radial_layout_info = {
        "name": vertex.data.name,
        "x": 0,
        "y": 0,
        "num_leaves_in_subtree": 0,
        "wedge_size": 0,
        "wedge_border": 0
      };
    }
  });

  postorder_traversal(root);
  preorder_traversal(root);
}

function get_translation(transform_str) {
  var match = transform_str.match(/translate\((\d+\.?\d*) (\d+\.?\d*)\)/);
  if (match) {
    return { "x": parseFloat(match[1]), "y": parseFloat(match[2]) };
  }
  else {
    return { "x": 0, "y": 0 };
  }
}


function size_transform(val) {
  return Math.pow(val, 2);
}




// TODO this will not work properly unless TREE_IS_ROOTED_ON_A_LEAF_NODE has been set.
function try_disable_bio_rooted() {
  if (LAYOUT_RADIAL && TREE_IS_ROOTED_ON_A_LEAF_NODE) {
    jq(global.html.id.biologically_rooted).prop("disabled", true);
  }
  else if (!LAYOUT_RADIAL) {
    jq(global.html.id.biologically_rooted).prop("disabled", true);
  }
  else {
    jq(global.html.id.biologically_rooted).prop("disabled", false);
  }
}

function inner_dot_fill(d) {
  var val           = parseFloat(d.data.name);
  var bootstrap_val = isNaN(val) ? 0.0 : val;

  if (VAL_SHOW_INNER_DOTS === global.html.id.inner_dots_show_none) {
    return "none";
  }
  else if (VAL_SHOW_INNER_DOTS === global.html.id.inner_dots_show_normal) {
    return VAL_INNER_DOT_COLOR;
  }
  else if (VAL_SHOW_INNER_DOTS === global.html.id.inner_dots_show_bootstrap) {
    if (bootstrap_val >= VAL_BOOTSTRAP_CUTOFF_FILLED_DOT) {
      return VAL_INNER_DOT_COLOR;
    }
    else {
      return "none";
    }
  }
}

function inner_dot_stroke(d) {
  var val           = parseFloat(d.data.name);
  var bootstrap_val = isNaN(val) ? 0.0 : val;

  if (VAL_SHOW_INNER_DOTS === global.html.id.inner_dots_show_none) {
    return "none";
  }
  else if (VAL_SHOW_INNER_DOTS === global.html.id.inner_dots_show_normal) {
    return "none";
  }
  else if (VAL_SHOW_INNER_DOTS === global.html.id.inner_dots_show_bootstrap) {
    if (bootstrap_val >= VAL_BOOTSTRAP_CUTOFF_UNFILLED_DOT) {
      return VAL_INNER_DOT_COLOR;
    }
    else {
      return "none";
    }
  }
}

function inner_dot_stroke_width(d) {
  var val           = parseFloat(d.data.name);
  var bootstrap_val = isNaN(val) ? 0.0 : val;

  if (VAL_SHOW_INNER_DOTS === global.html.id.inner_dots_show_none) {
    return "none";
  }
  else if (VAL_SHOW_INNER_DOTS === global.html.id.inner_dots_show_normal) {
    return "none";
  }
  else if (VAL_SHOW_INNER_DOTS === global.html.id.inner_dots_show_bootstrap) {
    if (bootstrap_val >= VAL_BOOTSTRAP_CUTOFF_UNFILLED_DOT) {
      return "2px";
    }
    else {
      return "none";
    }
  }
}

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

function how_many_bar_sets(name2md) {
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
}

function add_previously_selected() {
  var selected = ROOT.descendants().filter(function (d) {
    return d.is_selected;
  });

  // If array too long, remove the item at the bottom
  if (PREVIOUSLY_SELECTED.length > HISTORY_LIMIT) {
    PREVIOUSLY_SELECTED.shift();
  }

  PREVIOUSLY_SELECTED.push(selected);
}

// Adds the selected-branch class to branches that need it, based on whether the node is selected or not.
function select_branches() {
  ROOT.descendants()
      .forEach(function (d) {
        if (d.linkNode) {
          d3.select(d.linkNode).classed("selected-branch", d.is_selected);
        }
      });
}

function toggle_selected(d) {
  // Only works if you alt
  if (d3.event.altKey) {
    d.is_selected = !d.is_selected;

    // First select the node.
    var sel = d3.select(this);

    // Then toggle the clicked-label class on or off depending if it is already toggled.
    sel.classed("selected-label", !sel.classed("selected-label"));

    select_branches();
  }
}

