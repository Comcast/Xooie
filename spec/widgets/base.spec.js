require(['jquery', 'xooie/widgets/base'], function($, Base) {

    describe('Xooie Base Module', function() {

        beforeEach(function(){
            this.el = $('<div/>');
            this.base = new Base(this.el);
        });

        describe('When instantiating a new instance of the module...', function(){
            it('jquery-ifies the element passed in', function(){
                var element = $('<div id="test" />');

                this.base = new Base(element);

                expect(this.base.get('root').is(element)).toBe(true);
            });

            it('reads the data attributes of the element and sets the data', function(){
                spyOn(Base.prototype, '_setData');

                this.base = new Base('<div data-prop="a" />');

                expect(Base.prototype._setData).toHaveBeenCalledWith({ prop: 'a' });
            });

            it('sets any defined properties', function(){
                Base.define('foo', 'bar');

                this.base = new Base('<div />');

                expect(this.base.get('foo')).toBe('bar');
                expect(this.base.foo()).toBe('bar');
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

            it('triggers the init event if there are no inherited constructors to be called', function(){
                var testVal = false,
                    element = $('<div />');

                element.on('xooie-init', function(){
                    testVal = true;
                });

                this.base = new Base(element);

                expect(testVal).toBe(true);
            });

            it('loads addons immediately if there are no inherited constructors to be called', function(){

            });

            it('delays triggering the init event if there are constructors to be called', function(){
                var testVal = false,
                    element = $('<div />'),
                    BaseExtend = Base.extend(function() { return true; });

                element.on('xooie-init', function(){
                    testVal = true;
                });

                this.base = new BaseExtend(element);

                expect(testVal).toBe(false);

                waitsFor(function(){
                    return this.base._extendCount === null;
                });

                runs(function(){
                    expect(testVal).toBe(true);
                });
            });

            it('delays loading addons if there are inherited constructors to be called', function(){

            });
        });

        describe('When defining a new property...', function(){
            it('makes a property both writable and readable', function(){
                spyOn(Base, 'defineWriteOnly');
                spyOn(Base, 'defineReadOnly');

                Base.define('foo_one');

                expect(Base.defineWriteOnly).toHaveBeenCalledWith('foo_one');
                expect(Base.defineReadOnly).toHaveBeenCalledWith('foo_one', undefined);
            });

            it('puts the property into the definedProps array', function(){
                Base.define('foo_two');

                expect(Base.prototype._definedProps).toContain('foo_two');
            });

            it('creates a function with the property name', function(){
                Base.define('foo_three');

                expect(typeof Base.prototype.foo_three).toBe('function');
            });

            it('creates a function that sets a value when passed and retrieves a value when called', function(){
                Base.define('foo_three');

                this.base = new Base($('<div />'));

                this.base.foo_three('bar');

                expect(this.base.foo_three()).toBe('bar');
            });

            it('sets a default value if passed', function(){
                Base.define('foo_four', 'bar');

                this.base = new Base($('<div />'));

                expect(this.base.foo_four()).toBe('bar');
            });

            describe('and defineWriteOnly is called...', function(){
                it('permits values to be set', function(){
                    Base.defineWriteOnly('foo_five');

                    expect(typeof Base.prototype._set_foo_five).toBe('function');
                    expect(typeof Base.prototype._get_foo_five).toBe('undefined');
                });

                it('writes to the property value', function(){
                    Base.defineWriteOnly('foo_six');

                    this.base = new Base($('<div />'));

                    this.base.set('foo_six', 'bar');

                    expect(this.base._foo_six).toBe('bar');
                });
            });

            describe('and defineReadOnly is called...', function(){
                it('permits values to be read', function(){
                    Base.defineReadOnly('foo_seven', 'bar');

                    expect(typeof Base.prototype._set_foo_seven).toBe('undefined');
                    expect(typeof Base.prototype._get_foo_seven).toBe('function');
                });

                it('reads the property value', function(){
                    Base.defineReadOnly('foo_eight');

                    this.base = new Base($('<div />'));

                    this.base._foo_eight = 'bar';

                    expect(this.base.foo_eight()).toBe('bar');
                });
            });
        });

        describe('When extending the base module...', function(){
            var constructor, Widget;

            beforeEach(function(){
                constructor = jasmine.createSpy('constructor');
            });

            it('sets the extendCount to 1 if extending Base', function(){
                Widget = Base.extend(constructor);

                expect(Widget.prototype._extendCount).toBe(1);
            });

            it('increments the extendCount if an extended widget is extended', function(){
                Widget = Base.extend(constructor);

                var Widget_Two = Widget.extend(constructor);

                expect(Widget_Two.prototype._extendCount).toBe(2);
            });

            it('returns a new constructor that invokes the Base constructor and the passed constructor', function(){
                Widget = Base.extend(function() { constructor(); });

                this.el = $('<div />');

                var w = new Widget(this.el);

                expect(constructor).toHaveBeenCalled();
                expect(w.root().is(this.el)).toBe(true);
            });

            it('extends the new Widget with the parent widget methods', function(){
                Widget = Base.extend(function(){ constructor(); });
                var prop;

                for (prop in Base) {
                    expect(typeof Widget[prop]).not.toBeUndefined();
                }
            });

            it('extends the new Widget prototype with the parent prototype', function(){
                Widget = Base.extend(function(){ constructor(); });

                var prop;

                for (prop in Base.prototype) {
                    expect(typeof Widget.prototype[prop]).not.toBeUndefined();
                }
            });
        });

        describe('When setting a property...', function(){
            it('calls the property setter', function(){
                Base.define('foo');

                this.base = new Base($('<div />'));

                spyOn(this.base, '_set_foo');

                this.base.set('foo', 'bar');

                expect(this.base._set_foo).toHaveBeenCalledWith('bar');
            });
        });

        describe('When getting a property...', function(){
            it('calls the property getter', function(){
                Base.define('foo');

                this.base = new Base($('<div />'));

                spyOn(this.base, '_get_foo');

                this.base.get('foo');

                expect(this.base._get_foo).toHaveBeenCalled();
            });
        });

        describe('Properties and attributes', function(){
            it('defines an id property', function(){
                expect(Base.prototype.id).not.toBeUndefined();
            });

            it('defines a root property', function(){
                expect(Base.prototype.root).not.toBeUndefined();
            });

            it('defines a namespace property', function(){
                expect(Base.prototype.namespace).not.toBeUndefined();
            });

            it('sets the default value of namespace to an empty string', function(){
                expect(this.base.namespace()).toBe('');
            });

            it('defines a templateLanguage property', function(){
                expect(Base.prototype.templateLanguage).not.toBeUndefined();
            });

            it('sets the default value of templateLanguage to micro_template', function(){
                expect(this.base.templateLanguage()).toBe('micro_template');
            });

            it('sets a read-only property refreshEvent', function(){
                expect(Base.prototype.refreshEvent).not.toBeUndefined();
                expect(Base.prototype._get_refreshEvent).not.toBeUndefined();
                expect(Base.prototype._set_refreshEvent).toBeUndefined();
            });

            it('sets the default value of refreshEvent to xooie-refresh', function(){
                expect(this.base.refreshEvent()).toBe('xooie-refresh');
            });

            it('sets a read-only property initEvent', function(){
                expect(Base.prototype.initEvent).not.toBeUndefined();
                expect(Base.prototype._get_initEvent).not.toBeUndefined();
                expect(Base.prototype._set_initEvent).toBeUndefined();
            });

            it('sets the default value of initEvent to xooie-init', function(){
                expect(this.base.initEvent()).toBe('xooie-init');
            });

            it('sets a read-only property className', function(){
                expect(Base.prototype.className).not.toBeUndefined();
                expect(Base.prototype._get_className).not.toBeUndefined();
                expect(Base.prototype._set_className).toBeUndefined();
            });

            it('sets the default value of className to is-instantiated', function(){
                expect(this.base.className()).toBe('is-instantiated');
            });

            describe('When a namespace is set...', function(){
                beforeEach(function(){
                    this.base.namespace('foo');
                });

                it('appends the namespace to the refresh event', function(){
                    expect(this.base.refreshEvent()).toBe('xooie-refresh.foo');
                });

                it('appends the namespace to the init event', function(){
                    expect(this.base.initEvent()).toBe('xooie-init.foo');
                });

                it('appends the namsepace to the class name', function(){
                    expect(this.base.className()).toBe('is-instantiated-foo');
                });
            });
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

            it('calls Init handlers immediately if the widget has already been initialized', function() {
                var element = $('<div/>'),
                    handler = jasmine.createSpy();

                new Widget(element);

                element.bind('xooie-init.test', handler);

                expect(handler).toHaveBeenCalled();
            });

        });

    });

});
