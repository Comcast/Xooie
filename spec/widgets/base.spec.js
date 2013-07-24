require(['jquery', 'xooie/widgets/base', 'xooie/shared'], function($, Widget, Shared) {

    describe('Xooie Base Widget Module', function() {

        beforeEach(function(){
            this.el = $('<div/>');
            this.widget = new Widget(this.el);
        });

        describe('When instantiating a new instance of the module...', function(){
            it('jquery-ifies the element passed in', function(){
                var element = $('<div id="test" />');

                this.widget = new Widget(element);

                expect(this.widget.get('root').is(element)).toBe(true);
            });

            it('reads the data attributes of the element and sets the data', function(){
                spyOn(Widget.prototype, '_setData');

                this.widget = new Widget('<div data-prop="a" />');

                expect(Widget.prototype._setData).toHaveBeenCalledWith({ prop: 'a' });
            });

            it('sets any defined properties', function(){
                Widget.define('foo', 'bar');

                this.widget = new Widget('<div />');

                expect(this.widget.get('foo')).toBe('bar');
                expect(this.widget.foo()).toBe('bar');
            });

            it('returns the instance of the module if it has already been instantiated', function(){
                var widget2 = new Widget(this.el);

                expect(widget2).toEqual(this.widget);
            });

            it('triggers a refresh event if the module has already been instantiated', function(){
                var testVal = false;

                this.el.on('xooie-refresh', function(){
                    testVal = true;
                });

                new Widget(this.el);

                expect(testVal).toBe(true);
            });

            it('calls the cleanup method if the instance is not in the cache', function(){
                this.el = $('<div data-xooie-instance=10000 />');
                spyOn(Widget.prototype, 'cleanup');

                this.widget = new Widget(this.el);

                expect(Widget.prototype.cleanup).toHaveBeenCalled();
            });

            it('sets a data-xooie-instance value', function(){
                expect(this.el.data('xooie-instance')).toBe(this.widget.get('id'));
            });

            it('triggers the init event if there are no inherited constructors to be called', function(){
                var testVal = false,
                    element = $('<div />');

                element.on('xooie-init', function(){
                    testVal = true;
                });

                this.widget = new Widget(element);

                expect(testVal).toBe(true);
            });

            it('loads addons immediately if there are no inherited constructors to be called', function(){
                var testVal = false,
                    element = $('<div />'),
                    addon = function() {
                        testVal = true;
                    };

                this.widget = new Widget(element, [addon]);

                expect(testVal).toBe(true);
            });

            it('delays triggering the init event if there are constructors to be called', function(){
                var testVal = false,
                    element = $('<div />'),
                    WidgetExtend = Widget.extend(function() { return true; });

                element.on('xooie-init', function(){
                    testVal = true;
                });

                this.widget = new WidgetExtend(element);

                expect(testVal).toBe(false);

                waitsFor(function(){
                    return this.widget._extendCount === null;
                });

                runs(function(){
                    expect(testVal).toBe(true);
                });
            });

            it('delays loading addons if there are inherited constructors to be called', function(){
                var testVal = false,
                    element = $('<div />'),
                    WidgetExtend = Widget.extend(function() { return true; }),
                    addon = function() {
                        testVal = true;
                    };

                element.on('xooie-init', function(){
                    testVal = true;
                });

                this.widget = new WidgetExtend(element, [addon]);

                expect(testVal).toBe(false);

                waitsFor(function(){
                    return this.widget._extendCount === null;
                });

                runs(function(){
                    expect(testVal).toBe(true);
                });
            });
        });

        describe('When defining a new property...', function(){
            it('makes a property both writable and readable', function(){
                spyOn(Widget, 'defineWriteOnly');
                spyOn(Widget, 'defineReadOnly');

                Widget.define('foo_one');

                expect(Widget.defineWriteOnly).toHaveBeenCalledWith('foo_one');
                expect(Widget.defineReadOnly).toHaveBeenCalledWith('foo_one', undefined);
            });

            it('calls the Shared.defineReadOnly method', function(){
                spyOn(Shared, 'defineReadOnly');

                Widget.defineReadOnly('foo', 'bar');

                expect(Shared.defineReadOnly).toHaveBeenCalledWith(Widget, 'foo', 'bar');
            });

            it('calls the Shared.defineWriteOnly method', function(){
                spyOn(Shared, 'defineWriteOnly');

                Widget.defineWriteOnly('foo');

                expect(Shared.defineWriteOnly).toHaveBeenCalledWith(Widget, 'foo');
            });
        });

        describe('When getting and setting properties...', function(){
            it('calls the Shared get method', function(){
                spyOn(Shared, 'get');

                this.widget.get('foo');

                expect(Shared.get).toHaveBeenCalledWith(this.widget, 'foo');
            });

            it('calls the Shared set method', function(){
                spyOn(Shared, 'set');

                this.widget.set('foo', 'bar');

                expect(Shared.set).toHaveBeenCalledWith(this.widget, 'foo', 'bar');
            });
        });

        describe('When extending the Widget...', function(){
            it('calls the Shared extend method', function(){
                spyOn(Shared, 'extend');

                var constructor = function(){};

                Widget.extend(constructor);

                expect(Shared.extend).toHaveBeenCalledWith(constructor, Widget);
            });
        });

        describe('Properties and attributes', function(){
            it('defines an id property', function(){
                expect(Widget.prototype.id).not.toBeUndefined();
            });

            it('defines a root property', function(){
                expect(Widget.prototype.root).not.toBeUndefined();
            });

            it('defines a namespace property', function(){
                expect(Widget.prototype.namespace).not.toBeUndefined();
            });

            it('sets the default value of namespace to an empty string', function(){
                expect(this.widget.namespace()).toBe('');
            });

            it('defines a templateLanguage property', function(){
                expect(Widget.prototype.templateLanguage).not.toBeUndefined();
            });

            it('sets the default value of templateLanguage to micro_template', function(){
                expect(this.widget.templateLanguage()).toBe('micro_template');
            });

            it('sets a read-only property refreshEvent', function(){
                expect(Widget.prototype.refreshEvent).not.toBeUndefined();
                expect(Widget.prototype._get_refreshEvent).not.toBeUndefined();
                expect(Widget.prototype._set_refreshEvent).toBeUndefined();
            });

            it('sets the default value of refreshEvent to xooie-refresh', function(){
                expect(this.widget.refreshEvent()).toBe('xooie-refresh');
            });

            it('sets a read-only property initEvent', function(){
                expect(Widget.prototype.initEvent).not.toBeUndefined();
                expect(Widget.prototype._get_initEvent).not.toBeUndefined();
                expect(Widget.prototype._set_initEvent).toBeUndefined();
            });

            it('sets the default value of initEvent to xooie-init', function(){
                expect(this.widget.initEvent()).toBe('xooie-init');
            });

            it('sets a read-only property className', function(){
                expect(Widget.prototype.className).not.toBeUndefined();
                expect(Widget.prototype._get_className).not.toBeUndefined();
                expect(Widget.prototype._set_className).toBeUndefined();
            });

            it('sets the default value of className to is-instantiated', function(){
                expect(this.widget.className()).toBe('is-instantiated');
            });

            describe('When a namespace is set...', function(){
                beforeEach(function(){
                    this.widget.namespace('foo');
                });

                it('appends the namespace to the refresh event', function(){
                    expect(this.widget.refreshEvent()).toBe('xooie-refresh.foo');
                });

                it('appends the namespace to the init event', function(){
                    expect(this.widget.initEvent()).toBe('xooie-init.foo');
                });

                it('appends the namsepace to the class name', function(){
                    expect(this.widget.className()).toBe('is-instantiated-foo');
                });
            });
        });

        describe('Rendering templates', function() {
            var w;

            beforeEach(function() {
                Widget._renderMethods['null'] = function(template, view) {
                    return $('<span>Null template</span>');
                };

                w = new Widget($('<div/>'));

                w.templateLanguage('null');
            });

            it('calls the default render method if no template backend is specified', function() {
                spyOn(Widget._renderMethods, 'null');
                w.render($('<script>Test template</script>'), {});

                expect(Widget._renderMethods['null']).toHaveBeenCalled();
            });

            describe('Template languages', function() {
                var original_render, original_micro_render;

                beforeEach(function() {
                    original_render = $.fn.render;
                    original_micro_render = $.fn.micro_render;

                    $.fn.render = function() {};
                    $.fn.micro_render = function() {};

                    Mustache = {
                        render: jasmine.createSpy()
                    };

                    _ = {
                        template: function(){
                            return this.render;
                        },
                        render:  function(){
                            return '';
                        }
                    };

                    spyOn(_, 'template').andCallThrough();

                    spyOn(_, 'render').andReturn('');
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

                    w.render(template, view);

                    expect(_.template).toHaveBeenCalledWith('Test template');
                    expect(_.render).toHaveBeenCalledWith(view);
                });
            });
        });

        describe('Init event', function() {

            it('calls Init handlers immediately if the widget has already been initialized', function() {
                var element = $('<div/>'),
                    handler = jasmine.createSpy();

                new Widget(element);

                element.on('xooie-init', handler);

                expect(handler).toHaveBeenCalled();
            });

        });

    });

});
