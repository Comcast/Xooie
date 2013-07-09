define('xooie_helpers', ['jquery'], function($){

  var helpers = {
    parseData: function(data) {
        if (typeof data === 'string') {
            return data.split(/\s+/);
        } else if (typeof data === 'array') {
            return data;
        }
    },

    copyObj: function(dst, src) {
        var name;

        for (name in src) {
            if (src.hasOwnProperty(name)) {
                dst[name] = src[name];
            }
        }
    }
  };

  return helpers;
});