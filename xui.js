var modules = ['carousel', 'dropdown'];

requirejs.config({
	paths: {
		'jquery': 'lib/jquery'
	}
});

require(modules, function(Carousel, Dropdown){ return true; });