var viewer = {
  defaults: {
    radial: {
      width: 7,
      height: 7
    },
    circular: {
      width: 22,
      height: 22
    },
    rectangular: {
      width: 22,
      height: 22
    }
  },

  html: {
    tree_height: {
      id: "height"
    },
    tree_width: {
      id: "width"
    },

    layout: {
      id: "tree-shape",

      rectangular: {
        id: "rectangular-tree"
      },
      circular: {
        id: "circular-tree"
      },
      radial: {
        id: "radial-tree"
      }
    }
  }
};

var MAPPING_CHANGED, TREE_CHANGED;


var OPTIONS_DIV;

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
      reset_all_to_defaults();
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
    reset_all_to_defaults();

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


// TODO get this from the CSS
var FORM_HEIGHT = 650;

// Round to 100ths place.
var ROUNDING_PRECISION = 2;

var LAYOUT_CIRCLE, LAYOUT_STRAIGHT, LAYOUT_RADIAL;
var TREE_BRANCH_STYLE, TREE_BRANCH_CLADOGRAM, TREE_BRANCH_NORMAL;
var the_x, the_y;
var SIZE, INNER_SIZE;
var width, padding, height;
var ROOT, svg, chart, data, circles, labels, inner_labels, leaf_labels,
    linkExtension, link, inner_dots, leaf_dots;

var SHOW_INNER_LABELS, SHOW_LEAF_LABELS;

var SHOW_SCALE_BAR;

var INNER_LABEL_SIZE, LEAF_LABEL_SIZE;
var SHOW_INNER_DOTS, SHOW_LEAF_DOTS;

var LABEL_ROTATION;
var ROTATION_STATE, ROTATED, NOT_ROTATED;

var INNER_DOT_SIZE, LEAF_DOT_SIZE;

var TREE_ROTATION;

var VIEWER_WIDTH, VIEWER_HEIGHT, VIEWER_SIZE_FIXED;

var SORT_STATE, SORT_NONE, SORT_ASCENDING, SORT_DESCENDING, sort_function;

var the_width, the_height, the_width, the_height, padding;

var SCALE_BAR_OFFSET_WEIGHT, SCALE_BAR_LENGTH;

// The name2md var will be set to null if there is no metadata mapping data.
var name2md = null;

var MATCHING_TYPE;

var EXTRA_NAME_WARNINGS       = false;
var MIN_LENGTH_IN_TREE;
var MIN_DEFUALT_BRANCH_LENGTH = 1e-10;
var NEW_LENGTH_FOR_ZERO_LENGTH_BRANCHES;

var LARGE_TREE_CUTOFF = 1000; // in number of nodes.  TODO tune this...phage proteomic tree is 5200, slow; tree of life 381, fast.

var DEFAULT_BRANCH_COLOR, DEFAULT_BRANCH_WIDTH;

// To hold temporary DOM elements
var elem;

var TR;

var RADIAL_LAYOUT_WEIGHT = 1;

// These vars hold elem IDs
var ID_MATCHING_TYPE               = "matching-type";
var ID_LAYOUT                      = "tree-shape",
    ID_LAYOUT_RECTANGULAR          = "rectangular-tree",
    ID_LAYOUT_CIRCULAR             = "circular-tree",
    ID_LAYOUT_RADIAL               = "radial-tree";
var ID_TREE_BRANCH_STYLE           = "tree-branch-style",
    ID_TREE_BRANCH_STYLE_NORMAL    = "normalogram",
    ID_TREE_BRANCH_STYLE_CLADOGRAM = "cladogram";
var ID_SORT                        = "tree-sort",
    ID_SORT_FORWARD                = "descending",
    ID_SORT_REVERSE                = "ascending",
    ID_SORT_UNSORTED               = "not-sorted";
var ID_SCALE_BAR_SHOW              = "show-scale-bar",
    ID_SCALE_BAR_OFFSET_WEIGHT     = "scale-bar-offset-weight",
    ID_SCALE_BAR_AUTOSIZE          = "scale-bar-auto-size",
    ID_SCALE_BAR_LENGTH            = "scale-bar-length";
var ID_VIEWER_SIZE_FIXED           = "viewer-size-fixed";
var ID_OPTIONS_ACCORDION           = "options-accordion";
var ID_LEAF_LABEL_COLOR            = "leaf-label-color",
    ID_LEAF_LABEL_FONT             = "leaf-label-font",
    ID_LEAF_LABEL_PADDING          = "leaf-label-padding",
    ID_LEAF_LABEL_ALIGN            = "align-tip-labels",
    VAL_LEAF_LABEL_COLOR,
    VAL_LEAF_LABEL_FONT,
    VAL_LEAF_LABEL_PADDING,
    VAL_LEAF_LABEL_ALIGN;
var ID_INNER_LABEL_COLOR           = "inner-label-color",
    ID_INNER_LABEL_FONT            = "inner-label-font",
    VAL_INNER_LABEL_COLOR,
    VAL_INNER_LABEL_FONT;

// Bar option IDs
var ID_BAR_SHOW            = "show-bars",
    VAL_BAR_SHOW,
    ID_BAR_COLOR           = "bar-color",
    VAL_BAR_COLOR,
    ID_BAR_HEIGHT          = "bar-height",
    VAL_BAR_HEIGHT,
    ID_BAR_WIDTH           = "bar-width",
    VAL_BAR_WIDTH,
    ID_BAR_PADDING         = "bar-padding",
    VAL_BAR_PADDING,
    ID_BAR_ALIGN           = "align-bars";
var ID_BAR_SHOW_START_AXIS = "show-bar-start-axis",
    VAL_BAR_SHOW_START_AXIS;

var ID_INNER_DOT_SIZE = "inner-dot-size",
    ID_LEAF_DOT_SIZE  = "leaf-dot-size";

var ID_LEAF_DOT_COLOR  = "leaf-dot-color",
    ID_INNER_DOT_COLOR = "inner-dot-color",
    VAL_LEAF_DOT_COLOR,
    VAL_INNER_DOT_COLOR;

var ID_LEAF_DOT_ALIGN = "align-leaf-dots";

var ID_BIOLOGICALLY_ROOTED = "biological-root",
    VAL_BIOLOGICALLY_ROOTED;

var ID_SHOW_INNER_DOTS           = "show-inner-dots",
    ID_SHOW_INNER_DOTS_NONE      = "show-inner-dots-none",
    ID_SHOW_INNER_DOTS_NORMAL    = "show-inner-dots-normal",
    ID_SHOW_INNER_DOTS_BOOTSTRAP = "show-inner-dots-bootstrap",
    VAL_SHOW_INNER_DOTS;

var ID_BOOTSTRAP_CUTOFF_FILLED_DOT   = "bootstrap-cutoff-filled-dot",
    ID_BOOTSTRAP_CUTOFF_UNFILLED_DOT = "bootstrap-cutoff-unfilled-dot";

var VAL_BOOTSTRAP_CUTOFF_FILLED_DOT,
    VAL_BOOTSTRAP_CUTOFF_UNFILLED_DOT;

var DEFAULT_BOOTSTRAP_CUTOFF_FILLED_DOT   = 0.75,
    DEFAULT_BOOTSTRAP_CUTOFF_UNFILLED_DOT = 0.5;

var ID_RESET_BUTTON = "reset";

var tmp_root;

var TREE_IS_ROOTED_ON_A_LEAF_NODE;

// TODO we have to check if we've already warned about this as it will try and warn each time the links are redrawn.
var biological_root_sibling_warnings = [],
    biological_root_sibling_warnings_already_warned;

// Any value higher than this will be dropped down to this value.  Some tree software puts the number of bootstrap trees with support rather than a percent so this number can get pretty high.
var MAX_BOOTSTRAP_VAL = 1e9;

var defaults = {
  "leaf_label_color": "#000000",
  "leaf_label_font": "Helvetica",
  "leaf_label_size": 16,
  "leaf_label_padding": 0,
  "leaf_label_padding_min": 0,
  "leaf_label_padding_max": 10000,
  "leaf_dot_color": "#000000",
  "leaf_dot_size": 2,
  "new_name": null,
  "branch_width": 2,
  "branch_color": "#000000",

  "bar_color": "#000000",
  "bar_padding": 10,
  "bar_padding_min": 0,
  "bar_padding_max": 10000, // TODO this is just some silly default.
  "bar_height": 100,
  "bar_width": 10
};

var md_cat_name2id = {
  "leaf_label_color": null,
  "leaf_label_font": null,
  "leaf_label_size": "leaf-label-size",
  "leaf_dot_color": null,
  "leaf_dot_size": ID_LEAF_DOT_SIZE,
  "new_name": null,
  "branch_width": "branch-width",
  "branch_color": null
};

// Hold these as globals so that we can make sure the reset button resets them.
var mapping_input, tree_input;

// The mega function
function lalala(tree_input_param, mapping_input_param) {

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
      uncheck(ID_VIEWER_SIZE_FIXED);
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

    // TODO this transition doesn't get picked up by the draw functions when they are called by a listener.
    TR = d3.transition().duration(750).ease(d3.easeExp);

    function listener(id, action, fn) {
      d3.select("#" + id).on(action, fn);
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


    // Set rotation constants
    ROTATED     = 270;
    NOT_ROTATED = 0;

    // Listen for save
    // See https://github.com/vibbits/phyd3/blob/9e5cf7edef72b1e8d4e8355eb5ab4668734816e5/js/phyd3.phylogram.js#L915
    d3.select("#save-svg").on("click", save_svg_data);
    d3.select("#save-png").on("click", save_png_data);


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

    listener("padding", "change", set_msg_and_draw);

    listener(viewer.html.tree_width.id, "change", function () {
      utils__set_status_msg_to_rendering();

      setTimeout(function () {
        // Make sure the input is not negative
        var w_val = jq(viewer.html.tree_width.id).val();

        var layout_value  = jq(viewer.html.layout.id).val();
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
          jq(viewer.html.tree_width.id).val(default_value);
        }

        if (w_val < 1) {
          jq(viewer.html.tree_width.id).val(default_value);
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

        var layout_value  = jq(viewer.html.layout.id).val();
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
    listener(ID_LAYOUT, "change", function () {
      utils__set_status_msg_to_rendering();
      setTimeout(function () {

        // First adjust the slider.
        var width_elem  = $("#width");
        var height_elem = $("#height");

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
    listener("tree-branch-style", "change", function () {
      utils__set_status_msg_to_rendering();

      setTimeout(function () {
        redraw_tree();
        utils__set_status_msg_to_done();
      }, TIMEOUT);
    });

    listener("tree-rotation", "change", set_msg_and_draw);

    listener(ID_BIOLOGICALLY_ROOTED, "change", function () {
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
    listener("tree-sort", "change", function () {
      utils__set_status_msg_to_rendering();

      setTimeout(function () {
        draw_tree();
        utils__set_status_msg_to_done();
      }, TIMEOUT * 2);
    });

    listener(ID_SCALE_BAR_SHOW, "change", function () {
      utils__set_status_msg_to_rendering();

      setTimeout(function () {

        update_form_constants();
        draw_scale_bar();
        adjust_tree();
        utils__set_status_msg_to_done();
      }, TIMEOUT);
    });
    listener(ID_SCALE_BAR_OFFSET_WEIGHT, "change", function () {
      utils__set_status_msg_to_rendering();

      setTimeout(function () {

        update_form_constants();
        draw_scale_bar();
        adjust_tree();
        utils__set_status_msg_to_done();
      }, TIMEOUT);
    });
    listener(ID_SCALE_BAR_AUTOSIZE, "change", function () {
      utils__set_status_msg_to_rendering();

      setTimeout(function () {
        if (document.getElementById(ID_SCALE_BAR_AUTOSIZE).checked) {
          jq(ID_SCALE_BAR_LENGTH).prop("disabled", true);
        }
        else {
          jq(ID_SCALE_BAR_LENGTH).prop("disabled", false);
        }


        update_form_constants();
        draw_scale_bar();
        adjust_tree();
        utils__set_status_msg_to_done();
      }, TIMEOUT);
    });
    listener(ID_SCALE_BAR_LENGTH, "change", function () {
      utils__set_status_msg_to_rendering();

      setTimeout(function () {

        update_form_constants();
        // the user caused this change
        draw_scale_bar(true);
        adjust_tree();
        utils__set_status_msg_to_done();
      }, TIMEOUT);
    });

    // listener("tree-sort", "change", function() {
    //   update_form_constants();
    //   set_up_hierarchy(); // The regular redraw skips this step.
    //   draw_inner_dots();
    //   draw_leaf_dots();
    //   draw_inner_labels();
    //   draw_leaf_labels();
    //   draw_link_extensions();
    //   draw_links();
    //   adjust_tree();
    // });

    listener("show-inner-labels", "change", function () {
      utils__set_status_msg_to_rendering();

      setTimeout(function () {
        update_and_draw(draw_inner_labels);
        utils__set_status_msg_to_done();
      }, TIMEOUT);
    });
    listener("inner-label-size", "change", function () {
      utils__set_status_msg_to_rendering();

      setTimeout(function () {
        update_and_draw(draw_inner_labels);
        utils__set_status_msg_to_done();
      }, TIMEOUT);
    });
    listener("show-leaf-labels", "change", function () {
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
    listener("leaf-label-size", "change", function () {
      utils__set_status_msg_to_rendering();

      setTimeout(function () {
        update_and_draw(draw_leaf_labels);
        utils__set_status_msg_to_done();
      }, TIMEOUT);
    });
    listener(ID_LEAF_LABEL_PADDING, "change", function () {
      utils__set_status_msg_to_rendering();

      setTimeout(function () {
        update_and_draw(draw_leaf_labels);
        utils__set_status_msg_to_done();
      }, TIMEOUT);
    });
    listener(ID_LEAF_LABEL_ALIGN, "change", function () {
      utils__set_status_msg_to_rendering();

      setTimeout(function () {
        // First sync all the align buttons.
        sync_align_buttons_and_vals(is_checked(ID_LEAF_LABEL_ALIGN), false);

        leaf_label_align_listener_actions();
      }, TIMEOUT);
    });
    listener("label-rotation", "change", function () {
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
    listener(ID_LEAF_LABEL_COLOR, "change", function () {
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
    listener(ID_LEAF_LABEL_FONT, "change", function () {
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
    listener(ID_INNER_LABEL_COLOR, "change", function () {
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

    listener(ID_SHOW_INNER_DOTS, "change", function () {
      utils__set_status_msg_to_rendering();

      setTimeout(function () {
        update_and_draw(draw_inner_dots);
        utils__set_status_msg_to_done();
      }, TIMEOUT);
    });
    listener(ID_INNER_DOT_SIZE, "change", function () {
      utils__set_status_msg_to_rendering();

      setTimeout(function () {
        update_and_draw(draw_inner_dots);
        utils__set_status_msg_to_done();
      }, TIMEOUT);
    });
    listener("show-leaf-dots", "change", function () {
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
    listener(ID_LEAF_DOT_ALIGN, "change", function () {
      utils__set_status_msg_to_rendering();

      setTimeout(function () {
        // First sync all the align buttons.
        sync_align_buttons_and_vals(is_checked(ID_LEAF_DOT_ALIGN), false);

        leaf_label_align_listener_actions();
      }, TIMEOUT);
    });
    listener(ID_LEAF_DOT_SIZE, "change", function () {
      utils__set_status_msg_to_rendering();

      setTimeout(function () {
        update_and_draw(draw_leaf_dots);
        utils__set_status_msg_to_done();
      }, TIMEOUT);
    });
    listener(ID_LEAF_DOT_COLOR, "change", function () {
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
    listener(ID_INNER_DOT_COLOR, "change", function () {
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

    listener(ID_BOOTSTRAP_CUTOFF_UNFILLED_DOT, "change", function () {
      utils__set_status_msg_to_rendering();

      VAL_BOOTSTRAP_CUTOFF_UNFILLED_DOT = jq(ID_BOOTSTRAP_CUTOFF_UNFILLED_DOT).val();
      // We just changed unfilled so update the filled one with a valid value.
      if (VAL_BOOTSTRAP_CUTOFF_UNFILLED_DOT > VAL_BOOTSTRAP_CUTOFF_FILLED_DOT) {
        // Set it to the upper val
        jq(ID_BOOTSTRAP_CUTOFF_FILLED_DOT).val(VAL_BOOTSTRAP_CUTOFF_UNFILLED_DOT);
      }

      setTimeout(function () {
        update_and_draw(draw_inner_dots);
        utils__set_status_msg_to_done();
      }, TIMEOUT);
    });
    listener(ID_BOOTSTRAP_CUTOFF_FILLED_DOT, "change", function () {
      utils__set_status_msg_to_rendering();

      VAL_BOOTSTRAP_CUTOFF_FILLED_DOT = jq(ID_BOOTSTRAP_CUTOFF_FILLED_DOT).val();

      // We just changed the filled one so update the unfilled one to be valid.
      if (VAL_BOOTSTRAP_CUTOFF_FILLED_DOT < VAL_BOOTSTRAP_CUTOFF_UNFILLED_DOT) {
        // Set it to the upper val
        jq(ID_BOOTSTRAP_CUTOFF_UNFILLED_DOT).val(VAL_BOOTSTRAP_CUTOFF_FILLED_DOT);
      }


      setTimeout(function () {
        update_and_draw(draw_inner_dots);
        utils__set_status_msg_to_done();
      }, TIMEOUT);
    });

    // Bar listeners ///////////////////////////////////////////////
    listener(ID_BAR_SHOW, "change", function () {
      utils__set_status_msg_to_rendering();

      setTimeout(function () {
        // First, activate the align tip decorations opts if you are turning bars on.  If you do it here, as soon as bars are added, everything lines up, but the user can still turn it off later.
        if (is_checked(ID_BAR_SHOW)) {
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
    listener(ID_BAR_SHOW_START_AXIS, "change", function () {
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
    listener(ID_BAR_ALIGN, "change", function () {
      utils__set_status_msg_to_rendering();

      setTimeout(function () {
        // First sync all the align buttons.
        sync_align_buttons_and_vals(is_checked(ID_BAR_ALIGN), false);

        // Then do the rest of the actions.
        leaf_label_align_listener_actions();
      }, TIMEOUT);
    });
    listener(ID_BAR_PADDING, "change", function () {
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
    listener(ID_BAR_COLOR, "change", function () {
      utils__set_status_msg_to_rendering();

      setTimeout(function () {
        update_and_draw(draw_bars);
        utils__set_status_msg_to_done();
      }, TIMEOUT);
    });
    listener(ID_BAR_HEIGHT, "change", function () {
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
    listener(ID_BAR_WIDTH, "change", function () {
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


    listener("branch-color", "change", function () {
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
    listener("branch-width", "change", function () {
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


    listener(ID_VIEWER_SIZE_FIXED, "change", function () {
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
      var is_checked = jq(ID_VIEWER_SIZE_FIXED).prop("checked");
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

      VAL_BIOLOGICALLY_ROOTED = is_checked(ID_BIOLOGICALLY_ROOTED);
      // try_disable_bio_rooted();

      VAL_LEAF_LABEL_COLOR = jq(ID_LEAF_LABEL_COLOR).val();
      VAL_LEAF_LABEL_FONT  = jq(ID_LEAF_LABEL_FONT).val();

      VAL_INNER_LABEL_COLOR = jq(ID_INNER_LABEL_COLOR).val();
      VAL_INNER_LABEL_FONT  = jq(ID_INNER_LABEL_FONT).val();

      DEFAULT_BRANCH_COLOR = document.getElementById("branch-color").value;
      DEFAULT_BRANCH_WIDTH = parseInt(document.getElementById("branch-width").value);

      VAL_LEAF_DOT_COLOR  = jq(ID_LEAF_DOT_COLOR).val();
      VAL_INNER_DOT_COLOR = jq(ID_INNER_DOT_COLOR).val();


      MATCHING_TYPE = document.getElementById(ID_MATCHING_TYPE).value;

      // Get sorting options
      SORT_NONE       = "not-sorted";
      SORT_ASCENDING  = "ascending";
      SORT_DESCENDING = "descending";
      SORT_STATE      = document.getElementById("tree-sort").value;

      if (SORT_STATE === SORT_NONE) {
        sort_function = sort_none;
      }
      else if (SORT_STATE === SORT_ASCENDING) {
        sort_function = sort_ascending;
      }
      else {
        sort_function = sort_descending;
      }

      SHOW_SCALE_BAR          = document.getElementById(ID_SCALE_BAR_SHOW).checked;
      SCALE_BAR_OFFSET_WEIGHT = parseFloat(document.getElementById(ID_SCALE_BAR_OFFSET_WEIGHT).value);
      SCALE_BAR_LENGTH        = parseFloat(document.getElementById(ID_SCALE_BAR_LENGTH).value);


      LAYOUT_CIRCLE   = document.getElementById("circular-tree").selected;
      LAYOUT_STRAIGHT = document.getElementById("rectangular-tree").selected;
      LAYOUT_RADIAL   = document.getElementById("radial-tree").selected;

      // Enable the save button
      document.getElementById("save-svg").removeAttribute("disabled");
      document.getElementById("save-png").removeAttribute("disabled");

      // Bars
      VAL_BAR_SHOW            = document.getElementById(ID_BAR_SHOW).checked;
      VAL_BAR_SHOW_START_AXIS = is_checked(ID_BAR_SHOW_START_AXIS);
      VAL_BAR_PADDING         = validate_bar_padding_input(ID_BAR_PADDING);
      VAL_BAR_WIDTH           = jq(ID_BAR_WIDTH).val();
      VAL_BAR_HEIGHT          = jq(ID_BAR_HEIGHT).val();
      VAL_BAR_COLOR           = jq(ID_BAR_COLOR).val();

      // Dots
      VAL_SHOW_INNER_DOTS = jq(ID_SHOW_INNER_DOTS).val();
      SHOW_INNER_DOTS     = document.getElementById(ID_SHOW_INNER_DOTS).checked;
      SHOW_LEAF_DOTS      = document.getElementById("show-leaf-dots").checked;
      INNER_DOT_SIZE      = parseInt(document.getElementById(ID_INNER_DOT_SIZE).value);
      LEAF_DOT_SIZE       = parseInt(document.getElementById(ID_LEAF_DOT_SIZE).value);

      switch (VAL_SHOW_INNER_DOTS) {
        case ID_SHOW_INNER_DOTS_NONE:
          disable(ID_INNER_DOT_SIZE);
          SHOW_INNER_DOTS = false;

          break;
        case ID_SHOW_INNER_DOTS_NORMAL:
          undisable(ID_INNER_DOT_SIZE);
          SHOW_INNER_DOTS = true;

          break;
        case ID_SHOW_INNER_DOTS_BOOTSTRAP:
          undisable(ID_INNER_DOT_SIZE);
          SHOW_INNER_DOTS = true;

          break;
        default:
          // Something weird happened, just disable it.
          disable(ID_INNER_DOT_SIZE);
          SHOW_INNER_DOTS = false;

          break;
      }

      if (SHOW_LEAF_DOTS) {
        undisable(ID_LEAF_DOT_SIZE);
      }
      else {
        disable(ID_LEAF_DOT_SIZE);
      }


      INNER_LABEL_SIZE       = parseInt(document.getElementById("inner-label-size").value);
      LEAF_LABEL_SIZE        = parseInt(document.getElementById("leaf-label-size").value);
      VAL_LEAF_LABEL_PADDING = validate_leaf_label_padding_input(ID_LEAF_LABEL_PADDING);

      TREE_BRANCH_CLADOGRAM = "cladogram";
      TREE_BRANCH_NORMAL    = "normalogram";
      if (LAYOUT_RADIAL) {
        TREE_BRANCH_STYLE = "normalogram";
        $("#tree-branch-style").prop("disabled", true);
      }
      else {
        $("#tree-branch-style").prop("disabled", false);
        TREE_BRANCH_STYLE = document.getElementById("tree-branch-style").value;
      }

      if (LAYOUT_STRAIGHT) {
        // It could be coming from the circle which has a different slider behavior
        elem          = document.getElementById("tree-rotation");
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
        elem = document.getElementById("tree-rotation");
        elem.removeAttribute("disabled");

        TREE_ROTATION = parseInt(elem.value);
        // Flip tree rotation to 0
        TREE_ROTATION = TREE_ROTATION == 360 ? 0 : TREE_ROTATION;
        elem.setAttribute("min", "0");
        elem.setAttribute("max", "360");
        elem.setAttribute("step", "1");
      }

      if (LAYOUT_STRAIGHT && TREE_ROTATION == ROTATED) { // ie rectangle tree on its side
        LABEL_ROTATION = parseInt(document.getElementById("label-rotation").value) + 90;
      }
      else {
        LABEL_ROTATION = parseInt(document.getElementById("label-rotation").value);
      }
      SHOW_INNER_LABELS = document.getElementById("show-inner-labels").checked;
      SHOW_LEAF_LABELS  = document.getElementById("show-leaf-labels").checked;

      // Show or hide align tip labels TODO also account for bars here
      if (
        (!SHOW_LEAF_LABELS && !SHOW_LEAF_DOTS && !VAL_BAR_SHOW) ||
        TREE_BRANCH_STYLE === TREE_BRANCH_CLADOGRAM ||
        LAYOUT_RADIAL
      ) {
        // not checked, disabled.
        sync_align_buttons_and_vals(false, true);
        // document.getElementById(ID_LEAF_LABEL_ALIGN).setAttribute("disabled", "");
        // document.getElementById(ID_LEAF_LABEL_ALIGN).removeAttribute("checked");
        // VAL_LEAF_LABEL_ALIGN = false;
      }
      else {
        undisable(ID_LEAF_LABEL_ALIGN);
        VAL_LEAF_LABEL_ALIGN = is_checked(ID_LEAF_LABEL_ALIGN);
        sync_align_buttons_and_vals(VAL_LEAF_LABEL_ALIGN, false);
      }

      // Show/hide labels size
      if (SHOW_LEAF_LABELS) {
        document.getElementById("leaf-label-size").removeAttribute("disabled");
        document.getElementById("leaf-label-padding").removeAttribute("disabled");
      }
      else {
        document.getElementById("leaf-label-size").setAttribute("disabled", "");
        document.getElementById("leaf-label-padding").setAttribute("disabled", "");
      }

      // If it's circle the label rotation gets disabled
      if (LAYOUT_STRAIGHT && (SHOW_LEAF_LABELS || SHOW_INNER_LABELS)) {
        document.getElementById("label-rotation").removeAttribute("disabled");
      }
      else {
        document.getElementById("label-rotation").setAttribute("disabled", "");
      }

      if (SHOW_INNER_LABELS) {
        document.getElementById("inner-label-size").removeAttribute("disabled");
      }
      else {
        document.getElementById("inner-label-size").setAttribute("disabled", "");
      }

      // Set the height to match the width
      if (LAYOUT_CIRCLE || LAYOUT_RADIAL) {
        // Disable the height slider
        elem          = document.getElementById("height");
        elem.disabled = true;

        width  = size_transform(parseInt(document.getElementById("width").value));
        height = width;

        padding = parseFloat(document.getElementById("padding").value);

        set_value_of("height", width);

        $("#width-label").html("Size");

      }
      else {
        elem          = document.getElementById("height");
        elem.disabled = false;

        width  = size_transform(parseInt(document.getElementById("width").value));
        height = size_transform(parseInt(document.getElementById("height").value));

        padding = parseFloat(document.getElementById("padding").value);

        $("#width-label").html("Horizontal");
      }

      elem                 = document.getElementById("width");
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
           // .transition(TR)
           .attr("width", the_width * 1)
           .attr("height", the_height * 1)
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
             // .transition(TR)
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
                  // .transition(TR)
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
        // .transition(TR)
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
                 // .transition(TR)
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

    function draw_bars() {

      var num_bar_sets = how_many_bar_sets(name2md);


      // Returns an ary with max heights for each set.
      function get_max_bar_heights() {
        var i     = 0;
        var maxes = [];
        for (i = 0; i < num_bar_sets; ++i) {
          // TODO deal with negative values in the bar heights.
          var this_max = fn.ary.max($.map(name2md, function (val) {
            return val["bar" + (i + 1) + "_height"];
          }));

          maxes.push(this_max);
        }

        return maxes;
      }

      // Scales bar height so the max size will be the one set by the user.
      function scale_bar_height(height, max) {
        // Heights can be negative, but we always want a positive value for rectangle attrs.  The flipping is taken care of elsewhere.
        return Math.abs((height / max) * VAL_BAR_HEIGHT);
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
      function new_transform(d, transform, bar_set, max_height) {
        // We need to move it a bit away from the tip as well as center it on the line.  We can do that by adding another translate command tacked on to the end.  In rectangle mode, the first number moves it to the right if positive, to the left if negative.  The second number moves it down if positive, up if negative.

        // need a bit of extra padding for sets 2 - N
        // TODO need to set the 10 to an inner bar padding option.
        var extra       = bar_set * 10;
        var nudge_horiz = VAL_BAR_PADDING + (bar_set * max_height) + extra;

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

        return ajusted_transform;
      }

      if (VAL_BAR_SHOW) {
        // TODO if this is slow, you could move it into the parse mapping file function or just after parsing.
        var max_bar_heights = get_max_bar_heights();
        var start_radii     = [];

        for (i = 0; i < num_bar_sets; ++i) {
          var bars = d3.select("#bars-container-" + (i + 1))
                       .selectAll("rect")
                       .data(ROOT.descendants().filter(is_leaf));

          bars
            .enter().append("rect")
            .merge(bars)
            .attr("transform", function (d) {
              // This will be the point of the tip of the branch to the leaf.
              var transform = pick_transform(d, true);
              var new_trans = new_transform(d, transform, i, VAL_BAR_HEIGHT);

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
              return val || val === 0 ? scale_bar_height(val, max_bar_heights[i]) : 0;
            })
            // This is up and down length in rectangle mode
            .attr("height", function (d) {
              return VAL_BAR_WIDTH;
            });
        }

        var rad_circles = d3.select("#bars-container")
                            .selectAll("circle")
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
          // .transition(TR)
          .attr("fill", VAL_INNER_LABEL_COLOR)
          .attr("font-size", INNER_LABEL_SIZE)
          .attr("font-family", VAL_INNER_LABEL_FONT);

        inner_labels
          .merge(inner_labels)
          // .transition(TR)
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
        // .transition(TR)
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
          // .transition(TR) // This transistion prevents the bounding box calculation.  TODO need to wait on it.
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
          });

        labels
        // What to do for merging
          .merge(labels)
          // .transition(TR)
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
          });

      }
      else {
        labels
        // .transition(TR)
        // .attr("font-size", 0)
          .remove();
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
          //   .transition(TR)
            .attr("fill", "none")
            .attr("stroke", "#000")
            .attr("stroke-opacity", "0.35")
            .attr("stroke-width", DEFAULT_BRANCH_WIDTH > 2 ? 2 : DEFAULT_BRANCH_WIDTH)
            .attr("stroke-dasharray", "1, 5")
            .attr("class", "dotted-links")
            .each(function (d) {
              d.target.linkExtensionNode = this;
            })
            .attr("d", link_extension_path);
        }
        else {
          linkExtension
          // .transition(TR)
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
          // TODO this is very slow for the tree of life.
          .attr("stroke", function (d) {
            return get_branch_md_val(d.target, "branch_color", DEFAULT_BRANCH_COLOR);
          })
          .attr("stroke-width", function (d) {
            return get_branch_md_val(d.target, "branch_width", DEFAULT_BRANCH_WIDTH);
          });

      // .attr("stroke", function(d) { return d.target.color; });

      link.merge(link)
          // .transition(TR)
          .attr("fill", "none")
          .attr("stroke", "#000")
          .each(function (d) {
            d.target.linkNode = this;
          })
          .attr("d", link_path)
          .attr("stroke", function (d) {
            return get_branch_md_val(d.target, "branch_color", DEFAULT_BRANCH_COLOR);
          })
          .attr("stroke-width", function (d) {
            return get_branch_md_val(d.target, "branch_width", DEFAULT_BRANCH_WIDTH);
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
        if (TREE_ROTATION == 0) {
          if (LABEL_ROTATION == 90 || LABEL_ROTATION == -90) {
            return "0.3em"; // They're going up and down so center them
          }
          else {
            return "1.2em";
          }
        }
        else {
          if (LABEL_ROTATION == 0 || LABEL_ROTATION == 45) {
            return "1.2em";
          }
          else if (LABEL_ROTATION == 90) {
            return "0.3em";
          }
          else if (LABEL_ROTATION == 135 || LABEL_ROTATION == 180) {
            return "-1.2em";
          }
        }
      }
    }


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
  the_chart.setAttribute("width", chart_bbox.width);
  the_chart.setAttribute("height", chart_bbox.height);

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

    the_chart.setAttribute("width", new_svg_width);
    the_chart.setAttribute("height", new_svg_height);
  }

  // Update elements
  the_svg.setAttribute("width", new_svg_width);
  the_svg.setAttribute("height", new_svg_height);

  the_chart.setAttribute("transform", g_chart_transform);
}

function ary_mean(ary) {
  var num_elems = ary.length;
  var total     = 0;
  ary.map(function (d) {
    total += d;
  });

  return total / num_elems;
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
    if (document.getElementById(ID_SCALE_BAR_AUTOSIZE).checked) {
      scale_bar_pixels = mean_length * pixels_per_unit_length;
      jq(ID_SCALE_BAR_LENGTH).val(mean_length);
    }
    else {
      scale_bar_pixels = jq(ID_SCALE_BAR_LENGTH).val() * pixels_per_unit_length;

      if (isNaN(scale_bar_pixels)) {
        scale_bar_pixels = mean_length * pixels_per_unit_length;
        jq(ID_SCALE_BAR_LENGTH).val(mean_length);
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
    jq(ID_SCALE_BAR_LENGTH).val(scale_bar_label_text);


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
             .attr("stroke-width", DEFAULT_BRANCH_WIDTH > 2 ? 2 : DEFAULT_BRANCH_WIDTH)
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
      check("show-leaf-dots");
    }

    // Show leaf labels if leaf label options are present.
    if (leaf_label_options_present) {
      check("show-leaf-labels");
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

// Start here.  If it is rooted on a leaf node, and that leaf node has a color, need to propegate the color of that leaf node's branch to the other depth 1 branch adjacent to the root node if it is a radial tree.  If not a radial tree, do nothing.

function is_root(d) {
  return d.depth === 0;
}

function is_leaf(d) {
  return d.value === 1;
}

function is_inner(d) {
  return !is_leaf(d);
}

function is_root_node(d) {
  return d.depth === 1;
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

function flatten(ary) {
  function flatten_iter(ary) {
    for (var i = 0; i < ary.length; ++i) {
      var val = ary[i];
      if (Array.isArray(val)) {
        flatten_iter(val);
      }
      else {
        flat_ary.push(val);
      }
    }
  }

  var flat_ary = [];
  flatten_iter(ary);

  return flat_ary;
}

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

// function select(id)
// {
//   $("#" + id).prop("selected", true);
// }
// function deselect(id)
// {
//   $("#" + id).prop("selected", false);
// }

function is_checked(id) {
  return jq(id).prop("checked");
}


function check(id) {
  $("#" + id).prop("checked", true);
}

function uncheck(id) {
  $("#" + id).prop("checked", false);
}

function jq(id) {
  return $("#" + id);
}

function disable(id) {
  return jq(id).prop("disabled", true);
}

function undisable(id) {
  return jq(id).prop("disabled", false);
}


// Currently, these are all the defaults for the radial tree.
function reset_all_to_defaults() {
  EXTRA_NAME_WARNINGS = false;

  // The set_options_by_metadata function will change the value of the *_options_present vars, but if you change the mapping file to a new one, these don't appear to get changed back.

  // Set these to null as this function is called when clicking the submit or reset buttons.  Either of which will re-set these anyway.  But doing this avoids some weird bugs where the mapping file is still hanging around after hitting reset.  See https://github.com/mooreryan/iroki_web/issues/32.
  tree_input    = null;
  mapping_input = null;
  // name2md = null;

  // Tree options
  // jq(ID_MATCHING_TYPE).val("partial");

  // $("#width").attr("min", 3).attr("max", 55).attr("step", 1).val(7);
  $("#width").val(viewer.defaults.radial.width);
  $("#height").prop("disabled", true).val(viewer.defaults.radial.height);
  $("#padding").val(0.05);
  $("#tree-rotation").val(0);

  jq(ID_LAYOUT).val(ID_LAYOUT_RADIAL);

  jq(ID_TREE_BRANCH_STYLE).val(ID_TREE_BRANCH_STYLE_NORMAL);

  jq(ID_SORT).val(ID_SORT_FORWARD);

  // Scale bar options
  check(ID_SCALE_BAR_SHOW);
  check(ID_SCALE_BAR_AUTOSIZE);
  jq(ID_SCALE_BAR_LENGTH).val(1).prop("disabled", true);
  $("#scale-bar-offset-weight").val(1);

  // Label options
  uncheck("show-inner-labels");
  $("#inner-label-size").val(12);

  check("show-leaf-labels");
  $("#leaf-label-size").val(16);
  jq(ID_LEAF_LABEL_PADDING).val(defaults.leaf_label_padding);

  // not checked, not disabled
  sync_align_buttons_and_vals(false, false);
  $("#label-rotation").val(0);

  jq(ID_LEAF_LABEL_COLOR).val("#000000");
  jq(ID_LEAF_LABEL_FONT).val("Helvetica");

  jq(ID_INNER_LABEL_COLOR).val("#000000");
  jq(ID_INNER_LABEL_FONT).val("Helvetica");

  // Dot options
  uncheck(ID_SHOW_INNER_DOTS);
  $("#inner-dot-size").val(5);

  uncheck("show-leaf-dots");
  $("#leaf-dot-size").val(5);

  jq(ID_LEAF_DOT_COLOR).val("#000000");
  jq(ID_INNER_DOT_COLOR).val("#000000");

  // Bar options
  uncheck(ID_BAR_SHOW);
  uncheck(ID_BAR_SHOW_START_AXIS);
  jq(ID_BAR_COLOR).val(defaults.bar_color);
  jq(ID_BAR_HEIGHT).val(defaults.bar_height);
  jq(ID_BAR_WIDTH).val(defaults.bar_width);
  jq(ID_BAR_PADDING).val(defaults.bar_padding);

  // Branch options
  $("#branch-color").val("#000000");
  $("#branch-width").val(2);

  // Viewer options
  check(ID_VIEWER_SIZE_FIXED);


  check(ID_BIOLOGICALLY_ROOTED);
}


function size_transform(val) {
  return Math.pow(val, 2);
}


function ary_min_max(ary) {
  var min = null;
  var max = null;
  ary.forEach(function (val) {
    if (!max || val > max) {
      max = val;
    }

    if (!min || val < min) {
      min = val;
    }
  });

  return { min: min, max: max };
}

// Space hsl looks nice for an even mix of counts.  lch looks pretty good for typical power law count data.
function color_test(space) {
  // var counts = [1, 2, 4, 8, 16, 32, 64, 128];
  var counts = [1, 10, 20, 30, 40, 50, 60];
  // counts = counts.map(function(count){
  //   return Math.round(Math.log(count));
  // });
  var min_max = ary_min_max(counts);

  console.log(counts);
  console.log(min_max);

  d3.selectAll("circle").remove();

  // var rainbow = new Rainbow();
  // rainbow.setSpectrum("#0000ff", "#00ff00");
  // rainbow.setNumberRange(min_max.min, min_max.max);

  var colors = chroma.scale(['#00ff00', '#0000ff']).mode(space).colors(min_max.max - min_max.min + 1);

  counts.forEach(function (count, idx) {
    console.log(colors[count - min_max.min]);
    d3.select("#svg-tree").append("circle")
      .attr("r", 10)
      .attr("cx", 100)
      .attr("cy", idx * 100)
      .attr("fill", colors[count - min_max.min]);
  });
}

// Also can make it two colors.
function ryan(start, mid, stop, num_colors, transform) {
  d3.selectAll("circle").remove();

  var counts = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
  var color;

  var colors = chroma.scale([start, mid, stop]).mode("hsl").colors(num_colors);
  var limits = chroma.limits(counts, transform, num_colors);
  limits.shift();

  for (var i = 0; i < counts.length; ++i) {
    var count = counts[i];

    for (var j = 0; j < limits.length; ++j) {
      if (count <= limits[j]) {
        color = colors[j];
        break;
      }
    }

    d3.select("#svg-tree").append("circle")
      .attr("r", 10)
      .attr("cx", 100)
      .attr("cy", count * 40)
      .attr("fill", color);
  }

  console.log(limits);
}

// function z(num_colors, transform)
// {
//   d3.selectAll("circle").remove();
//
//   var counts = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21];
//   var color;
//
//   var limits = chroma.limits(counts, transform, num_colors);
//   var colors = chroma.scale('YlGnBu').classes(limits);
//   limits.shift();
//
//   for (var i = 0; i < counts.length; ++i) {
//     var count = (counts[i] - 1) / (21 - 1);
//
//     for (var j = 0; j < limits.length; ++j) {
//       if (count <= limits[j]) {
//         color = colors[j];
//         break;
//       }
//     }
//
//     d3.select("#svg-tree").append("circle")
//       .attr("r", 10)
//       .attr("cx", 100)
//       .attr("cy", count * 40)
//       .attr("fill", color);
//   }
//
//   console.log(limits);
// }

var tree_debug;

// TODO this will not work properly unless TREE_IS_ROOTED_ON_A_LEAF_NODE has been set.
function try_disable_bio_rooted() {
  if (LAYOUT_RADIAL && TREE_IS_ROOTED_ON_A_LEAF_NODE) {
    jq(ID_BIOLOGICALLY_ROOTED).prop("disabled", true);
  }
  else if (!LAYOUT_RADIAL) {
    jq(ID_BIOLOGICALLY_ROOTED).prop("disabled", true);
  }
  else {
    jq(ID_BIOLOGICALLY_ROOTED).prop("disabled", false);
  }
}

function inner_dot_fill(d) {
  var val           = parseFloat(d.data.name);
  var bootstrap_val = isNaN(val) ? 0.0 : val;

  if (VAL_SHOW_INNER_DOTS === ID_SHOW_INNER_DOTS_NONE) {
    return "none";
  }
  else if (VAL_SHOW_INNER_DOTS === ID_SHOW_INNER_DOTS_NORMAL) {
    return VAL_INNER_DOT_COLOR;
  }
  else if (VAL_SHOW_INNER_DOTS === ID_SHOW_INNER_DOTS_BOOTSTRAP) {
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

  if (VAL_SHOW_INNER_DOTS === ID_SHOW_INNER_DOTS_NONE) {
    return "none";
  }
  else if (VAL_SHOW_INNER_DOTS === ID_SHOW_INNER_DOTS_NORMAL) {
    return "none";
  }
  else if (VAL_SHOW_INNER_DOTS === ID_SHOW_INNER_DOTS_BOOTSTRAP) {
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

  if (VAL_SHOW_INNER_DOTS === ID_SHOW_INNER_DOTS_NONE) {
    return "none";
  }
  else if (VAL_SHOW_INNER_DOTS === ID_SHOW_INNER_DOTS_NORMAL) {
    return "none";
  }
  else if (VAL_SHOW_INNER_DOTS === ID_SHOW_INNER_DOTS_BOOTSTRAP) {
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
    jq(id).val(defaults.leaf_label_padding);
    // And return the actual usable value
    return defaults.leaf_label_padding;
  }

  // If raw_val is undefined, then this will be NaN.
  var val = parseFloat(raw_val);

  // First check if it's NaN.  If so, use default value
  if (isNaN(val)) {

    // Set the user option
    jq(id).val(defaults.leaf_label_padding);
    // And return the actual usable value
    return defaults.leaf_label_padding;
  }
  else if (val > defaults.leaf_label_padding_max) {
    jq(id).val(defaults.leaf_label_padding_max);
    return defaults.leaf_label_padding_max;
  }
  else if (val < defaults.leaf_label_padding_min) {
    jq(id).val(defaults.leaf_label_padding_min);
    return defaults.leaf_label_padding_min;
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
    jq(id).val(defaults.bar_padding);
    // And return the actual usable value
    return defaults.bar_padding;
  }

  // If raw_val is undefined, then this will be NaN.
  var val = Math.round(parseFloat(raw_val));

  // First check if it's NaN.  If so, use default value
  if (isNaN(val)) {

    // Set the user option
    jq(id).val(defaults.bar_padding);
    // And return the actual usable value
    return defaults.bar_padding;
  }
  else if (val > defaults.bar_padding_max) {
    jq(id).val(defaults.bar_padding_max);
    return defaults.bar_padding_max;
  }
  else if (val < defaults.bar_padding_min) {
    jq(id).val(defaults.bar_padding_min);
    return defaults.bar_padding_min;
  }
  else {
    // It's fine return the actual val.
    return val;
  }

}

function set_and_validate_bootstrap_cutoff_input() {
  VAL_BOOTSTRAP_CUTOFF_UNFILLED_DOT = parseFloat(jq(ID_BOOTSTRAP_CUTOFF_UNFILLED_DOT).val());
  VAL_BOOTSTRAP_CUTOFF_FILLED_DOT   = parseFloat(jq(ID_BOOTSTRAP_CUTOFF_FILLED_DOT).val());

  // First check if either are NaN, if so use the default value.
  if (isNaN(VAL_BOOTSTRAP_CUTOFF_UNFILLED_DOT)) {
    // Set it to the deault value.
    jq(ID_BOOTSTRAP_CUTOFF_UNFILLED_DOT).val(DEFAULT_BOOTSTRAP_CUTOFF_UNFILLED_DOT);
    VAL_BOOTSTRAP_CUTOFF_UNFILLED_DOT = DEFAULT_BOOTSTRAP_CUTOFF_UNFILLED_DOT;
  }

  if (isNaN(VAL_BOOTSTRAP_CUTOFF_FILLED_DOT)) {
    // Set it to the deault value.
    jq(ID_BOOTSTRAP_CUTOFF_FILLED_DOT).val(DEFAULT_BOOTSTRAP_CUTOFF_FILLED_DOT);
    VAL_BOOTSTRAP_CUTOFF_FILLED_DOT = DEFAULT_BOOTSTRAP_CUTOFF_FILLED_DOT;
  }

  // TODO this should be an else.

  // Make sure that the bootstrap values are okay.
  // TODO the corresponding VAL vars should also be changed.
  if (VAL_BOOTSTRAP_CUTOFF_UNFILLED_DOT > MAX_BOOTSTRAP_VAL) {
    jq(ID_BOOTSTRAP_CUTOFF_UNFILLED_DOT).val(MAX_BOOTSTRAP_VAL);
  }
  if (VAL_BOOTSTRAP_CUTOFF_FILLED_DOT > MAX_BOOTSTRAP_VAL) {
    jq(ID_BOOTSTRAP_CUTOFF_FILLED_DOT).val(MAX_BOOTSTRAP_VAL);
  }
  if (VAL_BOOTSTRAP_CUTOFF_UNFILLED_DOT < 0) {
    jq(ID_BOOTSTRAP_CUTOFF_UNFILLED_DOT).val(0);
  }
  if (VAL_BOOTSTRAP_CUTOFF_FILLED_DOT < 0) {
    jq(ID_BOOTSTRAP_CUTOFF_FILLED_DOT).val(0);
  }

}


// TODO the wonky thing about hcl is that the ranges are differnt for c and l depending on the hue.
// Test lightness portion of hcl vs hsl.
// var test_vals = [0.00, 0.17, 0.33, 0.50, 0.67, 0.83, 1.00];
// var _hue = 0;
// var ys = [];
// d3.selectAll("circle").remove();
// test_vals.forEach(function(l, idx) {
//   ys.push((l*325) + 125);
//   d3.select("#svg-tree")
//     .append("circle")
//     .attr("r", 25)
//     .attr("fill", chroma.hcl(_hue, 75, l * 100).hex())
//     .attr("cx", 300).attr("cy", ys[idx]);
// });
// test_vals.forEach(function(l, idx) {
//   d3.select("#svg-tree")
//     .append("circle")
//     .attr("r", 25)
//     .attr("fill", chroma.hsl(_hue, 0.50, l).hex())
//     .attr("cx", 125).attr("cy", ys[idx])
// });
//

// Same thing but varying different parts of the hcl scale.

// val should be true or false.
//
// Also makes sure that the option is disabled or not.
var sync_align_buttons_and_vals = function (checked, disabled) {
  jq(ID_LEAF_LABEL_ALIGN).prop("checked", checked);
  jq(ID_LEAF_DOT_ALIGN).prop("checked", checked);
  jq(ID_BAR_ALIGN).prop("checked", checked);

  jq(ID_LEAF_LABEL_ALIGN).prop("disabled", disabled);
  jq(ID_LEAF_DOT_ALIGN).prop("disabled", disabled);
  jq(ID_BAR_ALIGN).prop("disabled", disabled);

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
