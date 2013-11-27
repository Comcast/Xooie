/*
*   Copyright 2013 Comcast
*
*   Licensed under the Apache License, Version 2.0 (the "License");
*   you may not use this file except in compliance with the License.
*   You may obtain a copy of the License at
*
*       http://www.apache.org/licenses/LICENSE-2.0
*
*   Unless required by applicable law or agreed to in writing, software
*   distributed under the License is distributed on an "AS IS" BASIS,
*   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*   See the License for the specific language governing permissions and
*   limitations under the License.
*/

/* Polyfill methods for Xooie */

// Adds Array.prototype.indexOf functionality to IE<9 (From MDN)
if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function (searchElement, fromIndex) {
    'use strict';
    var i, pivot, length;

    pivot = fromIndex || 0;

    if (!this) {
      throw new TypeError();
    }

    length = this.length;

    if (length === 0 || pivot >= length) {
      return -1;
    }

    if (pivot < 0) {
      pivot = length - Math.abs(pivot);
    }

    for (i = pivot; i < length; i += 1) {
      if (this[i] === searchElement) {
        return i;
      }
    }
    return -1;
  };
}

// Adds Function.prototype.bind to browsers that do not support it
if (!Function.prototype.bind) {
  Function.prototype.bind = function (context) {
    'use strict';
    var f, args;

    f = this;
    args = Array.prototype.slice.call(arguments, 1);

    return function () {
      return f.apply(context, args.concat(Array.prototype.slice.call(arguments)));
    };
  };
}

/**
 * class Xooie.helpers
 *
 * A collection of helper methods used by Xooie modules.
 **/

define('xooie/helpers', [], function () {
  'use strict';

  var helpers = {
/**
 * Xooie.helpers.toAry(str) -> Array
 * - str (String | Array): The string to be converted to an array, or an array.
 *
 * Converts a string to an array, or returns the passed argument if it is already an array.  Used
 * when parsing data attributes that can be either a space-delineated string or an array.
 **/
    toAry: function (str) {
      if (typeof str === 'string') {
        return str.split(/\s+/);
      }

      if (str instanceof Array) {
        return str;
      }
    },

    toInt: function (int) {
      return parseInt(int, 10);
    },

    isArray: (function () {
      return Array.isArray || function (ary) {
        return Array.prototype.toString(ary) === '[object Array]';
      };
    }()),

    isObject: function (obj) {
      return Object.prototype.toString(obj) === '[object Object]';
    },

    isUndefined: function (obj) {
      return obj === undefined;
    },

    isFunction: function (func) {
      return typeof func === 'function';
    }
  };

  return helpers;
});