define('cimspire/ui/base', ['jquery'], function($) {
    var Base = function(name, constructor) {
        var defaultOptions, instances, instanceCounter, initEvent, instanceName, className, XUI;

        defaultOptions = {};

        instances = [];

        name = name.toLowerCase();
        initEvent = name + 'Init';
        instanceName = name + '-instance';
        className = 'is-' + name + '-instantiated';

        XUI = function(root) {
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

        XUI.prototype = {
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

        XUI.getDefaultOptions = function(){
            return defaultOptions || {};
        };

        XUI.setDefaultOptions = function(options) {
            if (typeof options !== 'undefined') {
                $.extend(defaultOptions, options);
            }
        };

        return XUI;
    };

    return Base;
});
