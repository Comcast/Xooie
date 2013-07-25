/**
 * class Xooie.helpers
 *
 * A collection of helper methods used by Xooie modules.
 **/

define('xooie/helpers', ['jquery'], function($){

  var helpers = {
/**
 * Xooie.helpers.toAry(str) -> Array
 * - str (String | Array): The string to be converted to an array, or an array.
 *
 * Converts a string to an array, or returns the passed argument if it is already an array.  Used
 * when parsing data attributes that can be either a space-delineated string or an array.
 **/
    toAry: function(str) {
        if (typeof str === 'string') {
            return str.split(/\s+/);
        } else if (str instanceof Array) {
            return str;
        }
    }
  };

  return helpers;
});