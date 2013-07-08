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

/**
 *  Xooie
 *
 *  Xooie is a JavaScript UI widget library.
 **/

/**
 * $X(element)
 *
 * Traverses the DOM, starting from the element passed to the method,
 * and instantiates a Xooie widget for every element that has a
 * data-widget-type attribute.
 **/

$X = Xooie = (function(static_config) {
    var config = {
            modules: {},
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
        if (typeof Xooie.garbageCollect !== 'undefined') {
            Xooie.garbageCollect();
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

        if (typeof cfg.gcInterval !== 'undefined') {
            if (config.gcInterval) {
                gcTimer = setInterval(gcCallback, config.gcInterval);
            } else {
                if (gcTimer) {
                    clearInterval(gcTimer);
                }
                gcTimer = null;
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

    obj.config({
        gcInterval: 0
    });

    if (static_config) {
        obj.config(static_config);
    }

    return obj;
}(Xooie));

define('xooie', ['jquery', 'xooie_helpers'], function($, helpers){
    var config = Xooie.config,
        mapName = Xooie.mapName,
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
            moduleNames = [].concat(helpers.parseData(node.data(widgetDataAttr)));

            // Do the same with each addon name:
            moduleNames = moduleNames.concat(helpers.parseData(tmpNode.data(addonDataAttr)));

            // For each name in the moduleNames array, check if the MAPPED NAME is already
            // in our list of urls to require:
            for (j = 0; j < moduleNames.length; j+=1) {
                url = $X._mapName(moduleNames[j]);

                if (moduleUrls.indexOf(url) === -1) {
                    moduleUrls.push(url);
                }
            }
        }

        // Now that we have a list of urls to load, let's load them:
        require(moduleUrls, function(){
            var widgets, addons, node,
                widgetInst, argIndex,
                i, j, k;

            // We need to iterate through our collection of nodes again:
            for (i = 0; i < nodes.length; i+=1) {
                node = $(nodes[i]);

                // This time, we're keeping track of our addons and widges separately:
                widgets = helpers.parseData(node.data(widgetDataAttr));
                addons = helpers.parseData(node.data(addonDataAttr));

                // Iterate through each widget type:
                for (j = 0; j < widgets.length; j+=1) {

                    // Get the index of this module from the moduleUrls:
                    argIndex = moduleUrls.indexOf($X._mapName(widgets[j]));

                    // Instantiate the new instance using the argIndex to find the right module:
                    widgetInst = new arguments[argIndex](node);

                    // Now create an instance of each addon and assign it to the module:
                    for (k = 0; k < addons.length; k+=1) {
                        if (!widgetInst.hasOwnProperty('addons')) {
                            widgetInst.addons = {};
                        }

                        // Get the index of the addon module from moduleUrls:
                        argIndex = moduleUrls.indexOf($X._mapName(addons[k]));

                        // Instantiate the new instance of the addon:
                        new arguments[argIndex](widgetInst);
                    }
                }
            }
        });
    };

    Xooie.config = config;
    Xooie._mapName = mapName;

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
