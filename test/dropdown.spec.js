EnvJasmine.load(EnvJasmine.jsCimspireDirectory + "/cim.js");

require(['jquery', 'cimspire/ui/dropdown'], function($, Dropdown) {
    describe('Dropdown', function(){
        var el, d;

        describe('When initializing a dropdown...', function(){
            beforeEach(function(){
                el = $('<div><div data-role="dropdown-handle"></div><div data-role="dropdown-content"></div></div>');

                d = new Dropdown(el);
            });

            it('adds a mouseover event to the handle by default that expands the dropdown', function(){
                spyOn(d, 'expand');

                d.getHandle().trigger('mouseover');

                expect(d.expand).toHaveBeenCalledWith(0, d.options.triggers.on.mouseover.delay);
            });

            it('adds a click event to the handle by default that toggles the dropdown', function(){
                spyOn(d, 'setState').andCallThrough();

                var handle = d.getHandle();

                handle.trigger('click');

                expect(d.setState).toHaveBeenCalledWith(0, d.options.triggers.toggle.click.delay, true);

                d.setState.reset();

                waits(d.options.triggers.toggle.click.delay);

                runs(function(){
                    handle.trigger('click');

                    expect(d.setState).toHaveBeenCalledWith(0, d.options.triggers.toggle.click.delay, false);
                });
            });

            describe('...and data-triggers is set differently...', function(){
                beforeEach(function(){
                    el = $(['<div>',
                            '<div data-role="dropdown-handle"></div>',
                            '<div data-role="dropdown-content"></div>',
                        '</div>'].join(''));
                });

                it('does not set an event if no trigger is specified', function(){

                    el.attr('data-triggers', '{"on":{},"off":{},"toggle":{}}');

                    d = new Dropdown(el);

                    spyOn(d, 'expand');

                    d.getHandle().trigger('mouseover');

                    expect(d.expand).not.toHaveBeenCalled();
                });

                it('binds the event to an alternate selector if a selector is specified', function(){
                    setFixtures('<div class="alt-handle"></div>');

                    el.attr('data-triggers', '{"on":{"click": {"delay": 0, "selector": ".alt-handle"}},"off":{},"toggle":{}}');

                    d = new Dropdown(el);

                    spyOn(d, 'expand');

                    d.getHandle().trigger('click');

                    expect(d.expand).not.toHaveBeenCalled();

                    $('.alt-handle').trigger('click');

                    waits(0);

                    runs(function(){
                        expect(d.expand).toHaveBeenCalled();
                    });
                });

                it('binds the event to the document object if the string "document" is passed in as a selector', function(){

                    el.attr('data-triggers', '{"on":{"click": {"delay": 0, "selector": "document"}},"off":{},"toggle":{}}');

                    d = new Dropdown(el);

                    spyOn(d, 'expand');

                    $(document).trigger('click');

                    waits(0);

                    runs(function(){
                        expect(d.expand).toHaveBeenCalled();
                    });
                });
            });

            it('adds a data-dropdown-index attribute to each handle', function(){
                var handles = d.getHandle(),
                    i;

                for (i = 0; i < handles.length; i += 1){
                    expect($(handles[i]).attr('data-dropdown-index')).toBe(i.toString());
                }
            });

            it('adds a data-dropdown-index attribute to each expander', function(){
                var expanders = d.getExpander(),
                    i;

                for (i = 0; i < expanders.length; i += 1){
                    expect($(expanders[i]).attr('data-dropdown-index')).toBe(i.toString());
                }
            });

            it('adds a mouseenter event to the expanders that, if there is a collapse timer, stops the collapse event and adds a new off trigger on mouseout', function(){
                var handle = d.getExpander(0),
                    expander = d.getExpander(0);

                d.options.throttleDelay = 0;

                spyOn(d, 'collapse').andCallThrough();
                spyOn(window, 'clearTimeout').andCallThrough();

                d.expand(0,0);

                waits(0);

                runs(function(){
                    expect(expander.hasClass(d.options.activeDropdownClass)).toBe(true);

                    d.collapse(0,100);

                    expander.trigger('mouseenter');

                    waits(100);

                    runs(function(){
                        expect(expander.hasClass(d.options.activeDropdownClass)).toBe(true);

                        expander.trigger('mouseleave');

                        waits(0);

                        runs(function(){
                            expect(expander.hasClass(d.options.activeDropdownClass)).toBe(false);
                        });
                    });
                });
            });
        });

        describe('When activating the "on" trigger...', function(){
            beforeEach(function(){
                el = $('<div><div data-role="dropdown-handle"></div><div data-role="dropdown-content"></div></div>');

                d = new Dropdown(el);
            });

            it('adds a mouseleave event that collapses the expander by default when expanding the dropdown', function(){
                var handle = d.getHandle(0);

                spyOn(d, 'collapse');

                handle.trigger('mouseover');

                handle.trigger('mouseleave');

                expect(d.collapse).toHaveBeenCalledWith(0, d.options.triggers.off.mouseleave.delay)
            });
        }); 

        describe('When getting the handle elements...', function(){
            beforeEach(function(){
                el = $(['<div>',
                    '<div class="handle" data-role="dropdown-handle"></div>',
                    '<div class="handle" data-role="dropdown-handle"></div>',
                    '<div class="handle" data-role="dropdown-handle"></div>',
                    '<div data-role="dropdown-content"></div>',
                    '<div data-role="dropdown-content"></div>',
                    '<div data-role="dropdown-content"></div>',
                '</div>'].join(''));

                d = new Dropdown(el);
            });

            it('gets all the handles if no index is provided', function(){
                var handles = d.getHandle();

                expect(handles.hasClass('handle')).toBe(true);
                expect(handles.length).toBe(3);
            });

            it('gets the nth handle when passed an index', function(){
                var handle = d.getHandle(1);

                expect(handle).toBe(d.getHandle().eq(1));
            });

            it('gets an empty collection if the index is greater than the number of handles', function(){
                var handle = d.getHandle(3);

                expect(handle.length).toBe(0);
            });
        });

        describe('When getting the expander elements...', function(){
            beforeEach(function(){
                el = $(['<div>',
                    '<div data-role="dropdown-handle"></div>',
                    '<div data-role="dropdown-handle"></div>',
                    '<div data-role="dropdown-handle"></div>',
                    '<div class="expander" data-role="dropdown-content"></div>',
                    '<div class="expander" data-role="dropdown-content"></div>',
                    '<div class="expander" data-role="dropdown-content"></div>',
                '</div>'].join(''));

                d = new Dropdown(el);
            });

            it('gets all the expanders if no index is provided', function(){
                var expanders = d.getExpander();

                expect(expanders.hasClass('expander')).toBe(true);
                expect(expanders.length).toBe(3);
            });

            it('gets the nth expander when passed an index', function(){
                var expander = d.getExpander(1);

                expect(expander).toBe(d.getExpander().eq(1));
            });

            it('gets an empty collection if the index is greater than the number of expanders', function(){
                var expander = d.getExpander(3);

                expect(expander.length).toBe(0);
            });
        });

        describe('When calling the setState method...', function(){
            beforeEach(function(){
                el = $(['<div>',
                    '<div data-role="dropdown-handle"></div>',
                    '<div data-role="dropdown-content"></div>',
                '</div>'].join(''));

                d = new Dropdown(el);
            });

            it('clears the opposite state timer', function(){
                d.timers.collapse[0] = 42;
                spyOn(window, 'clearTimeout');

                d.setState(0,0,true);

                expect(window.clearTimeout).toHaveBeenCalledWith(42);
            });

            it('does not set the state if the state is already being set', function(){
                spyOn(window, 'setTimeout').andCallThrough();

                d.setState(0,100,true);

                expect(window.setTimeout).toHaveBeenCalled();

                d.expand(0,100,true);

                expect(window.setTimeout.callCount).toBe(1);
            });

            it('does not set the state if the throttle timer has not expired', function(){
                d.setState(0,0,true);

                waits(0);

                runs(function(){

                    spyOn(window, 'setTimeout').andCallThrough();

                    d.setState(0,0,true);

                    expect(window.setTimeout).not.toHaveBeenCalled();

                    waits(d.options.throttleDelay);

                    runs(function(){
                        d.setState(0,0,true);

                        expect(window.setTimeout).toHaveBeenCalled();
                    });
                });
            });

            it('does not set a throttle timer if the throttleDelay is 0', function(){
                d.options.throttleDelay = 0;

                d.setState(0,0,true);

                waits(0);

                runs(function(){
                    expect(d.timers.throttle[0]).toBe(undefined);
                });
            });
        });
    });
});

