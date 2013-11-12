require(['jquery', 'xooie/event_handler'], function($, EventHandler){
  describe('Event Handler', function(){
    describe('When instantiating the module...', function(){
      it('sets the namespace to the namespace provided', function(){
        this.eh = new EventHandler('foo');

        expect(this.eh.namespace).toBe('foo');
      });
    });

    describe('When calling the add method...', function(){
      it('recursively calls add if the first argument is a hash', function(){

      });

      it('creates a handlers method for the event type', function(){

      });

      it('creates a handlers method that is namespaced', function(){

      });

      it('creates a handlers method that calls the fire method', function(){

      });

      it('does not create a handlers method if it is already present', function(){

      });

      it('creates a callback for the event type', function(){

      });

      it('does not create a callback for the event type if it is already present', function(){

      });

      it('adds the method to the callback object', function(){

      });
    });

    describe('When calling the clear method...', function(){
      it('deletes the event type from the handlers object', function(){

      });

      it('empties the callback object for this event type', function(){

      });
    });

    describe('When calling the fire method...', function(){
      it('does not fire if the event namespace does not match the event handler namespace', function(){

      });

      it('does not fire if there is no handler for that event type', function(){

      });

      it('fires the callback with the passed context and arguments', function(){

      });
    });
  });
});