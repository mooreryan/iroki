/*
  TODO optimize
    - sorting the hierarchy (1/6 of the time)
    - summing the hierarchy (1/20 of the time).  It sets d.value, used in sorting and checking if a node is a leaf or not.
    - newick__parse (1/3 of the time)
    - radial_cluster (1/3 of the time)
*/

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
    tree_branch_style: {
      id: "tree-branch-style"
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

    // Scale bar opts
    scale_bar_show: {
      id: "show-scale-bar"
    },
    scale_bar_length: {
      id: "scale-bar-length"
    },

    // Viewer opts
    viewer_size_fixed: {
      id: "viewer-size-fixed"
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
    zero_len_branch: 1e-10,
    min_pixel_size: 1000,
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
    tree_branch_style: "normalogram",
    tree_sort: "descending",
    tree_rotation: 0,
    tree_size: 20,
    tree_padding: 50,

    // Viewer opts
    viewer_size_fixed: false,

    // Scale bar opts
    scale_bar_show: true,
    scale_bar_length: 75
  };
};

/**
 * Resets the opts hash as well as the form values to reflect the defaults.
 */
cv.helpers.reset_opts = function () {
  // Set the hash.
  cv.opts = cv.helpers.default_opts();

  // Update the form.
  jq(cv.html.tree_layout.id).val(cv.opts.tree_layout);
  jq(cv.html.tree_branch_style.id).val(cv.opts.tree_branch_style);
  jq(cv.html.tree_sort.id).val(cv.opts.tree_sort);
  jq(cv.html.tree_rotation.id).val(cv.opts.tree_rotation);
  jq(cv.html.tree_size.id).val(cv.opts.tree_size);
  jq(cv.html.tree_padding.id).val(cv.opts.tree_padding);
  check(cv.html.scale_bar_show.id);
  jq(cv.html.scale_bar_length.id).val(cv.opts.scale_bar_length);

  // Update the fixed viewer size stuff.
  jq(cv.html.viewer_size_fixed.id).prop("checked", false);
  jq(cv.html.canvas_tree_container.id).css("overflow", "visible");

  disable(cv.html.tree_branch_style.id);
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

cv.helpers.vec_len = function (x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

cv.helpers.scale_bar = function (root) {
  if (root.children.length > 0) {
    var child = root.children[0];

    var x  = tr(child.radial_layout_info.x, cv.xy_range.min_x),
        y  = tr(child.radial_layout_info.y, cv.xy_range.min_y),
        px = tr(child.radial_layout_info.parent_x, cv.xy_range.min_x),
        py = tr(child.radial_layout_info.parent_y, cv.xy_range.min_y);

    // Get the dist from the parent to this node.
    var dist          = Math.sqrt(Math.pow(px - x, 2) + Math.pow(py - y, 2));
    var branch_length = child.data.branch_length;

    var pixels_per_unit_length = dist / branch_length;

    var scale_bar_length = cv.opts.scale_bar_length / pixels_per_unit_length;

  }
  else {
    throw Error("The root has no children!");
  }

  return { length: scale_bar_length, width: cv.opts.scale_bar_length };
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

  // TODO optimize: this recursive call takes up about (1/6) of the time
  function a_preorder_traversal(vertex) {
    if (vertex !== root) {
      var parent = vertex.parent;


      // NOTE if the tree has branches less than 1e-10, it will be slightly off.
      var distance_to_parent = vertex.data.branch_length === 0 ? cv.helpers.zero_len_branch : vertex.data.branch_length;

      var x = parent.radial_layout_info.x + distance_to_parent * Math.cos(vertex.radial_layout_info.wedge_border + (vertex.radial_layout_info.wedge_size / 2));
      var y = parent.radial_layout_info.y + distance_to_parent * Math.sin(vertex.radial_layout_info.wedge_border + (vertex.radial_layout_info.wedge_size / 2));


      vertex.radial_layout_info.x        = x;
      vertex.radial_layout_info.y        = y;
      vertex.radial_layout_info.parent_x = parent.radial_layout_info.x;
      vertex.radial_layout_info.parent_y = parent.radial_layout_info.y;

      var silly_x  = (vertex.radial_layout_info.x);
      var silly_y  = (vertex.radial_layout_info.y);
      var silly_px = (vertex.radial_layout_info.parent_x);
      var silly_py = (vertex.radial_layout_info.parent_y);

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

cv.const.scale_bar_padding = 50;

cv.width_and_height = function (xy_range, multiplier, padding) {
  var width_padding  = padding;
  var height_padding = padding + cv.const.scale_bar_padding; // Extra for the scale bar.
  var width_high     = xy_range.max_x + Math.abs(xy_range.min_x),
      width_low      = xy_range.min_x + Math.abs(xy_range.min_x);

  var height_high = xy_range.max_y + Math.abs(xy_range.min_y),
      height_low  = xy_range.min_y + Math.abs(xy_range.min_y);

  return {
    w: Math.ceil(multiplier * (width_high - width_low) + width_padding),
    h: Math.ceil(multiplier * (height_high - height_low) + height_padding)
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

function tr(val, min_val) {
  return Math.floor((val * cv.opts.tree_size) + (Math.abs(min_val) * cv.opts.tree_size) + (cv.opts.tree_padding / 2));
}

cv.main = function (tree_str, mapping_str) {
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
    return {
      x: r * Math.cos(theta) + cluster_width + cv.opts.tree_padding,
      y: r * Math.sin(theta) + cluster_width + cv.opts.tree_padding
    };
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
  cv.xy_range = cv.layout_radial(ROOT);

  // set_radius(ROOT, ROOT.data.branch_length = 0, cv.canvas_height / max_length(ROOT));

  // Radial layout could change the height and width so get context separately for that.
  var buffer_background = null;
  var buffer_branches   = null;
  var buffer_leaves     = null;
  var buffer_text       = null;
  var buffer_scale_bar  = null;


  if (cv.opts.tree_layout === "circular-tree") {
    cv.canvas_width  = cv.opts.tree_size + (2 * cv.opts.tree_padding);
    cv.canvas_height = cv.opts.tree_size + (2 * cv.opts.tree_padding);

    buffer_background = cv.canvas_buffer(cv.canvas_width, cv.canvas_height);
    buffer_branches   = cv.canvas_buffer(cv.canvas_width, cv.canvas_height);
    buffer_leaves     = cv.canvas_buffer(cv.canvas_width, cv.canvas_height);
    buffer_text       = cv.canvas_buffer(cv.canvas_width, cv.canvas_height);
    buffer_scale_bar  = cv.canvas_buffer(cv.canvas_width, cv.canvas_height);

    buffer_branches.context.beginPath();

    var tree_rotation_radians = fn.math.degrees_to_radians(cv.opts.tree_rotation);

    var cluster_width = cv.opts.tree_size / 2;

    var circle_cluster = d3.cluster()
                           .size([2 * Math.PI, cluster_width])
                           .separation(function (a, b) {
                             return 1;
                           });
    circle_cluster(ROOT);
    set_radius(ROOT, ROOT.data.branch_length = 0, cluster_width / max_length(ROOT));


    var base = ROOT.descendants()[0];
    if (base.depth !== 0) {
      throw Error("This is not the base!");
    }
    var retval   = to_polar(base.x, base.y);
    var center_x = retval.x;
    var center_y = retval.y;

    // d.x is theta, and d.y is radius, which runs from 0 to LALA.
    ROOT.descendants().forEach(function (d) {
      var this_radius = cv.opts.tree_branch_style === "cladogram" ? d.y : d.radius;

      var this_theta        = d.x + tree_rotation_radians;
      var clockwise         = false;
      var counter_clockwise = true;

      var ret_val = to_polar(d.x + tree_rotation_radians, this_radius);
      var x       = ret_val.x;
      var y       = ret_val.y;


      if (d.parent) {
        var parent_radius = cv.opts.tree_branch_style === "cladogram" ? d.parent.y : d.parent.radius;
        var parent_theta  = d.parent.x + tree_rotation_radians;

        ret_val = to_polar(d.parent.x, parent_radius);
        var px  = ret_val.x;
        var py  = ret_val.y;

        // Use this node's theta and the parent's radius.
        var drop_point = to_polar(d.x + tree_rotation_radians, parent_radius);

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
    });
  }
  else {
    // Do radial layout.

    var data = ROOT.descendants().map(function (d) {
      return d.radial_layout_info;
    });

    // Bump up the tree size if the branches are quite small.
    cv.ret_val = cv.width_and_height(cv.xy_range, 1, 0);


    // Minus off the scale bar padding as it is not part of the actula tree size but the width and height accounts for it.
    var longer = cv.ret_val.w > (cv.ret_val.h - cv.const.scale_bar_padding) ? cv.ret_val.w : (cv.ret_val.h - cv.const.scale_bar_padding);

    console.log(cv.ret_val);
    console.log(longer);
    console.log(longer * cv.opts.tree_size);
    console.log(cv.const.min_pixel_size);

    if (longer * cv.opts.tree_size < cv.const.min_pixel_size) {
      // We want the longer of the sides to be at least approx cv.const.min_pixel_size pixels
      cv.opts.tree_size = Math.ceil(cv.const.min_pixel_size / longer);
      // And update the actual option.
      jq(cv.html.tree_size.id).val(cv.opts.tree_size);
    }

    // Width and height depends on the tree_size
    cv.ret_val       = cv.width_and_height(cv.xy_range, cv.opts.tree_size, cv.opts.tree_padding);
    cv.canvas_width  = cv.ret_val.w;
    cv.canvas_height = cv.ret_val.h;

    buffer_background = cv.canvas_buffer(cv.canvas_width, cv.canvas_height);
    buffer_branches   = cv.canvas_buffer(cv.canvas_width, cv.canvas_height);
    buffer_leaves     = cv.canvas_buffer(cv.canvas_width, cv.canvas_height);
    buffer_text       = cv.canvas_buffer(cv.canvas_width, cv.canvas_height);
    buffer_scale_bar  = cv.canvas_buffer(cv.canvas_width, cv.canvas_height);

    buffer_scale_bar.context.font         = "16px Helvetica";
    buffer_scale_bar.context.textBaseline = 'top';

    var scale_bar              = cv.helpers.scale_bar(ROOT);
    var scale_bar_start_x      = (cv.canvas_width - scale_bar.width) / 2;
    var scale_bar_start_y      = tr(cv.xy_range.max_y, cv.xy_range.min_y) + (0.67 * cv.const.scale_bar_padding);
    var scale_bar_text_start_y = scale_bar_start_y + 5;
    var scale_bar_text         = fn.math.round(scale_bar.length, 2).toString();
    var scale_bar_text_width   = buffer_scale_bar.context.measureText(scale_bar_text).width;
    var scale_bar_text_start_x = (scale_bar.width - scale_bar_text_width) / 2;

    buffer_scale_bar.context.beginPath();
    buffer_scale_bar.context.moveTo(scale_bar_start_x, scale_bar_start_y);
    buffer_scale_bar.context.lineTo(scale_bar_start_x + scale_bar.width, scale_bar_start_y);
    buffer_scale_bar.context.stroke();

    buffer_scale_bar.context.fillText(scale_bar_text, scale_bar_start_x + scale_bar_text_start_x, scale_bar_text_start_y);

    // This is for the radial layout.
    buffer_branches.context.beginPath();
    data.forEach(function (d, i) {
      var x  = tr(d.x, cv.xy_range.min_x),
          px = tr(d.parent_x, cv.xy_range.min_x),
          y  = tr(d.y, cv.xy_range.min_y),
          py = tr(d.parent_y, cv.xy_range.min_y);

      if (cv.helpers.is_leaf(d)) {
        // TODO draw dots
        // TODO draw text
      }

      // TODO on the arb guide tree move to needs to be x, y but on the fastree GG tree moveTo needs to be px, py
      buffer_branches.context.moveTo(px, py);
      buffer_branches.context.lineTo(x, y);
    });
  }

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
  context.drawImage(buffer_scale_bar.canvas, 0, 0);

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
  // And disable the branch style as default is radial
  disable(cv.html.tree_branch_style.id);

  var file_reader = new FileReader();

  var file_uploader = document.getElementById(cv.html.file_uploader.id);
  var submit_button = document.getElementById(cv.html.submit_button.id);
  var reset_button  = document.getElementById(cv.html.reset_button.id);

  // Tree layout options
  cv.html.tree_layout.elem       = document.getElementById(cv.html.tree_layout.id);
  cv.html.tree_branch_style.elem = document.getElementById(cv.html.tree_branch_style.id);
  cv.html.tree_sort.elem         = document.getElementById(cv.html.tree_sort.id);
  cv.html.tree_rotation.elem     = document.getElementById(cv.html.tree_rotation.id);
  cv.html.tree_size.elem         = document.getElementById(cv.html.tree_size.id);
  cv.html.tree_padding.elem      = document.getElementById(cv.html.tree_padding.id);

  // Scale bar opts
  cv.html.scale_bar_show.elem   = document.getElementById(cv.html.scale_bar_show.id);
  cv.html.scale_bar_length.elem = document.getElementById(cv.html.scale_bar_length.id);

  // Viewer opts
  cv.html.viewer_size_fixed.elem = document.getElementById(cv.html.viewer_size_fixed.id);

  file_reader.onload = function (event) {
    var tree_str = event.target.result;
    cv.main(tree_str);
  };

  // Submitting and reseting
  file_uploader.addEventListener("change", function () {
    cv.tree_changed = true;

    // Set a small value to start in case it is a huge tree.
    jq(cv.html.tree_size.id).val(20);
    cv.opts.tree_size = 20;

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

    document.getElementById("canvas-tree-upload-form").reset();
    document.getElementById("canvas-mapping-upload-form").reset();

    undisable(cv.html.submit_button.id);
  });

  // Tree layout options
  cv.html.tree_layout.elem.addEventListener("change", function () {
    cv.opts.tree_layout = jq(cv.html.tree_layout.id).val();

    // If it is a circular layout, we need to adjust the tree size.
    if (cv.opts.tree_layout === "circular-tree") {
      // First set a better default
      var val = 10;
      jq(cv.html.tree_size.id).val(val);
      // Need to scale it to the width in pixels.
      cv.opts.tree_size = cv.helpers.circular_tree_size(val);

      undisable(cv.html.tree_branch_style.id);
    }
    else {
      // It is a radial tree.
      var val = 20;
      jq(cv.html.tree_size.id).val(val);
      cv.opts.tree_size = val;

      disable(cv.html.tree_branch_style.id);
    }

    undisable(cv.html.submit_button.id);
  });
  cv.html.tree_branch_style.elem.addEventListener("change", function () {
    cv.opts.tree_branch_style = jq(cv.html.tree_branch_style.id).val();
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
    if (cv.opts.tree_layout === "circular-tree") {
      // Need to scale it to the width in pixels.
      var val           = parseInt(jq(cv.html.tree_size.id).val());
      cv.opts.tree_size = cv.helpers.circular_tree_size(val);
    }
    else {
      cv.opts.tree_size = parseInt(jq(cv.html.tree_size.id).val());
    }


    undisable(cv.html.submit_button.id);
  });
  cv.html.tree_padding.elem.addEventListener("change", function () {
    cv.opts.tree_padding = parseInt(jq(cv.html.tree_padding.id).val());
    undisable(cv.html.submit_button.id);
  });

  // Scale bar opts
  cv.html.scale_bar_show.elem.addEventListener("change", function () {
    cv.opts.scale_bar_show = is_checked(cv.html.scale_bar_show.id);
    undisable(cv.html.submit_button.id);
  });
  cv.html.scale_bar_length.elem.addEventListener("change", function () {
    cv.opts.scale_bar_length = parseInt(jq(cv.html.scale_bar_length.id).val());
    undisable(cv.html.submit_button.id);
  });

  cv.html.viewer_size_fixed.elem.addEventListener("change", function () {
    if (is_checked(cv.html.viewer_size_fixed.id)) {
      jq(cv.html.canvas_tree_container.id).css("overflow", "scroll");
    }
    else {
      jq(cv.html.canvas_tree_container.id).css("overflow", "visible");
    }
  });
};

cv.helpers.circular_tree_size = function (val) {
  return fn.math.scale(val, 5, 50, 500, 2500);
};
