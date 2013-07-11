require(['jquery', 'xooie/carousel', 'xooie/addons/carousel_lentils'], function($, Carousel, Lentils) {

    xdescribe('Carousel Lentil Addon', function(){
        var element, c, l, positionLeft, template;

        beforeEach(function(){
            positionLeft = 100;

            spyOn($.fn, 'position').andReturn({
                left: positionLeft
            });

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
                    '<div data-role="carousel-control" data-scroll="-1page"></div>',
                    '<ul data-role="carousel-lentils"></ul>',
                    '<script type="text/x-jquery-tmpl" data-role="carousel-lentils-template">',
                        '<li></li>',
                    '</script>',
                '</div>'
            ].join(''));

            c = new Carousel(element);

            c.addons = {};

            spyOn(c, 'render').andReturn('<li></li>');

            l = new Lentils(c);
        });

        describe('When instantiating the adddon...', function(){
            it('adds the class is-carousel-lentiled to the root', function(){
                expect(c.root.hasClass('is-carousel-lentiled')).toBe(true);
            });

            it('adds an event listener to call updateLentils when the carousel is updated', function(){
                spyOn(l, 'updateLentils');

                c.root.trigger('carouselUpdated');

                expect(l.updateLentils).toHaveBeenCalled();
            });

            it('adds an event to call currentLentil when the scroll is complete', function(){
                spyOn(l, 'currentLentil');

                c.root.trigger('carouselScrollComplete');

                expect(l.currentLentil).toHaveBeenCalled();
            });
        });

        describe('When selecting the current lentil', function(){
            it('gets the current page if the pagination addon is present', function(){
                l.options.lentilMode = "page";

                c.addons.pagination = {
                    currentPage: jasmine.createSpy()
                };

                l.currentLentil();

                expect(c.addons.pagination.currentPage).toHaveBeenCalled();
            });

            it('finds the lentil at the index indicated by the current item and adds the class "is-active-lentil', function(){
                var container = c.root.find(l.options.lentilSelector);

                container.append($('<li></li><li></li>'));

                spyOn(c, 'currentItem').andReturn(1);

                l.currentLentil();

                expect(container.find('li:eq(1)').hasClass('is-active-lentil')).toBe(true);
            });

            it('it removes the is-ative-lentil class from the current lentil and adds it to the new lentil', function(){
                var container = c.root.find(l.options.lentilSelector);

                container.append($('<li class="is-active-lentil""></li><li></li>'));

                spyOn(c, 'currentItem').andReturn(1);

                l.currentLentil();

                expect(container.find('li:eq(0)').hasClass('is-active-lentil')).toBe(false);
                expect(container.find('li:eq(1)').hasClass('is-active-lentil')).toBe(true);
            });

        });

        describe('When updating the lentils...', function(){
            var container, template;

            beforeEach(function(){
                container = c.root.find(l.options.lentilSelector);
                template = c.root.find(l.options.lentilTemplateSelector);

                l.options.lentilMode = "item";

                spyOn(l, 'currentLentil');

            });

            it('does not call the appropriate lentil builder if the container is not present', function(){
                container.remove();

                spyOn(l.lentilBuilders, 'item');

                l.updateLentils();

                expect(l.lentilBuilders.item).not.toHaveBeenCalled();
                expect(l.currentLentil).not.toHaveBeenCalled();
            });

            it('calls the appropriate lentil builder if it exists', function(){
                spyOn(l.lentilBuilders, 'item');

                l.updateLentils();

                expect(l.lentilBuilders.item).toHaveBeenCalled();
                expect(l.currentLentil).toHaveBeenCalled();

            });

            describe('...and the lentil mode is item...', function(){

                it('creates lentils equal to the number of carousel items', function(){
                    l.lentilBuilders.item(container, template);

                    expect(c.render).toHaveBeenCalledWith(template, {number: 6, scroll_mode: "item", lentil_is_last: true});
                });
            });

            describe('...and the lentil mode is page...', function(){

                beforeEach(function(){
                    l.options.lentilMode = 'page';
                });

                it('creates lentils equal to the number of pages', function(){
                    c.addons.pagination = {
                        _breaks: [0,5,10]
                    };

                    l.lentilBuilders.page(container, template);

                    expect(c.render).toHaveBeenCalledWith(template, {number: 3, scroll_mode: "page", lentil_is_last: true});
                });

                it('does not render lentils if the pagination addon is not present', function(){
                    c.render.reset();

                    expect(l.lentilBuilders.page(container, template)).toBeUndefined();
                    expect(c.render).not.toHaveBeenCalled();
                });
            });

        });

    });

});
