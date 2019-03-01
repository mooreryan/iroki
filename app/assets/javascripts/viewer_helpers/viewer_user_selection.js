// Selection helpers

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

