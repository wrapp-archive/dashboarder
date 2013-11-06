var exec = require("child_process").exec;

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'public/javascripts/app.js',
        dest: 'public/javascripts/app.min.js'
      }
    },
    jshint: {
      gruntfile: {
        src: 'Gruntfile.js'
      },
      dashboarder: {
        src: 'public/js/dashboarder.js',
        options: {
          laxcomma: true
        }
      }
    },
    stylus: {
      compile: {
        files: {
          "public/css/dashboarder.css": ["stylus/**/*.styl"]
        }
      }
    },
    watch: {
      gruntfile: {
        files: 'Gruntfile.js',
        tasks: ['jshint:gruntfile'],
        options: { atBegin: true }
      },
      stylus: {
        files: ['stylus/*.styl'],
        tasks: ['stylus:compile'],
        options: { atBegin: true }
      },
      js: {
        files: 'public/js/dashboarder.js',
        tasks: ['jshint:dashboarder'],
        options: {
          atBegin: true,
          livereload: true
        }
      },
      html: {
        files: "public/index.html",
        options: { livereload: true }
      },
      css: {
        files: 'public/**/*.css',
        options: { livereload: true }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-stylus');
  grunt.loadNpmTasks('grunt-notify');

  grunt.registerTask('default', 'watch');
  grunt.registerTask('test', 'jshint');
  grunt.registerTask('heroku:production', ['stylus']);
  grunt.registerTask('build', ['stylus']);

  function execCommands(commands, callback) {
    if (commands.length === 0) return callback(true);
    var command = commands[0];

    grunt.log.writeln("Executing command " + command);
    exec(command, function(error, stdout) {
      grunt.log.writeln(stdout);
      if (error) {
        grunt.fail.warn(error);
        callback(false);
      } else execCommands(commands.slice(1), callback);
    });
  }

  grunt.registerTask('gh-pages', function() {
    var commands = [
      "git checkout gh-pages",
      "git merge -s subtree --no-edit master",
      "git push origin gh-pages",
      "git checkout master"
    ];

    execCommands(commands, this.async());
  });
};
