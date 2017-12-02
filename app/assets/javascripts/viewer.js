// Copyright 2011 Jason Davies https://github.com/jasondavies/newick.js
function parseNewick(a){for(var e=[],r={},s=a.split(/\s*(;|\(|\)|,|:)\s*/),t=0;t<s.length;t++){var n=s[t];switch(n){case"(":var c={};r.branchset=[c],e.push(r),r=c;break;case",":var c={};e[e.length-1].branchset.push(c),r=c;break;case")":r=e.pop();break;case":":break;default:var h=s[t-1];")"==h||"("==h||","==h?r.name=n:":"==h&&(r.length=parseFloat(n))}}return r}

function clear_elem(id) {
  chart_elem = document.getElementById(id);

  // Clear the elem if it is there
  if (chart_elem) {
    chart_elem.parentNode.removeChild(chart_elem);
  }
}

// load dataset and create table
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

// The mega function
function lalala(tree_input) {
  draw_tree2();



  // Everything from here down is for draw_tree2

  function get_int(id) {
    return parseInt(document.getElementById(id).value);
  }

  function get_value(id) {
    return document.getElementById(id).value;
  }

  function set_distance_from_root(d, y0, k) {
    d["distance_from_root"] = (y0 += d.data.length) * k;
    if (d.children) d.children.forEach(function (d) {
      set_distance_from_root(d, y0, k);
    });
  }

// Compute the maximum cumulative length of any node in the tree.
  function maxLength(d) {
    return d.data.length + (d.children ? d3.max(d.children, maxLength) : 0);
  }

  function source_is_root(d) {
    return d.source.parent ? false : true;
  }

  function circle_link(d) {
    if (source_is_root(d)) {
      return straight_link(d);
    } else {
      // TODO replace these centers and the r_adjust
      var center_x = 200;
      var center_y = 200;
      var r_adjust = 1.75;

      var source_radius = Math.sqrt(Math.pow(center_x - d.source[the_x], 2) + Math.pow(center_y - d.source[the_y], 2));

      var angle_between = d.source.theta - d.target.theta;
      // var angle_between = Math.atan2(d.source[the_y] - d.target[the_y], d.source[the_x] - d.target[the_x]);
      var pos_neg = angle_between < 0 ? "0" : "1"; // then clockwise, eles counter clockwise
      var large_small = "0";

      console.log("lala");
      console.log("source: " + d.source.data.name + " precalc r: " + d.source.clado_radius + " source radius: " + source_radius + " theta: " + d.source.theta +
        " angle between: " + angle_between);
      console.log(d.target.data.name + " " + d.target.theta);
      console.log("jawn x: " + ((source_radius * Math.cos(angle_between)) + center_x));
      console.log("jawn y: " + ((source_radius * Math.sin(angle_between)) + center_y));


      return "M " + d.source[the_x] + " " + d.source[the_y] +
        "A " + source_radius + " " + source_radius + " 0 " + large_small + " " + pos_neg + " " +
        ((source_radius * Math.cos(angle_between > 0 ? angle_between : -angle_between)) + center_x) + " " +
        ((source_radius * Math.sin(angle_between < 0 ? angle_between : -angle_between)) + center_y) +
        // d.source.clado_radius * Math.cos(angle_between) + center_x + " " +
        // d.source.clado_radius * Math.sin(angle_between) + center_y +
        // d.target[the_x] + " " + d.target[the_y] +
        " L "  + d.target[the_x] + " " + d.target[the_y] ;
      //

      // console.log("lala");
      // console.log(d.source.data.name + " " + d.source.clado_radius + " " + d.source.theta);
      // console.log(d.target.data.name + " " + d.target.clado_radius + " " + d.target.theta);
      //
      // return "M " + d.source[the_x] + " " + d.source[the_y] +
      //   "L " + //+ d.source.clado_radius + " " + d.source.clado_radius + " 0 1 0 " +
      //   d.source.clado_radius * Math.cos(d.target.theta) + center_x + " " +
      //   d.source.clado_radius * Math.sin(d.target.theta) + center_y +
      //   " L " + d.target[the_x] + " " + d.target[the_y];
    }
  }

  function straight_link(d) {
    return "M " + d.source[the_x] + " " + d.source[the_y] + " L " + d.target[the_x] + " " + d.target[the_y];
  }

  function rectangle_link(d) {
    var start_point, mid_point, end_point;

    start_point = d.source[the_x] + " " + d.source[the_y]
    end_point = d.target[the_x] + " " + d.target[the_y]

    // Only side to side is an option
    mid_point = d.source[the_x] + " " + d.target[the_y];

    // if (document.getElementById("up-and-down").selected) {
    //   mid_point = d.target[the_x] + " " + d.source[the_y];
    // } else {
    //   mid_point = d.source[the_x] + " " + d.target[the_y];
    // }

    return "M " + start_point + " L " + mid_point + " L " + end_point;
  }

// Keep labels from running into the branches
  function label_offset_vertical() {
    var is_side_to_side = true; // document.getElementById("side-to-side").selected

    var side_to_side_offset = Math.floor(label_size / 3);
    var up_and_down_offset = label_size;

    return is_side_to_side ? side_to_side_offset : up_and_down_offset;
  }

  function label_offset_horizontal() {
    var is_side_to_side = true; // document.getElementById("side-to-side").selected

    var side_to_side_offset = Math.floor(label_size / 2);
    var up_and_down_offset = 0;

    return is_side_to_side ? side_to_side_offset : up_and_down_offset;
  }

  function theta(x, xmin, xmax)
  {
    var theta = 2 * Math.PI * ((parseFloat(x) - parseFloat(xmin)) / parseFloat(xmax));

    return theta;
  }

  function new_x_and_y(x, y, xmin, xmax)
  {
    var r_adjust = 1.75;

    // TODO replace these centers
    var center_x = 200;
    var center_y = 200;
    var radius = parseFloat(y) / r_adjust;
    var t = theta(x, xmin, xmax);

    var new_x = radius * Math.cos(t) + center_x;
    var new_y = radius * Math.sin(t) + center_y;

    console.log("calculating --- radius: " + radius + " theta: " + t + " orig x: " + x + " orig y: " + y);

    return { "x" : new_x, "y" : new_y, "theta" : t,  "radius" : radius };

  }

  function add_polar_coords(root) {
    // Need to temporarily change the_x and the_y back into their rectangle forms
    // var clado_x = "y";
    // var normalo_x = "distance_from_root";
    // var tmp_y = "x"; // variable name y direction is always like distance from the root

    var clado_y = "y";
    var normalo_y = "distance_from_root";
    var tmp_x = "x";

    var clado_xmin = 9999999;
    var clado_xmax = -1;

    var normalo_xmin = 9999999;
    var normalo_xmax = -1;

    var xmin = 999999;
    var xmax = -1;

    root.each(function(d) {
      if (parseFloat(d[tmp_x]) < parseFloat(xmin)) { xmin = d[tmp_x]; }
      if (parseFloat(d[tmp_x]) > parseFloat(xmax)) { xmax = d[tmp_x]; }
      //
      // if (parseFloat(d[normalo_x]) < parseFloat(normalo_xmin)) { normalo_xmin = d[normalo_x]; }
      // if (parseFloat(d[normalo_x]) > parseFloat(normalo_xmax)) { normalo_xmax = d[normalo_x]; }
    });

    root.each(function(d) {
      var clado_coords = new_x_and_y(d[tmp_x], d[clado_y], xmin, xmax);

      d.clado_pol_x = clado_coords.x;
      d.clado_pol_y = clado_coords.y;

      // theta will be the same regardless of clado or normalo. It is only based on the x.
      d.theta = clado_coords.theta;
      d.clado_radius = clado_coords.radius;

      var normalo_coords = new_x_and_y(d[tmp_x], d[normalo_y], xmin, xmax);

      d.normalo_pol_x = normalo_coords.x;
      d.normalo_pol_y = normalo_coords.y;
      d.normalo_radius = normalo_coords.radius;

      console.log(
        " --- normalo_pol_x: " + d.normalo_pol_x + " normalo_pol_y: " + d.normalo_pol_y);
      // console.log("clado_pol_x: " + d.clado_pol_x + " clado_pol_y: " + d.clado_pol_y +
      //   " --- normalo_pol_x: " + d.normalo_pol_x + " normalo_pol_y: " + d.normalo_pol_y);

    });
  }


// One listener to rule them all
  d3.select("#tree-form").on("change", draw_tree2);

// Size options for the svg
  var svg_height, svg_width, height_padding, width_padding;
// The fake x and y for the g elem inside the svg (holds the chart). Regardless of orientation, 'x' values are for
// spacing out labels and 'y' values are for showing distances from the root.
  var g_y_size, g_x_size;

// Tree options
  var tree_shape, tree_style, tree_direction, tree_sort;

// These control the direction
  var the_x, the_y;

// Branch options
  var branch_shape, branch_width;

// Label options
  var label_size, label_show, label_opacity;

// Tree elements
  var svg, chart, cluster, root, links, circles, labels;

// Link types
  var link_function;

  function draw_tree2() {
    console.log("calling draw_tree2()");
    clear_elem("svg-tree");

    /* Get the values of all sliders and stuff */

    // Size sliders
    svg_height = get_int("svg-height");
    svg_width = get_int("svg-width");

    height_padding = parseFloat(document.getElementById("height-padding").value); // a num from 0 to 1
    width_padding  = parseFloat(document.getElementById("width-padding").value); // a num from 0 to 1

    // Tree options
    tree_shape = get_value("tree-shape"); // circle or rectangle
    tree_style = get_value("tree-branch-style"); // normal or cladogram
    // tree_direction = get_value("tree-direction");
    tree_sort = get_value("tree-sort");

    // Branch options
    branch_shape = get_value("branch-shape");
    branch_width = get_value("branch-width");

    // Label options
    label_size = get_value("label-size");
    label_show = document.getElementById("label-show").checked;

    label_opacity = label_show ? "1" : "0";



    g_x_size  = svg_height - (svg_height * height_padding);
    g_y_size = svg_width - (svg_width * width_padding);

    console.log("gx: " + g_x_size + ". gy: " + g_y_size + ". svg_width: " + svg_width + ". svg_height: " + svg_height);

    // Set attributes
    d3.selectAll("text").attr("opacity", label_opacity);

    // Set the link function
    link_function = document.getElementById("rectangle-type").selected ? rectangle_link : straight_link;
    // link_function = circle_link;

    svg = d3.select("#tree-div")
      .append("svg")
      .attr("width", svg_width)
      .attr("height", svg_height)
      .attr("id", "svg-tree")
      .style("background-color", "white"); // TODO make bg color an option

    chart = svg.append("g")
      .attr("id", "apple-chart")
      .attr("width", g_x_size)
      .attr("height", g_y_size)
      // Center the g elem in the svg
      .attr("transform", "translate(" + (svg_width * width_padding / 2) + "," + (svg_height * height_padding / 2) + ")")

    cluster = d3.cluster() // this adds the x and y attrs
      .size([g_x_size, g_y_size])
      .separation(function (a, b) {
        return 1;
      }); // TODO this doesn't seem to do anything

    // Sort and make the hierarchy
    root = d3.hierarchy(parseNewick(tree_input), function (d) {
      return d.branchset;
    })
    // TODO add sort options
      .sort(function (a, b) {
        return (a.value - b.value) || d3.ascending(a.data.length, b.data.length);
      });

    // Do the lala clustering
    cluster(root);
    // set_distance_from_root(root, root.data.length = 0, 1); //g_y_size / maxLength(root));
    set_distance_from_root(root, root.data.length = 0, g_y_size / maxLength(root));
    add_polar_coords(root);

    ryan = root;

    // Set x and y.  Controls the direction, cladogram style, circle style, etc.
    // Needs to be done right after setting polar coords as that will change it to rectangle types.
    if (document.getElementById("rectangular-tree").selected) {
      the_x = document.getElementById("cladogram").selected ? "y" : "distance_from_root"; //
      the_y = "x"; // y direction is always like distance from the root
    } else if (document.getElementById("circular-tree").selected) {
      the_x = document.getElementById("cladogram").selected ? "clado_pol_y" : "normalo_pol_y";
      the_y = document.getElementById("cladogram").selected ? "clado_pol_x" : "normalo_pol_x";
    } else { // Radial
      // TODO
    }


    // Enter links
    links = chart.append("g")
      .attr("class", "links")
      .selectAll("path")
      .data(root.links())
      .enter().append("path")
      .attr("stroke-width", function () {
        return branch_width + "px";
      })
      .style("stroke", "black") // TODO make branch color an option
      .attr("d", link_function); // draws the proper type of link

    // TODO Enter circles
    circles = chart.append("g")
      .attr("class", "circles")
      .selectAll("circle")
      .data(root.links()) // just links to leaves
      .enter().append("circle")
      .attr("r", 5)
      .attr("cx", function(d) { return d.source[the_x]; } )
      .attr("cy", function(d) { return d.source[the_y]; } )
      .style("fill", "black");

    chart.append("g")
      .attr("class", "circles")
      .selectAll("circle")
      .data(root.leaves())
      .enter().append("circle")
      .attr("r", 5)
      .attr("cx", function(d) { return d[the_x]; })
      .attr("cy", function(d) { return d[the_y]; })
      .style("fill", "blue");

    labels = chart.append("g")
      .attr("class", "labels")
      .selectAll("text")
      .data(root.leaves())
      .enter().append("text")
      .attr("class", "leaf-labels")
      .attr("dx", function (d) {
        return d[the_x] + label_offset_horizontal();
      })
      .attr("dy", function (d) {
        return d[the_y] + label_offset_vertical();
      })
      .attr("text-anchor", "left")
      .attr("font-size", label_size + "px")
      .text(function (d) {
        return d.data.name;
      })

    // TODO add scale bar
  }
}
var ryan;
function foo()
{
  d3.select("#apple-chart").append("circle").attr("cx", "200").attr("cy", "200").style("fill-opacity", "0.0").style("stroke", "orange").style("stroke-width", 2).attr("r", "66"); d3.select("#apple-chart").append("circle").attr("cx", "200").attr("cy", "200").style("fill-opacity", "0.0").style("stroke", "orange").style("stroke-width", 2).attr("r", "133"); d3.select("#apple-chart").append("circle").attr("cx", "200").attr("cy", "200").style("fill-opacity", "0.0").style("stroke", "orange").style("stroke-width", 2).attr("r", "200")
}