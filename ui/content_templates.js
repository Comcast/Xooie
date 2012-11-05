$(document).ready(function() {
    $('[data-content-keys],[data-content-template]').each(function() {
        var node = $(this),
            keys, template;

        if (typeof node.data('contentKeys') === 'undefined') {
            keys = [];
        } else {
            keys = node.data('contentKeys').split(/\s+/);
        }

        if (typeof node.data('contentTemplate') === 'undefined') {
            template = $.map(keys, function(k) {
                return '<#= ' + k + ' #>';
            }).join(', ');
        } else {
            template = node.data('contentTemplate');
        }

        CIM.user.get(keys, function(prefs) {
            for (var i = 0; i < keys.length; i++) {
                if (typeof prefs[keys[i]] === 'undefined') {
                    return;
                }
            }
            
            node.html($.micro_template(template, prefs));
        });
    });
});
