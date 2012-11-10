
define(['jquery'], function($) {
    var Base = function(name, constructor) {
        var instances, defaultOptions, instanceCounter, initEvent, instanceName, className, Xooie;

        instances = [];

        defaultOptions = {};

        name = name.toLowerCase();
        initEvent = name + 'Init';
        instanceName = name + '-instance';
        instanceCounter = 0;
        className = 'is-' + name + '-instantiated';

        Xooie = function(root) {
            this.root = $(root);

            if (this.root.data(instanceName)) {
                return instances[this.root.data(instanceName)];
            }
            instanceCounter++;
            instances[instanceCounter] = this;
            this.root.data(instanceName, instanceCounter);

            this.options = $.extend({}, Xooie.getDefaultOptions(), this.root.data());

            var addons, i, self = this;

            constructor.apply(this, arguments);

            this.root.addClass(className);

            if(this.options.addons) {
                addons = this.options.addons.split(' ');

                for (i = 0; i < addons.length; i += 1) {
                    this.loadAddon(addons[i]);
                }
            }

            this.root.trigger(initEvent);
        };

        Xooie.prototype = {
            loadAddon: function(addon){
                var self = this,
                    path;

                if (typeof this.addons === 'undefined') {
                    this.addons = {};
                }

                try {
                    require([addon], function(Addon){
                        new Addon(self);
                    });
                } catch (e) {
                    //need to determine how to handle missing addons
                }
            },

            render: function(template, view){
                return $(template.micro_render(view));
            }
        };

        $.event.special[initEvent] = {
            add: function(handleObj) {
                var control = $(this).data(instanceName);
                if (control) {
                    var event = $.Event(initEvent);
                    event.data = handleObj.data;

                    handleObj.handler.call(this, event);
                }
            }
        };

        Xooie.getDefaultOptions = function(){
            return defaultOptions || {};
        };

        Xooie.setDefaultOptions = function(options) {
            if (typeof options !== 'undefined') {
                $.extend(defaultOptions, options);
            }
        };

        return Xooie;
    };

    return Base;
});
