module.exports = function(grunt) {

  var version = '0.0.6';

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
      baseUrl: ".",
      paths: {
        jquery: "empty:",
        async: "empty:"
      },
      name: "xooie",
      include: [
        "xooie/carousel",
        "xooie/dropdown",
        "xooie/tab",
        "xooie/addons/carousel_lentils",
        "xooie/addons/carousel_pagination",
        "xooie/addons/dropdown_accordion",
        "xooie/addons/tab_automation",
        "xooie/addons/tab_animation"
      ],
      out: "build/xooie-" + version + ".js",
      optimize: "uglify"
    },
    lint: {
      files: ['*.js', 'xooie/**/*.js', 'spec/**/*.js']
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
