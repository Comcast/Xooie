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
        src: "xooie/base.js",
        options: {
          specs: ["spec/base.spec.js"],
          template: require('grunt-template-jasmine-requirejs'),
          templateOptions: {
            requireConfigFile: 'lib/config.js'
          }
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-jasmine');

};