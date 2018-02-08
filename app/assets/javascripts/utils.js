function utils__clear_elem(id) {
  chart_elem = document.getElementById(id);

  // Clear the elem if it is there
  if (chart_elem) {
    chart_elem.parentNode.removeChild(chart_elem);
  }
}

// These functions deal with telling the user the status of the tree rendering.
function utils__upload_tree_first()
{
  d3.select("#load-tree-first-message").remove();

  d3.select("#options-panel")
    .append("div")
    .attr("class", "row")
    .append("p")
    .attr("id", "load-tree-first-message")
    .html("Upload a tree first!");
}
function utils__set_status_msg_to_rendering()
{
  jq("status-msg").html("Rendering tree!  Please wait....");
}
function utils__set_status_msg_to_done()
{
  jq("status-msg").html("Here is your tree!");
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

  } else {
    lalala(tree_file, mapping_file);
  }
}
