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

define('xooieInit', ['jquery'], function($){

    var XooieInit = function(element){
        element = $(element);

        var widgetElements = element.find('[data-widget-type]');

        if (element.is('[data-widget-type]')){
            widgetElements = widgetElements.add(element);
        }

        widgetElements.each(function(){
            var node = $(this),
                types = node.data('widgetType').split(/\s+/);

            for (var i = 0; i < types.length; i++) {
                require([types[i]], function(Widget) {
                    new Widget(node);
                });
            }
        });
    };

    return XooieInit;
});