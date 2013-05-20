require(['jquery', 'xooie/base'], function($, Base) {

    describe('Xooie Base Module', function() {

        beforeEach(function(){
            this.el = $('<div/>');
            this.base = new Base(this.el);
        });

        describe('When instantiating a new instance of the module...', function(){
            it('jquery-ifies the element passed in', function(){
                this.base = new Base('<div/>');

                expect(this.base.get('root').is('div')).toBe(true);
            });

            it('reads the data attributes of the element and sets the data', function(){
                spyOn(Base.prototype, 'setData');

                this.base = new Base('<div data-prop="a" />');

                expect(Base.prototype.setData).toHaveBeenCalledWith({ prop: 'a' });
            });

            it('returns the instance of the module if it has already been instantiated', function(){
                var base2 = new Base(this.el);

                expect(base2).toEqual(this.base);
            });

            it('triggers a refresh event if the module has already been instantiated', function(){
                var testVal = false;

                this.el.on('xooie-refresh', function(){
                    testVal = true;
                });

                new Base(this.el);

                expect(testVal).toBe(true);
            });

            it('calls the cleanup method if the instance is not in the cache', function(){
                this.el = $('<div data-instance=10000 />');
                spyOn(Base.prototype, 'cleanup');

                this.base = new Base(this.el);

                expect(Base.prototype.cleanup).toHaveBeenCalled();
            });

            it('sets a data-instance value', function(){
                expect(this.el.data('instance')).toBe(this.base.get('id'));
            });
        });

        describe('When defining a new property...', function(){

        });

        describe('When extending the base module...', function(){

        });

        describe('When setting a property...', function(){

        });

        describe('When getting a property...', function(){

        });



        xit('calls the provided constructor', function() {
            new Widget($('<div />'));

            expect(constructor).toHaveBeenCalled();
        });

        xit('sets the "root" property on the created object', function() {
            var element = $('<div />'),
                w = new Widget(element);

            expect(w.root).toEqual(element);
        });

        xit('sets a data property on the element that denotes the id of the instance', function(){
            var element = $('<div />'),

                w = new Widget(element);

            expect(element.data('test-instance')).toBe(1);
        });

        xit('only creates one widget object for a given root element', function() {
            var element = $('<div/>'),
                w1 = new Widget(element),
                w2 = new Widget(element);

            expect(w1).toBe(w2);
        });

        xit('adds the "is-test-instantiated" class to the root element', function() {
            var element = $('<div/>'),
                w = new Widget(element);

            expect(element.hasClass('is-test-instantiated')).toBe(true);
        });

        xit('pulls options from the DOM element data- attributes', function() {
            var element = $('<div data-test="value"/>'),
                w = new Widget(element);

            expect(w.options.test).toEqual('value');
        });

        xit('includes the default options when pull in data- attributes', function() {
            Widget.setDefaultOptions({
                test1: 1,
                test2: 2
            });

            var element = $('<div data-test1="one"/>'),
                w = new Widget(element);

            expect(w.options.test1).toEqual('one');
            expect(w.options.test2).toEqual(2);
        });

        xdescribe('When initializing the widget with addons...', function(){
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

        xdescribe('Rendering templates', function() {
            var default_language;

            beforeEach(function() {
                default_language = Base.default_template_language;
                Base.default_template_language = 'null';

                Base.render['null'] = function(template, view) {
                    return $('<span>Null template</span>');
                };
            });

            afterEach(function() {
                Base.default_template_language = default_language;
                delete Base.render['null'];
            });

            it('calls the default render method if no template backend is specified', function() {
                var w = new Widget($('<div/>'));

                spyOn(Base.render, 'null');
                w.render($('<script>Test template</script>'), {});

                expect(Base.render['null']).toHaveBeenCalled();
            });

            describe('Template languages', function() {
                var original_render, original_micro_render;

                beforeEach(function() {
                    original_render = $.fn.render;
                    original_micro_render = $.fn.micro_render;

                    $.fn.render = function() {};
                    $.fn.micro_render = function() {};
                });

                afterEach(function() {
                    $.fn.render = original_render;
                    $.fn.micro_render = original_micro_render;
                });

                it('renders micro_template templates', function() {
                    var w = new Widget($('<div/>')),
                        template = $('<script data-template-language="micro_template">Test template</script>'),
                        view = { test: 'value' };

                    spyOn(template, 'micro_render');
                    w.render(template, view);

                    expect(template.micro_render).toHaveBeenCalledWith(view);
                });

                it('renders Mustache.js templates', function() {
                    var w = new Widget($('<div/>')),
                        template = $('<script data-template-language="mustache">Test template</script>'),
                        view = { test: 'value' };

                    spyOn(Mustache, 'render');
                    w.render(template, view);

                    expect(Mustache.render).toHaveBeenCalledWith(template.html(), view);
                });

                it('renders JsRender templates', function() {
                    var w = new Widget($('<div/>')),
                        template = $('<script data-template-language="jsrender">Test template</script>'),
                        view = { test: 'value' };

                    spyOn(template, 'render');
                    w.render(template, view);

                    expect(template.render).toHaveBeenCalledWith(view);
                });

                it('renders with Underscore.js', function() {
                    var w = new Widget($('<div/>')),
                        template = $('<script data-template-language="underscore">Test template</script>'),
                        view = { test: 'value' };

                    spyOn(_, 'template').andCallThrough();
                    spyOn(_, 'render').andCallThrough();

                    w.render(template, view);

                    expect(_.template).toHaveBeenCalledWith('Test template');
                    expect(_.render).toHaveBeenCalledWith(view);
                });
            });
        });

        xdescribe('Init event', function() {

            it('triggers an Init event on creation', function() {
                var element = $('<div/>'),
                    handler = jasmine.createSpy();

                element.bind('xooie-init.test', handler);

                new Widget(element);

                expect(handler).toHaveBeenCalled();
            });

            it('calls Init handlers immediately if the widget has already been initialized', function() {
                var element = $('<div/>'),
                    handler = jasmine.createSpy();

                new Widget(element);

                element.bind('xooie-init.test', handler);

                expect(handler).toHaveBeenCalled();
            });

        });

        xdescribe('setDefaultOptions', function() {

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
