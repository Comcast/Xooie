(function($) {
    $(document).ready(function() {
        $('[data-widget-type]').each(function() {
            var node = $(this),
                types = node.data('widgetType').split(/\s+/);

            for (var i = 0; i < types.length; i++) {
                require(['cimspire/ui/' + types[i]], function(Widget) {
                    new Widget(node);
                });
            }
        });
    });
}(jQuery));
