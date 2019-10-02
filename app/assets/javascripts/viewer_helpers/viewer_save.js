// Functions dealing with saving the rendered tree.
// These are for saving
function svg_elem_to_string(id) {
  var svg_elem = document.getElementById(id);

  if (svg_elem) {
    return (new XMLSerializer()).serializeToString(svg_elem);
  }
}

function save_png_data(scaling_factor) {
  // First make a duplicate svg image.
  var svg_tree       = document.getElementById("svg-tree");
  var svg_tree_clone = svg_tree.cloneNode(true);
  var height         = parseFloat(svg_tree_clone.getAttribute("height"));
  var width          = parseFloat(svg_tree_clone.getAttribute("width"));

  var new_height = height * scaling_factor;
  var new_width  = width * scaling_factor;

  var viewBox_height = height;
  var viewBox_width  = width;

  var viewBox = "0 0 " + viewBox_width + " " + viewBox_height;

  svg_tree_clone.setAttribute("height", new_height);
  svg_tree_clone.setAttribute("width", new_width);
  svg_tree_clone.setAttribute("viewBox", viewBox);

  var svg_string = (new XMLSerializer()).serializeToString(svg_tree_clone);

  var canvas = document.createElement("canvas");
  canvg(canvas, svg_string);
  canvas.toBlobHD(function (blob) {
    saveAs(blob, "tree.png");
  });
}

function current_size_in_pixels() {
  var svg_tree = document.getElementById("svg-tree");

  var width  = svg_tree.getAttribute("width");
  var height = svg_tree.getAttribute("height");

  return {
    width: width,
    height: height,
    display: fn.math.round(width, 2) + " x " + fn.math.round(height, 2)
  };
}

function scaled_size_given_ppi(current_size, ppi, scaling_factor) {
  var ppif = parseFloat(ppi);

  var width  = current_size.width * scaling_factor;
  var height = current_size.height * scaling_factor;

  return {
    width_pixels: width,
    height_pixels: height,
    width_inches: width / ppif,
    height_inches: height / ppif,
    display_pixels: fn.math.round(width, 2) + " x " + fn.math.round(height, 2),
    display_inches: fn.math.round(width / ppif, 2) + " x " + fn.math.round(height / ppif, 2)

  };
}

// Also checks the scaling factor.
function get_scaling_factor() {
  var scaling_factor = parseFloat(
    jq(global.html.id.save_scaling_factor)
      .val()
      .replace("%", "")
  );

  if (isNaN(scaling_factor) || (scaling_factor < 1 || scaling_factor > 1000)) {
    // Set the opt back to 1.
    jq(global.html.id.save_scaling_factor).val("100%");
    scaling_factor = 100;
  }
  else {
    // It's a good scaling factor so put the '%' sign on it so the user isn't confused.
    jq(global.html.id.save_scaling_factor).val(scaling_factor + "%");
  }

  // Convert the output from percentage back to a good number.
  return scaling_factor / 100;
}

// Should be called after any operation that changes tree size.  Most likely from within a listener.
function update_png_size_info() {
  var scaling_factor = get_scaling_factor();

  var current_size = current_size_in_pixels();
  var ppi          = jq(global.html.id.save_desired_ppi).val();
  var scaled_size  = scaled_size_given_ppi(current_size, ppi, scaling_factor);

  //jq(global.html.id.save_current_size).val(current_size.display);
  jq(global.html.id.size_at_desired_ppi_inches).val(scaled_size.display_inches);
  jq(global.html.id.size_at_desired_ppi_pixels).val(scaled_size.display_pixels);
}

// function save_png_data() {
//   var svg_string = svg_elem_to_string("svg-tree");

//   var canvas = document.createElement("canvas");
//   canvg(canvas, svg_string);
//   canvas.toBlobHD(function (blob) {
//     saveAs(blob, "tree.png");
//   });
// }


function save_svg_data() {
  saveAs(
    new Blob([svg_elem_to_string("svg-tree")],
      { type: "application/svg+xml" }),
    "tree.svg"
  );
}
