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

/**
 * class Xooie.Widget
 *
 * The base xooie widget.  This widget contains all common functionality for Xooie widgets but does not provide
 * specific functionality.
 **/

define('xooie/widgets/base', ['jquery', 'xooie/xooie'], function($, $X) {

    var Widget;

/**
 * Xooie.Widget@xooie-init(event)
 * - event (Event): A jQuery event object
 *
 * A jQuery special event triggered when the widget is successfully initialized.  Triggers on the `root` element
 * of the widget.  This event will fire if bound after the widget is instantiated.
 **/

    $.event.special['xooie-init'] = {
        add: function(handleObj) {
            var id = $(this).data('xooieInstance');
            if (typeof id !== 'undefined') {
                var event = $.Event('xooie-init');
                event.namespace = handleObj.namespace;
                event.data = handleObj.data;

                handleObj.handler.call(this, event);
            }
        }
    };

/**
 * Xooie.Widget@xooie-refresh(event)
 * - event (Event): A jQuery event object
 *
 * A jQuery special event triggered when the widget is refreshed.  Refresh events occur when the `root` element
 * is passed to [[$X]].  Triggers on the `root` element of the widget.
 **/

    function propertyDetails (name) {
        return {
            getter: '_get_' + name,
            setter: '_set_' + name,
            processor: '_process_' + name,
            validator: '_validate_' + name,
            value: '_' + name
        };
    }

    function propertyDispatcher (name, prototype) {
        var prop = propertyDetails(name);

        if (typeof prototype[name] !== 'function') {
            prototype._definedProps.push(name);

            prototype[name] = function(value) {
                if (typeof value === 'undefined') {
                    return this[prop.getter]();
                } else {
                    return this[prop.setter](value);
                }
            };
        }
    }

    // recursively attempts to find the next available index, starting at the current
    // instanceIndex
    function cacheInstance (instance) {
        if (typeof instance !== 'undefined') {
            var index = $X._instanceIndex;

            $X._instanceIndex += 1;

            if (typeof $X._instanceCache[index] === 'undefined') {
                $X._instanceCache[index] = instance;

                return index;
            } else {
                return cacheInstance(instance);
            }
        }
    }

/**
 * new Xooie.Widget(element[, addons])
 * - element (Element | String): A jQuery-selected element or string selector for the root element of this widget
 * - addons (Array): An optional collection of [[Xooie.Addon]] classes to be instantiated with this widget
 *
 * Instantiates a new Xooie widget, or returns an existing widget if it is already associated with the elemeent passed.
 * Any addons passed into the constructor will be instantiated and added to the [[Xooie.Widget#addons]] collection.
 **/
    Widget = function(element, addons) {
        var self = this;

        element = $(element);

        //set the default options
        this._setData(element.data());

        //do instance tracking
        if (element.data('xooieInstance')) {
            if (typeof $X._instanceCache[element.data('xooieInstance')] !== 'undefined'){
                element.trigger(this.get('refreshEvent'));
                return $X._instanceCache[element.data('xooieInstance')];
            } else {
                this.cleanup();
            }
        }

        var id = cacheInstance(this);

        this.set('id', id);
        
        element.attr('data-xooie-instance', id);

        this.set('root', element);

        element.addClass(this.get('className'))
               .addClass(this.get('instanceClass'));

        //expose css rules somehow

        var initCheck = function(){
            var i;

            if (!self._extendCount || self._extendCount <= 0) {

                if (typeof addons !== 'undefined') {
                    for (i = 0; i < addons.length; i+=1) {
                        new addons[i](self);
                    }
                }

                element.trigger(self.get('initEvent'));
                self._extendCount = null;
            } else {
                setTimeout(initCheck, 0);
            }
        };

        if (typeof this._extendCount > 0) {
            setTimeout(initCheck, 0);
        } else {
            initCheck();
        }
    };

/** internal
 * Xooie.Widget._renderMethods -> Object
 *
 * A dispatch table of all supported template render methods.
 *
 * ##### Supported Frameworks
 *
 * - **mustache**: [http://mustache.github.io/]
 * - **jsrender**: [https://github.com/BorisMoore/jsrender]
 * - **underscore**: [http://underscorejs.org/]
 **/
    Widget._renderMethods = {
        //TODO: make this a default template
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

//CLASS METHODS

/**
 * Xooie.Widget.defineWriteOnly(name)
 * - name (String): The name of the property to define as a write-only property
 *
 * Defines a write-only property that can be set using [[Xooie.Widget#set]] or by passing a value to
 * the `{{name}}` method on teh instance of the widget.
 **/
    Widget.defineWriteOnly = function(name) {
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

/**
 * Xooie.Widget.defineReadOnly(name[, defaultValue])
 * - name (String): The name of the property to define as a read-only property.
 * - defaultValue (Object): An optional default value.
 *
 * Defines a read-only property that can be accessed either by [[Xooie.Widget#get]] or calling the `{{name}}` method
 * on the instance of the widget.
 **/
    Widget.defineReadOnly = function(name, defaultValue){
        var prop = propertyDetails(name);

        propertyDispatcher(name, this.prototype);

        if (typeof this.prototype[prop.getter] !== 'function') {
            this.prototype[prop.getter] = function() {
                var value = typeof this[prop.value] !== 'undefined' ? this[prop.value] : defaultValue;

                if (typeof this[prop.processor] === 'function') {
                    return this[prop.processor](value);
                }

                return value;
            };
        }
    };

/**
 * Xooie.Widget.define(name[, defaultValue])
 * - name (String): The name of the property to define.
 * - defaultValue: An optional default value.
 *
 * A method that defines a property as both readable and writable.  In reality it calls both [[Xooie.Widget.defineReadOnly]]
 * and [[Xooie.Widget.defineWriteOnly]].
 **/
    Widget.define = function(name, defaultValue){
        this.defineReadOnly(name, defaultValue);
        this.defineWriteOnly(name);
    };

/**
 * Xooie.Widget.extend(constructor)
 * - constructor (Function): The constructor for the new [[Xooie.Widget]] class.
 *
 * Creates a new Xooie widget class that inherits all properties from the extended class.
 * Constructors for the class are called in order from the top-level constructor to the
 * base Widget constructor.
 **/
    Widget.extend = function(constructor){
        var _super = this,
            _child;

        _child = function() {
            _super.apply(this, arguments);
            constructor.apply(this, arguments);
            this._extendCount -= 1;
        };

        $.extend(true, _child, _super);
        $.extend(true, _child.prototype, _super.prototype);

        _child.prototype._extendCount = _child.prototype._extendCount === null ? 1 : _child.prototype._extendCount += 1;

        return _child;
    };

/**
 * Xooie.Widget.createStyleRule(selector, properties)
 * - selector (String): The selector used to identify the rule.
 * - properties (Object): A hash of key/value pairs of css properties and values.
 *
 * Creates a new css rule in the Xooie stylesheet.  If the rule exists, it will overwrite said rule.
 **/
    Widget.createStyleRule = function(selector, properties) {
        if (typeof $X._stylesheet.addRule !== 'undefined') {
            $X._stylesheet.addRule(selector, properties);
        }
    };

/**
 * Xooie.Widget.getStyleRule(selector) -> cssRule | undefined
 * - selector (String): The selector used to identify the rule.
 *
 * Retrieves the css rule from the Xooie stylesheet using the provided `selector`.  If the rule is not
 * present in [[$X._styleRules]] then the method will check in [[$X._stylesheet]].
 **/
    Widget.getStyleRule = function(selector) {
        if ($X._styleRules.hasOwnProperty(selector)) {
            return $X._styleRules[selector];
        } else {
            return $X._stylesheet.getRule(selector);
        }
    };

/** internal
 * Xooie.Widget#_definedProps -> Array
 *
 * A collection of properties that have been defined for this class instance.
 **/
    Widget.prototype._definedProps = [];

/** internal, read-only
 * Xooie.Widget#_extendCount -> Integer | null
 *
 * Tracks the number of constructors that need to be called.
 **/
    Widget.prototype._extendCount = null;

//PROPERTY DEFINITIONS

/** internal
 * Xooie.Widget#_id -> Integer
 *
 * The id of this widget.  This value is used to keep track of the instance.
 **/
/**
 * Xooie.Widget#id([value]) -> Integer
 * - value: an optional value to be set.
 *
 * The method for setting or getting [[Xooie.Widget#_id]].  Returns the current value of
 * [[Xooie.Widget#_id]] if no value is passed or sets the value.
 **/
    Widget.define('id');

/** internal
 * Xooie.Widget#_root -> Element
 *
 * The root DOM element associated with this widget.  This is a jQuery-selected element.
 **/
/**
 * Xooie.Widget#root([value]) -> Element
 * - value: an optional value to be set.
 *
 * The method for setting or getting [[Xooie.Widget#_root]].  Returns the current value of
 * [[Xooie.Widget#_root]] if no value is passed or sets the value.
 **/
    Widget.define('root');

/** internal
 * Xooie.Widget#_namespace -> String
 *
 * The namespace of the widget.  This value is used for determining the value of [[Xooie.Widget#className]],
 * [[Xooie.Widget#refreshEvent]], [[Xooie.Widget#initEvent]], and [[Xooie.Widget#instanceClass]].
 **/
/**
 * Xooie.Widget#namespace([value]) -> String
 * - value: an optional value to be set.
 *
 * The method for setting or getting [[Xooie.Widget#_namespace]].  Returns the current value of
 * [[Xooie.Widget#_namespace]] if no value is passed or sets the value.
 **/
    Widget.define('namespace', '');

/** internal
 * Xooie.Widget#_templateLanguage -> String
 *
 * Determines the template framework to use.
 * Default: `micro_template`.
 **/
/**
 * Xooie.Widget#templateLanguage([value]) -> String
 * - value: an optional value to be set.
 *
 * The method for setting or getting [[Xooie.Widget#_templateLanguage]].  Returns the current value of
 * [[Xooie.Widget#_templateLanguage]] if no value is passed or sets the value.
 **/
    Widget.define('templateLanguage', 'micro_template');

/** internal, read-only
 * Xooie.Widget#_addons -> Object
 *
 * A collection of addons instantiated addons associated with this widget.
 * Default: `{}`.
 **/
/** read-only
 * Xooie.Widget#addons([value]) -> Object
 * - value: an optional value to be set.
 *
 * The method for setting or getting [[Xooie.Widget#_addons]].  Returns the current value of
 * [[Xooie.Widget#_addons]] if no value is passed or sets the value.
 **/
    Widget.defineReadOnly('addons', {});

/** internal, read-only
 * Xooie.Widget#_refreshEvent -> String
 *
 * The name of the event that is triggered when the module is refreshed.  Refresh events are triggered
 * when the root element of this widget is passed to [[$X]].
 * Default: `xooie-refresh`.
 **/
/** read-only
 * Xooie.Widget#refreshEvent([value]) -> String
 * - value: an optional value to be set.
 *
 * The method for setting or getting [[Xooie.Widget#_refreshEvent]].  Returns the current value of
 * [[Xooie.Widget#_refreshEvent]] if no value is passed or sets the value.
 **/
    Widget.defineReadOnly('refreshEvent', 'xooie-refresh');

/** internal, read-only
 * Xooie.Widget#_initEvent -> String
 *
 * The name of the event that is triggered when the module is initialized.  The initialization event
 * is not triggered until all addons have been instantiated.
 * Default: `xooie-init`.
 **/
/** read-only
 * Xooie.Widget#initEvent([value]) -> String
 * - value: an optional value to be set.
 *
 * The method for setting or getting [[Xooie.Widget#_initEvent]].  Returns the current value of
 * [[Xooie.Widget#_initEvent]] if no value is passed or sets the value.
 **/
    Widget.defineReadOnly('initEvent', 'xooie-init');

/** internal, read-only
 * Xooie.Widget#_className -> String
 *
 * The string class name that is applied to the root element of this widget when it is instantiated.
 * Default: `is-instantiated`.
 **/
/** read-only
 * Xooie.Widget#className([value]) -> String
 * - value: an optional value to be set.
 *
 * The method for setting or getting [[Xooie.Widget#_className]].  Returns the current value of
 * [[Xooie.Widget#_className]] if no value is passed or sets the value.
 **/
    Widget.defineReadOnly('className', 'is-instantiated');

/** internal, read-only
 * Xooie.Widget#_instanceClass -> String
 *
 * A class that is generated and applied to the root element of the widget.
 * Default: `{{namespace}}-{{id}}`
 **/
/** read-only
 * Xooie.Widget#instanceClass([value]) -> String
 * - value: an optional value to be set.
 *
 * The method for setting or getting [[Xooie.Widget#_instanceClass]].  Returns the current value of
 * [[Xooie.Widget#_instanceClass]] if no value is passed or sets the value.
 **/
    Widget.defineReadOnly('instanceClass');


//PROTOTYPE DEFINITIONS

/** internal
 * Xooie.widget#_setData(data)
 * - data (Object): A collection of key/value pairs.
 *
 * Sets the properties to the values specified, as long as the property has been defined.
 **/
    Widget.prototype._setData = function(data) {
        var i;

        for (i = 0; i < this._definedProps.length; i+=1) {
            if (typeof data[this._definedProps[i]] !== 'undefined') {
                this.set(this._definedProps[i], data[this._definedProps[i]]);
            }
        }
    };

/**
 * Xooie.Widget#set(name, value)
 * - name (String): The name of the property to be set.
 * - value: The value of the property to be set.
 *
 * Sets a property, so long as that property has been defined.
 **/
    Widget.prototype.set = function(name, value) {
        var prop = propertyDetails(name);

        if (typeof this[prop.setter] === 'function') {
            this[prop.setter](value);
        }
    };

/**
 * Xooie.Widget#get(name) -> object
 * - name (String): The name of the property to be retrieved.
 *
 * Retrieves the value of the property.  Returns `undefined` if the property has not been defined.
 **/
    Widget.prototype.get = function(name) {
        var prop = propertyDetails(name);

        return this[prop.getter]();
    };

/**
 * Xooie.Widget#cleanup()
 *
 * Removes the `className` and `instanceClass` classes and `data-xooie-instance` attribute from the root element.
 * Calls [[Xooie.Addon.cleanup]] for each addon.  This will permit the instance to be garbage collected.
 **/
    Widget.prototype.cleanup = function() {
        var name;

        for (name in this.addons()) {
            if (this.addons().hasOwnProperty(name)) {
                this.addons()[name].cleanup();
            }
        }

        this.root().removeClass(this.className());
        this.root().removeClass(this.instanceClass());
        this.root().attr('data-xooie-instance', false);
    };

/**
 * Xooie.Widget#render(template, view) -> Element
 * - template (Element): A jQuery-selected script element that contains the template to be rendered.
 * - view (Object): The data to be passed to the template when it is rendered.
 *
 * Renders the template with the provided data by calling the method in [[Xooie.Widget.renderMethods]] based on the
 * template language specified.  Returns `$('<span>Error rendering template</span>')` when an error occurs
 **/
    Widget.prototype.render = function(template, view) {
        var language = template.data('templateLanguage') || this.templateLanguage(),
            result = Widget._renderMethods[language](template, view);

        if (result === false) {
            return $('<span>Error rendering template</span>');
        } else {
            return result;
        }
    };

/** internal
 * Xooie.Widget#_process_refreshEvent(refreshEvent) -> String
 * - refreshEvent (String): The unmodified refreshEvent string.
 *
 * Adds the [[Xooie.Widget#namespace]] to the `refreshEvent`
 **/
    Widget.prototype._process_refreshEvent = function(refreshEvent){
        return this.namespace() === '' ? refreshEvent : refreshEvent + '.' + this.namespace();
    };

/** internal
 * Xooie.Widget#_process_initEvent(initEvent) -> String
 * - initEvent (String): The unmodified initEvent string.
 *
 * Adds the [[Xooie.Widget#namespace]] to the `initEvent`
 **/
    Widget.prototype._process_initEvent = function(initEvent){
        return this.namespace() === '' ? initEvent : initEvent + '.' + this.namespace();
    };

/** internal
 * Xooie.Widget#_process_className(className) -> String
 * - className (String): The unmodified className string.
 *
 * Adds the [[Xooie.Widget#namespace]] to the `className`
 **/
    Widget.prototype._process_className = function(className) {
        return this.namespace() === '' ? className : className + '-' + this.namespace();
    };

/** internal
 * Xooie.Widget#_process_instanceClass() -> String
 *
 * Creates an instanceClass string from the [[Xooie.Widget#namespace]] and [[Xooie.Widget#id]].
 **/
    Widget.prototype._process_instanceClass = function() {
        return this.namespace() === '' ? 'widget-' + this.id() : this.namespace() + '-' + this.id();
    };

    return Widget;
});
