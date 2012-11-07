/** 
* Copyright (c) 2012 Comcast Cable Corporation.  All rights reserved.
* 
*/


requirejs.config({

});

(function($) {
    $(document).ready(function() {
        $('[data-widget-type]').each(function() {
            var node = $(this),
                types = node.data('widgetType').split(/\s+/);

            for (var i = 0; i < types.length; i++) {
                require(['xui/ui/' + types[i]], function(Widget) {
                    new Widget(node);
                });
            }
        });
    });
}(jQuery));
