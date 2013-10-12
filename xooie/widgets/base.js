/*
* Copyright 2012 Comcast
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

/**
 * class Xooie.Widget
 *
 * The base xooie widget.  This widget contains all common functionality for Xooie widgets but does not provide
 * specific functionality.
 **/

define('xooie/widgets/base', ['jquery', 'xooie/xooie', 'xooie/helpers', 'xooie/shared'], function($, $X, helpers, shared) {

  var Widget;

/**
 * Xooie.Widget@xooie-init(event)
 * - event (Event): A jQuery event object
 *
 * A jQuery special event triggered when the widget is successfully initialized.
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
 * A jQuery special event triggered when the widget is refreshed.
 **/

// Internal method to get the details for a role
  function roleDetails (name) {
    return {
      processor: '_process_role_' + name,
      renderer: '_render_role_' + name,
      getter: '_get_role_' + name,
      pluralName: name + 's',
      selector: '[data-x-role=' + name + ']'
    };
  }

// Internal method for adding role methods to the prototype
  function roleDispatcher(name, prototype, isUnique) {
    var role = roleDetails(name),
        methodName = isUnique ? name : role.pluralName;

    if (helpers.isUndefined(prototype[methodName])) {
      prototype._definedRoles.push(name);

      prototype[methodName] = function() {
        return this[role.getter]();
      };
    }
  }

// Internal method that recursively checks for the next available index in $X._instanceCache using $X._instanceIndex as a reference point.  Returns the index.
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
 * Instantiates a new Xooie widget, or returns an existing widget if it is already associated with the element passed.
 * Any addons passed into the constructor will be instantiated and added to the [[Xooie.Widget#addons]] collection.
 **/
  Widget = shared.create(function(element, addons) {
    var self = this;

    element = $(element);

    // set the default options
    shared.setData(this, element.data());

    // do instance tracking
    if (element.data('xooieInstance')) {
      if (typeof $X._instanceCache[element.data('xooieInstance')] !== 'undefined'){
        element.trigger(this.get('refreshEvent'));
        return $X._instanceCache[element.data('xooieInstance')];
      } else {
        this.cleanup();
      }
    }

    // bind the initEvent and refreshEvent
    element.on(this.get('initEvent') + ' ' + this.get('refreshEvent'), function(){
      self._applyRoles();
    });

    var id = cacheInstance(this);

    element.attr('data-xooie-instance', id);

    this.set('id', id);

    this.set('root', element);

    element.addClass(this.get('className'))
           .addClass(this.get('instanceClass'));
  }, function(element, addons) {
    var i;

    if (typeof addons !== 'undefined') {
      for (i = 0; i < addons.length; i+=1) {
        new addons[i](this);
      }
    }

    this.root().trigger(this.get('initEvent'));

    // new keyboardNavigation();
  });

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
 * See [[Xooie.shared.defineWriteOnly]].
 **/
  Widget.defineWriteOnly = function(name) {
    shared.defineWriteOnly(this, name);
  };

/**
 * Xooie.Widget.defineReadOnly(name[, defaultValue])
 * - name (String): The name of the property to define as a read-only property.
 * - defaultValue (Object): An optional default value.
 *
 * See [[Xooie.shared.defineReadOnly]].
 **/
  Widget.defineReadOnly = function(name, defaultValue){
    shared.defineReadOnly(this, name, defaultValue);
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
 * Xooie.Widget.defineRole(name)
 * - name (String): The name of the role.
 * - isUnique (Boolean): Flags the role as unique (first element in the read order is considered)
 *
 * A method to define a role that an element may have inside this widget.
 **/
  Widget.defineRole = function(name, isUnique) {
    var role = roleDetails(name);

    roleDispatcher(name, this.prototype, isUnique);

    if (!helpers.isFunction(this.prototype[role.getter])) {
      this.prototype[role.getter] = function() {
        return isUnique ? this.root().find(role.selector + ':first') : this.root().find(role.selector);
      };
    }
  };

/**
 * Xooie.Widget.extend(constr) -> Widget
 * - constr (Function): The constructor for the new [[Xooie.Widget]] class.
 *
 * See [[Xooie.shared.create]].
 **/
  Widget.extend = function(constr, post_constr){
    return shared.create(constr, post_constr, this);
  };

/**
 * Xooie.Widget.createStyleRule(selector, properties) -> cssRule | undefined
 * - selector (String): The selector used to identify the rule.
 * - properties (Object): A hash of key/value pairs of css properties and values.
 *
 * Creates a new css rule in the Xooie stylesheet.  If the rule exists, it will add properties to the rule.
 **/
  Widget.createStyleRule = function(selector, properties) {
    if (typeof $X._stylesheet.addRule !== 'undefined') {
      return $X._stylesheet.addRule(selector, properties);
    }
  };

/**
 * Xooie.Widget.getStyleRule(selector) -> cssRule | undefined
 * - selector (String): The selector used to identify the rule.
 *
 * Retrieves the css rule from the Xooie stylesheet using the provided `selector`.  If the rule is not present in [[$X._styleRules]] then the method will check in [[$X._stylesheet]].
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

/** internal
 * Xooie.Widget#_definedRoles -> Array
 *
 * A collection of roles that have been defined for this class instance.
 **/
  Widget.prototype._definedRoles = [];

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
 * The method for setting or getting [[Xooie.Widget#_id]].  Returns the current value of [[Xooie.Widget#_id]] if no value is passed or sets the value.
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
 * The method for setting or getting [[Xooie.Widget#_root]].  Returns the current value of [[Xooie.Widget#_root]] if no value is passed or sets the value.
 **/
  Widget.define('root');

/** internal
 * Xooie.Widget#_namespace -> String
 *
 * The namespace of the widget.  This value is used for determining the value of [[Xooie.Widget#className]], [[Xooie.Widget#refreshEvent]], [[Xooie.Widget#initEvent]], and [[Xooie.Widget#instanceClass]].
 **/
/**
 * Xooie.Widget#namespace([value]) -> String
 * - value: an optional value to be set.
 *
 * The method for setting or getting [[Xooie.Widget#_namespace]].  Returns the current value of [[Xooie.Widget#_namespace]] if no value is passed or sets the value.
 **/
  Widget.define('namespace', '');

/** internal
 * Xooie.Widget#_templateLanguage -> String
 *
 * Determines the template framework to use.  Default: `micro_template`.
 **/
/**
 * Xooie.Widget#templateLanguage([value]) -> String
 * - value: an optional value to be set.
 *
 * The method for setting or getting [[Xooie.Widget#_templateLanguage]].  Returns the current value of [[Xooie.Widget#_templateLanguage]] if no value is passed or sets the value.
 **/
  Widget.define('templateLanguage', 'micro_template');

/** internal, read-only
 * Xooie.Widget#_addons -> Object
 *
 * A collection of addons instantiated addons associated with this widget.  Default: `{}`.
 **/
/** read-only
 * Xooie.Widget#addons([value]) -> Object
 * - value: an optional value to be set.
 *
 * The method for setting or getting [[Xooie.Widget#_addons]].  Returns the current value of [[Xooie.Widget#_addons]] if no value is passed or sets the value.
 **/
  Widget.defineReadOnly('addons');

/** internal, read-only
 * Xooie.Widget#_refreshEvent -> String
 *
 * The name of the event that is triggered when the module is refreshed.  Refresh events are triggered when the root element of this widget is passed to [[$X]].  Default: `xooie-refresh`.
 **/
/** read-only
 * Xooie.Widget#refreshEvent() -> String
 *
 * The method for getting [[Xooie.Widget#_refreshEvent]].
 **/
  Widget.defineReadOnly('refreshEvent', 'xooie-refresh');

/** internal, read-only
 * Xooie.Widget#_initEvent -> String
 *
 * The name of the event that is triggered when the module is initialized.  The initialization event is not triggered until all addons have been instantiated.  Default: `xooie-init`.
 **/
/** read-only
 * Xooie.Widget#initEvent() -> String
 *
 * The method for getting [[Xooie.Widget#_initEvent]].
 **/
  Widget.defineReadOnly('initEvent', 'xooie-init');

/** internal, read-only
 * Xooie.Widget#_className -> String
 *
 * The string class name that is applied to the root element of this widget when it is instantiated.  Default: `is-instantiated`.
 **/
/** read-only
 * Xooie.Widget#className() -> String
 *
 * The method for getting [[Xooie.Widget#_className]].
 **/
  Widget.defineReadOnly('className', 'is-instantiated');

/** internal, read-only
 * Xooie.Widget#_instanceClass -> String
 *
 * A class that is generated and applied to the root element of the widget.  Default: `{{namespace}}-{{id}}`
 **/
/** read-only
 * Xooie.Widget#instanceClass() -> String
 *
 * The method for getting [[Xooie.Widget#_instanceClass]].
 **/
  Widget.defineReadOnly('instanceClass');


//PROTOTYPE DEFINITIONS

/**
 * Xooie.Widget#get(name) -> object
 * - name (String): The name of the property to be retrieved.
 *
 * See [[Xooie.shared.get]].
 **/
  Widget.prototype.get = function(name) {
    return shared.get(this, name);
  };

/**
 * Xooie.Widget#set(name, value)
 * - name (String): The name of the property to be set.
 * - value: The value of the property to be set.
 *
 * See [[Xooie.shared.set]].
 **/
  Widget.prototype.set = function(name, value) {
    return shared.set(this, name, value);
  };

/**
 * Xooie.Widget#cleanup()
 *
 * Removes all instantiation data and classes, allowing the widget to be garbage collected.
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
 * Renders the template with the provided data by calling the method in [[Xooie.Widget.renderMethods]] based on the template language specified.  Returns `$('<span>Error rendering template</span>')` when an error occurs
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
 * Xooie.Widget#_getRoleId(role, index) -> String
 * - role (String): The name of the role for which this id is being generated.
 * - index (Integer): The index at which the particular element exists in the read order.
 *
 * Generates an id string to be applied to an element of the specified role.  The format of this id string is `x-[[Xooie.Widget#id]]-{role}-{index}`.
 **/
  Widget.prototype._getRoleId = function(role, index) {
    return 'x-' + this.id() + '-' + role + '-' + index;
  };

/** internal
 * Xooie.Widget#_applyRoles()
 *
 * A method to get and process elements tagged with a defined role.
 **/
  Widget.prototype._applyRoles = function() {
    var i, j, role, elements;

    for (i=0; i < this._definedRoles.length; i+=1) {
      role = roleDetails(this._definedRoles[i]);
      elements = this[role.getter]();
      
      if (elements.length === 0 && helpers.isFunction(this[role.renderer])) {
        elements = this[role.renderer]();
      }

      if (helpers.isUndefined(elements)) {
        return;
      }

      for (j=0; j < elements.length; j+=1) {
        $(elements[j]).attr('id', this._getRoleId(this._definedRoles[i], j));
      }

      if (helpers.isFunction(this[role.processor])) {
        this[role.processor](elements);
      }
    }
  };

/** internal
 * Xooie.Widget#_process_addons(addons) -> Object
 * - addons (Object): The collection of instantiated addons for this widget
 *
 * A method to check if the addons hash has been defined
 **/
  Widget.prototype._process_addons = function(addons){
    if (typeof addons === 'undefined'){
      addons = this._addons = {};
    }

    return addons;
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
