[![Build Status](https://travis-ci.org/Comcast/Xooie.png?branch=master)](http://travis-ci.org/Comcast/Xooie)

Xooie
===

Xooie is a library of JavaScript UI widgets designed to be extremely modular and agnostic of markup and styles. With Xooie, you can create almost any interface you want. Key components are tagged with data attributes, informing Xooie to bind the associated widget functionality.

In addition to being flexible, Xooie also:

* Allows developers to automatically instantiate UI widgets without writing additional JavaScript; simply add the appropriate data attributes to your HTML markup and you're good to go!

* Allows developers to define custom functionality by creating new Addons. Addons can be loaded for specific instances of a widget by creating a file to house your Addon code and specifying the Addon file's path in a data-addons="" attribute on the associated HTML element.

* Designed for responsive layouts. You want a flexible-width carousel? No problem!

* Designed with accessabilty in mind, including focus control.

To see Xooie in action visit [Xfinity.comcast.net](http://xfinity.comcast.net).

Installation:
---
Setting up Xooie is as easy as dropping the Xooie directory into your codebase.  

Xooie requires the following libraries:
* [RequireJS](http://www.requirejs.com)
* [jQuery](http://www.jquery.com)
* [async](http://github.com/caolan/async) ** Only for the tab_animation addon **
* micro_tmpl.js (found in the lib directory of this project)

Xooie will work by just loading xooie.js on your page; all other files will be loaded asynchronously as needed. However, if you would rather not load the scripts asynchronously, the modules can be loaded at page load.

Instantiation happens automatically when the page is loaded. All HTML elements tagged with the "data-widget-type" attribute will offer the associated Xooie widget functionality.

Documentation:
---
Carousel
(documentation coming soon!)

Tab
(documentation coming soon!)

Dropdown 
(documentation coming soon!)
