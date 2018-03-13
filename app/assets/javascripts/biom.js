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
}


// handle upload button


// Handle the biom upload form

/**
 * Calls biom__save_abundance_colors once the file is uploaded.  Sets up all the listeners and manages the form values.  It is called directly on the biom.html.slim page.
 */
function biom__upload_button() {
  function handleFiles() {
    submit_button.setAttribute("disabled", "");
    var file = uploader.files[0];
    if (file) {
      biom_reader.readAsText(file);
    }
    else {
      alert("Don't forget to select a biom file!");
    }
  }

  function undisable_and_update() {
    undisable("submit-button");
    undisable("reset-button");

    update_form_vals();
  }

  /**
   * Sets up the params needed for biom__save_abundance_colors (and fn.parsed_biom.new).
   *
   * @param biom_str
   * @return {Object}
   */
  function set_params(biom_str) {
    update_form_vals();

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

      // These are required for fn.parsed_biom.colors
      lightness_min: g_val_lightness_min,
      lightness_max: g_val_lightness_max,
      lightness_reversed: g_val_abundant_samples_are === g_ID_ABUNDANT_SAMPLES_ARE_DARK,

      chroma_min: g_val_chroma_min,
      chroma_max: g_val_chroma_max,
      chroma_reversed: g_val_even_leaves_are === g_ID_EVEN_LEAVES_ARE_MORE_SATURATED,

      evenness_absolute: g_val_chroma_method === g_ID_CHROMA_METHOD_EVENNESS_ABSOLUTE,

      correct_luminance: g_val_correct_luminance,

      projection_type: opts_for_reduced_dimension.projection_type,
      sing_vals_to_keep: opts_for_reduced_dimension.sing_vals_to_keep
    };
  }

  disable("submit-button");
  disable("reset-button");
  update_form_vals();


  var submit_id   = "submit-button";
  var uploader_id = "uploader";

  // Upload elements
  var uploader        = document.getElementById(uploader_id);
  var submit_button   = document.getElementById(submit_id);
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

  var biom_reader = new FileReader();


  // Set up all the listeners.
  uploader.addEventListener("change", undisable_and_update);
  color_space_dropdown.addEventListener("change", undisable_and_update);
  avg_method_dropdown.addEventListener("change", undisable_and_update);
  hue_angle_offset_slider.addEventListener("change", undisable_and_update);
  reduce_dimension_select.addEventListener("change", undisable_and_update);
  abundant_samples_are_select.addEventListener("change", undisable_and_update);
  download_legend.addEventListener("change", undisable_and_update);
  chroma_method_input.addEventListener("change", undisable_and_update);
  even_leaves_are_input.addEventListener("change", undisable_and_update);
  correct_luminance.addEventListener("change", undisable_and_update);

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
    undisable("reset-button");

    update_form_vals();

    handleFiles();
  }, false);
  document.getElementById("reset-button").addEventListener("click", function () {
    disable("reset-button");

    // Turn the submit off because it will turn back on once a mapping file is uploaded.
    disable("submit-button");

    document.getElementById("biom-file-upload-form").reset();

    update_form_vals();
  });

  // Process the biom file once it is finished loading.
  biom_reader.onload = function (event) {
    var biom_str = event.target.result;

    var params = set_params(biom_str);

    biom__save_abundance_colors(params);
  };
}
