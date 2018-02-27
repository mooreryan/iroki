// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
if (!Object.keys) {
  Object.keys = (function() {
    'use strict';
    var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
        dontEnums = [
          'toString',
          'toLocaleString',
          'valueOf',
          'hasOwnProperty',
          'isPrototypeOf',
          'propertyIsEnumerable',
          'constructor'
        ],
        dontEnumsLength = dontEnums.length;

    return function(obj) {
      if (typeof obj !== 'function' && (typeof obj !== 'object' || obj === null)) {
        throw new TypeError('Object.keys called on non-object');
      }

      var result = [], prop, i;

      for (prop in obj) {
        if (hasOwnProperty.call(obj, prop)) {
          result.push(prop);
        }
      }

      if (hasDontEnumBug) {
        for (i = 0; i < dontEnumsLength; i++) {
          if (hasOwnProperty.call(obj, dontEnums[i])) {
            result.push(dontEnums[i]);
          }
        }
      }
      return result;
    };
  }());
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
if (!Array.prototype.filter)
  Array.prototype.filter = function(func, thisArg) {
    'use strict';
    if ( ! ((typeof func === 'Function' || typeof func === 'function') && this) )
      throw new TypeError();

    var len = this.length >>> 0,
        res = new Array(len), // preallocate array
        t = this, c = 0, i = -1;
    if (thisArg === undefined)
      while (++i !== len)
        // checks to see if the key was set
        if (i in this)
          if (func(t[i], i, t))
            res[c++] = t[i];
          else
            while (++i !== len)
              // checks to see if the key was set
              if (i in this)
                if (func.call(thisArg, t[i], i, t))
                  res[c++] = t[i];

    res.length = c; // shrink down array to proper size
    return res;
  };
