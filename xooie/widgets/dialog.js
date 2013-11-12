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

define('xooie/widgets/dialog', ['jquery', 'xooie/xooie', 'xooie/widgets/base', 'xooie/helpers', 'xooie/event_handler'], function($, $X, Base, helpers, EventHandler) {

  var Dialog, queue;

  $X.openDialog = function(element) {
    element = $(element);
    var id, instance;

    id = helpers.toInt(element.attr('data-xooie-instance'));

    instance = $X._instanceCache[id];

    if (!helpers.isUndefined(instance)) {
      instance.open();
    }
  };

  $X.closeDialog = function(element) {
    element = $(element);
    var id, instance;

    id = helpers.toInt(element.attr('data-xooie-instance'));

    instance = $X._instanceCache[id];

    if (!helpers.isUndefined(instance)) {
      instance.close();
    }
  };

  function parseCtrlStr(ctrlStr) {
    ctrlStr = ctrlStr.toLowerCase();

    var ptrnMatch = ctrlStr.match(/^dialogcontrol:(.*)$/);

    if (ptrnMatch !== null) {
      return ptrnMatch.slice(1);
    }
  }

  Dialog = Base.extend(function() {
		var self = this;

    this.root().attr('role', 'dialog')
               .attr('aria-labelledby', this.dialogtitles().attr('id'))
               .attr('aria-describedby', this.dialogdescs().attr('id'));


    this._controlEvents = new EventHandler(this.namespace());

    this._controlEvents.add({
			mouseup: function(event) {
				var ctrl, action;

				ctrl = $(this);
				action = parseCtrlStr(ctrl.attr('data-x-role'))[0];

				if (!ctrl.is(':disabled')) {
					self.root().trigger(action);
				}
			},

			keyup: function(event) {
				var ctrl, action;

				if ([13,32].indexOf(event.which) !== -1) {
					ctrl = $(this);
					action = parseCtrlStr(ctrl.attr('data-x-role'))[0];

					if (!ctrl.is(':disabled')) {
						self.root().trigger(action);
					}
				}
			}
    });

    this._dialogEvents = new EventHandler(this.namespace());

    this._dialogEvents.add({
      open: function() {
        self.open();
      },

      close: function() {
        self.close();
      }
    });

    this.root().on(this._dialogEvents.handlers);

    this.root().addClass(this.dialogClass());
  });

  Dialog.define('namespace', 'dialog');

  Dialog.defineReadOnly('dialogClass', 'xooie-dialog');

  Dialog.defineReadOnly('activeClass', 'is-dialog-active');

  Dialog.defineRole('dialogtitle');

  Dialog.defineRole('dialogdesc');

  Dialog.defineRole('dialogcontrol');

  Dialog.createStyleRule('.' + Dialog.prototype.dialogClass(), {
    position: 'absolute',
    display: 'none'
  });

  Dialog.createStyleRule('.' + Dialog.prototype.dialogClass() + '.' + Dialog.prototype.activeClass(), {
    display: 'block'
  });

  Dialog.prototype.open = function() {
    this.root().addClass(this.activeClass());

    // TODO: set focus on the first focusable item in the dialog

    this.root().find('button').focus();
  };

  Dialog.prototype.close = function() {
    this.root().removeClass(this.activeClass());
  };

  Dialog.prototype.isActive = function() {
    return this.root().hasClass(this.activeClass());
  };

  Dialog.prototype._get_role_dialogcontrol = function() {
    return this.root().find('[data-x-role^="dialogcontrol"]');
  };

  Dialog.prototype._process_role_dialogcontrol = function(dialogcontrols) {
		dialogcontrols.on(this._controlEvents.handlers);

    return dialogcontrols;
  };

  return Dialog;
});
