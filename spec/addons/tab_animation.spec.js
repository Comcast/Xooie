require(['jquery', 'xooie/tab', 'xooie/addons/tab_animation', 'async'], function($, Tab, Animation, async) {
    xdescribe('Tab Animation Addon', function(){
        var tabInst, aniInst, el;

        beforeEach(function(){
            el = $([
                '<div>',
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

            aniInst = new Animation(tabInst);
        });

        describe('When changing tabs...', function(){
            var e, results;

            beforeEach(function(){
                e = $.Event('tabChange');

                results = {};

                spyOn(aniInst, 'animateToTab').andCallFake(function(to, from, direction, callback){
                    results.to = to;
                    results.from = from;
                    results.direction = direction;
                    setTimeout(callback, 100);
                });
            });

            it('sets the direction to 1 if the target tab is a higher index than the current tab', function(){
                e.toTab = 2;
                e.fromTab = 1;

                tabInst.root.trigger(e);

                expect(results.direction).toBe(1);
            });

            it('sets the direction to 1 if the target tab is a higher index than the current tab', function(){
                e.toTab = 1;
                e.fromTab = 2;

                tabInst.root.trigger(e);

                expect(results.direction).toBe(-1);
            });

            it('queues a subsequent animation call and calls it once the previous call is complete', function(){
                e.toTab = 2;
                e.fromTab = 1;

                tabInst.root.trigger(e);

                e.toTab = 3;
                e.fromTab = 2;

                tabInst.root.trigger(e);

                expect(results.to).toBe(2);
                expect(results.from).toBe(1);

                waits(100);

                runs(function(){
                    expect(results.to).toBe(3);
                    expect(results.from).toBe(2);
                });
            });

            describe('..but the wrap option is set to true...', function(){
                beforeEach(function(){
                    aniInst.options.wrap = true;
                });

                it('sets the direction to 1 if animating from the last tab to the first tab', function(){
                    e.toTab = 0;
                    e.fromTab = tabInst.getPanel().length - 1;

                    tabInst.root.trigger(e);

                    expect(results.direction).toBe(1);
                });

                it('sets the direction to -1 if animating from the last tab to the first tab', function(){
                    e.fromTab = 0;
                    e.toTab = tabInst.getPanel().length - 1;

                    tabInst.root.trigger(e);

                    expect(results.direction).toBe(-1);
                });

            });


        });

        describe('When animating to a tab...', function(){
            var testProperties;

            beforeEach(function(){
                testProperties = [];

                spyOn($.fn, 'animate').andCallFake(function(properties, options){
                    testProperties.push(properties);

                    setTimeout(options.complete, options.duration);
                });

                spyOn($.fn, 'css');
            });

            it('does not animate if the to index is the same as the current index', function(){
                spyOn(async, 'parallel');

                aniInst.animateToTab(1, 1, 1);

                expect(async.parallel).not.toHaveBeenCalled();
            });

            it('does not animate if the to index is less than 0', function(){
                spyOn(async, 'parallel');

                aniInst.animateToTab(-1, 1, 1);

                expect(async.parallel).not.toHaveBeenCalled();
            });

            it('does not animate if the index is greater than or equal to the number of panels', function(){
                spyOn(async, 'parallel');

                aniInst.animateToTab(3, 1, 1);

                expect(async.parallel).not.toHaveBeenCalled();
            });

            it('does not animate if the designated animation method is not present', function(){
                spyOn(async, 'parallel');

                aniInst.options.animationMode = 'fake';

                aniInst.animateToTab(1, 2, 1);

                expect(async.parallel).not.toHaveBeenCalled();
            });

            it('calls a callback method once all animations are complete', function(){
                var callback = jasmine.createSpy();

                aniInst.animateToTab(1, 2, 1, callback);

                expect(callback).not.toHaveBeenCalled();

                waits(aniInst.options.duration);

                runs(function(){
                    expect(callback).toHaveBeenCalled();
                });
            });

            describe('...and the animation mode is horizontal...', function(){
                var toEl, fromEl, containerEl;

                beforeEach(function(){
                    aniInst.options.animationMode = 'horizontal';

                    toEl = $('<div></div>');
                    fromEl = $('<div></div>');
                    containerEl = $('<div></div>');

                    spyOn($.fn, 'width').andReturn(100);
                    spyOn($.fn, 'height').andReturn(100);

                    spyOn($.fn, 'innerWidth').andReturn(120);
                    spyOn($.fn, 'outerHeight').andReturn(110);
                });

                it('sets the correct base properties', function(){
                    aniInst.animationMethods.horizontal(toEl, fromEl, containerEl, 1);

                    expect(toEl.css).toHaveBeenCalledWith({
                        display: 'block',
                        position: 'absolute',
                        top: 0,
                        left: 120,
                        width: 100,
                        height: 100
                    });

                    expect(fromEl.css).toHaveBeenCalledWith({
                        display: 'block',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: 100,
                        height: 100
                    });

                    expect(containerEl.css).toHaveBeenCalledWith({
                        overflow: 'hidden',
                        height: 110,
                        width: 100
                    });
                });

                it('sets the correct target properties', function(){
                    aniInst.animateToTab(1, 2, 1);

                    expect(testProperties).toEqual([{left: -120}, {left: 0}, {height: 110}]);
                });
            });

            describe('...and the animation mode is vertical...', function(){
                var toEl, fromEl, containerEl;

                beforeEach(function(){
                    aniInst.options.animationMode = 'vertical';

                    toEl = $('<div></div>');
                    fromEl = $('<div></div>');
                    containerEl = $('<div></div>');

                    spyOn($.fn, 'width').andReturn(100);
                    spyOn($.fn, 'height').andReturn(100);

                    spyOn($.fn, 'innerHeight').andReturn(120);
                    spyOn($.fn, 'outerHeight').andReturn(110);
                });

                it('sets the correct base properties', function(){
                    aniInst.animationMethods.vertical(toEl, fromEl, containerEl, 1);

                    expect(toEl.css).toHaveBeenCalledWith({
                        display: 'block',
                        position: 'absolute',
                        top: 120,
                        left: 0,
                        width: 100,
                        height: 100
                    });

                    expect(fromEl.css).toHaveBeenCalledWith({
                        display: 'block',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: 100,
                        height: 100
                    });

                    expect(containerEl.css).toHaveBeenCalledWith({
                        overflow: 'hidden',
                        height: 110,
                        width: 100
                    });
                });

                it('sets the correct target properties', function(){
                    aniInst.animateToTab(1, 2, 1);

                    expect(testProperties).toEqual([{top: -120}, {top: 0}, {height: 110}]);
                });
            });

            describe('...and the animation mode is fade...', function(){
                var toEl, fromEl, containerEl;

                beforeEach(function(){
                    aniInst.options.animationMode = 'fade';

                    toEl = $('<div></div>');
                    fromEl = $('<div></div>');
                    containerEl = $('<div></div>');

                    spyOn($.fn, 'width').andReturn(100);
                    spyOn($.fn, 'height').andReturn(100);

                    spyOn($.fn, 'innerHeight').andReturn(120);
                    spyOn($.fn, 'outerHeight').andReturn(110);
                });

                it('sets the correct base properties', function(){
                    aniInst.animationMethods.fade(toEl, fromEl, containerEl, 1);

                    expect(toEl.css).toHaveBeenCalledWith({
                        display: 'block',
                        position: 'absolute',
                        opacity: 0,
                        top: 0,
                        left: 0,
                        width: 100,
                        height: 100
                    });

                    expect(fromEl.css).toHaveBeenCalledWith({
                        display: 'block',
                        position: 'absolute',
                        opacity: 1.0,
                        top: 0,
                        left: 0,
                        width: 100,
                        height: 100
                    });

                    expect(containerEl.css).toHaveBeenCalledWith({
                        overflow: 'hidden',
                        height: 110,
                        width: 100
                    });
                });

                it('sets the correct target properties', function(){
                    aniInst.animateToTab(1, 2, 1);

                    expect(testProperties).toEqual([{opacity: 0}, {opacity: 1.0}, {height: 110}]);
                });
            });

        });

    });
});

