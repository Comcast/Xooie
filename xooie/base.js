/*
*   Copyright 2012 Comcast
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

define('xooie/base', ['jquery', 'xooie', 'xooie/stylesheet'], function($, $X, Stylesheet) {
    $.event.special['xooie-init'] = {
        add: function(handleObj) {
            var control = $(this).data(handleObj.namespace + '-instance');
            if (control) {
                var event = $.Event('xooie-init');
                event.namespace = handleObj.namespace;
                event.data = handleObj.data;

                handleObj.handler.call(this, event);
            }
        }
    };

    var Base = function(name, constructor) {
        var instances, defaultOptions, instanceCounter, initEvent, instanceName, cssRules, stylesInstance, className, Xooie;

        instances = [];

        defaultOptions = {};

        name = name.toLowerCase();
        initEvent = 'xooie-init.' + name;
        refreshEvent = 'xooie-refresh.' + name;
        instanceName = name + '-instance';
        instanceCounter = 0;
        className = 'is-' + name + '-instantiated';

        cssRules = {};
        stylesInstance = new Stylesheet('Xooie');

        Xooie = function(root) {
            this.root = $(root);
            this._name = name;

            if (this.root.data(instanceName)) {
                this.root.trigger(refreshEvent);
                return instances[this.root.data(instanceName)];
            }
            instanceCounter+=1;
            instances[instanceCounter] = this;
            this.root.data(instanceName, instanceCounter);

            this.instanceClass = this._name + '-' + instanceCounter;
            this.root.addClass(this.instanceClass);

            this.options = $.extend({}, Xooie.getDefaultOptions(), this.root.data());

            //expose the stylesheet for this widget to each instance
            this.stylesheet = stylesInstance;

            //expose the common css rules
            this.cssRules = $.extend({}, cssRules);

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
                    addon_name = $X.mapName(addon, 'addons', 'xooie/addons/');

                if (typeof this.addons === 'undefined') {
                    this.addons = {};
                }

                try {
                    $X._requireShim(addon_name, function(Addon){
                        if (typeof Addon === 'function') {
                            new Addon(self);
                        }
                    });
                } catch (e) {
                    //need to determine how to handle missing addons
                }
            },

            render: function(template, view) {
                var language = template.data('templateLanguage') || Base.default_template_language,
                    result = Base.render[language](template, view);

                if (result === false) {
                    return $('<span>Error rendering template</span>');
                } else {
                    return result;
                }
            },

            cleanup: function() {
                var name;

                for (name in this.addons) {
                    if (this.addons.hasOwnProperty(name)) {
                        this.addons[name].cleanup();
                    }
                }

                this.root.removeClass(className);
                this.root.removeClass(this.instanceClass);
                this.root.data(instanceName, false);
            }

        };

        Xooie.setCSSRules = function(rules){
            var rule;

            if(typeof stylesInstance.addRule === 'undefined'){
                return;
            }

            for (rule in rules){
                cssRules[rule] = stylesInstance.addRule(rule, rules[rule]);
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

        Xooie.garbageCollect = function() {
            var id, instance;

            for (id in instances) {
                if (instances.hasOwnProperty(id)) {
                    instance = instances[id];

                    if (instance.root.parents('body').length === 0) {
                        instance.cleanup();
                        delete instances[id];
                    }
                }
            }
        };

        $X.registeredClasses.push(Xooie);

        return Xooie;
    };

    Base.default_template_language = 'micro_template';

    Base.render = {
        'micro_template': function(template, view) {
            if (typeof template.micro_render !== 'undefined') {
                return $(template.micro_render(view));
            } else {
                return false;
            }
        },

        'mustache': function(template, view) {
            if (typeof Mustache !== 'undefined' && typeof Mustache.render !== 'undefined') {
                return $(Mustache.render(template.html(), view));
            } else {
                return false;
            }
        },

        'jsrender': function(template, view) {
            if (typeof template.render !== 'undefined') {
                return $(template.render(view));
            } else {
                return false;
            }
        },

        'underscore': function(template, view) {
            if (typeof _ !== 'undefined' && typeof _.template !== 'undefined') {
                return $(_.template(template.html())(view).trim());
            } else {
                return false;
            }
        }
    };

    return Base;
});
