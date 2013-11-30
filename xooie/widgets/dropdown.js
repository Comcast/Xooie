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

/** deprecated: 1.0
 * class Xooie.Dropdown < Xooie.Widget
 *
 * A widget used to hide and show content.
 * As of v1.0 this widget has been deprecated.  Use the more semantically appropriate
 * [[Xooie.Tooltip]], [[Xooie.Menu]], [[Xooie.Tab]], or [[Xooie.Accordion]] classes instead.
 **/
define('xooie/widgets/dropdown', ['jquery', 'xooie/widgets/base', 'xooie/helpers'], function ($, Base, helpers) {
  'use strict';

  function parseWhich(which) {
    if (typeof which === 'string') {
      which = which.split(',');
      return which.map(function (string) { return parseInt(string, 10); });
    }

    if (typeof which === 'number') {
      return [which];
    }

    return which;
  }

/**
* Xooie.Dropdown(element[, addons])
* - element (Element | String): A jQuery-selected element or string selector for the root element of this widget
* - addons (Array): An optional collection of [[Xooie.Addon]] classes to be instantiated with this widget
*
* Instantiates a new Dropdown widget.  Creates event handlers to manage activating and deactivating the expanders.
* Also adds methods to manipulate aria roles.
**/
  var Dropdown = Base.extend(function () {
    var self, handles, expanders;

    self = this;
    handles = self.getHandle();
    expanders = self.getExpander();

    this.handlers = {
      off: function (event) {
        var check = false;

        if (!helpers.isUndefined(event.data.not)) {
          check = $(event.data.not).is($(this)) || $(event.target).parents(event.data.not).length > 0;
        }

        if (!helpers.isUndefined(event.data.which)) {
          check = check || event.data.which.indexOf(event.which) === -1;
        }

        check = check || ($(event.target).is(self.getExpander(event.data.index)) || $(event.target).parents(self.dropdownExpanderSelector()).length > 0);
        check = check && !$(event.target).is($(this));

        if (check) {
          return true;
        }

        event.preventDefault();

        self.collapse(event.data.index, event.data);
      },

      on: function (event) {
        var index, check;

        index = event.data.index || parseInt($(this).attr('data-dropdown-index'), 10);

        if (!helpers.isUndefined(event.data.not)) {
          check = $(event.data.not).is($(this));
          check = check || $(event.target).parents(event.data.not).length > 0;
        }

        check = check || (!helpers.isUndefined(event.data.which) && event.data.which.indexOf(event.which) === -1);

        if (check) {
          return true;
        }

        event.preventDefault();

        self.expand(index, event.data);
      }
    };

    this.timers = {
      expand: [],
      collapse: [],
      throttle: []
    };

    this.addHandlers('on');

    this.root().on({
      dropdownExpand: function (event, index) {
        self.removeHandlers('on', index);

        self.addHandlers('off', index);

        $(this).attr('aria-selected', true);
        self.getExpander(index).attr('aria-hidden', false);

        event.preventDefault();
      },

      dropdownCollapse: function (event, index) {
        self.removeHandlers('off', index);

        self.addHandlers('on', index);

        $(this).attr('aria-selected', false);
        self.getExpander(index).attr('aria-hidden', true);

        event.preventDefault();
      }
    }, this.dropdownHandleSelector());

    this.root().on('xooie-init.dropdown xooie-refresh.dropdown', function () {
      handles.each(function (index) {
        var handle, expander;

        handle = $(this);
        expander = expanders.eq(index);

        handle.attr({
          'data-dropdown-index': index,
          'aria-selected': false
        });
        expander.attr({
          'data-dropdown-index': index,
          'aria-hidden': true
        });
      });
    });

    expanders.on('mouseover focus', function () {
      var index = parseInt($(this).attr('data-dropdown-index'), 10);

      if (self.timers.collapse[index]) {
        self.timers.collapse[index] = clearTimeout(self.timers.collapse[index]);

        $(this).on('mouseleave blur', {index: index}, function (event) {
          self.collapse(event.data.index, 0);
          $(this).unbind(event);
        });
      }
    });
  });

  Dropdown.define('namespace', 'dropdown');

  Dropdown.define('throttleDelay', 300);

  Dropdown.define('triggers', {
    on: {
      focus: {
        delay: 0
      }
    },
    off: {
      blur: {
        delay: 0
      }
    }
  });

  Dropdown.defineReadOnly('dropdownHandleSelector', '[data-role="dropdown-handle"]');

  Dropdown.defineReadOnly('dropdownExpanderSelector', '[data-role="dropdown-content"]');

  Dropdown.defineReadOnly('activeDropdownClass', 'is-dropdown-active');

  Dropdown.prototype.getTriggerHandle = function (triggerData, index) {
    var handles = this.getHandle(index);

    if (triggerData.selector) {
      return triggerData.selector === 'document' ? $(document) : $(triggerData.selector);
    }
    return handles;
  };

  Dropdown.prototype.addHandlers = function (state, index) {
    var trigger, handle, triggerData, countName;

    triggerData = this.triggers()[state];

    for (trigger in triggerData) {
      if (triggerData.hasOwnProperty(trigger)) {
        if (!helpers.isUndefined(triggerData[trigger].which)) {
          triggerData[trigger].which = parseWhich(triggerData[trigger].which);
        }

        countName = [trigger, state, 'count'].join('-');

        handle = this.getTriggerHandle(triggerData[trigger], index);

        handle.data(countName, handle.data(countName) + 1 || 1);

        handle.on(trigger, $.extend({delay: 0, index: index}, triggerData[trigger]), this.handlers[state]);
      }
    }
  };

  Dropdown.prototype.removeHandlers = function (state, index) {
    var trigger, handle, triggerData, countName, eventCount;

    triggerData = this.triggers()[state];

    for (trigger in triggerData) {
      if (triggerData.hasOwnProperty(trigger)) {
        handle = this.getTriggerHandle(triggerData[trigger], index);

        countName = [trigger, state, 'count'].join('-');

        eventCount = handle.data(countName) - 1;

        if (eventCount <= 0) {
          handle.unbind(trigger, this.handlers[state]);

          handle.data(countName, 0);
        } else {
          handle.data(countName, eventCount);
        }
      }
    }
  };

  Dropdown.prototype.getHandle = function (index) {
    var handles = this.root().find(this.dropdownHandleSelector());

    return (!helpers.isUndefined(index) && index >= 0) ? handles.eq(index) : handles;
  };

  Dropdown.prototype.getExpander = function (index) {
    var selectorString;

    if (helpers.isUndefined(index) || isNaN(index)) {
      selectorString = this.dropdownExpanderSelector();
    } else {
      selectorString = this.dropdownExpanderSelector() + '[data-dropdown-index="' + index + '"]';
    }

    return this.root().find(selectorString);
  };

  Dropdown.prototype.setState = function (index, data, active) {
    if (helpers.isUndefined(index) || isNaN(index)) {
      return;
    }

    var state, counterState, delay;

    state = active ? 'expand' : 'collapse';
    counterState = active ? 'collapse' : 'expand';
    delay = data.delay;

    this.timers[counterState][index] = clearTimeout(this.timers[counterState][index]);

    if (this.timers.throttle[index] || this.timers[state][index]) {
      return;
    }

    this.timers[state][index] = setTimeout(function (i, _state, _active, _data) {
      var expander, handle, self;

      expander = this.getExpander(i);
      handle = this.getHandle(i);
      self = this;

      this.timers[_state][i] = clearTimeout(this.timers[_state][i]);

      expander.toggleClass(this.activeDropdownClass(), _active);
      this.getHandle(i).toggleClass(this.activeDropdownClass(), _active);

      if (_active) {
        handle.trigger('dropdownExpand', [i, _data]);
      } else {
        handle.trigger('dropdownCollapse', [i, _data]);
      }

      if (this.throttleDelay() > 0) {
        this.timers.throttle[i] = setTimeout(function () {
          self.timers.throttle[i] = clearTimeout(self.timers.throttle[i]);
        }, this.throttleDelay());
      }

    }.bind(this, index, state, active, data), delay);
  };

  Dropdown.prototype.expand = function (index, data) {
    if (!this.getHandle(index).hasClass(this.activeDropdownClass())) {
      this.setState(index, data, true);
    }
  };

  Dropdown.prototype.collapse = function (index, data) {
    if (this.getHandle(index).hasClass(this.activeDropdownClass())) {
      this.setState(index, data, false);
    }
  };

  return Dropdown;
});