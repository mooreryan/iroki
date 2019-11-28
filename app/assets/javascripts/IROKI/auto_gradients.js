// These are tested but no specs.

var IROKI = (function (iroki) {
  /**
   * This module contains code for automatically making color gradients for stuff in the mapping file.  Most likely this will be used for bar charts.
   *
   * Methods in here will depend on chroma.js.
   */
  iroki.auto_gradients = (function (auto_gradients) {
    /**
     * Make a chroma color scale given a palett.
     *
     * @param palette This could be a named palette, e.g., "Oranges", "YlGnBu", or it can be an array of colors like, ['#f00', '#0f0'] or ['yellow', 'navy'].
     *
     * @returns a chroma scale function that takes values from 0 to 1.
     */
    auto_gradients.make_color_scale = function (palette) {
      var padding = [0.2, 0.05];

      return chroma.scale(palette).mode("lab").padding(padding).correctLightness();
    };

    /**
     * Convert values to hexcodes/gradient from the given color_scale.
     *
     * @param vals an arraw of numeric values to convert into a color gradient
     * @param color_scale a chroma scale function eg from make_color_scale.  It should take values from 0 to 1.
     * @returns an array of hexcodes same length as vals.  The first entry is the hexcode for the first entry in vals, and so on.
     */
    auto_gradients.vals_to_hexcodes = function (vals, color_scale) {
      // TODO this may throw...need to catch it.
      var min_val = fn.ary.min(vals);
      var max_val = fn.ary.max(vals);
      var new_min = 0;
      var new_max = 1;

      return vals.map(function (val) {
        var scaled_val = fn.math.scale(val, min_val, max_val, new_min, new_max);

        console.log("val")
        console.log(val)
        console.log("scaled_val")
        console.log(scaled_val)

        return color_scale(scaled_val).hex();
      });
    };

    auto_gradients.gradients_for_barcolors = function (name2md, which_bar_heights, palette) {
      var bar_heights = fn.obj.vals(name2md).map(function (obj) {
        return obj[which_bar_heights];
      });

      var color_scale = auto_gradients.make_color_scale(palette);

      var keys     = Object.keys(name2md);
      var hexcodes = auto_gradients.vals_to_hexcodes(bar_heights, color_scale);

      return hexcodes.map(function (hexcode, idx) {
        return [keys[idx], hexcode];
      });
    };

    return auto_gradients;
  }(iroki.auto_gradients || {}));
  return iroki;
}(IROKI || {}));