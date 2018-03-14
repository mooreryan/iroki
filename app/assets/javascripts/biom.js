// TODO need to make sure the defaults match up with the actual forms.
var g_COLOR_IS_DARK = 0.25;

var g_ID_COLOR_SPACE     = "color-space",
    g_ID_COLOR_SPACE_HCL = "color-space-hcl",
    g_ID_COLOR_SPACE_HSL = "color-space-hsl",
    g_val_color_space    = g_ID_COLOR_SPACE_HCL;

var g_ID_AVG_METHOD                        = "avg-method",
    g_ID_AVG_METHOD_ALL_SAMPLES_MEAN       = "avg-method-all-samples-mean",
    g_ID_AVG_METHOD_NONZERO_SAMPLES_MEAN   = "avg-method-nonzero-samples-mean",
    g_ID_AVG_METHOD_ALL_SAMPLES_MEDIAN     = "avg-method-all-samples-median",
    g_ID_AVG_METHOD_NONZERO_SAMPLES_MEDIAN = "avg-method-nonzero-samples-median",
    g_val_avg_method                       = g_ID_AVG_METHOD_NONZERO_SAMPLES_MEAN;

var g_ID_HUE_ANGLE_OFFSET  = "hue-angle-offset",
    g_val_hue_angle_offset = 0;

var g_ID_REDUCE_DIMENSION         = "reduce-dimension",
    g_ID_REDUCE_DIMENSION_NONE    = "reduce-dimension-none",
    g_ID_REDUCE_DIMENSION_AUTO_50 = "reduce-dimension-auto-50",
    g_ID_REDUCE_DIMENSION_AUTO_75 = "reduce-dimension-auto-75",
    g_ID_REDUCE_DIMENSION_AUTO_90 = "reduce-dimension-auto-90",
    g_ID_REDUCE_DIMENSION_1_PC    = "reduce-dimension-1-pc",
    g_ID_REDUCE_DIMENSION_2_PC    = "reduce-dimension-2-pc",
    g_ID_REDUCE_DIMENSION_3_PC    = "reduce-dimension-3-pc",
    g_val_reduce_dimension        = g_ID_REDUCE_DIMENSION_NONE;

var g_ID_ABUNDANT_SAMPLES_ARE       = "abundant-samples-are",
    g_ID_ABUNDANT_SAMPLES_ARE_LIGHT = "abundant-samples-are-light",
    g_ID_ABUNDANT_SAMPLES_ARE_DARK  = "abundant-samples-are-dark",
    g_val_abundant_samples_are      = g_ID_ABUNDANT_SAMPLES_ARE_LIGHT;

var g_ID_DOWNLOAD_LEGEND  = "download-legend",
    g_val_download_legend = true;

var g_ID_LIGHTNESS_MIN      = "lightness-min",
    g_ID_LIGHTNESS_MAX      = "lightness-max",
    g_DEFAULT_LIGHTNESS_MIN = 30,
    g_DEFAULT_LIGHTNESS_MAX = 90,
    g_val_lightness_min     = g_DEFAULT_LIGHTNESS_MIN,
    g_val_lightness_max     = g_DEFAULT_LIGHTNESS_MAX;

var g_ID_CHROMA_MIN      = "chroma-min",
    g_ID_CHROMA_MAX      = "chroma-max",
    g_DEFAULT_CHROMA_MIN = 0,
    g_DEFAULT_CHROMA_MAX = 100,
    g_val_chroma_min     = g_DEFAULT_CHROMA_MIN,
    g_val_chroma_max     = g_DEFAULT_CHROMA_MAX;


var g_ID_CHROMA_METHOD                   = "chroma-method",
    g_ID_CHROMA_METHOD_EVENNESS_ABSOLUTE = "chroma-method-evenness-absolute",
    g_ID_CHROMA_METHOD_EVENNESS_RELATIVE = "chroma-method-evenness-relative",
    g_val_chroma_method                  = g_ID_CHROMA_METHOD_EVENNESS_ABSOLUTE;

var g_ID_EVEN_LEAVES_ARE                = "even-leaves-are",
    g_ID_EVEN_LEAVES_ARE_LESS_SATURATED = "even-leaves-are-less-saturated",
    g_ID_EVEN_LEAVES_ARE_MORE_SATURATED = "even-leaves-are-more-saturated",
    g_val_even_leaves_are               = g_ID_EVEN_LEAVES_ARE_LESS_SATURATED;


var g_ID_CORRECT_LUMINANCE  = "correct-luminance",
    g_val_correct_luminance = true;

var g_ID_BIOM_CONVERSION_STYLE          = "biom-conversion-style",
    g_ID_BIOM_CONVERSION_STYLE_PALETTE  = "biom-conversion-style-palette",
    g_ID_BIOM_CONVERSION_STYLE_GEOMETRY = "biom-conversion-style-geometry",
    g_val_biom_conversion_style         = g_ID_BIOM_CONVERSION_STYLE_PALETTE;

var g_ID_SUBMIT_BUTTON = "submit-button",
    g_ID_RESET_BUTTON  = "reset-button",
    g_ID_SAVE_BUTTON   = "save-button";

var g_val_biom_str = null;

var g_ID_PALETTE  = "palette",
    g_val_palette = "Spectral";

var g_ID_LEAF_POSITION_METHOD            = "leaf-position-method",
    g_ID_LEAF_POSITION_METHOD_PROJECTION = "leaf-position-method-projection",
    g_ID_LEAF_POSITION_METHOD_EVENNESS   = "leaf-position-method-evenness",
    g_ID_LEAF_POSITION_METHOD_ABUNDANCE  = "leaf-position-method-abundance",
    g_val_leaf_position_method           = g_ID_LEAF_POSITION_METHOD_PROJECTION;

var g_ID_CORRECT_PALETTE_LIGHTNESS  = "correct-palette-lightness",
    g_val_correct_palette_lightness = false;


// Set the correct options panel to show
function hide_correct_opts_div() {
  g_val_biom_conversion_style = jq(g_ID_BIOM_CONVERSION_STYLE).val();

  if (g_val_biom_conversion_style === g_ID_BIOM_CONVERSION_STYLE_GEOMETRY) {
    jq("geometry-options-div").prop("hidden", false);
    jq("palette-options-div").prop("hidden", true);
  }
  else {
    jq("geometry-options-div").prop("hidden", true);
    jq("palette-options-div").prop("hidden", false);
  }
}

// handle upload button


// Handle the biom upload form

/**
 * Calls biom__save_abundance_colors once the file is uploaded.  Sets up all the listeners and manages the form values.  It is called directly on the biom.html.slim page.
 */
function biom__upload_button() {
  function update_form_vals() {

    // Color options
    g_val_color_space = jq(g_ID_COLOR_SPACE).val();

    g_val_hue_angle_offset = parseFloat(jq(g_ID_HUE_ANGLE_OFFSET).val());
    if (isNaN(g_val_hue_angle_offset) || g_val_hue_angle_offset < 0) {
      g_val_hue_angle_offset = 0;
      jq(g_ID_HUE_ANGLE_OFFSET).val(g_val_hue_angle_offset);
    }
    else if (g_val_hue_angle_offset >= 360) {
      g_val_hue_angle_offset = 359;
      jq(g_ID_HUE_ANGLE_OFFSET).val(g_val_hue_angle_offset);
    }
    var display_color = fn.color.approx_starting_color(g_val_hue_angle_offset);
    jq("hue-angle-offset-label").css("color", display_color);


    g_val_abundant_samples_are = jq(g_ID_ABUNDANT_SAMPLES_ARE).val();

    // Other options
    g_val_avg_method       = jq(g_ID_AVG_METHOD).val();
    g_val_reduce_dimension = jq(g_ID_REDUCE_DIMENSION).val();

    // Legend options
    g_val_download_legend = is_checked(g_ID_DOWNLOAD_LEGEND);

    // Lightness options
    g_val_lightness_min     = parseFloat(jq(g_ID_LIGHTNESS_MIN).val());
    g_val_lightness_max     = parseFloat(jq(g_ID_LIGHTNESS_MAX).val());
    g_val_correct_luminance = is_checked(g_ID_CORRECT_LUMINANCE);

    // Chroma opts
    g_val_chroma_method   = jq(g_ID_CHROMA_METHOD).val();
    g_val_chroma_min      = parseFloat(jq(g_ID_CHROMA_MIN).val());
    g_val_chroma_max      = parseFloat(jq(g_ID_CHROMA_MAX).val());
    g_val_even_leaves_are = jq(g_ID_EVEN_LEAVES_ARE).val();

    // Palette opts
    g_val_palette              = jq(g_ID_PALETTE).val();
    g_val_leaf_position_method = jq(g_ID_LEAF_POSITION_METHOD).val();

    g_val_correct_palette_lightness = is_checked(g_ID_CORRECT_PALETTE_LIGHTNESS);

    draw_the_preview();

    // Set the correct options panel to show
    hide_correct_opts_div();
  }

  /**
   * Uploads the file to the biom_reader.
   */
  function upload_file() {
    var file = uploader.files[0];
    if (file) {
      biom_reader.readAsText(file);
    }
    else {
      alert("Don't forget to select a biom file!");
    }
  }

  /**
   * Set the global val of biom str.  This will be used for biom_reader.onload.
   *
   * @param event
   */
  function set_biom_str(event) {
    update_form_vals();

    g_val_biom_str = event.target.result;

    draw_the_preview();

    undisable_save_button();
  }

  /**
   * This function is called when you hit the save button.
   */
  function save_result() {
    update_form_vals();
    var params = set_params(g_val_biom_str);

    biom__save_abundance_colors(params);
  }

  function undisable_and_update() {
    undisable(g_ID_SUBMIT_BUTTON);
    undisable(g_ID_RESET_BUTTON);

    update_form_vals();
  }

  // Call update_form_vals() before this.
  function draw_the_preview() {
    // First make sure the svg is cleared.
    d3.select("#palette-preview").remove();
    d3.select("#palette-preview-container")
      .append("svg")
      .attr("id", "palette-preview")
      .attr("height", 100)
      .attr("width", 800);

    if (g_val_correct_palette_lightness) {
      var color_scale = chroma.scale(g_val_palette).padding(0.05).correctLightness();
    }
    else {
      var color_scale = chroma.scale(g_val_palette).padding(0.05);
    }

    if (g_val_biom_str) {
      var params            = set_params(g_val_biom_str);
      var fully_parsed_biom = fn.parsed_biom.new(params);

      if (fully_parsed_biom.data_for_preview) {
        var data = fn.obj.vals(fully_parsed_biom.data_for_preview);
        console.log("data from draw");
        console.log(data);
        var data_min = fn.ary.min(data);
        var data_max = fn.ary.max(data);
      }

      else {
        var data = [];
      }
    }
    else {
      var data = [];
    }

    if (fully_parsed_biom && fully_parsed_biom.color_scale_for_preview) {
      color_scale = fully_parsed_biom.color_scale_for_preview;
    }

    if (fully_parsed_biom && fully_parsed_biom.leaf_names) {
      var names = fully_parsed_biom.leaf_names;
    }
    else {
      names = [];
    }

    // Also make sure the preview is drawn.
    fn.palette.draw({
      data: data,
      names: names,
      chart_id: "palette-preview",
      color_scale: color_scale,
      steps: 200
    });
  }

  /**
   * Sets up the params needed for biom__save_abundance_colors (and fn.parsed_biom.new).
   *
   * Make sure to call update_form_values() before running this.
   *
   * @param biom_str
   * @return {Object}
   */
  function set_params(biom_str) {
    var keep_zeros = g_val_avg_method === g_ID_AVG_METHOD_ALL_SAMPLES_MEAN;

    var opts_for_reduced_dimension = {};

    switch (g_val_reduce_dimension) {
      case g_ID_REDUCE_DIMENSION_AUTO_50:
        opts_for_reduced_dimension.projection_type   = "auto";
        opts_for_reduced_dimension.sing_vals_to_keep = 50;
        break;
      case g_ID_REDUCE_DIMENSION_AUTO_75:
        opts_for_reduced_dimension.projection_type   = "auto";
        opts_for_reduced_dimension.sing_vals_to_keep = 75;
        break;
      case g_ID_REDUCE_DIMENSION_AUTO_90:
        opts_for_reduced_dimension.projection_type   = "auto";
        opts_for_reduced_dimension.sing_vals_to_keep = 90;
        break;
      case g_ID_REDUCE_DIMENSION_1_PC:
        opts_for_reduced_dimension.projection_type   = "pc";
        opts_for_reduced_dimension.sing_vals_to_keep = 1;
        break;
      case g_ID_REDUCE_DIMENSION_2_PC:
        opts_for_reduced_dimension.projection_type   = "pc";
        opts_for_reduced_dimension.sing_vals_to_keep = 2;
        break;
      case g_ID_REDUCE_DIMENSION_3_PC:
        opts_for_reduced_dimension.projection_type   = "pc";
        opts_for_reduced_dimension.sing_vals_to_keep = 3;
        break;
      default:
        opts_for_reduced_dimension.projection_type   = null;
        opts_for_reduced_dimension.sing_vals_to_keep = null;
        break;
    }

    return {
      // These are required for fn.parsed_biom.new
      biom_str: biom_str,
      keep_zero_counts: keep_zeros,
      angle_offset: g_val_hue_angle_offset,
      projection_type: opts_for_reduced_dimension.projection_type,
      sing_vals_to_keep: opts_for_reduced_dimension.sing_vals_to_keep,

      // These are required for fn.parsed_biom.colors
      lightness_min: g_val_lightness_min,
      lightness_max: g_val_lightness_max,
      lightness_reversed: g_val_abundant_samples_are === g_ID_ABUNDANT_SAMPLES_ARE_DARK,

      chroma_min: g_val_chroma_min,
      chroma_max: g_val_chroma_max,
      chroma_reversed: g_val_even_leaves_are === g_ID_EVEN_LEAVES_ARE_MORE_SATURATED,

      evenness_absolute: g_val_chroma_method === g_ID_CHROMA_METHOD_EVENNESS_ABSOLUTE,

      correct_luminance: g_val_correct_luminance,

      biom_conversion_style: g_val_biom_conversion_style,

      palette: g_val_palette,
      leaf_position_method: g_val_leaf_position_method,
      correct_palette_lightness: g_val_correct_palette_lightness
    };
  }

  function undisable_save_button() {
    jq(g_ID_SAVE_BUTTON).prop("hidden", false);
    undisable(g_ID_SAVE_BUTTON);
  }

  function disable_save_button() {
    jq(g_ID_SAVE_BUTTON).prop("hidden", true);
    disable(g_ID_SAVE_BUTTON);
  }

  disable(g_ID_SUBMIT_BUTTON);
  disable(g_ID_RESET_BUTTON);
  disable_save_button();
  update_form_vals();


  var submit_id   = g_ID_SUBMIT_BUTTON;
  var uploader_id = "uploader";

  // Upload elements
  var uploader        = document.getElementById(uploader_id);
  var submit_button   = document.getElementById(g_ID_SUBMIT_BUTTON);
  var reset_button    = document.getElementById(g_ID_RESET_BUTTON);
  var save_button     = document.getElementById(g_ID_SAVE_BUTTON);
  var download_legend = document.getElementById(g_ID_DOWNLOAD_LEGEND);

  var color_space_dropdown    = document.getElementById(g_ID_COLOR_SPACE);
  var hue_angle_offset_slider = document.getElementById(g_ID_HUE_ANGLE_OFFSET);
  var reduce_dimension_select = document.getElementById(g_ID_REDUCE_DIMENSION);

  // Lightness elements
  var abundant_samples_are_select = document.getElementById(g_ID_ABUNDANT_SAMPLES_ARE);
  var avg_method_dropdown         = document.getElementById(g_ID_AVG_METHOD);
  var lightness_min_input         = document.getElementById(g_ID_LIGHTNESS_MIN);
  var lightness_max_input         = document.getElementById(g_ID_LIGHTNESS_MAX);
  var correct_luminance           = document.getElementById(g_ID_CORRECT_LUMINANCE);

  // Chroma elements
  var chroma_method_input   = document.getElementById(g_ID_CHROMA_METHOD);
  var chroma_min_input      = document.getElementById(g_ID_CHROMA_MIN);
  var chroma_max_input      = document.getElementById(g_ID_CHROMA_MAX);
  var even_leaves_are_input = document.getElementById(g_ID_EVEN_LEAVES_ARE);

  var biom_conversion_style = document.getElementById(g_ID_BIOM_CONVERSION_STYLE);

  // Here are options for palette style
  var palette                   = document.getElementById(g_ID_PALETTE);
  var leaf_position_method      = document.getElementById(g_ID_LEAF_POSITION_METHOD);
  var correct_palette_lightness = document.getElementById(g_ID_CORRECT_PALETTE_LIGHTNESS);

  var biom_reader    = new FileReader();
  biom_reader.onload = set_biom_str;

  // Set up all the listeners.
  uploader.addEventListener("change", function () {
    undisable(g_ID_SUBMIT_BUTTON);
    undisable(g_ID_RESET_BUTTON);
    disable_save_button();

    update_form_vals();
  });

  color_space_dropdown.addEventListener("change", undisable_and_update);
  avg_method_dropdown.addEventListener("change", undisable_and_update);
  hue_angle_offset_slider.addEventListener("change", undisable_and_update);
  reduce_dimension_select.addEventListener("change", undisable_and_update);
  abundant_samples_are_select.addEventListener("change", undisable_and_update);
  download_legend.addEventListener("change", undisable_and_update);
  chroma_method_input.addEventListener("change", undisable_and_update);
  even_leaves_are_input.addEventListener("change", undisable_and_update);
  correct_luminance.addEventListener("change", undisable_and_update);

  // Palette opts
  palette.addEventListener("change", undisable_and_update);
  leaf_position_method.addEventListener("change", undisable_and_update);
  correct_palette_lightness.addEventListener("change", undisable_and_update);

  biom_conversion_style.addEventListener("change", hide_correct_opts_div);


  lightness_min_input.addEventListener("change", function () {
    undisable_and_update();

    // Make sure the vals are still good.
    if (isNaN(g_val_lightness_min)) {
      jq(g_ID_LIGHTNESS_MIN).val(g_DEFAULT_LIGHTNESS_MIN);
    }
    else if (g_val_lightness_min < 0) {
      jq(g_ID_LIGHTNESS_MIN).val(0);
    }
    else if (g_val_lightness_min > g_val_lightness_max) {
      jq(g_ID_LIGHTNESS_MIN).val(g_val_lightness_max);
    }
  });
  lightness_max_input.addEventListener("change", function () {
    undisable_and_update();

    // Make sure the vals are still good.
    if (isNaN(g_val_lightness_max)) {
      jq(g_ID_LIGHTNESS_MAX).val(g_DEFAULT_LIGHTNESS_MAX);
    }
    else if (g_val_lightness_max > 100) {
      jq(g_ID_LIGHTNESS_MAX).val(100);
    }
    else if (g_val_lightness_min > g_val_lightness_max) {
      jq(g_ID_LIGHTNESS_MAX).val(g_val_lightness_min);
    }
  });
  chroma_min_input.addEventListener("change", function () {
    undisable_and_update();

    // Make sure the vals are still good.
    if (isNaN(g_val_chroma_min)) {
      jq(g_ID_CHROMA_MIN).val(g_DEFAULT_CHROMA_MIN);
    }
    else if (g_val_chroma_min < 0) {
      jq(g_ID_CHROMA_MIN).val(0);
    }
    else if (g_val_chroma_min > g_val_chroma_max) {
      jq(g_ID_CHROMA_MIN).val(g_val_chroma_max);
    }
  });
  chroma_max_input.addEventListener("change", function () {
    undisable_and_update();

    // Make sure the vals are still good.
    if (isNaN(g_val_chroma_max)) {
      jq(g_ID_CHROMA_MAX).val(g_DEFAULT_CHROMA_MAX);
    }
    else if (g_val_chroma_max > 100) {
      jq(g_ID_CHROMA_MAX).val(100);
    }
    else if (g_val_chroma_min > g_val_chroma_max) {
      jq(g_ID_CHROMA_MAX).val(g_val_chroma_min);
    }
  });
  submit_button.addEventListener("click", function () {
    disable(g_ID_SUBMIT_BUTTON);
    undisable(g_ID_RESET_BUTTON);

    update_form_vals();

    upload_file();
  }, false);
  reset_button.addEventListener("click", function () {
    disable(g_ID_RESET_BUTTON);

    // Turn the submit off because it will turn back on once a mapping file is uploaded.
    disable(g_ID_SUBMIT_BUTTON);
    disable_save_button();

    document.getElementById("biom-file-upload-form").reset();

    update_form_vals();
  });
  save_button.addEventListener("click", function () {
    save_result();
  });

}
