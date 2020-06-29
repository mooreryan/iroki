var IROKI = (function (iroki) {
  /**
   * This module contains functions for dealing with arrays.
   */
  iroki.ary = (function (ary) {
    /**
     * Sort an array numerically, in place.  ie [1, 2, 10] rather than [1, 10, 2].
     * @param ary the array to be sorted in place.
     */
    ary.in_place_numeric_sort = function (ary) {
      ary.sort(function (a, b) {
        return a - b;
      });
    };

    return ary;
  }(iroki.ary || {}));

  return iroki;
}(IROKI || {}));
