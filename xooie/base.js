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
     //things I want to be able to do:
    //  Extend and module
    //  create stylesheet that can be modified

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

    function propertyDetails (name) {
        return {
            getter: '_get_' + name,
            setter: '_set_' + name,
            procesor: '_process_' + name,
            validator: '_validate_' + name,
            value: '_' + name
        };
    }

    function propertyDispatcher (name, prototype) {
        var prop = propertyDetails(name);

        if (typeof prototype[name] !== 'function') {
            definedProps.push(name);

            prototype[name] = function(value) {
                if (typeof value === 'undefined') {
                    return this[prop.getter]();
                } else {
                    return this[prop.setter](value);
                }
            };
        }
    }

    var Base,
        definedProps, instances, instanceId,
        _stylesheet;

    //an array of all properties that have been defined
    definedProps = [];

    //An array that contains all instances of all instantiated modules.
    instances = [];

    Base = function(element) {
        this.root = $(element);

        //cache the root data
        this._data = this.root.data();

        //set the default options
        this.setData();

        //do instance tracking
        if (this.root.data('instance')) {
            this.root.trigger(this.get('refreshEvent'));
            return instances[this.root.data('instance')];
        }

        //set instanceId to the index of the newly-pushed element...
        var instanceId = (instances.push(this)) - 1;

        //...and set the instance value on the root element to that id.
        //It is set as an attribute so it can be selected via css
        this.root.atrr('data-instance', instanceId);

        //create stylesheet object

        //extend cssRules object

        //load addons - this is where it gets tricky.
        //addons need to be loaded AFTER the constructor is called.
    };

    //CLASS METHODS

    Base.defineWritable = function(name) {
        var prop = propertyDetails(name);

        propertyDispatcher(name, this.prototype);

        if (typeof this.prototype[prop.setter] !== 'function') {
            this.prototype[prop.setter] = function(value){
                if (typeof this[prop.valiator] !== 'function' || this[prop.validator](name)) {
                    this[prop.value] = value;
                }
            };
        }
    };

    Base.defineReadable = function(name, defaultValue){
        var prop = propertyDetails(name);

        propertyDispatcher(name);

        if (typeof this.prototype[prop.getter] !== 'function') {
            this.prototype[prop.getter] = function() {
                var value = typeof this[prop.name] !== 'undefined' ? this[prop.name] : defaultValue;

                if (typeof this[prop.processor] === 'function') {
                    return this[prop.processor](value);
                }

                return value;
            };
        }
    };

    Base.define = function(name, defaultValue){
        this.defineReadable(name, defaultValue);
        this.defineWriteable(name);
    };

    Base.extend = function(constructor){
        var _super = this;

        //set the base constructor as the super?
        // -- could be problematic, expecially if we keep extending

        constructor = constructor || function(element){ _super.apply(this, element); };

        $.extend(true, constructor, _super);

        return constructor;
    };

    Base.setStyleRules = function(rules){
        if (typeof _stylesheet === 'undefined') {
            _stylesheet = new Stylesheet('Xooie');
        }

        var rule;

        if(typeof _stylesheet.addRule === 'undefined'){
            return;
        }

        for (rule in rules){
            _stylesheet.addRule(rule, rules[rule]);
        }
    };


    //PROPERTY DEFINITIONS

    Base.define('namespace', '');

    Base.define('templateLanguage', 'micro_template');

    Base.defineReadable('refreshEvent', 'xooie-refresh');

    Base.defineReadable('initEvent', 'xooie-init');

    Base.defineReadable('className', 'is-instantiated');


    //PROTOTYPE DEFINITIONS

    Base.prototype.set = function(name, value) {
        var prop = propertyDetails(name);

        if (typeof this[prop.setter] === 'function') {
            this[prop.setter](name, value);
        }
    };

    Base.prototype.get = function(name) {
        var prop = propertyDetails(name);

        return this[prop.getter]();
    };

    Base.prototype.setData = function() {
        var i;

        for (i = 0; i < definedProps.length; i+=1) {
            if (typeof this._data[definedProps[i]] !== 'undefined') {
                this.set(definedProps[i], this._data[definedProps[i]]);
            }
        }
    };

    Base.prototype._process_refreshEvent = function(refreshEvent){
        return refreshEvent + '.' + this.get('namespace');
    };

    Base.prototype._process_initEvent = function(initEvent){
        return initEvent + '.' + this.get('namespace');
    };

    Base.prototype._process_className = function(className) {
        return className + '-' + this.get('namespace');
    };

    //Template rendering
    //Base.defaultTemplateLanguage = 'micro_template';
    //render methods could be private...
    Base.renderMethods = {
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

    /*Base.getDefaultOptions = function(){
        return defaultOptions || {};
    };

    Base.setDefaultOptions = function(options) {
        if (typeof options !== 'undefined') {
            $.extend(defaultOptions, options);
        }
    };*/

    Base.garbageCollect = function() {
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

    Base.prototype = {
        loadAddon: function(addon){
            var self = this,
                addon_name = $X.mapName(addon, 'addons', 'xooie/addons/');

            if (typeof this.addons === 'undefined') {
                this.addons = {};
            }

            try {
                $X._requireShim(addon_name, function(Addon){
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



    var _Base = function(name, constructor) {
        var instances, defaultOptions, instanceCounter, initEvent, instanceName, cssRules, stylesInstance, className, Xooie;

        //instances = [];

        //defaultOptions = {};

        name = name.toLowerCase();
        initEvent = 'xooie-init.' + name;
        refreshEvent = 'xooie-refresh.' + name;
        instanceName = name + '-instance';
        instanceCounter = 0;
        className = 'is-' + name + '-instantiated';

        //cssRules = {};
        //stylesInstance = new Stylesheet('Xooie');

        Xooie = function(root) {
            //this.root = $(root);
            //this._name = name;

            //if (this.root.data(instanceName)) {
            //    this.root.trigger(refreshEvent);
            //    return instances[this.root.data(instanceName)];
            //}
            //instanceCounter+=1;
            //instances[instanceCounter] = this;
            //this.root.data(instanceName, instanceCounter);

            //this.instanceClass = this._name + '-' + instanceCounter;
            //this.root.addClass(this.instanceClass);

            //this.options = $.extend({}, Xooie.getDefaultOptions(), this.root.data());

            //expose the stylesheet for this widget to each instance
            //this.stylesheet = stylesInstance;

            //expose the common css rules
            //this.cssRules = $.extend({}, cssRules);

            var addons, i, self = this;

            //constructor.apply(this, arguments);

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

    //Base.default_template_language = 'micro_template';

    

    return Base;
});
