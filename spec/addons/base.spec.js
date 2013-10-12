require(['jquery', 'xooie/widgets/base', 'xooie/addons/base', 'xooie/shared'], function($, Widget, Addon, Shared) {

    describe('Addon Base', function(){
        beforeEach(function(){
            this.el = $('<div />');

            this.widget = new Widget(this.el);
        });

        describe('When instantiating the addon...', function(){

            it('returns an existing instance of the addon', function(){
                var addon_first = new Addon(this.widget);

                this.addon = new Addon(this.widget);

                expect(this.addon).toBe(addon_first);
            });

            it('sets the addon to the widget.addons object', function(){
                this.addon = new Addon(this.widget);

                expect(this.widget.addons()['addon']).toBe(this.addon);
            });

            it('adds the addonClass to the root of the widget', function(){
                this.addon = new Addon(this.widget);

                expect(this.widget.root().hasClass(this.addon.addonClass())).toBe(true);
            });

            it('reads the data attributes of the element and sets the data', function() {
                this.el.data('name', 'example');
                this.addon = new Addon(this.widget);

                expect(this.addon.name()).toEqual('example');
            });

            it('sets the widget to the widget property', function(){
                this.addon = new Addon(this.widget);

                expect(this.addon.widget()).toBe(this.widget);
            });

            it('triggers the init event if there are no inherited constructors to be called', function(){
                var testVal = false;

                this.el.on('xooie-addon-init', function(){
                    testVal = true;
                });

                this.addon = new Addon(this.widget);

                expect(testVal).toBe(true);
            });
        });

        describe('When defining a new property...', function(){
            it('makes a property both writable and readable', function(){
                spyOn(Addon, 'defineWriteOnly');
                spyOn(Addon, 'defineReadOnly');

                Addon.define('foo_one');

                expect(Addon.defineWriteOnly).toHaveBeenCalledWith('foo_one');
                expect(Addon.defineReadOnly).toHaveBeenCalledWith('foo_one', undefined);
            });

            it('calls the Shared.defineReadOnly method', function(){
                spyOn(Shared, 'defineReadOnly');

                Addon.defineReadOnly('foo', 'bar');

                expect(Shared.defineReadOnly).toHaveBeenCalledWith(Addon, 'foo', 'bar');
            });

            it('calls the Shared.defineWriteOnly method', function(){
                spyOn(Shared, 'defineWriteOnly');

                Addon.defineWriteOnly('foo');

                expect(Shared.defineWriteOnly).toHaveBeenCalledWith(Addon, 'foo');
            });
        });

        describe('When getting and setting properties...', function(){
            beforeEach(function(){
                this.addon = new Addon(this.widget);
            });

            it('calls the Shared get method', function(){
                spyOn(Shared, 'get');

                this.addon.get('foo');

                expect(Shared.get).toHaveBeenCalledWith(this.addon, 'foo');
            });

            it('calls the Shared set method', function(){
                spyOn(Shared, 'set');

                this.addon.set('foo', 'bar');

                expect(Shared.set).toHaveBeenCalledWith(this.addon, 'foo', 'bar');
            });
        });

        describe('When extending the Addon...', function(){
            it('calls the Shared create method', function(){
                spyOn(Shared, 'create');

                var constructor = function(){},
                    post_constructor = function(){};

                Addon.extend(constructor, post_constructor);

                expect(Shared.create).toHaveBeenCalledWith(constructor, post_constructor, Addon);
            });
        });

        describe('Properties and attributes', function(){
            it('defines a widget property', function(){
                expect(Addon.prototype.widget).not.toBeUndefined();
            });

            it('defines a name property', function(){
                expect(Addon.prototype.name).not.toBeUndefined();
            });

            it('sets the default value of name to "addon"', function(){
                this.addon = new Addon(this.widget);

                expect(this.addon.name()).toBe('addon');
            });

            it('defines an initEvent property', function(){
                expect(Addon.prototype.initEvent).not.toBeUndefined();
            });

            it('processes the initEvent property so that if the default name is present, it returns "xooie-addon-init"', function(){
                this.addon = new Addon(this.widget);

                expect(this.addon.initEvent()).toBe('xooie-addon-init');
            });

            it('processes the initEvent property so that it adds the name to the event', function(){
                this.addon = new Addon(this.widget);

                this.addon.name('foo');

                expect(this.addon.initEvent()).toBe('xooie-addon-init.foo');
            });

            it('defines an addonClass property', function(){
                expect(Addon.prototype.addonClass).not.toBeUndefined();
            });

            it('processes the initEvent so that it if the default name is present it returns "has-addon"', function(){
                this.addon = new Addon(this.widget);
                expect(this.addon.addonClass()).toBe('has-addon');
            });

            it('processes the addonClass so that it adds the name to the class', function(){
                this.addon = new Addon(this.widget);

                this.addon.name('foo');

                expect(this.addon.addonClass()).toBe('has-foo-addon');
            });
        });

        it('removes the addonClass from the widget root element when cleanup is called', function(){
            this.addon = new Addon(this.widget);

            this.addon.cleanup();

            expect(this.widget.root().hasClass(this.addon.addonClass())).toBe(false);
        });

    });

});
