// Functions dealing with saving the rendered tree.
// These are for saving
function svg_elem_to_string(id) {
  var svg_elem = document.getElementById(id);

  if (svg_elem) {
    return (new XMLSerializer()).serializeToString(svg_elem);
  }
}

function save_png_data() {
  var svg_string = svg_elem_to_string("svg-tree");

  var canvas = document.createElement("canvas");
  canvg(canvas, svg_string);
  canvas.toBlobHD(function (blob) {
    saveAs(blob, "tree.png");
  });
}

function save_svg_data() {
  saveAs(
    new Blob([svg_elem_to_string("svg-tree")],
      { type: "application/svg+xml" }),
    "tree.svg"
  );
}
