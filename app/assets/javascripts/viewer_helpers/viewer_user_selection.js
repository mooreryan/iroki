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

function handle_label_click(d) {
  // Only works if you alt
  if (d3.event.altKey && global.pressed_keys.e) {
    handle_edit_label(d, $(this));
  }
  else if (d3.event.altKey) {
    d.is_selected = !d.is_selected;

    // First select the node.
    var sel = d3.select(this);

    // Then toggle the clicked-label class on or off depending if it is already toggled.
    sel.classed("selected-label", !sel.classed("selected-label"));

    select_branches();
  }
}

function handle_svg_doubleclick(node) {
  // Only works if you alt
  if (d3.event.altKey) {
    redraw_tree();
  }
}

// Depending on the label, it may go right off the screen in which case it would be good to redraw the tree.
function handle_edit_label(node, elem) {
  var input_id = "new-label-text";
  var old_msg = $("#status-msg");

  old_msg.remove();

  // Don't draw multiple input boxes.
  if (jq(input_id).length === 0) {
    $("#status-msg-container").append('<input id="new-label-text" class="blink" type="text" placeholder="Edit label!" style="margin-top: 1em;">');

    jq(input_id).focus(function () {
      jq(input_id).removeClass("blink");
    });

    jq(input_id).change(function () {
      var val = jq(input_id).val();

      elem[0].innerHTML = val;

      node.data.name               = val;
      if (node.radial_layout_info) {
        node.radial_layout_info.name = val;
      }

      jq(input_id).remove();
      $("#status-msg-container").append(old_msg);
    });
  }
}