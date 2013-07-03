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

define('xooie/carousel', ['jquery', 'xooie/base'], function($, Base) {

    var resizeTimer = null,
        carouselElements = $(),
        clickQueue = [],
        cssRules = {},
        cache;

    $(window).on('resize', function() {
        if (resizeTimer) {
            clearTimeout(resizeTimer);
            resizeTimer = null;
        }
        if (carouselElements) {
            resizeTimer = setTimeout(function() {
                carouselElements.trigger('carouselResize');
            }, 100);
        }
    });

    var Carousel = Base('carousel', function() {
        var self = this,
            scrollTimer,
            onClick, onScroll, onScrollComplete;

        this.isScrolling = false;

        //Define the dispatch tables for various functionality:
        this.positionUpdaters = {

            "item": function(quantity, direction) {
                var items = self.content.children(),
                    bias, offset,
                    position = self.wrapper.scrollLeft(),
                    i;

                if (typeof direction === 'undefined') {
                    if (quantity > 0 && quantity <= items.length) {
                        offset = Math.round(items.eq(quantity - 1).position().left);
                    }
                } else {
                    direction = direction === -1 ? -1 : 1;

                    bias = -direction;

                    if (!quantity || typeof quantity !== 'number') {
                        quantity = 1;
                    }

                    i = self.currentItem(bias) + direction * quantity;
                    i = Math.max(0, Math.min(items.length - 1, i));
                    offset = Math.round(items.eq(i).position().left);
                }

                return position + offset;
            },

            "px": function(quantity, direction) {
                var position;
                
                if (typeof direction === 'undefined') {
                    position = 0;
                    direction = 1;
                } else {
                    position = self.wrapper.scrollLeft();
                }
                return position + direction * quantity;
            }

        };

        this.snapMethods = {

            "item": function(){
                var items = self.content.children(),
                    offset, p1, p2,
                    i = self.currentItem();

                p1 = items.eq(i).position().left;
                if (Math.abs(p1) < 1) {
                    p1 = p1 < 0 ? Math.ceil(p1) : Math.floor(p1);
                } else {
                    p1 = Math.round(p1);
                }

                if (p1 !== 0 && i > 0) {
                    p2 = items.eq(i - 1).position().left;
                    if (Math.abs(p2) < 1) {
                        p2 = p2 < 0 ? Math.ceil(p2) : Math.floor(p2);
                    } else {
                        p2 = Math.round(p2);
                    }

                    if (Math.abs(p1) < Math.abs(p2)) {
                        offset = p1 + self.wrapper.scrollLeft();
                    } else {
                        offset = p2 + self.wrapper.scrollLeft();
                    }

                    self.wrapper.animate({ scrollLeft: offset });
                }

            }

        };

        this.displayMethods = {
            "item": function(container, template){
                var element, item, items, lastVisible, rightPosition, i;

                items = self.content.children();
                currentItem = self.currentItem();
                rightPosition = items.eq(currentItem).position().left + self.wrapper.innerWidth();
                lastVisible = items.length;

                for (i = currentItem; i < items.length; i += 1) {
                    item = items.eq(i);
                    if (Math.floor(item.position().left) + item.outerWidth() * self.options.visibleThreshold >= rightPosition) {
                        lastVisible = i;
                        break;
                    }
                }

                element = self.render(template, {
                    current_item: currentItem + 1,
                    last_visible_item: lastVisible,
                    total_items: items.length
                });

                container.append(element);
            }
        };

        //select the content area and wrap it in a container
        this.content = this.root.find(this.options.contentSelector);
        this.content.wrap('<div/>');

        this.wrapper = this.content.parent();
        this.wrapper.addClass('xooie-carousel-wrapper');

        //setting the wrapper's parent to overflow-y=hidden allows us to hide the horizontal scrollbar
        this.wrapper.parent().addClass('xooie-carousel-crop');

        this.cssRules.heightAdjust = this.stylesheet.addRule('.carousel-' + this.root.data('carousel-instance') + ' .xooie-carousel-crop');

        this.content.addClass('xooie-carousel-content');

        this.content.children().addClass('xooie-carousel-item');

        this.root.find(this.options.controlSelector)
                 .on('click', function(event){
                    event.preventDefault();

                    self.updatePosition($(this).data('scroll'));
                 });

        onScrollComplete = function() {
            self.snap();
            self.root.trigger('carouselScrollComplete');
        };

        onScroll = function(){
            if (scrollTimer) {
                scrollTimer = clearTimeout(scrollTimer);
            } else {
                self.root.removeClass('is-carousel-leftmost is-carousel-rightmost');
            }

            scrollTimer = setTimeout(onScrollComplete, 250);
        };

        this.wrapper.on('scroll', onScroll);

        this.root.on({
            carouselScrollComplete: function(){
                self.updateDisplay();
                self.updateLimits();
            },
            carouselInit: this.updateDimensions.bind(this),
            carouselResize: this.updateDimensions.bind(this)
        });

        //It is possible that images may load after the carousel has instantiated/
        //Also, this can be used for lazy-loading images
        //TODO: This can be problematic, since it is triggering update dimensions for each image load
        this.content.find('img').on('load', this.updateDimensions.bind(this));

        carouselElements = carouselElements.add(this.root);
    });

    Carousel.setDefaultOptions({
        contentSelector: '[data-role="carousel-content"]',
        controlSelector: '[data-role="carousel-control"]',

        displayMode: 'none',
        displaySelector: '[data-role="carousel-display"]',
        displayTemplateSelector: '[data-role="carousel-display-template"]',

        snapMode: 'none',
        visibleThreshold: 0.50
    });

    //Set css rules for all carousels
    Carousel.setCSSRules({
        '.xooie-carousel-wrapper': {
            'overflow-x': 'scroll',
            'overflow-y': 'hidden'
        },
        '.xooie-carousel-crop': {
            'overflow-y': 'hidden'
        },
        '.xooie-carousel-content': {
            display: 'table-cell',
            'white-space': 'nowrap',
            'font-size': '0px'
        },
        '.xooie-carousel-item': {
            display: 'inline-block',
            zoom: '1',
            '*display': 'inline',
            'font-size': '1em'
        }
    });

    cache = {
        currentItem: 0,
        lastItem: 0
    };

    Carousel.prototype.currentItem = function(bias) {
        var i, items = this.content.children(),
            position, itemWidth;

        if (typeof bias === 'undefined') {
            bias = 1;
        }

        if (bias === 1) {
            position = this.content.position().left;

            for (i = 0; i < items.length - 1; i++) {
                itemWidth = items.eq(i).outerWidth(true);

                if (position + this.options.visibleThreshold * itemWidth >= 0){
                    return i;
                } else {
                    position += itemWidth;
                }
            }
            return items.length - 1;
        } else {
            position = this.content.outerWidth(true) + this.content.position().left;

            for (i = items.length - 1; i > 0; i -= 1) {
                itemWidth = items.eq(i).outerWidth(true);
                position -= itemWidth;

                if (i > 0 && position <= this.options.visibleThreshold * itemWidth) {
                    return i;
                }
            }
            return 0;
        }
    };

    Carousel.prototype.getRightLimit = function(){
        try {
            var lastItem = this.content.children(':last'),
                position = lastItem.position();

            if (position && typeof position.left !== 'undefined') {
                return Math.floor(position.left) + lastItem.outerWidth(true);
            }
        } catch (e) {
            return;
        }
    };

    Carousel.prototype.updateDimensions = function() {
        var items = this.content.children(),
            height = 0;

        items.each(function() {
            var node = $(this);
            height = Math.max(height, node.outerHeight(true));
        });

        //set the height of the wrapper's parent (or cropping element) to ensure we hide the scrollbar
        this.cssRules.heightAdjust.style.height = height + 'px';

        this.updateLimits();
        this.updateDisplay();
        this.snap();

        this.root.trigger('carouselUpdated');
    };

    Carousel.prototype.updateLimits = function() {
        this.root.toggleClass('is-carousel-leftmost', this.wrapper.scrollLeft() === 0);
        this.root.toggleClass('is-carousel-rightmost', this.getRightLimit() <= this.wrapper.innerWidth());
    };

    Carousel.prototype.updatePosition = function(amount, cb) {
        var match = (amount + '').match(/^([+\-]?)(\d+)(.*)$/),
            callback,
            self = this;

        if (!match) {
            if (typeof cb === 'function') {
                cb();
            }

            return;
        }

        callback = function(){
            var direction, quantity, units, offset;

            if (match[1] !== '') {
                direction = (match[1] === '-') ? -1 : 1;
            }

            quantity = parseInt(match[2], 10);
            units = match[3];

            if (units === '') {
                units = 'px';
            }

            if (typeof self.positionUpdaters[units] === 'function') {
                offset = self.positionUpdaters[units](quantity, direction);
            } else {
                offset = 0;
            }

            self.isScrolling = true;

            self.root.trigger('carouselMove', offset);

            self.wrapper.animate({ scrollLeft: offset }, 200,
                function(){
                    self.isScrolling = false;
                    if (typeof cb === 'function') {
                        cb();
                    }
                }
            );
        };

        if (this.isScrolling) {
            self.wrapper.stop(true,true);
        }
        
        callback();

    };

    Carousel.prototype.updateDisplay = function(){
        if (this.options.displayMode === 'none') {
            return;
        }

        var container = this.root.find(this.options.displaySelector),
            template = this.root.find(this.options.displayTemplateSelector);

        if (container.length === 0 || template.length === 0) {
            return;
        }

        container.html('');

        if (typeof this.displayMethods[this.options.displayMode] === 'function') {
            this.displayMethods[this.options.displayMode](container, template);
        }
    };

    Carousel.prototype.snap = function(){
        if (this.getRightLimit() > this.wrapper.innerWidth() && typeof this.snapMethods[this.options.snapMode] === 'function') {
            this.snapMethods[this.options.snapMode]();
        }
    };

    return Carousel;
});
