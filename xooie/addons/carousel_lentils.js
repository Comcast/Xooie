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

define('xooie/addons/carousel_lentils', ['jquery', 'xooie/addons/base', 'xooie/helpers'], function($, Base, helpers) {

  var Lentils = Base.extend(function() {
    var self = this;

    this._builders = {
      item: function (container, template) {
        var items = self.widget().items(),
            element, i;

        for (i = 0; i < items.length; i += 1) {

            element = self.widget().render(template, {
                number: i + 1,
                scroll_mode: "item",
                lentil_is_last: (i === items.length - 1)
            });
            container.append(element);
        }
      },

      page: function (container, template) {
        if (helpers.isUndefined(self.widget().addons().pagination) {
          return;
        }

        var element, i;

        for (i = 0; i < self.widget().addons().pagination._breaks.length; i += 1) {
          element = self.widget().render(template, {
            number: i + 1,
            scroll_mode: "page",
            lentil_is_last: (i === self.widget().addons().pagination._breaks.length - 1)
          });

          container.append(element);
        }
      }
    };

    this.root().addClass('is-carousel-lentiled');

    this.root().on('carouselUpdated', function() {
      self.updateLentils();
    });

    this.root().on('carouselScrollComplete', function() {
      self.currentLentil();
    });

    this.root().on([
      this.get('initEvent'),
      this.get('refreshEvent'),
      this.get('resizeEvent')].join(' '),
    function(){
      self.updateLentils();
      self.currentLentil();
    });
  });

  Lentils.define('lentilMode', 'item');

  Lentils.defineReadOnly('lentilSelector', '[data-role="carousel-lentils"]');

  Lentils.defineReadOnly('lentilTemplateSelector', '[data-role="carousel-lentils-template"]');

  Lentils.defineReadOnly('')

  <script data-role="carousel-lentils-template" lang>
    '<li><button></button></li>'
  </script>

  Lentils.prototype.update = function() {

  };

  Lentils.setDefaultOptions({
      lentilMode: 'item',
      lentilSelector: ,
      lentilTemplateSelector: ,

      activeLentilClass: 'is-active-lentil'
  });

  Lentils.prototype.currentLentil = function(){
      var container = this.module.root.find(this.options.lentilSelector),
          lentils = container.children(),
          index;

      if (this.options.lentilMode === 'page' && typeof this.module.addons.pagination !== 'undefined') {
          index = this.module.addons.pagination.currentPage();
      } else {
          index = this.module.currentItem();
      }

      lentils.filter('.' + this.options.activeLentilClass).removeClass(this.options.activeLentilClass);

      lentils.eq(index).addClass(this.options.activeLentilClass);
  };

  Lentils.prototype.updateLentils = function() {
      var container = this.module.root.find(this.options.lentilSelector),
          template = this.module.root.find(this.options.lentilTemplateSelector),
          self = this;

      if (container.length > 0 && template.length > 0) {
          container.html('');

          if (typeof this.lentilBuilders[this.options.lentilMode] === 'function') {
              this.lentilBuilders[this.options.lentilMode](container, template);

              container.children().on('click', function(event) {
                  event.preventDefault();
                  self.module.updatePosition($(this).data('scroll'));
              });

              this.currentLentil();

          }
      }
  };

  return Lentils;
});
