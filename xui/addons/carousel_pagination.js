define(['jquery', 'addons_base'], function($, Base){

    var Pagination = Base('pagination', function() {
        var self = this;

        this._breaks = [];

        this.module.positionUpdaters = $.extend({}, this.module.positionUpdaters, {
            "page": function(quantity, direction) {
                var items = self.module.content.children(),
                    bias = 1,
                    offset = 0,
                    position = self.module.wrapper.scrollLeft(),
                    i;

                if (typeof direction === 'undefined') {
                    if (quantity > 0 && quantity <= self._breaks.length) {
                        offset = Math.round(items.eq(self._breaks[quantity - 1]).position().left);
                    }
                } else {
                    direction = direction === -1 ? -1 : 1;

                    bias = -direction;

                    if (!quantity || typeof quantity !== 'number') {
                        quantity = 1;
                    }

                    i = self.currentPage(bias) + direction * quantity;
                    i = Math.max(0, Math.min(self._breaks.length - 1, i));
                    offset = Math.round(items.eq(self._breaks[i]).position().left);
                }

                return position + offset;
            }
        });

        this.module.snapMethods = $.extend({}, this.module.snapMethods, {
            "page": function() {
                var items = self.module.content.children(),
                    offset, p1, p2,
                    i = self.currentPage();

                p1 = items.eq(self._breaks[i]).position().left;
                if (Math.abs(p1) < 1) {
                    p1 = p1 < 0 ? Math.ceil(p1) : Math.floor(p1);
                } else {
                    p1 = Math.round(p1);
                }

                if (p1 !== 0 && i > 0) {
                    p2 = items.eq(self._breaks[i - 1]).position().left;

                    if (Math.abs(p2) < 1) {
                        p2 = p2 < 0 ? Math.ceil(p2) : Math.floor(p2);
                    } else {
                        p2 = Math.round(p2);
                    }

                    if (Math.abs(p1) < Math.abs(p2)) {
                        offset = p1 + self.module.wrapper.scrollLeft();
                    } else {
                        offset = p2 + self.module.wrapper.scrollLeft();
                    }

                    self.module.wrapper.animate({ scrollLeft: offset });
                }
            }
        });

        this.module.displayMethods = $.extend({}, this.module.displayMethods, {
            "page": function(container, template){

                var element = $(template.micro_render({
                    current_page: self.currentPage() + 1,
                    total_pages: self._breaks.length
                }));

                container.append(element);
            }
        });

        this.module.root.on('carouselUpdated', function(){
            self.updateBreaks();
        });

        this.updateBreaks();
    });

    Pagination.prototype.currentPage = function(bias) {
        var i, k, items = this.module.content.children(),
            position, itemWidth, lastItem;

        if (typeof bias === 'undefined') {
            bias = 1;
        }

        if (bias === 1) {
            position = this.module.content.position().left;

            for (i = 0; i < this._breaks.length; i += 1) {
                itemWidth = 0;
                lastItem = (i === this._breaks.length - 1) ? items.length : this._breaks[i + 1];

                for (k = this._breaks[i]; k < lastItem; k += 1) {
                    itemWidth += items.eq(k).outerWidth(true);
                }

                if (position + (this.module.options.visibleThreshold * itemWidth) >= 0){
                    return i;
                } else {
                    position += itemWidth;
                }
            }
            return items.length - 1;
        } else {
            position = this.module.content.outerWidth(true) + this.module.content.position().left;

            for (i = this._breaks.length - 1; i >= 0; i--) {
                itemWidth = 0;
                lastItem = (i === this._breaks.length - 1) ? items.length : this._breaks[i + 1]; 

                for (k = this._breaks[i]; k < lastItem; k += 1) {
                    itemWidth += items.eq(k).outerWidth(true);
                }
                position -= itemWidth;

                if (position <= this.module.options.visibleThreshold * itemWidth) {
                    return i;
                }
            }
            return 0;
        }
    };

    Pagination.prototype.updateBreaks = function() {
        var items = this.module.content.children(),
            width = 0,
            breakPoint = this.module.wrapper.innerWidth(),
            breaks = [0];

        items.each(function(i) {
            var node = $(this),
                w = node.outerWidth(true);

            width += w;

            if (width > breakPoint) {
                if (width - (w - node.innerWidth()) > breakPoint) {
                    width = w;
                    breaks.push(i);
                }
            }
        });

        this.module.root.toggleClass('is-carousel-paginated', breaks.length > 1);

        this._breaks = breaks;

        this.module.updateDisplay();
    };

    return Pagination;
});
