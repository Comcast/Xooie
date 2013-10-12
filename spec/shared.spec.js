require(['jquery', 'xooie/shared', 'xooie/widgets/base'], function($, Shared, Widget){
  describe('Xooie shared functionality', function(){
    beforeEach(function(){

    });

    describe('When calling defineReadOnly...', function(){

      it('puts the property into the definedProps array', function(){
          Shared.defineReadOnly(Widget, 'foo_two');

          expect(Widget.prototype._definedProps).toContain('foo_two');
      });
      

      it('creates a function with the property name', function(){
          Shared.defineReadOnly(Widget, 'foo_three');

          expect(typeof Widget.prototype.foo_three).toBe('function');
      });

      it('creates a function that retrieves a value', function(){
          Shared.defineReadOnly(Widget, 'foo_three', 'bar');

          this.widget = new Widget($('<div />'));

          expect(this.widget.foo_three()).toBe('bar');
      });

      it('sets a default value if passed', function(){
          Shared.defineReadOnly(Widget, 'foo_four', 'bar');

          this.widget = new Widget($('<div />'));

          expect(this.widget.foo_four()).toBe('bar');
      });

      it('permits values to be read', function(){
          Shared.defineReadOnly(Widget, 'foo_seven', 'bar');

          expect(typeof Widget.prototype._set_foo_seven).toBe('undefined');
          expect(typeof Widget.prototype._get_foo_seven).toBe('function');
      });

      it('reads the property value', function(){
          Shared.defineReadOnly(Widget, 'foo_eight');

          this.widget = new Widget($('<div />'));

          this.widget._foo_eight = 'bar';

          expect(this.widget.foo_eight()).toBe('bar');
      });
    });

    describe('When calling defineWriteOnly', function(){

      it('permits values to be set', function(){
          Shared.defineWriteOnly(Widget, 'foo_five');

          expect(typeof Widget.prototype._set_foo_five).toBe('function');
          expect(typeof Widget.prototype._get_foo_five).toBe('undefined');
      });

      it('writes to the property value', function(){
          Shared.defineWriteOnly(Widget, 'foo_six');

          this.widget = new Widget($('<div />'));

          this.widget.set('foo_six', 'bar');

          expect(this.widget._foo_six).toBe('bar');
      });
    });

    describe('When extending the base module...', function(){
        var constructor, post_constructor, Extended;

        beforeEach(function(){
            constructor = jasmine.createSpy('constructor');
            post_constructor = jasmine.createSpy('post_constructor');
        });

        it('returns a new constructor that invokes the Base constructor, post constructor, and the passed constructor', function(){
            Extended = Shared.create(constructor, post_constructor, Widget);

            this.el = $('<div />');

            var w = new Extended(this.el);

            expect(constructor).toHaveBeenCalled();
            expect(post_constructor).toHaveBeenCalled();
            expect(w.root().is(this.el)).toBe(true);
        });

        it('extends the new Widget with the parent widget methods', function(){
            Extended = Shared.create(constructor, post_constructor, Widget);
            var prop;

            for (prop in Widget) {
                expect(typeof Extended[prop]).not.toBeUndefined();
            }
        });

        it('extends the new Widget prototype with the parent prototype', function(){
            Extended = Shared.create(constructor, post_constructor, Widget);

            var prop;

            for (prop in Widget.prototype) {
                expect(typeof Extended.prototype[prop]).not.toBeUndefined();
            }
        });
    });

    describe('When setting a property...', function(){
        it('calls the property setter', function(){
            Shared.defineWriteOnly(Widget, 'foo');

            this.widget = new Widget($('<div />'));

            spyOn(this.widget, '_set_foo');

            Shared.set(this.widget, 'foo', 'bar');

            expect(this.widget._set_foo).toHaveBeenCalledWith('bar');
        });
    });

    describe('When getting a property...', function(){
        it('calls the property getter', function(){
            Shared.defineReadOnly(Widget, 'foo');

            this.widget = new Widget($('<div />'));

            spyOn(this.widget, '_get_foo');

            Shared.get(this.widget, 'foo');

            expect(this.widget._get_foo).toHaveBeenCalled();
        });
    });
  });
});
