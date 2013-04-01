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

define('xooie/addons/base', ['jquery'], function($) {
    var Base = function(name, constructor){
        var defaultOptions = {},
            initEvent = name.toLowerCase() + 'AddonInit',
            className = 'has-' + name.toLowerCase() + '-addon',

            wrapper = function(module) {
                //Let's check to see if module is defined...
                //TODO: intelligently check if module is an instance of the base ui class
                if (typeof module === 'undefined') {
                    return false;
                }

                //if we've already instantiated an instance of this addon for this module, return it
                if (module.addons && typeof module.addons[name] !== 'undefined') {
                    return module.addons[name];
                }

                //module is the module we are extending.
                this.module = module;

                //track this addon on the parent module
                this.module.addons[name] = this;

                //We'll need to extend the module's base properties
                this.options = $.extend({}, wrapper.getDefaultOptions(), this.module.options);

                this.module.root.addClass(className);

                constructor.apply(this, arguments);

                this.module.root.trigger(initEvent);
            };

        wrapper.prototype.cleanup = function() {
            this.module.root.removeClass(className);
        };

        wrapper.getDefaultOptions = function(){
            return defaultOptions;
        };

        wrapper.setDefaultOptions = function(options){
            if (typeof options !== 'undefined') {
                $.extend(defaultOptions, options);
            }
        };

        return wrapper;
    };

    return Base;
});
