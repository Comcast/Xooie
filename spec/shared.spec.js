require(['jquery', 'xooie/shared', 'xooie/helpers', 'xooie/widgets/base'], function ($, Shared, helpers, Widget) {
  'use strict';
  describe('Xooie shared functionality', function () {
    describe('When calling defineReadOnly...', function () {

      it('puts the property into the definedProps array', function () {
        Shared.defineReadOnly(Widget, 'foo_two');

        expect(Widget.prototype._definedProps).toContain('foo_two');
      });

      it('creates a function with the property name', function () {
        Shared.defineReadOnly(Widget, 'foo_three');

        expect(typeof Widget.prototype.foo_three).toBe('function');
      });

      it('creates a function that retrieves a value', function () {
        Shared.defineReadOnly(Widget, 'foo_three', 'bar');

        this.widget = new Widget($('<div />'));

        expect(this.widget.foo_three()).toBe('bar');
      });

      it('sets a default value if passed', function () {
        Shared.defineReadOnly(Widget, 'foo_four', 'bar');

        this.widget = new Widget($('<div />'));

        expect(this.widget.foo_four()).toBe('bar');
      });

      it('permits values to be read', function () {
        Shared.defineReadOnly(Widget, 'foo_seven', 'bar');

        expect(typeof Widget.prototype._set_foo_seven).toBe('undefined');
        expect(typeof Widget.prototype._get_foo_seven).toBe('function');
      });

      it('reads the property value', function () {
        Shared.defineReadOnly(Widget, 'foo_eight');

        this.widget = new Widget($('<div />'));

        this.widget._foo_eight = 'bar';

        expect(this.widget.foo_eight()).toBe('bar');
      });
    });

    describe('#defineWriteOnly', function () {

      it('permits values to be set', function () {
        Shared.defineWriteOnly(Widget, 'foo_five');

        expect(typeof Widget.prototype._set_foo_five).toBe('function');
        expect(typeof Widget.prototype._get_foo_five).toBe('undefined');
      });

      it('validates the value before setting it', function () {
        Shared.defineWriteOnly(Widget, 'foo_nine');

        Widget.prototype._validate_foo_nine = jasmine.createSpy('validate').andReturn(true);

        this.widget = new Widget($('<div />'));

        this.widget.set('foo_nine', 'bar');

        expect(Widget.prototype._validate_foo_nine).toHaveBeenCalled();
      });

      it('does not set if the validator fails', function () {
        Shared.defineWriteOnly(Widget, 'foo_ten');

        Widget.prototype._validate_foo_ten = jasmine.createSpy('validate').andReturn(false);

        this.widget = new Widget($('<div />'));

        this.widget.set('foo_ten', 'bar');

        expect(Widget.prototype._validate_foo_nine).toHaveBeenCalled();
        expect(this.widget._foo_ten).not.toBe('bar');
      });

      it('writes to the property value', function () {
        Shared.defineWriteOnly(Widget, 'foo_six');

        this.widget = new Widget($('<div />'));

        this.widget.set('foo_six', 'bar');

        expect(this.widget._foo_six).toBe('bar');
      });
    });

    describe('#create', function () {
      var constructor, post_constructor, Extended;

      beforeEach(function () {
        constructor = jasmine.createSpy('constructor');
        post_constructor = jasmine.createSpy('post_constructor');
      });

      it('returns a new constructor that invokes the Base constructor, post constructor, and the passed constructor', function () {
        Extended = Shared.create(constructor, post_constructor, Widget);

        this.el = $('<div />');

        var w = new Extended(this.el);

        expect(constructor).toHaveBeenCalled();
        expect(post_constructor).toHaveBeenCalled();
        expect(w.root().is(this.el)).toBe(true);
      });

      it('extends the new Widget with the parent widget methods', function () {
        Extended = Shared.create(constructor, post_constructor, Widget);
        var prop;

        for (prop in Widget) {
          if (Widget.hasOwnProperty(prop)) {
            expect(typeof Extended[prop]).toBeDefined();
          }
        }
      });

      it('extends the new Widget prototype with the parent prototype', function () {
        Extended = Shared.create(constructor, post_constructor, Widget);

        var prop;

        for (prop in Widget.prototype) {
          if (Widget.prototype.hasOwnProperty(prop)) {
            expect(typeof Extended.prototype[prop]).toBeDefined();
          }
        }
      });
    });

    describe('#set', function () {
      it('calls the property setter', function () {
        Shared.defineWriteOnly(Widget, 'foo');

        this.widget = new Widget($('<div />'));

        spyOn(this.widget, '_set_foo');

        Shared.set(this.widget, 'foo', 'bar');

        expect(this.widget._set_foo).toHaveBeenCalledWith('bar');
      });

      it('does not call the setter if the function is undefined', function () {
        Shared.defineWriteOnly(Widget, 'foo');

        this.widget = new Widget($('<div />'));

        spyOn(this.widget, '_set_foo');
        spyOn(helpers, 'isFunction').andReturn(false);

        Shared.set(this.widget, 'foo', 'bar');

        expect(this.widget._set_foo).not.toHaveBeenCalled();
      });
    });

    describe('#get', function () {
      it('calls the property getter', function () {
        Shared.defineReadOnly(Widget, 'foo');

        this.widget = new Widget($('<div />'));

        spyOn(this.widget, '_get_foo');

        Shared.get(this.widget, 'foo');

        expect(this.widget._get_foo).toHaveBeenCalled();
      });
    });

    describe('#setData', function () {
      beforeEach(function () {
        this.widget = new Widget($('<div />'));

        spyOn(this.widget, 'set');
      });

      it('takes the hash (data) passed and sets those properties on the instance', function () {
        Shared.setData(this.widget, { namespace: 'test', id: 1 });

        expect(this.widget.set).toHaveBeenCalledWith('namespace', 'test');
        expect(this.widget.set).toHaveBeenCalledWith('id', 1);
      });

      it('does not set a property that has not been defined', function () {
        Shared.setData(this.widget, { undefinedProp: 'bar' });

        expect(this.widget.set).not.toHaveBeenCalled();
      });
    });
  });
});
