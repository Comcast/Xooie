var modules = ['carousel', 'dropdown'];

requirejs.config({
	paths: {
		'jquery': 'lib/jquery',
        'async': 'lib/async'
	}
});

require(modules, function(Carousel, Dropdown){ return true; });