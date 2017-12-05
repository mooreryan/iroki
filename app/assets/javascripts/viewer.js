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
  console.log("about to call lalala()");
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


var LAYOUT_STATE, LAYOUT_CIRCLE, LAYOUT_STRAIGHT;
var the_x, the_y;
var SIZE, INNER_SIZE;
var OUTER_WIDTH, OUTER_HEIGHT, HEIGHT_PADDING, WIDTH_PADDING, INNER_WIDTH, INNER_HEIGHT;
var root, svg, chart, data, circles, labels, linkExtension, link;

var align_tip_labels;

// To hold temporary DOM elements
var elem;

// The mega function
function lalala(tree_input)
{

  console.log("first line of lalala()");
  // One listener to rule them all
  d3.select("#tree-form").on("change", function() { console.log("apple pie!"); draw_tree(); });

  draw_tree();

  var circle_cluster, rectangle_cluster;
  function is_leaf(d)
  {
    return d.value == 1;
  }

  function set_value_of(id, val)
  {
    var elem = document.getElementById(id);
    elem.value = val;
  }

  function draw_tree()
  {
    clear_elem("svg-tree");

    the_x = "x";
    the_y = "y";

    LAYOUT_CIRCLE = "circular-tree";
    LAYOUT_STRAIGHT = "rectangular-tree";
    LAYOUT_STATE = document.getElementById("tree-shape").value;
    console.log("at the start of draw_tree() layout_state is " + LAYOUT_STATE);

    align_tip_labels = 0;


    // SIZE   = 300;
    // INNER_SIZE = SIZE - 100;


    // Set the height to match the width
    if (LAYOUT_STATE == LAYOUT_CIRCLE) {
      // Disable the height slider
      elem = null;
      elem = document.getElementById("outer-height");
      elem.disabled = true;

      elem = null;
      elem = document.getElementById("height-padding");
      elem.disabled = true;

      document.getElementById("outer-height-label").classList.add("disabled-label");
      document.getElementById("height-padding-label").classList.add("disabled-label");

      OUTER_WIDTH  = parseInt(document.getElementById("outer-width").value);
      OUTER_HEIGHT = OUTER_WIDTH;

      WIDTH_PADDING = parseFloat(document.getElementById("width-padding").value);
      HEIGHT_PADDING = WIDTH_PADDING;

      set_value_of("outer-height", OUTER_WIDTH);
      set_value_of("height-padding", WIDTH_PADDING);
    } else {
      elem = null;
      elem = document.getElementById("outer-height");
      elem.disabled = false;

      elem = null;
      elem = document.getElementById("height-padding");
      elem.disabled = false;

      document.getElementById("outer-height-label").classList.remove("disabled-label");
      document.getElementById("height-padding-label").classList.remove("disabled-label");

      OUTER_WIDTH  = parseInt(document.getElementById("outer-width").value);
      OUTER_HEIGHT = parseInt(document.getElementById("outer-height").value);

      WIDTH_PADDING  = parseFloat(document.getElementById("width-padding").value);
      HEIGHT_PADDING = parseFloat(document.getElementById("height-padding").value);
    }

    INNER_WIDTH  = Math.round(OUTER_WIDTH * (1 - WIDTH_PADDING));
    INNER_HEIGHT = Math.round(OUTER_HEIGHT * (1 - HEIGHT_PADDING));


    console.log("first line of draw tree");

    // When setting size for circular layout, use width by convention, but they will be the same.
    circle_cluster = d3.cluster()
      .size([360, INNER_WIDTH])
      .separation(function(a, b) { return 1; });

    rectangle_cluster = d3.cluster()
      .size([INNER_WIDTH * 2, INNER_HEIGHT * 2])
      .separation(function(a, b) { return 1; });

    if (the_y == "y") {
      var button = document.getElementById("align-tip-labels");
      button.disabled = true;

      document.getElementById("align-tip-labels-label").classList.add("disabled-label");
    }

    root = d3.hierarchy(parseNewick(tree_input), function(d) { return d.branchset; })
      .sum(function(d) { return d.branchset ? 0 : 1; })
      .sort(function(a, b) { return (a.value - b.value) || d3.ascending(a.data.length, b.data.length); });

    if (LAYOUT_STATE == LAYOUT_CIRCLE) {
      circle_cluster(root);
      setRadius(root, root.data.length = 0, INNER_WIDTH / maxLength(root));

    } else if (LAYOUT_STATE == LAYOUT_STRAIGHT) {
      rectangle_cluster(root);
      // TODO should this be width or height
      setRadius(root, root.data.length = 0, (INNER_WIDTH*2) / maxLength(root));
    }

    svg = d3.select("#tree-div")
      .append("svg")
      .attr("width", OUTER_WIDTH * 2)
      .attr("height", OUTER_HEIGHT * 2)
      .attr("id", "svg-tree")
      .style("background-color", "white"); // TODO make bg color an option

    var chart_width, chart_height;
    var chart_transform_width, chart_transform_height;
    if (LAYOUT_STATE == LAYOUT_CIRCLE) {
      chart_width  = OUTER_WIDTH;
      chart_height = OUTER_HEIGHT;

      chart_transform_width  = OUTER_WIDTH;
      chart_transform_height = OUTER_HEIGHT;
    } else {
      chart_width  = INNER_WIDTH * 2;
      chart_height = INNER_HEIGHT * 2;

      chart_transform_width  = OUTER_WIDTH * WIDTH_PADDING;
      chart_transform_height = OUTER_HEIGHT * HEIGHT_PADDING;
    }
    chart = svg.append("g")
      .attr("width", chart_width)
      .attr("height", chart_height)
      .attr("transform",
        "translate(" + chart_transform_width + ", " + chart_transform_height + ")")
      .attr("id", "apple-chart");

    function pick_transform(d)
    {
      if (LAYOUT_STATE == LAYOUT_CIRCLE && is_leaf(d)) {
        return circle_transform(d, the_x, "y");
      } else if (LAYOUT_STATE == LAYOUT_CIRCLE) {
        return circle_transform(d, the_x, the_y);
      } else if (LAYOUT_STATE == LAYOUT_STRAIGHT && is_leaf(d)) {
        return rectangle_transform(d, the_x, "y");
      } else if (LAYOUT_STATE == LAYOUT_STRAIGHT) {
        return rectangle_transform(d, the_x, the_y);
      } else {
        // TODO handle radial layout
      }
    }
    circles = chart.append("g")
      .selectAll("circle")
      .data(root.descendants())
      .enter().append("circle")
      .attr("class", function(d) {
        return is_leaf(d) ? "leaf" : "inner";
      })
      .attr("r", 5)
      .attr("transform", function(d) {
        return pick_transform(d);
      })
      .style("fill", function(d) { return d.color; } )

    labels = chart.append("g")
      .selectAll("text")
      .data(root.descendants())
      .enter().append("text")
      .attr("class", function(d) {
        return is_leaf(d) ? "leaf" : "inner";
      })
      .attr("dy", text_y_offset)
      .attr("dx", text_x_offset)
      .attr("text-anchor", function(d) {
        return LAYOUT_STATE == LAYOUT_CIRCLE ? circular_text_anchor(d) : straight_text_anchor(d);
      })
      .attr("transform", function(d) {
        return pick_transform(d);
      })
      .text(function(d) { return d.data.name; })

    if (align_tip_labels) {
      // Draw the link extensions
      linkExtension = chart.append("g")
        .attr("class", "link-extensions")
        .attr("id", "qwfp")
        .selectAll("path")
        .data(root.links().filter(function (d) {
          return !d.target.children;
        }))
        .enter().append("path")
        .attr("class", "dotted-links")
        .each(function (d) {
          d.target.linkExtensionNode = this;
        })
        .attr("d", function (d) {
          return LAYOUT_STATE == LAYOUT_CIRCLE ? linkCircleExtension(d) : link_rectangle_extension(d, the_x, "y");
        });
    } else {
      d3.selectAll(".link-extensions").remove();
    }

    link = chart.append("g")
      .attr("class", "links")
      .selectAll("path")
      .data(root.links())
      .enter().append("path")
      .each(function(d) { d.target.linkNode = this; })
      .attr("d", function(d) {
        return LAYOUT_STATE == LAYOUT_CIRCLE ? linkCircle(d) : rectangle_link(d, the_x, the_y);
      })
      .attr("stroke", function(d) { return d.target.color; });

    // d3.select("#circle-or-not").on("click", function() { update_circles(true); });
    // d3.select("#the-y").on("click", function() {
    //   if (the_y == "y") {
    //     // Disable the align_tip_labels button
    //     var button = document.getElementById("align-tip-labels");
    //     button.disabled = !button.disabled;
    //     document.getElementById("align-tip-labels-label").classList.remove("disabled-label");
    //
    //
    //     the_y = "radius"; // normalogram
    //   } else {
    //     the_y = "y"; // cladogram
    //     align_tip_labels ^= 1;
    //     // Disable the align_tip_labels button
    //     var button = document.getElementById("align-tip-labels");
    //     button.disabled = !button.disabled;
    //     document.getElementById("align-tip-labels-label").classList.add("disabled-label");
    //   }
    //
    //   update_circles(false);
    // });
    //
    // d3.select("#align-tip-labels").on("click", function () {
    //   align_tip_labels ^= 1;
    //
    //   update_circles(false);
    // });

    // TODO merge this function in with draw_tree()
    // update_circles(true);
  }



  function text_x_offset(d)
  {
    if (LAYOUT_STATE == LAYOUT_CIRCLE) { // circular
      return d[the_x] < 90 || d[the_x] > 270 ? "0.6em" : "-0.6em";
    } else {
      return "0em";
    }
  }

  function text_y_offset(d)
  {
    if (LAYOUT_STATE == LAYOUT_CIRCLE) { // circular
      return "0.2em"  // center the label on the branch;
    } else {
      return "1.2em";
    }
  }

  function circular_text_anchor(d)
  {
    return d[the_x] < 90 || d[the_x] > 270 ? "start" : "end";
  }

  function straight_text_anchor(d)
  {
    return "middle";
  }

// These functions update the layout
  function circle_transform(d, x, y)
  {
    return "rotate(" + d[x] +
      ") translate(" + d[y] + ", 0)" +
      (d[x] < 90 || d[x] > 270 ? "" : "rotate(180)");
  }

  function rectangle_transform(d, x, y)
  {
    return "rotate(0) translate(" + d[x] + " " + d[y] + ")";
  }

  function straight_link(d) {
    return "M " + (d.source[the_x] - INNER_WIDTH) + " " + d.source[the_y] + " L " + (d.target[the_x] - INNER_HEIGHT) + " " + d.target[the_y];
  }

  function rectangle_link(d, x, y) {
    var start_point, mid_point, end_point;

    start_point = d.source[x] + " " + d.source[y];
    end_point   = d.target[x] + " " + d.target[y];

    // Only side to side is an option
    mid_point = d.target[x] + " " + d.source[y];

    // if (document.getElementById("up-and-down").selected) {
    //   mid_point = (d.target[the_x] - (INNER_WIDTH - INNER_WIDTH)) + " " + d.source[the_y];
    // } else {
    //   mid_point = (d.source[the_x] - (INNER_WIDTH - INNER_WIDTH)) + " " + d.target[the_y];
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

// TODO need an option for labels lined up on the radius or labels at
// the end of the links.
  function linkCircleExtension(d) {
    // the_y must be radius
    return linkStep(d.target[the_x], d.target[the_y], d.target[the_x], INNER_WIDTH);
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

