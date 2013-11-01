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
* micro_tmpl.js (found in the lib directory of this project)

Xooie will work by just loading xooie.js on your page; all other files will be loaded asynchronously as needed. However, if you would rather not load the scripts asynchronously, the modules can be loaded at page load.

Instantiation happens automatically when the page is loaded. All HTML elements tagged with the "data-widget-type" attribute will offer the associated Xooie widget functionality.

1.x vs 0.1.x:
---
v1.0 is our official release of Xooie. All new feature development & bug fixes occur on [master](https://github.com/Comcast/Xooie) & are released from a release_1_x branch (e.g. [release_1_1](https://github.com/Comcast/Xooie/tree/release_1_1)). So if you're just getting started with Xooie, be sure to grab the latest 1.x version.

If you were already using a pre-1.0 release of Xooie, there is a [release_0_1_x branch](https://github.com/Comcast/Xooie/tree/release_0_1_x) that is updated with bug fixes only. Any 0.1.x release is from the pre-1.0 Xooie development work. 

Documentation:
---
Carousel
(documentation coming soon!)

Tab
(documentation coming soon!)

Dropdown 
(documentation coming soon!)
