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

  parsed_newick = newick__parse(tree_input);

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


  }
  else {
    utils__set_status_msg_to_error();
  }
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

