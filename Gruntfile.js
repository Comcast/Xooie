module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    requirejs: {
      compile: {
        options: {
          baseUrl: "",
          paths: {
            jquery: "empty:",
            async: "empty:"
          },
          name: "xooie/xooie",
          include: [
            "xooie/widgets/carousel",
            "xooie/widgets/dropdown",
            "xooie/widgets/tab",
            "xooie/widgets/dialog"
          ],
          out: "source/javascripts/xooie-<%= pkg.version %>.js",
          optimize: "none"
        }
      },
      compile_min: {
        options: {
          baseUrl: "",
          paths: {
            jquery: "empty:",
            async: "empty:"
          },
          name: "xooie/xooie",
          include: [
            "xooie/widgets/carousel",
            "xooie/widgets/dropdown",
            "xooie/widgets/accordion",
            "xooie/widgets/tab",
            "xooie/widgets/dialog"
          ],
          out: "source/javascripts/xooie-<%= pkg.version %>-min.js",
          optimize: "uglify"
        }
      }
    },
    jasmine: {
      test: {
        //src: "xooie/**/*.js",
        src: ['xooie/widgets/base.js', 'xooie/widgets/dropdown.js', 'xooie/widgets/carousel.js', 'xooie/addons/base.js', 'xooie/**.js'],
        options: {
          //specs: "spec/**/*.spec.js",
          specs: ['spec/widgets/base.spec.js', 'spec/widgets/dropdown.spec.js', 'spec/widgets/carousel.spec.js', 'spec/addons/base.spec.js', 'spec/**.js'],
          template: require("grunt-template-jasmine-requirejs"),
          vendor: ["lib/jquery.js","lib/require.js","lib/micro_tmpl.js","lib/jasmine-jquery.js"],
          helpers: "spec/helpers.js",
          templateOptions: {
            requireConfigFile: 'lib/config.js'
          }
        }
      }
    },
    jshint: {
      files: 'xooie/**/*.js'
    }
  });

  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('test', ['jshint', 'jasmine']);
  grunt.registerTask('build', ['test', 'requirejs']);

};