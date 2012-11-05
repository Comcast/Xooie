define('cimspire/ui/base', ['jquery'], function($) {
    var Base = function(name, constructor) {
        var defaultOptions = {},
            instances = [], instanceCounter = 0,
            initEvent = name.toLowerCase() + 'Init',
            instanceName = name.toLowerCase() + '-instance',
            className = 'is-' + name.toLowerCase() + '-instantiated',

            wrapper = function(root) {
                this.root = $(root);

                if (this.root.data(instanceName)) {
                    return instances[this.root.data(instanceName)];
                }
                instanceCounter++;
                instances[instanceCounter] = this;
                this.root.data(instanceName, instanceCounter);

                this.options = $.extend({}, wrapper.getDefaultOptions(), this.root.data());

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

            wrapper.prototype = {
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

        wrapper.getDefaultOptions = function(){
            return defaultOptions;
        };

        wrapper.setDefaultOptions = function(options) {
            if (typeof options !== 'undefined') {
                $.extend(defaultOptions, options);
            }
        };

        return wrapper;
    };

    return Base;
});
