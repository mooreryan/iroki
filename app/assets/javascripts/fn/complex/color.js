// Depends on chroma.js and fn.math

fn.color.var = {
  approx_starting_chroma : 60,
  approx_starting_lightness : 60
};

// lightness values should run from 0 to 100
fn.color.correct_luminance = function (hex, lightness, old_min, old_max, new_min, new_max) {
  if (lightness < 0 || lightness > 100) {
    throw Error("Lightness should be between 0 and 100.  Got: " + lightness);
  }

  var new_luminance = fn.math.scale(lightness, old_min, old_max, new_min, new_max);

  return chroma.hex(hex).luminance(new_luminance);
};

// Take a hue angle 0-360, and spit out an approx starting color as a hex code.
fn.color.approx_starting_color = function (hue) {
  var chroma_val = fn.color.var.approx_starting_chroma,
      lightness  = fn.color.var.approx_starting_lightness;

  return chroma.hcl(hue, chroma_val, lightness).hex();
};
