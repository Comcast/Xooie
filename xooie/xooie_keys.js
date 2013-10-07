define('xooie/xooie_keys', ['jquery', 'xooie/helpers'], function($, helpers){
  // The goal of this module is to provide keyboard navigation for a widget.
  // Default behavior is that the directional keys will move based on the orientation of the widget.

  var XooieKeys, instance;

  XooieKeys = function() {

    if (!helpers.isUndefined(instance)) {
      return instance;
    }

    instance = this;

    // Default keybindings
    this.set({
      37: function(event) {
        moveFocus($(event.target), -1);

        event.preventDefault();
      },

      38: function() {

      },

      39: function(event) {
        moveFocus($(event.target), 1);

        event.preventDefault();
      },

      40: function() {

      }
    });

  };

  function isVisible (element) {

  }

  function isFocusable (element) {

  }

  // return the current tab order on the page
  function tabbable (element) {
    /* we're only interested in any content that is descendant from a [data-widget-type]
       that means we can start by selecting just the widgets: $('[data-widget-type]')

       We're not changing the behavior of a tab keypress.  The user should be able to tab as normal.

       But we are adding arrow key navigation.

       Since navigation using directional keys is dependent on being inside a xooie widget, each widget should be considered a
       captive experience in terms of directional navigation.

       Therefore, there is no need to set focus on the first widget when an arrow key is pressed.  In fact, we shouldn't.

       The user will use tab to navigate non-DHTML content until they enter a widget.  Once inside the widget, the user can tab as normal.  However, the experience is augmented by the use of directional keys.

       It still makes sense to have a single keypress event bound to the document, as this will also accomodate hotkeys.

       Also: bear in mind, screen readers will usurp keypress events.
    */
    // start with all indexed content

    // then get all: a[href] button input select textarea object :visible:not(:disabled):not([tabindex])
  }

  Bindings = {
    37: {
      none: function() {}
    }

  };

  XooieKeys._selectors = {
    unindexed: ['[data-widget-type] a[href]:visible:not(:disabled):not([tabindex])',
      '[data-widget-type] button:visible:not(:disabled):not([tabindex])',
      '[data-widget-type] input:visible:not(:disabled):not([tabindex])',
      '[data-widget-type] select:visible:not(:disabled):not([tabindex])',
      '[data-widget-type] textarea:visible:not(:disabled):not([tabindex])',
      '[data-widget-type] [tabindex=0]:visible:not(:disabled)'].join(','),

    indexed: function(t) {
      if (t > 0) {
        return '[data-widget-type] [tabindex=' + t + ']:visible:not(:disabled)';
      }
    },

    allIndexed: '[data-widget-type] [tabindex]:visible:not(:disabled)'
  };

  XooieKeys._moveFocus = function() {

  };

  XooieKeys.prototype.set = function(key, method, selector){
    // set a hash of bindings
    if (helpers.isObject(key) && helpers.isUndefined(method)) {
        var k;

        for(k in key){
            if (helpers.isFunction(key[k])) {
                this.set(k, key[k]);
            }
        }

        return;
    }

    key = helpers.toInt(key);

    if (!isNaN(key) && helpers.isFunction(method)) {
        this._keybindings[key] = method;
    }
  };

  XooieKeys.prototype.call = function() {
      var key = Array.prototype.shift.apply(arguments);

      key = parseInt(key, 10);
      
      if (!isNaN(key) && !_.isUndefined(this._bindings[key])) {
          this._bindings[key].apply(this._view, arguments);
      }
  };

  keybindings = {
    
  };

/** internal
 * Xooie.Widget._moveFocus(direction)
 * - direction (Integer): Determines whether or not to increment or decrement the index.  Can be 1 or -1.
 *
 * Moves focus to either the next or previous focusable item, if available.  Focus order follows the
 * tab order of the page (items without tabindex or tabindex=0 will be focused before tabindex=1).  Focusable
 * items with a tabindex=-1 will not be focused.
 **/
  function moveFocus(current, direction) {
    // TODO: Clean this up. It's a mess
    // TODO: Write tests.
    // TODO: Add detection of new contexts
    // TODO: Add recollection of last focused item

    var selector, selectors, tabindex, index, target;

    var tabIndicies= [];

    selectors = {
      
    };

    // jquery select the current item
    current = $(current);

    // we may not be focused on anything.  If that's the case, focus on the first focusable item
    if (!current.is(selectors.unindexed) && !current.is(selectors.allIndexed)) {
      // get the lowest tabindex
      $(selectors.allIndexed).each(function(){
        var i = helpers.toInt($(this).attr('tabindex'));

        if (tabIndicies.indexOf(i) === -1 && i > 0) {
          tabIndicies.push(i);
        }
      });

      if (tabIndicies.length > 0) {
        tabIndicies.sort(function(a,b) { return a-b; });
      
        target = $(selectors.indexed(tabIndicies[0])).first();
      } else {
        target = $(selectors.unindexed).first();
      }

      if (target.length > 0) {
        target.focus();

        return;
      }
    }

    // get the current tabindex
    tabindex = helpers.toInt(current.attr('tabindex'));

    // check if tabindex is a number and not 0...
    if (!tabindex) {
      // if it is not, assume we're on an element that has no tab index and select other such elements
      selector = selectors.unindexed;
    } else {
      // otherwise, select all items that are of the same tabindex
      selector = selectors.indexed(tabindex);
    }

    // find the index of the current item
    index = current.index(selector);

    if (index + direction >= 0) {
      // get the next/previous item
      target = $(selector).eq(index + direction);

      // Check to see if we have a valid target...
      if (target.length > 0) {
        // if it is, focus the target and return
        target.focus();

        return;
      }
    }

    // if it is not, then we have several possibilities:
    
    // If the direction is 1 and tabindex is not a number or 0, then we are at the end of the tab order.  Do nothing.
    if (direction === 1 && !tabindex) {
      return;
    // If the direction is 1 and the tabindex is a number, then we need to check for the presence of the next tabindex
    } else if (direction === 1 && !isNaN(tabindex)) {
      // Loop through all elements with a tab index
      $(selectors.allIndexed).each(function() {
        // Build a collection of all tab indicies greater than the current tab index:
        var i = helpers.toInt($(this).attr('tabindex'));

        if (i > tabindex && tabIndicies.indexOf(i) === -1 && i > 0) {
          tabIndicies.push(i);
        }
      });

      // If there are tab indicies that are greater than the current one...
      if (tabIndicies.length > 0) {
        // sort our tab indicies ascending
        tabIndicies.sort(function(a, b) { return a-b; });

        // we now have our new tab index
        tabindex = tabIndicies[0];

        // Get the first item of the new tab index
        target = $(selectors.indexed(tabindex)).first();
      } else {
        // Otherwise, select the first unindexed item
        target = $(selectors.unindexed).first();
      }
      
    } else if (direction === -1 && isNaN(tabindex))  {
      // In this case, we are at the first non-indexed focusable item.  We need to find the last indexed item.
      // Loop through all elements with a tab index
      $(selectors.allIndexed).each(function() {
        var i = helpers.toInt($(this).attr('tabindex'));
        // Build a collection of all tab indicies
        if (tabIndicies.indexOf(i) === -1) {
          tabIndicies.push(i);
        }
      });

      if (tabIndicies.length > 0) {
        // sort our tab indicies descending
        tabIndicies.sort(function(a, b) { return b-a; });

        // we now have our new tab index
        tabindex = tabIndicies[0];

        // Select the last indexed item
        target = $(selectors.indexed(tabindex)).last();
      }
    } else if (direction === -1 && !isNaN(tabindex) && tabindex > 0) {
      $(selectors.allIndexed).each(function(){
        var i = helpers.toInt($(this).attr('tabindex'));

        if (i < tabindex && tabIndicies.indexOf(i) === -1 && i > 0) {
          tabIndicies.push(i);
        }
      });

      if (tabIndicies.length > 0) {
        // sort our tab indicies asceding
        tabIndicies.sort(function(a, b) { return a-b; });

        // we now have our new tab index
        tabindex = tabIndicies[0];

        // Select the last indexed item
        target = $(selectors.indexed(tabindex)).last();
      }
    }

    if (!helpers.isUndefined(target)) {
      // assuming we have a target, focus it.
      target.focus();
    }
    
  }

  var instantiated;

  keyboardNavigation = function(){
    if (instantiated) {
      return instantiated;
    }

    $(document).on('keyup', function(event) {
      if (helpers.isFunction(keybindings[event.which])) {
        keybindings[event.which](event);
      }
    });

    instantiated = this;
  };

  return keyboardNavigation;

});