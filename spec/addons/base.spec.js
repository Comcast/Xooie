require(['../lib/jquery', 'base', 'addons_base'], function($, Base, AddonBase) {

    var constructor, baseConstructor, Widget, Addon, w, a;

    describe('Addon Base', function(){
        beforeEach(function(){
            define('testWidget', function(){
                return true;
            });

            define('test', function(){
                return true;
            });

            baseConstructor = function(){
                return true;
            };

            constructor = jasmine.createSpy();

            Widget = Base('testWidget', baseConstructor);

            w = new Widget($('<div/>'));

            w.addons = {};

            Addon = AddonBase('test', constructor);
        });

        describe('When a new Addon is created...', function(){
            it('returns an empty object if no module is passed to the constructor', function(){
                expect(new Addon()).toEqual({});
            });

            it('invokes the constructor when an instance of the Addon is created', function(){
                new Addon(w);

                expect(constructor).toHaveBeenCalled();
            });

            it('returns the same instance of an addon if it has already been instantiated on a module', function(){
                var a1 = new Addon(w),
                    a2 = new Addon(w);

                expect(a1).toEqual(a2);
            });

            it('sets the module as a property of the addon instance', function(){
                var a = new Addon(w);

                expect(a.module).toEqual(w);
            });

            it('extends the addon options with options from the base module', function(){
                Addon.setDefaultOptions({
                    test: 'A'
                });

                w.options.test = 'B';

                var a = new Addon(w);

                expect(a.options.test).toBe('B');
            });

            it('adds a class name of "has-test-addon" to the root of the base module', function(){
                new Addon(w);

                expect(w.root.hasClass('has-test-addon')).toBe(true);
            });

            it('triggers an event indicating that the addon has been instantiated', function(){
                var testVal = false;
                w.root.on('testAddonInit', function(){
                    testVal = true;
                });

                new Addon(w);

                expect(testVal).toBe(true);
            });
        });

    });

});
