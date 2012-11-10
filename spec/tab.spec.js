require(['jquery', 'tab'], function($, Tab) {

    describe('Tab', function() {

        var element, t;

        it('calls createTabs', function() {
            element = $('<div/>');

            spyOn(Tab.prototype, 'createTabs');

            t = new Tab(element);

            expect(t.createTabs).toHaveBeenCalled();
        });

        beforeEach(function(){
            element = $([
                '<div>',
                    '<ul data-role="tab-strip"></ul>',
                    '<script type="text/x-jquery-tmpl" data-role="tab-template">',
                        '<li data-role="tab-selector" data-tab-control="true" data-panel-index="<#= panel_index #>" data-panel-has-next="<#= panel_has_next #>"><#= panel_label #></li>',
                    '</script>',
                    '<div id="panel1" data-tab-label="Tab One" data-role="tab-panel"><h2>Tab One</h2></div>',
                    '<div id="panel2" data-tab-label="Tab Two" data-role="tab-panel"><h2>Tab Two</h2></div>',
                    '<div id="panel3" data-tab-label="Tab Three" data-role="tab-panel"><h2>Tab Three</h2></div>',
                '</div>'
            ].join(''));

            t = new Tab(element);
        });

        it('calls "switchToTab" on tab control click', function() {
            spyOn(t, 'switchToTab');

            t.root.find('[data-tab-control]').trigger('click');

            expect(t.switchToTab).toHaveBeenCalledWith(0);
        });

        describe('tabChange Event', function() {

            it('updates class names on tabs and panels', function() {
                t.switchToTab(1);

                expect(t.getPanel(0).hasClass(t.options.activeTabClass)).toBe(false);
                expect(t.getPanel(1).hasClass(t.options.activeTabClass)).toBe(true);
                expect(t.getTab(0).hasClass(t.options.activeTabClass)).toBe(false);
                expect(t.getTab(1).hasClass(t.options.activeTabClass)).toBe(true);
            });

        });

        describe('switchToTab', function() {

            it('triggers a "tabChange" event', function() {
                var handler = jasmine.createSpy('test handler');

                element.on('tabChange', handler);

                t.switchToTab(1);

                expect(handler).toHaveBeenCalled();
            });

            it('does not trigger a "tabChange" event if the new tab is the same as the current tab', function() {
                var handler = jasmine.createSpy('test handler');

                element.on('tabChange', handler);

                t._currentTab = 1;

                t.switchToTab(1);

                expect(handler).not.toHaveBeenCalled();
            });

            it('does not trigger a "tabChange" event if the new tab is out of range', function() {
                var handler = jasmine.createSpy('test handler');

                element.on('tabChange', handler);

                t.switchToTab(4);

                expect(handler).not.toHaveBeenCalled();
            });

            it('passes fromTab and toTab data as part of the event object', function() {
                element.on('tabChange', function(event) {
                    expect(event.fromTab).toBeDefined();
                    expect(event.toTab).toBeDefined();
                });

                t.switchToTab(0);
            });

            it('passes an interactive flag as part of the event object', function() {
                element.on('tabChange', function(event) {
                    expect(event.interactive).toEqual(true);
                });

                t.switchToTab(0, true);
            });

            it('updated the _currentTab', function() {
                expect(t._currentTab).toEqual(0);

                t.switchToTab(1);

                expect(t._currentTab).toEqual(1);
            });

            it('will not switch to an invalid tab index', function() {
                var handler = jasmine.createSpy();

                element.on('tabChange', handler);

                t.switchToTab(3);

                expect(t._currentTab).toEqual(0);
                expect(handler).not.toHaveBeenCalled();
            });

        });

        describe('panel', function() {

            it('returns all panels if no index is provided', function() {
                expect(t.getPanel().length).toEqual(3);
            });

            it('returns panel by index', function() {
                expect(t.getPanel(0).attr('id')).toEqual('panel1');
                expect(t.getPanel(1).attr('id')).toEqual('panel2');
            });

        });

        describe('tab', function() {

            it('returns all tabs if no index is provided', function() {
                expect(t.getTab().length).toEqual(3);
            });

            it('returns tab by index', function() {
                expect(t.getTab(0).text()).toEqual('Tab One');
                expect(t.getTab(1).text()).toEqual('Tab Two');
            });

        });

        describe('createTabs', function() {

            it('creates an element for each panel', function() {
                var tabStrip = element.find('[data-role="tab-strip"]');

                expect(tabStrip.find('li').length).toEqual(3);
                expect(tabStrip.find('li').eq(0).text()).toEqual('Tab One');
                expect(tabStrip.find('li').eq(1).text()).toEqual('Tab Two');
                expect(tabStrip.find('li').eq(2).text()).toEqual('Tab Three');
            });

            it('provides a panel_index value to the template', function() {
                expect(t.getTab(0).attr('data-panel-index')).toEqual('0');
                expect(t.getTab(1).attr('data-panel-index')).toEqual('1');
            });

            it('provides a panel_has_next value to the template', function() {
                expect(t.getTab(0).attr('data-panel-has-next')).toEqual('true');
                expect(t.getTab(2).attr('data-panel-has-next')).toEqual('false');
            });

            it('removes existing tab elements when createTabs is called', function() {
                element.find('[data-tab-control]').eq(0).attr('label', 'Panel A');
                element.find('[data-tab-control]').eq(1).attr('label', 'Panel B');

                t.createTabs();

                var tabStrip = element.find('[data-role="tab-strip"]');

                expect(tabStrip.find('li').length).toEqual(3);
                expect(tabStrip.find('li').eq(0).attr('label')).not.toEqual('Panel A');
                expect(tabStrip.find('li').eq(1).attr('label')).not.toEqual('Panel B');
            });

            it('calls switchToTab', function() {
                spyOn(t, 'switchToTab');

                t.createTabs();

                expect(t.switchToTab).toHaveBeenCalledWith(0);
            });

        });

    });

});

