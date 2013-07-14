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
 * class Xooie.Addon
 *
 * The base xooie addon module.  This module defines how addons function in relation to
 * widgets, but contains no specific functionality.
 **/
define('xooie/addons/base', ['jquery', 'xooie/widgets/base'], function($, Widget) {
    
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

        // If there is already an instance of this addon instantiated for the module, return it:
        if (widget.addons() && widget.addons().hasOwnProperty(this.name())) {
            return widget.addons()[this.name()];
        }

        // Add this addon to the widget's addons collection:
        widget.addons()[this.name()] = this;

        widget.root().addClass(this.addonClass());

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

        if (typeof this._extendCount > 0) {
            setTimeout(initCheck, 0);
        } else {
            initCheck();
        }
    };

/**
 * Xooie.Addon.defineReadOnly(name, defaultValue)
 *
 * Same as [[Xooie.Widget.defineReadOnly]].
 **/
    Addon.defineReadOnly = Widget.defineReadOnly;

/**
 * Xooie.Addon.defineWriteOnly(name)

 * Same as [[Xooie.Widget.defineWriteOnly]].
 **/
    Addon.defineWriteOnly = Widget.defineWriteOnly;

/**
 * Xooie.Addon.define(name, defaultValue)
 *
 * Same as [[Xooie.Widget.define]].
 **/
    Addon.define = Widget.define;

/**
 * Xooie.Addon.extend(constructor)
 *
 * Same as [[Xooie.Widget.extend]].
 **/
    Addon.extend = Widget.extend;

/** internal
 * Xooie.Addon#_definedProps -> Array
 *
 * Same as [[Xooie.Widget#_definedProps]].
 **/
    Addon.prototype._definedProps = [];

/** internal
 * Xooie.Addon#_extendCount -> Integer | null
 *
 * Same as [[Xooie.Widget#_extendCount]]
 **/
    Addon.prototype._extendCount = null;


    Addon.define('widget');

    Addon.define('name', 'addon');

    Addon.defineReadOnly('initEvent','xooie-addon-init');

    Addon.defineReadOnly('addonClass', 'has-addon');

/**
 * Xooie.Addon#set(name, value)
 *
 * Same as [[Xooie.Widget#set]]
 **/
    Addon.prototype.set = Widget.prototype.set;

/**
 * Xooie.Addon#set(name)
 *
 * Same as [[Xooie.Widget#get]]
 **/
    Addon.prototype.get = Widget.prototype.get;

/**
 * Xooie.Addon#cleanup()
 *
 * Removes the `addonClass` from the `root` of the associated `widget` and prepares this widget to be
 * garbage collected.
 **/
    Addon.prototype.cleanup = function() {
        this.widget().root().removeClass(this.addonClass());
    };

    Addon.prototype._process_initEvent = function(initEvent) {
        return this.name() === 'addon' ? initEvent : initEvent + '.' + this.name();
    };

    Addon.prototype._process_addonClass = function(addonClass) {
        return this.name() === 'addon' ? addonClass : 'has-' + this.name() + '-addon';
    };

    return Addon;
});
