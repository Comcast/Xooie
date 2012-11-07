var modules = ['carousel', 'dropdown'];

requirejs.config({
	paths: {
		'jquery': 'lib/vendor/jquery'
	}
})

require(modules, function(Carousel, Dropdown){ return true; });