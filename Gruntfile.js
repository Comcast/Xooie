module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    requirejs: {
      compile: {
        options: {
          baseUrl: "/",
          paths: {
            jquery: "empty:",
            async: "empty:"
          },
          name: "xooie",
          include: [
            "xooie/carousel",
            "xooie/dropdown",
            "xooie/tab",
            "xooie/dialog",
            "xooie/addons/carousel_lentils",
            "xooie/addons/carousel_pagination",
            "xooie/addons/dropdown_accordion",
            "xooie/addons/tab_automation",
            "xooie/addons/tab_animation"
          ],
          out: "bin/xooie-<%= pkg.version %>.js",
          optimize: "none"
        }
      }
    },
    jasmine: {
      test: {
        //src: "xooie/**/*.js",
        src: ['xooie/widgets/base.js', 'xooie/addons/base.js', 'xooie/xooie.js'],
        options: {
          //specs: "spec/**/*.spec.js",
          specs: ['spec/widgets/**/*.spec.js', 'spec/addons/base.spec.js', 'spec/xooie.spec.js'],
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

};