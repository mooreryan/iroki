var canvas_viewer = {
  // In pixels
  canvas_height: 900,
  canvas_width: 1000,
  padding: 50,

  size_multiplier: 20,

  // Tmp container for return values.
  ret_val: null,

  params: {
    show_branches: true,
    show_dots: false,
    show_text: false,
    tree_rotation: 0
  },

  // For html elem stuff
  html: {
    canvas_tree: {
      id: "canvas-tree"
    },
    file_uploader: {
      id: "file-uploader"
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
  return Math.floor(coord * cv.size_multiplier);
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

      var silly_x = Math.floor(vertex.radial_layout_info.x * cv.size_multiplier);
      var silly_y = Math.floor(vertex.radial_layout_info.y * cv.size_multiplier);
      var silly_px = Math.floor(vertex.radial_layout_info.parent_x * cv.size_multiplier);
      var silly_py = Math.floor(vertex.radial_layout_info.parent_y * cv.size_multiplier);

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
        "wedge_border": utils__deg_to_rad(cv.params.tree_rotation)
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
    w: (width_high - width_low) + cv.padding,
    h: (height_high - height_low) + cv.padding
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
    return Math.floor(val * cv.size_multiplier + Math.abs(min_val) + (cv.padding / 2));
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

  var buffer_branches = cv.canvas_buffer(cv.canvas_width, cv.canvas_height);
  var buffer_leaves   = cv.canvas_buffer(cv.canvas_width, cv.canvas_height);
  var buffer_text     = cv.canvas_buffer(cv.canvas_width, cv.canvas_height);

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

  // Get the actual canvas image
  var canvas  = document.getElementById(cv.html.canvas_tree.id);
  canvas.width = cv.canvas_width;
  canvas.height = cv.canvas_height;
  var context = canvas.getContext("2d");

  // Copy the buffers on to the main image.
  context.drawImage(buffer_branches.canvas, 0, 0);
};

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

  var file_reader   = new FileReader(),
      file_uploader = document.getElementById(cv.html.file_uploader.id);

  file_reader.onload = function (event) {
    var tree_str = event.target.result;
    cv.main(tree_str);
  };

  file_uploader.addEventListener("change", function () {
    upload_file(file_uploader, file_reader);
  });
};
