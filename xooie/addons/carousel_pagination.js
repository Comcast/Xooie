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

define('xooie/addons/carousel_pagination', ['jquery', 'xooie/addons/base', 'xooie/helpers'], function ($, Base, helpers) {
  'use strict';
  var Pagination = new Base('pagination', function () {
    var self = this;

    this._breaks = [];

    this.module.positionUpdaters = $.extend({}, this.module.positionUpdaters, {
      "page": function (quantity, direction) {
        var items, bias, offset, position, i;

        items = self.module.content.children();
        bias = 1;
        offset = 0;
        position = self.module.wrapper.scrollLeft();

        if (helpers.isUndefined(direction)) {
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
      "page": function () {
        var items, offset, p1, p2, i;

        items = self.module.content.children();
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
      "page": function (container, template) {
        var element = self.module.render(template, {
          current_page: self.currentPage() + 1,
          total_pages: self._breaks.length
        });

        container.append(element);
      }
    });

    this.module.root.on('carouselUpdated', function () {
      self.updateBreaks();
    });

    this.updateBreaks();
  });

  Pagination.prototype.currentPage = function (bias) {
    var i, k, items, position, itemWidth, lastItem;

    items = this.module.content.children();

    if (helpers.isUndefined(bias)) {
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

        if (position + (this.module.options.visibleThreshold * itemWidth) >= 0) {
          return i;
        }
        position += itemWidth;
      }
      return items.length - 1;
    }
    position = this.module.content.outerWidth(true) + this.module.content.position().left;

    for (i = this._breaks.length - 1; i >= 0; i -= 1) {
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
  };

  Pagination.prototype.updateBreaks = function () {
    var items, width, breakPoint, breaks;

    items = this.module.content.children();
    width = 0;
    breakPoint = this.module.wrapper.innerWidth();
    breaks = [0];

    items.each(function (i) {
      var node, w;

      node = $(this);
      w = node.outerWidth(true);

      width += w;

      if (width > breakPoint && (width - (w - node.innerWidth()) > breakPoint)) {
        width = w;
        breaks.push(i);
      }
    });

    this.module.root.toggleClass('is-carousel-paginated', breaks.length > 1);

    this._breaks = breaks;

    this.module.updateDisplay();
  };

  return Pagination;
});