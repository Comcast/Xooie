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
      baseUrl: "xui",
      paths: {
        jquery: "empty:",
        xui: "xui",
        base: "base",
        carousel: "carousel",
        dropdown: "dropdown",
        tab: "tab",
        addons_base: "addons/base",
        carousel_lentils: "addons/carousel_lentils",
        carousel_pagination: "addons/carousel_pagination",
        tab_animation: "addons/tab_animation",
        tab_automation: "addons/tab_automation"
      },
      name: "xui",
      include: ["carousel", "dropdown", "tab", "carousel_lentils", "carousel_pagination", "tab_automation", "tab_animation"],
      out: "build/xui.js"
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
      specFolderName: "",
      projectRoot: "./spec",
      requirejs: true,
      forceExit: true
    }
  });

  grunt.loadNpmTasks('grunt-requirejs');
  grunt.loadNpmTasks('grunt-jasmine-node');

  // Default task.
  grunt.registerTask('default', 'lint jasmine_node requirejs');
};
