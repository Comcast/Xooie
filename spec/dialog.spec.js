require(['jquery', 'xooie/dialog'], function($, Dialog) {
    describe('Dialog', function(){
        var el, counter = 0;

        beforeEach(function(){
            el = $(['<div data-widget-type="dialog">',
                        '<div data-role="container">',
                            '<div data-role="content">',
                                '<button data-role="closeButton" />',
                            '</div>',
                        '</div>',
                    '</div>'].join(''));

            this.dialog = new Dialog(el);

            counter+=1;
        });

        afterEach(function(){
            Dialog._counter = 0;
            Dialog._instances = [];
            Dialog._active = null;
            Dialog._queue = [];
        });

        describe('When instantiating the module...', function(){
            it('sets the id to the next value of the counter', function(){
                expect(this.dialog.id).toBe(0);
            });

            it('increments the counter each time Dialog is instantiated', function(){
                var el2, dialog2;

                el2 = $('<div />');
                dialog2 = new Dialog(el2);

                expect(this.dialog.id).toBe(0);
                expect(dialog2.id).toBe(1);
            });

            it('adds the dialog aria role to the container', function(){
                expect(this.dialog.root.find(this.dialog.options.containerSelector).attr('role')).toBe('dialog');
            });

            it('adds aria-describedby to the container', function() {
                expect(this.dialog.root.find(this.dialog.options.containerSelector).attr('aria-describedby')).toBe('modal-content-' + this.dialog.id);
            });

            it('adds a unique id to the content', function() {
                expect(this.dialog.root.find(this.dialog.options.contentSelector).attr('id')).toBe('modal-content-' + this.dialog.id);
            });

            it('adds the class xooie-dialog to the root', function(){
                expect(this.dialog.root.hasClass('xooie-dialog')).toBe(true);
            });

            it('creates a css rule .xooie-dialog', function(){
                var rule = this.dialog.stylesheet.getRule('.xooie-dialog');

                expect(rule).not.toBe(false);
                expect(rule.style.position).toBe('fixed');
                expect(rule.style.left).toBe('0px');
                expect(rule.style.top).toBe('0px');
                expect(rule.style.right).toBe('0px');
                expect(rule.style.bottom).toBe('0px');
            });
        });

        describe('When calling the activate method...', function(){
            it('adds the active class', function(){
                this.dialog.activate();

                expect(this.dialog.root.hasClass(this.dialog.options.dialogActiveClass)).toBe(true);
            });

            it('deactivates the currently active Dialog', function(){
                var dialog2 = new Dialog($('<div />'));

                dialog2.activate();

                spyOn(dialog2, 'deactivate');

                this.dialog.activate();

                expect(dialog2.deactivate).toHaveBeenCalled();
            });

            it('binds a mouseup handler to the closeButton', function(){
                this.dialog.activate();

                spyOn(Dialog, 'close');

                this.dialog.root.find(this.dialog.options.closeButtonSelector).trigger('mouseup');

                expect(Dialog.close).toHaveBeenCalledWith(this.dialog.id);
            });

            it('binds a keyup handler to the closeButton', function(){
                this.dialog.activate();

                spyOn(Dialog, 'close');

                var event = $.Event('keyup');

                event.which = 32;

                this.dialog.root.find(this.dialog.options.closeButtonSelector).trigger(event);

                expect(Dialog.close).toHaveBeenCalledWith(this.dialog.id);
            });

            it('sets the dialog to the active dialog', function(){
                this.dialog.activate();

                expect(Dialog._active).toBe(this.dialog);
            });

            it('focuses the first tabbable element in the container', function () {
                var el = $('<button />'),
                    passed = false;

                el.on('focus', function () {
                    passed = true;
                });

                spyOn(this.dialog, 'getTabbable').andReturn(el);

                this.dialog.activate();

                expect(passed).toBe(true);
            });

            it('triggers a dialogActive event', function(){
                var test = false;

                this.dialog.root.on('dialogActive', function(){
                    test = true;
                });

                this.dialog.activate();

                expect(test).toBe(true);
            });

            it('does not activate if the dialog is already active', function(){
                this.dialog.activate();

                var test = false;

                this.dialog.root.on('dialogActive', function(){
                    test = true;
                });

                this.dialog.activate();

                expect(test).toBe(false);
            });
        });

        describe('When calling the deactivate method...', function(){
            beforeEach(function(){
                this.dialog.activate();
            });

            it('removes the active class', function(){
                this.dialog.deactivate();

                expect(this.dialog.root.hasClass(this.dialog.options.dialogActiveClass));
            });

            it('removes the event handlers from the close button', function(){
                spyOn($.fn, 'off');

                this.dialog.deactivate();

                expect($.fn.off).toHaveBeenCalledWith(this.dialog.handlers);
            });

            it('sets the _active property to null', function(){
                this.dialog.deactivate();

                expect(Dialog._active).toBe(null);
            });

            it('triggers a dialogInactive event', function(){
                var test = false;

                this.dialog.root.on('dialogInactive', function(){
                    test = true;
                });

                this.dialog.deactivate();

                expect(test).toBe(true);
            });

            it('does not deactivate if the dialog is not active', function(){
                this.dialog.deactivate();

                var test = false;

                this.dialog.root.on('dialogInactive', function(){
                    test = true;
                });

                this.dialog.deactivate();

                expect(test).toBe(false);
            });
        });

        describe('When getting all tabbable elements', function() {
            beforeEach(function () {
                spyOn($.fn, 'closest').andReturn($());
            });

            it('gets all anchors with hrefs', function() {
                this.dialog.root = $('<div><div data-role="container"><a id="anchor1"></a><a href="#" id="anchor2"></a></div></div>');

                expect(this.dialog.getTabbable().is('#anchor2')).toBe(true);
                expect(this.dialog.getTabbable().is('#anchor1')).toBe(false);
            });

            it('gets all buttons', function () {
                this.dialog.root = $('<div><div data-role="container"><div /><button id="button1"></button></div></div>');

                expect(this.dialog.getTabbable().is('#button1')).toBe(true);
            });

            it('gets all inputs', function () {
                this.dialog.root = $('<div><div data-role="container"><div /><input id="input1"></input></div></div>');

                expect(this.dialog.getTabbable().is('#input1')).toBe(true);
            });

            it('gets all selects', function () {
                this.dialog.root = $('<div><div data-role="container"><div /><select id="select1"></select></div></div>');

                expect(this.dialog.getTabbable().is('#select1')).toBe(true);
            });

            it('gets all textarea', function () {
                this.dialog.root = $('<div><div data-role="container"><div /><textarea id="textarea1" /></div></div>');

                expect(this.dialog.getTabbable().is('#textarea1')).toBe(true);
            });

            it('gets all tabindex', function () {
                this.dialog.root = $('<div><div data-role="container"><div /><div id="div1" tabindex="0"></div></div></div>');

                expect(this.dialog.getTabbable().is('#div1')).toBe(true);
            });

            it('does not get tabindex=-1', function() {
                this.dialog.root = $('<div><div data-role="container"><div /><button id="button1" tabindex="-1"></button></div></div>');

                expect(this.dialog.getTabbable().is('#button1')).not.toBe(true);
            });
        });

        describe('When calling the Dialog.open method...', function(){
            beforeEach(function(){
                spyOn(this.dialog, 'activate');
            });

            it('activates the dialog if nothing is active', function(){
                Dialog.open(0);

                expect(this.dialog.activate).toHaveBeenCalled();
            });

            it('pushes the dialog to the queue if there is an active dialog', function(){
                Dialog._active = 'Some value';

                Dialog.open(0);

                expect(Dialog._queue).toEqual([this.dialog]);
            });

            it('does not try to activate if the dialog does not exist', function(){
                Dialog.open(1);

                expect(this.dialog.activate).not.toHaveBeenCalled();
                expect(Dialog._queue.length).toBe(0);
            });

            it('does not activate if the dialog is already active', function(){
                Dialog._active = this.dialog;

                Dialog.open(0);

                expect(this.dialog.activate).not.toHaveBeenCalled();
                expect(Dialog._queue.length).toBe(0);
            });
        });

        describe('When calling the Dialog.close method...', function(){
            beforeEach(function(){
                spyOn(this.dialog, 'deactivate');
            });

            it('returns if there is no active dialog', function(){
                Dialog.close();

                expect(this.dialog.deactivate).not.toHaveBeenCalled();
            });

            it('deactivates the active dialog', function(){
                this.dialog.activate();

                Dialog.close();

                expect(this.dialog.deactivate).toHaveBeenCalled();
            });

            it('activates the next dialog in the queue', function(){
                var dialog2 = new Dialog($('<div />'));

                spyOn(dialog2, 'activate');

                Dialog.open(0);
                Dialog.open(1);

                Dialog.close();

                expect(dialog2.activate).toHaveBeenCalled();
            });
        });
    });
});