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

var $X, Xooie;

$X = Xooie = (function(static_config) {
    var config = {
            modules: {},
            addons: {}
        },
        obj = function() {
            return false;
        };

    function copyObj(dst, src) {
        var name;

        for (name in src) {
            if (src.hasOwnProperty(name)) {
                dst[name] = src[name];
            }
        }
    }

    obj.config = function(cfg) {
        var name;

        for (name in cfg) {
            if (cfg.hasOwnProperty(name)) {
                if (name === 'modules' || name == 'addons') {
                    copyObj(config[name], cfg[name]);
                } else {
                    config[name] = cfg[name];
                }
            }
        }
    };

    obj.mapName = function(name, type, root) {
        if (typeof config[type][name] === 'undefined') {
            return root + name;
        } else {
            return config[type][name];
        }
    };

    if (static_config) {
        obj.config(static_config);
    }

    return obj;
}(Xooie));

define('xooie', ['jquery'], function($){
    var config = Xooie.config,
        mapName = Xooie.mapName,
        
        instantiateWidget = function(Widget){
            new Widget(this);
        };

    $X = Xooie = function(element){
        element = $(element);

        var widgetElements = element.find('[data-widget-type]');

        if (element.is('[data-widget-type]')){
            widgetElements = widgetElements.add(element);
        }

        widgetElements.each(function(){
            var node = $(this),
                module_name,
                types = node.data('widgetType').split(/\s+/);

            for (var i = 0; i < types.length; i++) {
                module_name = $X.mapName(types[i], 'modules', 'xooie/');

                require([module_name], instantiateWidget.bind(node));
            }
        });
    };

    Xooie.config = config;
    Xooie.mapName = mapName;

    Xooie.registeredClasses = [];
    Xooie.garbageCollect = function() {
        for (var i = 0; i < this.registeredClasses.length; i++) {
            this.registeredClasses[i].garbageCollect();
        }
    };

    return Xooie;
});

require(['jquery', 'xooie'], function($, $X){
    $(document).ready(function() {
        $X($(this));
    });
});
