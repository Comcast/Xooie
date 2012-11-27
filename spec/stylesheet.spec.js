define(['jquery', 'stylesheet'], function($, Stylesheet){
    describe('Dynamic Stylesheets', function(){
        var s;

        describe('When instantiating a new stylesheet...', function(){
            it('creates a new style object if the stylesheet does not exist', function(){
                s = new Stylesheet('test');

                expect($('style[title=stylesheet-test]').is(s.element)).toBe(true);
            });

            it('sets the stylesheet property of the instantiated stylesheet to the matching document.styleSheets object', function(){
                s = new Stylesheet('test');

                expect(document.styleSheets[1].title).toBe('stylesheet-test');
                expect(document.styleSheets[1]).toBe(s.styleSheet);
            });

            it('adds a title to the created stylesheet', function(){
                s = new Stylesheet('test_a');

                expect(s.element.attr('title')).toEqual('stylesheet-test_a');
            });

            it('adds a comment to the created stylesheet indicating that this is a dynamic stylesheet', function(){
                s = new Stylesheet('test_a');

                expect(s.element.text()).toEqual('/* This is a dynamically generated stylesheet: test_a */');
            });

            it('retrieves a stylesheet if one already exists', function(){
                var element = $('<style title="stylesheet-test_b">/* test_a */</style>').appendTo($('head'));

                s = new Stylesheet('test_b');

                expect(s.element.is(element)).toBe(true);
            });
        });

        describe('When adding a new rule...', function(){
            beforeEach(function(){
                s = new Stylesheet('test');
            });

            it('adds a new rule to the end of the cssRule array', function(){
                s.addRule('test_rule_a');

                expect(s.styleSheet.cssRules[0].selectorText).toBe('test_rule_a');
            });

            it('retrieves the rule if the rule already exists', function(){
                var rule = s.addRule('test_rule_b');

                expect(s.addRule('test_rule_b')).toBe(rule);
            });
        });

        describe('When getting a rule...', function(){
            beforeEach(function(){
                s = new Stylesheet('test');
            });

            it('returns false if the rule does not exist', function(){
                expect(s.getRule('test_rule_c')).toBe(false);
            });

            it('returns the rule if it exists', function(){
                s.addRule('test_rule_c');

                expect(s.getRule('test_rule_c')).not.toBe(false);
            });
        });

        describe('When deleting a rule...', function(){
            beforeEach(function(){
                s = new Stylesheet('test');

                s.addRule('test_rule_d');
            });

            it('removes the rule from the stylesheet object', function(){
                expect(s.deleteRule('test_rule_d')).toBe(true);

                expect(s.getRule('test_rule_d')).toBe(false);
            });

            it('returns false if the rule does not exist', function(){
                expect(s.deleteRule('test_rule_e')).toBe(false);
            });
        });
    });
});