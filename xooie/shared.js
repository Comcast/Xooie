/**
 * class Xooie.shared
 *
 * A module that contains functionality that is used both by [[Xooie.Widget]] and [[Xooie.Addon]]
 * This module exists to abstract common functionality so that it can be maintained in one place.
 * It is not intended to be used independently.
 **/
define('xooie/shared', ['jquery', 'xooie/helpers'], function ($, helpers) {
  'use strict';

  var shared;
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
  function propertyDetails(name) {
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
  function propertyDispatcher(name, prototype) {
    var prop = propertyDetails(name);

    if (!helpers.isFunction(prototype[name])) {
      prototype._definedProps.push(name);

      prototype[name] = function (value) {
        if (helpers.isUndefined(value)) {
          return this[prop.getter]();
        }
        return this[prop.setter](value);
      };
    }
  }

  shared = {
/**
 * Xooie.shared.defineReadOnly(module, name[, defaultValue])
 * - module (Widget | Addon): The module on which this property will be defined.
 * - name (String): The name of the property to define as a read-only property.
 * - defaultValue (Object): An optional default value.
 *
 * Defines a read-only property that can be accessed either by [[Xooie.Widget#get]]/[[Xooie.Addon#get]] or
 * calling the `{{name}}` method on the instance of the module.
 **/
    defineReadOnly: function (module, name, defaultValue) {
      var prop = propertyDetails(name);

      propertyDispatcher(name, module.prototype);

      //The default value is reset each time this method is called;
      module.prototype[prop.defaultValue] = defaultValue;

      if (!helpers.isFunction(module.prototype[prop.getter])) {
        module.prototype[prop.getter] = function () {
          var value = helpers.isUndefined(this[prop.value]) ? this[prop.defaultValue] : this[prop.value];

          if (helpers.isFunction(this[prop.processor])) {
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
    defineWriteOnly: function (module, name) {
      var prop = propertyDetails(name);

      propertyDispatcher(name, module.prototype);

      if (!helpers.isFunction(module.prototype[prop.setter])) {
        module.prototype[prop.setter] = function (value) {
          if (!helpers.isFunction(this[prop.validator]) || this[prop.validator](name)) {
            this[prop.value] = value;
          }
        };
      }
    },
/**
 * Xooie.shared.create(constr, post_constr, _super) -> Widget | Addon
 * - constr (Function): The constructor for the new [[Xooie.Widget]] or [[Xooie.Addon]] class.
 * - post_constr (Function): The optional constructor method to run after all constructors have run.
 * - _super (Widget | Addon): The optional module which is to be extended
 *
 * Creates a new Xooie widget/addon class that inherits all properties from the extended class.
 * Constructors for the class are called in order from the top-level constructor to the
 * base constructor followed by the post constructors from the base to top-level post constructor.
 **/
    extend: function (constr, module) {
      var newModule = (function () {
        return function Child() {
          var i, result;

          for (i = 0; i < newModule._constructors.length; i += 1) {
            result = newModule._constructors[i].apply(this, arguments);

            if (typeof result !== 'undefined') {
              return result;
            }
          }

          for (i = 0; i < newModule._postConstructors.length; i += 1) {
            newModule._postConstructors[i].apply(this, arguments);
          }
        };
      }());

      if (typeof module !== 'undefined') {
        $.extend(true, newModule, module);
        $.extend(true, newModule.prototype, module.prototype);
      }

      newModule.prototype._extendCount = newModule.prototype._extendCount === null ? 1 : newModule.prototype._extendCount + 1;

      return newModule;
    },
/**
 * Xooie.shared.get(instance, name) -> object
 * - instance (Widget | Addon): The instance from which the property is to be retrieved.
 * - name (String): The name of the property to be retrieved.
 *
 * Retrieves the value of the property.  Returns `undefined` if the property has not been defined.
 **/
    get: function (instance, name) {
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
    set: function (instance, name, value) {
      var prop = propertyDetails(name);

      if (helpers.isFunction(instance[prop.setter])) {
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
    setData: function (instance, data) {
      var i, prop;

      for (i = 0; i < instance._definedProps.length; i += 1) {
        prop = instance._definedProps[i];
        if (!helpers.isUndefined(data[prop])) {
          instance.set(prop, data[prop]);
        }
      }
    }

  };

  return shared;
});
