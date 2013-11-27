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

$X = Xooie = (function (static_config) {
  'use strict';
  var config = {
      widgets: {},
      addons: {}
    },
    obj = function () {
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
    if (Xooie.cleanup !== undefined) {
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

  obj.config = function (options) {
    var name;

    for (name in options) {
      if (options.hasOwnProperty(name)) {
        if (name === 'widgets' || name === 'addons') {
          copyObj(config[name], options[name]);
        } else {
          config[name] = options[name];
        }
      }
    }

    if (options.cleanupInterval !== undefined) {
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

  obj._mapName = function (name, type) {
    if (config[type][name] === undefined) {
      return [config.root, '/', type, '/', name].join('');
    }
    return config[type][name];
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

define('xooie/xooie', ['jquery', 'xooie/helpers', 'xooie/stylesheet'], function ($, helpers, Stylesheet) {
  'use strict';
  var config, _mapName, widgetSelector, widgetDataAttr, addonDataAttr;

  config = Xooie.config;
  _mapName = Xooie._mapName;
  widgetSelector = '[data-widget-type]';
  widgetDataAttr = 'widgetType';
  addonDataAttr = 'addons';

  $X = Xooie = function (element) {
    var node, nodes, moduleNames, moduleUrls, url, i, j;

    element = $(element);

    // Find all elements labeled as widgets:
    nodes = element.find(widgetSelector);

    // If the element is also tagged, add it to the collection:
    if (element.is(widgetSelector)) {
      nodes = nodes.add(element);
    }

    // This array will be the list of unique modules to load:
    moduleUrls = [];

    // Iterate through each item in the collection:
    for (i = 0; i < nodes.length; i += 1) {
      node = $(nodes[i]);

      // Add all of the widget types to the list of modules we need:
      moduleNames = helpers.toAry(node.data(widgetDataAttr));

      // For each widget we check to see if the url is already in our
      // list of urls to require:
      for (j = 0; j < moduleNames.length; j += 1) {
        url = $X._mapName(moduleNames[j], 'widgets');

        if (moduleUrls.indexOf(url) === -1) {
          moduleUrls.push(url);
        }
      }

      // Do the same with each addon name:
      moduleNames = helpers.toAry(node.data(addonDataAttr)) || [];

      for (j = 0; j < moduleNames.length; j += 1) {
        url = $X._mapName(moduleNames[j], 'addons');

        if (moduleUrls.indexOf(url) === -1) {
          moduleUrls.push(url);
        }
      }
    }

    // Now that we have a list of urls to load, let's load them:
    require(moduleUrls, function () {
      var widgets, addons, addonMods, WidgetMod, argIndex, instances, k;

      instances = [];

      // We need to iterate through our collection of nodes again:
      for (i = 0; i < nodes.length; i += 1) {
        node = $(nodes[i]);

        // This time, we're keeping track of our addons and widges separately:
        widgets = helpers.toAry(node.data(widgetDataAttr));
        addons = helpers.toAry(node.data(addonDataAttr)) || [];

        // Iterate through each widget type:
        for (j = 0; j < widgets.length; j += 1) {

          // Get the index of this module from the moduleUrls:
          argIndex = moduleUrls.indexOf($X._mapName(widgets[j], 'widgets'));

          //Get the widget that we'll be instantiating:
          WidgetMod = arguments[argIndex];

          addonMods = [];

          // Now get each addon that we'll instantiate with the widget:
          for (k = 0; k < addons.length; k += 1) {
            // Get the index of the addon module from moduleUrls:
            argIndex = moduleUrls.indexOf($X._mapName(addons[k], 'addons'));

            addonMods.push(arguments[argIndex]);
          }

          // Instantiate the new instance using the argIndex to find the right module:
          instances.push(new WidgetMod(node, addonMods));
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

  Xooie.cleanup = function () {
    var i, instance;

    for (i = 0; i < $X._instanceCache.length; i += 1) {
      instance = $X._instanceCache[i];

      if (instance.root() && instance.root().parents('body').length === 0) {
        instance.cleanup();
        delete $X._instanceCache[i];
      }
    }
  };

  return Xooie;
});

require(['jquery', 'xooie/xooie'], function ($, $X) {
  'use strict';

  $(document).ready(function () {
    $X($(this));
  });
});