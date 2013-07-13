require(['jquery', 'xooie/xooie'], function($, $X){
  describe('Xooie', function(){

    describe('Xooie.config', function(){
      it('sets an absolute path for a widget', function(){
        $X.config({widgets: { testWidget: 'test/widget' }});

        expect($X._mapName('testWidget', 'widgets')).toBe('test/widget');
      });

      it('sets an absolute path for an addon', function(){
        $X.config({addons: { testAddon: 'test/addon'}});

        expect($X._mapName('testAddon', 'addons')).toBe('test/addon');
      });

      it('can define a new type', function(){
        $X.config({ newType: { testType: 'test/type' } });

        expect($X._mapName('testType', 'newType')).toBe('test/type');
      });

      it('sets the default root to "xooie"', function(){
        expect($X._mapName('someWidget', 'widgets')).toBe('xooie/widgets/someWidget');
      });

      it('sets the cleanupInterval to 0 by default', function(){
        spyOn($X, 'cleanup');

        waits(100);

        runs(function(){
          expect($X.cleanup).not.toHaveBeenCalled();
        });
      });

      it('starts the cleanup timer as soon as a cleanupInterval is set', function(){
        spyOn($X, 'cleanup');

        $X.config({
          cleanupInterval: 100
        });

        waitsFor(function(){
          return $X.cleanup.callCount > 0;
        }, 100);

        runs(function(){
          expect($X.cleanup).toHaveBeenCalled();
        });
      });

      it('clears the previous cleanupInterval when a new one is set', function(){
        spyOn($X, 'cleanup');

        $X.config({
          cleanupInterval: 100
        });

        $X.config({
          cleanupInterval: 500
        });

        waits(100);

        runs(function(){
          expect($X.cleanup).not.toHaveBeenCalled();

          waits(400);

          runs(function(){
            expect($X.cleanup).toHaveBeenCalled();
          });
        });
      });

      it('does not set a cleanupInterval if it is not a number', function(){
        spyOn(window, 'setInterval');

        $X.config({
          cleanupInterval: 'foo'
        });

        expect(window.setInterval).not.toHaveBeenCalled();
      });
    });

    describe('Xooie._mapName', function(){
      it('returns a url made up of the root path, the type and the name of the module', function(){
        expect($X._mapName('test', 'widgets')).toBe('xooie/widgets/test');
      });
      
      it('returns the absolute path of the module if it was configured', function(){
        $X.config({
          widgets: {
            'foo': 'bar'
          }
        });

        expect($X._mapName('foo', 'widgets')).toBe('bar');
      });
    });

    describe('Xooie.cleanup', function(){
      it('calls the garbageCollect method on each instantiated widget', function(){
        var w1, w2;

        w1 = {
          garbageCollect: jasmine.createSpy('w1 garbage collect')
        };

        w2 = {
          garbageCollect: jasmine.createSpy('w2 garbage collect')
        };

        $X._instantiated.push(w1);
        $X._instantiated.push(w2);

        $X.cleanup();

        expect(w1.garbageCollect).toHaveBeenCalled();
        expect(w2.garbageCollect).toHaveBeenCalled();
      });
    });

  });
});