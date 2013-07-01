require(['jquery', 'xooie/carousel', 'xooie/addons/carousel_pagination'], function($, Carousel, Pagination) {
    xdescribe('Carousel Pagination Addon', function(){
        var element, carouselInstance, paginationInstance, positionLeft;

        beforeEach(function(){
            /*positionLeft = 100;

            spyOn($.fn, 'position').andReturn({
                left: positionLeft
            });*/

            element = $([
                '<div data-addons="carousel_pagination">',
                    '<div data-role="carousel-content">',
                        '<span></span>',
                        '<span style="height: 100px; margin: 10px"></span>',
                        '<span></span>',
                        '<span></span>',
                        '<span></span>',
                        '<span></span>',
                    '</div>',
                    '<div data-role="carousel-control" data-scroll="-1page"></div>',
                '</div>'
            ].join(''));

            carouselInstance = new Carousel(element);

            carouselInstance.addons = {};

            paginationInstance = new Pagination(carouselInstance);
        });

        describe('When instantiating a new pagination instance...', function(){
            it('binds a carouselUpdate event that updates the page breaks when triggered', function(){

                spyOn(paginationInstance, 'updateBreaks');

                expect(paginationInstance.updateBreaks).not.toHaveBeenCalled();

                carouselInstance.root.trigger('carouselUpdated');

                expect(paginationInstance.updateBreaks).toHaveBeenCalled();
            });

            it('updates the breaks', function(){
                expect(paginationInstance._breaks).not.toEqual([]);
            });

        });

        describe('When updating page breaks...', function(){

            it('sets the breaks for each item that exceeds the width of the wrapper', function(){
                carouselInstance.content.children().css('width', '50px');
                spyOn(carouselInstance.wrapper, 'innerWidth').andReturn(100);

                paginationInstance.updateBreaks();

                expect(paginationInstance._breaks).toEqual([0,2,4]);
            });

            it('adds the class "is-carousel-paginated" if there are more than one break', function(){
                carouselInstance.content.children().css('width', '50px');
                spyOn(carouselInstance.wrapper, 'innerWidth').andReturn(100);

                paginationInstance.updateBreaks();

                expect(carouselInstance.root.hasClass('is-carousel-paginated')).toBe(true);
            });

            it('does not add the class "is-carousel-paginated" if there is one break', function(){
                carouselInstance.content.children().css('width', '50px');
                spyOn(carouselInstance.wrapper, 'innerWidth').andReturn(600);

                paginationInstance.updateBreaks();

                expect(carouselInstance.root.hasClass('is-carousel-paginated')).toBe(false);
            });

            it('updates the display', function(){
                carouselInstance.content.children().css('width', '50px');
                spyOn(carouselInstance.wrapper, 'innerWidth').andReturn(100);

                spyOn(carouselInstance, 'updateDisplay');

                paginationInstance.updateBreaks();

                expect(carouselInstance.updateDisplay).toHaveBeenCalled();
            });


        });

        describe('When getting the current page...', function(){
            beforeEach(function(){
                spyOn($.fn, 'eq').andCallFake(function(index){
                    return {
                        outerWidth: function(){
                            return 100;
                        },
                        position: function(){
                            return {
                                left: index * 100 - carouselInstance.wrapper.scrollLeft()
                            };
                        }
                    };
                });

                spyOn(carouselInstance.content, 'outerWidth').andReturn(600);

                paginationInstance._breaks = [0,2,6];
            });

            it('sets the position to the second page if no direction is provided', function(){
                spyOn(carouselInstance.wrapper, 'scrollLeft').andReturn(0);
                spyOn(carouselInstance.content, 'position').andReturn({left: 0});

                expect(carouselInstance.positionUpdaters.page.apply(carouselInstance, [2])).toBe(200);
            });

            it('sets the position to the next page if the direction is 1 and the quantity is 1', function(){
                spyOn(carouselInstance.wrapper, 'scrollLeft').andReturn(200);
                spyOn(carouselInstance.content, 'position').andReturn({left: -200});

                expect(carouselInstance.positionUpdaters.page.apply(carouselInstance, [1, 1])).toBe(600);
            });

            it('sets the position to the next page if no quantity is provided and the direction is 1', function(){
                spyOn(carouselInstance.wrapper, 'scrollLeft').andReturn(200);
                spyOn(carouselInstance.content, 'position').andReturn({left: -200});

                expect(carouselInstance.positionUpdaters.page('', 1)).toBe(600);
            });

        });

        describe('When scrolling by page...', function(){
            beforeEach(function(){
                spyOn($.fn, 'eq').andCallFake(function(index){
                    return {
                        outerWidth: function(){
                            return 100;
                        },
                        position: function(){
                            return {
                                left: index * 100 - carouselInstance.wrapper.scrollLeft()
                            };
                        }
                    };
                });

                spyOn(carouselInstance.content, 'outerWidth').andReturn(600);

                paginationInstance._breaks = [0,2,4];

            });

            it('sets the position of hte carousel to the 3rd page', function(){
                spyOn(carouselInstance.wrapper, 'scrollLeft').andReturn(0);
                spyOn(carouselInstance.content, 'position').andReturn({left: 0});

                expect(carouselInstance.positionUpdaters.page(3)).toBe(400);
            });


            it('sets the position of the carousel to +1 page', function(){
                spyOn(carouselInstance.wrapper, 'scrollLeft').andReturn(0);
                spyOn(carouselInstance.content, 'position').andReturn({left: 0});

                expect(carouselInstance.positionUpdaters.page(1, 1)).toBe(200);
            });

            it('sets the position of hte carousel to +1 page if no quantity is provided', function(){
                spyOn(carouselInstance.wrapper, 'scrollLeft').andReturn(0);
                spyOn(carouselInstance.content, 'position').andReturn({left: 0});

                expect(carouselInstance.positionUpdaters.page(NaN, 1)).toBe(200);
            });
        });

        describe('When the snap mode is set to page...', function(){
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

                paginationInstance._breaks = [0,2,4];

                spyOn($.fn, 'animate');

            });

            it('does not snap if the current break has a position of 0', function(){

                spyOn(paginationInstance, 'currentPage').andReturn(0);

                spyOn(carouselInstance.wrapper, 'scrollLeft').andReturn(0);

                carouselInstance.snapMethods.page();

                expect($.fn.animate).not.toHaveBeenCalled();
            });

            it('snaps to the same page if the position is less than 1 page length off', function(){

                spyOn(paginationInstance, 'currentPage').andReturn(1);

                spyOn(carouselInstance.wrapper, 'scrollLeft').andReturn(299);

                carouselInstance.snapMethods.page();

                expect($.fn.animate).toHaveBeenCalledWith({scrollLeft: 200});
            });

            it('snaps to the previous item if the position is greater than 1 page length off', function(){

                spyOn(paginationInstance, 'currentPage').andReturn(1);

                spyOn(carouselInstance.wrapper, 'scrollLeft').andReturn(99);

                carouselInstance.snapMethods.page();

                expect($.fn.animate).toHaveBeenCalledWith({scrollLeft: 0});
            });

        });

        describe('When displaying the state of the carousel and the display mode is set to "page"...', function(){
                beforeEach(function(){
                    carouselInstance.options.dipslayMode = 'page';
                });

                it('renders an element with the current page and the total pages', function(){
                    spyOn(paginationInstance, 'currentPage').andReturn(2);

                    paginationInstance._breaks = [0, 2, 4, 6];

                    var container = $('<div></div>'),
                        template = carouselInstance.root.find(carouselInstance.options.displayTemplateSelector);

                    spyOn(carouselInstance, 'render');

                    carouselInstance.displayMethods.page(container, template);

                    expect(carouselInstance.render).toHaveBeenCalledWith(template, {current_page: 3, total_pages: 4});
                });
            });
    });
});
