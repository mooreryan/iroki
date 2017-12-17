var PAPA_CONFIG = {
  delimiter: "\t",
  header: true,
  dynamicTyping: true,
  // worker: true,
  skipEmptyLines: true
};

var LEAF_DOT_OPTIONS = [
  "leaf_dot_color",
  "leaf_dot_size"
];

var LEAF_LABEL_OPTIONS = [
  "leaf_label_color",
  "leaf_label_font",
  "leaf_label_size",
  "new_name"
];

var BRANCH_OPTIONS = [
  "branch_width",
  "branch_color"
];

var valid_colors = {
  "black": "#000000",
  "navy": "#000080",
  "darkblue": "#00008b",
  "mediumblue": "#0000cd",
  "blue": "#0000ff",
  "darkgreen": "#006400",
  "green": "#008000",
  "teal": "#008080",
  "darkcyan": "#008b8b",
  "deepskyblue": "#00bfff",
  "darkturquoise": "#00ced1",
  "mediumspringgreen": "#00fa9a",
  "lime": "#00ff00",
  "springgreen": "#00ff7f",
  "aqua": "#00ffff",
  "cyan": "#00ffff",
  "midnightblue": "#191970",
  "dodgerblue": "#1e90ff",
  "lightseagreen": "#20b2aa",
  "forestgreen": "#228b22",
  "seagreen": "#2e8b57",
  "darkslategray": "#2f4f4f",
  "darkslategrey": "#2f4f4f",
  "limegreen": "#32cd32",
  "mediumseagreen": "#3cb371",
  "turquoise": "#40e0d0",
  "royalblue": "#4169e1",
  "steelblue": "#4682b4",
  "darkslateblue": "#483d8b",
  "mediumturquoise": "#48d1cc",
  "indigo": "#4b0082",
  "darkolivegreen": "#556b2f",
  "cadetblue": "#5f9ea0",
  "cornflowerblue": "#6495ed",
  "rebeccapurple": "#663399",
  "mediumaquamarine": "#66cdaa",
  "dimgray": "#696969",
  "dimgrey": "#696969",
  "slateblue": "#6a5acd",
  "olivedrab": "#6b8e23",
  "slategray": "#708090",
  "slategrey": "#708090",
  "lightslategray": "#778899",
  "lightslategrey": "#778899",
  "mediumslateblue": "#7b68ee",
  "lawngreen": "#7cfc00",
  "chartreuse": "#7fff00",
  "aquamarine": "#7fffd4",
  "maroon": "#800000",
  "purple": "#800080",
  "olive": "#808000",
  "gray": "#808080",
  "grey": "#808080",
  "skyblue": "#87ceeb",
  "lightskyblue": "#87cefa",
  "blueviolet": "#8a2be2",
  "darkred": "#8b0000",
  "darkmagenta": "#8b008b",
  "saddlebrown": "#8b4513",
  "darkseagreen": "#8fbc8f",
  "lightgreen": "#90ee90",
  "mediumpurple": "#9370db",
  "darkviolet": "#9400d3",
  "palegreen": "#98fb98",
  "darkorchid": "#9932cc",
  "yellowgreen": "#9acd32",
  "sienna": "#a0522d",
  "brown": "#a52a2a",
  "darkgray": "#a9a9a9",
  "darkgrey": "#a9a9a9",
  "lightblue": "#add8e6",
  "greenyellow": "#adff2f",
  "paleturquoise": "#afeeee",
  "lightsteelblue": "#b0c4de",
  "powderblue": "#b0e0e6",
  "firebrick": "#b22222",
  "darkgoldenrod": "#b8860b",
  "mediumorchid": "#ba55d3",
  "rosybrown": "#bc8f8f",
  "darkkhaki": "#bdb76b",
  "silver": "#c0c0c0",
  "mediumvioletred": "#c71585",
  "indianred": "#cd5c5c",
  "peru": "#cd853f",
  "chocolate": "#d2691e",
  "tan": "#d2b48c",
  "lightgray": "#d3d3d3",
  "lightgrey": "#d3d3d3",
  "thistle": "#d8bfd8",
  "orchid": "#da70d6",
  "goldenrod": "#daa520",
  "palevioletred": "#db7093",
  "crimson": "#dc143c",
  "gainsboro": "#dcdcdc",
  "plum": "#dda0dd",
  "burlywood": "#deb887",
  "lightcyan": "#e0ffff",
  "lavender": "#e6e6fa",
  "darksalmon": "#e9967a",
  "violet": "#ee82ee",
  "palegoldenrod": "#eee8aa",
  "lightcoral": "#f08080",
  "khaki": "#f0e68c",
  "aliceblue": "#f0f8ff",
  "honeydew": "#f0fff0",
  "azure": "#f0ffff",
  "sandybrown": "#f4a460",
  "wheat": "#f5deb3",
  "beige": "#f5f5dc",
  "whitesmoke": "#f5f5f5",
  "mintcream": "#f5fffa",
  "ghostwhite": "#f8f8ff",
  "salmon": "#fa8072",
  "antiquewhite": "#faebd7",
  "linen": "#faf0e6",
  "lightgoldenrodyellow": "#fafad2",
  "oldlace": "#fdf5e6",
  "red": "#ff0000",
  "fuchsia": "#ff00ff",
  "magenta": "#ff00ff",
  "deeppink": "#ff1493",
  "orangered": "#ff4500",
  "tomato": "#ff6347",
  "hotpink": "#ff69b4",
  "coral": "#ff7f50",
  "darkorange": "#ff8c00",
  "lightsalmon": "#ffa07a",
  "orange": "#ffa500",
  "lightpink": "#ffb6c1",
  "pink": "#ffc0cb",
  "gold": "#ffd700",
  "peachpuff": "#ffdab9",
  "navajowhite": "#ffdead",
  "moccasin": "#ffe4b5",
  "bisque": "#ffe4c4",
  "mistyrose": "#ffe4e1",
  "blanchedalmond": "#ffebcd",
  "papayawhip": "#ffefd5",
  "lavenderblush": "#fff0f5",
  "seashell": "#fff5ee",
  "cornsilk": "#fff8dc",
  "lemonchiffon": "#fffacd",
  "floralwhite": "#fffaf0",
  "snow": "#fffafa",
  "yellow": "#ffff00",
  "lightyellow": "#ffffe0",
  "ivory": "#fffff0",
  "white": "#ffffff"
};

// Add one to account for the name column.
var MAX_NUM_COLS = LEAF_DOT_OPTIONS.length + LEAF_LABEL_OPTIONS.length + BRANCH_OPTIONS.length + 1;

// From tested parse functions
function push_unless_present(ary, item)
{
  if (ary.indexOf(item) === -1) {
    ary.push(item);
  }
}
function has_duplicates(ary)
{
  var tmp = [];
  ary.forEach(function(item) {
    push_unless_present(tmp, item);
  });

  return tmp.length !== ary.length;
}

function chomp(str)
{
  return str.replace(/\r?\n?$/, '');
}

// fn is a function that takes two arguments: 1. the json key, and 2. the json value for that key.
function json_each(json, fn)
{
  for (var key in json) {
    if (json.hasOwnProperty(key)) {
      fn(key, json[key]);
    }
  }
}

function json_keys(json)
{
  var keys = [];
  for (var key in json) {
    if (json.hasOwnProperty(key)) {
      keys.push(key);
    }
  }

  return keys;
}

function includes(ary, elem)
{
  return ary.indexOf(elem) !== -1;
}

function is_bad_col_header(str)
{
  return str !== "name" &&
    !(includes(LEAF_DOT_OPTIONS, str) ||
      includes(LEAF_LABEL_OPTIONS, str) ||
      includes(BRANCH_OPTIONS, str))
}


function parse_mapping_file(str)
{
  // Parse mapping string.
  var mapping_csv = Papa.parse(chomp(str), PAPA_CONFIG);

  // Check for erros
  if (has_papa_errors(mapping_csv)) {
    return null;
  }

  if (mapping_csv.meta.fields.indexOf("name") === -1) {
    alert("ERROR -- Missing the 'name' column header in the mapping file.");
    return null;
  }

  var bad_headers = mapping_csv.meta.fields.filter(function(header) {
    return is_bad_col_header(header);
  });

  if (bad_headers.length > 0) {
    alert("ERROR -- bad headers in mapping file: " + bad_headers.join(", "));
    return null;
  }

  var num_fields = mapping_csv.meta.fields.length;
  if (num_fields <= 1) {
    alert("ERROR -- Too few fields in mapping file!");
    return null;
  }

  if (num_fields > MAX_NUM_COLS) {
    alert("ERROR -- Too many fields in mapping file!");
    return null;
  }

  if (has_duplicates(mapping_csv.meta.fields)) {
    alert("ERROR -- One of the column headers is duplicated in the mapping file.");
    return null;
  }

  // Convert to name2md.
  var mapping = {};
  var mapping_duplicates = [];

  // Check for duplicated keys in the mapping file.
  mapping_csv.data.forEach(function(info) {
    if (mapping[info.name]) {
      alert("ERROR -- " + info.name + " is duplicated in the mapping file");

      mapping_duplicates.push(info.name);
    } else {
      mapping[info.name] = {};
    }
  });

  if (mapping_duplicates.length > 0) { // there were duplicated keys in the mapping file
    // TODO raise error?
    return null;
  }

  mapping_csv.data.forEach(function(info) {
    json_each(info, function(md_cat, val) {

      if (md_cat !== "name") {
        mapping[info.name][md_cat] = val;
      }
    });
  });

  // Check for valid named colors.
  var color_options = ["leaf_dot_color", "leaf_label_color", "branch_color"];
  json_each(mapping, function(name, md){
    color_options.forEach(function(option){
      if (md[option]) { // color option is present
        // Check that it is valid
        var color_val = md[option].toLowerCase();

        // First check that it is not a hex code.
        if (!is_hex(color_val)) {
          if (valid_colors[color_val]) {
            // Replace it with the hexcode. TODO if the casing is wrong in user input will the browser care?
            md[option] = valid_colors[color_val];
          } else {
            alert("WARNING -- there was an invalid color name in the mapping file: '" + color_val + "'.  The default color will be used instead.");

            // Set the color to the default color.
            md[option] = valid_colors["black"];
          }
        }
      }
    });
  });

  return mapping;
}

function is_hex(str)
{
  return str.match(/^#[0-9A-Fa-f]{6}$/);
}

// This should only be able to happen when it is not exact matching.
function has_non_specific_matching(root, name2md)
{
  var names_with_md = json_keys(name2md);
  var leaf_matches = {};
  root.leaves().forEach(function(leaf) {
    var leaf_name = leaf.data.name;

    names_with_md.forEach(function(name_with_md) {
      if (leaf_name.indexOf(name_with_md) !== -1) { //match!
        if (leaf_matches[leaf_name]) {
          leaf_matches[leaf_name].push(name_with_md);
        } else {
          leaf_matches[leaf_name] = [name_with_md];
        }
      }
    });
  });

  var non_specific_matches = false;
  json_each(leaf_matches, function(name, matches) {
    if (matches.length > 1) { // non specific matching
      alert("ERROR -- '" + name + "' had multiple matches in the mapping file: '" + matches.join(', ') + "'.");
      non_specific_matches = true;
    }
  });

  return non_specific_matches;
}

function has_papa_errors(name2md)
{
  if (name2md.errors.length > 0) {
    name2md.errors.forEach(function(error) {
      // TODO better alert
      alert("ERROR -- Parsing error on line " + (error.row + 2) + "!  Type -- " + error.type + ".  Code -- " + error.code + ".  Message -- " + error.message + ".");
    });

    return true;
  } else {
    return false;
  }
}

function min_non_zero_len_in_tree(root)
{
  var min_length = undefined;
  root.descendants().map(function(d) {
    if ((min_length === undefined || d.data.length < min_length) && d.data.length !== 0) {
      min_length = d.data.length;
    }
  });

  return min_length;
}