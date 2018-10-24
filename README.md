[![Build Status](https://travis-ci.org/Comcast/Xooie.png?branch=master)](http://travis-ci.org/Comcast/Xooie)

### Important note: this project is no longer actively maintained.

Xooie
===

Xooie is a library of JavaScript UI widgets designed to be extremely modular and agnostic of markup and styles. With Xooie, you can create almost any interface you want. Key components are tagged with data attributes, informing Xooie to bind the associated widget functionality.

In addition to being flexible, Xooie also:

* Allows developers to automatically instantiate UI widgets without writing additional JavaScript; simply add the appropriate data attributes to your HTML markup and you're good to go!

* Allows developers to define custom functionality by creating new Addons. Addons can be loaded for specific instances of a widget by creating a file to house your Addon code and specifying the Addon file's path in a data-addons="" attribute on the associated HTML element.

* Designed for responsive layouts. You want a flexible-width carousel? No problem!

* Designed with accessabilty in mind, including focus control.

For more information and documentation, visit the [Xooie site](http://www.xooie.net).

1.x vs 0.1.x:
---
v1.0 is our official release of Xooie. All new feature development & bug fixes occur on [master](https://github.com/Comcast/Xooie) & are released from a release_1_x branch (e.g. [release_1_1](https://github.com/Comcast/Xooie/tree/release_1_1)). So if you're just getting started with Xooie, be sure to grab the latest 1.x version.

If you were already using a pre-1.0 release of Xooie, there is a [release_0_1_x branch](https://github.com/Comcast/Xooie/tree/release_0_1_x) that is updated with bug fixes only. Any 0.1.x release is from the pre-1.0 Xooie development work.
