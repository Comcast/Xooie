
/*
*   Copyright 2013 Comcast
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

/* Polyfill methods for Xooie */

// Adds Array.prototype.indexOf functionality to IE<9 (From MDN)
if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function (searchElement , fromIndex) {
    var i,
        pivot = (fromIndex) ? fromIndex : 0,
        length;

    if (!this) {
      throw new TypeError();
    }

    length = this.length;

    if (length === 0 || pivot >= length) {
      return -1;
    }

    if (pivot < 0) {
      pivot = length - Math.abs(pivot);
    }

    for (i = pivot; i < length; i++) {
      if (this[i] === searchElement) {
        return i;
      }
    }
    return -1;
  };
}

// Adds Function.prototype.bind to browsers that do not support it
if (!Function.prototype.bind) {
    Function.prototype.bind = function(context) {
        var f = this,
            args = Array.prototype.slice.call(arguments, 1);

        return function() {
            return f.apply(context, args.concat(Array.prototype.slice.call(arguments)));
        };
    };
}

/**
 * class Xooie.helpers
 *
 * A collection of helper methods used by Xooie modules.
 **/

define('xooie/helpers', ['jquery'], function($){
  var helpers = {};
/**
 * Xooie.helpers.toAry(str) -> Array
 * - str (String | Array): The string to be converted to an array, or an array.
 *
 * Converts a string to an array, or returns the passed argument if it is already an array.  Used
 * when parsing data attributes that can be either a space-delineated string or an array.
 **/
  helpers.toAry = function(str) {
    if (typeof str === 'string') {
      return str.split(/\s+/);
    } else if (str instanceof Array) {
      return str;
    }
  };

  helpers.toInt = function(int) {
    return parseInt(int, 10);
  };

  helpers.isArray = Array.isArray || function(ary) {
    return Array.prototype.toString(ary) === '[object Array]';
  };

  helpers.isObject = function(obj) {
    return Object.prototype.toString(obj) === '[object Object]';
  };

  helpers.isUndefined = function(obj) {
    return obj === void 0;
  };

  helpers.isFunction = function(func) {
    return typeof func === 'function';
  };

  return helpers;
});
/*
*   Copyright 2013 Comcast
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

define('xooie/stylesheet', ['jquery', 'xooie/helpers'], function($, helpers) {
    

    function nameCheck (index, name) {
        return document.styleSheets[index].ownerNode.getAttribute('id') === name;
    }

    var Stylesheet = function(name){
        var title;

        //check to see if a stylesheet already exists with this name
        this.element = $('style[id=' + name + ']');

        if (this.element.length <= 0) {
            //if it does, use it, else create a new one
            this.element = $(['<style id="' + name + '">',
                                '/* This is a dynamically generated stylesheet: ' + name + ' */',
                            '</style>'].join(''));

            this.element.appendTo($('head'));
        }

        this._name = name;
    };

    Stylesheet.prototype.get = function(){
        return document.styleSheets[this.getIndex()];
    };

    Stylesheet.prototype.getRule = function(ruleName){
        ruleName = ruleName.toLowerCase();

        var i, rules;

        //Check if this uses the IE format (styleSheet.rules) or the Mozilla/Webkit format
        rules = this.get().cssRules || this.get().rules;

        for (i = 0; i < rules.length; i += 1){
            if (rules[i].selectorText.toLowerCase() === ruleName) {
                return rules[i];
            }
        }

        return false;
    };

    Stylesheet.prototype.addRule = function(ruleName, properties){
        var rule = this.getRule(ruleName), index, prop, propString = '';

        if (!rule){
            for (prop in properties) {
                propString += prop + ': ' + properties[prop] + ';';
            }

            if (this.get().insertRule) {
                //This is the W3C-preferred method
                index = this.get().cssRules.length;
                this.get().insertRule(ruleName + ' {' + propString + '}', index);
                rule = this.get().cssRules[index];
            } else {
                //support for IE < 9
                index = this.get().rules.length;
                this.get().addRule(ruleName, propString, index);
                rule = this.get().rules[index];
            }
        }

        return rule;
    };

    Stylesheet.prototype.deleteRule = function(ruleName){
        ruleName = ruleName.toLowerCase();

        var i, rules;

        //Check if this uses the IE format (styleSheet.rules) or the Mozilla/Webkit format
        rules = this.get().cssRules || this.get().rules;

        for (i = 0; i < rules.length; i += 1){
            if (rules[i].selectorText.toLowerCase() === ruleName) {
                if (this.get().deleteRule) {
                    //this is the W3C-preferred method
                    this.get().deleteRule(i);
                } else {
                    //support for IE < 9
                    this.get().removeRule(i);
                }

                return true;
            }
        }

        return false;
    };

    Stylesheet.prototype.getIndex = function() {
        var i;

        if (helpers.isUndefined(document.styleSheets)) {
            return;
        }

        if (!helpers.isUndefined(this._index) && nameCheck(this._index, this._name)) {
            return this._index;
        } else {
            for (i = 0; i < document.styleSheets.length; i += 1){
                if (nameCheck(i, this._name)) {
                    this._index = i;
                    return i;
                }
            }
        }
    };

    return Stylesheet;

});
/*
*   Copyright 2013 Comcast
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

var $X, Xooie;

/** alias of: $X
 *  Xooie
 *
 *  Xooie is a JavaScript UI widget library.
 **/

/**
 * $X(element)
 * - element (Element | String):  A jQuery collection or string representing the DOM element to be
 * instantiated as a Xooie widget.
 *
 * Traverses the DOM, starting from the element passed to the method, and instantiates a Xooie
 * widget for every element that has a data-widget-type attribute.
 **/

$X = Xooie = (function(static_config) {
    var config = {
            widgets: {},
            addons: {}
        },
        obj = function() {
            return false;
        },
        gcTimer = null;

    function copyObj(dst, src) {
        var name;

        for (name in src) {
            if (src.hasOwnProperty(name)) {
                dst[name] = src[name];
            }
        }
    }

    function gcCallback() {
        if (typeof Xooie.cleanup !== 'undefined') {
            Xooie.cleanup();
        }
    }

/**
 * $X.config(options)
 * - options (Object): An object that describes the configuration options for Xooie.
 *
 * Defines the url strings for Xooie modules that will be used to require said modules.
 *
 * ##### Options
 *
 * - **root** (String): The location of all Xooie files.
 * Default: `xooie`.
 * - **widgets** (Object): Defines the location of widgets.  By default, Xooie will look for widgets in the
 * '/widgets' directory, relative to the `{root}`.
 * - **addons** (Object): Defines the location of addons.  By default, Xooie will look for addons in the
 * '/addons' directory, relative to the `{root}`.
 * - **cleanupInterval** (Integer): Defines the interval at which Xooie checks for instantiated widgets that are
 * no longer active in the DOM.  A value of '0' means no cleanup occurs.
 * Default: `0`.
 **/

    obj.config = function(options) {
        var name;

        for (name in options) {
            if (options.hasOwnProperty(name)) {
                if (name === 'widgets' || name == 'addons') {
                    copyObj(config[name], options[name]);
                } else {
                    config[name] = options[name];
                }
            }
        }

        if (typeof options.cleanupInterval !== 'undefined') {
            gcTimer = clearInterval(gcTimer);

            if (config.cleanupInterval > 0) {
                gcTimer = setInterval(gcCallback, config.cleanupInterval);
            }
        }
    };

/** internal
 * $X._mapName(name, type) -> String
 * - name (String): The name of the module, as determeined by the `data-widget-type` or `data-addons` properties.
 * - type (String): The type of module.  Can be either `'widget'` or `'addon'`
 *
 * Maps the name of the widget or addon to the correct url string where the module file is located.
 **/

    obj._mapName = function(name, type) {
        if (typeof config[type][name] === 'undefined') {
            return [config.root, '/', type, '/', name].join('');
        } else {
            return config[type][name];
        }
    };

    obj.config({
        root: 'xooie',
        cleanupInterval: 0
    });

    if (static_config) {
        obj.config(static_config);
    }

    return obj;
}(Xooie));

define('xooie/xooie', ['jquery', 'xooie/helpers', 'xooie/stylesheet'], function($, helpers, Stylesheet){
    var config = Xooie.config,
        _mapName = Xooie._mapName,
        widgetSelector = '[data-widget-type]';
        widgetDataAttr = 'widgetType';
        addonDataAttr = 'addons';

    $X = Xooie = function(element){
        var nodes, moduleNames, moduleUrls,
            node, url,
            i, j;

        element = $(element);

        // Find all elements labeled as widgets:
        nodes = element.find(widgetSelector);

        // If the element is also tagged, add it to the collection:
        if (element.is(widgetSelector)){
            nodes = nodes.add(element);
        }

        // This array will be the list of unique modules to load:
        moduleUrls = [];

        // Iterate through each item in the collection:
        for(i = 0; i < nodes.length; i+=1) {
            node = $(nodes[i]);

            // Add all of the widget types to the list of modules we need:
            moduleNames = helpers.toAry(node.data(widgetDataAttr));

            // For each widget we check to see if the url is already in our
            // list of urls to require:
            for (j = 0; j < moduleNames.length; j+=1) {
                url = $X._mapName(moduleNames[j], 'widgets');

                if (moduleUrls.indexOf(url) === -1) {
                    moduleUrls.push(url);
                }
            }

            // Do the same with each addon name:
            moduleNames = helpers.toAry(node.data(addonDataAttr)) || [];

            for (j = 0; j < moduleNames.length; j+=1) {
                url = $X._mapName(moduleNames[j], 'addons');

                if (moduleUrls.indexOf(url) === -1) {
                    moduleUrls.push(url);
                }
            }
        }

        // Now that we have a list of urls to load, let's load them:
        require(moduleUrls, function(){
            var widgets, addons, node,
                addonMods, widgetMod, argIndex,
                i, j, k;

            // We need to iterate through our collection of nodes again:
            for (i = 0; i < nodes.length; i+=1) {
                node = $(nodes[i]);

                // This time, we're keeping track of our addons and widges separately:
                widgets = helpers.toAry(node.data(widgetDataAttr));
                addons = helpers.toAry(node.data(addonDataAttr)) || [];

                // Iterate through each widget type:
                for (j = 0; j < widgets.length; j+=1) {

                    // Get the index of this module from the moduleUrls:
                    argIndex = moduleUrls.indexOf($X._mapName(widgets[j], 'widgets'));

                    //Get the widget that we'll be instantiating:
                    widgetMod = arguments[argIndex];

                    addonMods = [];

                    // Now get each addon that we'll instantiate with the widget:
                    for (k = 0; k < addons.length; k+=1) {
                        // Get the index of the addon module from moduleUrls:
                        argIndex = moduleUrls.indexOf($X._mapName(addons[k], 'addons'));

                        addonMods.push(arguments[argIndex]);
                    }

                    // Instantiate the new instance using the argIndex to find the right module:
                    new widgetMod(node, addonMods);
                }
            }
        });
    };

    Xooie.config = config;
    Xooie._mapName = _mapName;

/** internal, read-only
 * $X._stylesheet -> Object
 *
 * An instance of the [[Stylesheet]] class used to manipluate a dynamically created Xooie stylesheet
 **/
    Xooie._stylesheet = new Stylesheet('Xooie');

/** internal
 * $X._styleRules -> Object
 *
 * A cache of css rules defined by the [[Xooie.Widget.createStyleRule]] method.
 **/
    Xooie._styleRules = {};

/** internal
 * $X._instanceCache -> Array
 *
 * A collection of currently instantiated widgets.
 **/
    Xooie._instanceCache = [];

/** internal
 * $X._instanceIndex -> Integer
 *
 * Tracks the next available instance index in the cache.  This value also serves as the id of the
 * next instantiated widget.
 **/
    Xooie._instanceIndex = 0;
    
/**
 * $X.cleanup()
 *
 * Checks all instantiated widgets to ensure that the root element is still in the DOM.  If the
 * root element is no longer in the DOM, the module is garbage collected.
 **/

    Xooie.cleanup = function() {
        var i, instance;

        for (i = 0; i < $X._instanceCache.length; i++) {
            instance = $X._instanceCache[i];

            if (instance.root() && instance.root().parents('body').length === 0) {
                instance.cleanup();
                delete $X._instanceCache[i];
            }
        }
    };

    return Xooie;
});

require(['jquery', 'xooie/xooie'], function($, $X){
    $(document).ready(function() {
        $X($(this));
    });
});

/**
 * class Xooie.shared
 *
 * A module that contains functionality that is used both by [[Xooie.Widget]] and [[Xooie.Addon]]
 * This module exists to abstract common functionality so that it can be maintained in one place.
 * It is not intended to be used independently.
 **/
define('xooie/shared', ['jquery'], function($){

/** internal
 * Xooie.shared.propertyDetails(name) -> Object
 * - name (String): The name of the property
 *
 * Generates a hash of attributes that will be used in setting and getting the property.
 *
 * ##### Return values
 *
 * - **getter** (String): The name of the internal getter method for this property.
 * `_get_name`
 * - **setter** (String): The name of the internal setter method for this property.
 * `_set_name`
 * - **processor** (String): The name of the internal processor method for this property.
 * `_process_name`
 * - **validator** (String): The name of the internal validator method for this property.
 * `_validate_name`
 * **default** (String): The name of the internally stored default value for this property.
 * `_default_name`
 * - **value** (String): The name of the internally stored value for this property.
 * `_name`
 **/
  function propertyDetails (name) {
    return {
      getter: '_get_' + name,
      setter: '_set_' + name,
      processor: '_process_' + name,
      validator: '_validate_' + name,
      defaultValue: '_default_value_' + name,
      value: '_' + name
    };
  }

/** internal
 * Xooie.shared.propertyDispatcher(name, prototype)
 * - name (String): The name of the property
 * - prototype (Object): The prototype of the [[Xooie.Widget]] or [[Xooie.Addon]] for which the property is being set.
 *
 * Gets the [[Xooie.shared.propertyDetails]] for the property, adds the `name` to the list of [[Xooie.Widget#_definedProps]]
 * (or [[Xooie.Addon#_definedProps]]).  Adds a method called `name` to the prototype that allows this property to be set or
 * retrieved.
 **/
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

  var shared = {
/**
 * Xooie.shared.defineReadOnly(module, name[, defaultValue])
 * - module (Widget | Addon): The module on which this property will be defined.
 * - name (String): The name of the property to define as a read-only property.
 * - defaultValue (Object): An optional default value.
 *
 * Defines a read-only property that can be accessed either by [[Xooie.Widget#get]]/[[Xooie.Addon#get]] or
 * calling the `{{name}}` method on the instance of the module.
 **/
    defineReadOnly: function(module, name, defaultValue){
      var prop = propertyDetails(name);

      propertyDispatcher(name, module.prototype);

      //The default value is reset each time this method is called;
      module.prototype[prop.defaultValue] = defaultValue;

      if (typeof module.prototype[prop.getter] !== 'function') {
        module.prototype[prop.getter] = function() {
          var value = typeof this[prop.value] !== 'undefined' ? this[prop.value] : this[prop.defaultValue];

          if (typeof this[prop.processor] === 'function') {
            return this[prop.processor](value);
          }

          return value;
        };
      }
    },
/**
 * Xooie.shared.defineWriteOnly(module, name)
 * - module (Widget | Addon): The module on which this property will be defined.
 * - name (String): The name of the property to define as a write-only property
 *
 * Defines a write-only property that can be set using [[Xooie.Widget#set]]/[[Xooie.Addon#set]] or by passing
 * a value to the `{{name}}` method on the instance of the module.
 **/
    defineWriteOnly: function(module, name){
      var prop = propertyDetails(name);

      propertyDispatcher(name, module.prototype);

      if (typeof module.prototype[prop.setter] !== 'function') {
        module.prototype[prop.setter] = function(value){
          if (typeof this[prop.validator] !== 'function' || this[prop.validator](name)) {
            this[prop.value] = value;
          }
        };
      }
    },
/**
 * Xooie.shared.extend(constr, _super) -> Widget | Addon
 * - constr (Function): The constructor for the new [[Xooie.Widget]] or [[Xooie.Addon]] class.
 * - _super (Widget | Addon): The module which is to be extended
 *
 * Creates a new Xooie widget/addon class that inherits all properties from the extended class.
 * Constructors for the class are called in order from the top-level constructor to the
 * base constructor.
 **/
    extend: function(constr, module){
      var newModule = (function(){
        return function Child() {
          module.apply(this, arguments);
          constr.apply(this, arguments);
          this._extendCount -= 1;
        };
      })();
      

      $.extend(true, newModule, module);
      $.extend(true, newModule.prototype, module.prototype);

      newModule.prototype._extendCount = newModule.prototype._extendCount === null ? 1 : newModule.prototype._extendCount += 1;

      return newModule;
    },
/**
 * Xooie.shared.get(instance, name) -> object
 * - instance (Widget | Addon): The instance from which the property is to be retrieved.
 * - name (String): The name of the property to be retrieved.
 *
 * Retrieves the value of the property.  Returns `undefined` if the property has not been defined.
 **/
    get: function(instance, name){
      var prop = propertyDetails(name);

      return instance[prop.getter]();
    },
/**
 * Xooie.shared.set(instance, name, value)
 * - instance (Widget | Addon): The instance where the property is being set.
 * - name (String): The name of the property to be set.
 * - value: The value of the property to be set.
 *
 * Sets a property, so long as that property has been defined.
 **/
    set: function(instance, name, value){
      var prop = propertyDetails(name);

      if (typeof instance[prop.setter] === 'function') {
        instance[prop.setter](value);
      }
    },

/**
 * Xooie.shared.setData(instance, data)
 * - instance (Widget | Addon): The instance to set data on
 * - data (Object): A collection of key/value pairs
 *
 * Sets the properties to the values specified, as long as the property has been defined
 **/
    setData: function(instance, data) {
      var i, prop;

      for (i = 0; i < instance._definedProps.length; i++) {
        prop = instance._definedProps[i];
        if (typeof data[prop] !== 'undefined') {
          instance.set(prop, data[prop]);
        }
      }
    }

  };

  return shared;
});

define('xooie/keyboard_navigation', ['jquery', 'xooie/helpers'], function($, helpers){
  var selectors, keyboardNavigation, keybindings;


  keybindings = {
    37: function(event) {
      moveFocus($(event.target), -1);

      event.preventDefault();
    },

    38: function() {

    },

    39: function(event) {
      moveFocus($(event.target), 1);

      event.preventDefault();
    },

    40: function() {

    }
  };

/** internal
 * Xooie.Widget._moveFocus(direction)
 * - direction (Integer): Determines whether or not to increment or decrement the index.  Can be 1 or -1.
 *
 * Moves focus to either the next or previous focusable item, if available.  Focus order follows the
 * tab order of the page (items without tabindex or tabindex=0 will be focused before tabindex=1).  Focusable
 * items with a tabindex=-1 will not be focused.
 **/
  function moveFocus(current, direction) {
    // TODO: Clean this up. It's a mess
    // TODO: Write tests.
    // TODO: Add detection of new contexts
    // TODO: Add recollection of last focused item

    var selector, selectors, tabindex, index, target;

    var tabIndicies= [];

    selectors = {
      unindexed: ['[data-widget-type] a[href]:visible:not(:disabled):not([tabindex])',
        '[data-widget-type] button:visible:not(:disabled):not([tabindex])',
        '[data-widget-type] input:visible:not(:disabled):not([tabindex])',
        '[data-widget-type] select:visible:not(:disabled):not([tabindex])',
        '[data-widget-type] textarea:visible:not(:disabled):not([tabindex])',
        '[data-widget-type] [tabindex=0]:visible:not(:disabled)'].join(','),
      indexed: function(t) {
        if (t > 0) {
          return '[data-widget-type] [tabindex=' + t + ']:visible:not(:disabled)';
        }
      },
      allIndexed: '[data-widget-type] [tabindex]:visible:not(:disabled)'
    };

    // jquery select the current item
    current = $(current);

    // we may not be focused on anything.  If that's the case, focus on the first focusable item
    if (!current.is(selectors.unindexed) && !current.is(selectors.allIndexed)) {
      // get the lowest tabindex
      $(selectors.allIndexed).each(function(){
        var i = helpers.toInt($(this).attr('tabindex'));

        if (tabIndicies.indexOf(i) === -1 && i > 0) {
          tabIndicies.push(i);
        }
      });

      if (tabIndicies.length > 0) {
        tabIndicies.sort(function(a,b) { return a-b; });
      
        target = $(selectors.indexed(tabIndicies[0])).first();
      } else {
        target = $(selectors.unindexed).first();
      }

      if (target.length > 0) {
        target.focus();

        return;
      }
    }

    // get the current tabindex
    tabindex = helpers.toInt(current.attr('tabindex'));

    // check if tabindex is a number and not 0...
    if (!tabindex) {
      // if it is not, assume we're on an element that has no tab index and select other such elements
      selector = selectors.unindexed;
    } else {
      // otherwise, select all items that are of the same tabindex
      selector = selectors.indexed(tabindex);
    }

    // find the index of the current item
    index = current.index(selector);

    if (index + direction >= 0) {
      // get the next/previous item
      target = $(selector).eq(index + direction);

      // Check to see if we have a valid target...
      if (target.length > 0) {
        // if it is, focus the target and return
        target.focus();

        return;
      }
    }

    // if it is not, then we have several possibilities:
    
    // If the direction is 1 and tabindex is not a number or 0, then we are at the end of the tab order.  Do nothing.
    if (direction === 1 && !tabindex) {
      return;
    // If the direction is 1 and the tabindex is a number, then we need to check for the presence of the next tabindex
    } else if (direction === 1 && !isNaN(tabindex)) {
      // Loop through all elements with a tab index
      $(selectors.allIndexed).each(function() {
        // Build a collection of all tab indicies greater than the current tab index:
        var i = helpers.toInt($(this).attr('tabindex'));

        if (i > tabindex && tabIndicies.indexOf(i) === -1 && i > 0) {
          tabIndicies.push(i);
        }
      });

      // If there are tab indicies that are greater than the current one...
      if (tabIndicies.length > 0) {
        // sort our tab indicies ascending
        tabIndicies.sort(function(a, b) { return a-b; });

        // we now have our new tab index
        tabindex = tabIndicies[0];

        // Get the first item of the new tab index
        target = $(selectors.indexed(tabindex)).first();
      } else {
        // Otherwise, select the first unindexed item
        target = $(selectors.unindexed).first();
      }
      
    } else if (direction === -1 && isNaN(tabindex))  {
      // In this case, we are at the first non-indexed focusable item.  We need to find the last indexed item.
      // Loop through all elements with a tab index
      $(selectors.allIndexed).each(function() {
        var i = helpers.toInt($(this).attr('tabindex'));
        // Build a collection of all tab indicies
        if (tabIndicies.indexOf(i) === -1) {
          tabIndicies.push(i);
        }
      });

      if (tabIndicies.length > 0) {
        // sort our tab indicies descending
        tabIndicies.sort(function(a, b) { return b-a; });

        // we now have our new tab index
        tabindex = tabIndicies[0];

        // Select the last indexed item
        target = $(selectors.indexed(tabindex)).last();
      }
    } else if (direction === -1 && !isNaN(tabindex) && tabindex > 0) {
      $(selectors.allIndexed).each(function(){
        var i = helpers.toInt($(this).attr('tabindex'));

        if (i < tabindex && tabIndicies.indexOf(i) === -1 && i > 0) {
          tabIndicies.push(i);
        }
      });

      if (tabIndicies.length > 0) {
        // sort our tab indicies asceding
        tabIndicies.sort(function(a, b) { return a-b; });

        // we now have our new tab index
        tabindex = tabIndicies[0];

        // Select the last indexed item
        target = $(selectors.indexed(tabindex)).last();
      }
    }

    if (!helpers.isUndefined(target)) {
      // assuming we have a target, focus it.
      target.focus();
    }
    
  }

  var instantiated;

  keyboardNavigation = function(){
    if (instantiated) {
      return instantiated;
    }

    $(document).on('keyup', function(event) {
      if (helpers.isFunction(keybindings[event.which])) {
        keybindings[event.which](event);
      }
    });

    instantiated = this;
  };

  return keyboardNavigation;

});
/*
* Copyright 2013 Comcast
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

define('xooie/widgets/base', ['jquery', 'xooie/xooie', 'xooie/helpers', 'xooie/shared', 'xooie/keyboard_navigation'], function($, $X, helpers, shared, keyboardNavigation) {

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

/** internal
 * Xooie.Widget.roleDetails(name) -> Object
 *
 * TODO: Test and document.
 **/
  function roleDetails (name) {
    return {
      processor: '_process_role_' + name,
      renderer: '_render_role_' + name,
      getter: '_get_role_' + name,
      pluralName: name + 's',
      selector: '[data-x-role=' + name + ']'
    };
  }

/** internal
 * Xooie.Widget.roleDispatcher(name, prototype)
 *
 * TODO: Test and document.
 **/
  function roleDispatcher(name, prototype) {
    var role = roleDetails(name);

    if (helpers.isUndefined(prototype[role.pluralName])) {
      prototype._definedRoles.push(name);

      prototype[role.pluralName] = function() {
        return this[role.getter]();
      };
    }
  }

/** internal
 * Xooie.Widget.cacheInstance(instance) -> Integer
 * - instance (Widget): An instance of a Xooie widget to be cached
 *
 * Recursively checks for the next available index in [[$X._instanceCache]] using [[$X._instanceIndex]]
 * as a reference point.  Returns the index.
 **/
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
  Widget = function(element, addons) {
    var self = this;

    element = $(element);

    //set the default options
    shared.setData(this, element.data());

    //do instance tracking
    if (element.data('xooieInstance')) {
      if (typeof $X._instanceCache[element.data('xooieInstance')] !== 'undefined'){
        element.trigger(this.get('refreshEvent'));
        return $X._instanceCache[element.data('xooieInstance')];
      } else {
        this.cleanup();
      }
    }

    element.on(this.get('initEvent') + ' ' + this.get('refreshEvent'), function(){
      self._applyRoles();
    });

    var id = cacheInstance(this);

    this.set('id', id);

    this.set('root', element);

    element.addClass(this.get('className'))
           .addClass(this.get('instanceClass'));

    var initCheck = function(){
      var i;

      if (!self._extendCount || self._extendCount <= 0) {

        if (typeof addons !== 'undefined') {
          for (i = 0; i < addons.length; i+=1) {
            new addons[i](self);
          }
        }
        
        element.attr('data-xooie-instance', id);

        element.trigger(self.get('initEvent'));
        self._extendCount = null;
      } else {
        setTimeout(initCheck, 0);
      }
    };

    if (this._extendCount > 0) {
      setTimeout(initCheck, 0);
    } else {
      initCheck();
    }

    // new keyboardNavigation();
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
 *
 * TODO: This needs tests and documentation
 **/
  Widget.defineRole = function(name) {
    var role = roleDetails(name);

    roleDispatcher(name, this.prototype);

    if (!helpers.isFunction(this.prototype[role.getter])) {
      this.prototype[role.getter] = function() {
        return this.root().find(role.selector);
      };
    }
  };

/**
 * Xooie.Widget.extend(constr) -> Widget
 * - constr (Function): The constructor for the new [[Xooie.Widget]] class.
 *
 * See [[Xooie.shared.extend]].
 **/
  Widget.extend = function(constr){
    return shared.extend(constr, this);
  };

/**
 * Xooie.Widget.createStyleRule(selector, properties) -> cssRule | undefined
 * - selector (String): The selector used to identify the rule.
 * - properties (Object): A hash of key/value pairs of css properties and values.
 *
 * Creates a new css rule in the Xooie stylesheet.  If the rule exists, it will overwrite said rule.
 **/
 // TODO: update so that if the rule exists the properties are added to the rule
  Widget.createStyleRule = function(selector, properties) {
    if (typeof $X._stylesheet.addRule !== 'undefined') {
      return $X._stylesheet.addRule(selector, properties);
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

/** internal
 * Xooie.Widget#_definedRoles -> Array
 *
 * A collection of roles that have been defined for this class instance.
 **/
  Widget.prototype._definedRoles = [];

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
  Widget.defineReadOnly('addons');

/** internal, read-only
 * Xooie.Widget#_refreshEvent -> String
 *
 * The name of the event that is triggered when the module is refreshed.  Refresh events are triggered
 * when the root element of this widget is passed to [[$X]].
 * Default: `xooie-refresh`.
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
 * The name of the event that is triggered when the module is initialized.  The initialization event
 * is not triggered until all addons have been instantiated.
 * Default: `xooie-init`.
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
 * The string class name that is applied to the root element of this widget when it is instantiated.
 * Default: `is-instantiated`.
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
 * A class that is generated and applied to the root element of the widget.
 * Default: `{{namespace}}-{{id}}`
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
 * Xooie.Widget#_getRoleId(role, index) -> String
 * - role (String): The name of the role for which this id is being generated.
 * - index (Integer): The index at which the particular element exists in the read order.
 *
 * Generates an id string to be applied to an element of the specified role.  The format of
 * this id string is `x-[[Xooie.Widget#id]]-{role}-{index}`.
 **/
  Widget.prototype._getRoleId = function(role, index) {
    return 'x-' + this.id() + '-' + role + '-' + index;
  };

/** internal
 * Xooie.Widget#_applyRoles()
 *
 * TODO: Test and document.
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
 * Checks to see if the addons object has been defined.  We can't define objects as
 * 'default' values for properties since the object will be the same for each instance.
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

/*
*   Copyright 2013 Comcast
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

define('xooie/event_handler', ['jquery', 'xooie/helpers'], function($, helpers) {

  var EventHandler = function(namespace) {
    this.namespace = namespace;

    this.handlers = {};

    this._callbacks = {};
  };

  function format(type, namespace) {
    if (!namespace) {
      return type;
    } else {
      return type + '.' + namespace;
    }
  }

  EventHandler.prototype.add = function(type, method) {
    var self = this,
        formattedType, t;

    if (helpers.isObject(type) && helpers.isUndefined(method)) {
      for(t in type) {
        if (helpers.isFunction(type[t])) {
          this.add(t, type[t]);
        }
      }

      return;
    }

    formattedType = format(type, this.namespace);

    if (helpers.isUndefined(this.handlers[formattedType])) {
      this.handlers[formattedType] = function(e) {
        self.fire(e, this, arguments);
      };
    }

    if (helpers.isUndefined(this._callbacks[type])) {
      this._callbacks[type] = $.Callbacks('unique');
    }

    this._callbacks[type].add(method);
  };

  EventHandler.prototype.clear = function(type) {
    delete(this.handlers[format(type, this.namespace)]);

    if (!helpers.isUndefined(this._callbacks[type])) {
      this._callbacks[type].empty();
    }
  };

  EventHandler.prototype.fire = function(event, context, args) {
    if (event.namespace && event.namespace !== this.namespace) {
      return;
    }

    if (!helpers.isUndefined(this._callbacks[event.type])) {
      this._callbacks[event.type].fireWith(context, args);
    }
  };

  return EventHandler;
});

/*
*   Copyright 2013 Comcast
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
 * class Xooie.Carousel < Xooie.Widget
 *
 * A widget that allows users to horizontally scroll through a collection of elements.  Carousels are
 * commonly used to display a large amount of images or links in a small amount of space.  The user can
 * view more items by clicking the directional controls to scroll the content forward or backward.  If
 * the device recognizes swipe gestues (e.g. mobile or Mac OS) then swiping will also allow the user to
 * scroll content.
 * Keyboard-only users will also be able to navigate from item to item using the tab, left or right keys.
 * Screen reader users will percieve the carousel as a [list](http://www.w3.org/TR/wai-aria/roles#list) of items.
 * For most devices, the native scrollbar is hidden in favor of the directional controls and native scrolling.
 **/
define('xooie/widgets/carousel', ['jquery', 'xooie/helpers', 'xooie/widgets/base', 'xooie/event_handler'], function($, helpers, Base, EventHandler) {
  var Carousel, timers;

/**
 * Xooie.Carousel@xooie-carousel-resize(event)
 * - event (Event): A jQuery event object
 *
 * A jQuery special event triggered to indicate that the carousel instance should be resized.  This
 * by default is triggered when the window is resized.
 **/

  timers = {
    resize: null
  };

  $(window).on('resize', function() {
    if (timers.resize !== null) {
      clearTimeout(timers.resize);
      timers.resize = null;
    }
    if (Carousel._cache.length > 0) {
      // TODO: make this delay adjustable
      timers.resize = setTimeout(function() {
        Carousel._cache.trigger(Carousel.prototype.resizeEvent());
      }, 100);
    }
  });

/** internal
 * Xooie.Carousel.parseCtrlStr(ctrlStr) -> Array | undefined
 *
 * Checks the data-x-role value of a control and matches it against expected patterns to determine
 * the control commands, if any.
 * Returns an array: [Direction, Amount, Mode].
 * For example, control:right 1 item -> [right, 1, item], whereas control:right continuous returns
 * [right, undefined, continuous].
 **/
  function parseCtrlStr(ctrlStr) {
    ctrlStr = ctrlStr.toLowerCase();

    var ptrnMatch = ctrlStr.match(/^control:(left|right|goto)\s(\d+)(?:st|nd|rd|th)?\s(.*)$/);
    
    if(ptrnMatch === null) {
      ptrnMatch = ctrlStr.match(/^control:(left|right)()\s(continuous)$/);
    }

    if (ptrnMatch !== null) {
      return ptrnMatch.slice(1);
    }
  }

/**
 * new Xooie.Carousel(element[, addons])
 * - element (Element | String): A jQuery-selected element or string selector for the root element of this widget
 * - addons (Array): An optional collection of [[Xooie.Addon]] classes to be instantiated with this widget
 *
 * Instantiates a new instance of a [[Xooie.Carousel]] widget.  Defines [[Xooie.Carousel#_timers]],
 * [[Xooie.Carousel#_controlEvents]], [[Xooie.Carousel#_wrapperEvents]], and [[Xooie.Carousel#cropStyle]].
 * Events are bound to the [[Xooie.Widget#root]] to call [[Xooie.Carousel#updateDimensions]] on [[Xooie.Widget@xooie-init]],
 * [[Xooie.Widget@xooie-refresh]] and [[Xooie.Carousel@xooie-carousel-resize]].
 * Carousel instances are tracked in the [[Xooie.Carousel._cache]] collection.
 **/
  Carousel = Base.extend(function() {
    var self = this;

/** internal
 * Xooie.Carousel#_timers -> Object
 *
 * A hash of all timers currently active.  If no timer is active for a particular type then the value is
 * set to undefined.
 *
 * ##### Timers
 * - **scroll** (Integer | undefined): Active while the content is being scrolled.  Prevents post-scroll functionality
 * from triggering until the carousel has completely finished scrolling.
 * - **continuous** (Integer | undefined): Active while the user is continuously scrolling using a [[Xooie.Carousel#controls]].
 **/
    this._timers = {
      scroll: 0,
      continuous: 0
    };

/** internal
 * Xooie.Carousel#_positioners -> Object
 *
 * A dispatch table containing the various methods for scrolling the carousel content.
 *
 * ##### Positioners
 * - **item**(direction, quantity): Calls [[Xooie.Carousel#scrollTo]] with the position of the item designated by the quantity.
 * - **items**(direction, quantity): alias of **item**
 * - **pixel**(direction, quantity): Calls [[Xooie.Carousel#scrollTo]] with the pixel position designated by quantity.
 * - **pixels**(direction, quantity): alias of **pixel**
 * - **px**(direction, quantity): alias of **pixel**
 **/
    this._positioners = {

      item: function(direction, quantity) {
        var items, pos, i;

        items = this.items();

        quantity = helpers.toInt(quantity);

        if (isNaN(quantity)) {
          return;
        }

        if (direction === 'goto' && quantity > 1 && quantity <= items.length) {
          pos = Math.round(items.eq(quantity - 1).position().left);

          if (pos === 0) {
            return;
          }
        } else {
          i = this.currentItem(direction === 'right');

          direction = direction === 'left' ? -1 : 1;

          i = Math.max(0, Math.min(items.length - 1, i + (direction * quantity)));

          pos = this.wrappers().scrollLeft() + Math.round(items.eq(i).position().left);
        }

        this.scrollTo(pos);
      },

      items: function() {
        return this._positioners.item.apply(this, arguments);
      },

      pixel: function(direction, quantity) {
        var pos;

        quantity = helpers.toInt(quantity);

        if (isNaN(quantity)) {
          return;
        }

        if (direction === 'goto' && quantity >= 0) {
          pos = quantity;
        } else {
          direction = direction === 'left' ? -1 : 1;

          pos = this.wrappers().scrollLeft() + (direction * quantity);
        }

        this.scrollTo(pos);
      },

      pixels: function() {
        return this._positioners.pixel.apply(this, arguments);
      },

      px: function() {
        return this._positioners.pixel.apply(this, arguments);
      }
    };

/** internal
 * Xooie.Carousel#continuousScroll(ctrl, direction)
 * - ctrl (Element): The control that was activated to initiate the scroll
 * - direction (String): The direction of the scroll.  Can be `left` or `right`.
 **/
    function continuousScroll(ctrl, direction) {
      clearInterval(self._timers.continuous);

      self._timers.continuous = setInterval(function(dir) {
        if (ctrl.is(':disabled')) {
          self._timers.continuous = clearInterval(self._timers.continuous);
        }

        //TODO: Need some way of setting rate
        self.scrollTo(self.wrappers().scrollLeft() + (dir * 5));
      }, 0, [direction === 'right' ? 1 : -1]);
    }

/** internal
 * Xooie.Carousel#_controlEvents -> Object
 *
 * An instance of [[Xooie.EventHandler]] that manages event handlers to be bound to the
 * [[Xooie.Carousel#controls]].
 **/
    this._controlEvents = new EventHandler(this.namespace());

    this._controlEvents.add({
      keydown: function(event) {
          var ctrl, args;

          if ([13,32].indexOf(event.which) !== -1) {
            ctrl = $(this);
            args = parseCtrlStr(ctrl.attr('data-x-role'));

            if (args[2] === 'continuous' && !ctrl.is(':disabled')) {
              continuousScroll(ctrl, args[0]);

              event.preventDefault();
            }
          }
      },

      mousedown: function(event) {
        var ctrl, args;

        ctrl = $(this);
        args = parseCtrlStr(ctrl.attr('data-x-role'));

        if (args[2] === 'continuous' && !ctrl.is(':disabled')) {
          continuousScroll(ctrl, args[0]);

          event.preventDefault();
        }
      },

      keyup: function(event) {
        self._timers.continuous = clearInterval(self._timers.continuous);

        if ($(this).is(':disabled')) {
          return;
        }

        if ([13,32].indexOf(event.which) !== -1) {
          var args = parseCtrlStr($(this).attr('data-x-role'));

          if (helpers.isFunction(self._positioners[args[2]])) {
            self._positioners[args[2]].apply(self, args);
          }

          event.preventDefault();
        }
      },

      mouseup: function(event) {
        self._timers.continuous = clearInterval(self._timers.continuous);

        if ($(this).is(':disabled')) {
          return;
        }

        var args = parseCtrlStr($(this).attr('data-x-role'));

        if (helpers.isFunction(self._positioners[args[2]])) {
          self._positioners[args[2]].apply(self, args);
        }

        event.preventDefault();
      },

      mouseleave: function(event) {
        self._timers.continuous = clearInterval(self._timers.continuous);
      },

      blur: function(event) {
        self._timers.continuous = clearInterval(self._timers.continuous);
      }
    });

    function scrollComplete() {
      self._timers.scroll = clearTimeout(self._timers.scroll);

      self.updateLimits();
    }

/** internal
 * Xooie.Carousel#_wrapperEvents -> Object
 *
 * An instance of [[Xooie.EventHandler]] that manages event handlers to be bound to the
 * [[Xooie.Carousel#wrappers]].
 **/
    this._wrapperEvents = new EventHandler(this.namespace());

    this._wrapperEvents.add('scroll', function(event){
      if (self._timers.scroll) {
          self._timers.scroll = clearTimeout(self._timers.scroll);
        } else {
          self.root().removeClass(self.leftClass() + ' ' + self.rightClass());
        
          self.controls().prop('disabled', false);
        }

        // TODO: make this delay adjustable
        self._timers.scroll = setTimeout(scrollComplete, 250);
    });

    this.cropStyle(Carousel.createStyleRule('.' + this.instanceClass() + ' .' + this.cropClass() + ', .' + this.instanceClass() + '.' + this.cropClass()));

    // TODO: add functionality to remove from cache
    Carousel._cache = Carousel._cache.add(this.root());

    this.root().on([
      this.get('initEvent'),
      this.get('refreshEvent'),
      this.get('resizeEvent')].join(' '),
    function(){
      self.updateDimensions();
    });

  });

/** internal
 * Xooie.Carousel._cache -> jQuery
 *
 * A jQuery collection that keeps track of currently instantiated carousel instances.  This collection
 * is primarily used during a window resize event, where the limits and dimensions are recalculated.
 **/
  Carousel._cache = $();

/** internal
 * Xooie.Carousel#_namespace -> String
 *
 * See [[Xooie.Widget#_namespace]]
 * Default: `carousel`.
 **/
/**
 * Xooie.Carousel#namespace([value]) -> String
 * - value: an optional value to be set.
 *
 * See [[Xooie.Widget#namespace]]
 **/
  Carousel.define('namespace', 'carousel');

/** internal
 * Xooie.Carousel#_isScrolling -> Boolean
 *
 * A value that determines whether or not the carousel is currently scrolling
 * TODO:  Perhaps depricate this in favor of scroll timer detection
 * Default: `false`.
 **/
/**
 * Xooie.Carousel#isScrolling([value]) -> String
 * - value: an optional value to be set.
 *
 **/
  Carousel.define('isScrolling', false);

/** internal
 * Xooie.Carousel#_visibleThreshold -> Integer
 *
 * Default: `0.5`.
 **/
/**
 * Xooie.Carousel#visibleThreshold([value]) -> Integer
 * - value: an optional value to be set.
 *
 **/
  Carousel.define('visibleThreshold', 0.5);

/** internal
 * Xooie.Carousel#_cropStyle -> cssRule
 *
 * Default: `carousel`.
 **/
/**
 * Xooie.Carousel#cropStyle([value]) -> cssRule
 * - value: an optional value to be set.
 *
 **/
  Carousel.define('cropStyle');

/** internal, read-only
 * Xooie.Carousel#_resizeEvent -> String
 *
 * Default: `xooie-carousel-resize`.
 **/
/**
 * Xooie.Carousel#resizeEvent() -> String
 *
 **/
  Carousel.defineReadOnly('resizeEvent', 'xooie-carousel-resize');

/** internal, read-only
 * Xooie.Carousel#_wrapperClass -> String
 *
 * Default: `xooie-carousel-wrapper`.
 **/
/**
 * Xooie.Carousel#wrapperClass() -> String
 *
 **/
  Carousel.defineReadOnly('wrapperClass', 'xooie-carousel-wrapper');

/** internal, read-only
 * Xooie.Carousel#_cropClass -> String
 *
 * Default: `xooie-carousel-crop`.
 **/
/**
 * Xooie.Carousel#cropClass() -> String
 *
 **/
  Carousel.defineReadOnly('cropClass', 'xooie-carousel-crop');

/** internal, read-only
 * Xooie.Carousel#_contentClass -> String
 *
 * Default: `xooie-carousel-content`.
 **/
/**
 * Xooie.Carousel#contentClass() -> String
 *
 **/
  Carousel.defineReadOnly('contentClass', 'xooie-carousel-content');

/** internal, read-only
 * Xooie.Carousel#_controlClass -> String
 *
 * Default: `xooie-carousel-control`.
 **/
/**
 * Xooie.Carousel#controlClass() -> String
 *
 **/
  Carousel.defineReadOnly('controlClass', 'xooie-carousel-control');

/** internal, read-only
 * Xooie.Carousel#_leftClass -> String
 *
 * Default: `is-left-limit`.
 **/
/**
 * Xooie.Carousel#leftClass() -> String
 *
 **/
  Carousel.defineReadOnly('leftClass', 'is-left-limit');

/** internal, read-only
 * Xooie.Carousel#_rightClass -> String
 *
 * Default: `is-right-limit`.
 **/
/**
 * Xooie.Carousel#rightClass() -> String
 *
 **/
  Carousel.defineReadOnly('rightClass', 'is-right-limit');

// ROLE DEFINITIONS

/**
 * Xooie.Carousel#wrapper() -> Elements
 *
 *
 **/
  Carousel.defineRole('wrapper');

/**
 * Xooie.Carousel#content() -> Elements
 *
 * This role maps to the ARIA [tab list](http://www.w3.org/TR/wai-aria/roles#list)
 **/
  Carousel.defineRole('content');

/**
 * Xooie.Carousel#item() -> Elements
 *
 * This role maps to the ARIA [listitem role](http://www.w3.org/TR/wai-aria/roles#listitem)
 **/
  Carousel.defineRole('item');

/**
 * Xooie.Carousel#control() -> Elements
 *
 * Controls allow the user to scroll the carousel.  The behavior of this scrolling is determined by
 * the role itself.  Behavior is set using the `data-x-role` attribute: `data-x-role="control:<direction> <quantity> <mode>"`.
 * The `direction` value indicates which direction the carousel should be moved: `right`, `left`, or `goto`.
 * The special `goto` value signifies that the control should scroll to a fixed position.
 * The control syntax is designed to accept somewhat natural language.  Therefore, plurals and n-aries can be used to
 * describe the behavior.  For example, you can use the following strings: `control:right 2 items`, `control:left 30 pixels`,
 * `control:goto 5th item`.
 **/
  Carousel.defineRole('control');

// STYLE DEFINITIONS

  Carousel.createStyleRule('.' + Carousel.prototype.wrapperClass(), {
    position: 'relative',
    'overflow-x': 'scroll',
    'overflow-y': 'hidden'
  });

  Carousel.createStyleRule('.' + Carousel.prototype.cropClass(), {
    'overflow-y': 'hidden'
  });

  Carousel.createStyleRule('.' + Carousel.prototype.contentClass(), {
    display: 'table-cell',
    'white-space': 'nowrap',
    'font-size': '0px',
    'transition': 'left 0.5s'
  });

  Carousel.createStyleRule('ul.' + Carousel.prototype.contentClass(), {
     'list-style': 'none',
     'padding': 0,
     'margin': 0
  });

  Carousel.createStyleRule('.' + Carousel.prototype.contentClass() + ' > *', {
    display: 'inline-block',
    zoom: '1',
    '*display': 'inline',
    'font-size': '1em'
  });

  Carousel.createStyleRule('.' + Carousel.prototype.leftClass() + '.' + Carousel.prototype.rightClass() + ' [data-x-role^="control:left"]' +
    ', .' + Carousel.prototype.leftClass() + '.' + Carousel.prototype.rightClass() + ' [data-x-role^="control:right"]', {
    display: 'none'
  });

/**
 * Xooie.Carousel#currentItem(biasRight) -> Integer
 * - biasRight (Boolean): If true, calculates the current item from the right side of the carousel.
 *
 * Returns the index of the first visible item.  The value of [[Xooie.Carousel#visibleThreshold]] determines what
 * percentage of the item must be showing to be considered visible.
 **/
  Carousel.prototype.currentItem = function(biasRight) {
      var content, items,
          position, itemWidth,
          i;

      content = this.contents();
      items = this.items();

      if (biasRight) {
        position = content.outerWidth(true) + content.position().left;

        for (i = items.length - 1; i > 0; i -= 1) {
          itemWidth = items.eq(i).outerWidth(true);
          position -= itemWidth;

          if (i > 0 && position <= this.visibleThreshold() * itemWidth) {
              return i;
          }
        }
        return 0;
      } else {
        position = content.position().left;

        for (i = 0; i < items.length - 1; i++) {
          itemWidth = items.eq(i).outerWidth(true);

          if (position + this.visibleThreshold() * itemWidth >= 0){
            return i;
          } else {
            position += itemWidth;
          }
        }

        return items.length - 1;
      }
  };

/**
 * Xooie.Carousel#isLeft() -> Boolean
 *
 * Indicates if the carousel is scrolled completely to the left.
 **/
  Carousel.prototype.isLeft = function() {
    return this.wrappers().scrollLeft() === 0;
  };

/**
 * Xooie.Carousel#isRight() -> Boolean
 *
 * Indicates if the carousel is scrolled completely to the right.
 **/
  Carousel.prototype.isRight = function() {
    var lastItem, position;

    try {
      lastItem = this.items().filter(':visible:last');
      position = lastItem.position();

      if (position && !helpers.isUndefined(position.left)) {
        return Math.floor(position.left) + lastItem.outerWidth(true) <= this.wrappers().innerWidth();
      }
    } catch (e) {
      return false;
    }

    return false;
  };

/**
 * Xooie.Carousel#updateDimensions()
 *
 * Updates the height of the carousel based on the height of the tallest visible item in the carousel.
 * The new height is applied to the [[Xooie.Carousel#cropStyle]] rule rather than the cropping element
 * itself.  This allows developers to use cascade rules to override the height if they so choose.
 **/
  Carousel.prototype.updateDimensions = function() {
    var height = 0;

    this.items().each(function(){
      height = Math.max(height, $(this).outerHeight(true));
    });

    //set the height of the wrapper's parent (or cropping element) to ensure we hide the scrollbar
    this.cropStyle().style.height = height + 'px';

    this.updateLimits();
  };

/**
 * Xooie.Carousel#updateLimits()
 *
 * Updates the state of the carousel based on whether or not it is scrolled completely to the left or the right.
 * If the carousel is scrolled completely to the left then the [[Xooie.Carousel#leftClass]] is applied to the
 * [[Xooie.Widget#root]] and the left [[Xooie.Carousel#controls]] is disabled.  If the carousel is scrolled
 * completely to the left then the [[Xooie.Carousel#rightClass]] is applied to the [[Xooie.Widget#root]] and the
 * right [[Xooie.Carousel#controls]] is disabled.
 **/
  Carousel.prototype.updateLimits = function() {
      var isLeft = this.isLeft(),
          isRight = this.isRight();

      this.root().toggleClass(this.leftClass(), isLeft);
      this.controls().filter('[data-x-role^="control:left"]')
                     .prop('disabled', isLeft);

      this.root().toggleClass(this.rightClass(), isRight);
      this.controls().filter('[data-x-role^="control:right"]')
                     .prop('disabled', isRight);
  };

/**
 * Xooie.Carousel#scrollTo(pos, cb)
 * - pos (Integer): The position to which the carousel will be scrolled.
 * - cb (Function): A callback function that is called when the animation is complete.
 *
 * Uses the jQuery animate functionality to scroll the carousel to the designated position.
 **/
  Carousel.prototype.scrollTo = function(pos, cb) {
    var self = this;

    pos = Math.floor(pos);

    if (this.isScrolling) {
      this.wrappers().stop(true,true);
    }

    this.isScrolling = true;

    // TODO: make the scroll timer configurable
    this.wrappers().animate({ scrollLeft: pos }, 200,
      function(){
        self.isScrolling = false;
        if (helpers.isFunction(cb)) {
          cb();
        }
      }
    );
  };

/** internal
 * Xooie.Carousel#_process_role_content(content) -> Element
 * - content (Element): A jQuery-selected collection of [[Xooie.Carousel#contents]]
 *
 * This method processes the element that has been designated as a [[Xooie.Carousel#contents]].
 * In addition to applying the [[Xooie.Carousel#contentClass]] the content is also given the
 * aria role [list](http://www.w3.org/TR/wai-aria/roles#list) if it is neither a `ul` or `ol` element.
 **/
  Carousel.prototype._process_role_content = function(content) {
    content.addClass(this.contentClass());

    if (!content.is('ul,ol')) {
      content.attr('role', 'list');
    }

    return content;
  };

/** internal
 * Xooie.Carousel#_render_role_wrapper() -> Element
 *
 * Renders a `div` tag that is wrapped around the [[Xooie.Carousel#contents]].  This element is
 * rendered only if no other [[Xooie.Carousel#wrappers]] is present as a decendant of the root of this
 * widget.
 **/
  Carousel.prototype._render_role_wrapper = function() {
    var wrapper = $('<div data-x-role="wrapper" />');

    this.contents().wrap(wrapper);

    return this.contents().parent();
  };

/** internal
 * Xooie.Carousel#_process_role_wrapper(wrapper) -> Element
 * - wrapper (Element): A jQuery-selected collection of [[Xooie.Carousel#wrappers]]
 *
 * This method processes the element that has been designated as a [[Xooie.Carousel#wrappers]].
 * The [[Xooie.Carousel#wrapperClass]] is added and the [[Xooie.Carousel#_wrapperEvents]] handlers are
 * bound.  Also, the [[Xooie.Carousel#cropClass]] is added to this element's parent.
 **/
  Carousel.prototype._process_role_wrapper = function(wrapper) {
    wrapper.addClass(this.wrapperClass())
           .on(this._wrapperEvents.handlers)
           .parent().addClass(this.cropClass());

    return wrapper;
  };

/** internal
 * Xooie.Carousel#_get_role_item() -> Element
 *
 * Gets all children of [[Xooie.Carousel#contents]].
 **/
  Carousel.prototype._get_role_item = function() {
    return this.contents().children();
  };

/** internal
 * Xooie.Carousel#_get_role_control() -> Element
 *
 * TODO: Test and document
 **/
  Carousel.prototype._get_role_control = function(){
    return this.root().find('[data-x-role^="control"]');
  };

/** internal
 * Xooie.Carousel#_process_role_control() -> Element
 *
 **/
  Carousel.prototype._process_role_control = function(controls) {
    controls.on(this._controlEvents.handlers);

    controls.attr('aria-hidden', true)
            .addClass(this.controlClass());

    return controls;
  };

/** internal
 * Xooie.Carousel#_process_resizeEvent() -> String
 *
 * Adds the [[Xooie.Widget#namespace]] to the `resizeEvent` string.
 **/
  Carousel.prototype._process_resizeEvent = function(resizeEvent) {
    return this.namespace() === '' ? resizeEvent : resizeEvent + '.' + this.namespace();
  };

  return Carousel;
});
/*
*   Copyright 2013 Comcast
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

/** deprecated: 1.0
 * class Xooie.Dropdown < Xooie.Widget
 *
 * A widget used to hide and show content.
 * As of v1.0 this widget has been deprecated.  Use the more semantically appropriate
 * [[Xooie.Tooltip]], [[Xooie.Menu]], [[Xooie.Tab]], or [[Xooie.Accordion]] classes instead.
 **/
define('xooie/widgets/dropdown', ['jquery', 'xooie/widgets/base'], function($, Base) {


   var parseWhich = function(which) {
        if (typeof which === 'string') {
            which = which.split(',');
            return which.map(function(string){ return parseInt(string, 10); });
        } else if (typeof which === 'number') {
            return [which];
        }

        return which;
     };

/**
 * Xooie.Dropdown(element[, addons])
 * - element (Element | String): A jQuery-selected element or string selector for the root element of this widget
 * - addons (Array): An optional collection of [[Xooie.Addon]] classes to be instantiated with this widget
 *
 * Instantiates a new Dropdown widget.  Creates event handlers to manage activating and deactivating the expanders.
 * Also adds methods to manipulate aria roles.
 **/
    var Dropdown = Base.extend(function() {
        var self = this,
            handles = self.getHandle(),
            expanders = self.getExpander();

        this.handlers = {
            off: function(event){
                if ((typeof event.data.not !== 'undefined' && ($(event.data.not).is($(this)) || $(event.target).parents(event.data.not).length > 0)) || (typeof event.data.which !== 'undefined' && event.data.which.indexOf(event.which) === -1) || ($(event.target).is(self.getExpander(event.data.index)) || $(event.target).parents(self.dropdownExpanderSelector()).length > 0) && !$(event.target).is($(this))) {
                    return true;
                }

                event.preventDefault();

                self.collapse(event.data.index, event.data);
            },

            on: function(event){
                var index = event.data.index || parseInt($(this).attr('data-dropdown-index'), 10),
                    delay = event.data.delay,
                    handle = $(this);

                if ((typeof event.data.not !== 'undefined' && ($(event.data.not).is($(this)) || $(event.target).parents(event.data.not).length > 0)) || typeof event.data.which !== 'undefined' && event.data.which.indexOf(event.which) === -1) {
                    return true;
                }

                event.preventDefault();

                self.expand(index, event.data);
            }
        };

        this.timers = {
            expand: [],
            collapse: [],
            throttle: []
        };

        this.addHandlers('on');

        this.root().on({
            dropdownExpand: function(event, index){
                self.removeHandlers('on', index);

                self.addHandlers('off', index);

                $(this).attr('aria-selected', true);
                self.getExpander(index).attr('aria-hidden', false);
            },

            dropdownCollapse: function(event, index){
                self.removeHandlers('off', index);

                self.addHandlers('on', index);

                $(this).attr('aria-selected', false);
                self.getExpander(index).attr('aria-hidden', true);
            }
        }, this.dropdownHandleSelector());

        this.root().on('xooie-init.dropdown xooie-refresh.dropdown', function(){
            handles.each(function(index){
                var handle = $(this),
                    expander = expanders.eq(index);


                handle.attr({
                    'data-dropdown-index': index,
                    'aria-selected': false
                });
                expander.attr({
                    'data-dropdown-index': index,
                    'aria-hidden': true
                });
            });
        });

        expanders.on('mouseover focus', function(){
            var index = parseInt($(this).attr('data-dropdown-index'), 10);

            if (self.timers.collapse[index]){
                self.timers.collapse[index] = clearTimeout(self.timers.collapse[index]);

                $(this).on('mouseleave blur', {index: index}, function(event){
                    self.collapse(event.data.index, 0);
                    $(this).unbind(event);
                });
            }
        });

    });

    Dropdown.define('namespace', 'dropdown');

    Dropdown.define('throttleDelay', 300);

    Dropdown.define('triggers', {
        on: {
            focus: {
                delay: 0
            }
        },
        off: {
            blur: {
                delay: 0
            }
        }
    });

    Dropdown.defineReadOnly('dropdownHandleSelector', '[data-role="dropdown-handle"]');

    Dropdown.defineReadOnly('dropdownExpanderSelector', '[data-role="dropdown-content"]');

    Dropdown.defineReadOnly('activeDropdownClass', 'is-dropdown-active');

    Dropdown.prototype.getTriggerHandle = function(triggerData, index){
        var handles = this.getHandle(index);

        if (triggerData.selector) {
            return triggerData.selector === 'document' ? $(document) : $(triggerData.selector);
        } else {
            return handles;
        }
    };

    Dropdown.prototype.addHandlers = function(state, index){
        var trigger, handle, triggerData, countName;

        triggerData = this.triggers()[state];

        for (trigger in triggerData) {
            if (typeof triggerData[trigger].which !== 'undefined') {
                triggerData[trigger].which = parseWhich(triggerData[trigger].which);
            }

            countName = [trigger,state,'count'].join('-');

            handle = this.getTriggerHandle(triggerData[trigger], index);

            handle.data(countName, handle.data(countName) + 1 || 1);

            handle.on(trigger, $.extend({delay: 0, index: index}, triggerData[trigger]), this.handlers[state]);
        }
    };

    Dropdown.prototype.removeHandlers = function(state, index){
        var trigger, handle, triggerData, countName, eventCount;

        triggerData = this.triggers()[state];

        for (trigger in triggerData) {
            handle = this.getTriggerHandle(triggerData[trigger], index);

            countName = [trigger,state,'count'].join('-');

            eventCount = handle.data(countName) - 1;

            if (eventCount <= 0) {
                handle.unbind(trigger, this.handlers[state]);

                handle.data(countName, 0);
            } else {
                handle.data(countName, eventCount);
            }
        }
    };

    Dropdown.prototype.getHandle = function(index){
        var handles = this.root().find(this.dropdownHandleSelector());

        return (typeof index !== 'undefined' && index >= 0) ? handles.eq(index) : handles;
    };

    Dropdown.prototype.getExpander = function(index){
        var selectorString;

        if (typeof index === 'undefined' || isNaN(index)) {
            selectorString = this.dropdownExpanderSelector();
        } else {
            selectorString = this.dropdownExpanderSelector() + '[data-dropdown-index="' + index + '"]';
        }

        return this.root().find(selectorString);
    };

    Dropdown.prototype.setState = function(index, data, active){
        if (typeof index === 'undefined' || isNaN(index)) {
            return;
        }

        var state = active ? 'expand' : 'collapse',
            counterState = active ? 'collapse' : 'expand',
            delay = data.delay;

        this.timers[counterState][index] = clearTimeout(this.timers[counterState][index]);

        if (this.timers.throttle[index] || this.timers[state][index]) {
            return;
        }

        this.timers[state][index] = setTimeout(function(i, _state, _active, _data) {
            var expander = this.getExpander(i),
                handle = this.getHandle(i),
                self = this;

            this.timers[_state][i] = clearTimeout(this.timers[_state][i]);

            expander.toggleClass(this.activeDropdownClass(), _active);
            this.getHandle(i).toggleClass(this.activeDropdownClass(), _active);

            if (_active){
                handle.trigger('dropdownExpand', [i, _data]);
            } else {
                handle.trigger('dropdownCollapse', [i, _data]);
            }

            if (this.throttleDelay() > 0){
                this.timers.throttle[i] = setTimeout(function(){
                    self.timers.throttle[i] = clearTimeout(self.timers.throttle[i]);
                }, this.throttleDelay());
            }

        }.bind(this, index, state, active, data), delay);
    };

    Dropdown.prototype.expand = function(index, data) {
        if (!this.getHandle(index).hasClass(this.activeDropdownClass())) {
            this.setState(index, data, true);
        }
    };

    Dropdown.prototype.collapse = function(index, data) {
        if (this.getHandle(index).hasClass(this.activeDropdownClass())) {
            this.setState(index, data, false);
        }
    };

    return Dropdown;
});
/*
*   Copyright 2013 Comcast
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
 * class Xooie.Tab < Xooie.Widget
 *
 * A widget that associates containers of information with "tabs".  The pattern is
 * designed to mimic the real-world concept of a filing cabinet, where content is
 * stored in folders with protruding tabs that label said content.
 *
 * The Tab widget should be used as a way to organize how content is displayed
 * visually.  Content is hidden until the associated tab is activated.
 **/
define('xooie/widgets/tab', ['jquery', 'xooie/helpers', 'xooie/widgets/base', 'xooie/event_handler'], function($, helpers, Base, EventHandler) {

  function setSelection(widget, selectedTabs) {
    var activeTabs = widget.getActiveTabs();

    activeTabs.not(selectedTabs).each(function() {
      widget.deactivateTab($(this));
    });

    selectedTabs.not(activeTabs).each(function() {
      widget.activateTab($(this));
    });
  }
/**
 * Xooie.Tab@xooie-tab-active(event)
 * - event (Event): A jQuery event object
 *
 * An event that is fired when a tab is activated.  Triggers on the `root` element of the widget.
 *
 * ##### Event Properties
 * - **tabId** (String): The id of the tab that was activated.
 **/

 /**
 * Xooie.Tab@xooie-tab-inactive(event)
 * - event (Event): A jQuery event object
 *
 * An event that is fired when a tab is deactivated.  Triggers on the `root` element of the widget.
 *
 * ##### Event Properties
 * - **tabId** (String): The id of the tab that was deactivated.
 **/

/**
 * new Xooie.Tab(element[, addons])
 * - element (Element | String): A jQuery-selected element or string selector for the root element of this widget
 * - addons (Array): An optional collection of [[Xooie.Addon]] classes to be instantiated with this widget
 *
 * Instantiates a new Tab instance.  See [[Xooie.Widget]] for more functionality.
 **/
  var Tab = Base.extend(function(){
    var self = this;

    this._tabEvents = new EventHandler(this.namespace());

    this._tabEvents.add({
      keyup: function(event){
        if ([13,32].indexOf(event.which) !== -1){
          setSelection(self, self.selectTabs(event, $(this)));

          event.preventDefault();
        }
      },

      mouseup: function(event){
        setSelection(self, self.selectTabs(event, $(this)));
      },

      click: function(event){
        event.preventDefault();
      }
    });

    // TODO: Test and document this.  Also, create a property for data-activate
    this.root().on(this.initEvent(), function(){
      self.activateTab(self.tabs().filter('[data-activate="true"]'));
    });

  });

/** internal
 * Xooie.Tab#_namespace -> String
 *
 * See [[Xooie.Widget#_namespace]].
 * Default: `tab`.
 **/
/**
 * Xooie.Tab#namespace([value]) -> String
 * - value: an optional value to be set.
 *
 * See [[Xooie.Widget#namespace]]
 **/
  Tab.define('namespace', 'tab');

/** internal
 * Xooie.Tab#_tabSelector -> String
 *
 * An alternative selector for a [[Xooie.Tab#tabs]]. This allows developers to specify a tab control that may not
 * be a child of the tab widget.
 **/
/**
 * Xooie.Tab#tabSelector([value]) -> String
 * - value: an optional value to be set.
 *
 * The method for setting or getting [[Xooie.Tab#_tabSelector]].  Returns the current value of
 * [[Xooie.Tab#_tabSelector]] if no value is passed or sets the value.
 **/
  Tab.define('tabSelector');

/** internal
 * Xooie.Tab#_activeClass -> String
 *
 * A class string that is applied to active [[Xooie.Tab#tabs]] and [[Xooie.Tab#tabpanels]].
 * Default: `is-tab-active`.
 **/
/**
 * Xooie.Tab#activeClass([value]) -> String
 * - value: an optional value to be set.
 *
 * The method for setting or getting [[Xooie.Tab#_activeClass]].  Returns the current value of
 * [[Xooie.Tab#_activeClass]] if no value is passed or sets the value.
 **/
  Tab.defineReadOnly('activeClass', 'is-tab-active');

/**
 * Xooie.Tab#tabpanels() -> Elements
 *
 * Tabpanels are elements that contain the content that is shown or hidden when the corresponding
 * [[Xooie.Tab#tabs]] is activated.
 * This role maps to the ARIA [tab role](http://www.w3.org/TR/wai-aria/roles#tab)
 **/
  Tab.defineRole('tabpanel');

/**
 * Xooie.Tab#tabs() -> Elements
 *
 * Tabs are elements that, when activated, also activate the corresponding [[Xooie.Tab#tabpanels]].
 * This role maps to the ARIA [tabpanel role](http://www.w3.org/TR/wai-aria/roles#tabpanel).
 **/
  Tab.defineRole('tab');

/**
 * Xooie.Tab#tablists() -> Elements
 *
 * A tablist is an element that contains all the [[Xooie.Tab#tabs]].  If any tabs are not decendants of
 * the tablist, ownership of the tab is indicated using the `aria-owns` attribute.
 * There should only be one tablist per tab widget.
 * This role maps to the ARIA [tablist role](http://www.w3.org/TR/wai-aria/roles#tablist)
 **/
  Tab.defineRole('tablist');

/**
 * Xooie.Tab#activateTab(tab)
 * - tab (Element): One of the [[Xooie.Tab#tabs]] associated with this widget.
 *
 * Activates the [[Xooie.Tab#tabs]] by adding the [[Xooie.Tab#activeClass]] class and setting the `aria-expanded` property to 'true'.
 * The method also activates the [[Xooie.Tab#tabpanels]] that is indicated by the tab's `aria-controls` attribute,
 * adding the [[Xooie.Tab#activeClass]] class and setting `aria-expanded` to 'true'.
 **/
  Tab.prototype.activateTab = function(tab) {
    tab.addClass(this.activeClass())
       .attr('aria-selected', true);

    $('#' + tab.attr('aria-controls')).addClass(this.activeClass())
                                      .attr('aria-expanded', true)
                                      .focus();

    var e = $.Event('xooie-tab-active');

    e.tabId = tab.attr('id');

    this.root().trigger(e);
  };

/**
 * Xooie.Tab#deactivateTab(tab)
 * - tab (Element): One of the [[Xooie.Tab#tabs]] associated with this widget.
 *
 * Deactivates the [[Xooie.Tab#tabs]] by removing the [[Xooie.Tab#activeClass]] class and setting the `aria-expanded` property to 'false'.
 * The method also deactivates the [[Xooie.Tab#tabpanels]] that is indicated by the tab's `aria-controls` attribute,
 * removing the [[Xooie.Tab#activeClass]] class and setting `aria-expanded` to 'false'.
 **/
  Tab.prototype.deactivateTab = function(tab) {
    tab.removeClass(this.activeClass())
       .attr('aria-selected', false);

    $('#' + tab.attr('aria-controls')).removeClass(this.activeClass())
                                      .attr('aria-expanded', false);

    var e = $.Event('xooie-tab-inactive');

    e.tabId = tab.attr('id');

    this.root().trigger(e);
  };

/**
 * Xooie.Tab#selectTabs(event, selectedTab)
 * - event (Event): Browser event that triggered selectTabs call
 * - selectedTab (Element): Tab that was selected by a mouse or keyboard event
 *
 * Only called by mouse/keyboard event handlers to generate the list of
 * currently active tabs. Should return a jQuery collection of tabs that are
 * to be active. Any tabs which are currently active and not in the
 * collection will be deactivated, and likewise any tabs not currently active
 * and in the collection will be activated.
 *
 * Override this method to alter the behavior of the Tab widget.
 **/
  Tab.prototype.selectTabs = function(event, selectedTab) {
    return selectedTab;
  };

/**
 * Xooie.Tab#getActiveTabs() -> Elements
 *
 * Returns a jQuery-selected collection of all [[Xooie.Tab#tabs]] that currently have the
 * [[Xooie.Tab#activeClass]] class.
 **/
  Tab.prototype.getActiveTabs = function() {
    return this.tabs().filter('.' + this.activeClass());
  };

/** internal
 * Xooie.Tab#_process_role_tab(tabs) -> Element
 * - tabs (Element): A jQuery-selected collection of [[Xooie.Tab#tabs]]
 *
 * This method processes the elements that have been designated as [[Xooie.Tab#tabs]] with
 * the `data-x-role="tab"` attribute.  Tabs are given the [`role="tab"`](http://www.w3.org/TR/wai-aria/roles#tab) and [`aria-selected="false"`](http://www.w3.org/TR/wai-aria/states_and_properties#aria-selected)
 * [ARIA](http://www.w3.org/TR/wai-aria/) attributes.
 **/
  Tab.prototype._process_role_tab = function(tabs){
    var tabpanels = this.tabpanels(),
        tab, panelId,
        self = this;

    tabs.attr('role', 'tab')
        .attr('aria-selected', false);

    tabs.each(function(index) {
      tab = $(this);
      panelId = tabpanels.eq(index).attr('id');

      $(this).attr('aria-controls', panelId);

      if ($(this).is('a')) {
        $(this).attr('href', '#' + panelId);
      }

    });

    tabs.on(this._tabEvents.handlers);
    
    return tabs;
  };

/** internal
 * Xooie.Tab#_get_role_tab() -> Element
 *
 * Internal method used to retrieve the [[Xooie.Tab#tabs]] for this widget.  If [[Xooie.Tab#tabSelector]] has been
 * defined then its value will be used to select from the DOM.  Otherwise, tabs will be selected from decendants of
 * the root using the `[data-x-role="tab"]` selector.
 **/
  Tab.prototype._get_role_tab = function(){
    if (!helpers.isUndefined(this.tabSelector())) {
      return $(this.tabSelector());
    } else {
      return this.root().find('[data-x-role="tab"]');
    }
  };

/** internal
 * Xooie.Tab#_render_role_tab() -> Elements
 *
 * TODO: Create this method to keep parity with the existing tab functionality
 **/
  Tab.prototype._render_role_tab = function(){

  };

/** internal
 * Xooie.Tab#_process_role_tablist(tablist) -> Element
 * - tablist (Element): A jQuery-selected collection of [[Xooie.Tab#tablists]]
 *
 * This method processes the elements that have been designated as [[Xooie.Tab#tablists]] with
 * the `data-x-role="tablist"` attribute.  The tablist is given the [`role="tablist"`](http://www.w3.org/TR/wai-aria/roles#tablist)
 * [ARIA](http://www.w3.org/TR/wai-aria/) attributes.  If any [[Xooie.Tab#tabs]] are not decendants of the tab list, the ids of those
 * tabs are added to the [`aria-owns`](http://www.w3.org/TR/wai-aria/states_and_properties#aria-owns) attribute.
 **/
  Tab.prototype._process_role_tablist = function(tablist) {
    var tabs = this.tabs();

    tablist.attr('role', 'tablist');

    tabs.each(function(index) {
      var owns, id;
      if (tablist.has(this).length === 0) {
        owns = tablist.attr('aria-owns') || '';

        owns = owns.split(' ');

        id = $(this).attr('id');

        if (owns.indexOf(id) === -1) {
          owns.push(id);
        }

        tablist.attr('aria-owns', owns.join(' '));
      }
    });

    return tablist;
  };
/** internal
 * Xooie.Tab#_render_role_tablist() -> Element
 *
 * TODO: Add this method to render the tablist if it is not included.
 **/
  Tab.prototype._render_role_tablist = function(){
    return $('<ul data-x-role="tablist"></ul>');
  };

/** internal
 * Xooie.Tab#_process_role_tabpanel(tabpanels) -> Element
 * - tabpanels (Element): A jQuery-selected collection of [[Xooie.Tab#tabpanels]]
 *
 * This method processes the elements that have been designated as [[Xooie.Tab#tabpanels]] with
 * the `data-x-role="tabpanel"` attribute.  Tabs are given the [`role="tabpanel"`](http://www.w3.org/TR/wai-aria/roles#tab) and [`aria-expanded="false"`](http://www.w3.org/TR/wai-aria/states_and_properties#aria-selected)
 * [ARIA](http://www.w3.org/TR/wai-aria/) attributes.
 **/
  Tab.prototype._process_role_tabpanel = function(tabpanels) {
    tabpanels.attr('role', 'tabpanel')
             .attr('aria-expanded', false);

    return tabpanels;
  };

  return Tab;
});

define('xooie/widgets/accordion', ['jquery', 'xooie/widgets/tab'], function($, Tab){
  var Accordion = Tab.extend(function() {
  });

  Accordion.define('namespace', 'accordion');

/** internal
 * Xooie.Accordion#_process_role_tablist(tablist) -> Element
 * - tablist (Element): A jQuery-selected collection of [[Xooie.Tab#tablists]]
 *
 * Same as [[Xooie.Tab#_process_role_tablist]] and also adds the [`aria-multiselectable="true"`](http://www.w3.org/TR/wai-aria/states_and_properties#aria-multiselectable) attribute.
 **/
  Accordion.prototype._process_role_tablist = function(tablist) {
    Tab.prototype._process_role_tablist.apply(this, arguments);

    tablist.attr('aria-multiselectable', true);

    return tablist;
  };

  Accordion.prototype.selectTabs = function(event, selectedTab) {
    var activeTabs = this.getActiveTabs();

    if (activeTabs.is(selectedTab)) {
      return activeTabs.not(selectedTab);
    } else {
      return activeTabs.add(selectedTab);
    }
  };

  return Accordion;
});

/*
*   Copyright 2013 Comcast
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

define('xooie/dialog', ['jquery', 'xooie/base'], function($, Base) {

    var Dialog = Base('dialog', function(){
        var self = this;

        this.id = Dialog._counter++;

        Dialog._instances[this.id] = this;

        this.root.attr('data-dialog-id', this.id);

        //add accessibility attributes
        this.root.find(this.options.containerSelector).attr('role', 'dialog');

        this.root.addClass('xooie-dialog');

        this.handlers = {
            mouseup: function(event){
                Dialog.close(self.id);
            },

            keyup: function(event){
                if([13,32].indexOf(event.which) !== -1){
                    Dialog.close(self.id);
                }
            }
        };
    });

    Dialog.setDefaultOptions({
        closeButtonSelector: '[data-role="closeButton"]',
        containerSelector: '[data-role="container"]',

        dialogActiveClass: 'is-dialog-active'
    });

    Dialog.setCSSRules({
        '.xooie-dialog': {
            position: 'fixed',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0
        }
    });

    Dialog.prototype.activate = function(){
        this.root.addClass(this.options.dialogActiveClass);

        if(Dialog._active === this) {
            return;
        }

        if(Dialog._active){
            Dialog._active.deactivate();
        }

        this.root.find(this.options.closeButtonSelector)
                 .on(this.handlers);

        Dialog._active = this;

        this.root.trigger('dialogActive');
    };

    Dialog.prototype.deactivate = function(){
        this.root.removeClass(this.options.dialogActiveClass);

        if (Dialog._active !== this) {
            return;
        }

        this.root.find(this.options.closeButtonSelector)
                 .off(this.handlers);

        Dialog._active = null;

        this.root.trigger('dialogInactive');
    };

    Dialog._instances = [];
    Dialog._counter = 0;
    Dialog._active = null;
    Dialog._queue = [];

    Dialog.open = function(id){
        //get dialog instance
        var dialog = this._instances[id];

        if (typeof dialog === 'undefined' || this._active === dialog){
            return;
        }

        if (this._active) {
            this._queue.push(dialog);
        } else {
            dialog.activate();
        }

    };

    Dialog.close = function(){
        //get dialog instance
        if(!this._active) {
            return;
        }

        this._active.deactivate();

        if (this._queue.length > 0) {
            this._queue.pop().activate();
        }
    };

    return Dialog;
});
define("xooie/widgets/dialog", function(){});
