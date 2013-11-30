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

/**
 * class Xooie.Tab < Xooie.Widget
 *
 * A widget that associates containers of information with "tabs".  The pattern is
 * designed to mimic the real-world concept of a filing cabinet, where content is
 * stored in folders with protruding tabs that label said content.
 *
 * The Tab widget should be used as a way to organize how content is displayed
 * visually.  Content is hidden until the associated tab is activated.
 **/
define('xooie/widgets/tab', ['jquery', 'xooie/helpers', 'xooie/widgets/base', 'xooie/event_handler'], function ($, helpers, Base, EventHandler) {
  'use strict';

  function setSelection(widget, selectedTabs) {
    var activeTabs = widget.getActiveTabs();

    activeTabs.not(selectedTabs).each(function () {
      widget.deactivateTab($(this));
    });

    selectedTabs.not(activeTabs).each(function () {
      widget.activateTab($(this));
    });
  }
/**
 * Xooie.Tab@xooie-tab-active(event)
 * - event (Event): A jQuery event object
 *
 * An event that is fired when a tab is activated.  Triggers on the `root` element of the widget.
 *
 * ##### Event Properties
 * - **tabId** (String): The id of the tab that was activated.
 **/

 /**
 * Xooie.Tab@xooie-tab-inactive(event)
 * - event (Event): A jQuery event object
 *
 * An event that is fired when a tab is deactivated.  Triggers on the `root` element of the widget.
 *
 * ##### Event Properties
 * - **tabId** (String): The id of the tab that was deactivated.
 **/

/**
 * new Xooie.Tab(element[, addons])
 * - element (Element | String): A jQuery-selected element or string selector for the root element of this widget
 * - addons (Array): An optional collection of [[Xooie.Addon]] classes to be instantiated with this widget
 *
 * Instantiates a new Tab instance.  See [[Xooie.Widget]] for more functionality.
 **/
  var Tab = Base.extend(function () {
    var self = this;

    this._tabEvents = new EventHandler(this.namespace());

    this._tabEvents.add({
      keyup: function (event) {
        if ([13, 32].indexOf(event.which) !== -1) {
          setSelection(self, self.selectTabs($(this), event));

          event.preventDefault();
        }
      },

      mouseup: function (event) {
        setSelection(self, self.selectTabs($(this), event));
      },

      click: function (event) {
        event.preventDefault();
      }
    });

    // TODO: Test and document this.  Also, create a property for data-activate
    this.root().on(this.initEvent(), function () {
      self.activateTab(self.tabs().filter('[data-activate="true"]'));
    });

  });

/** internal
 * Xooie.Tab#_namespace -> String
 *
 * See [[Xooie.Widget#_namespace]].
 * Default: `tab`.
 **/
/**
 * Xooie.Tab#namespace([value]) -> String
 * - value: an optional value to be set.
 *
 * See [[Xooie.Widget#namespace]]
 **/
  Tab.define('namespace', 'tab');

/** internal
 * Xooie.Tab#_tabSelector -> String
 *
 * An alternative selector for a [[Xooie.Tab#tabs]]. This allows developers to specify a tab control that may not
 * be a child of the tab widget.
 **/
/**
 * Xooie.Tab#tabSelector([value]) -> String
 * - value: an optional value to be set.
 *
 * The method for setting or getting [[Xooie.Tab#_tabSelector]].  Returns the current value of
 * [[Xooie.Tab#_tabSelector]] if no value is passed or sets the value.
 **/
  Tab.define('tabSelector');

/** internal
 * Xooie.Tab#_activeClass -> String
 *
 * A class string that is applied to active [[Xooie.Tab#tabs]] and [[Xooie.Tab#tabpanels]].
 * Default: `is-tab-active`.
 **/
/**
 * Xooie.Tab#activeClass([value]) -> String
 * - value: an optional value to be set.
 *
 * The method for setting or getting [[Xooie.Tab#_activeClass]].  Returns the current value of
 * [[Xooie.Tab#_activeClass]] if no value is passed or sets the value.
 **/
  Tab.defineReadOnly('activeClass', 'is-tab-active');

/**
 * Xooie.Tab#tabpanels() -> Elements
 *
 * Tabpanels are elements that contain the content that is shown or hidden when the corresponding
 * [[Xooie.Tab#tabs]] is activated.
 * This role maps to the ARIA [tab role](http://www.w3.org/TR/wai-aria/roles#tab)
 **/
  Tab.defineRole('tabpanel');

/**
 * Xooie.Tab#tabs() -> Elements
 *
 * Tabs are elements that, when activated, also activate the corresponding [[Xooie.Tab#tabpanels]].
 * This role maps to the ARIA [tabpanel role](http://www.w3.org/TR/wai-aria/roles#tabpanel).
 **/
  Tab.defineRole('tab');

/**
 * Xooie.Tab#tablists() -> Elements
 *
 * A tablist is an element that contains all the [[Xooie.Tab#tabs]].  If any tabs are not decendants of
 * the tablist, ownership of the tab is indicated using the `aria-owns` attribute.
 * There should only be one tablist per tab widget.
 * This role maps to the ARIA [tablist role](http://www.w3.org/TR/wai-aria/roles#tablist)
 **/
  Tab.defineRole('tablist');

/**
 * Xooie.Tab#activateTab(tab)
 * - tab (Element): One of the [[Xooie.Tab#tabs]] associated with this widget.
 *
 * Activates the [[Xooie.Tab#tabs]] by adding the [[Xooie.Tab#activeClass]] class and setting the `aria-expanded` property to 'true'.
 * The method also activates the [[Xooie.Tab#tabpanels]] that is indicated by the tab's `aria-controls` attribute,
 * adding the [[Xooie.Tab#activeClass]] class and setting `aria-expanded` to 'true'.
 **/
  Tab.prototype.activateTab = function (tab) {
    tab.addClass(this.activeClass())
       .attr('aria-selected', true);

    $('#' + tab.attr('aria-controls')).addClass(this.activeClass())
                                      .attr('aria-expanded', true)
                                      .focus();

    var e = $.Event('xooie-tab-active');

    e.tabId = tab.attr('id');

    this.root().trigger(e);
  };

/**
 * Xooie.Tab#deactivateTab(tab)
 * - tab (Element): One of the [[Xooie.Tab#tabs]] associated with this widget.
 *
 * Deactivates the [[Xooie.Tab#tabs]] by removing the [[Xooie.Tab#activeClass]] class and setting the `aria-expanded` property to 'false'.
 * The method also deactivates the [[Xooie.Tab#tabpanels]] that is indicated by the tab's `aria-controls` attribute,
 * removing the [[Xooie.Tab#activeClass]] class and setting `aria-expanded` to 'false'.
 **/
  Tab.prototype.deactivateTab = function (tab) {
    tab.removeClass(this.activeClass())
       .attr('aria-selected', false);

    $('#' + tab.attr('aria-controls')).removeClass(this.activeClass())
                                      .attr('aria-expanded', false);

    var e = $.Event('xooie-tab-inactive');

    e.tabId = tab.attr('id');

    this.root().trigger(e);
  };

/**
 * Xooie.Tab#selectTabs(selectedTab, event)
 * - selectedTab (Element): Tab that was selected by a mouse or keyboard event
 * - event (Event): The jQuery event that triggered the selection
 *
 * Only called by mouse/keyboard event handlers to generate the list of
 * currently active tabs. Should return a jQuery collection of tabs that are
 * to be active. Any tabs which are currently active and not in the
 * collection will be deactivated, and likewise any tabs not currently active
 * and in the collection will be activated.
 *
 * Override this method to alter the behavior of the Tab widget.
 **/
  Tab.prototype.selectTabs = function (selectedTab) {
    return selectedTab;
  };

/**
 * Xooie.Tab#getActiveTabs() -> Elements
 *
 * Returns a jQuery-selected collection of all [[Xooie.Tab#tabs]] that currently have the
 * [[Xooie.Tab#activeClass]] class.
 **/
  Tab.prototype.getActiveTabs = function () {
    return this.tabs().filter('.' + this.activeClass());
  };

/** internal
 * Xooie.Tab#_process_role_tab(tabs) -> Element
 * - tabs (Element): A jQuery-selected collection of [[Xooie.Tab#tabs]]
 *
 * This method processes the elements that have been designated as [[Xooie.Tab#tabs]] with
 * the `data-x-role="tab"` attribute.  Tabs are given the [`role="tab"`](http://www.w3.org/TR/wai-aria/roles#tab) and [`aria-selected="false"`](http://www.w3.org/TR/wai-aria/states_and_properties#aria-selected)
 * [ARIA](http://www.w3.org/TR/wai-aria/) attributes.
 **/
  Tab.prototype._process_role_tab = function (tabs) {
    var tabpanels;

    tabpanels = this.tabpanels();

    tabs.attr('role', 'tab')
        .attr('aria-selected', false);

    tabs.each(function (index) {
      var tab, panelId;

      tab = $(this);
      panelId = tabpanels.eq(index).attr('id');

      tab.attr('aria-controls', panelId);

      if (tab.is('a')) {
        tab.attr('href', '#' + panelId);
      }

    });

    tabs.on(this._tabEvents.handlers);

    return tabs;
  };

/** internal
 * Xooie.Tab#_get_role_tab() -> Element
 *
 * Internal method used to retrieve the [[Xooie.Tab#tabs]] for this widget.  If [[Xooie.Tab#tabSelector]] has been
 * defined then its value will be used to select from the DOM.  Otherwise, tabs will be selected from decendants of
 * the root using the `[data-x-role="tab"]` selector.
 **/
  Tab.prototype._get_role_tab = function () {
    if (!helpers.isUndefined(this.tabSelector())) {
      return $(this.tabSelector());
    }
    return this.root().find('[data-x-role="tab"]');
  };

/** internal
 * Xooie.Tab#_render_role_tab() -> Elements
 *
 * TODO: Create this method to keep parity with the existing tab functionality
 **/
  Tab.prototype._render_role_tab = function () { return false; };

/** internal
 * Xooie.Tab#_process_role_tablist(tablist) -> Element
 * - tablist (Element): A jQuery-selected collection of [[Xooie.Tab#tablists]]
 *
 * This method processes the elements that have been designated as [[Xooie.Tab#tablists]] with
 * the `data-x-role="tablist"` attribute.  The tablist is given the [`role="tablist"`](http://www.w3.org/TR/wai-aria/roles#tablist)
 * [ARIA](http://www.w3.org/TR/wai-aria/) attributes.  If any [[Xooie.Tab#tabs]] are not decendants of the tab list, the ids of those
 * tabs are added to the [`aria-owns`](http://www.w3.org/TR/wai-aria/states_and_properties#aria-owns) attribute.
 **/
  Tab.prototype._process_role_tablist = function (tablist) {
    var tabs = this.tabs();

    tablist.attr('role', 'tablist');

    tabs.each(function () {
      var owns, id;
      if (tablist.has(this).length === 0) {
        owns = tablist.attr('aria-owns') || '';

        owns = owns.split(' ');

        id = $(this).attr('id');

        if (owns.indexOf(id) === -1) {
          owns.push(id);
        }

        tablist.attr('aria-owns', owns.join(' '));
      }
    });

    return tablist;
  };
/** internal
 * Xooie.Tab#_render_role_tablist() -> Element
 *
 * TODO: Add this method to render the tablist if it is not included.
 **/
  Tab.prototype._render_role_tablist = function () {
    return $('<ul data-x-role="tablist"></ul>');
  };

/** internal
 * Xooie.Tab#_process_role_tabpanel(tabpanels) -> Element
 * - tabpanels (Element): A jQuery-selected collection of [[Xooie.Tab#tabpanels]]
 *
 * This method processes the elements that have been designated as [[Xooie.Tab#tabpanels]] with
 * the `data-x-role="tabpanel"` attribute.  Tabs are given the [`role="tabpanel"`](http://www.w3.org/TR/wai-aria/roles#tab) and [`aria-expanded="false"`](http://www.w3.org/TR/wai-aria/states_and_properties#aria-selected)
 * [ARIA](http://www.w3.org/TR/wai-aria/) attributes.
 **/
  Tab.prototype._process_role_tabpanel = function (tabpanels) {
    tabpanels.attr('role', 'tabpanel')
             .attr('aria-expanded', false);

    return tabpanels;
  };

  return Tab;
});
