require(['jquery', 'xooie/widgets/dropdown'], function($, Dropdown) {
    describe('Dropdown', function(){
        var el, d;

        describe('When initializing a dropdown...', function(){
            beforeEach(function(){
                el = $('<div><button data-role="dropdown-handle"></button><div data-role="dropdown-content"></div></div>');

                setFixtures(el);

                d = new Dropdown(el);

                waitsFor(function(){
                    return typeof el.attr('data-xooie-instance') !== 'undefined';
                });
            });

            it('adds a focus event to the handle by default that expands the dropdown', function(){
                spyOn(d, 'expand');

                d.getHandle().focus();

                expect(d.expand).toHaveBeenCalledWith(0, { delay: 0, index: undefined });
            });

            describe('...and data-triggers is set differently...', function(){
                beforeEach(function(){
                    el = $(['<div>',
                            '<div data-role="dropdown-handle"></div>',
                            '<div data-role="dropdown-content"></div>',
                        '</div>'].join(''));
                });

                it('does not set an event if no trigger is specified', function(){

                    el.attr('data-triggers', '{"on":{},"off":{}}');

                    d = new Dropdown(el);

                    spyOn(d, 'expand');

                    d.getHandle().focus();

                    expect(d.expand).not.toHaveBeenCalled();
                });

                it('binds the event to an alternate selector if a selector is specified', function(){
                    setFixtures('<div class="alt-handle"></div>');

                    el.attr('data-triggers', '{"on":{"click": {"delay": 0, "selector": ".alt-handle"}},"off":{}}');

                    d = new Dropdown(el);

                    spyOn(d, 'expand');

                    d.getHandle().trigger('click');

                    expect(d.expand).not.toHaveBeenCalled();

                    waits(0);

                    runs(function(){
                        $('.alt-handle').trigger('click');

                        expect(d.expand).toHaveBeenCalled();
                    });
                    
                });

                it('binds the event to the document object if the string "document" is passed in as a selector', function(){

                    el.attr('data-triggers', '{"on":{"click": {"delay": 0, "selector": "document"}},"off":{}}');

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

                d.throttleDelay(0);

                spyOn(d, 'collapse').andCallThrough();
                spyOn(window, 'clearTimeout').andCallThrough();

                d.expand(0,0);

                waits(0);

                runs(function(){
                    expect(expander.hasClass(d.activeDropdownClass())).toBe(true);

                    d.collapse(0,100);

                    expander.trigger('mouseenter');

                    waits(100);

                    runs(function(){
                        expect(expander.hasClass(d.activeDropdownClass())).toBe(true);

                        expander.trigger('mouseleave');

                        waits(0);

                        runs(function(){
                            expect(expander.hasClass(d.activeDropdownClass())).toBe(false);
                        });
                    });
                });
            });
        });

        describe('When the dropdownExpand event is triggered...', function(){
            beforeEach(function(){
                el = $('<div><div data-role="dropdown-handle"></div><div data-role="dropdown-content"></div></div>');

                d = new Dropdown(el);
            });

            it('adds an off event that collapses the expander by default when expanding the dropdown', function(){
                var handle = d.getHandle(0);

                spyOn(d, 'collapse');

                handle.trigger('dropdownExpand', 0);

                handle.trigger('blur');

                expect(d.collapse).toHaveBeenCalledWith(0, {delay: 0, index: 0} );
            });

            it('increments the eventCount for that triggering event', function(){
                var handle = d.getHandle(0);

                handle.trigger('dropdownExpand', 0);

                expect(handle.data('blur-off-count')).toBe(1);
            });
        });

        describe('When the dropdownCollapse event is triggered...', function(){
            beforeEach(function(){
                el = $('<div><div data-role="dropdown-handle"></div><div data-role="dropdown-content"></div></div>');

                d = new Dropdown(el);
            });

            it('unbinds any off events that would otherwise collapse the dropdown', function(){
                var handle = d.getHandle(0);

                handle.trigger('dropdownExpand', 0);

                expect(handle.data('blur-off-count')).toBe(1);

                handle.trigger('dropdownCollapse', 0);

                expect(handle.data('blur-off-count')).toBe(0);

                spyOn(d, 'collapse');

                handle.trigger('blur');

                expect(d.collapse).not.toHaveBeenCalled();
            });

            it('does not unbind the event if there are remaining events bound to it', function(){
                var handle = d.getHandle(0);

                handle.trigger('dropdownExpand', 0);

                handle.data('blur-off-count', 2);

                handle.trigger('dropdownCollapse', 0);

                spyOn(d, 'collapse');

                handle.trigger('blur');

                expect(d.collapse).toHaveBeenCalledWith(0, {delay: 0, index: 0});
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

                expect(handle.is(d.getHandle().eq(1))).toBe(true);
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

                setFixtures(el);

                d = new Dropdown(el);

                waitsFor(function(){
                    return typeof el.attr('data-xooie-instance') !== 'undefined';
                });
            });

            it('gets all the expanders if no index is provided', function(){
                var expanders = d.getExpander();

                expect(expanders.hasClass('expander')).toBe(true);
                expect(expanders.length).toBe(3);
            });

            it('gets the nth expander when passed an index', function(){
                var expander = d.getExpander(1);

                expect(expander.is(d.getExpander().eq(1))).toBe(true);
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

                    waits(d.throttleDelay());

                    runs(function(){
                        d.setState(0,0,true);

                        expect(window.setTimeout).toHaveBeenCalled();
                    });
                });
            });

            it('does not set a throttle timer if the throttleDelay is 0', function(){
                d.throttleDelay(0);

                d.setState(0,0,true);

                waits(0);

                runs(function(){
                    expect(d.timers.throttle[0]).toBe(undefined);
                });
            });
        });
    });
});
