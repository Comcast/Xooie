Xooie
===

Xooie is a library of UI widgets designed to be extremely modular and agnostic of markup or styles.  With Xooie you can create almost any interface you want.  Key components are tagged with data attributes so that the widgets know to how to bind the functionality.

In addition to being flexible, Xooie also:

* Allows developers to automatically instantiate UI widgets without having to write any additional JavaScript: simply add the appropriate data attributes to your markup and you're good to go!

* Allows developers to define custom functionality by creating new Addons.  Addons can be loaded for specific instances of a widget by adding the path to the Addon file to a data-addons attribute.

* Designed for responsive layouts: you want a flexible-width carousel?  No problem!

* Designed with accessabilty concerns in mind, including focus control.

To see Xooie in action visit the Xfinity website: www.xfinity.comcast.net


Installation:
---
Setting up Xooie is as easy as dropping the xui directory into your project.  

Xooie requires the following libraries to work:
* RequireJS (www.requirejs.com)
* jQuery (www.jquery.com)
* async (github.com/caolan/async) ** Only for the tab_animation addon **
* micro_tmpl.js (found in the lib directory of this project)

Xooie will work by just loading xui.js on your page; all the other files will be loaded asynchronously as needed.  However, if you would rather not load the scripts asynchronously the modules can be loaded at page load.

Instantiation happens automatically when the page is loaded.  All elements tagged with the "data-widget-type" attribute will have the designated widget associated with it.

Documentation:
---
Carousel
(documentation coming soon!)

Tab
(documentation coming soon!)

Dropdown 
(documentation coming soon!)