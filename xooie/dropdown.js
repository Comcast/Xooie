/*
*   Copyright 2012 Comcast
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

define(['jquery', 'xooie/base'], function($, Base) {

    var parseWhich = function(which) {
        if (typeof which === 'string') {
            which = which.split(',');
            return which.map(function(string){ return parseInt(string, 10); });
        } else if (typeof which === 'number') {
            return [which];
        }

        return which;
     };

    var Dropdown = Base('dropdown', function() {
        var self = this,
            handles = self.getHandle(),
            expanders = self.getExpander();

        this.handlers = {
            off: function(event){
                if ((typeof event.data.not !== 'undefined' && ($(event.data.not).is($(this)) || $(event.target).parents(event.data.not).length > 0)) || (typeof event.data.which !== 'undefined' && event.data.which.indexOf(event.which) === -1) || ($(event.target).is(self.getExpander(event.data.index)) || $(event.target).parents(self.options.dropdownExpanderSelector).length > 0) && !$(event.target).is($(this))) {
                    return true;
                }

                event.preventDefault();

                self.collapse(event.data.index, event.data);
            },

            on: function(event){
                var index = event.data.index || parseInt($(this).attr('data-dropdown-index'), 10),
                    delay = event.data.delay,
                    handle = $(this);

                if ((typeof event.data.not !== 'undefined' && ($(event.data.not).is($(this)) || $(event.target).parents(event.data.not).length > 0)) || typeof event.data.which !== 'undefined' && event.data.which.indexOf(event.which) === -1) {
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

        handles.on('dropdownExpand', function(event, index){
            self.removeHandlers('on', index);

            self.addHandlers('off', index);

            $(this).attr('aria-selected', true);
        });

        handles.on('dropdownCollapse', function(event, index){
            self.removeHandlers('off', index);

            self.addHandlers('on', index);

            $(this).attr('aria-selected', false);
        });

        handles.each(function(index){
            var handle = $(this),
                expander = expanders.eq(index);


            handle.attr({
                'data-dropdown-index': index,
                'aria-selected': false
            });
            expander.attr('data-dropdown-index', index);
        });

        expanders.on('mouseover focus', function(){
            var index = parseInt($(this).attr('data-dropdown-index'), 10);

            if (self.timers.collapse[index]){
                self.timers.collapse[index] = clearTimeout(self.timers.collapse[index]);

                $(this).on('mouseleave blur', {index: index}, function(event){
                    self.collapse(event.data.index, 0);
                    $(this).unbind(event);
                });
            }
        });

    });

    Dropdown.setDefaultOptions({
        dropdownHandleSelector: '[data-role="dropdown-handle"]',
        dropdownExpanderSelector: '[data-role="dropdown-content"]',

        activeDropdownClass: 'is-dropdown-active',

        throttleDelay: 300,
        triggers: {
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
        }

    });

    Dropdown.prototype.getTriggerHandle = function(triggerData, index){
        var handles = this.getHandle(index);

        if (triggerData.selector) {
            return triggerData.selector === 'document' ? $(document) : $(triggerData.selector);
        } else {
            return handles;
        }
    };

    Dropdown.prototype.addHandlers = function(state, index){
        var trigger, handle, triggerData, countName;

        triggerData = this.options.triggers[state];

        for (trigger in triggerData) {
            if (typeof triggerData[trigger].which !== 'undefined') {
                triggerData[trigger].which = parseWhich(triggerData[trigger].which);
            }

            countName = [trigger,state,'count'].join('-');

            handle = this.getTriggerHandle(triggerData[trigger], index);

            handle.data(countName, handle.data(countName) + 1 || 1);

            handle.on(trigger, $.extend({delay: 0, index: index}, triggerData[trigger]), this.handlers[state]);
        }
    };

    Dropdown.prototype.removeHandlers = function(state, index){
        var trigger, handle, triggerData, countName, eventCount;

        triggerData = this.options.triggers[state];

        for (trigger in triggerData) {
            handle = this.getTriggerHandle(triggerData[trigger], index);

            countName = [trigger,state,'count'].join('-');

            eventCount = handle.data(countName) - 1;

            if (eventCount <= 0) {
                handle.unbind(trigger, this.handlers[state]);

                handle.data(countName, 0);
            } else {
                handle.data(countName, eventCount);
            }
        }
    };

    Dropdown.prototype.getHandle = function(index){
        var handles = this.root.find(this.options.dropdownHandleSelector);

        return (typeof index !== 'undefined' && index >= 0) ? handles.eq(index) : handles;
    };

    Dropdown.prototype.getExpander = function(index){
        var expanders = this.root.find(this.options.dropdownExpanderSelector);

        return (typeof index !== 'undefined' && index >= 0) ? expanders.eq(index) : expanders;
    };

    Dropdown.prototype.setState = function(index, data, active){
        if (typeof index === 'undefined' || isNaN(index)) {
            return;
        }

        var state = active ? 'expand' : 'collapse',
            counterState = active ? 'collapse' : 'expand',
            delay = data.delay;

        this.timers[counterState][index] = clearTimeout(this.timers[counterState][index]);

        if (this.timers.throttle[index] || this.timers[state][index]) {
            return;
        }

        this.timers[state][index] = setTimeout(function(i, _state, _active, _data) {
            var expander = this.getExpander(i),
                handle = this.getHandle(i),
                self = this;

            this.timers[_state][i] = clearTimeout(this.timers[_state][i]);

            expander.toggleClass(this.options.activeDropdownClass, _active);
            this.getHandle(i).toggleClass(this.options.activeDropdownClass, _active);

            if (_active){
                handle.trigger('dropdownExpand', [i, _data]);
                this.setFocus(expander);
            } else {
                handle.trigger('dropdownCollapse', [i, _data]);
            }

            if (this.options.throttleDelay > 0){
                this.timers.throttle[i] = setTimeout(function(){
                    self.timers.throttle[i] = clearTimeout(self.timers.throttle[i]);
                }, this.options.throttleDelay);
            }

        }.bind(this, index, state, active, data), delay);
    };

    Dropdown.prototype.expand = function(index, data) {
        if (!this.getHandle(index).hasClass(this.options.activeDropdownClass)) {
            this.setState(index, data, true);
        }
    };

    Dropdown.prototype.collapse = function(index, data) {
        if (this.getHandle(index).hasClass(this.options.activeDropdownClass)) {
            this.setState(index, data, false);
        }
    };

    Dropdown.prototype.setFocus = function(element){
        element.find('a,input,textarea,button,select,iframe,[tabindex][tabindex!=-1]')
               .first()
               .focus();
    };

    return Dropdown;
});
