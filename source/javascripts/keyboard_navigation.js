define('keyboard_navigation', ['jquery', 'xooie/helpers'], function($, helpers){
  var selectors, keyboardNavigation, keybindings;


  keybindings = {
    37: function(event) {
      var el = $(event.target);

      if (getOrientation(el) === 'horizontal') {
        moveFocus($(event.target), -1);
      }

      event.preventDefault();
    },

    38: function() {
      var el = $(event.target);

      if (getOrientation(el) === 'vertical') {
        moveFocus($(event.target), -1);
      }

      event.preventDefault();
    },

    39: function(event) {
      var el = $(event.target);

      if (getOrientation(el) === 'horizontal') {
        moveFocus($(event.target), 1);
      }

      event.preventDefault();
    },

    40: function() {
      var el = $(event.target);

      if (getOrientation(el) === 'vertical') {
        moveFocus($(event.target), 1);
      }

      event.preventDefault();
    }
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

  function getOrientation(el) {
    var parent = el.parents('[aria-orientation]:first');

    if (parent.length === 0) {
      return 'horizontal';
    } else {
      return parent.attr('aria-orientation');
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