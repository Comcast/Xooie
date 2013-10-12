define('xooie/widgets/accordion', ['jquery', 'xooie/widgets/tab'], function($, Tab){
  var Accordion = Tab.extend(function() {
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

  Accordion.prototype.selectTabs = function(event, selectedTab) {
    var activeTabs = this.getActiveTabs();

    if (activeTabs.is(selectedTab)) {
      return activeTabs.not(selectedTab);
    } else {
      return activeTabs.add(selectedTab);
    }
  };

  return Accordion;
});
