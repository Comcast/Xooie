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

define('xooie/helpers', ['jquery'], function($){
  var helpers = {};
/**
 * Xooie.helpers.toAry(str) -> Array
 * - str (String | Array): The string to be converted to an array, or an array.
 *
 * Converts a string to an array, or returns the passed argument if it is already an array.  Used
 * when parsing data attributes that can be either a space-delineated string or an array.
 **/
  helpers.toAry = function(str) {
    if (typeof str === 'string') {
      return str.split(/\s+/);
    } else if (str instanceof Array) {
      return str;
    }
  };

  helpers.toInt = function(int) {
    return parseInt(int, 10);
  };

  helpers.isArray = Array.isArray || function(ary) {
    return Array.prototype.toString(ary) === '[object Array]';
  };

  helpers.isObject = function(obj) {
    return Object.prototype.toString(obj) === '[object Object]';
  };

  helpers.isUndefined = function(obj) {
    return obj === void 0;
  };

  helpers.isFunction = function(func) {
    return typeof func === 'function';
  };

  return helpers;
});