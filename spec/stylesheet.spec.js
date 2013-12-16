require(['jquery', 'xooie/stylesheet'], function($, Stylesheet){
  describe('Dynamic Stylesheets', function(){

    describe('When instantiating a new stylesheet...', function(){
      var s;

      beforeEach(function(){
        s = new Stylesheet('test');
      });

      it('creates a new style object if the stylesheet does not exist', function(){
        var initialLength = $('style').length;

        new Stylesheet('abba');

        expect($('style').length).toBe(initialLength + 1);
      });

            it('adds a title to the created stylesheet', function(){
                expect(s.element.attr('id')).toEqual('test');
            });

      it('adds a comment to the created stylesheet indicating that this is a dynamic stylesheet', function(){
        expect(s.element.text()).toEqual('/* This is a dynamically generated stylesheet: test */');
      });

      it('retrieves a stylesheet if one already exists', function(){
        var element = $('<style id="testb">/* testb */</style>').appendTo($('head'));

        var s = new Stylesheet('testb');

        expect(s.element.is(element)).toBe(true);
      });
    });

    describe('When adding a new rule...', function(){
      var s;

      beforeEach(function(){
        s = new Stylesheet('testc');
      });

      it('adds a new rule to the end of the cssRule array', function(){
        s.addRule('test_rule_a');

        expect(s.get().cssRules[0].selectorText).toBe('test_rule_a');
      });

      it('retrieves the rule if the rule already exists', function(){
        var rule = s.addRule('test_rule_b');

        expect(s.addRule('test_rule_b')).toBe(rule);
      });

      it('adds the properties to the rule if it already exists', function() {
        s.addRule('test_rule_b');

        var rule = s.addRule('test_rule_b', {'display': 'none'});

        expect(rule.style['display']).toBe('none');
      });
    });

    describe('When getting a rule...', function(){
      var s;
      beforeEach(function(){
        s = new Stylesheet('testd');
      });

      it('returns false if the rule does not exist', function(){
        expect(s.getRule('test_rule_c')).toBe(false);
      });

      it('returns the rule if it exists', function(){
        s.addRule('test_rule_c');

        expect(s.getRule('test_rule_c')).not.toBe(false);
      });
    });

    describe('When adding properties of a rule...', function() {
      var s;

      beforeEach(function() {
        s = new Stylesheet('testf');

        s.addRule('test_rule_f');
      });

      it('does not add properties if the rule does not exits', function() {
        var rule = s.getRule('test_rule_f');

        spyOn(s, 'getRule').andReturn(false);

        s.addProperties('test_rule_f', 'display', 'none');

        expect(rule.style['display']).not.toBe('none');
      });

      it('sets a single property', function() {
        s.addProperties('test_rule_f', 'display', 'none');

        expect(s.getRule('test_rule_f').style['display']).toBe('none');
      });

      it('does not set single property if property value is undefined', function() {
        s.getRule('test_rule_f').style['display'] = '';

        s.addProperties('test_rule_f', 'display');

        expect(s.getRule('test_rule_f').style['display']).toBe('');
      });

      it('adds a hash of properties', function() {
        s.addProperties('test_rule_f', {
          'width': '50px',
          'height': '100px'
        });

    });
  });
});
