var canvas_viewer = {
  // In pixels
  canvas_height: 1000,
  canvas_width: 1000,

  tree_changed: false,

  // Tmp container for return values.
  ret_val: null,

  opts: {},

  sort_fn: null,


  // For html elem stuff
  html: {
    // Canvas stuff
    canvas_tree: {
      id: "canvas-tree"
    },
    canvas_tree_container: {
      id: "canvas-tree-container"
    },

    // Submitting & reseting
    file_uploader: {
      id: "file-uploader"
    },
    submit_button: {
      id: "submit"
    },
    reset_button: {
      id: "reset"
    },

    // Option buttons & sliders
    tree_layout: {
      id: "tree-shape"
    },
    tree_sort: {
      id: "tree-sort"
    },
    tree_rotation: {
      id: "tree-rotation"
    },
    tree_size: {
      id: "size"
    },
    tree_padding: {
      id: "padding"
    },

    // Other
    status_msg: {
      id: "status-msg"
    }
  },

  xy_range: null,
  helpers: {},
  const: {
    two_pi: 2 * Math.PI,
    zero_len_branch: 1e-10
  }
};

// Short hand
var cv = canvas_viewer;

cv.helpers.is_leaf = function (d) {
  return d.value === 1;
};

cv.helpers.is_inner = function (d) {
  return !cv.helpers.is_leaf(d);
};

cv.helpers.is_level_one_node = function (d) {
  return d.depth === 1;
};

cv.helpers.adjust = function (coord) {
  return Math.floor(coord * cv.opts.tree_size);
};

cv.helpers.default_opts = function () {
  return {
    show_branches: true,
    show_dots: false,
    show_text: false,

    // Tree layout opts
    tree_layout: "radial-tree",
    tree_sort: "descending",
    tree_rotation: 0,
    tree_size: 20,
    tree_padding: 50,
  };
};

cv.helpers.reset_opts = function () {
  cv.opts = cv.helpers.default_opts();
};

cv.helpers.clear_canvas = function () {
  utils__clear_elem(cv.html.canvas_tree.id);
  d3.select("#" + cv.html.canvas_tree_container.id)
    .append("canvas")
    .attr("id", cv.html.canvas_tree.id)
    .attr("height", cv.canvas_height)
    .attr("width", cv.canvas_width);
  // .style("background", "#f9ceff");
};

cv.helpers.sort_descending = function (a, b) {
  return (a.value - b.value) || d3.ascending(a.data.branch_length, b.data.branch_length);
};

cv.helpers.sort_ascending = function (a, b) {
  return (b.value - a.value) || d3.descending(a.data.branch_length, b.data.branch_length);
};

cv.helpers.sort_none = function (a, b) {
  return 0;
};

cv.helpers.set_sort_function = function () {
  var tree_sort_val = jq(cv.html.tree_sort.id).val();

  if (tree_sort_val === "ascending") {
    cv.sort_fn = cv.helpers.sort_ascending;
  }
  else if (tree_sort_val === "not-sorted") {
    cv.sort_fn = cv.helpers.sort_none;
  }
  else {
    cv.sort_fn = cv.helpers.sort_descending;
  }
};


cv.layout_radial = function radial_cluster(root) {
  var xy_range = {
    min_x: 999999,
    min_y: 999999,
    max_x: -999999,
    max_y: -999999
  };

  // Helpers
  function a_postorder_traversal(vertex) {
    if (cv.helpers.is_leaf(vertex)) { // if deg(vertex) == 1
      vertex.radial_layout_info.num_leaves_in_subtree = 1;
    }
    else {
      vertex.children.forEach(function (child) {
        a_postorder_traversal(child);
        vertex.radial_layout_info.num_leaves_in_subtree += child.radial_layout_info.num_leaves_in_subtree;
      });
    }
  }

  function a_preorder_traversal(vertex) {
    if (vertex !== root) {
      var parent = vertex.parent;


      var distance_to_parent = vertex.data.branch_length === 0 ? cv.helpers.zero_len_branch : vertex.data.branch_length;

      var x = parent.radial_layout_info.x + distance_to_parent * Math.cos(vertex.radial_layout_info.wedge_border + (vertex.radial_layout_info.wedge_size / 2));
      var y = parent.radial_layout_info.y + distance_to_parent * Math.sin(vertex.radial_layout_info.wedge_border + (vertex.radial_layout_info.wedge_size / 2));


      vertex.radial_layout_info.x        = x;
      vertex.radial_layout_info.y        = y;
      vertex.radial_layout_info.parent_x = parent.radial_layout_info.x;
      vertex.radial_layout_info.parent_y = parent.radial_layout_info.y;

      var silly_x  = Math.floor(vertex.radial_layout_info.x * cv.opts.tree_size);
      var silly_y  = Math.floor(vertex.radial_layout_info.y * cv.opts.tree_size);
      var silly_px = Math.floor(vertex.radial_layout_info.parent_x * cv.opts.tree_size);
      var silly_py = Math.floor(vertex.radial_layout_info.parent_y * cv.opts.tree_size);

      if (silly_x < xy_range.min_x) {
        xy_range.min_x = silly_x;
      }
      if (silly_x > xy_range.max_x) {
        xy_range.max_x = silly_x;
      }
      if (silly_y < xy_range.min_y) {
        xy_range.min_y = silly_y;
      }
      if (silly_y > xy_range.max_y) {
        xy_range.max_y = silly_y;
      }

      if (silly_px < xy_range.min_x) {
        xy_range.min_x = silly_px;
      }
      if (silly_px > xy_range.max_x) {
        xy_range.max_x = silly_px;
      }
      if (silly_py < xy_range.min_y) {
        xy_range.min_y = silly_py;
      }
      if (silly_py > xy_range.max_y) {
        xy_range.max_y = silly_py;
      }

    }

    var current_vertex_wedge_border = vertex.radial_layout_info.wedge_border;

    if (cv.helpers.is_inner(vertex)) { // leaves don't have a children attr
      vertex.children.forEach(function (child) {
        child.radial_layout_info.wedge_size   = (child.radial_layout_info.num_leaves_in_subtree / root.radial_layout_info.num_leaves_in_subtree) * 2 * Math.PI;
        child.radial_layout_info.wedge_border = current_vertex_wedge_border;
        current_vertex_wedge_border += child.radial_layout_info.wedge_size;
        a_preorder_traversal(child);
      });
    }
  }

  // Set defaults
  root.descendants().map(function (vertex) {
    if (vertex === root) {
      root.radial_layout_info = {
        "name": root.data.name,
        "x": 0,
        "y": 0,
        "num_leaves_in_subtree": 0,
        "wedge_size": 2 * Math.PI,
        "wedge_border": utils__deg_to_rad(cv.opts.tree_rotation)
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

  a_postorder_traversal(root);
  a_preorder_traversal(root);

  return xy_range;
};


cv.width_and_height = function (xy_range) {
  var width_high = xy_range.max_x + Math.abs(xy_range.min_x),
      width_low  = xy_range.min_x + Math.abs(xy_range.min_x);

  var height_high = xy_range.max_y + Math.abs(xy_range.min_y),
      height_low  = xy_range.min_y + Math.abs(xy_range.min_y);

  return {
    w: (width_high - width_low) + cv.opts.tree_padding,
    h: (height_high - height_low) + cv.opts.tree_padding
  };
};

cv.canvas_buffer = function (w, h) {
  var canvas = document.createElement("canvas");

  canvas.width  = w;
  canvas.height = h;

  if (canvas.getContext) {
    var context = canvas.getContext("2d");
  }
  else {
    throw Error("No getContext function.  Canvas won't work.");
  }

  return { canvas: canvas, context: context };
};

cv.main = function (tree_str, mapping_str) {

  function tr(val, min_val) {
    return Math.floor(val * cv.opts.tree_size + Math.abs(min_val) + (cv.opts.tree_padding / 2));
  }

  // Set the radius of each node by recursively summing and scaling the distance from the root.
  function set_radius(d, y0, k) {
    d.radius = (y0 += d.data.branch_length) * k;
    if (d.children) {
      d.children.forEach(function (d) {
        set_radius(d, y0, k);
      });
    }
  }

  // Compute the maximum cumulative length of any node in the tree.
  function max_length(d) {
    return d.data.branch_length + (d.children ? d3.max(d.children, max_length) : 0);
  }

  /**
   *
   * @param x the angle of the point (theta) in radians
   * @param y the radius (r)
   */
  function to_polar(x, y) {
    var theta = x,
        r     = y;
    return { x: r * Math.cos(theta) + LALA, y: r * Math.sin(theta) + LALA };
  }

  var parsed_newick = newick__parse(tree_str);

  // First set the sort function.
  cv.helpers.set_sort_function();
  // Then calculate the hierarchy.
  ROOT = d3.hierarchy(parsed_newick, function (d) {
    return d.branchset;
  })
           .sum(function (d) {
             return d.branchset ? 0 : 1;
           })
           .sort(cv.sort_fn);

  // This modifies root.
  cv.xy_range      = cv.layout_radial(ROOT);
  cv.ret_val       = cv.width_and_height(cv.xy_range);
  cv.canvas_width  = cv.ret_val.w;
  cv.canvas_height = cv.ret_val.h;

  cv.canvas_width  = 1000;
  cv.canvas_height = 1000;

  // set_radius(ROOT, ROOT.data.branch_length = 0, cv.canvas_height / max_length(ROOT));

  var buffer_background = cv.canvas_buffer(cv.canvas_width, cv.canvas_height);
  var buffer_branches   = cv.canvas_buffer(cv.canvas_width, cv.canvas_height);
  var buffer_leaves     = cv.canvas_buffer(cv.canvas_width, cv.canvas_height);
  var buffer_text       = cv.canvas_buffer(cv.canvas_width, cv.canvas_height);

  buffer_branches.context.beginPath();

  console.log(ROOT);
  var LALA           = 250;
  var circle_cluster = d3.cluster()
                         .size([2 * Math.PI, LALA])
                         .separation(function (a, b) {
                           return 1;
                         });
  circle_cluster(ROOT);
  set_radius(ROOT, ROOT.data.branch_length = 0, LALA / max_length(ROOT));


  var base = ROOT.descendants()[0];
  if (base.depth !== 0) {
    throw Error("This is not the base!");
  }
  var retval   = to_polar(base.x, base.y);
  var center_x = retval.x;
  var center_y = retval.y;

  // d.x is theta, and d.y is radius, which runs from 0 to LALA.
  ROOT.descendants().forEach(function (d) {
    var tree_rotation_radians = fn.math.degrees_to_radians(cv.opts.tree_rotation);

    var this_radius       = d.y;
    var this_theta        = d.x + tree_rotation_radians;
    var clockwise         = false;
    var counter_clockwise = true;

    var ret_val = to_polar(d.x + tree_rotation_radians, d.y);
    var x       = ret_val.x;
    var y       = ret_val.y;


    if (d.parent) {
      var parent_radius     = d.parent.y;
      var parent_theta      = d.parent.x + tree_rotation_radians;

      ret_val = to_polar(d.parent.x, d.parent.y);
      var px  = ret_val.x;
      var py  = ret_val.y;

      // Use this node's theta and the parent's radius.
      var drop_point = to_polar(d.x + tree_rotation_radians, d.parent.y);

      buffer_branches.context.moveTo(x, y);
      buffer_branches.context.lineTo(drop_point.x, drop_point.y);

      if (!cv.helpers.is_level_one_node(d)) {
        // buffer_branches.context.moveTo(center_x, center_y);

        if (this_theta < parent_theta) {
          buffer_branches.context.arc(center_x, center_y, parent_radius, this_theta, parent_theta, clockwise);
        }
        else {
          buffer_branches.context.arc(center_x, center_y, parent_radius, this_theta, parent_theta, counter_clockwise);

        }
      }
    }

    // console.log("name: " + d.data.name + ", x: " + d.x + ", y: " + d.y);
    // console.log("name: " + d.data.name + ", tx: " + x + ", ty: " + y);
    // buffer_branches.context.fillRect(x, y, 10, 10);
    // buffer_branches.context.fillText(d.data.name, x+5, y+5);
    buffer_branches.context.fillRect(x, y, 10, 10);
    buffer_branches.context.fillText(d.data.name, x + 5, y + 5);

  });


  // var data = ROOT.descendants().map(function (d) {
  //   return d.radial_layout_info;
  // });

  // This is for the radial layout.
  // data.forEach(function (d, i) {
  //   var x  = tr(d.x, cv.xy_range.min_x),
  //       px = tr(d.parent_x, cv.xy_range.min_x),
  //       y  = tr(d.y, cv.xy_range.min_y),
  //       py = tr(d.parent_y, cv.xy_range.min_y);
  //
  //   if (cv.helpers.is_leaf(d)) {
  //     // TODO draw dots
  //     // TODO draw text
  //   }
  //
  //   buffer_branches.context.moveTo(x, y);
  //   buffer_branches.context.lineTo(px, py);
  // });

  buffer_branches.context.stroke();

  buffer_background.context.fillStyle = "white";
  buffer_background.context.fillRect(0, 0, cv.canvas_width, cv.canvas_height);

  // Get the actual canvas image
  var canvas    = document.getElementById(cv.html.canvas_tree.id);
  canvas.width  = cv.canvas_width;
  canvas.height = cv.canvas_height;
  var context   = canvas.getContext("2d");

  // Copy the buffers on to the main image.
  context.drawImage(buffer_background.canvas, 0, 0);
  context.drawImage(buffer_branches.canvas, 0, 0);

  jq(cv.html.status_msg.id).html("Here is your tree!");
};

/**
 * This function is called on the page to get everything started.
 */
cv.upload_handler = function () {
  function upload_file(file_uploader, file_reader) {
    var file = file_uploader.files[0];
    if (file) {
      file_reader.readAsText(file);
    }
    else {
      alert("Don't forget to upload a file!");
    }
  }

  // First set default opts
  cv.helpers.reset_opts();

  var file_reader = new FileReader();

  var file_uploader = document.getElementById(cv.html.file_uploader.id);
  var submit_button = document.getElementById(cv.html.submit_button.id);
  var reset_button  = document.getElementById(cv.html.reset_button.id);

  // Tree layout options
  cv.html.tree_layout.elem   = document.getElementById(cv.html.tree_layout.id);
  cv.html.tree_sort.elem     = document.getElementById(cv.html.tree_sort.id);
  cv.html.tree_rotation.elem = document.getElementById(cv.html.tree_rotation.id);
  cv.html.tree_size.elem     = document.getElementById(cv.html.tree_size.id);
  cv.html.tree_padding.elem  = document.getElementById(cv.html.tree_padding.id);

  file_reader.onload = function (event) {
    var tree_str = event.target.result;
    cv.main(tree_str);
  };

  // Submitting and reseting
  file_uploader.addEventListener("change", function () {
    cv.tree_changed = true;
    undisable(cv.html.submit_button.id);
  });
  submit_button.addEventListener("click", function () {
    cv.tree_changed = false;

    jq(cv.html.status_msg.id).html("Rendering tree!  Please wait....");

    disable(cv.html.submit_button.id);

    // First clear the canvas so the background switching can be used to tell when the rendering is finished.
    cv.helpers.clear_canvas();
    upload_file(file_uploader, file_reader);
  });
  reset_button.addEventListener("click", function () {
    cv.tree_changed = false;
    cv.helpers.reset_opts();
    cv.helpers.clear_canvas();
    undisable(cv.html.submit_button.id);
  });

  // Tree layout options
  cv.html.tree_layout.elem.addEventListener("change", function () {
    cv.opts.tree_layout = jq(cv.html.tree_layout.id).val();
    undisable(cv.html.submit_button.id);
  });
  cv.html.tree_sort.elem.addEventListener("change", function () {
    cv.opts.tree_sort = jq(cv.html.tree_sort.id).val();
    undisable(cv.html.submit_button.id);
  });
  cv.html.tree_rotation.elem.addEventListener("change", function () {
    cv.opts.tree_rotation = parseInt(jq(cv.html.tree_rotation.id).val());
    undisable(cv.html.submit_button.id);
  });
  cv.html.tree_size.elem.addEventListener("change", function () {
    cv.opts.tree_size = parseInt(jq(cv.html.tree_size.id).val());
    undisable(cv.html.submit_button.id);
  });
  cv.html.tree_padding.elem.addEventListener("change", function () {
    cv.opts.tree_padding = parseInt(jq(cv.html.tree_padding.id).val());
    undisable(cv.html.submit_button.id);
  });
};

var p;