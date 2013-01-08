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

define(['jquery', 'xooie', 'xooie/stylesheet'], function($, $X, Stylesheet) {
    var Base = function(name, constructor) {
        var instances, defaultOptions, instanceCounter, initEvent, instanceName, cssRules, stylesInstance, className, Xooie;

        instances = [];

        defaultOptions = {};

        name = name.toLowerCase();
        initEvent = name + 'Init';
        instanceName = name + '-instance';
        instanceCounter = 0;
        className = 'is-' + name + '-instantiated';

        cssRules = {};
        stylesInstance = new Stylesheet('Xooie');

        Xooie = function(root) {
            this.root = $(root);

            if (this.root.data(instanceName)) {
                return instances[this.root.data(instanceName)];
            }
            instanceCounter++;
            instances[instanceCounter] = this;
            this.root.data(instanceName, instanceCounter);

            this.root.attr('id', name + '-' + instanceCounter);

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
                    require([addon_name], function(Addon){
                        new Addon(self);
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

        Xooie.setCSSRules = function(rules){
            var rule;

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
        }
    };

    return Base;
});
