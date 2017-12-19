// Copyright 2011 Jason Davies https://github.com/jasondavies/newick.js
function parseNewick(tree_string)
{
  var subtree;
  try {
    // Setting the branch length to 1 to handle the cases where a tree has no lengths.
    for(var ary=[], current_tree={ branch_length: 1 }, tokens=tree_string.split(/\s*(;|\(|\)|,|:)\s*/), idx=0; idx < tokens.length; idx++) {
      var token = tokens[idx];
      switch(token) {
        case "(" : // start of a new (sub)tree
          subtree = { branch_length: 1 };

          current_tree.branchset = [subtree];

          ary.push(current_tree);

          current_tree = subtree;

          break;

        case ",":
          subtree = { branch_length: 1 };
          var last_branchset = ary[ary.length - 1];
          last_branchset.branchset.push(subtree);

          current_tree = subtree;

          break;

        case ")": // end of a (sub)tree
          current_tree = ary.pop();
          break;

        case ":":
          break;

        default:
          var last_token = tokens[idx-1];

          if (last_token === ")" || last_token === "(" || last_token === ",") {
            current_tree.name = token;
          } else if (last_token === ":") {
            current_tree.branch_length = parseFloat(token);
          }
      }
    }
  }
  catch (err) {
    alert("ERROR -- there was a tree parsing error: " + err.message + ".  Check the format of the tree file.");
  }

  // TODO catch other weird output errors.
  if (JSON.stringify(current_tree) === JSON.stringify({})) {
    alert("ERROR -- there was a tree parsing error.  Check the format of the tree file.");

    return null;
  } else {
    return current_tree;
  }
}


function clear_elem(id) {
  chart_elem = document.getElementById(id);

  // Clear the elem if it is there
  if (chart_elem) {
    chart_elem.parentNode.removeChild(chart_elem);
  }
}

var MAPPING_CHANGED, TREE_CHANGED;

// load dataset
function load_dataset(tree_file, mapping_file) {
  document.getElementById("form-div").appendChild(TREE_FORM);
  lalala(tree_file, mapping_file);
}

var TREE_FORM;

// handle upload button
function upload_button(submit_id, uploader_id, callback) {
  document.getElementById("form-div")
    .setAttribute("style", "overflow: scroll; display: block; height: " + (verge.viewportH() * 0.7) + "px;");

  TREE_FORM = document.getElementById("tree-form");
  clear_elem("tree-form");
  var uploader = document.getElementById(uploader_id);
  var mapping_uploader = document.getElementById("mapping-file-uploader");

  var submit_button = document.getElementById(submit_id);
  var tree_reader = new FileReader();
  var mapping_reader = new FileReader();

  tree_reader.onload = function(tree_event) {
    var tree_str = tree_event.target.result;
    var mapping_file = mapping_uploader.files[0];
    if (mapping_file) {
      mapping_reader.readAsText(mapping_file);
    } else {
      callback(tree_str, null);
    }

    mapping_reader.onload = function(mapping_event) {
      var mapping_str = mapping_event.target.result;

      callback(tree_str, mapping_str)
    };
  };

  uploader.addEventListener("change", function(){
    TREE_CHANGED = true;
    submit_button.removeAttribute("disabled");
  });
  mapping_uploader.addEventListener("change", function() {
    MAPPING_CHANGED = true;
    submit_button.removeAttribute("disabled");
  });
  submit_button.addEventListener("click", function() {
    if (MAPPING_CHANGED && !TREE_CHANGED) {
      // Don't reset
    } else {
      clear_elem("svg-tree");
      reset_all_to_defaults();
    }
    $("#reset").prop("disabled", false);

    // Add a loading tree message.
    d3.select("#tree-div")
      .append("p")
      .attr("id", "loading-message")
      .html("Loading tree! Please wait....");

    MAPPING_CHANGED = false;
    TREE_CHANGED = false;

    handleFiles();
  }, false);
  document.getElementById("reset").addEventListener("click", function() {
    MAPPING_CHANGED = false;
    TREE_CHANGED = false;

    // Reset all sliders and options to default.
    reset_all_to_defaults();

    clear_elem("tree-form");
    clear_elem("svg-tree");
    $("#reset").prop("disabled", true);
    document.getElementById("save-svg").setAttribute("disabled", "");
    document.getElementById("save-png").setAttribute("disabled", "");
    document.getElementById("file-upload-form").reset();

  });

  function handleFiles() {
    submit_button.setAttribute("disabled", "");
    var file = uploader.files[0];
    if (file) {
      tree_reader.readAsText(file);
    } else {
      alert("Don't forget a tree file!");
    }
  }
}

// function watch_for_uploads()
// {
//   var tree_uploader = document.getElementById("uploader");
//   var mapping_uploader = document.getElementById("mapping-file-uploader");
//   var reader = new FileReader();
//
//   reader.onload = function(event) {
//     var contents = event.target.result;
//
//   }
// }

//
// Stuff from the old viewer stops here
//



// TODO get this from the CSS
var FORM_HEIGHT = 650;

// Round to 100ths place.
var ROUNDING_PLACE = 100;

var LAYOUT_CIRCLE, LAYOUT_STRAIGHT, LAYOUT_RADIAL;
var TREE_BRANCH_STYLE, TREE_BRANCH_CLADOGRAM, TREE_BRANCH_NORMAL;
var the_x, the_y;
var SIZE, INNER_SIZE;
var width, padding, height;
var root, svg, chart, data, circles, labels, inner_labels, leaf_labels, linkExtension, link, inner_dots, leaf_dots;

var SHOW_INNER_LABELS, SHOW_LEAF_LABELS;

var SHOW_SCALE_BAR;

var INNER_LABEL_SIZE, LEAF_LABEL_SIZE;
var SHOW_INNER_DOTS, SHOW_LEAF_DOTS;

var LABEL_ROTATION;
var ROTATION_STATE, ROTATED, NOT_ROTATED;

var INNER_DOT_SIZE, LEAF_DOT_SIZE;

var TREE_ROTATION;

var VIEWER_WIDTH, VIEWER_HEIGHT, VIEWER_SIZE_FIXED;

var align_tip_labels;

var SORT_STATE, SORT_NONE, SORT_ASCENDING, SORT_DESCENDING, sort_function;

var the_width, the_height, the_width, the_height, padding;

var SCALE_BAR_OFFSET_WEIGHT, SCALE_BAR_LENGTH;

var name2md, category_names = [], previous_category_names = null;

var MATCHING_TYPE;

var EXTRA_NAME_WARNINGS = false;
var MIN_LENGTH_IN_TREE;
var MIN_DEFUALT_BRANCH_LENGTH = 1e-10;
var NEW_LENGTH_FOR_ZERO_LENGTH_BRANCHES;

var LARGE_TREE_CUTOFF = 1000; // in number of nodes.  TODO tune this...phage proteomic tree is 5200, slow; tree of life 381, fast.

var DEFAULT_LABEL_COLOR, DEFAULT_LABEL_FONT;
var DEFAULT_BRANCH_COLOR, DEFAULT_BRANCH_WIDTH;

// To hold temporary DOM elements
var elem;

var TR;

var RADIAL_LAYOUT_WEIGHT = 1;

// These vars hold elem IDs
var ID_MATCHING_TYPE = "matching-type";
var ID_LAYOUT = "tree-shape",
  ID_LAYOUT_RECTANGULAR = "rectangular-tree",
  ID_LAYOUT_CIRCULAR = "circular-tree",
  ID_LAYOUT_RADIAL = "radial-tree";
var ID_TREE_BRANCH_STYLE = "tree-branch-style",
  ID_TREE_BRANCH_STYLE_NORMAL = "normalogram",
  ID_TREE_BRANCH_STYLE_CLADOGRAM = "cladogram";
var ID_SORT = "tree-sort",
  ID_SORT_FORWARD = "descending",
  ID_SORT_REVERSE = "ascending",
  ID_SORT_UNSORTED = "not-sorted";
var ID_SCALE_BAR_SHOW = "show-scale-bar",
  ID_SCALE_BAR_OFFSET_WEIGHT = "scale-bar-offset-weight",
  ID_SCALE_BAR_AUTOSIZE = "scale-bar-auto-size",
  ID_SCALE_BAR_LENGTH = "scale-bar-length";
var ID_VIEWER_SIZE_FIXED = "viewer-size-fixed";

var tmp_root;


var defaults = {
  "leaf_label_color": "#000000",
  "leaf_label_font": "Helvetica",
  "leaf_label_size": 16,
  "leaf_dot_color": "#000000",
  "leaf_dot_size": 2,
  "new_name": null,
  "branch_width": 2,
  "branch_color": "#000000"
};

var md_cat_name2id = {
  "leaf_label_color": null,
  "leaf_label_font": null,
  "leaf_label_size": "leaf-label-size",
  "leaf_dot_color": null,
  "leaf_dot_size": "leaf-dot-size",
  "new_name": null,
  "branch_width": "branch-width",
  "branch_color": null
};

// The mega function
function lalala(tree_input, mapping_input)
{

  // Check if there is more than one semicolon.  TODO this will give a false positive if there are semicolons within quoted names.

  if (tree_input.indexOf(";") !== tree_input.lastIndexOf(";")) {
    // There is more than one semicolon.
    alert("WARNING -- found more than one semicolon.  You may have multiple trees in your Newick file.  If so, only the last tree in the file will be shown.  Note: if you have quoted names with semicolons, you may not have multiple trees.  If some of the node names look weird (e.g., '\"E. co' when it should be 'E. coli'), you probably have semicolons within node names.");
  }

  var parsed_newick = parseNewick(tree_input);
  if (parsed_newick) {
    tmp_root = d3.hierarchy(parsed_newick, function(d) { return d.branchset; })
      .sum(function(d) { return d.branchset ? 0 : 1; })
      .sort(sort_function);

    // If it is a big tree, uncheck the viewer size fixed button.  It goes way faster.
    if (tmp_root.descendants().length > LARGE_TREE_CUTOFF) {
      uncheck(ID_VIEWER_SIZE_FIXED);
    }

    // Check if there is as many branchlengths as there are number of nodes.
    var num_semicolons;
    var semicolon_match = tree_input.match(/:/g)
    if (semicolon_match) {
      num_semicolons = semicolon_match.length;
    } else {
      num_semicolons = 0;
    }
    // Subtract off one to account for the root, which doesn't need to have a branch length in the newick file.
    var num_nodes = tmp_root.descendants().length - 1;
    if (num_nodes > num_semicolons) {
      alert("WARNING -- found more non-root nodes than colons.  This may indicate not every non-root node in the tree has a branch length.  Any nodes other than the root node that are missing the branch length will be assigned a branch length of 1.")
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
    } else {
      NEW_LENGTH_FOR_ZERO_LENGTH_BRANCHES = MIN_DEFUALT_BRANCH_LENGTH;
    }


    if (mapping_input) {
      // Note that name2md will be null if there were any errors parsing the mapping file.  So it will be skipped if this is so.
      name2md = parse_mapping_file(mapping_input);

      // Need to set up a temporary root so that we can check for non specific matching in the mapping file.  TODO rewrite check function to use the parse newick to avoid the heirarchy call.

      // Also this will pop up a warning if there are any branches of length zero. and set the minbranch length.

      if (has_non_specific_matching(tmp_root, name2md)) {
        // Reset name2md to null so we skip the mapping stuff and disabling certain features.
        name2md = null;
      }
    } else {
      name2md = null;
    }

    // TODO this transition doesn't get picked up by the draw functions when they are called by a listener.
    TR = d3.transition().duration(750).ease(d3.easeExp);

    function listener(id, action, fn)
    {
      d3.select("#" + id).on(action, fn);
    }

    function pick_transform(d)
    {
      if (LAYOUT_CIRCLE && is_leaf(d)) {
        return circle_transform(d, the_x, align_tip_labels ? "y" : the_y);
      } else if (LAYOUT_CIRCLE) {
        return circle_transform(d, the_x, the_y);
      } else if (LAYOUT_STRAIGHT && is_leaf(d)) {
        return rectangle_transform(d, the_x, align_tip_labels ? "y" : the_y);
      } else if (LAYOUT_STRAIGHT) {
        return rectangle_transform(d, the_x, the_y);
      } else {
        var rotate_by = rad_to_deg(Math.atan2((d.radial_layout_info.y - d.radial_layout_info.parent_y), (d.radial_layout_info.x - d.radial_layout_info.parent_x)));

        if (-90 < rotate_by && rotate_by < 90) {
          // Don't change rotate by
        } else if (rotate_by >= 90) { // TODO which should have the equal part
          rotate_by += 180; // TODO also flip the text-anchor to end
        } else if (rotate_by <= -90) {
          rotate_by -= 180; // TODO also flip the text anchor to end
        }

        return "rotate(0) translate(" + (d.radial_layout_info.x * RADIAL_LAYOUT_WEIGHT) + " " + (d.radial_layout_info.y * RADIAL_LAYOUT_WEIGHT) + ") rotate(" + rotate_by + ")"; // TODO labels will need rotation for radial layouts
      }
    }


    // Set rotation constants
    ROTATED = 270;
    NOT_ROTATED = 0;

    // Listen for save
    // See https://github.com/vibbits/phyd3/blob/9e5cf7edef72b1e8d4e8355eb5ab4668734816e5/js/phyd3.phylogram.js#L915
    d3.select("#save-svg").on("click", save_svg_data);
    d3.select("#save-png").on("click", save_png_data);


    // Listeners for form elements.  Some redraw the whole tree, others update only parts of it.

    listener(ID_MATCHING_TYPE, "change", draw_tree);

    listener("width", "change", draw_tree);
    listener("padding", "change", draw_tree);

    listener("height", "change", draw_tree);

    listener(ID_LAYOUT, "change", function() {
      // First adjust the slider.
      var width_elem = $("#width");
      var height_elem = $("#height");

      if (document.getElementById("rectangular-tree").selected) {
        width_elem
          .attr("min", 15)
          .attr("max", 150)
          .attr("step", 1)
          .val(22);

        height_elem
          .attr("min", 15)
          .attr("max", 150)
          .attr("step", 1)
          .val(22);
      } else if (document.getElementById("circular-tree").selected) {
        width_elem
          .attr("min", 15)
          .attr("max", 150)
          .attr("step", 1)
          .val(22);

        height_elem
          .attr("min", 15)
          .attr("max", 150)
          .attr("step", 1)
          .val(22);
      } else { // radial
        // The values look weird since they are polynomial transformed later.
        width_elem
          .attr("min", 5)
          .attr("max", 125)
          .attr("step", 1)
          .val(7);

        width_elem
          .attr("min", 5)
          .attr("max", 125)
          .attr("step", 1)
          .val(7);
      }

      draw_tree();
    });
    listener("tree-branch-style", "change", redraw_tree);

    listener("tree-rotation", "change", draw_tree);

    listener("tree-sort", "change", draw_tree);

    listener(ID_SCALE_BAR_SHOW, "change", function() {
      set_options_by_metadata();
      update_form_constants();
      draw_scale_bar();
      adjust_tree();
    });
    listener(ID_SCALE_BAR_OFFSET_WEIGHT, "change", function() {
      set_options_by_metadata();
      update_form_constants();
      draw_scale_bar();
      adjust_tree();
    });
    listener(ID_SCALE_BAR_AUTOSIZE, "change", function(){
      if (document.getElementById(ID_SCALE_BAR_AUTOSIZE).checked) {
        jq(ID_SCALE_BAR_LENGTH).prop("disabled", true);
      } else {
        jq(ID_SCALE_BAR_LENGTH).prop("disabled", false);
      }

      set_options_by_metadata();
      update_form_constants();
      draw_scale_bar();
      adjust_tree();
    });
    listener(ID_SCALE_BAR_LENGTH, "change", function() {
      // var val = $("#scale-bar-length").val();
      // if (val <= 0) {
      //   // TODO set back to the default instead of 1.
      //   $("#scale-bar-length").val(1);
      // }
      
      set_options_by_metadata();
      update_form_constants();
      draw_scale_bar();
      adjust_tree();
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

    listener("show-inner-labels", "change", function() { update_and_draw(draw_inner_labels); });
    listener("inner-label-size", "change", function() { update_and_draw(draw_inner_labels); });
    listener("show-leaf-labels", "change", function() {
      set_options_by_metadata();
      update_form_constants();
      draw_link_extensions(); // may need to be removed.
      draw_leaf_dots();
      draw_leaf_labels();
      draw_scale_bar();
      adjust_tree();
    });
    listener("leaf-label-size", "change", function() { update_and_draw(draw_leaf_labels); });
    listener("align-tip-labels", "change", function() {
      set_options_by_metadata();
      update_form_constants();
      draw_link_extensions();
      draw_leaf_dots();
      draw_leaf_labels();
      draw_scale_bar();
      adjust_tree();

    });
    listener("label-rotation", "change", function() {
      set_options_by_metadata();
      update_form_constants();
      draw_inner_labels();
      draw_leaf_labels();
      draw_scale_bar();
      adjust_tree();
    });
    listener("leaf-label-color", "change", function(){
      set_options_by_metadata();
      update_form_constants();
      draw_inner_labels();
      draw_leaf_labels();
      draw_scale_bar();
      adjust_tree();
    });
    listener("leaf-label-font", "change", function(){
      set_options_by_metadata();
      update_form_constants();
      draw_inner_labels();
      draw_leaf_labels();
      draw_scale_bar();
      adjust_tree();
    });

    listener("show-inner-dots", "change", function() { update_and_draw(draw_inner_dots); });
    listener("inner-dot-size", "change", function() { update_and_draw(draw_inner_dots); });
    listener("show-leaf-dots", "change", function() {
      set_options_by_metadata();
      update_form_constants();
      draw_link_extensions(); // may need to be removed.
      draw_leaf_dots();
      draw_leaf_labels();
      draw_scale_bar();
      adjust_tree();
    });
    listener("leaf-dot-size", "change", function() { update_and_draw(draw_leaf_dots); });

    listener("branch-color", "change", function() {
      set_options_by_metadata();
      update_form_constants();
      draw_links();
      draw_link_extensions();
      draw_scale_bar();
      adjust_tree();
    });
    listener("branch-width", "change", function() {
      set_options_by_metadata();
      update_form_constants();
      draw_links();
      draw_link_extensions();
      draw_scale_bar();
      adjust_tree();
    });


    listener(ID_VIEWER_SIZE_FIXED, "change", update_viewer_size_fixed);

    draw_tree();

    var circle_cluster, rectangle_cluster;


    function set_value_of(id, val)
    {
      var elem = document.getElementById(id);
      elem.value = val;
    }

    // Choose sorting function
    function sort_descending(a, b)
    {
      return (a.value - b.value) || d3.ascending(a.data.branch_length, b.data.branch_length);
    }

    function sort_ascending(a, b)
    {
      return (b.value - a.value) || d3.descending(a.data.branch_length, b.data.branch_length);
    }

    function sort_none(a, b)
    {
      return 0;
    }

    // Start here.  TODO this function is wonky.
    function update_viewer_size_fixed()
    {
      var is_checked = jq(ID_VIEWER_SIZE_FIXED).prop("checked");
      if (is_checked) {
        jq("tree-div").attr("style", "overflow: scroll; display: block; height: " + (verge.viewportH() * 0.8) + "px;");
      } else {
        jq("tree-div").attr("style", null);
      }
    }

    function update_form_constants()
    {

      // If there were category names from the mapping file that were disabled, but now the mapping file is gone and they need to be re-enabled.
      // if (previous_category_names) {
      //   previous_category_names.forEach(function(cat_name) {
      //     var id = md_cat_name2id[cat_name];
      //
      //     if (id) {
      //       var elem = document.getElementById(id);
      //
      //       if (elem) {
      //         elem.removeAttribute("disabled");
      //       }
      //     }
      //   });
      // }

      DEFAULT_LABEL_COLOR = document.getElementById("leaf-label-color").value;
      DEFAULT_LABEL_FONT = document.getElementById("leaf-label-font").value;

      DEFAULT_BRANCH_COLOR = document.getElementById("branch-color").value;
      DEFAULT_BRANCH_WIDTH = parseInt(document.getElementById("branch-width").value);



      MATCHING_TYPE = document.getElementById(ID_MATCHING_TYPE).value;

      // Get sorting options
      SORT_NONE = "not-sorted";
      SORT_ASCENDING = "ascending";
      SORT_DESCENDING = "descending";
      SORT_STATE = document.getElementById("tree-sort").value;

      if (SORT_STATE == SORT_NONE) {
        sort_function = sort_none;
      } else if (SORT_STATE == SORT_ASCENDING) {
        sort_function = sort_ascending;
      } else {
        sort_function = sort_descending;
      }

      SHOW_SCALE_BAR = document.getElementById(ID_SCALE_BAR_SHOW).checked;
      SCALE_BAR_OFFSET_WEIGHT = parseFloat(document.getElementById(ID_SCALE_BAR_OFFSET_WEIGHT).value);
      SCALE_BAR_LENGTH = parseFloat(document.getElementById(ID_SCALE_BAR_LENGTH).value);



      LAYOUT_CIRCLE   = document.getElementById("circular-tree").selected;
      LAYOUT_STRAIGHT = document.getElementById("rectangular-tree").selected;
      LAYOUT_RADIAL   = document.getElementById("radial-tree").selected;

      // Enable the save button
      document.getElementById("save-svg").removeAttribute("disabled");
      document.getElementById("save-png").removeAttribute("disabled");


      // Dots
      SHOW_INNER_DOTS = document.getElementById("show-inner-dots").checked;
      SHOW_LEAF_DOTS = document.getElementById("show-leaf-dots").checked;
      INNER_DOT_SIZE = parseInt(document.getElementById("inner-dot-size").value);
      LEAF_DOT_SIZE = parseInt(document.getElementById("leaf-dot-size").value);
      if (SHOW_INNER_DOTS) {
        document.getElementById("inner-dot-size").removeAttribute("disabled");
      } else {
        document.getElementById("inner-dot-size").setAttribute("disabled", "");
      }
      if (SHOW_LEAF_DOTS) {
        document.getElementById("leaf-dot-size").removeAttribute("disabled");
      } else {
        document.getElementById("leaf-dot-size").setAttribute("disabled", "");
      }



      INNER_LABEL_SIZE = parseInt(document.getElementById("inner-label-size").value);
      LEAF_LABEL_SIZE = parseInt(document.getElementById("leaf-label-size").value);

      TREE_BRANCH_CLADOGRAM = "cladogram";
      TREE_BRANCH_NORMAL = "normalogram";
      if (LAYOUT_RADIAL) {
        TREE_BRANCH_STYLE = "normalogram"
        $("#tree-branch-style").prop("disabled", true);
      } else {
        $("#tree-branch-style").prop("disabled", false);
        TREE_BRANCH_STYLE = document.getElementById("tree-branch-style").value;
      }

      if (LAYOUT_STRAIGHT) {
        // It could be coming from the circle which has a different slider behavior
        elem = document.getElementById("tree-rotation");
        var val = parseInt(elem.value);
        if (val < 180) { // The slider will jump to the beginning so set it to 0.
          TREE_ROTATION = 0;
          elem.setAttribute("value", "0");
        } else {
          TREE_ROTATION = 270;
          elem.setAttribute("value", "270");
        }
        elem.setAttribute("min", "0");
        elem.setAttribute("max", "270");
        elem.setAttribute("step", "270")
      } else {
        // Works for both circular and radial
        elem = document.getElementById("tree-rotation");
        TREE_ROTATION = parseInt(elem.value);
        // Flip tree rotation to 0
        TREE_ROTATION = TREE_ROTATION == 360 ? 0 : TREE_ROTATION;
        elem.setAttribute("min", "0");
        elem.setAttribute("max", "360");
        elem.setAttribute("step", "1");
      }

      if (LAYOUT_STRAIGHT && TREE_ROTATION == ROTATED) { // ie rectangle tree on its side
        LABEL_ROTATION = parseInt(document.getElementById("label-rotation").value) + 90;
      } else {
        LABEL_ROTATION = parseInt(document.getElementById("label-rotation").value);
      }
      SHOW_INNER_LABELS = document.getElementById("show-inner-labels").checked;
      SHOW_LEAF_LABELS = document.getElementById("show-leaf-labels").checked;


      // Show or hide align tip labels
      if ((!SHOW_LEAF_LABELS && !SHOW_LEAF_DOTS) || TREE_BRANCH_STYLE == TREE_BRANCH_CLADOGRAM) {
        document.getElementById("align-tip-labels").setAttribute("disabled", "");
        document.getElementById("align-tip-labels").removeAttribute("checked");
        align_tip_labels = false;
      } else {
        document.getElementById("align-tip-labels").removeAttribute("disabled");
        align_tip_labels = document.getElementById("align-tip-labels").checked;
      }

      // Show/hide labels size
      if (SHOW_LEAF_LABELS) {
        document.getElementById("leaf-label-size").removeAttribute("disabled");
      } else {
        document.getElementById("leaf-label-size").setAttribute("disabled", "");
      }

      // If it's circle the label rotation gets disabled
      if (LAYOUT_STRAIGHT && (SHOW_LEAF_LABELS || SHOW_INNER_LABELS)) {
        document.getElementById("label-rotation").removeAttribute("disabled");
      } else {
        document.getElementById("label-rotation").setAttribute("disabled", "");
      }

      if (SHOW_INNER_LABELS) {
        document.getElementById("inner-label-size").removeAttribute("disabled");
      } else {
        document.getElementById("inner-label-size").setAttribute("disabled", "");
      }

      // Set the align tip labels button to false if it is a cladogram or radial layout.
      if (TREE_BRANCH_STYLE == TREE_BRANCH_CLADOGRAM || LAYOUT_RADIAL) {
        elem = null;
        elem = document.getElementById("align-tip-labels");
        elem.checked = false;
      }


      // Set the height to match the width
      if (LAYOUT_CIRCLE || LAYOUT_RADIAL) {
        // Disable the height slider
        elem = document.getElementById("height");
        elem.disabled = true;

        width = size_transform(parseInt(document.getElementById("width").value));
        height = width;

        padding = parseFloat(document.getElementById("padding").value);

        set_value_of("height", width);

        $("#width-label").html("Size");

      } else {
        elem = document.getElementById("height");
        elem.disabled = false;

        width = size_transform(parseInt(document.getElementById("width").value));
        height = size_transform(parseInt(document.getElementById("height").value));

        padding = parseFloat(document.getElementById("padding").value);

        $("#width-label").html("Horizontal");
      }

      elem = document.getElementById("width");
      RADIAL_LAYOUT_WEIGHT = size_transform(elem.value);

      //  padding is the total % of padding.  If it is set to 0.1, then the inner width will be 90% of the svg.
      width = Math.round(width * (1 - padding));
      height = Math.round(height * (1 - padding));

      if (TREE_ROTATION == ROTATED) {
        // Need to flip height and width
        the_width = height;
        the_height = width;

        the_width = height;
        the_height = width;

      } else {

        the_width = width;
        the_height = height;

        the_width = width;
        the_height = height;
      }
      the_x = "x";
      the_y = TREE_BRANCH_STYLE == TREE_BRANCH_CLADOGRAM ? "y" : "radius";

      // Finally make sure to re-disable any thing that is already accounted for in the mapping file.
      // category_names.forEach(function(cat_name) {
      //   var id = md_cat_name2id[cat_name];
      //   if (id) {
      //     var elem = document.getElementById(id);
      //
      //     if (elem) {
      //       elem.setAttribute("disabled", "");
      //     }
      //   }
      // });


      // update_viewer_size_fixed();

    }

    function set_up_hierarchy()
    {
      // Circles specify 360 and the RADIUS, but the width is a diameter.
      circle_cluster = d3.cluster()
        .size([360, the_width / 2])
        .separation(function(a, b) { return 1; });

      rectangle_cluster = d3.cluster()
        .size([the_width * 1, the_height * 1])
        .separation(function(a, b) { return 1; });

      root = d3.hierarchy(parseNewick(tree_input), function(d) { return d.branchset; })
        .sum(function(d) { return d.branchset ? 0 : 1; })
        .sort(sort_function);

      // Add metadata if it is available.
      if (name2md) {
        add_metadata(root, name2md, MATCHING_TYPE);
      } else {
        add_blank_metadata(root);
      }

      // Set the root branch length to zero each time.
      if (LAYOUT_CIRCLE) {
        circle_cluster(root);
        setRadius(root, root.data.branch_length = 0, (the_width / 2) / maxLength(root));

      } else if (LAYOUT_STRAIGHT) {
        rectangle_cluster(root);
        // TODO should this be width or height
        setRadius(root, root.data.branch_length = 0, (the_height * 1) / maxLength(root));
      } else { // LAYOUT_RADIAL
        radial_cluster(root);
        // TODO should this actually be the same as for straight layout?
        setRadius(root, root.data.branch_length = 0, (the_height * 1) / maxLength(root));

      }
    }

    function draw_svg()
    {
      if (document.getElementById("svg-tree")) {
        svg.merge(svg)
        // .transition(TR)
          .attr("width", the_width * 1)
          .attr("height", the_height * 1)
          .style("background-color", "white"); // TODO make bg color an option
      } else {
        // First remove loading message if there is one.
        d3.select("#loading-message").remove();

        // And add the svg.
        svg = d3.select("#tree-div")
          .append("svg")
          .attr("id", "svg-tree")
          .attr("width", the_width * 1)
          .attr("height", the_height * 1)
          .style("background-color", "white"); // TODO make bg color an option
      }
    }

    function draw_chart()
    {
      var chart_width, chart_height;
      var chart_transform_width, chart_transform_height;
      if (LAYOUT_CIRCLE) {
        chart_width  = the_width;
        chart_height = the_height;

        chart_transform_width  = the_width;
        chart_transform_height = the_height;
      } else {
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
            "translate(" + chart_transform_width + ", " + chart_transform_height + ")")
      } else {
        chart = svg.append("g")
          .attr("id", "chart-container")
          .attr("width", chart_width)
          .attr("height", chart_height)
          .attr("transform",
            "rotate(" + TREE_ROTATION + " " + the_width + " " + the_height + ") " +
            "translate(" + chart_transform_width + ", " + chart_transform_height + ")")
      }
    }

    function draw_inner_dots()
    {
      inner_dots = d3.select("#inner-dot-container")
        .selectAll("circle")
        .data(root.descendants().filter(is_inner));

      if (SHOW_INNER_DOTS) {
        inner_dots
          .enter().append("circle")
          .attr("class", "inner")
          .attr("r", INNER_DOT_SIZE)
          .attr("transform", function(d) {
            return pick_transform(d);
          })
          .attr("fill", function(d) { return d.color; } );

        inner_dots.merge(inner_dots)
        // .transition(TR)
          .attr("r", INNER_DOT_SIZE)
          .attr("transform", function(d) {
            return pick_transform(d);
          })
          .attr("fill", function(d) { return d.color; } );

      } else {
        inner_dots
        // .transition(TR)
          .remove();
      }
    }

    function draw_leaf_dots()
    {
      leaf_dots = d3.select("#leaf-dot-container")
        .selectAll("circle")
        .data(root.descendants().filter(is_leaf));

      if (SHOW_LEAF_DOTS) {
        leaf_dots
          .enter().append("circle")
          .attr("class", "leaf")
          .attr("transform", function(d) {
            return pick_transform(d);
          })
          .attr("r", function(d) {
            var val = d.metadata.leaf_dot_size;
            return val ? val : LEAF_DOT_SIZE;
          })
          .attr("fill", function(d) {
            var val = d.metadata.leaf_dot_color;
            return val ? val : "black";
          });

        leaf_dots.merge(leaf_dots)
        // .transition(TR)
          .attr("transform", function(d) {
            return pick_transform(d);
          })
          .attr("r", function(d) {
            var val = d.metadata.leaf_dot_size;
            return val ? val : LEAF_DOT_SIZE;
          })
          .attr("fill", function(d) {
            var val = d.metadata.leaf_dot_color;
            return val ? val : "black";
          } );
      } else {
        leaf_dots
          .remove();
      }
    }

    function draw_inner_labels()
    {
      inner_labels = d3.select("#inner-label-container")
        .selectAll("text")
        .data(root.descendants().filter(is_inner));

      if (SHOW_INNER_LABELS) {

        inner_labels.exit().remove();

        inner_labels
          .enter().append("text")
          .attr("class", "inner")
          // .attr("font-size", 0)
          .attr("dy", text_y_offset)
          .attr("dx", text_x_offset)
          .attr("text-anchor", text_anchor)
          .attr("transform", function(d) {
            return pick_transform(d);
          })
          .text(function(d) { return d.data.name; })
          // .transition(TR)
          .attr("fill", DEFAULT_LABEL_COLOR)
          .attr("font-size", INNER_LABEL_SIZE)
          .attr("font-family", DEFAULT_LABEL_FONT);

        inner_labels
          .merge(inner_labels)
          // .transition(TR)
          .attr("dy", text_y_offset)
          .attr("dx", text_x_offset)
          .attr("text-anchor", text_anchor)
          .attr("transform", function(d) {
            return pick_transform(d);
          })
          .attr("fill", DEFAULT_LABEL_COLOR)
          .attr("font-size", INNER_LABEL_SIZE)
          .attr("font-family", DEFAULT_LABEL_FONT);

      } else {
        inner_labels
        // .transition(TR)
        // .attr("font-size", 0)
          .remove();
      }
    }

    function draw_leaf_labels()
    {

      labels = d3.select("#leaf-label-container")
        .selectAll("text")
        .data(root.descendants().filter(is_leaf));

      if (SHOW_LEAF_LABELS) {
        labels.exit().remove();

        // TODO clean up duplicates
        labels
          .enter().append("text")
          .attr("class", "leaf")
          // .attr("font-size", 0)
          .attr("dy", text_y_offset)
          .attr("dx", text_x_offset)
          .attr("text-anchor", text_anchor)
          .attr("transform", function(d) {
            return pick_transform(d);
          })
          .text(function(d) {
            var new_name = d.metadata.new_name;

            return new_name ? new_name : d.data.name;
          })
          // .transition(TR) // This transistion prevents the bounding box calculation.  TODO need to wait on it.
          .attr("font-size", function(d) {
            var size = d.metadata.leaf_label_size;
            return size ? size : LEAF_LABEL_SIZE;
          })
          .attr("font-family", function(d) {
            var font = d.metadata.leaf_label_font;
            return font ? font : DEFAULT_LABEL_FONT;
          })
          .attr("fill", function(d) {
            var color = d.metadata.leaf_label_color;
            return color ? color : DEFAULT_LABEL_COLOR;
          });

        labels
        // What to do for merging
          .merge(labels)
          // .transition(TR)
          // Same things that may change
          .attr("dy", text_y_offset)
          .attr("dx", text_x_offset)
          .attr("text-anchor", text_anchor)
          .attr("transform", function(d) {
            return pick_transform(d);
          })
          .text(function(d) {
            var new_name = d.metadata.new_name;

            return new_name ? new_name : d.data.name;
          })
          .attr("font-size", function(d) {
            var size = d.metadata.leaf_label_size;
            return size ? size : LEAF_LABEL_SIZE;
          })
          .attr("font-family", function(d) {
            var font = d.metadata.leaf_label_font;
            return font ? font : DEFAULT_LABEL_FONT;
          })
          .attr("fill", function(d) {
            var color = d.metadata.leaf_label_color;
            return color ? color : DEFAULT_LABEL_COLOR;
          });

      } else {
        labels
        // .transition(TR)
        // .attr("font-size", 0)
          .remove();
      }
    }

    function draw_link_extensions()
    {
      // Link extensions should never be drawn with radial layouts
      if (!LAYOUT_RADIAL) {
        linkExtension = d3.select("#link-extension-container")
          .selectAll("path")
          .data(root.links().filter(function (d) {
            return !d.target.children;
          }));

        // var starts = root.links().filter(function(d) {
        //   return !d.target.children;
        // }).map(function(d) {
        //   return { "the_x" : d.target[the_x], "the_y" : d.target[the_y] };
        // });

        if (align_tip_labels) {
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
            .each(function (d)
            {
              d.target.linkExtensionNode = this;
            })
            .attr("d", link_extension_path);
        } else {
          linkExtension
          // .transition(TR)
          // .attr("d", function(d, i) {
          //   return "M " + starts[i].the_x + " " + starts[i].the_y + "L " + starts[i].the_x + " " + starts[i].the_y
          // })
            .remove();
        }
      }
    }

    function draw_links()
    {
      link = d3.select("#link-container")
        .selectAll("path")
        .data(root.links());

      link.enter().append("path")
        .attr("fill", "none")
        .attr("stroke", "#000")
        .each(function(d) { d.target.linkNode = this; })
        .attr("d", link_path)
        // TODO this is very slow for the tree of life.
        .attr("stroke", function(d) {
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
        .each(function(d) { d.target.linkNode = this; })
        .attr("d", link_path)
        .attr("stroke", function(d) {
          return get_branch_md_val(d.target, "branch_color", DEFAULT_BRANCH_COLOR);
        })
        .attr("stroke-width", function (d) {
          return get_branch_md_val(d.target, "branch_width", DEFAULT_BRANCH_WIDTH);
        });

      // .attr("stroke", function(d) { return d.target.color; });
    }

    function adjust_tree()
    {
      resize_svg_straight_layout("svg-tree", "chart-container");
    }

    function update_and_draw(draw_fn)
    {
      set_options_by_metadata();
      update_form_constants();
      draw_fn();
      draw_scale_bar();
      adjust_tree();
    }

    // Similar to draw_tree but meant to be called by a listener that doesn't need to recalculate the hierarchy and replace the svg and g chart as well.
    function redraw_tree()
    {
      set_options_by_metadata();
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
    function set_up_and_redraw()
    {
      set_options_by_metadata();
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
    function draw_tree()
    {
      clear_elem("svg-tree");

      set_options_by_metadata();
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

      chart.append("g").attr("id", "leaf-label-container");
      draw_leaf_labels();

      draw_scale_bar();


      // Adjust the svg size to fit the rotated chart.  Needs to be done down here as we need the bounding box.
      adjust_tree();
    }

    function text_x_offset(d)
    {
      // TODO replace these with function params
      // var test = TREE_ROTATION == ROTATED ? d[the_x] < 180 : (d[the_x] < 90 || d[the_x] > 270);

      if (LAYOUT_CIRCLE) { // circular
        return circular_label_flipping_test(d[the_x]) ? "0.6em" : "-0.6em";
      } else if (LAYOUT_RADIAL) {
        // Positive moves text anchor start labels away from branch tip, but moves text anchor end labels closer to the branch tip.
        var rotate_by = rad_to_deg(Math.atan2((d.radial_layout_info.y - d.radial_layout_info.parent_y), (d.radial_layout_info.x - d.radial_layout_info.parent_x)));

        if (-90 < rotate_by && rotate_by < 90) {
          // Don't change rotate by
          // return "start";
          return "0.6em"
        } else if (rotate_by >= 90) { // TODO which should have the equal part
          // rotate_by += 180; // TODO also flip the text-anchor to end
          // return "end";
          return "-0.6em";
        } else if (rotate_by <= -90) {
          // rotate_by -= 180; // TODO also flip the text anchor to end
          // return "end";
          return "-0.6em";

        }

        return "1.0em"; // TODO radial layout placeholder
      } else {
        if (LABEL_ROTATION == 90) {
          return "0.6em"; // They're going up and down so move away from branch
        } else if (LABEL_ROTATION == -90) {
          return "-0.6em";
        } else {
          return "0em";
        }
      }
    }

    function text_y_offset(d)
    {
      if (LAYOUT_CIRCLE) { // circular
        return "0.2em"  // center the label on the branch;
      } else if (LAYOUT_RADIAL) {
        return "0.3em";
      } else {
        if (TREE_ROTATION == 0) {
          if (LABEL_ROTATION == 90 || LABEL_ROTATION == -90) {
            return "0.3em"; // They're going up and down so center them
          } else {
            return "1.2em";
          }
        } else {
          if (LABEL_ROTATION == 0 || LABEL_ROTATION == 45) {
            return "1.2em";
          } else if (LABEL_ROTATION == 90) {
            return "0.3em";
          } else if (LABEL_ROTATION == 135 || LABEL_ROTATION == 180) {
            return "-1.2em";
          }
        }
      }
    }



    // Depending on the tree rotation, you need to have a different test for whether the labels flip.
    function circular_label_flipping_test(x)
    {
      // Returns the value at the bottom of the circle
      function circle_key_points(rot)
      {
        var bottom, top;

        if (rot <= 90) {
          bottom = 90 - rot;
          top = bottom + 180;
        } else if (rot <= 270) {
          bottom = 360 - (rot - 90);
          top = bottom - 180;
        } else {
          bottom = 360 - (rot - 90);
          top = bottom + 180;
        }

        return { "bottom" : bottom, "top" : top };
      }

      var key_points = circle_key_points(TREE_ROTATION);

      if (TREE_ROTATION <= 90 || TREE_ROTATION > 270) {
        return x < key_points.bottom || x > key_points.top;
      } else {
        return x < key_points.bottom && x > key_points.top;
      }
    }

    function circular_text_anchor(d)
    {
      return circular_label_flipping_test(d[the_x]) ? "start" : "end";
    }

    function straight_text_anchor(d) {
      if (TREE_ROTATION == 0) {
        if (LABEL_ROTATION == 0) {
          return "middle";
        } else if (LABEL_ROTATION < 0) {
          return "end";
        } else {
          return "start";
        }
      } else {
        if (LABEL_ROTATION == 0 || LABEL_ROTATION == 180) {
          return "middle";
        } else {
          return "start";
        }
      }
    }

    function radial_text_anchor(d)
    {
      var rotate_by = rad_to_deg(Math.atan2((d.radial_layout_info.y - d.radial_layout_info.parent_y), (d.radial_layout_info.x - d.radial_layout_info.parent_x)));

      if (-90 < rotate_by && rotate_by < 90) {
        // Don't change rotate by
        return "start";
      } else if (rotate_by >= 90) { // TODO which should have the equal part
        // rotate_by += 180; // TODO also flip the text-anchor to end
        return "end";
      } else if (rotate_by <= -90) {
        // rotate_by -= 180; // TODO also flip the text anchor to end
        return "end";
      }
    }

    function text_anchor(d)
    {
      if (LAYOUT_CIRCLE) {
        return circular_text_anchor(d);
      } else if (LAYOUT_STRAIGHT) {
        return straight_text_anchor(d);
      } else {
        return radial_text_anchor(d);
      }
    }


// These functions update the layout
    function circle_transform(d, x, y)
    {
      return "rotate(" + d[x] +
        ") translate(" + d[y] + ", 0)" +
        (circular_label_flipping_test(d[x]) ?  "" : "rotate(180)");
    }

    function rectangle_transform(d, x, y)
    {
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

    function link_rectangle_extension(d, x, y)
    {
      var start_point = d.target[x] + " " + d.target["radius"];
      var end_point   = d.target[x] + " " + d.target["y"];

      return "M " + start_point +  " L " + end_point;
    }

    function link_radial(d)
    {
      var start_point = (d.target.radial_layout_info.parent_x * RADIAL_LAYOUT_WEIGHT) + " " + (d.target.radial_layout_info.parent_y * RADIAL_LAYOUT_WEIGHT);
      var end_point = (d.target.radial_layout_info.x * RADIAL_LAYOUT_WEIGHT) + " " + (d.target.radial_layout_info.y * RADIAL_LAYOUT_WEIGHT)

      return "M " + start_point + " L " + end_point;
    }

    function link_path(d)
    {
      if (LAYOUT_CIRCLE) {
        return linkCircle(d);
      } else if (LAYOUT_STRAIGHT) {
        return rectangle_link(d, the_x, the_y);
      } else {
        return link_radial(d);
      }
    }

    function link_extension_path(d)
    {
      if (LAYOUT_CIRCLE) {
        return linkCircleExtension(d);
      } else {
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
      var c0 = Math.cos(startAngle = (startAngle ) / 180 * Math.PI),
        s0 = Math.sin(startAngle),
        c1 = Math.cos(endAngle = (endAngle ) / 180 * Math.PI),
        s1 = Math.sin(endAngle);
      return "M" + startRadius * c0 + "," + startRadius * s0
        + (endAngle === startAngle ? "" : "A" + startRadius + "," + startRadius + " 0 0 " + (endAngle > startAngle ? 1 : 0) + " " + startRadius * c1 + "," + startRadius * s1)
        + "L" + endRadius * c1 + "," + endRadius * s1;
    }

// Set the radius of each node by recursively summing and scaling the distance from the root.
    function setRadius(d, y0, k) {
      d.radius = (y0 += d.data.branch_length) * k;
      if (d.children) d.children.forEach(function(d) { setRadius(d, y0, k); });
    }

// Compute the maximum cumulative length of any node in the tree.
    function maxLength(d) {
      return d.data.branch_length + (d.children ? d3.max(d.children, maxLength) : 0);
    }
  }
}


// These are for saving
function svg_elem_to_string(id)
{
  var svg_elem = document.getElementById(id);

  if (svg_elem) {
    return (new XMLSerializer()).serializeToString(svg_elem);
  }
}

// TODO png should keep background color
function save_png_data()
{
  var svg_string = svg_elem_to_string("svg-tree");

  var canvas = document.createElement("canvas");
  canvg(canvas, svg_string);
  canvas.toBlobHD(function(blob) {
    saveAs(blob, "tree.png");
  })
}

function save_svg_data()
{
  saveAs(
    new Blob([svg_elem_to_string("svg-tree")],
      { type : "application/svg+xml" }),
    "tree.svg"
  );
}

// NOTES
//   // The svg is the outer container and it is NOT rotated.  So these flip.
//   // Height and width of the elem are the same regardless of roatation.
// In the rotated state, the g elem width (x) and height (y) stay the same, but the SVG must swap them.

function resize_svg_straight_layout(svg_id, chart_id)
{

  var the_chart = document.getElementById(chart_id);
  var the_svg = document.getElementById(svg_id);

  var chart_bbox = the_chart.getBBox();
  the_chart.setAttribute("width", chart_bbox.width);
  the_chart.setAttribute("height", chart_bbox.height);

  var new_svg_height, new_svg_width;

  var chart_bbox_width_padding = chart_bbox.width * padding;
  var chart_bbox_height_padding = chart_bbox.height * padding;

  var g_chart_transform;
  // var g_chart_rotation;
  // var g_chart_translation

  if (LAYOUT_STRAIGHT && TREE_ROTATION == ROTATED) {

    new_svg_height = chart_bbox.width + (2 * chart_bbox_width_padding);
    new_svg_width  = chart_bbox.height + (2 * chart_bbox_height_padding);

    g_chart_transform = "rotate(270) translate("  +
      -(new_svg_height + chart_bbox.x - chart_bbox_width_padding) + " " +
      chart_bbox_height_padding + ")";

  } else if (LAYOUT_STRAIGHT || LAYOUT_RADIAL) {
    new_svg_width = chart_bbox.width + (2 * chart_bbox_width_padding);
    new_svg_height  = chart_bbox.height + (2 * chart_bbox_height_padding);

    g_chart_transform = "rotate(0) translate(" +
      // TODO sometimes the bbox x and y values are negative
      (chart_bbox_width_padding - chart_bbox.x) + " " +
      (chart_bbox_height_padding- chart_bbox.y) + ")";
  } else if (LAYOUT_CIRCLE) {
    var radius = chart_bbox.width > chart_bbox.height ? chart_bbox.width / 2: chart_bbox.height / 2;
    var diameter = radius * 2;
    var padding_px = diameter * padding;

    // This is actually the length of the diagonal plus padding.
    var diameter_with_padding = Math.sqrt(Math.pow(diameter, 2) * 2) + (padding_px * 2);

    new_svg_width = diameter_with_padding;
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

function ary_mean(ary)
{
  var num_elems = ary.length;
  var total = 0;
  ary.map(function(d) { total += d; });

  return total / num_elems;
}

function draw_scale_bar()
{
  d3.select("#scale-bar-container").remove();

  if (SHOW_SCALE_BAR) {
    var lengths;
    var mean_length;

    var SCALE_BAR_PADDING = 50; // in pixels
    var SCALE_BAR_TEXT_PADDING = 5;


    var first_link = root.links()[0];
    var pixels_per_unit_length;

    if (LAYOUT_RADIAL) {
      lengths = root.descendants().map(function(d) { return d.data.branch_length });

      pixels_per_unit_length = RADIAL_LAYOUT_WEIGHT * Math.sqrt(Math.pow(first_link.target.radial_layout_info.x - first_link.source.radial_layout_info.x, 2) + Math.pow(first_link.target.radial_layout_info.y - first_link.source.radial_layout_info.y, 2)) / first_link.target.data.branch_length;

    } else {
      if (TREE_BRANCH_STYLE == TREE_BRANCH_NORMAL) {
        lengths = root.descendants().map(function(d) { return d.data.branch_length });
        pixels_per_unit_length = (first_link.target.radius - first_link.source.radius) / first_link.target.data.branch_length;

      } else {
        lengths = root.descendants().map(function(d) { return d.height });

        // The source height will be higher than the target height as the leaf nodes have a height of 0 and internal nodes add 1 for each speciation event.
        pixels_per_unit_length = (first_link.target.y - first_link.source.y) / (first_link.source.height - first_link.target.height);
      }
    }


    var rotated_rectangle = LAYOUT_STRAIGHT && TREE_ROTATION == ROTATED;
    mean_length = round_to(ary_mean(lengths), ROUNDING_PLACE);

    var min_scale_bar_size;
    if (LAYOUT_CIRCLE) {
      min_scale_bar_size = 50; // circles look a bit smaller so make this half.
    } else if (LAYOUT_STRAIGHT) {
      min_scale_bar_size = 100;
    } else {
      min_scale_bar_size = 25;
    }

    var scale_bar_pixels;
    if (document.getElementById(ID_SCALE_BAR_AUTOSIZE).checked) {
      scale_bar_pixels = mean_length * pixels_per_unit_length;
      jq(ID_SCALE_BAR_LENGTH).val(mean_length);
    } else {
      scale_bar_pixels = jq(ID_SCALE_BAR_LENGTH).val() * pixels_per_unit_length;

      if (isNaN(scale_bar_pixels)) {
        scale_bar_pixels = mean_length * pixels_per_unit_length;
        jq(ID_SCALE_BAR_LENGTH).val(mean_length);
      }
    }



    // If the original scale bar is smaller than the min size, bump up the size.
    if (scale_bar_pixels < min_scale_bar_size) {
      scale_bar_pixels = min_scale_bar_size;
      // scale_bar_label_text = round_to(min_scale_bar_size / pixels_per_unit_length, ROUNDING_PLACE);
    }

    // // Now that we have a minimum scale bar size, weight it by the slider value.
    // scale_bar_pixels *= SCALE_BAR_LENGTH;
    var scale_bar_label_text = round_to(scale_bar_pixels / pixels_per_unit_length, ROUNDING_PLACE);
    jq(ID_SCALE_BAR_LENGTH).val(scale_bar_label_text);



    var label_x, label_y;

    // New where to add it?
    var chart_container = document.getElementById("chart-container");
    var chart_bbox = chart_container.getBBox();
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
    } else if (LAYOUT_RADIAL) {
      start_x = ((chart_bbox.width - scale_bar_pixels) / 2) + chart_bbox.x;
      start_y = (chart_bbox.height + SCALE_BAR_PADDING + chart_bbox.y) * (1 + ((SCALE_BAR_OFFSET_WEIGHT - 1) / 4)); // Reduce the weighting power by a lot.

      path_d = "M " + start_x + " " + start_y +
        " L " + (start_x + scale_bar_pixels) + " " + start_y;

      label_x = start_x + (scale_bar_pixels / 2);
      label_y = start_y + SCALE_BAR_TEXT_PADDING;
    } else if (rotated_rectangle) {
      start_x = (chart_bbox.x - SCALE_BAR_PADDING - (scale_bar_pixels / 2)) * (1 + ((SCALE_BAR_OFFSET_WEIGHT - 1) / 1.2)); // Reduce the weighting power by a bit.
      start_y = (chart_bbox.height / 2);

      path_d = "M " + start_x + " " + start_y +
        " L " + (start_x + scale_bar_pixels) + " " + start_y;

      label_x = start_x + (scale_bar_pixels / 2);
      label_y = start_y + SCALE_BAR_TEXT_PADDING;

    } else { // circular
      start_x = -(scale_bar_pixels / 2);

      // The chart bounding box height is the same as the width and it is centered, so the branches only extend half of that out.
      start_y = ((chart_bbox.height / 2) + SCALE_BAR_PADDING) * SCALE_BAR_OFFSET_WEIGHT;

      label_x = start_x + (scale_bar_pixels / 2);
      label_y = start_y + SCALE_BAR_TEXT_PADDING;
      path_d = "M " + start_x + " " + start_y + " L " + (start_x + scale_bar_pixels) + " " + start_y;
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
      var box = document.getElementById("scale-bar-container").getBBox();
      var box_center_pt = (box.x + (box.width / 2)) + " " + (box.y + (box.height / 2));

      d3.select("#scale-bar-container")
        .attr("transform", "rotate(90 " + box_center_pt + ")");
    }
  }
}

function round_to(x, place)
{
  return Math.round(place * x) / place;
}

function add_circle(x, y)
{
  d3.select("#svg-tree").append("circle").attr("r", 0).transition().attr("fill", "green").attr("r", 10).attr("cx", x).attr("cy", y).attr("class", "delete-me");
}

function delete_circles()
{
  d3.select("circle.delete-me").transition().attr("r", 0).remove();
}

function rot(p) { return pt(p.y, -p.x); }
function pt(x, y) { return { "x" : x, "y" : y } }



// function get_metadata(dat, md_cat_names)
// {
//
//   var name2md = {}
//   var i = 0;
//   for (i = 0; i < dat.length; ++i) {
//     name2md[dat[i][0]] = {};
//     var j = 0;
//     for (j = 0; j < md_cat_names.length; ++j) {
//       name2md[dat[i][0]][md_cat_names[j]] = dat[i][j+1];
//     }
//   }
//
//   return name2md;
// }
//
// function parse_metadata_string(str)
// {
//   var dat = str.split(/\r?\n/).filter(function(s) { return s; }).map(function(s) { return s.split("\t"); });
//   var md_cat_names = dat.shift();
//   md_cat_names.shift(); // pop off the first thing (will be "name")
//   md_cat_names = md_cat_names.map(function(s) { return s.replace(/ /g, "_") });
//
//   return get_metadata(dat, md_cat_names);
// }

function add_metadata(root, name2md, match_style)
{
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
    } else if (match_style === "partial") {
      json_each(name2md, function(name, metadata) {
        root.leaves().forEach(function(d) {
          // Since it's partial mapping, all leaves could match a single name.
          if (d.data.name.indexOf(name) !== -1) { // match
            push_unless_present(names_with_matches_in_tree, name);
            d.metadata = metadata;
          }
        });
      });
    } else {
      // TODO regex
    }

    if (names_with_matches_in_tree.length < json_keys(name2md).length) {
      var unused_names = [];
      json_keys(name2md).forEach(function(name){
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


function add_blank_metadata(root)
{
  root.leaves().forEach(function(d) { return d.metadata = {}; })
}

// function is_target_md_pure_for(root, branch_option, defualt_value)
// {
//   var targets = root.links().map(function(d) { return d.target });
//
//   targets.forEach(function(target){
//     var leaves = get_leaves(target);
//
//     // TODO does this assume that all leaves are in the mapping file?
//     var md_vals = [];
//     leaves.forEach(function(leaf) {
//       // Assumes that metadata has already been added.
//       var val = d.metadata[branch_option];
//       push_unless_present(md_vals, val);
//     });
//   });
//
//   return md_vals.length == 1 ? md_vals[0] : default_value;
// }


// The branch option needs to be the underscore version.
// TODO this is the slow function.  Just do this once at the beginning and mark all targets with the appropriate metadata.
function get_branch_md_val(node, branch_option, default_value)
{
  var leaves = get_leaves(node);
  var md_vals = [];

  leaves.forEach(function(leaf){
    // Assumes that metadata has already been added.
    var val = leaf.metadata[branch_option];
    if (val) {
      push_unless_present(md_vals, val);
    } else { // got undefined, push defualt value
      push_unless_present(md_vals, default_value);
    }
  });

  return md_vals.length === 1 ? md_vals[0] : default_value;
}

function set_options_by_metadata()
{
  if (name2md) {
    previous_category_names = null;

    json_each(name2md, function(seq_name, metadata) {
      json_each(metadata, function(category_name, value) {
        push_unless_present(category_names, category_name);
      });
    });

    var
      leaf_dot_options_present = false,
      leaf_label_options_present = false;

    category_names.forEach(function(cat_name) {
      if (LEAF_DOT_OPTIONS.includes(cat_name)) {
        leaf_dot_options_present = true;
      }

      if (LEAF_LABEL_OPTIONS.includes(cat_name)) {
        leaf_label_options_present = true;
      }
    });

    // Show leaf dots if leaf dot options are present
    if (leaf_dot_options_present) {
      var elem = $("#show-leaf-dots");
      elem.attr("checked", true);
      // elem.prop("disabled", true);
    }

    // Show leaf labels if leaf label options are present.
    if (leaf_label_options_present) {
      var elem = $("#show-leaf-labels");
      elem.attr("checked", true);
      // elem.prop("disabled", true);
    }

    // At the beginning of update form constants, these will be un-disabled if necessary.
    // category_names.forEach(function(cat_name) {
    //   var id = md_cat_name2id[cat_name];
    //
    //   if (id) {
    //     var elem = document.getElementById(id);
    //
    //     if (elem) {
    //       elem.setAttribute("disabled", "");
    //     }
    //   }
    // });
  } else {
    previous_category_names = category_names;
    category_names = [];
  }
}


function is_leaf(d)
{
  return d.value == 1;
}

function is_inner(d)
{
  return !is_leaf(d);
}

function get_leaves(target)
{
  function get_leaves_iter(target)
  {
    if (is_leaf(target)) {
      leaves.push(target);
    } else {
      target.children.map(function (d) {
        leaves.push(get_leaves(d));
      });
    }
  }

  var leaves = [];
  get_leaves_iter(target);

  return flatten(leaves);
}

function flatten(ary)
{
  function flatten_iter(ary)
  {
    for (var i = 0; i < ary.length; ++i) {
      var val = ary[i];
      if (Array.isArray(val)) {
        flatten_iter(val);
      } else {
        flat_ary.push(val);
      }
    }
  }

  var flat_ary = [];
  flatten_iter(ary);

  return flat_ary;
}

function radial_cluster(root)
{
  // Helpers
  function postorder_traversal(vertex)
  {
    if (is_leaf(vertex)) { // if deg(vertex) == 1
      vertex.radial_layout_info.num_leaves_in_subtree = 1;
    } else {
      vertex.children.forEach(function(child){
        postorder_traversal(child);
        vertex.radial_layout_info.num_leaves_in_subtree += child.radial_layout_info.num_leaves_in_subtree;
      });
    }
  }

  function preorder_traversal(vertex)
  {
    if (vertex != root) {
      var parent = vertex.parent;


      var distance_to_parent = vertex.data.branch_length === 0 ? NEW_LENGTH_FOR_ZERO_LENGTH_BRANCHES : vertex.data.branch_length;

      var x = parent.radial_layout_info.x + distance_to_parent * Math.cos(vertex.radial_layout_info.wedge_border + (vertex.radial_layout_info.wedge_size / 2));
      var y = parent.radial_layout_info.y + distance_to_parent * Math.sin(vertex.radial_layout_info.wedge_border + (vertex.radial_layout_info.wedge_size / 2));;

      vertex.radial_layout_info.x = x;
      vertex.radial_layout_info.y = y;
      vertex.radial_layout_info.parent_x = parent.radial_layout_info.x;
      vertex.radial_layout_info.parent_y = parent.radial_layout_info.y;

    }

    var current_vertex_wedge_border = vertex.radial_layout_info.wedge_border;

    if (is_inner(vertex)) { // leaves don't have a children attr
      vertex.children.forEach(function(child) {
        child.radial_layout_info.wedge_size = (child.radial_layout_info.num_leaves_in_subtree / root.radial_layout_info.num_leaves_in_subtree) * 2 * Math.PI;
        child.radial_layout_info.wedge_border = current_vertex_wedge_border;
        current_vertex_wedge_border += child.radial_layout_info.wedge_size;
        preorder_traversal(child);
      });
    }
  }

  // Set defaults
  root.descendants().map(function(vertex) {
    if (vertex == root) {
      root.radial_layout_info = {
        "name" : root.data.name,
        "x" : 0,
        "y" : 0,
        "num_leaves_in_subtree" : 0,
        "wedge_size" : 2 * Math.PI,
        "wedge_border" : deg_to_rad(TREE_ROTATION)
      };
    } else {
      vertex.radial_layout_info = {
        "name" : vertex.data.name,
        "x" : 0,
        "y" : 0,
        "num_leaves_in_subtree" : 0,
        "wedge_size" : 0,
        "wedge_border" : 0
      };
    }
  });

  postorder_traversal(root);
  preorder_traversal(root);
}

function deg_to_rad(deg)
{
  return deg / 180 * Math.PI;
}

function rad_to_deg(rad)
{
  return rad * 180 / Math.PI;
}

function get_translation(transform_str)
{
  var match = transform_str.match(/translate\((\d+\.?\d*) (\d+\.?\d*)\)/);
  if (match) {
    return { "x" : parseFloat(match[1]), "y" : parseFloat(match[2]) };
  } else {
    return { "x" : 0, "y" : 0 };
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

function check(id)
{
  $("#" + id).prop("checked", true);
}
function uncheck(id)
{
  $("#" + id).prop("checked", false);
}

function jq(id)
{
  return $("#" + id);
}


// Currently, these are all the defaults for the radial tree.
function reset_all_to_defaults()
{
  EXTRA_NAME_WARNINGS = false;

  // Tree options
  jq(ID_MATCHING_TYPE).val("partial");

  $("#width").attr("min", 3).attr("max", 55).attr("step", 1).val(7);
  $("#height").prop("disabled", true).val(7);
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

  uncheck("align-tip-labels");
  $("#label-rotation").val(0);

  $("#leaf-label-color").val("#000000");
  $("#leaf-label-font").val("Helvetica");

  // Dot options
  uncheck("show-inner-dots");
  $("#inner-dot-size").val(5);

  uncheck("show-leaf-dots");
  $("#leaf-dot-size").val(5);

  // Branch options
  $("#branch-color").val("#000000");
  $("#branch-width").val(2);

  // Viewer options
  check(ID_VIEWER_SIZE_FIXED);
}


function size_transform(val)
{
  return Math.pow(val, 2);
}