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

    d3.select("#status-msg").html("Please report any bugs on the contact page.");

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


      if (jq(global.html.id.mapping_file_matching_type).val() === "partial") {
        if (has_non_specific_matching(tmp_root, name2md)) {
          // Reset name2md to null so we skip the mapping stuff and disabling certain features.
          name2md = null;
        }
      }
    }
    else {
      name2md = null;
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

    viewer_form_add_listeners();

    utils__set_status_msg_to_rendering();

    // In the lalala function, this is the first time that set_up_and_draw_everything is called, so lock options by metadata if it is available.
    set_up_and_draw_everything(true);

    utils__set_status_msg_to_done();
  }
  else {
    utils__set_status_msg_to_error();
  }
}