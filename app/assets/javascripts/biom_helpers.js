var biom    = {};
biom.helper = {};

/**
 * Makes the mapping file string from the leaf name to colors obj.
 *
 * @param colors leaf_name => color_hex_code
 * @return {string} The mapping file string.  It will be passed in to the saveAs function.
 */
biom.mapping_file_str = function (colors) {
  var header  = "name\tbranch_color\tleaf_label_color\tleaf_dot_color\n";
  var strings = [];
  json_each(colors, function (leaf_name, color_hex_code) {
    var str = [leaf_name, color_hex_code, color_hex_code, color_hex_code].join("\t");

    strings.push(str);
  });

  return header + strings.join("\n");
};


// The "main" function
/**
 * This is the "main" function for dealing with biom data.
 *
 * It calls everything needed to save the color maps based on the biom file.
 *
 * TODO pass in all globals as kv pairs in params.
 *
 * @param params Includes the following keys: biom_str, keep_zero_counts, angle_offset
 * @return NOTHING!
 */
function biom__save_abundance_colors(params) {
  var fully_parsed_biom = fn.parsed_biom.new(params);

  var biom_color_map_str = biom.mapping_file_str(fully_parsed_biom.color_hex_codes);

  if (g_val_download_legend) {
    var zip = new JSZip();
    zip.folder("iroki_mapping")
       .file("mapping.tsv.txt", biom_color_map_str)
       .file("biom_with_colors.tsv.txt", fully_parsed_biom.biom_with_colors_tsv)
       .file("biom_with_colors.html", fully_parsed_biom.biom_with_colors_html);

    if (g_val_biom_conversion_style === g_ID_BIOM_CONVERSION_STYLE_GEOMETRY) {
      zip.folder("iroki_mapping")
         .file("sample_approximate_starting_colors.html", fully_parsed_biom.approx_starting_colors_html)
         .file("sample_approximate_starting_colors.txt", fully_parsed_biom.approx_starting_colors_tsv);

    }

    zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: {
        level: 1
      }
    })
       .then(function (blob) {
         saveAs(blob, "iroki_mapping.zip");
       });

  }
  else {
    var blob = new Blob([biom_color_map_str], { type: "text/plain;charset=utf-8" });

    // Unicode standard does not recommend using the BOM for UTF-8, so pass in true to NOT put it in.
    saveAs(blob, "mapping.txt", true);
  }
}