require(['jquery', 'xooie/helpers', 'xooie/event_handler', 'xooie/widgets/carousel'], function ($, helpers, EventHandler, Carousel) {
  'use strict';

  describe('Carousel', function () {
    beforeEach(function () {
      this.el = $([
        '<div data-widget-type="carousel">',
        '<button data-x-role="control:left 1 item">Control A</button>',
        '<button data-x-role="control:right 1 item">Control B</button>',
        '<ol data-x-role="content">',
        '<li></li><li></li><li></li><li></li><li></li>',
        '</ol>',
        '</div>'
      ].join(''));

      setFixtures(this.el);

      this.carousel = new Carousel(this.el);

      waitsFor(function () {
        return helpers.isDefined(this.el.attr('data-xooie-instance'));
      });
    });

    describe('Instantiation', function () {
      it('creates a _timers object', function () {
        expect(this.carousel._timers).toEqual({ scroll: 0, continuous: 0 });
      });

      it('creates a _positioners object', function () {
        expect(this.carousel._positioners).toBeDefined();
      });

      it('creates the _controlEvents EventHandler object', function () {
        expect(this.carousel._controlEvents instanceof EventHandler).toBe(true);
      });

      it('creates the _wrapperEvents EventHandler object', function () {
        expect(this.carousel._wrapperEvents instanceof EventHandler).toBe(true);
      });

      it('defines a crop style css rule', function () {
        expect(this.carousel.cropStyle()).toBeDefined();
      });

      it('adds the root element to the Carousel._cache', function () {
        expect(Carousel._cache.is(this.carousel.root())).toBe(true);
      });

      it('binds an init event to the root that triggers updateDimensions', function () {
        spyOn(this.carousel, 'updateDimensions');

        this.carousel.root().trigger(this.carousel.initEvent());

        expect(this.carousel.updateDimensions).toHaveBeenCalled();
      });

      it('binds an refresh event to the root that triggers updateDimensions', function () {
        spyOn(this.carousel, 'updateDimensions');

        this.carousel.root().trigger(this.carousel.refreshEvent());

        expect(this.carousel.updateDimensions).toHaveBeenCalled();
      });

      it('binds an resize event to the root that triggers updateDimensions', function () {
        spyOn(this.carousel, 'updateDimensions');

        this.carousel.root().trigger(this.carousel.resizeEvent());

        expect(this.carousel.updateDimensions).toHaveBeenCalled();
      });
    });

    describe('window.resize event', function () {
      it('resets the resize timer if it is defined', function () {
        Carousel.timers.resize = 1;

        $(window).trigger('resize');

        expect(Carousel.timers.resize).not.toBe(1);
      });

      it('does not reset the timer if it is falsey and the #_cache is empty', function () {
        Carousel.timers.resize = null;

        Carousel._cache = $();

        $(window).trigger('resize');

        expect(Carousel.timers.resize).toBeNull();
      });

      it('sets the timer if the #_cache is not empty', function () {
        Carousel.timers.resize = null;

        $(window).trigger('resize');

        expect(Carousel.timers.resize).not.toBeNull();
      });

      it('triggers a Carousel resizeEvent after 100 ms', function () {
        var passed = false;

        this.carousel.root().on(this.carousel.resizeEvent(), function () {
          passed = true;
        });

        $(window).trigger('resize');

        waitsFor(function () {
          return helpers.isUndefined(Carousel.timers.resize);
        });

        runs(function () {
          expect(passed).toBe(true);
        });
      });
    });

    describe('Properties and Attributes', function () {
      it('sets the default value of the namespace property to carousel', function () {
        expect(this.carousel.namespace()).toBe('carousel');
      });

      it('defines an isScrolling property', function () {
        expect(this.carousel.isScrolling()).toBe(false);
      });

      it('defines a visibleThreshold property', function () {
        expect(this.carousel.visibleThreshold()).toBe(0.5);
      });

      it('defines a cropStyle property', function () {
        expect(Carousel.prototype.cropStyle).not.toBeUndefined();
      });

      it('defines a read-only property resizeEvent with a default value of "xooie-carousel-resize"', function () {
        expect(this.carousel.resizeEvent()).toBe('xooie-carousel-resize.carousel');
        expect(Carousel.prototype._get_resizeEvent).not.toBeUndefined();
        expect(Carousel.prototype._set_resizeEvent).toBeUndefined();
      });

      it('does not add a namespace to the resizeEvent property if the namespace is not set', function () {
        this.carousel.namespace('');

        expect(this.carousel.resizeEvent()).toBe('xooie-carousel-resize');
      });

      it('defines a read-only property wrapperClass with a default value of "xooie-carousel-wrapper"', function () {
        expect(this.carousel.wrapperClass()).toBe('xooie-carousel-wrapper');
        expect(Carousel.prototype._get_wrapperClass).not.toBeUndefined();
        expect(Carousel.prototype._set_wrapperClass).toBeUndefined();
      });

      it('defines a read-only property cropClass with a default value of "xooie-carousel-crop"', function () {
        expect(this.carousel.cropClass()).toBe('xooie-carousel-crop');
        expect(Carousel.prototype._get_cropClass).not.toBeUndefined();
        expect(Carousel.prototype._set_cropClass).toBeUndefined();
      });

      it('defines a read-only property contentClass with a default value of "xooie-carousel-content"', function () {
        expect(this.carousel.contentClass()).toBe('xooie-carousel-content');
        expect(Carousel.prototype._get_contentClass).not.toBeUndefined();
        expect(Carousel.prototype._set_contentClass).toBeUndefined();
      });

      it('defines a read-only property controlClass with a default value of "xooie-carousel-control"', function () {
        expect(this.carousel.controlClass()).toBe('xooie-carousel-control');
        expect(Carousel.prototype._get_controlClass).not.toBeUndefined();
        expect(Carousel.prototype._set_controlClass).toBeUndefined();
      });

      it('defines a read-only property leftClass with a default value of "is-left-limit"', function () {
        expect(this.carousel.leftClass()).toBe('is-left-limit');
        expect(Carousel.prototype._get_leftClass).not.toBeUndefined();
        expect(Carousel.prototype._set_leftClass).toBeUndefined();
      });

      it('defines a read-only property rightClass with a default value of "is-right-limit"', function () {
        expect(this.carousel.rightClass()).toBe('is-right-limit');
        expect(Carousel.prototype._get_rightClass).not.toBeUndefined();
        expect(Carousel.prototype._set_rightClass).toBeUndefined();
      });
    });

    //TODO: add additional coverage around roles
    describe('Roles', function () {
      it('defines a role wrapper', function () {
        expect(typeof this.carousel.wrappers).toBe('function');
      });

      it('defines a role content', function () {
        expect(typeof this.carousel.contents).toBe('function');
      });

      it('adds the contentClass to the content', function () {
        expect(this.carousel.contents().hasClass(this.carousel.contentClass())).toBe(true);
      });
    });

    describe('#_controlEvents', function () {
      describe('keydown', function () {
        var control, event;

        beforeEach(function () {
          control = this.carousel.controls().eq(0);
          spyOn(this.carousel, '_continuousScroll');
        });

        afterEach(function () {
          clearInterval(this.carousel._timers.continuous);
        });

        it('scrolls continuously if the key is space, continuous is set and the control is not disabled', function () {
          control.attr('data-x-role', 'control:right continuous');
          control.prop('disabled', false);
          event = $.Event('keydown');
          event.which = 13;

          control.trigger(event);

          expect(this.carousel._continuousScroll).toHaveBeenCalledWith($(control[0]), 'right');
        });

        it('scrolls continuously if the key is enter, continuous is set and the control is not disabled', function () {
          control.attr('data-x-role', 'control:left continuous');
          control.prop('disabled', false);
          event = $.Event('keydown');
          event.which = 32;

          control.trigger(event);

          expect(this.carousel._continuousScroll).toHaveBeenCalledWith($(control[0]), 'left');
        });

        it('does not scroll if the control is disabled', function () {
          control.attr('data-x-role', 'control:right continuous');
          control.prop('disabled', true);
          event = $.Event('keydown');
          event.which = 32;

          control.trigger(event);

          expect(this.carousel._continuousScroll).not.toHaveBeenCalled();
        });

        it('does not scroll if the key is not space or enter', function () {
          control.attr('data-x-role', 'control:right continuous');
          control.prop('disabled', false);
          event = $.Event('keydown');
          event.which = 10;

          control.trigger(event);

          expect(this.carousel._continuousScroll).not.toHaveBeenCalled();
        });

        it('prevents the default event', function () {
          control.attr('data-x-role', 'control:right continuous');
          control.prop('disabled', false);
          event = $.Event('keydown');
          event.which = 32;

          spyOn(event, 'preventDefault');

          control.trigger(event);

          expect(event.preventDefault).toHaveBeenCalled();
        });
      });

      describe('mousedown', function () {
        var control;

        beforeEach(function () {
          control = this.carousel.controls().eq(0);
          spyOn(this.carousel, '_continuousScroll');
        });

        afterEach(function () {
          clearInterval(this.carousel._timers.continuous);
        });

        it('scrolls continuously if the key is enter, continuous is set and the control is not disabled', function () {
          control.attr('data-x-role', 'control:left continuous');
          control.prop('disabled', false);

          control.trigger('mousedown');

          expect(this.carousel._continuousScroll).toHaveBeenCalledWith($(control[0]), 'left');
        });

        it('does not scroll if the control is disabled', function () {
          control.attr('data-x-role', 'control:left continuous');
          control.prop('disabled', true);

          control.trigger('mousedown');

          expect(this.carousel._continuousScroll).not.toHaveBeenCalled();
        });

        it('it does not scroll if the mode is not continuous', function () {
          control.attr('data-x-role', 'control:left 1 item');
          control.prop('disabled', false);

          control.trigger('mousedown');

          expect(this.carousel._continuousScroll).not.toHaveBeenCalled();
        });

        it('prevents the default event', function () {
          var event;

          control.attr('data-x-role', 'control:right continuous');
          control.prop('disabled', false);
          event = $.Event('mousedown');

          spyOn(event, 'preventDefault');

          control.trigger(event);

          expect(event.preventDefault).toHaveBeenCalled();
        });
      });

      describe('keyup', function () {
        var control, event;

        beforeEach(function () {
          control = this.carousel.controls().eq(0);
          spyOn(this.carousel._positioners, 'items');

          event = $.Event('keyup');
        });

        it('clears the continuous timer', function () {
          spyOn(window, 'clearInterval');
          this.carousel._timers.continuous = 10;

          control.trigger(event);

          expect(window.clearInterval).toHaveBeenCalledWith(10);
        });

        it('sets the position if the key is space', function () {
          control.attr('data-x-role', 'control:left 2 items');
          control.prop('disabled', false);
          event.which = 13;

          control.trigger(event);

          expect(this.carousel._positioners.items).toHaveBeenCalledWith('left', '2', 'items');
        });

        it('sets the position if the key is enter', function () {
          control.attr('data-x-role', 'control:left 2 items');
          control.prop('disabled', false);
          event.which = 32;

          control.trigger(event);

          expect(this.carousel._positioners.items).toHaveBeenCalledWith('left', '2', 'items');
        });

        it('does not set position if the key is not space or enter', function () {
          control.attr('data-x-role', 'control:left 2 items');
          control.prop('disabled', false);
          event.which = 10;

          control.trigger(event);

          expect(this.carousel._positioners.items).not.toHaveBeenCalled();
        });

        it('does not set position if the positioner is not a function', function () {
          control.attr('data-x-role', 'control:left 2 items');
          control.prop('disabled', false);
          event.which = 32;

          spyOn(helpers, 'isFunction').andReturn(false);

          control.trigger(event);

          expect(this.carousel._positioners.items).not.toHaveBeenCalled();
        });

        it('does not set position if the control is disabled', function () {
          control.attr('data-x-role', 'control:left 2 items');
          control.prop('disabled', true);
          event.which = 13;

          control.trigger(event);

          expect(this.carousel._positioners.items).not.toHaveBeenCalled();
        });
      });

      describe('mouseup', function () {
        var control, event;

        beforeEach(function () {
          control = this.carousel.controls().eq(0);
          spyOn(this.carousel._positioners, 'items');

          event = $.Event('mouseup');
        });

        it('clears the continuous timer', function () {
          spyOn(window, 'clearInterval');
          this.carousel._timers.continuous = 10;

          control.trigger(event);

          expect(window.clearInterval).toHaveBeenCalledWith(10);
        });

        it('sets the position', function () {
          control.attr('data-x-role', 'control:left 2 items');
          control.prop('disabled', false);

          control.trigger(event);

          expect(this.carousel._positioners.items).toHaveBeenCalledWith('left', '2', 'items');
        });

        it('does not set position if the positioner is not a function', function () {
          control.attr('data-x-role', 'control:left 2 items');
          control.prop('disabled', false);

          spyOn(helpers, 'isFunction').andReturn(false);

          control.trigger(event);

          expect(this.carousel._positioners.items).not.toHaveBeenCalled();
        });

        it('does not set position if the control is disabled', function () {
          control.attr('data-x-role', 'control:left 2 items');
          control.prop('disabled', true);

          control.trigger(event);

          expect(this.carousel._positioners.items).not.toHaveBeenCalled();
        });
      });

      describe('mouseleave', function () {
        it('clears the contiuous timer', function () {
          var control = this.carousel.controls().eq(0);

          this.carousel._timers.continuous = 10;
          spyOn(window, 'clearInterval');

          control.trigger('mouseleave');

          expect(window.clearInterval).toHaveBeenCalledWith(10);
        });
      });

      describe('blur', function () {
        it('clears the contiuous timer', function () {
          var control = this.carousel.controls().eq(0);

          this.carousel._timers.continuous = 10;
          spyOn(window, 'clearInterval');

          control.trigger('blur');

          expect(window.clearInterval).toHaveBeenCalledWith(10);
        });
      });
    });

    describe('#_wrapperEvents', function () {
      describe('scroll', function () {
        it('clears an existing scroll timer', function () {
          spyOn(window, 'clearTimeout').andCallThrough();
          this.carousel._timers.scroll = 10;

          this.carousel.wrappers().trigger('scroll');

          expect(window.clearTimeout).toHaveBeenCalledWith(10);
        });

        it('removes the left and right classes from the controls', function () {
          this.carousel.root().addClass(this.carousel.leftClass() + ' ' + this.carousel.rightClass());
          this.carousel.controls().prop('disabled', true);

          this.carousel.wrappers().trigger('scroll');

          expect(this.carousel.root().hasClass(this.carousel.leftClass())).toBe(false);
          expect(this.carousel.root().hasClass(this.carousel.rightClass())).toBe(false);

        });

        it('removes the disabled prop from the controls', function () {
          this.carousel.controls().prop('disabled', true);

          this.carousel.wrappers().trigger('scroll');

          expect(this.carousel.controls().attr('disabled')).toBeUndefined();
        });

        it('sets a timeout that calls #updateLimits after 250ms', function () {
          spyOn(this.carousel, 'updateLimits');

          this.carousel.wrappers().trigger('scroll');

          waitsFor(function () {
            return helpers.isUndefined(this.carousel._timers.scroll);
          });

          runs(function () {
            expect(this.carousel.updateLimits).toHaveBeenCalled();
          });
        });
      });
    });

    describe('#_positioners', function () {
      var items;

      beforeEach(function () {
        spyOn(this.carousel, 'scrollTo');

        items = $('<div /><div /><div />');

        spyOn(this.carousel, 'items').andCallFake(function () { return items; });
        spyOn(items, 'eq').andCallFake(function (i) {
          return {
            position: function () {
              return { left: 100.1 * i };
            }
          };
        });
      });

      describe('item', function () {
        it('does not scroll if the quantity is invalid', function () {
          this.carousel._positioners.item('right', 'foo');

          expect(this.carousel.scrollTo).not.toHaveBeenCalled();
        });

        it('calls #_positioners.item when #_positioners.items is called', function () {
          spyOn(this.carousel._positioners, 'item');

          this.carousel._positioners.items('goto', 1);

          expect(this.carousel._positioners.item).toHaveBeenCalledWith('goto', 1);
        });

        describe('the direction is goto', function () {
          var content;

          beforeEach(function () {
            content = $('<div />');
            spyOn(content, 'position').andReturn({ left: 0 });
            spyOn(this.carousel, 'contents').andReturn(content);
          });

          it('scrolls to the position of the targeted item, rounded', function () {
            this.carousel._positioners.item('goto', 2);

            expect(this.carousel.scrollTo).toHaveBeenCalledWith(100);
          });

          it('does not scroll if the index is less than 0', function () {
            this.carousel._positioners.item('goto', -1);

            expect(this.carousel.scrollTo).not.toHaveBeenCalled();
          });

          it('does not scroll if the index is out of bounds', function () {
            this.carousel._positioners.item('goto', 6);

            expect(this.carousel.scrollTo).not.toHaveBeenCalled();
          });
        });

        describe('the direction is right or left', function () {
          var wrapper;

          beforeEach(function () {
            spyOn(this.carousel, 'currentItem').andReturn(1);
            wrapper = $('<div />');

            spyOn(this.carousel, 'wrappers').andReturn(wrapper);
            spyOn(wrapper, 'scrollLeft').andReturn(0);
          });

          it('scrolls to the position of the previous item', function () {
            this.carousel._positioners.item('left', 1);

            expect(this.carousel.scrollTo).toHaveBeenCalledWith(0);
          });

          it('scrolls to the position of the next item', function () {
            this.carousel._positioners.item('right', 1);

            expect(this.carousel.scrollTo).toHaveBeenCalledWith(200);
          });

          it('scrolls to the position of the last item if the target is out of bounds', function () {
            this.carousel._positioners.item('right', 6);

            expect(this.carousel.scrollTo).toHaveBeenCalledWith(200);
          });

          it('scrolls to the position of the first item if the target is less than 0', function () {
            this.carousel._positioners.item('left', 2);

            expect(this.carousel.scrollTo).toHaveBeenCalledWith(0);
          });
        });
      });

      describe('pixel', function () {
        var wrapper;

        beforeEach(function () {
          wrapper = $('<div />');

          spyOn(this.carousel, 'wrappers').andReturn(wrapper);
          spyOn(wrapper, 'scrollLeft').andReturn(0);
        });

        it('does not scroll if the quantity is invalid', function () {
          this.carousel._positioners.pixel('right', 'foo');

          expect(this.carousel.scrollTo).not.toHaveBeenCalled();
        });

        it('calls #_positioners.pixel when #_positioners.pixels is called', function () {
          spyOn(this.carousel._positioners, 'pixel');

          this.carousel._positioners.pixels('goto', 1);

          expect(this.carousel._positioners.pixel).toHaveBeenCalledWith('goto', 1);
        });

        it('calls #_positioners.pixel when #_positioners.px is called', function () {
          spyOn(this.carousel._positioners, 'pixel');

          this.carousel._positioners.px('goto', 1);

          expect(this.carousel._positioners.pixel).toHaveBeenCalledWith('goto', 1);
        });

        it('scrolls to the exact position if the direction is goto', function () {
          this.carousel._positioners.pixel('goto', 100);

          expect(this.carousel.scrollTo).toHaveBeenCalledWith(100);
        });

        it('does not scroll if the value is less than 0', function () {
          this.carousel._positioners.pixel('goto', -10);

          expect(this.carousel.scrollTo).not.toHaveBeenCalled();
        });

        it('scrolls to the left the designated amount of pixels', function () {
          this.carousel._positioners.pixel('left', 100);

          expect(this.carousel.scrollTo).toHaveBeenCalledWith(-100);
        });

        it('scrolls to the right the designated amount of pixels', function () {
          this.carousel._positioners.pixel('right', 100);

          expect(this.carousel.scrollTo).toHaveBeenCalledWith(100);
        });
      });
    });

    describe('#_continuousScroll', function () {
      var control;

      beforeEach(function () {
        control = $('<div data-x-role="control:right continuous />');
      });

      afterEach(function () {
        clearInterval(this.carousel._timers.continuous);
      });

      it('clears the continuous timer', function () {
        spyOn(window, 'clearInterval').andCallThrough();

        var continuousInterval = this.carousel._timers.continuous;

        this.carousel._continuousScroll(control, 'right');

        expect(window.clearInterval).toHaveBeenCalledWith(continuousInterval);
      });

      it('sets an interval for 0 seconds that passes -1 if left', function () {
        spyOn(window, 'setInterval');

        this.carousel._continuousScroll(control, 'left');

        expect(window.setInterval).toHaveBeenCalledWith(jasmine.any(Function), 0, [-1]);
      });

      it('sets an interval for 0 seconds that passes 1 if right', function () {
        spyOn(window, 'setInterval');

        this.carousel._continuousScroll(control, 'right');

        expect(window.setInterval).toHaveBeenCalledWith(jasmine.any(Function), 0, [1]);
      });

      it('calls #scrollTo at each interval, adding 5 to the scroll position', function () {
        var wrapper = $('<div />');

        spyOn(this.carousel, 'wrappers').andReturn(wrapper);
        spyOn(wrapper, 'scrollLeft').andReturn(10);
        spyOn(this.carousel, 'scrollTo');

        this.carousel._continuousScroll(control, 'right');

        waitsFor(function () {
          return this.carousel.scrollTo.callCount > 0;
        });

        runs(function () {
          expect(this.carousel.scrollTo).toHaveBeenCalledWith(15);
        });
      });

      it('clears the interval and does not call scrollTo if the control is disabled', function () {
        spyOn(this.carousel, 'scrollTo');
        spyOn(window, 'clearInterval').andCallThrough();

        //control.prop('disabled', true);
        spyOn(control, 'is').andCallFake(function (attr) {
          return attr === ':disabled';
        });

        this.carousel._continuousScroll(control, 'right');

        var continuousInterval = this.carousel._timers.continuous;

        waitsFor(function () {
          return helpers.isUndefined(this.carousel._timers.continuous);
        });

        runs(function () {
          expect(window.clearInterval).toHaveBeenCalledWith(continuousInterval);
          expect(this.carousel.scrollTo).not.toHaveBeenCalled();
        });
      });
    });

    describe('#currentItem', function () {
      var content, items;

      beforeEach(function () {
        spyOn($.fn, 'eq').andCallFake(function () {
          return {
            outerWidth: function () {
              return 100;
            }
          };
        });

        content = $('<div />');
        items = $('<div /><div /><div />');

        spyOn(this.carousel, 'contents').andReturn(content);
        spyOn(this.carousel, 'items').andCallFake(function () {
          return items;
        });

        spyOn(content, 'outerWidth').andReturn(200);
      });

      it('gets the first item from the left that is visible if the bias is not set', function () {
        spyOn(content, 'position').andReturn({left: -100});

        expect(this.carousel.currentItem()).toBe(1);
      });

      it('returns the last item if no matching value is found', function () {
        spyOn(content, 'position').andReturn({left: -500});

        expect(this.carousel.currentItem()).toBe(2);
      });

      it('gets the first item from the right that is visible if the bias is set', function () {
        spyOn(content, 'position').andReturn({left: 0});

        expect(this.carousel.currentItem(true)).toBe(1);
      });

      it('returns the first index if no matching value is found', function () {
        items = $();
        spyOn(content, 'position').andReturn({left: 0});

        expect(this.carousel.currentItem(true)).toBe(0);
      });
    });

    describe('#isLeft', function () {
      var wrapper;

      beforeEach(function () {
        wrapper = $('<div />');
        spyOn(this.carousel, 'wrappers').andReturn(wrapper);
      });

      it('returns true if the wrapper scroll position is 0', function () {
        spyOn(wrapper, 'scrollLeft').andReturn(0);

        expect(this.carousel.isLeft()).toBe(true);
      });

      it('returns false if the wrapper scroll position is not 0', function () {
        spyOn(wrapper, 'scrollLeft').andReturn(100);

        expect(this.carousel.isLeft()).toBe(false);
      });
    });

    describe('#isRight', function () {
      var items, wrapper, lastItem;

      beforeEach(function () {
        wrapper = $('<div />');
        items = $('<div /><div /><div />');
        lastItem = $('<div />');

        spyOn(items, 'filter').andReturn(lastItem);
        spyOn(this.carousel, 'wrappers').andReturn(wrapper);
        spyOn(this.carousel, 'items').andCallFake(function () { return items; });
      });

      it('returns true if the last item right position is less than the width of the wrapper', function () {
        spyOn(lastItem, 'position').andReturn({ left: 20 });
        spyOn(lastItem, 'outerWidth').andReturn(100);
        spyOn(wrapper, 'innerWidth').andReturn(130);

        expect(this.carousel.isRight()).toBe(true);
      });

      it('returns true if the last item right position is equal to the width of the wrapper', function () {
        spyOn(lastItem, 'position').andReturn({ left: 20 });
        spyOn(lastItem, 'outerWidth').andReturn(100);
        spyOn(wrapper, 'innerWidth').andReturn(120);

        expect(this.carousel.isRight()).toBe(true);
      });

      it('returns false if the last item right position is greater than the width of the wrapper', function () {
        spyOn(lastItem, 'position').andReturn({ left: 100 });
        spyOn(lastItem, 'outerWidth').andReturn(100);
        spyOn(wrapper, 'innerWidth').andReturn(100);

        expect(this.carousel.isRight()).toBe(false);
      });

      it('returns false if there is an exception', function () {
        items = undefined;

        expect(this.carousel.isRight()).toBe(false);
      });
    });

    describe('#updateDimensions', function () {
      var items;

      beforeEach(function () {
        items = $('<div /><div /><div />');

        spyOn(this.carousel, 'items').andCallFake(function () { return items; });
      });

      it('sets the crop height to the height of the tallest item', function () {
        spyOn($.fn, 'outerHeight').andReturn(100);

        this.carousel.updateDimensions();

        expect(this.carousel.cropStyle().style.height).toBe('100px');
      });

      it('calls updateLimits', function () {
        spyOn(this.carousel, 'updateLimits');

        this.carousel.updateDimensions();

        expect(this.carousel.updateLimits).toHaveBeenCalled();
      });
    });

    describe('#updateLimits', function () {
      it('adds the leftClass if the carousel is leftmost', function () {
        spyOn(this.carousel, 'isLeft').andReturn(true);

        this.carousel.updateLimits();

        expect(this.carousel.root().hasClass(this.carousel.leftClass())).toBe(true);
      });

      it('disables the left control', function () {
        spyOn(this.carousel, 'isLeft').andReturn(true);

        this.carousel.updateLimits();

        expect(this.carousel.controls().filter('[data-x-role^="control:left"]').is(':disabled')).toBe(true);
      });

      it('adds the rightClass if the carousel is rightmost', function () {
        spyOn(this.carousel, 'isRight').andReturn(true);

        this.carousel.updateLimits();

        expect(this.carousel.root().hasClass(this.carousel.rightClass())).toBe(true);
      });

      it('disables the right control', function () {
        spyOn(this.carousel, 'isRight').andReturn(true);

        this.carousel.updateLimits();

        expect(this.carousel.controls().filter('[data-x-role^="control:right"]').is(':disabled')).toBe(true);
      });
    });

    describe('#scrollTo', function () {
      it('stops a previous scrolling animation if it is already scrolling', function () {
        spyOn($.fn, 'stop');
        this.carousel.isScrolling = true;

        this.carousel.scrollTo(10);

        expect($.fn.stop).toHaveBeenCalledWith(true, true);
      });

      it('does not attempt to stop previous scrolling if it is not scrolling', function () {
        spyOn($.fn, 'stop');
        this.carousel.isScrolling = false;

        this.carousel.scrollTo(10);

        expect($.fn.stop).not.toHaveBeenCalled();
      });

      it('sets isScrolling to true', function () {
        this.carousel.scrollTo(10);

        expect(this.carousel.isScrolling).toBe(true);
      });

      it('starts an animation', function () {
        spyOn($.fn, 'animate');

        this.carousel.scrollTo(10);

        expect($.fn.animate).toHaveBeenCalledWith({ scrollLeft: 10 }, 200, jasmine.any(Function));
      });

      it('calls the callback when done animating', function () {
        var callback = jasmine.createSpy();
        this.carousel.scrollTo(10, callback);

        waitsFor(function () {
          return !this.carousel.isScrolling;
        });

        runs(function () {
          expect(callback).toHaveBeenCalled();
        });
      });

      it('does not call the callback when done animating if it is not a function', function () {
        var callback = jasmine.createSpy();
        this.carousel.scrollTo(10, callback);

        spyOn(helpers, 'isFunction').andReturn(false);

        waitsFor(function () {
          return !this.carousel.isScrolling;
        });

        runs(function () {
          expect(callback).not.toHaveBeenCalled();
        });
      });
    });
  });
});
