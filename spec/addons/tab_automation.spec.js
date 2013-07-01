require(['jquery', 'xooie/tab', 'xooie/addons/tab_automation'], function($, Tab, Automation) {
    xdescribe('Tab Automation Addon', function(){
        var tabInst, autoInst, el, offset;

        beforeEach(function(){
            spyOn($.fn, 'scrollTop').andReturn(200);
            spyOn($.fn, 'height').andReturn(1200);

            el = $([
                '<div data-delay="1">',
                    '<ul data-role="tab-strip"></ul>',
                    '<script type="application/x-jquery-tmpl" data-role="tab-template">',
                        '<li data-tab-conrol="true"></li>',
                    '</script>',
                    '<div data-role="tab-panel"><h2 data-role="tab-label">Tab One</h2></div>',
                    '<div data-role="tab-panel"><h2 data-role="tab-label">Tab Two</h2></div>',
                    '<div data-role="tab-panel"><h2 data-role="tab-label">Tab Three</h2></div>',
                '</div>'
            ].join(''));

            tabInst = new Tab(el);

            tabInst.addons = {};

            autoInst = new Automation(tabInst);
        });

        afterEach(function(){
            autoInst.stop();
            $(window).off('scroll');
        });

        describe('When instantiating the instance...', function(){

            beforeEach(function(){
                autoInst.stop();
                spyOn(autoInst, 'outOfRange').andReturn(false);
            });

            it('stops the rotation when the mouse enters the root element', function(){
                spyOn(autoInst, 'stop');

                autoInst.module.root.trigger('mouseenter');

                expect(autoInst._canRotate).toBe(false);
                expect(autoInst.stop).toHaveBeenCalled();
            });

            it('stops the rotation when the browser has focus on the root element', function(){
                spyOn(autoInst, 'stop');

                tabInst.root.trigger('focus');

                expect(autoInst._canRotate).toBe(false);
                expect(autoInst.stop).toHaveBeenCalled();
            });

            it('stops the rotation when the browser has focus on any element that is a child of the root element', function(){
                spyOn(autoInst, 'stop').andCallThrough();

                tabInst.root.find('ul').trigger('focus');

                expect(autoInst._canRotate).toBe(false);
                expect(autoInst.stop).toHaveBeenCalled();
            });

            it('starts the rotation when the mouse leaves the root element', function(){
                autoInst.stop();

                spyOn(autoInst, 'start');
                tabInst.root.trigger('mouseenter');

                tabInst.root.trigger('mouseleave');

                expect(autoInst._canRotate).toBe(true);
                expect(autoInst.start).toHaveBeenCalled();
            });

            it('starts the rotation when the browser looses focus the root element', function(){
                autoInst.stop();

                spyOn(autoInst, 'start');
                autoInst._canRotate = false;

                tabInst.root.trigger('blur');

                expect(autoInst._canRotate).toBe(true);
                expect(autoInst.start).toHaveBeenCalled();
            });

            it('starts the rotation when the browser looses focus on any element that is a child of the root element', function(){
                autoInst.stop();

                spyOn(autoInst, 'start').andCallThrough();
                autoInst._canRotate = false;

                tabInst.root.find('ul').trigger('blur');

                expect(autoInst._canRotate).toBe(true);
                expect(autoInst.start).toHaveBeenCalled();
            });

            it('will not permit rotation when the browser looses focus on an element but the mouse is still over the root element', function(){
                tabInst.root.trigger('focus');
                tabInst.root.trigger('mouseenter');

                tabInst.root.trigger('blur');

                expect(autoInst._canRotate).toBe(false);
            });

            it('starts a new rotation on tabChange', function(){
                spyOn(autoInst, 'start');

                tabInst.root.trigger('tabChange');

                expect(autoInst.start).toHaveBeenCalled();
            });

        });

        describe('When starting a rotation...', function(){
            var outOfRange = false;

            beforeEach(function(){
                autoInst.stop();

                autoInst.options.delay = 100;
                autoInst._canRotate = true;
                spyOn(autoInst, 'outOfRange').andCallFake(function(){ return outOfRange; });
            });

            it('clears the tabChangeTimer if it is set', function(){
                spyOn(autoInst, 'stop').andCallThrough();

                autoInst._tabChangeTimer = 100;

                autoInst.start();

                expect(autoInst.stop).toHaveBeenCalled();
            });

            it('rotates to the next tab after the delay has passes', function(){
                spyOn(tabInst, 'switchToTab');

                tabInst._currentTab = 0;

                autoInst.start();

                waits(150);

                runs(function(){
                    expect(tabInst.switchToTab).toHaveBeenCalledWith(1);
                });
            });

            it('rotates to the previous tab after the delay has passes if the direction is -1', function(){
                spyOn(tabInst, 'switchToTab');

                autoInst.options.direction = -1;
                tabInst._currentTab = 1;

                autoInst.start();

                waits(150);

                runs(function(){
                    expect(tabInst.switchToTab).toHaveBeenCalledWith(0);
                });
            });

            it('rotates to the first tab from the last tab after the delay has passes', function(){
                spyOn(tabInst, 'switchToTab');

                tabInst._currentTab = tabInst.getPanel().length - 1;

                autoInst.start();

                waits(150);

                runs(function(){
                    expect(tabInst.switchToTab).toHaveBeenCalledWith(0);
                });
            });

            it('rotates to the last tab from the first tab after the delay has passes if the direction is -1 ', function(){
                spyOn(tabInst, 'switchToTab');

                autoInst.options.direction = -1;
                tabInst._currentTab = 0;

                autoInst.start();

                waits(150);

                runs(function(){
                    expect(tabInst.switchToTab).toHaveBeenCalledWith(tabInst.getPanel().length - 1);
                });
            });

            it('stops the rotation if the _canRotate property is set to false after the delay passes', function(){
                spyOn(tabInst, 'switchToTab');

                autoInst.start();

                autoInst._canRotate = false;

                waits(150);

                runs(function(){
                    expect(tabInst.switchToTab).not.toHaveBeenCalled();
                });
            });

            it('stops the rotation if the tab is out of the visible range', function(){
                spyOn(tabInst, 'switchToTab');
                outOfRange = true;

                autoInst.start();

                waits(150);

                runs(function(){
                    expect(tabInst.switchToTab).not.toHaveBeenCalled();
                });

            });

            it('sets a scroll event on the window that checks if the tab is out of the visible range.  If it is not, it starts the rotation again', function(){
                outOfRange = true;

                spyOn(tabInst, 'switchToTab');
                spyOn($.fn, 'off').andCallThrough();

                autoInst.start();

                waits(150);
                spyOn(autoInst, 'start');

                runs(function(){
                    $(window).trigger('scroll');

                    expect(autoInst.start).not.toHaveBeenCalled();

                    outOfRange = false;

                    $(window).trigger('scroll');

                    expect(autoInst.start).toHaveBeenCalled();
                    expect($.fn.off).toHaveBeenCalled();
                });

            });


        });

        describe('When stopping the rotation...', function(){
            it('clears the timeout and sets the _tabChangeTimer to undefined', function(){
                spyOn(window, 'clearTimeout').andCallThrough();

                autoInst.stop();

                expect(window.clearTimeout).toHaveBeenCalled();
                expect(autoInst._tabChangeTimer).toBeUndefined();
            });
        });

        describe('When checking if the tab module is in view...', function(){
            beforeEach(function(){
                spyOn(tabInst.root, 'outerHeight').andReturn(100);
            });

            it('returns true if both the top and bottom are out of view', function(){
                spyOn(tabInst.root, 'offset').andReturn({top: 10});

                expect(autoInst.outOfRange()).toBe(true);
            });

            it('returns true if both the top and bottom are out of view', function(){
                spyOn(tabInst.root, 'offset').andReturn({top: 1410});

                expect(autoInst.outOfRange()).toBe(true);
            });

            it('returns false if the bottom is in view', function(){
                spyOn(tabInst.root, 'offset').andReturn({top: 190});

                expect(autoInst.outOfRange()).toBe(false);
            });

            it('returns false if the top is in view', function(){
                spyOn(tabInst.root, 'offset').andReturn({top: 1100});

                expect(autoInst.outOfRange()).toBe(false);
            });

            it('returns false if the top and bottom are in view', function(){
                spyOn(tabInst.root, 'offset').andReturn({top: 400});

                expect(autoInst.outOfRange()).toBe(false);
            });

        });
    });
});


