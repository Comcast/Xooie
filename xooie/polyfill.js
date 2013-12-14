/* Polyfill methods for Xooie */

define('xooie/polyfill', [], function () {
  'use strict';
  // Adds Array.prototype.indexOf functionality to IE<9 (From MDN)
  if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (searchElement, fromIndex) {
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
      var f, args;

      f = this;
      args = Array.prototype.slice.call(arguments, 1);

      return function () {
        return f.apply(context, args.concat(Array.prototype.slice.call(arguments)));
      };
    };
  }

});