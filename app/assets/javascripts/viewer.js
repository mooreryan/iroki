// Copyright 2011 Jason Davies https://github.com/jasondavies/newick.js
function parseNewick(a){for(var e=[],r={},s=a.split(/\s*(;|\(|\)|,|:)\s*/),t=0;t<s.length;t++){var n=s[t];switch(n){case"(":var c={};r.branchset=[c],e.push(r),r=c;break;case",":var c={};e[e.length-1].branchset.push(c),r=c;break;case")":r=e.pop();break;case":":break;default:var h=s[t-1];")"==h||"("==h||","==h?r.name=n:":"==h&&(r.length=parseFloat(n))}}return r}

//
// Stuff from the old viewer goes here
//

function clear_elem(id) {
  chart_elem = document.getElementById(id);

  // Clear the elem if it is there
  if (chart_elem) {
    chart_elem.parentNode.removeChild(chart_elem);
  }
}


// load dataset 
function load_dataset(file) {
  clear_elem("svg-tree");
  lalala(file);
}

// handle upload button
function upload_button(el, callback) {
  var uploader = document.getElementById(el);
  var reader = new FileReader();

  reader.onload = function(e) {
    var contents = e.target.result;
    callback(contents);
  };

  uploader.addEventListener("change", handleFiles, false);

  function handleFiles() {
    d3.select("#table").text("loading...");
    var file = this.files[0];
    reader.readAsText(file);
  }
}


//
// Stuff from the old viewer stops here
//



// TODO get this from the CSS
var FORM_HEIGHT = 650;

var LAYOUT_STATE, LAYOUT_CIRCLE, LAYOUT_STRAIGHT;
var TREE_BRANCH_STYLE, TREE_BRANCH_CLADOGRAM, TREE_BRANCH_NORMAL;
var the_x, the_y;
var SIZE, INNER_SIZE;
var width, padding, height;
var root, svg, chart, data, circles, labels, inner_labels, leaf_labels, linkExtension, link, inner_dots, leaf_dots;

var SHOW_INNER_LABELS, SHOW_LEAF_LABELS;

var SHOW_SCALE_BAR;

var INNER_LABEL_SIZE, LEAF_LABEL_SIZE;
var BRANCH_WIDTH;
var SHOW_INNER_DOTS, SHOW_LEAF_DOTS;

var LABEL_ROTATION;
var ROTATION_STATE, ROTATED, NOT_ROTATED;

var INNER_DOT_SIZE, LEAF_DOT_SIZE;

var TREE_ROTATION;

var VIEWER_WIDTH, VIEWER_HEIGHT, VIEWER_SIZE_FIXED;

var align_tip_labels;

var SORT_STATE, SORT_NONE, SORT_ASCENDING, SORT_DESCENDING, sort_function;

var the_width, the_height, the_width, the_height, padding;


// To hold temporary DOM elements
var elem;

var TR;

// The mega function
function lalala(tree_input)
{

  // TODO this transition doesn't get picked up by the draw functions when they are called by a listener.
  TR = d3.transition().duration(750).ease(d3.easeExp);

  function listener(id, action, fn)
  {
    d3.select("#" + id).on(action, fn);
  }

  function pick_transform(d)
  {
    if (LAYOUT_STATE == LAYOUT_CIRCLE && is_leaf(d)) {
      return circle_transform(d, the_x, align_tip_labels ? "y" : the_y);
    } else if (LAYOUT_STATE == LAYOUT_CIRCLE) {
      return circle_transform(d, the_x, the_y);
    } else if (LAYOUT_STATE == LAYOUT_STRAIGHT && is_leaf(d)) {
      return rectangle_transform(d, the_x, align_tip_labels ? "y" : the_y);
    } else if (LAYOUT_STATE == LAYOUT_STRAIGHT) {
      return rectangle_transform(d, the_x, the_y);
    } else {
      // TODO handle radial layout
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
  listener("width", "change", draw_tree);
  listener("padding", "change", draw_tree);

  listener("height", "change", draw_tree);

  listener("tree-shape", "change", draw_tree);
  listener("tree-branch-style", "change", redraw_tree);

  listener("tree-rotation", "change", draw_tree);

  listener("tree-sort", "change", draw_tree);

  listener("show-scale-bar", "change", function() {
    update_form_constants();
    add_scale_bar();
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

  listener("branch-width", "change", function() {
    update_form_constants();
    draw_links();
    draw_link_extensions();
    add_scale_bar();
    adjust_tree();
  });

  listener("show-inner-labels", "change", function() { update_and_draw(draw_inner_labels); });
  listener("inner-label-size", "change", function() { update_and_draw(draw_inner_labels); });
  listener("show-leaf-labels", "change", function() { update_and_draw(draw_leaf_labels); });
  listener("leaf-label-size", "change", function() { update_and_draw(draw_leaf_labels); });
  listener("align-tip-labels", "change", function() {
    update_form_constants();
    draw_link_extensions();
    draw_leaf_labels();
    add_scale_bar();
    adjust_tree();

  });
  listener("label-rotation", "change", function() {
    update_form_constants();
    draw_leaf_labels();
    draw_inner_labels();
    add_scale_bar();
    adjust_tree();

  });

  listener("show-inner-dots", "change", function() { update_and_draw(draw_inner_dots); });
  listener("inner-dots-size", "change", function() { update_and_draw(draw_inner_dots); });
  listener("show-leaf-dots", "change", function() { update_and_draw(draw_leaf_dots); });
  listener("leaf-dots-size", "change", function() { update_and_draw(draw_leaf_dots); });

  listener("viewer-size-fixed", "change", update_viewer_size_fixed);

  draw_tree();

  var circle_cluster, rectangle_cluster;

  function is_leaf(d)
  {
    return d.value == 1;
  }

  function is_inner(d)
  {
    return !is_leaf(d);
  }

  function set_value_of(id, val)
  {
    var elem = document.getElementById(id);
    elem.value = val;
  }

  // Choose sorting function
  function sort_descending(a, b)
  {
    return (a.value - b.value) || d3.ascending(a.data.length, b.data.length);
  }

  function sort_ascending(a, b)
  {
    return (b.value - a.value) || d3.descending(a.data.length, b.data.length);
  }

  function sort_none(a, b)
  {
    return 0;
  }

  function update_viewer_size_fixed()
  {
    VIEWER_SIZE_FIXED = document.getElementById("viewer-size-fixed").checked;
    if (VIEWER_SIZE_FIXED) {
      // Base the viewer size on the viewport size
      document.getElementById("tree-div")
        .setAttribute("style", "overflow: scroll; display: block; height: " + (verge.viewportH() * 0.8) + "px;");

    } else {
      document.getElementById("tree-div").removeAttribute("style");
    }
  }

  function update_form_constants()
  {
    console.log("updating form constants");
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

    SHOW_SCALE_BAR = document.getElementById("show-scale-bar").checked;

    LAYOUT_CIRCLE = "circular-tree";
    LAYOUT_STRAIGHT = "rectangular-tree";
    LAYOUT_STATE = document.getElementById("tree-shape").value;

    // Enable the save button
    document.getElementById("save-svg").removeAttribute("disabled");
    document.getElementById("save-png").removeAttribute("disabled");


    // Dots
    SHOW_INNER_DOTS = document.getElementById("show-inner-dots").checked;
    SHOW_LEAF_DOTS = document.getElementById("show-leaf-dots").checked;
    INNER_DOT_SIZE = parseInt(document.getElementById("inner-dots-size").value);
    LEAF_DOT_SIZE = parseInt(document.getElementById("leaf-dots-size").value);
    if (SHOW_INNER_DOTS) {
      document.getElementById("inner-dots-size").removeAttribute("disabled");
    } else {
      document.getElementById("inner-dots-size").setAttribute("disabled", "");
    }
    if (SHOW_LEAF_DOTS) {
      document.getElementById("leaf-dots-size").removeAttribute("disabled");
    } else {
      document.getElementById("leaf-dots-size").setAttribute("disabled", "");
    }


    BRANCH_WIDTH = parseInt(document.getElementById("branch-width").value);

    INNER_LABEL_SIZE = parseInt(document.getElementById("inner-label-size").value);
    LEAF_LABEL_SIZE = parseInt(document.getElementById("leaf-label-size").value);

    TREE_BRANCH_CLADOGRAM = "cladogram";
    TREE_BRANCH_NORMAL = "normalogram";
    TREE_BRANCH_STYLE = document.getElementById("tree-branch-style").value;

    if (LAYOUT_STATE == LAYOUT_STRAIGHT) {
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
      elem = document.getElementById("tree-rotation");
      TREE_ROTATION = parseInt(elem.value);
      // Flip tree rotation to 0
      TREE_ROTATION = TREE_ROTATION == 360 ? 0 : TREE_ROTATION;
      elem.setAttribute("min", "0");
      elem.setAttribute("max", "360");
      elem.setAttribute("step", "45")
    }

    if (LAYOUT_STATE == LAYOUT_STRAIGHT && TREE_ROTATION == ROTATED) { // ie rectangle tree on its side
      LABEL_ROTATION = parseInt(document.getElementById("label-rotation").value) + 90;
    } else {
      LABEL_ROTATION = parseInt(document.getElementById("label-rotation").value);
    }
    SHOW_INNER_LABELS = document.getElementById("show-inner-labels").checked;
    SHOW_LEAF_LABELS = document.getElementById("show-leaf-labels").checked;


    // Show or hide align tip labels
    if (!SHOW_LEAF_LABELS || TREE_BRANCH_STYLE == TREE_BRANCH_CLADOGRAM) {
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
    if (LAYOUT_STATE == LAYOUT_STRAIGHT && (SHOW_LEAF_LABELS || SHOW_INNER_LABELS)) {
      document.getElementById("label-rotation").removeAttribute("disabled");
    } else {
      document.getElementById("label-rotation").setAttribute("disabled", "");
    }

    if (SHOW_INNER_LABELS) {
      document.getElementById("inner-label-size").removeAttribute("disabled");
    } else {
      document.getElementById("inner-label-size").setAttribute("disabled", "");
    }

    // Set the align tip labels button to false if it is a cladogram
    if (TREE_BRANCH_STYLE == TREE_BRANCH_CLADOGRAM) {
      elem = null;
      elem = document.getElementById("align-tip-labels");
      elem.checked = false;
    }


    // Set the height to match the width
    if (LAYOUT_STATE == LAYOUT_CIRCLE) {
      // Disable the height slider
      elem = null;
      elem = document.getElementById("height");
      elem.disabled = true;

      width = parseInt(document.getElementById("width").value);
      height = width;

      padding = parseFloat(document.getElementById("padding").value);

      set_value_of("height", width);
    } else {
      elem = null;
      elem = document.getElementById("height");
      elem.disabled = false;

      width = parseInt(document.getElementById("width").value);
      height = parseInt(document.getElementById("height").value);

      padding = parseFloat(document.getElementById("padding").value);
    }

    //  padding is the total % of padding.  If it is set to 0.1, then the inner width will be 90% of the svg.
    width = Math.round(width * (1 - padding));
    height = Math.round(height * (1 - padding));

    if (TREE_ROTATION == ROTATED) {
      // Need to flip height and width
      the_width = height;
      the_height = width;

      the_width = height;
      the_height = width;

      // Flip the labels of the selectors
      $("#width-label").text("Heigth!");
      $("#height-label").text("Width!");

      // $("#padding-label").text("Height padding!");
      // $("#padding-label").text("Width padding!");

      // d3.select("#width-label")
      //   .transition().duration(1000)
      //   .style("color", "red")
      //   .transition().duration(1000)
      //   .style("color", "black")
      //   .text("Height!");
      //
      // d3.select("#height-label")
      //   .transition().duration(1000)
      //   .style("color", "red")
      //   .transition().duration(1000)
      //   .style("color", "black")
      //   .text("Width!");
    } else {

      the_width = width;
      the_height = height;

      the_width = width;
      the_height = height;

      // Flip the labels of the selectors
      $("#width-label").text("Width!");
      $("#height-label").text("Height!");
    }
    the_x = "x";
    the_y = TREE_BRANCH_STYLE == TREE_BRANCH_CLADOGRAM ? "y" : "radius";

    update_viewer_size_fixed();

  }

  // function set_up_hierarchy()
  // {
  //   // When setting size for circular layout, use width by convention, but they will be the same.
  //   circle_cluster = d3.cluster()
  //     .size([360, the_width])
  //     .separation(function(a, b) { return 1; });
  //
  //   rectangle_cluster = d3.cluster()
  //     .size([the_width * 2, the_height * 2])
  //     .separation(function(a, b) { return 1; });
  //
  //   root = d3.hierarchy(parseNewick(tree_input), function(d) { return d.branchset; })
  //     .sum(function(d) { return d.branchset ? 0 : 1; })
  //     .sort(sort_function);
  //
  //   if (LAYOUT_STATE == LAYOUT_CIRCLE) {
  //     circle_cluster(root);
  //     setRadius(root, root.data.length = 0, the_width / maxLength(root));
  //
  //   } else if (LAYOUT_STATE == LAYOUT_STRAIGHT) {
  //     rectangle_cluster(root);
  //     // TODO should this be width or height
  //     setRadius(root, root.data.length = 0, (the_height * 2) / maxLength(root));
  //   }
  // }

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

    if (LAYOUT_STATE == LAYOUT_CIRCLE) {
      circle_cluster(root);
      setRadius(root, root.data.length = 0, (the_width / 2) / maxLength(root));

    } else if (LAYOUT_STATE == LAYOUT_STRAIGHT) {
      rectangle_cluster(root);
      // TODO should this be width or height
      setRadius(root, root.data.length = 0, (the_height * 1) / maxLength(root));
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
    if (LAYOUT_STATE == LAYOUT_CIRCLE) {
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

    if (document.getElementById("apple-chart")) {
      chart.merge(chart)
        // .transition(TR)
        .attr("width", chart_width)
        .attr("height", chart_height)
        .attr("transform",
          "rotate(" + TREE_ROTATION + " " + the_width + " " + the_height + ") " +
          "translate(" + chart_transform_width + ", " + chart_transform_height + ")")
    } else {
      chart = svg.append("g")
        .attr("id", "apple-chart")
        .attr("width", chart_width)
        .attr("height", chart_height)
        .attr("transform",
          "rotate(" + TREE_ROTATION + " " + the_width + " " + the_height + ") " +
          "translate(" + chart_transform_width + ", " + chart_transform_height + ")")
    }
  }

  function draw_inner_dots()
  {
    inner_dots = d3.select("#inner-dots-container")
      .selectAll("circle")
      .data(root.descendants().filter(is_inner));

    if (SHOW_INNER_DOTS) {
      inner_dots
        .enter().append("circle")
        .attr("class", "inner")
        // .attr("r", 0)
        // .attr("transform", function(d) {
        //   return pick_transform(d);
        // })
        // .style("fill", function(d) { return d.color; } )
        // .transition(TR)
        .attr("r", INNER_DOT_SIZE)
        .attr("transform", function(d) {
          return pick_transform(d);
        })
        .style("fill", function(d) { return d.color; } );

      inner_dots.merge(inner_dots)
        // .transition(TR)
        .attr("r", INNER_DOT_SIZE)
        .attr("transform", function(d) {
          return pick_transform(d);
        })
        .style("fill", function(d) { return d.color; } );

    } else {
      inner_dots
        // .transition(TR)
        // .style("r", 0)
        .remove();
    }

    // if (SHOW_INNER_DOTS) {
    //   chart.append("g")
    //     .selectAll("circle")
    //     .data(root.descendants().filter(function (d) {
    //       return is_inner(d);
    //     }))
    //     .enter().append("circle")
    //     .attr("class", "inner")
    //     .attr("r", INNER_DOT_SIZE)
    //     .attr("transform", function(d) {
    //       return pick_transform(d);
    //     })
    //     .style("fill", function(d) { return d.color; } );
    // }
  }

  function draw_leaf_dots()
  {
    leaf_dots = d3.select("#leaf-dots-container")
      .selectAll("circle")
      .data(root.descendants().filter(is_leaf));

    if (SHOW_LEAF_DOTS) {
      leaf_dots
        .enter().append("circle")
        .attr("class", "leaf")
        // .attr("r", 0)
        // .attr("transform", function(d) {
        //   return pick_transform(d);
        // })
        // .style("fill", function(d) { return d.color; } )
        // .transition(TR)
        .attr("r", LEAF_DOT_SIZE)
        .attr("transform", function(d) {
          return pick_transform(d);
        })
        .style("fill", function(d) { return d.color; } );

      leaf_dots.merge(leaf_dots)
        // .transition(TR)
        .attr("r", LEAF_DOT_SIZE)
        .attr("transform", function(d) {
          return pick_transform(d);
        })
        .style("fill", function(d) { return d.color; } );
    } else {
      leaf_dots
        // .transition(TR)
        // .style("r", 0)
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
        .attr("font-size", 0)
        .attr("dy", text_y_offset)
        .attr("dx", text_x_offset)
        .attr("text-anchor", function(d) {
          return LAYOUT_STATE == LAYOUT_CIRCLE ? circular_text_anchor(d) : straight_text_anchor(d);
        })
        .attr("transform", function(d) {
          return pick_transform(d);
        })
        .text(function(d) { return d.data.name; })
        // .transition(TR)
        .style("font-size", INNER_LABEL_SIZE);

      inner_labels
        .merge(inner_labels)
        // .transition(TR)
        .style("font-size", INNER_LABEL_SIZE)
        .attr("dy", text_y_offset)
        .attr("dx", text_x_offset)
        .attr("text-anchor", function(d) {
          return LAYOUT_STATE == LAYOUT_CIRCLE ? circular_text_anchor(d) : straight_text_anchor(d);
        })
        .attr("transform", function(d) {
          return pick_transform(d);
        });

    } else {
      inner_labels
        // .transition(TR)
        // .style("font-size", 0)
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
        .attr("font-size", 0)
        .attr("dy", text_y_offset)
        .attr("dx", text_x_offset)
        .attr("text-anchor", function(d) {
          return LAYOUT_STATE == LAYOUT_CIRCLE ? circular_text_anchor(d) : straight_text_anchor(d);
        })
        .attr("transform", function(d) {
          return pick_transform(d);
        })
        .text(function(d) { return d.data.name; })
        // .transition(TR) // This transistion prevents the bounding box calculation.  TODO need to wait on it.
        .style("font-size", LEAF_LABEL_SIZE)

      labels
      // What to do for merging
        .merge(labels)
        // .transition(TR)
        // Same things that may change
        .style("font-size", LEAF_LABEL_SIZE)
        .attr("dy", text_y_offset)
        .attr("dx", text_x_offset)
        .attr("text-anchor", function(d) {
          return LAYOUT_STATE == LAYOUT_CIRCLE ? circular_text_anchor(d) : straight_text_anchor(d);
        })
        .attr("transform", function(d) {
          return pick_transform(d);
        })
    } else {
      labels
        // .transition(TR)
        // .style("font-size", 0)
        .remove();
    }
  }

  function draw_link_extensions()
  {
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
        .style("fill", "none")
        .style("stroke", "#000")
        .style("stroke-opacity", "0.35")
        .attr("stroke-width", BRANCH_WIDTH)
        .attr("stroke-dasharray", "1, 5")
        .attr("class", "dotted-links")
        .each(function (d)
        {
          d.target.linkExtensionNode = this;
        })
        .attr("d", function (d)
        {
          return LAYOUT_STATE == LAYOUT_CIRCLE ? linkCircleExtension(d) : link_rectangle_extension(d, the_x, "y");
        })
    } else {
      linkExtension
        // .transition(TR)
        // .attr("d", function(d, i) {
        //   return "M " + starts[i].the_x + " " + starts[i].the_y + "L " + starts[i].the_x + " " + starts[i].the_y
        // })
        .remove();
    }
  }

  function draw_links()
  {
    link = d3.select("#link-container")
      .selectAll("path")
      .data(root.links());

    link.enter().append("path")
      .style("fill", "none")
      .style("stroke", "#000")
      .attr("stroke-width", BRANCH_WIDTH)
      .each(function(d) { d.target.linkNode = this; })
      .attr("d", function(d) {
        return LAYOUT_STATE == LAYOUT_CIRCLE ? linkCircle(d) : rectangle_link(d, the_x, the_y);
      })
      .attr("stroke", function(d) { return d.target.color; });

    link.merge(link)
      // .transition(TR)
      .style("fill", "none")
      .style("stroke", "#000")
      .attr("stroke-width", BRANCH_WIDTH)
      .each(function(d) { d.target.linkNode = this; })
      .attr("d", function(d) {
        return LAYOUT_STATE == LAYOUT_CIRCLE ? linkCircle(d) : rectangle_link(d, the_x, the_y);
      })
      .attr("stroke", function(d) { return d.target.color; });
  }

  function adjust_tree()
  {
    // if (LAYOUT_STATE == LAYOUT_STRAIGHT) {
    //   resize_svg_straight_layout("svg-tree", "apple-chart");
    //
    // }
    resize_svg_straight_layout("svg-tree", "apple-chart");
  }

  function update_and_draw(draw_fn)
  {
    update_form_constants();
    draw_fn();
    add_scale_bar();
    adjust_tree();
  }

  // Similar to draw_tree but meant to be called by a listener that doesn't need to recalculate the hierarchy and replace the svg and g chart as well.
  function redraw_tree()
  {
    update_form_constants();
    draw_inner_dots();
    draw_leaf_dots();
    draw_inner_labels();
    draw_leaf_labels();
    draw_link_extensions();
    draw_links();
    add_scale_bar();

    adjust_tree();
  }

  // For redrawing tree even when you need to recalculate hierarchy and merge svg and g chart.
  function set_up_and_redraw()
  {
    update_form_constants();

    set_up_hierarchy();

    draw_svg();
    draw_chart();

    draw_inner_dots();
    draw_leaf_dots();
    draw_inner_labels();
    draw_leaf_labels();
    draw_link_extensions();
    draw_links();
    add_scale_bar();

    adjust_tree();

  }

  // A magical function
  function draw_tree()
  {
    clear_elem("svg-tree");
    console.log("drawing");

    update_form_constants();

    set_up_hierarchy();

    draw_svg();
    draw_chart();

    chart.append("g").attr("id", "inner-dots-container");
    draw_inner_dots();

    chart.append("g").attr("id", "leaf-dots-container");
    draw_leaf_dots();

    chart.append("g").attr("id", "inner-label-container");
    draw_inner_labels();

    chart.append("g").attr("id", "leaf-label-container");
    draw_leaf_labels();

    chart.append("g").attr("id", "link-extension-container");
    draw_link_extensions();

    chart.append("g").attr("id", "link-container");
    draw_links();

    add_scale_bar();

    // Adjust the svg size to fit the rotated chart.  Needs to be done down here as we need the bounding box.
    adjust_tree();
  }

  function text_x_offset(d)
  {
    // TODO replace these with function params
    // var test = TREE_ROTATION == ROTATED ? d[the_x] < 180 : (d[the_x] < 90 || d[the_x] > 270);

    if (LAYOUT_STATE == LAYOUT_CIRCLE) { // circular
      return circular_label_flipping_test(d[the_x]) ? "0.6em" : "-0.6em";
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
    if (LAYOUT_STATE == LAYOUT_CIRCLE) { // circular
      return "0.2em"  // center the label on the branch;
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

    return "M " + start_point +  " L" + end_point;
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
    d.radius = (y0 += d.data.length) * k;
    if (d.children) d.children.forEach(function(d) { setRadius(d, y0, k); });
  }

// Compute the maximum cumulative length of any node in the tree.
  function maxLength(d) {
    return d.data.length + (d.children ? d3.max(d.children, maxLength) : 0);
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

// function resize_svg(svg_id, chart_id)
// {
//   console.log("adjusting with resize_svg");
//
//   var the_chart = document.getElementById(chart_id);
//   var the_svg = document.getElementById(svg_id);
//
//   // For some reason, this does not match the bbox that you get when you select it in the console after adjusting? Is it because the new one reflects the new place in the svg?
//   var chart_bbox = the_chart.getBBox();
//
//   // Set actual width and height of the chart to that of the bounding box so we can center it properly since the translation is based of off the elem width and height and not based on the width and height of the bounding box.
//   the_chart.setAttribute("width", chart_bbox.width);
//   the_chart.setAttribute("height", chart_bbox.height);
//
//   var new_svg_height, new_svg_width;
//
//   var chart_bbox_width_padding = chart_bbox.width * padding;
//   var chart_bbox_height_padding = chart_bbox.height * padding;
//
//   new_svg_width  = chart_bbox.width  + (2 * chart_bbox_width_padding);
//   new_svg_height = chart_bbox.height + (2 * chart_bbox_height_padding);
//
//   var g_chart_translation = "translate(" +
//     // Need to subtract off the bounding box x and y as that is the true start position of the g chart.
//     // TODO sometimes the bbox x and y values are negative
//     (chart_bbox_width_padding - chart_bbox.x) + " " +
//     (chart_bbox_height_padding- chart_bbox.y) + ")";
//     // ((new_svg_width * padding / 2) - chart_bbox.x) + " " +
//     // ((new_svg_height * padding / 2) - chart_bbox.y) + ")";
//
//   the_svg.setAttribute("width", new_svg_width);
//   the_svg.setAttribute("height", new_svg_height);
//
//   the_chart.setAttribute("transform", g_chart_translation);
// }

function resize_svg_circle_layout(svg_id, chart_id)
{
  // START HERE
}

function resize_svg_straight_layout(svg_id, chart_id)
{
  console.log("adjusting with resize_svg_straight_layout");
  
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
  
  if (LAYOUT_STATE == LAYOUT_STRAIGHT && TREE_ROTATION == ROTATED) {
    console.log("adjust layout staight rotated");

    new_svg_height = chart_bbox.width + (2 * chart_bbox_width_padding);
    new_svg_width  = chart_bbox.height + (2 * chart_bbox_height_padding);

    g_chart_transform = "rotate(270) translate("  +
      -(new_svg_height + chart_bbox.x - chart_bbox_width_padding) + " " +
      chart_bbox_height_padding + ")";

  } else if (LAYOUT_STATE == LAYOUT_STRAIGHT) {
    console.log("adjust layout staight not rotated");
    new_svg_width = chart_bbox.width + (2 * chart_bbox_width_padding);
    new_svg_height  = chart_bbox.height + (2 * chart_bbox_height_padding);

    g_chart_transform = "rotate(0) translate(" +
      // TODO sometimes the bbox x and y values are negative
      (chart_bbox_width_padding - chart_bbox.x) + " " +
      (chart_bbox_height_padding- chart_bbox.y) + ")";
  } else if (LAYOUT_STATE == LAYOUT_CIRCLE) {
    console.log("adjust circle");


    var radius = chart_bbox.width > chart_bbox.height ? chart_bbox.width / 2: chart_bbox.height / 2;
    var diameter = radius * 2;
    var padding_px = diameter * padding;

    // This is actually the length of the diagonal plus padding.
    var diameter_with_padding = Math.sqrt(Math.pow(diameter, 2) * 2) + (padding_px * 2);

    // var rotation_mod = TREE_ROTATION % 90;
    // var theta_mod = rotation_mod * Math.PI / 180;
    //
    // var angle_adjusted_radius = rotation_mod < 45 ? radius / Math.abs(Math.cos(theta_mod)) : radius / Math.abs(Math.sin(theta_mod));
    //
    // console.log(radius + " " + rotation_mod + " " + theta_mod + " " + angle_adjusted_radius);
    //
    // var diameter = 2 * angle_adjusted_radius;
    //
    // // TODO the diameter needs to take into account the bounding box x and y adjustment.
    //
    // var max_offset = Math.abs(chart_bbox.x) > Math.abs(chart_bbox.y) ? Math.abs(chart_bbox.x) : Math.abs(chart_bbox.y);
    //
    // var new_svg_diameter_no_padding = diameter > (max_offset * 2) ? diameter : (max_offset * 2);
    // var new_svg_diameter_with_padding = new_svg_diameter_no_padding + (new_svg_diameter_no_padding * padding);
    //
    // g_chart_rotation = "rotate(" + TREE_ROTATION + " " +
    //   (new_svg_diameter_with_padding / 2) + " " + (new_svg_diameter_with_padding / 2) + ")";

    // g_chart_translation = "translate(" +
    //   (new_svg_diameter_with_padding / 2) + " " +
    //   (new_svg_diameter_with_padding / 2) + ")";

    // TODO combine these two translations.
    // g_chart_translation = "translate(" +
    //   Math.abs(chart_bbox.x) + " " +
    //   Math.abs(chart_bbox.y) + ")";

    // var pad_offset = new_svg_diameter_no_padding * padding / 2;
    // console.log("bob")
    // if (chart_bbox.width > chart_bbox.height) {
    //   g_chart_translation = "translate(" +
    //     (Math.abs(chart_bbox.x) + pad_offset) + " " +
    //     (Math.abs(chart_bbox.y) + ((chart_bbox.width - chart_bbox.height ) / 2) + pad_offset) + ")";
    // } else {
    //   g_chart_translation = "translate(" +
    //     (Math.abs(chart_bbox.x) + ((chart_bbox.height - chart_bbox.width + (new_svg_diameter_no_padding * padding)) / 2) + pad_offset) + " " +
    //     (Math.abs(chart_bbox.y) + pad_offset) + ")";
    // }

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

function add_scale_bar()
{
  d3.select("#scale-bar-container").remove();

  if (SHOW_SCALE_BAR) {
    var lengths;
    var mean_length;

    var SCALE_BAR_PADDING = 50; // in pixels
    var SCALE_BAR_TEXT_PADDING = 5;

    console.log("tree branch style: " + TREE_BRANCH_STYLE);

    var first_link = root.links()[0];
    var pixels_per_unit_length;

    if (TREE_BRANCH_STYLE == TREE_BRANCH_NORMAL) {
      console.log("normal");
      lengths = root.descendants().map(function(d) { return d.data.length });
      pixels_per_unit_length = (first_link.target.radius - first_link.source.radius) / first_link.target.data.length;

    } else {
      console.log("clado");
      // TODO when tree is a cladogram, need to make the branch label reflect the depth rather than the radius (true length).
      lengths = root.descendants().map(function(d) { return d.height });

      // The source height will be higher than the target height as the leaf nodes have a height of 0 and internal nodes add 1 for each speciation event.
      pixels_per_unit_length = (first_link.target.y - first_link.source.y) / (first_link.source.height - first_link.target.height);
    }

    var rotated_rectangle = LAYOUT_STATE == LAYOUT_STRAIGHT && TREE_ROTATION == ROTATED;
    mean_length = ary_mean(lengths);

    var scale_bar_pixels = mean_length * pixels_per_unit_length;

    var label_x, label_y;

    // New where to add it?
    var chart_bbox = document.getElementById("apple-chart").getBBox();

    // TODO not quite centered, take into account bounding box? Or center on svg?

    var path_d = "M 250 250 L 350 350";
    if (LAYOUT_STATE == LAYOUT_STRAIGHT && TREE_ROTATION == NOT_ROTATED) {
      var start_x = ((chart_bbox.width - scale_bar_pixels) / 2) + chart_bbox.x;

      path_d = "M " + start_x + " " + (chart_bbox.height + SCALE_BAR_PADDING) +
        " L " + (start_x + scale_bar_pixels) + " " + (chart_bbox.height + SCALE_BAR_PADDING);

      label_x = start_x + (scale_bar_pixels / 2);
      label_y = (chart_bbox.height + SCALE_BAR_PADDING) + SCALE_BAR_TEXT_PADDING;
    } else {
    //   var start_y = ((chart_bbox.height - scale_bar_pixels) / 2) + chart_bbox.y;
    //
    //   path_d = "M " + (-SCALE_BAR_PADDING) + " " + start_y + " L " + (-SCALE_BAR_PADDING) + " " + (start_y + scale_bar_pixels);
    //
    //   label_x = -SCALE_BAR_PADDING - SCALE_BAR_TEXT_PADDING;
    //   label_y = start_y + (scale_bar_pixels / 2);
      var start_x = chart_bbox.x - SCALE_BAR_PADDING - (scale_bar_pixels / 2);

      path_d = "M " + start_x + " " + (chart_bbox.height / 2) +
        " L " + (start_x + scale_bar_pixels) + " " + (chart_bbox.height / 2);

      label_x = start_x + (scale_bar_pixels / 2);
      label_y = (chart_bbox.height / 2) + SCALE_BAR_TEXT_PADDING;

    }

    var container = d3.select("#apple-chart")
      .append("g")
      .attr("id", "scale-bar-container");

    container.append("path")
      .attr("id", "scale-bar")
      .attr("stroke", "blue")
      .attr("stroke-width", 5)
      .attr("d", path_d);

    container.append("text")
      .attr("id", "scale-bar-text")
      .attr("alignment-baseline", "hanging")
      .attr("text-anchor", "middle")
      .attr("x", label_x)
      .attr("y", label_y)
      .text(round_to(mean_length, 100));

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
  d3.select("#svg-tree").append("circle").attr("r", 0).transition().style("fill", "green").attr("r", 10).attr("cx", x).attr("cy", y).attr("class", "delete-me");
}

function delete_circles()
{
  d3.select("circle.delete-me").transition().attr("r", 0).remove();
}

function rot(p) { return pt(p.y, -p.x); }
function pt(x, y) { return { "x" : x, "y" : y } }
