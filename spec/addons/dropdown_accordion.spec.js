define(['jquery', 'dropdown', 'dropdown_accordion'], function($, Dropdown, Accordion) {
    describe('Dropdown Accordion', function(){
        var el, d;

        beforeEach(function(){
            el = $('<div data-addon="dropdown_accordion"><div data-role="dropdown-handle"></div><div data-role="dropdown-content"></div><div data-role="dropdown-handle"></div><div data-role="dropdown-content"></div><div data-role="dropdown-handle"></div><div data-role="dropdown-content"></div></div>');
        
            d = new Dropdown(el);
        });

        describe('When instantiating the addon...', function(){
            it('adds an event listener for the dropdownExpand event that collapses all other handles', function(){
                d.expand(1, 0);

                waits(0);

                runs(function(){
                    spyOn(d, 'collapse');

                    d.getHandle(1).trigger('dropdownExpand');
                    
                    expect(d.collapse).toHaveBeenCalledWith(1, 0);
                });
            });
        });
    });
});