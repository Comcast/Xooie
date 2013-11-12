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
 * class Xooie.Addon
 *
 * The base xooie addon module.  This module defines how addons function in relation to
 * widgets, but contains no specific functionality.
 **/
define('xooie/addons/base', ['jquery', 'xooie/shared'], function($, shared) {
/**
 * Xooie.Addon@xooie-addon-init(event)
 * - event (Event): A jQuery event object
 *
 * A jQuery special event triggered when the addon is successfully initialized.  Triggers on the `root` element
 * of the adodn's widget.  Unlike [[Xooie.Widget@xooie-init]], this event only triggers when the addon is first instantiated.
 **/

/**
 * new Xooie.Addon(widget)
 * - widget (Widget): An instance of [[Xooie.Widget]].
 *
 * Instantiating a new Addon associates the addon with the widget passed into the constructor.  The addon is
 * stored in the [[Xooie.Widget#addons]] collection.
 **/
  var Addon = function(widget) {
    var self = this;

    // Check to see if the module is defined:
    if (typeof widget === 'undefined') {
      return false;
    }

    this._setData(widget.root().data());

    // If there is already an instance of this addon instantiated for the module, return it:
    if (widget.addons() && widget.addons().hasOwnProperty(this.name())) {
      return widget.addons()[this.name()];
    }

    // Add this addon to the widget's addons collection:
    widget.addons()[this.name()] = this;

    widget.root().addClass(this.addonClass());

    // Set the default options
    shared.setData(this, widget.root().data());

    // Reference the widget:
    this.widget(widget);

    // Check to see if there are any additional constructors to call;
    var initCheck = function(){
      var i;

      if (!self._extendCount || self._extendCount <= 0) {
        self.widget().root().trigger(self.get('initEvent'));
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
  };

/**
* Xooie.Addon.defineReadOnly(name, defaultValue)
* - name (String): The name of the property to define as a read-only property.
* - defaultValue (Object): An optional default value.
*
* See [[Xooie.shared.defineReadOnly]].
**/
  Addon.defineReadOnly = function(name, defaultValue){
    shared.defineReadOnly(this, name, defaultValue);
  };

/**
* Xooie.Addon.defineWriteOnly(name)
* - name (String): The name of the property to define as a write-only property
*
* See [[Xooie.shared.defineWriteOnly]].
**/
  Addon.defineWriteOnly = function(name){
    shared.defineWriteOnly(this, name);
  };

/**
* Xooie.Widget.define(name[, defaultValue])
* - name (String): The name of the property to define.
* - defaultValue: An optional default value.
*
* A method that defines a property as both readable and writable.  In reality it calls both [[Xooie.Addon.defineReadOnly]]
* and [[Xooie.Addon.defineWriteOnly]].
**/
  Addon.define = function(name, defaultValue){
    this.defineReadOnly(name, defaultValue);
    this.defineWriteOnly(name);
  };

/**
* Xooie.Addon.extend(constr) -> Addon
* - constr (Function): The constructor for the new [[Xooie.Addon]] class.
*
* See [[Xooie.shared.extend]].
**/
  Addon.extend = function(constr){
    return shared.extend(constr, this);
  };

/** internal
* Xooie.Addon#_definedProps -> Array
*
* Same as [[Xooie.Widget#_definedProps]].
**/
  Addon.prototype._definedProps = [];

/** internal
* Xooie.Addon#_extendCount -> Integer | null
*
* Same as [[Xooie.Widget#_extendCount]].
**/
  Addon.prototype._extendCount = null;

/** internal
* Xooie.Addon#_widget -> Widget
*
* The widget for which this addon was instantiated.
**/
/**
* Xooie.Addon#widget([value]) -> Widget
* - value: an optional value to be set.
*
* The method for setting or getting [[Xooie.Addon#_widget]].  Returns the current value of
* [[Xooie.Addon#_widget]] if no value is passed or sets the value.
**/
  Addon.define('widget');

/** internal
* Xooie.Addon#_name -> String
*
* The name of the addon.
**/
/**
* Xooie.Addon#name([value]) -> String
* - value: an optional value to be set.
*
* The method for setting or getting [[Xooie.Addon#_name]].  Returns the current value of
* [[Xooie.Addon#_name]] if no value is passed or sets the value.
**/
  Addon.define('name', 'addon');


/** internal, read-only
* Xooie.Addon#_root -> String
*
* The root element of the parent widget.
**/
/** read-only
* Xooie.Addon#root() -> String
*
* The method for getting [[Xooie.Addon#_root]]
**/
  Addon.defineReadOnly('root');

/** internal, read-only
* Xooie.Addon#_initEvent -> String
*
* The name of the event triggered when the addon is instantiated.
**/
/** read-only
* Xooie.Addon#initEvent() -> String
*
* The method for getting [[Xooie.Addon#_initEvent]].
**/
  Addon.defineReadOnly('initEvent', 'xooie-addon-init');

/** internal, read-only
* Xooie.Addon#_addonClass -> String
*
* The class added to the widget root indicating that this addon has been instantiated.
**/
/** read-only
* Xooie.Addon#addonClass() -> String
*
* The method for getting [[Xooie.Addon#_addonClass]].
**/
  Addon.defineReadOnly('addonClass', 'has-addon');

/** internal
* Xooie.widget#_setData(data)
* - data (Object): A collection of key/value pairs.
*
* Sets the properties to the values specified, as long as the property has been defined.
**/
Addon.prototype._setData = function(data) {
  var i;

  for (i = 0; i < this._definedProps.length; i+=1) {
    if (typeof data[this._definedProps[i]] !== 'undefined') {
      this.set(this._definedProps[i], data[this._definedProps[i]]);
    }
  }
};

/**
* Xooie.Addon#get(name) -> object
* - name (String): The name of the property to be retrieved.
*
* See [[Xooie.shared.get]].
**/
  Addon.prototype.get = function(name) {
    return shared.get(this, name);
  };

/**
* Xooie.Addon#set(name, value)
* - name (String): The name of the property to be set.
* - value: The value of the property to be set.
*
* See [[Xooie.shared.set]].
**/
  Addon.prototype.set = function(name, value) {
    return shared.set(this, name, value);
  };

/**
* Xooie.Addon#cleanup()
*
* Removes the `addonClass` from the `root` of the associated `widget` and prepares this widget to be
* garbage collected.
**/
  Addon.prototype.cleanup = function() {
    this.widget().root().removeClass(this.addonClass());
  };

/** internal
* Xooie.Addon#_get_root() -> Element
*
* Returns the root of the parent widget.
**/
  Addon.prototype._get_root = function() {
    return this.widget().root();
  };

/** internal
* Xooie.Addon#_process_initEvent(initEvent) -> String
* - initEvent (String): The unmodified initEvent string.
*
* Adds the [[Xooie.Addon#name]] to the `initEvent`
**/
  Addon.prototype._process_initEvent = function(initEvent) {
    return this.name() === 'addon' ? initEvent : initEvent + '.' + this.name();
  };

/** internal
* Xooie.Addon#_process_addonClass(className) -> String
* - className (String): The unmodified className string.
*
* Adds the [[Xooie.Addon#name]] to the `addonClass`
**/
  Addon.prototype._process_addonClass = function(addonClass) {
    return this.name() === 'addon' ? addonClass : 'has-' + this.name() + '-addon';
  };

  return Addon;
});