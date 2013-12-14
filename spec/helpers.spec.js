require(['xooie/helpers'], function (helpers) {
  'use strict';
  describe('Xooie Helper Methods', function () {
    describe('#toArray', function () {
      it('converts a string into an array', function () {
        expect(helpers.toArray('foo')).toEqual(['foo']);
      });

      it('splits the string on space', function () {
        expect(helpers.toArray('foo bar')).toEqual(['foo', 'bar']);
      });

      it('returns the same array', function () {
        expect(helpers.toArray(['foo', 'bar'])).toEqual(['foo', 'bar']);
      });

      it('returns undefined for an object', function () {
        expect(helpers.toArray({foo: 'bar'})).toBeUndefined();
      });
    });

    describe('#toInteger', function () {
      it('returns an integer', function () {
        expect(helpers.toInteger('1')).toBe(1);
      });

      it('returns NaN for non-integers', function () {
        expect(isNaN(helpers.toInteger('A'))).toBe(true);
      });
    });

    describe('#isArray', function () {
      it('returns true if the object is an array', function () {
        expect(helpers.isArray([])).toBe(true);
      });

      it('returns false if the objectis not an array', function () {
        expect(helpers.isArray({})).toBe(false);
      });
    });

    describe('#isObject', function () {
      it('returns true if the object is a literal object', function () {
        expect(helpers.isObject({})).toBe(true);
      });

      it('returns false if the object is a string', function () {
        expect(helpers.isObject('A')).toBe(false);
      });

      it('returns false if the object is an array', function () {
        expect(helpers.isObject([])).toBe(false);
      });

      it('returns false if the object is an integer', function () {
        expect(helpers.isObject(1)).toBe(false);
      });

      it('returns false if the object is a function', function () {
        expect(helpers.isObject(function () { return false; })).toBe(false);
      });
    });

    describe('#isUndefined', function () {
      var testObj;

      beforeEach(function () {
        testObj = {};
      });

      it('returns true if the object is undefined', function () {
        expect(helpers.isUndefined(testObj.prop)).toBe(true);
      });

      it('returns false if the object is defined', function () {
        testObj.prop = "A";

        expect(helpers.isUndefined(testObj.prop)).toBe(false);
      });
    });

    describe('#isDefined', function () {
      var testObj;

      beforeEach(function () {
        testObj = {};
      });

      it('returns true if the object is defined', function () {
        testObj.prop = "A";

        expect(helpers.isDefined(testObj.prop)).toBe(true);
      });

      it('returns false if the object is undefined', function () {
        expect(helpers.isDefined(testObj.prop)).toBe(false);
      });
    });

    describe('#isFunction', function () {
      it('returns true if the object is a function', function () {
        expect(helpers.isFunction(function () { return false; })).toBe(true);
      });

      it('returns false if the object is not a function', function () {
        expect(helpers.isFunction('A')).toBe(false);
      });
    });
  });
});