define('xooie/widgets/accordion', ['jquery', 'xooie/widgets/tab'], function($, Tab){
  var Accordion = Tab.extend(function() {
    var self = this;

    this._tabEvents.clear('keyup');
    this._tabEvents.clear('mouseup');

    this._tabEvents.add({
      keyup: function(event){
        var activeTab = self.getActiveTabs();

        if ([13,32].indexOf(event.which) !== -1){
          if (activeTab.is(this)) {
            self.deactivateTab(activeTab);
          } else {
            self.activateTab($(this));
          }

          event.preventDefault();
        }
      },

      mouseup: function(){
        var activeTab = self.getActiveTabs();

        if (activeTab.is(this)) {
          self.deactivateTab(activeTab);
        } else {
          self.activateTab($(this));
        }
      }
    });
  });

  Accordion.define('namespace', 'accordion');

/** internal
 * Xooie.Accordion#_process_role_tablist(tablist) -> Element
 * - tablist (Element): A jQuery-selected collection of [[Xooie.Tab#tablists]]
 *
 * Same as [[Xooie.Tab#_process_role_tablist]] and also adds the [`aria-multiselectable="true"`](http://www.w3.org/TR/wai-aria/states_and_properties#aria-multiselectable) attribute.
 **/
  Accordion.prototype._process_role_tablist = function(tablist) {
    Tab.prototype._process_role_tablist.apply(this, arguments);

    tablist.attr('aria-multiselectable', true);

    return tablist;
  };

  return Accordion;
});