require(['jquery', 'xooie/event_handler', 'xooie/helpers'], function ($, EventHandler, helpers) {
  'use strict';
  describe('EventHandler', function () {
    beforeEach(function () {
      this.eventhandler = new EventHandler();

      this.testMethod = jasmine.createSpy('testMethod');
    });

    describe('Instantiate', function () {
      beforeEach(function () {
        this.eventhandler = new EventHandler('test');
      });

      it('sets the namespace property', function () {
        expect(this.eventhandler.namespace).toEqual('test');
      });

      it('creates a handlers object', function () {
        expect(this.eventhandler.handlers).toEqual({});
      });

      it('creates a _callbacks object', function () {
        expect(this.eventhandler._callbacks).toEqual({});
      });
    });

    describe('#Add', function () {
      it('creates an entry in #handlers for the event type', function () {
        this.eventhandler.add('someEvent', this.testMethod);

        expect(this.eventhandler.handlers.someEvent).toBeDefined();
      });

      it('creates a separate entry in #handlers for the event type if it has a namespace', function () {
        this.eventhandler = new EventHandler('test');

        this.eventhandler.add('someEvent', this.testMethod);

        expect(this.eventhandler.handlers['someEvent.test']).toBeDefined();
      });

      it('does not create a new entry in #handers if is already defined', function () {
        var testFunc = function () { return false; };

        this.eventhandler.handlers.someEvent = testFunc;

        this.eventhandler.add('someEvent', this.testMehod);

        expect(this.eventhandler.handlers.someEvent).toBe(testFunc);
      });

      it('creates an event handler that, when triggered, will call the #fire method', function () {
        var e, el;

        spyOn(this.eventhandler, 'fire');

        this.eventhandler.add('someEvent', this.testMethod);

        e = $.Event('someEvent');
        el = $('<div />');

        el.on(this.eventhandler.handlers);

        el.trigger(e, 'testArg');

        expect(this.eventhandler.fire).toHaveBeenCalledWith(el[0], e, 'testArg');
      });

      it('creates an entry in #_callbacks that is a new $.Callbacks instance', function () {
        this.eventhandler.add('someEvent', this.testMethod);

        expect(this.eventhandler._callbacks.someEvent).toBeDefined();
      });

      it('does not create a new entry in #_callbacks if is already defined', function () {
        var testFunc = $.Callbacks('unique');

        this.eventhandler._callbacks.someEvent = testFunc;

        this.eventhandler.add('someEvent', this.testMehod);

        expect(this.eventhandler._callbacks.someEvent).toBe(testFunc);
      });

      it('adds the method to the $.Callbacks instance created for this type', function () {
        var testCallback = $.Callbacks('unique');

        this.eventhandler._callbacks.someEvent = testCallback;

        spyOn(testCallback, 'add');

        this.eventhandler.add('someEvent', this.testMethod);

        expect(testCallback.add).toHaveBeenCalledWith(this.testMethod);
      });

      it('adds each entry in a hash', function () {
        this.eventhandler.add({
          'eventA': function () { return false; },
          'eventB': function () { return false; },
          'eventC': function () { return false; }
        });

        expect(this.eventhandler.handlers.eventA).toBeDefined();
        expect(this.eventhandler.handlers.eventB).toBeDefined();
        expect(this.eventhandler.handlers.eventC).toBeDefined();
      });
    });

    describe('#Clear', function () {
      beforeEach(function () {
        this.eventhandler.add('someEvent', this.testMethod);
      });

      it('deletes the method in #handlers for the given type', function () {
        this.eventhandler.clear('someEvent');

        expect(this.eventhandler.handlers.someEvent).toBeUndefined();
      });

      it('calls empty on the #_callbacks entry for the given type', function () {
        spyOn(this.eventhandler._callbacks.someEvent, 'empty');

        this.eventhandler.clear('someEvent');

        expect(this.eventhandler._callbacks.someEvent.empty).toHaveBeenCalled();
      });

      it('does not call empty if no _callback entry exists for the event type', function () {
        spyOn(this.eventhandler._callbacks.someEvent, 'empty');
        spyOn(helpers, 'isUndefined').andReturn('true');

        this.eventhandler.clear('someEvent');

        expect(this.eventhandler._callbacks.someEvent.empty).not.toHaveBeenCalled();
      });
    });

    describe('#Fire', function () {
      beforeEach(function () {
        this.eventhandler.add('someEvent', this.testMethod);

        spyOn(this.eventhandler._callbacks.someEvent, 'fireWith');
      });

      it('does not call the callbacks if the namespaces to not match', function () {
        var e, el;

        this.eventhandler.namespace = 'test';

        e = $.Event('someEvent');
        el = $('<div />');

        e.namespace = 'other';

        this.eventhandler.fire(el[0], e);

        expect(this.eventhandler._callbacks.someEvent.fireWith).not.toHaveBeenCalled();
      });

      it('calls fireWith on the #_callbacks instance for the event type', function () {
        var e, el;

        e = $.Event('someEvent');
        el = $('<div />');

        this.eventhandler.fire(el[0], e, 'testArg');

        expect(this.eventhandler._callbacks.someEvent.fireWith).toHaveBeenCalledWith(el[0], [e, 'testArg']);
      });

      it('does not call fireWith if the #_callbacks instance for that event type is undefined', function () {
        var e, el;

        spyOn(helpers, 'isUndefined').andReturn('true');

        e = $.Event('someEvent');
        el = $('<div />');

        this.eventhandler.fire(el[0], e, 'testArg');

        expect(this.eventhandler._callbacks.someEvent.fireWith).not.toHaveBeenCalled();
      });
    });
  });
});