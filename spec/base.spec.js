require(['../lib/jquery', 'base'], function($, Base) {

    describe('Base', function() {

        var constructor, widget;

        beforeEach(function() {
            define('test', function(){
                return true;
            });

            constructor = jasmine.createSpy();
            Widget = Base('test', constructor);
        });

        it('calls the provided constructor', function() {
            new Widget($('<div />'));

            expect(constructor).toHaveBeenCalled();
        });

        it('sets the "root" property on the created object', function() {
            var element = $('<div />'),
                w = new Widget(element);

            expect(w.root).toEqual(element);
        });

        it('sets a data property on the element that denotes the id of the instance', function(){
            var element = $('<div />'),

                w = new Widget(element);

            expect(element.data('test-instance')).toBe(1);
        });

        it('only creates one widget object for a given root element', function() {
            var element = $('<div/>'),
                w1 = new Widget(element),
                w2 = new Widget(element);

            expect(w1).toBe(w2);
        });

        it('adds the "cim-test-widget" class to the root element', function() {
            var element = $('<div/>'),
                w = new Widget(element);

            expect(element).toHaveClass('is-test-instantiated');
        });

        it('pulls options from the DOM element data- attributes', function() {
            var element = $('<div data-test="value"/>'),
                w = new Widget(element);

            expect(w.options.test).toEqual('value');
        });

        it('includes the default options when pull in data- attributes', function() {
            Widget.setDefaultOptions({
                test1: 1,
                test2: 2
            });

            var element = $('<div data-test1="one"/>'),
                w = new Widget(element);

            expect(w.options.test1).toEqual('one');
            expect(w.options.test2).toEqual(2);
        });

        describe('When initializing the widget with addons...', function(){
            it('loads each addon defined in the data attribute',function(){
                spyOn(Widget.prototype, 'loadAddon');

                var element = $('<div data-addons="add1 add2"></div>'),
                    w = new Widget(element);

                expect(Widget.prototype.loadAddon).toHaveBeenCalledWith('add1');
                expect(Widget.prototype.loadAddon).toHaveBeenCalledWith('add2');
            });

            it('creates an addon object on the module if one does not exist', function(){
                w = new Widget($('<div/>'));
                define('cimspire/ui/addons/test_test', [], function() { return {}; });

                expect(w.addons).toBeUndefined();

                w.loadAddon('test');

                expect(w.addons).toEqual({});
            });
        });

        describe('Init event', function() {

            it('triggers an Init event on creation', function() {
                var element = $('<div/>'),
                    handler = jasmine.createSpy();

                element.bind('testInit', handler);

                new Widget(element);

                expect(handler).toHaveBeenCalled();
            });

            it('calls Init handlers immediately if the widget has already been initialized', function() {
                var element = $('<div/>'),
                    handler = jasmine.createSpy();

                new Widget(element);

                element.bind('testInit', handler);

                expect(handler).toHaveBeenCalled();
            });

        });

        describe('setDefaultOptions', function() {

            it('sets the default options', function() {
                Widget.setDefaultOptions({
                    test: 'value'
                });

                var w = new Widget($('<div />'));

                expect(w.options.test).toEqual('value');
            });

            it('extends onto existing default options', function() {
                Widget.setDefaultOptions({
                    test1: 1,
                    test2: 2
                });

                Widget.setDefaultOptions({
                    test2: 'two',
                    test3: 'three'
                });

                var w = new Widget($('<div />'));

                expect(w.options.test1).toEqual(1);
                expect(w.options.test2).toEqual('two');
                expect(w.options.test3).toEqual('three');
            });

            it('returns the current default options', function() {
                Widget.setDefaultOptions({
                    test: 'foo'
                });

                expect(Widget.getDefaultOptions().test).toEqual('foo');
            });

        });

    });

});
