module.exports = function(grunt) {

  var version = '0.0.1';

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    meta: {
      version: version,
      banner: '/*! Xooie - v<%= meta.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> */'
    },
    requirejs: {
      baseUrl: "xooie",
      paths: {
        jquery: "empty:",
        async: "empty:",
        xooie: "xooie",
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
      name: "xooie",
      include: ["carousel", "dropdown", "tab", "carousel_lentils", "carousel_pagination", "tab_automation", "tab_animation"],
      out: "build/xooie-" + version + ".js"
    },
    lint: {
      files: ['*.js', 'spec/**/*.js']
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'test'
    },
    jshint: {
      globals: {
        exports: true,
        // Requirejs
        require: true,
        requirejs: true,
        define: true,
        // Jasmine
        it: true,
        describe: true,
        beforeEach: true,
        expect: true
      }
    },
    jasmine: {
      amd: true,
      helpers: ["lib/require.js", "lib/config.js", "lib/jquery.js", "lib/micro_tmpl.js", "lib/jasmine-jquery.js"],
      specs: ["spec/*.spec.js", "spec/**/*.spec.js"],
      timeout: 10000,
      phantomjs: {
        'ignore-ssl-errors': true
      }
    }
  });

  grunt.loadNpmTasks('grunt-jasmine-runner');
  grunt.loadNpmTasks('grunt-requirejs');

  grunt.registerTask('test', 'lint jasmine');
  // Default task.
  grunt.registerTask('default', 'test requirejs');
};
