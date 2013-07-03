require(['jquery', 'xooie/carousel'], function($, Carousel) {

    describe('Carousel', function(){
        var element, carouselInstance, positionLeft;

        beforeEach(function(){
            element = $([
                '<div>',
                    '<div data-role="carousel-content">',
                        '<span></span>',
                        '<span style="height: 100px; margin: 10px"></span>',
                        '<span></span>',
                        '<span></span>',
                        '<span></span>',
                        '<span></span>',
                    '</div>',
                    '<div data-role="carousel-control" data-scroll="-1px"></div>',
                    '<div data-role="carousel-display"></div>',
                    '<script type="text/x-jquery-tmpl" data-role="carousel-display-template">',
                        '<span><#= current_item #>-<# last_visible_item #> of <# total_items #></span>',
                    '</script>',
                '</div>'
            ].join(''));

            carouselInstance = new Carousel(element);
        });

        describe('When instantiating a new Carousel class...', function(){
            it('wraps the carousel-content in an element with class "xooie-carousel-wrapper"', function() {
                var p = element.find('[data-role="carousel-content"]').parent();

                expect(p.hasClass('xooie-carousel-wrapper')).toBe(true);
            });

            it('creates a css rule .xooie-carousel-wrapper', function(){
                var rule = carouselInstance.stylesheet.getRule('.xooie-carousel-wrapper');

                expect(rule).not.toBe(false);
                expect(rule.style.overflowX).toBe('scroll');
                expect(rule.style.overflowY).toBe('hidden');
            });

            it('creates a css rule .xooie-carousel-crop to hide the scrollbar', function(){
                var rule = carouselInstance.stylesheet.getRule('.xooie-carousel-crop');

                expect(rule).not.toBe(false);
                expect(rule.style.overflowY).toBe('hidden');
            });

            it('adds the xooie-carousel-crop class to the parent of the wrapper', function(){
                expect(carouselInstance.wrapper.parent().hasClass('xooie-carousel-crop')).toBe(true);
            });

            it('creates a css rule that matches the container selector to add the appropriate styles to the scrolling container', function(){
                var rule = carouselInstance.stylesheet.getRule('.xooie-carousel-content');

                expect(rule).not.toBe(false);
                expect(rule.style.display).toBe('table-cell');
                expect(rule.style.whiteSpace).toBe('nowrap');
                expect(rule.style.fontSize).toBe('0px');
            });

            it('creates a css rule .xooie-carousel-item that adds the appropriate styles to each item', function(){
                var rule = carouselInstance.stylesheet.getRule('.xooie-carousel-item');

                expect(rule).not.toBe(false);
                expect(rule.style.display).toBe('inline-block');
                expect(rule.style.zoom).toBe('1');
                expect(rule.style.fontSize).toBe('1em');
            });

            it('binds a click event to the control buttons which will update the position of the carousel', function(){
                spyOn(carouselInstance, 'updatePosition');

                carouselInstance.root.find(carouselInstance.options.controlSelector).trigger('click');

                expect(carouselInstance.updatePosition).toHaveBeenCalledWith('-1px');
            });

            it('binds a scroll event to the wrapper that will trigger a carouselScrollComplete event after 250ms of idleness', function(){
                var testSpy = jasmine.createSpy();

                carouselInstance.root.on('carouselScrollComplete', function(){
                    testSpy();
                });

                carouselInstance.wrapper.trigger('scroll');

                expect(testSpy).not.toHaveBeenCalled();

                waits(100);

                runs(function(){
                    carouselInstance.wrapper.trigger('scroll');
                });

                waits(150);

                runs(function(){
                    expect(testSpy).not.toHaveBeenCalled();
                });

                waits(250);

                runs(function(){
                    expect(testSpy).toHaveBeenCalled();
                });
            });

            it('updates the limits of the carousel by default when the carouselScrollComplete event is triggered', function(){
                spyOn(carouselInstance, 'updateLimits');

                carouselInstance.root.trigger('carouselScrollComplete');

                expect(carouselInstance.updateLimits).toHaveBeenCalled();
            });

        });

        describe('When getting the current item...', function(){
            beforeEach(function(){
                spyOn($.fn, 'eq').andCallFake(function(index){
                    return {
                        outerWidth: function(){
                            return 100;
                        }
                    };
                });

                spyOn(carouselInstance.content, 'outerWidth').andReturn(600);

            });

            it('gets the first item from the left that is visible if the bias is 1', function(){
                //spyOn(carouselInstance.wrapper, 'scrollLeft').andReturn(100);
                spyOn(carouselInstance.content, 'position').andReturn({left: -100});

                expect(carouselInstance.currentItem(1)).toBe(1);
            });

            it('gets the first item from the right that is visible if the bias is -1', function(){
                spyOn(carouselInstance.content, 'position').andReturn({left: -400});

                expect(carouselInstance.currentItem(-1)).toBe(4);
            });

        });

        describe('When updating the dimensions of the carousel...', function(){
            var items;

            beforeEach(function(){
                items = carouselInstance.content.children();
            });

            it('sets the height of the xooie-carousel-crop class to the height of the tallest item', function(){
                spyOn($.fn, 'outerHeight').andReturn(130);

                carouselInstance.updateDimensions();

                var rule = carouselInstance.stylesheet.getRule('.carousel-' + carouselInstance.root.data('carousel-instance') + ' .xooie-carousel-crop');

                expect(rule.style.height).toEqual('130px');
            });

            it('updates the limits of the carousel', function(){
                spyOn(carouselInstance, 'updateLimits');

                carouselInstance.updateDimensions();

                expect(carouselInstance.updateLimits).toHaveBeenCalled();
            });

        });

        describe('When getting the rightmost position of the carousel...', function(){
            it('gets the right position of the last element in the carousel', function(){
                var lastItem = $('<div></div>');
                spyOn(carouselInstance.content, 'children').andReturn(lastItem);
                spyOn(lastItem, 'position').andReturn({
                    left: 400
                });
                spyOn(lastItem, 'outerWidth').andReturn(100);

                expect(carouselInstance.getRightLimit()).toBe(500);

            });

            it('returns undefined if the position of the last item is not valid', function(){
                var lastItem = $('<div></div>');
                spyOn(carouselInstance.content, 'children').andReturn(lastItem);
                spyOn(lastItem, 'position').andReturn(undefined);

                expect(carouselInstance.getRightLimit()).toBeUndefined();
            });
        });

        describe('When determining if the carousel is at a left or right limit...', function(){
            beforeEach(function(){
                carouselInstance.root.removeClass('is-carousel-leftmost is-carousel-rightmost');
            });

            it('adds the is-carousel-leftmost class if the scroll position of the carousel is 0', function(){
                spyOn(carouselInstance.wrapper, 'scrollLeft').andReturn(0);

                carouselInstance.updateLimits();

                expect(carouselInstance.root.hasClass('is-carousel-leftmost')).toBe(true);
            });

            it('adds the is-carousel-rightmost class if the rightmost item is visible', function(){
                spyOn(carouselInstance, 'getRightLimit').andReturn(100);
                spyOn(carouselInstance.wrapper, 'innerWidth').andReturn(100);

                carouselInstance.updateLimits();

                expect(carouselInstance.root.hasClass('is-carousel-rightmost')).toBe(true);
            });

            it('adds neither class if neither of the above consitions are met', function(){
                carouselInstance.root.addClass('is-carousel-leftmost is-carousel-rightmost');

                spyOn(carouselInstance.wrapper, 'scrollLeft').andReturn(100);
                spyOn(carouselInstance.wrapper, 'innerWidth').andReturn(100);
                spyOn(carouselInstance, 'getRightLimit').andReturn(200);

                carouselInstance.updateLimits();

                expect(carouselInstance.root.hasClass('is-carousel-leftmost')).toBe(false);
                expect(carouselInstance.root.hasClass('is-carousel-rightmost')).toBe(false);

            });
        });

        describe('When setting the position of the carousel...', function(){
            var testOffset, testDuration;

            beforeEach(function(){
                spyOn($.fn, 'animate').andCallFake(function(data, duration, callback) {
                    testOffset = data.scrollLeft;
                    testDuration = duration;

                    callback();
                });
            });

            afterEach(function(){
                testOffset = null;
                testDuration = null;
            });

            it('sets the duration to 200', function(){
                carouselInstance.updatePosition(0);

                expect(testDuration).toBe(200);
            });

            it('triggers a carouselMove event', function() {
                var handler = jasmine.createSpy();

                element.on('carouselMove', handler);

                carouselInstance.updatePosition(0);

                expect(handler).toHaveBeenCalled();
            });

            it('provides the new position to the carouselMove event', function() {
                carouselInstance.updatePosition(100);

                expect(testOffset).toEqual(100);
            });

            it('treats a position starting with + or - as a relative position', function() {
                spyOn(carouselInstance.wrapper, 'scrollLeft').andReturn(110);

                carouselInstance.updatePosition("-100");

                expect(testOffset).toEqual(10);
            });

            it('calls the appropriate updater based on the unit passed in', function(){
                spyOn(carouselInstance.positionUpdaters, 'item');

                carouselInstance.updatePosition('-1item');

                expect(carouselInstance.positionUpdaters.item).toHaveBeenCalled();
            });

            it('does not move the carousel if the positionUpdater is unavailable', function(){

                carouselInstance.updatePosition("-1page");

                expect(testOffset).toEqual(0);

            });

            describe('...and we are updating by item...', function(){
                beforeEach(function(){
                    spyOn($.fn, 'eq').andCallFake(function(index){
                        return {
                            outerWidth: function(){
                                return 100;
                            },
                            position: function(){
                                return {
                                    left: (index * 100) - carouselInstance.wrapper.scrollLeft()
                                };
                            }
                        };
                    });

                    spyOn(carouselInstance.content, 'outerWidth').andReturn(600);

                });

                it('sets the position of the carousel to the 5th item if no direction is provided, assuming we start at 0 and each item is 100px wide', function(){
                    spyOn(carouselInstance.wrapper, 'scrollLeft').andReturn(0);
                    spyOn(carouselInstance.content, 'position').andReturn({left: 0});

                    expect(carouselInstance.positionUpdaters.item.apply(carouselInstance, [5])).toBe(400);
                });

                it('sets the postion of the carousel to +3 items from the 2nd item', function(){
                    spyOn(carouselInstance.wrapper, 'scrollLeft').andReturn(100);
                    spyOn(carouselInstance.content, 'position').andReturn({left: -100});

                    expect(carouselInstance.positionUpdaters.item.apply(carouselInstance, [3, 1])).toBe(400);
                });

                it('sets the postion of the carousel to +1 items from the 2nd item if no quantity specified', function(){
                    spyOn(carouselInstance.wrapper, 'scrollLeft').andReturn(100);
                    spyOn(carouselInstance.content, 'position').andReturn({left: -100});

                    expect(carouselInstance.positionUpdaters.item.apply(carouselInstance, ['', 1])).toBe(200);
                });

            });

             describe('..but the position is a decimal value..', function(){
                beforeEach(function(){
                    spyOn($.fn, 'eq').andCallFake(function(index){
                        return {
                            outerWidth: function(){
                                return 100;
                            },
                            position: function(){
                                return {
                                    left: (index * 100 + 0.5) - carouselInstance.wrapper.scrollLeft()
                                };
                            }
                        };
                    });

                    spyOn(carouselInstance.content, 'outerWidth').andReturn(600);

                });

                it('rounds the position', function(){
                    spyOn(carouselInstance.wrapper, 'scrollLeft').andReturn(100);
                    spyOn(carouselInstance.content, 'position').andReturn({left: -100});

                    expect(carouselInstance.positionUpdaters.item(1, 1)).toBe(201);
                });

            });

        });

        describe('When snapping the postiion to the nearest item...', function(){

            beforeEach(function(){
                spyOn($.fn, 'eq').andCallFake(function(index){
                    return {
                        position: function(){
                            return {
                                left: (index * 100) - carouselInstance.wrapper.scrollLeft()
                            };
                        }
                    };
                });

                spyOn($.fn, 'animate');

            });

            it('does not snap if the current item has a position of 0', function(){

                spyOn(carouselInstance, 'currentItem').andReturn(1);

                spyOn(carouselInstance.wrapper, 'scrollLeft').andReturn(100);

                carouselInstance.snapMethods.item();

                expect($.fn.animate).not.toHaveBeenCalled();
            });

             it('snaps to the same item if the position is less than 1 item length off', function(){

                spyOn(carouselInstance, 'currentItem').andReturn(1);

                spyOn(carouselInstance.wrapper, 'scrollLeft').andReturn(59);

                carouselInstance.snapMethods.item();

                expect($.fn.animate).toHaveBeenCalledWith({scrollLeft: 100});
            });

            it('snaps to the previous item if the position is greater than 1 item length off', function(){

                spyOn(carouselInstance, 'currentItem').andReturn(1);

                spyOn(carouselInstance.wrapper, 'scrollLeft').andReturn(49);

                carouselInstance.snapMethods.item();

                expect($.fn.animate).toHaveBeenCalledWith({scrollLeft: 0});
            });

        });

        describe('When snapping, it rounds numbers...', function(){
            var testPosition;

            beforeEach(function(){
                spyOn($.fn, 'animate');
            });

            it('does not snap if the rounded position value of the first item is 0', function(){
                spyOn($.fn, 'eq').andCallFake(function(index){
                    return {
                        position: function(){
                            return {
                                left: (index * 100) - carouselInstance.wrapper.scrollLeft() + 0.5
                            };
                        }
                    };
                });

                spyOn(carouselInstance, 'currentItem').andReturn(1);

                spyOn(carouselInstance.wrapper, 'scrollLeft').andReturn(100);

                carouselInstance.snapMethods.item();

                expect($.fn.animate).not.toHaveBeenCalled();
            });

            it('does not snap if the rounded position value of the first item is 0', function(){
                spyOn($.fn, 'eq').andCallFake(function(index){
                    return {
                        position: function(){
                            return {
                                left: (index * 100) - carouselInstance.wrapper.scrollLeft() - 0.5
                            };
                        }
                    };
                });

                spyOn(carouselInstance, 'currentItem').andReturn(1);

                spyOn(carouselInstance.wrapper, 'scrollLeft').andReturn(100);

                carouselInstance.snapMethods.item();

                expect($.fn.animate).not.toHaveBeenCalled();
            });

            it('does snap if the rounded position value of the first item is 0', function(){
                spyOn($.fn, 'eq').andCallFake(function(index){
                    return {
                        position: function(){
                            return {
                                left: (index * 100) - carouselInstance.wrapper.scrollLeft() + 0.4
                            };
                        }
                    };
                });

                spyOn(carouselInstance, 'currentItem').andReturn(1);

                spyOn(carouselInstance.wrapper, 'scrollLeft').andReturn(110);

                carouselInstance.snapMethods.item();

                expect($.fn.animate).toHaveBeenCalledWith({scrollLeft: 100});
            });

        });

        describe('When scrolling multiple times in a row...', function(){
            beforeEach(function(){
                spyOn($.fn, 'animate').andCallFake(function(data, duration, complete){
                    setTimeout(complete, duration);
                });
            });

            it('sets the carousel isScrolling property to true', function(){
                expect(carouselInstance.isScrolling).toBe(false);

                carouselInstance.root.find(carouselInstance.options.controlSelector).trigger('click');

                expect(carouselInstance.isScrolling).toBe(true);
            });

            it('stops the animation and calls a new animation', function(){
                spyOn($.fn, 'stop').andCallThrough();

                carouselInstance.root.find(carouselInstance.options.controlSelector).trigger('click');

                carouselInstance.root.find(carouselInstance.options.controlSelector).trigger('click');

                expect($.fn.animate.callCount).toBe(2);

                expect($.fn.stop).toHaveBeenCalled();
            });

            it('sets the isScroling property to false when complete', function(){
                carouselInstance.root.find(carouselInstance.options.controlSelector).trigger('click');

                expect(carouselInstance.isScrolling).toBe(true);

                waitsFor(function(){
                    return !carouselInstance.isScrolling;
                });

                runs(function(){
                    expect(true);
                });
            });
        });

        describe('When displaying the state of the carousel...', function(){

            it('calls updateDisplay when a scroll is complete', function(){
                carouselInstance.options.displayMode = "item";

                spyOn(carouselInstance.displayMethods, 'item');

                carouselInstance.root.trigger('carouselScrollComplete');

                expect(carouselInstance.displayMethods.item).toHaveBeenCalled();
            });

            it('does not update the display if the display method is none', function(){
                carouselInstance.options.displayMethod = 'none';

                spyOn(carouselInstance.displayMethods, 'item');

                carouselInstance.updateDisplay();

                expect(carouselInstance.displayMethods.item).not.toHaveBeenCalled();
            });

            describe('...and the display mode is set to "item"...', function(){
                beforeEach(function(){
                    carouselInstance.options.dipslayMode = 'item';
                });

                it('renders an element with the current item, the last visible item and the total items', function(){
                    spyOn($.fn, 'eq').andCallFake(function(index){
                        return {
                            position: function(){
                                return {
                                    left: (index * 100) - carouselInstance.wrapper.scrollLeft()
                                };
                            },
                            outerWidth: function(){
                                return 100;
                            }
                        };
                    });

                    spyOn(carouselInstance.wrapper, 'scrollLeft').andReturn(100);
                    spyOn(carouselInstance.content, 'position').andReturn({left: -100});
                    spyOn(carouselInstance.content, 'outerWidth').andReturn(600);
                    spyOn(carouselInstance.wrapper, 'innerWidth').andReturn(350);

                    var container = $('<div></div>'),
                        template = carouselInstance.root.find(carouselInstance.options.displayTemplateSelector);

                    spyOn(carouselInstance, 'render');

                    carouselInstance.displayMethods.item(container, template);

                    expect(carouselInstance.render).toHaveBeenCalledWith(template, {current_item: 2, last_visible_item: 4, total_items: 6});
                });
            });
        });
    });
});
