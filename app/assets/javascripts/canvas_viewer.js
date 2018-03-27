var canvas_viewer = {
  // In pixels
  canvas_height: 1000,
  canvas_width: 1000,

  tree_changed: false,

  // Tmp container for return values.
  ret_val: null,

  opts: {},


  // For html elem stuff
  html: {
    canvas_tree: {
      id: "canvas-tree"
    },
    canvas_tree_container: {
      id: "canvas-tree-container"
    },
    file_uploader: {
      id: "file-uploader"
    },
    submit_button: {
      id: "submit"
    },
    reset_button: {
      id: "reset"
    },
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

cv.helpers.adjust = function (coord) {
  return Math.floor(coord * cv.opts.size_multiplier);
};

cv.helpers.default_opts = function () {
  return {
    show_branches: true,
    show_dots: false,
    show_text: false,

    padding: 50,
    size_multiplier: 20,
    tree_rotation: 0
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

      var silly_x  = Math.floor(vertex.radial_layout_info.x * cv.opts.size_multiplier);
      var silly_y  = Math.floor(vertex.radial_layout_info.y * cv.opts.size_multiplier);
      var silly_px = Math.floor(vertex.radial_layout_info.parent_x * cv.opts.size_multiplier);
      var silly_py = Math.floor(vertex.radial_layout_info.parent_y * cv.opts.size_multiplier);

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
    w: (width_high - width_low) + cv.opts.padding,
    h: (height_high - height_low) + cv.opts.padding
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
    return Math.floor(val * cv.opts.size_multiplier + Math.abs(min_val) + (cv.opts.padding / 2));
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

  var parsed_newick = newick__parse(tree_str);

  ROOT = d3.hierarchy(parsed_newick, function (d) {
    return d.branchset;
  })
           .sum(function (d) {
             return d.branchset ? 0 : 1;
           })
           .sort(function (a, b) {
             return 0;
           });

  // This modifies root.
  cv.xy_range      = cv.layout_radial(ROOT);
  cv.ret_val       = cv.width_and_height(cv.xy_range);
  cv.canvas_width  = cv.ret_val.w;
  cv.canvas_height = cv.ret_val.h;

  // set_radius(ROOT, ROOT.data.branch_length = 0, cv.canvas_height / max_length(ROOT));

  var buffer_background = cv.canvas_buffer(cv.canvas_width, cv.canvas_height);
  var buffer_branches   = cv.canvas_buffer(cv.canvas_width, cv.canvas_height);
  var buffer_leaves     = cv.canvas_buffer(cv.canvas_width, cv.canvas_height);
  var buffer_text       = cv.canvas_buffer(cv.canvas_width, cv.canvas_height);

  buffer_branches.context.beginPath();

  var data = ROOT.descendants().map(function (d) {
    return d.radial_layout_info;
  });

  data.forEach(function (d, i) {
    var x  = tr(d.x, cv.xy_range.min_x),
        px = tr(d.parent_x, cv.xy_range.min_x),
        y  = tr(d.y, cv.xy_range.min_y),
        py = tr(d.parent_y, cv.xy_range.min_y);

    if (cv.helpers.is_leaf(d)) {
      // TODO draw dots
      // TODO draw text
    }

    buffer_branches.context.moveTo(x, y);
    buffer_branches.context.lineTo(px, py);
  });

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

  file_reader.onload = function (event) {
    var tree_str = event.target.result;
    cv.main(tree_str);
  };

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
};
