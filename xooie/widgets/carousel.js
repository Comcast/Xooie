/*
*   Copyright 2013 Comcast
*
*   Licensed under the Apache License, Version 2.0 (the "License");
*   you may not use this file except in compliance with the License.
*   You may obtain a copy of the License at
*
*       http://www.apache.org/licenses/LICENSE-2.0
*
*   Unless required by applicable law or agreed to in writing, software
*   distributed under the License is distributed on an "AS IS" BASIS,
*   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*   See the License for the specific language governing permissions and
*   limitations under the License.
*/

/**
 * class Xooie.Carousel < Xooie.Widget
 *
 * A widget that allows users to horizontally scroll through a collection of elements.  Carousels are
 * commonly used to display a large amount of images or links in a small amount of space.  The user can
 * view more items by clicking the directional controls to scroll the content forward or backward.  If
 * the device recognizes swipe gestues (e.g. mobile or Mac OS) then swiping will also allow the user to
 * scroll content.
 * Keyboard-only users will also be able to navigate from item to item using the tab, left or right keys.
 * Screen reader users will percieve the carousel as a [list](http://www.w3.org/TR/wai-aria/roles#list) of items.
 * For most devices, the native scrollbar is hidden in favor of the directional controls and native scrolling.
 **/
define('xooie/widgets/carousel', ['jquery', 'xooie/helpers', 'xooie/widgets/base', 'xooie/event_handler'], function ($, helpers, Base, EventHandler) {
  'use strict';
  var Carousel, timers;

/**
 * Xooie.Carousel@xooie-carousel-resize(event)
 * - event (Event): A jQuery event object
 *
 * A jQuery special event triggered to indicate that the carousel instance should be resized.  This
 * by default is triggered when the window is resized.
 **/

  timers = {
    resize: null
  };

  $(window).on('resize', function () {
    if (timers.resize !== null) {
      clearTimeout(timers.resize);
      timers.resize = null;
    }
    if (Carousel._cache.length > 0) {
      // TODO: make this delay adjustable
      timers.resize = setTimeout(function () {
        Carousel._cache.trigger(Carousel.prototype.resizeEvent());
      }, 100);
    }
  });

/** internal
 * Xooie.Carousel.parseCtrlStr(ctrlStr) -> Array | undefined
 *
 * Checks the data-x-role value of a control and matches it against expected patterns to determine
 * the control commands, if any.
 * Returns an array: [Direction, Amount, Mode].
 * For example, control:right 1 item -> [right, 1, item], whereas control:right continuous returns
 * [right, undefined, continuous].
 **/
  function parseCtrlStr(ctrlStr) {
    ctrlStr = ctrlStr.toLowerCase();

    var ptrnMatch = ctrlStr.match(/^control:(left|right|goto)\s(\d+)(?:st|nd|rd|th)?\s([\w\W]*?)$/);

    if (ptrnMatch === null) {
      ptrnMatch = ctrlStr.match(/^control:(left|right)()\s(continuous)$/);
    }

    if (ptrnMatch !== null) {
      return ptrnMatch.slice(1);
    }
  }

/**
 * new Xooie.Carousel(element[, addons])
 * - element (Element | String): A jQuery-selected element or string selector for the root element of this widget
 * - addons (Array): An optional collection of [[Xooie.Addon]] classes to be instantiated with this widget
 *
 * Instantiates a new instance of a [[Xooie.Carousel]] widget.  Defines [[Xooie.Carousel#_timers]],
 * [[Xooie.Carousel#_controlEvents]], [[Xooie.Carousel#_wrapperEvents]], and [[Xooie.Carousel#cropStyle]].
 * Events are bound to the [[Xooie.Widget#root]] to call [[Xooie.Carousel#updateDimensions]] on [[Xooie.Widget@xooie-init]],
 * [[Xooie.Widget@xooie-refresh]] and [[Xooie.Carousel@xooie-carousel-resize]].
 * Carousel instances are tracked in the [[Xooie.Carousel._cache]] collection.
 **/
  Carousel = Base.extend(function () {
    var self = this;

/** internal
 * Xooie.Carousel#_timers -> Object
 *
 * A hash of all timers currently active.  If no timer is active for a particular type then the value is
 * set to undefined.
 *
 * ##### Timers
 * - **scroll** (Integer | undefined): Active while the content is being scrolled.  Prevents post-scroll functionality
 * from triggering until the carousel has completely finished scrolling.
 * - **continuous** (Integer | undefined): Active while the user is continuously scrolling using a [[Xooie.Carousel#controls]].
 **/
    this._timers = {
      scroll: 0,
      continuous: 0
    };

/** internal
 * Xooie.Carousel#_positioners -> Object
 *
 * A dispatch table containing the various methods for scrolling the carousel content.
 *
 * ##### Positioners
 * - **item**(direction, quantity): Calls [[Xooie.Carousel#scrollTo]] with the position of the item designated by the quantity.
 * - **items**(direction, quantity): alias of **item**
 * - **pixel**(direction, quantity): Calls [[Xooie.Carousel#scrollTo]] with the pixel position designated by quantity.
 * - **pixels**(direction, quantity): alias of **pixel**
 * - **px**(direction, quantity): alias of **pixel**
 **/
    this._positioners = {

      item: function (direction, quantity) {
        var items, pos, i;

        items = this.items();

        quantity = helpers.toInteger(quantity);

        if (isNaN(quantity)) {
          return;
        }

        if (direction === 'goto' && quantity > 0 && quantity <= items.length) {
          pos = Math.round(items.eq(quantity - 1).position().left) - this.contents().position().left;
        } else {
          i = this.currentItem(direction === 'right');

          direction = direction === 'left' ? -1 : 1;

          i = Math.max(0, Math.min(items.length - 1, i + (direction * quantity)));

          pos = this.wrappers().scrollLeft() + Math.round(items.eq(i).position().left);
        }

        this.scrollTo(pos);
      },

      items: function () {
        return this._positioners.item.apply(this, arguments);
      },

      pixel: function (direction, quantity) {
        var pos;

        quantity = helpers.toInteger(quantity);

        if (isNaN(quantity)) {
          return;
        }

        if (direction === 'goto' && quantity >= 0) {
          pos = quantity;
        } else {
          direction = direction === 'left' ? -1 : 1;

          pos = this.wrappers().scrollLeft() + (direction * quantity);
        }

        this.scrollTo(pos);
      },

      pixels: function () {
        return this._positioners.pixel.apply(this, arguments);
      },

      px: function () {
        return this._positioners.pixel.apply(this, arguments);
      }
    };

/** internal
 * Xooie.Carousel#continuousScroll(ctrl, direction)
 * - ctrl (Element): The control that was activated to initiate the scroll
 * - direction (String): The direction of the scroll.  Can be `left` or `right`.
 **/
    function continuousScroll(ctrl, direction) {
      clearInterval(self._timers.continuous);

      self._timers.continuous = setInterval(function (dir) {
        if (ctrl.is(':disabled')) {
          self._timers.continuous = clearInterval(self._timers.continuous);
        }

        //TODO: Need some way of setting rate
        self.scrollTo(self.wrappers().scrollLeft() + (dir * 5));
      }, 0, [direction === 'right' ? 1 : -1]);
    }

/** internal
 * Xooie.Carousel#_controlEvents -> Object
 *
 * An instance of [[Xooie.EventHandler]] that manages event handlers to be bound to the
 * [[Xooie.Carousel#controls]].
 **/
    this._controlEvents = new EventHandler(this.namespace());

    this._controlEvents.add({
      keydown: function (event) {
        var ctrl, args;

        if ([13, 32].indexOf(event.which) !== -1) {
          ctrl = $(this);
          args = parseCtrlStr(ctrl.attr('data-x-role'));

          if (args[2] === 'continuous' && !ctrl.is(':disabled')) {
            continuousScroll(ctrl, args[0]);

            event.preventDefault();
          }
        }
      },

      mousedown: function (event) {
        var ctrl, args;

        ctrl = $(this);
        args = parseCtrlStr(ctrl.attr('data-x-role'));

        if (args[2] === 'continuous' && !ctrl.is(':disabled')) {
          continuousScroll(ctrl, args[0]);

          event.preventDefault();
        }
      },

      keyup: function (event) {
        self._timers.continuous = clearInterval(self._timers.continuous);

        if ($(this).is(':disabled')) {
          return;
        }

        if ([13, 32].indexOf(event.which) !== -1) {
          var args = parseCtrlStr($(this).attr('data-x-role'));

          if (helpers.isFunction(self._positioners[args[2]])) {
            self._positioners[args[2]].apply(self, args);
          }

          event.preventDefault();
        }
      },

      mouseup: function (event) {
        self._timers.continuous = clearInterval(self._timers.continuous);

        if ($(this).is(':disabled')) {
          return;
        }

        var args = parseCtrlStr($(this).attr('data-x-role'));

        if (helpers.isFunction(self._positioners[args[2]])) {
          self._positioners[args[2]].apply(self, args);
        }

        event.preventDefault();
      },

      mouseleave: function () {
        self._timers.continuous = clearInterval(self._timers.continuous);
      },

      blur: function () {
        self._timers.continuous = clearInterval(self._timers.continuous);
      }
    });

    function scrollComplete() {
      self._timers.scroll = clearTimeout(self._timers.scroll);

      self.updateLimits();
    }

/** internal
 * Xooie.Carousel#_wrapperEvents -> Object
 *
 * An instance of [[Xooie.EventHandler]] that manages event handlers to be bound to the
 * [[Xooie.Carousel#wrappers]].
 **/
    this._wrapperEvents = new EventHandler(this.namespace());

    this._wrapperEvents.add('scroll', function () {
      if (self._timers.scroll) {
        self._timers.scroll = clearTimeout(self._timers.scroll);
      } else {
        self.root().removeClass(self.leftClass() + ' ' + self.rightClass());

        self.controls().prop('disabled', false);
      }

      // TODO: make this delay adjustable
      self._timers.scroll = setTimeout(scrollComplete, 250);
    });

    this.cropStyle(Carousel.createStyleRule('.' + this.instanceClass() + ' .' + this.cropClass() + ', .' + this.instanceClass() + '.' + this.cropClass(), {'height': 'auto'}));

    // TODO: add functionality to remove from cache
    Carousel._cache = Carousel._cache.add(this.root());

    this.root().on([
      this.get('initEvent'),
      this.get('refreshEvent'),
      this.get('resizeEvent')].join(' '),
      function () {
        self.updateDimensions();
      });

  });

/** internal
 * Xooie.Carousel._cache -> jQuery
 *
 * A jQuery collection that keeps track of currently instantiated carousel instances.  This collection
 * is primarily used during a window resize event, where the limits and dimensions are recalculated.
 **/
  Carousel._cache = $();

/** internal
 * Xooie.Carousel#_namespace -> String
 *
 * See [[Xooie.Widget#_namespace]]
 * Default: `carousel`.
 **/
/**
 * Xooie.Carousel#namespace([value]) -> String
 * - value: an optional value to be set.
 *
 * See [[Xooie.Widget#namespace]]
 **/
  Carousel.define('namespace', 'carousel');

/** internal
 * Xooie.Carousel#_isScrolling -> Boolean
 *
 * A value that determines whether or not the carousel is currently scrolling
 * TODO:  Perhaps depricate this in favor of scroll timer detection
 * Default: `false`.
 **/
/**
 * Xooie.Carousel#isScrolling([value]) -> String
 * - value: an optional value to be set.
 *
 **/
  Carousel.define('isScrolling', false);

/** internal
 * Xooie.Carousel#_visibleThreshold -> Integer
 *
 * Default: `0.5`.
 **/
/**
 * Xooie.Carousel#visibleThreshold([value]) -> Integer
 * - value: an optional value to be set.
 *
 **/
  Carousel.define('visibleThreshold', 0.5);

/** internal
 * Xooie.Carousel#_cropStyle -> cssRule
 *
 * Default: `carousel`.
 **/
/**
 * Xooie.Carousel#cropStyle([value]) -> cssRule
 * - value: an optional value to be set.
 *
 **/
  Carousel.define('cropStyle');

/** internal, read-only
 * Xooie.Carousel#_resizeEvent -> String
 *
 * Default: `xooie-carousel-resize`.
 **/
/**
 * Xooie.Carousel#resizeEvent() -> String
 *
 **/
  Carousel.defineReadOnly('resizeEvent', 'xooie-carousel-resize');

/** internal, read-only
 * Xooie.Carousel#_wrapperClass -> String
 *
 * Default: `xooie-carousel-wrapper`.
 **/
/**
 * Xooie.Carousel#wrapperClass() -> String
 *
 **/
  Carousel.defineReadOnly('wrapperClass', 'xooie-carousel-wrapper');

/** internal, read-only
 * Xooie.Carousel#_cropClass -> String
 *
 * Default: `xooie-carousel-crop`.
 **/
/**
 * Xooie.Carousel#cropClass() -> String
 *
 **/
  Carousel.defineReadOnly('cropClass', 'xooie-carousel-crop');

/** internal, read-only
 * Xooie.Carousel#_contentClass -> String
 *
 * Default: `xooie-carousel-content`.
 **/
/**
 * Xooie.Carousel#contentClass() -> String
 *
 **/
  Carousel.defineReadOnly('contentClass', 'xooie-carousel-content');

/** internal, read-only
 * Xooie.Carousel#_controlClass -> String
 *
 * Default: `xooie-carousel-control`.
 **/
/**
 * Xooie.Carousel#controlClass() -> String
 *
 **/
  Carousel.defineReadOnly('controlClass', 'xooie-carousel-control');

/** internal, read-only
 * Xooie.Carousel#_leftClass -> String
 *
 * Default: `is-left-limit`.
 **/
/**
 * Xooie.Carousel#leftClass() -> String
 *
 **/
  Carousel.defineReadOnly('leftClass', 'is-left-limit');

/** internal, read-only
 * Xooie.Carousel#_rightClass -> String
 *
 * Default: `is-right-limit`.
 **/
/**
 * Xooie.Carousel#rightClass() -> String
 *
 **/
  Carousel.defineReadOnly('rightClass', 'is-right-limit');

// ROLE DEFINITIONS

/**
 * Xooie.Carousel#wrapper() -> Elements
 *
 *
 **/
  Carousel.defineRole('wrapper');

/**
 * Xooie.Carousel#content() -> Elements
 *
 * This role maps to the ARIA [tab list](http://www.w3.org/TR/wai-aria/roles#list)
 **/
  Carousel.defineRole('content');

/**
 * Xooie.Carousel#item() -> Elements
 *
 * This role maps to the ARIA [listitem role](http://www.w3.org/TR/wai-aria/roles#listitem)
 **/
  Carousel.defineRole('item');

/**
 * Xooie.Carousel#control() -> Elements
 *
 * Controls allow the user to scroll the carousel.  The behavior of this scrolling is determined by
 * the role itself.  Behavior is set using the `data-x-role` attribute: `data-x-role="control:<direction> <quantity> <mode>"`.
 * The `direction` value indicates which direction the carousel should be moved: `right`, `left`, or `goto`.
 * The special `goto` value signifies that the control should scroll to a fixed position.
 * The control syntax is designed to accept somewhat natural language.  Therefore, plurals and n-aries can be used to
 * describe the behavior.  For example, you can use the following strings: `control:right 2 items`, `control:left 30 pixels`,
 * `control:goto 5th item`.
 **/
  Carousel.defineRole('control');

// STYLE DEFINITIONS

  Carousel.createStyleRule('.' + Carousel.prototype.wrapperClass(), {
    position: 'relative',
    'overflow-x': 'scroll',
    'overflow-y': 'hidden'
  });

  Carousel.createStyleRule('.' + Carousel.prototype.cropClass(), {
    'overflow-y': 'hidden'
  });

  Carousel.createStyleRule('.' + Carousel.prototype.contentClass(), {
    display: 'table-cell',
    'white-space': 'nowrap',
    'font-size': '0px',
    'transition': 'left 0.5s'
  });

  Carousel.createStyleRule('ul.' + Carousel.prototype.contentClass(), {
    'list-style': 'none',
    'padding': 0,
    'margin': 0
  });

  Carousel.createStyleRule('.' + Carousel.prototype.contentClass() + ' > *', {
    display: 'inline-block',
    zoom: '1',
    '*display': 'inline',
    'font-size': '1em'
  });

  Carousel.createStyleRule('.' + Carousel.prototype.leftClass() + '.' + Carousel.prototype.rightClass() + ' [data-x-role^="control:left"]' + ', .' + Carousel.prototype.leftClass() + '.' + Carousel.prototype.rightClass() + ' [data-x-role^="control:right"]', {
    display: 'none'
  });

/**
 * Xooie.Carousel#currentItem(biasRight) -> Integer
 * - biasRight (Boolean): If true, calculates the current item from the right side of the carousel.
 *
 * Returns the index of the first visible item.  The value of [[Xooie.Carousel#visibleThreshold]] determines what
 * percentage of the item must be showing to be considered visible.
 **/
  Carousel.prototype.currentItem = function (biasRight) {
    var content, items, position, itemWidth, i;

    content = this.contents();
    items = this.items();

    if (biasRight) {
      position = content.outerWidth(true) + content.position().left;

      for (i = items.length - 1; i > 0; i -= 1) {
        itemWidth = items.eq(i).outerWidth(true);
        position -= itemWidth;

        if (i > 0 && position <= this.visibleThreshold() * itemWidth) {
          return i;
        }
      }
      return 0;
    }

    position = content.position().left;

    for (i = 0; i < items.length - 1; i += 1) {
      itemWidth = items.eq(i).outerWidth(true);

      if (position + this.visibleThreshold() * itemWidth >= 0) {
        return i;
      }
      position += itemWidth;
    }

    return items.length - 1;
  };

/**
 * Xooie.Carousel#isLeft() -> Boolean
 *
 * Indicates if the carousel is scrolled completely to the left.
 **/
  Carousel.prototype.isLeft = function () {
    return this.wrappers().scrollLeft() === 0;
  };

/**
 * Xooie.Carousel#isRight() -> Boolean
 *
 * Indicates if the carousel is scrolled completely to the right.
 **/
  Carousel.prototype.isRight = function () {
    var lastItem, position;

    try {
      lastItem = this.items().filter(':visible:last');
      position = lastItem.position();

      if (position && !helpers.isUndefined(position.left)) {
        return Math.floor(position.left) + lastItem.outerWidth(true) <= this.wrappers().innerWidth();
      }
    } catch (e) {
      return false;
    }

    return false;
  };

/**
 * Xooie.Carousel#updateDimensions()
 *
 * Updates the height of the carousel based on the height of the tallest visible item in the carousel.
 * The new height is applied to the [[Xooie.Carousel#cropStyle]] rule rather than the cropping element
 * itself.  This allows developers to use cascade rules to override the height if they so choose.
 **/
  Carousel.prototype.updateDimensions = function () {
    var height = 0;

    this.items().each(function () {
      height = Math.max(height, $(this).outerHeight(true));
    });

    //set the height of the wrapper's parent (or cropping element) to ensure we hide the scrollbar
    this.cropStyle().style.height = height + 'px';

    this.updateLimits();
  };

/**
 * Xooie.Carousel#updateLimits()
 *
 * Updates the state of the carousel based on whether or not it is scrolled completely to the left or the right.
 * If the carousel is scrolled completely to the left then the [[Xooie.Carousel#leftClass]] is applied to the
 * [[Xooie.Widget#root]] and the left [[Xooie.Carousel#controls]] is disabled.  If the carousel is scrolled
 * completely to the left then the [[Xooie.Carousel#rightClass]] is applied to the [[Xooie.Widget#root]] and the
 * right [[Xooie.Carousel#controls]] is disabled.
 **/
  Carousel.prototype.updateLimits = function () {
    var isLeft, isRight;

    isLeft = this.isLeft();
    isRight = this.isRight();

    this.root().toggleClass(this.leftClass(), isLeft);
    this.controls().filter('[data-x-role^="control:left"]')
                   .prop('disabled', isLeft);

    this.root().toggleClass(this.rightClass(), isRight);
    this.controls().filter('[data-x-role^="control:right"]')
                   .prop('disabled', isRight);
  };

/**
 * Xooie.Carousel#scrollTo(pos, cb)
 * - pos (Integer): The position to which the carousel will be scrolled.
 * - cb (Function): A callback function that is called when the animation is complete.
 *
 * Uses the jQuery animate functionality to scroll the carousel to the designated position.
 **/
  Carousel.prototype.scrollTo = function (pos, cb) {
    var self = this;

    pos = Math.floor(pos);

    if (this.isScrolling) {
      this.wrappers().stop(true, true);
    }

    this.isScrolling = true;

    // TODO: make the scroll timer configurable
    this.wrappers().animate({ scrollLeft: pos }, 200,
      function () {
        self.isScrolling = false;
        if (helpers.isFunction(cb)) {
          cb();
        }
      });
  };

/** internal
 * Xooie.Carousel#_process_role_content(content) -> Element
 * - content (Element): A jQuery-selected collection of [[Xooie.Carousel#contents]]
 *
 * This method processes the element that has been designated as a [[Xooie.Carousel#contents]].
 * In addition to applying the [[Xooie.Carousel#contentClass]] the content is also given the
 * aria role [list](http://www.w3.org/TR/wai-aria/roles#list) if it is neither a `ul` or `ol` element.
 **/
  Carousel.prototype._process_role_content = function (content) {
    content.addClass(this.contentClass());

    if (!content.is('ul,ol')) {
      content.attr('role', 'list');
    }

    return content;
  };

/** internal
 * Xooie.Carousel#_render_role_wrapper() -> Element
 *
 * Renders a `div` tag that is wrapped around the [[Xooie.Carousel#contents]].  This element is
 * rendered only if no other [[Xooie.Carousel#wrappers]] is present as a decendant of the root of this
 * widget.
 **/
  Carousel.prototype._render_role_wrapper = function () {
    var wrapper = $('<div data-x-role="wrapper" />');

    this.contents().wrap(wrapper);

    return this.contents().parent();
  };

/** internal
 * Xooie.Carousel#_process_role_wrapper(wrapper) -> Element
 * - wrapper (Element): A jQuery-selected collection of [[Xooie.Carousel#wrappers]]
 *
 * This method processes the element that has been designated as a [[Xooie.Carousel#wrappers]].
 * The [[Xooie.Carousel#wrapperClass]] is added and the [[Xooie.Carousel#_wrapperEvents]] handlers are
 * bound.  Also, the [[Xooie.Carousel#cropClass]] is added to this element's parent.
 **/
  Carousel.prototype._process_role_wrapper = function (wrapper) {
    wrapper.addClass(this.wrapperClass())
           .on(this._wrapperEvents.handlers)
           .parent().addClass(this.cropClass());

    return wrapper;
  };

/** internal
 * Xooie.Carousel#_get_role_item() -> Element
 *
 * Gets all children of [[Xooie.Carousel#contents]].
 **/
  Carousel.prototype._get_role_item = function () {
    return this.contents().children();
  };

/** internal
 * Xooie.Carousel#_get_role_control() -> Element
 *
 * TODO: Test and document
 **/
  Carousel.prototype._get_role_control = function () {
    return this.root().find('[data-x-role^="control"]');
  };

/** internal
 * Xooie.Carousel#_process_role_control() -> Element
 *
 **/
  Carousel.prototype._process_role_control = function (controls) {
    controls.on(this._controlEvents.handlers);

    controls.attr('aria-hidden', true)
            .addClass(this.controlClass());

    return controls;
  };

/** internal
 * Xooie.Carousel#_process_resizeEvent() -> String
 *
 * Adds the [[Xooie.Widget#namespace]] to the `resizeEvent` string.
 **/
  Carousel.prototype._process_resizeEvent = function (resizeEvent) {
    return this.namespace() === '' ? resizeEvent : resizeEvent + '.' + this.namespace();
  };

  return Carousel;
});