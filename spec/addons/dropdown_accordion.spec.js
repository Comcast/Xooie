require(['jquery', 'xooie/dropdown', 'xooie/addons/dropdown_accordion'], function($, Dropdown, Accordion) {
    describe('Dropdown Accordion', function(){
        var el, d, a;

        beforeEach(function(){
            el = $('<div><div data-role="dropdown-handle"></div><div data-role="dropdown-content"></div><div data-role="dropdown-handle"></div><div data-role="dropdown-content"></div><div data-role="dropdown-handle"></div><div data-role="dropdown-content"></div></div>');
        
            d = new Dropdown(el);

            d.addons = {};

            a = new Accordion(d);
        });

        describe('When instantiating the addon...', function(){
            it('adds an event listener for the dropdownExpand event that collapses all other handles', function(){
                d.expand(1, 0);

                waits(0);

                runs(function(){
                    spyOn(d, 'collapse');

                    expect(d.getHandle(1).hasClass('is-dropdown-active')).toBe(true);

                    d.getHandle(2).trigger('dropdownExpand');
                    
                    expect(d.collapse).toHaveBeenCalledWith(1, 0);
                });
            });

            it('does not collapse the dropdown that triggers the expansion', function(){
                d.expand(1, 0);
                
                waits(0);

                runs(function(){
                    spyOn(d, 'collapse');

                    expect(d.getHandle(1).hasClass('is-dropdown-active')).toBe(true);

                    d.getHandle(1).trigger('dropdownExpand');
                    
                    expect(d.collapse).not.toHaveBeenCalled();
                });
            });
        });
    });
});
