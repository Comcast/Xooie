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

define('xooie/tab', ['jquery', 'xooie/base'], function($, Base) {

    var Tab = Base('tab', function() {
        var self = this;

        this.createTabs();
    });

    Tab.setDefaultOptions({
        panelSelector: '[data-role="tab-panel"]',
        stripSelector: '[data-role="tab-strip"]',
        controlSelector: '[data-role="tab-selector"]',
        controlButtonSelector: '[data-tab-control]',
        tabTemplateSelector: '[data-role="tab-template"]',

        activeTabClass: 'is-tab-active'
    });

    $.extend(Tab.prototype, {
        switchToTab: function(index, key) {
            if (index !== this._currentTab && index >= 0 && index < this.getPanel().length) {
                var e = $.Event('tabChange');
                e.fromTab = this._currentTab;
                e.toTab = index;
                e.which = key;

                this.getPanel(this._currentTab).removeClass(this.options.activeTabClass);
                this.getTab(this._currentTab).removeClass(this.options.activeTabClass);

                this.getPanel(index).addClass(this.options.activeTabClass);
                this.getTab(index).addClass(this.options.activeTabClass);

                this._currentTab = index;

                this.root.trigger(e);
            }
        },

        getPanel: function(index) {
            var panels = this.root.find(this.options.panelSelector);

            if (typeof index === 'undefined') {
                return panels;
            } else {
                return panels.eq(index);
            }
        },

        getTab: function(index) {
            var tabs = this.root.find(this.options.controlSelector);
            if (typeof index === 'undefined') {
                return tabs;
            } else {
                return tabs.eq(index);
            }
        },

        createTabs: function() {
            var tabStrip = this.root.find(this.options.stripSelector),
                template = this.root.find(this.options.tabTemplateSelector),
                panels = this.getPanel(),
                i, element, control,
                activeTab = 0, handler, self = this;

            this.getTab().remove();

            handler = function(event) {
                var keys = [13,32];

                if ([1,13,32].indexOf(event.which) !== -1){
                    self.switchToTab($(this).data('tab-index'), event.which);
                }
            };

            for (i = 0; i < panels.length; i++) {
                if(tabStrip.length > 0 && template.length > 0) {
                    element = this.render(template, {
                        panel_label: panels.eq(i).attr('data-tab-label'),
                        panel_index: i,
                        panel_has_next: (i < panels.length - 1)
                    });

                    if (element.is(this.options.controlButtonSelector)) {
                        control = element;
                    } else {
                        control = element.find(this.options.controlButtonSelector);
                    }

                    control.data('tab-index', i)
                           .on('mouseup keydown', handler);

                    tabStrip.append(element);
                }

                if (panels.eq(i).hasClass(this.options.activeTabClass)) {
                    activeTab = i;
                }
            }

            this.switchToTab(activeTab);
        }
    });

    return Tab;
});