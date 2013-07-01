require(['jquery', 'xooie'], function($, $X){
  describe('Xooie', function(){

    describe('_requireShim', function(){
      define('foo', function(){ return 'foo'; });
      define('bar', function(){ return 'bar'; });
      define('baz', function(){ return 'baz'; });
      define('bee', function(){ return 'bee'; });

      it('gets multiple modules at once', function(){
        var args;

        $X._requireShim(['foo', 'bar', 'baz'], function(){
          args = arguments;
        });

        waitsFor(function(){
          return typeof args !== 'undefined';
        });

        runs(function(){
          expect(args[0]).toBe('foo');
          expect(args[1]).toBe('bar');
          expect(args[2]).toBe('baz');
        });
      });

      it('invokes the callback immediately if the modules are already loaded', function(){
        var args;

        $X._requireShim(['foo', 'bar', 'baz'], function(){
          args = arguments;
        });

        expect(args[0]).toBe('foo');
        expect(args[1]).toBe('bar');
        expect(args[2]).toBe('baz');
      });

      it('invokes the callback once all modules are loaded', function(){
        var args; 

        $X._requireShim(['foo', 'bar', 'bee'], function(){
          args = arguments;
        });

        waitsFor(function(){
          return typeof args !== 'undefined';
        });

        runs(function(){
          expect(args[0]).toBe('foo');
          expect(args[1]).toBe('bar');
          expect(args[2]).toBe('bee');
        });
      });
    });

  });
});
  