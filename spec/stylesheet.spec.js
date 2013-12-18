require(['jquery', 'xooie/stylesheet'], function ($, Stylesheet) {
  'use strict';
  describe('Dynamic Stylesheets', function () {

    describe('When instantiating a new stylesheet...', function () {
      var s;

      beforeEach(function () {
        s = new Stylesheet('test');
      });

      it('creates a new style object if the stylesheet does not exist', function () {
        var initialLength = $('style').length;

        s = new Stylesheet('abba');

        expect($('style').length).toBe(initialLength + 1);
      });

      it('adds a title to the created stylesheet', function () {
        expect(s.element.attr('id')).toEqual('test');
      });

      it('adds a comment to the created stylesheet indicating that this is a dynamic stylesheet', function () {
        expect(s.element.text()).toEqual('/* This is a dynamically generated stylesheet: test */');
      });

      it('retrieves a stylesheet if one already exists', function () {
        var element = $('<style id="testb">/* testb */</style>').appendTo($('head'));

        s = new Stylesheet('testb');

        expect(s.element.is(element)).toBe(true);
      });
    });

    describe('When adding a new rule...', function () {
      var s;

      beforeEach(function () {
        s = new Stylesheet('testc');
      });

      it('adds a new rule to the end of the cssRule array', function () {
        s.addRule('test_rule_a');

        expect(s.get().cssRules[0].selectorText).toBe('test_rule_a');
      });

      it('retrieves the rule if the rule already exists', function () {
        var rule = s.addRule('test_rule_b');

        expect(s.addRule('test_rule_b')).toBe(rule);
      });

      describe('In IE8 or less...', function () {

        beforeEach(function () {

          s = new Stylesheet('testx');

          spyOn(s, 'getRule').andReturn(false);

          spyOn(s, 'addRule').andCallThrough();

          //force it to work like IE
          spyOn(s, 'get').andReturn((function () {
            var addRule = jasmine.createSpy('addRule');

            addRule.andCallFake(function (ruleName, propString, index) {
              s.get().rules[index] = ruleName + ' {' + propString + '}';
            });

            return {
              rules: [],
              addRule: addRule
            };
          }()));
        });

        it('adds a new rule to the end of the cssRule array', function () {
          s.addRule('test_rule_x');

          expect(s.get().addRule.callCount).toEqual(1);
        });

        it('loops through multiple context selectors', function () {
          s.addRule('.foo, .bar');

          expect(s.get().addRule.callCount).toEqual(2);
        });
      });
    });

    describe('When getting a rule...', function () {
      var s;
      beforeEach(function () {
        s = new Stylesheet('testd');
      });

      it('returns false if the rule does not exist', function () {
        expect(s.getRule('test_rule_c')).toBe(false);
      });

      it('returns the rule if it exists', function () {
        s.addRule('test_rule_c');

        expect(s.getRule('test_rule_c')).not.toBe(false);
      });
    });

    describe('When deleting a rule...', function () {
      var s;

      beforeEach(function () {
        s = new Stylesheet('teste');

        s.addRule('test_rule_d');
      });

      it('removes the rule from the stylesheet object', function () {
        expect(s.deleteRule('test_rule_d')).toBe(true);

        expect(s.getRule('test_rule_d')).toBe(false);
      });

      it('returns false if the rule does not exist', function () {
        expect(s.deleteRule('test_rule_e')).toBe(false);
      });
    });

  });
});
