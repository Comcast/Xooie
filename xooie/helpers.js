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

/**
 * class Xooie.helpers
 *
 * A collection of helper methods used by Xooie modules.
 **/

define('xooie/helpers', ['jquery'], function ($) {
  'use strict';

  var helpers = {
/**
 * Xooie.helpers.toArray(str) -> Array
 * - str (String | Array): The string to be converted to an array, or an array.
 *
 * Converts a string to an array, or returns the passed argument if it is already an array.  Used
 * when parsing data attributes that can be either a space-delineated string or an array.
 **/
    toArray: function (str) {
      if (typeof str === 'string') {
        return str.split(/\s+/);
      }

      if (str instanceof Array) {
        return str;
      }
    },

    toInteger: function (integer) {
      return parseInt(integer, 10);
    },

    isArray: (function () {
      return Array.isArray || function (ary) {
        return Array.prototype.toString(ary) === '[object Array]';
      };
    }()),

    isObject: function (obj) {
      return $.isPlainObject(obj);
    },

    isUndefined: function (obj) {
      return obj === undefined;
    },

    isDefined: function (obj) {
      return !this.isUndefined(obj);
    },

    isFunction: function (func) {
      return typeof func === 'function';
    }
  };

  return helpers;
});