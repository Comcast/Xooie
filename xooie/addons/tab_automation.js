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

define(['jquery', 'xooie/addons/base'], function($, Base) {
    var outOfRange = function(lower, upper, point, normalize) {
        var n = ( Math.min(lower, point) - lower ) || ( Math.max(upper, point) - upper );
        var denominator = (normalize) ? Math.max(Math.abs(n),1) : 1;
        return n/denominator;
    };


    var Automation = Base('automation', function(){
        var self = this,
            focusTable = {},
            setFocus;

        this._tabChangeTimer = 0;

        this._canRotate = true;

        //automationInstances.push(this);

        setFocus = function(method, state) {
            var prop;

            focusTable[method] = state;

            if (state) {
                for (prop in focusTable) {
                    state = state && focusTable[prop];
                }
            }

            self._canRotate = state;
        };

        this.module.root.on({
            'mouseenter': function(){
                setFocus('mouse', false);
                self.stop();
            },
            'focus': function(){
                setFocus('keyboard', false);
                self.stop();
            },
            'mouseleave': function(){
                setFocus('mouse', true);
                self.start();
            },
            'blur': function(){
                setFocus('mouse', true);
                self.start();
            },
            'tabChange': function(){
                self.start();
            }
        });

        this.module.root.find('*').on({
           'focus': function(){
                setFocus('keyboard', false);
                self.stop();
            },
            'blur': function(){
                setFocus('keyboard', true);
                self.start();
            }
        });

        this.start();
    });

    Automation.setDefaultOptions({
        direction: 1,
        delay: 10000
    });

    $.extend(Automation.prototype, {
        start: function(){
            var self = this;

            if (this._tabChangeTimer) {
                this.stop();
            }

            this._tabChangeTimer = setTimeout(function(){
                self.stop();

                if (!self._canRotate){
                    return;
                }

                if (self.outOfRange()) {
                    $(window).on('scroll', function(event){
                        if (!self.outOfRange()) {
                            self.start();
                            $(window).off(event);
                        }
                        //TODO: add logic to remove scroll event if the elementis no longer in the DOM
                    });
                    return;
                }

                var newTab;

                if (self.module._currentTab + self.options.direction >= self.module.getPanel().length) {
                    newTab = 0;
                } else if (self.module._currentTab + self.options.direction < 0) {
                    newTab = self.module.getPanel().length - 1;
                } else {
                    newTab = self.module._currentTab + self.options.direction;
                }

                self.module.switchToTab(newTab);
            }, this.options.delay);

        },

        stop: function() {
            this._tabChangeTimer = clearTimeout(this._tabChangeTimer);
        },

        //Will return true if the tab module is out of range (ie, both the top and bottom are out of range)
        outOfRange: function(){
            var lower, upper, top, bottom;

            lower = $(window).scrollTop();
            upper = lower + $(window).height();
            top = this.module.root.offset().top;
            bottom = top + this.module.root.outerHeight(true);

            return !!(outOfRange(lower, upper, top, true) && outOfRange(lower, upper, bottom, true));
        }
    });

    return Automation;
});
