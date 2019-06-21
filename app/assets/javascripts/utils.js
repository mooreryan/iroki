function utils__clear_elem(id) {
  var chart_elem = document.getElementById(id);

  // Clear the elem if it is there
  if (chart_elem) {
    chart_elem.parentNode.removeChild(chart_elem);
  }
}

// These functions deal with telling the user the status of the tree rendering.
function utils__upload_tree_first() {
  d3.select("#load-tree-first-message").remove();

  d3.select("#options-panel")
    .append("div")
    .attr("class", "row")
    .append("p")
    .attr("id", "load-tree-first-message")
    .html("Upload a tree first!");
}

function utils__set_status_msg_to_rendering() {
  jq("status-msg")
    .html("Rendering tree!  Please wait....")
    .addClass("blink");

  // Also change the submit button text to rendering msg
  jq("submit")
    .prop("disabled", true)
    .val("Rendering...")
    .addClass("blink");
}

function utils__set_status_msg_to_done() {
  jq("status-msg")
    .html("Here is your tree!")
    .removeClass("blink");

  jq("submit")
    .prop("disabled", false)
    .val("Submit!")
    .removeClass("blink");
}

function utils__set_status_msg_to_error() {
  jq("status-msg").html("There was an error parsing your tree!");
}

// load dataset.  This function is called right on the viewer.html.slim page.
function utils__load_dataset(tree_file, mapping_file) {
  d3.select("#load-tree-first-message").remove();
  document.getElementById("options-panel").appendChild(OPTIONS_DIV);

  // Set the accordion to on
  new Foundation.Accordion(jq(ID_OPTIONS_ACCORDION), {});

  var bad = is_bad_newick(tree_file);
  if (bad) {
    alert("ERROR -- check your Newick file.  The format looks wrong.");

    utils__set_status_msg_to_done();
    // d3.select("#loading-message").remove();
    utils__clear_elem("options-div");
    utils__upload_tree_first();

  }
  else {
    lalala(tree_file, mapping_file);
  }
}


// Some functions for dealing with arrays or vectors.

function utils__ary_min_max(ary) {
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

  return { min : min, max : max };
}


// Center an array of numbers by subtracting the mean from each value.
function utils__vec_center(vec) {
  var total = sum(vec);
  var mean  = total / vec.length;

  return vec.map(function (val) {
    return val - mean;
  });
}

// Input is a LALOLib vector.
function utils__vec_scale_0_to_1(vec) {
  var abs_col_min = Math.abs(fn.ary.min(vec));

  // TODO take abs value of max as well in case it is a negative number?
  var col_max = fn.ary.max(vec);
  var col_min = fn.ary.min(vec);

  if (col_min === col_max) {
    // All the numbers in the original are the same, so just set it to 0.5
    return vec.map(function (val) {
      return 0.5
    });
  }
  else {
    return vec.map(function (val) {
      return (val + abs_col_min) / (col_max + abs_col_min);
    });
  }
}


// Functions for dealing with points.
function utils__pt(x, y) {
  return { "x" : x, "y" : y }
}

function utils__rot(p) {
  return utils__pt(p.y, -p.x);
}


// Some D3 helpers for debugging

function utils__add_circle(x, y) {
  d3.select("#svg-tree").append("circle").attr("r", 0).transition().attr("fill", "green").attr("r", 10).attr("cx", x).attr("cy", y).attr("class", "delete-me");
}

function utils__delete_circles() {
  d3.select("circle.delete-me").transition().attr("r", 0).remove();
}

