module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    meta: {
      version: '0.0.1',
      banner: '/*! XUI - v<%= meta.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> */'
    },
    requirejs: {
      std: {
        name: 'xui',
        dir: "build",
        baseUrl: "lib",
        paths: {
          xui: 'ui/xui'
        },
        appDir: "lib",
        out: 'buid/xui.min.js'
      }
    },
    min: {
      xui: {
        src: ['<banner:meta.banner>', 'lib/ui/base.js', 'lib/ui/init.js', 'lib/ui/carousel.js', 'lib/ui/dropdown.js','lib/ui/tab.js'],
        dest: 'build/xui.min.js'
      },
      // some custom build examples
      carousel: {
        src: ['<banner:meta.banner>', 'lib/ui/carousel.js'],
        dest: 'build/carousel.min.js'
      },
      carouselWithPagination: {
        src: ['<banner:meta.banner>', 'lib/carousel.js', 'lib/addons/carousel_pagination.js'],
        dest: 'build/carouselWithPagination.min.js'
      }
    },
    lint: {
      files: ['*.js', 'test/*.js']
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'default'
    },
    jshint: {
      globals: {
        exports: true
      }
    },
    jasmine_node: {
      specFolderName: "./test",
      projectRoot: "./lib",
      requirejs: true,
      forceExit: true,
      jUnit: {
        report: false,
        savePath : "./build/reports/jasmine/",
        useDotNotation: true,
        consolidate: true
      }
    }
  });

  grunt.loadNpmTasks('grunt-requirejs');
  grunt.loadNpmTasks('grunt-jasmine-node');

  // Default task.
  grunt.registerTask('default', 'lint requirejs jasmine_node');
};
