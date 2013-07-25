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
 * Xooie.shared.extend(constructor, _super) -> Widget | Addon
 * - constructor (Function): The constructor for the new [[Xooie.Widget]] or [[Xooie.Addon]] class.
 * - _super (Widget | Addon): The module which is to be extended
 *
 * Creates a new Xooie widget/addon class that inherits all properties from the extended class.
 * Constructors for the class are called in order from the top-level constructor to the
 * base constructor.
 **/
    extend: function(constructor, module){
      function Child() {
        module.apply(this, arguments);
        constructor.apply(this, arguments);
        this._extendCount -= 1;
      }

      $.extend(true, Child, module);
      $.extend(true, Child.prototype, module.prototype);

      Child.prototype._extendCount = Child.prototype._extendCount === null ? 1 : Child.prototype._extendCount += 1;

      return Child;
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
    }

  };

  return shared;
});