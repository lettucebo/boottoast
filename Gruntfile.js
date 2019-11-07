module.exports = function(grunt) {
  "use strict";
  grunt.initConfig({
    uglify: {
      options: {
        compress: true,
        mangle: true,
        banner: grunt.file.read("header.txt"),
        output: {
          quote_style: 3
        }
      },
      my_target: {
        files: {
          "dist/boottoast.min.js": ["boottoast.js"]
        }
      }
    },

    jshint: {
      options: {
        jshintrc: ".jshintrc",
        force: true
      },
      all: ["boottoast.js"]
    },

    karma: {
      unit: {
        // configFile: 'karma.conf.js'
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-karma");

  grunt.registerTask("default", ["uglify", "jshint", "karma"]);
};
