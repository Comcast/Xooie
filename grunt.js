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
      baseUrl: "lib",
      paths: {
        xui: 'ui/xui',
        jquery: "vendor/jquery",
        base: "ui/base",
        carousel: "ui/carousel",
        dropdown: "ui/dropdown"
      },
      name: "carousel",
      insertRequire: ['carousel'],
      out: "build/carousel.js"
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
