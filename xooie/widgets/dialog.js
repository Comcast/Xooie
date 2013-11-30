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

define('xooie/dialog', ['xooie/base', 'xooie/helpers'], function (Base, helpers) {
  'use strict';

  var Dialog = new Base('dialog', function () {
    var self = this;

    this.id = Dialog._counter = Dialog._counter + 1;

    Dialog._instances[this.id] = this;

    this.root.attr('data-dialog-id', this.id);

    //add accessibility attributes
    this.root.find(this.options.containerSelector).attr('role', 'dialog');

    this.root.addClass('xooie-dialog');

    this.handlers = {
      mouseup: function () {
        Dialog.close(self.id);
      },

      keyup: function (event) {
        if ([13, 32].indexOf(event.which) !== -1) {
          Dialog.close(self.id);
        }
      }
    };
  });

  Dialog.setDefaultOptions({
    closeButtonSelector: '[data-role="closeButton"]',
    containerSelector: '[data-role="container"]',

    dialogActiveClass: 'is-dialog-active'
  });

  Dialog.setCSSRules({
    '.xooie-dialog': {
      position: 'fixed',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0
    }
  });

  Dialog.prototype.activate = function () {
    this.root.addClass(this.options.dialogActiveClass);

    if (Dialog._active === this) {
      return;
    }

    if (Dialog._active) {
      Dialog._active.deactivate();
    }

    this.root.find(this.options.closeButtonSelector)
             .on(this.handlers);

    Dialog._active = this;

    this.root.trigger('dialogActive');
  };

  Dialog.prototype.deactivate = function () {
    this.root.removeClass(this.options.dialogActiveClass);

    if (Dialog._active !== this) {
      return;
    }

    this.root.find(this.options.closeButtonSelector)
             .off(this.handlers);

    Dialog._active = null;

    this.root.trigger('dialogInactive');
  };

  Dialog._instances = [];
  Dialog._counter = 0;
  Dialog._active = null;
  Dialog._queue = [];

  Dialog.open = function (id) {
    //get dialog instance
    var dialog = this._instances[id];

    if (helpers.isUndefined(dialog) || this._active === dialog) {
      return;
    }

    if (this._active) {
      this._queue.push(dialog);
    }
    dialog.activate();
  };

  Dialog.close = function () {
    //get dialog instance
    if (!this._active) {
      return;
    }

    this._active.deactivate();

    if (this._queue.length > 0) {
      this._queue.pop().activate();
    }
  };

  return Dialog;
});