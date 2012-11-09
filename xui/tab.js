define(['jquery', 'base'], function($, Base) {

    var Tab = Base('tab', function() {
        var self = this;

        this.root.on('click', '[data-tab-control]', function(event) {
            event.preventDefault();

            self.switchToTab($(this).data('tab-index'));
        });

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
        switchToTab: function(index) {
            if (index !== this._currentTab && index >= 0 && index < this.getPanel().length) {
                var e = $.Event('tabChange');
                e.fromTab = this._currentTab;
                e.toTab = index;

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
                activeTab = 0;

            this.getTab().remove();

            for (i = 0; i < panels.length; i++) {
                if(tabStrip.length > 0 && template.length > 0) {
                    element = this.render(template, {
                        panel: panels.eq(i),
                        panel_label: panels.eq(i).attr('data-tab-label'),
                        panel_index: i,
                        panel_has_next: (i < panels.length - 1)
                    });

                    if (element.is(this.options.controlButtonSelector)) {
                        control = element;
                    } else {
                        control = element.find(this.options.controlButtonSelector);
                    }

                    control.data('tab-index', i);

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

