define('xooie_helpers', ['jquery'], function($){

  var helpers = {
    parseData: function(data) {
        if (typeof data === 'string') {
            return data.split(/\s+/);
        } else if (typeof data === 'array') {
            return data;
        }
    }
  };

  return helpers;
});