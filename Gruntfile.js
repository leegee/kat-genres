var Path    = require('path'),
    serveStatic = require('serve-static'),
    config      = require('./package.json')
 ;

module.exports = function(grunt) {

    var connectCORDSmiddleware = function (connect) {
        return [
            connect().use('/', function (req, res, next) {
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
                res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,GET,PUT,POST,DELETE,HEAD,TRACE');
                return next();
            }),
            serveStatic(require('path').resolve('public'))
        ];
    }

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        jshint: {
            options: {
                node: true,
                esnext: true
            },
            files: ['lib/**/*.js', 'test/**/*.js', 'bin/**/*.js']
        },

        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                },
                src: ['test/**/*.js']
            }
        },

        connect: {
            server: {
                options: {
                    port: config.httpRestServer.port,
                    base: 'public',
                    keepalive: true,
                    debug: true,
                    middleware: connectCORDSmiddleware
                }
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-browserify2');

    grunt.registerTask('test', ['jshint', 'mochaTest']);
    grunt.registerTask('default', ['jshint', 'mochaTest']);
};












var expose, helper, path;

path = require('path');

helper = {
  require: function(_path) {
    return require(path.resolve(process.cwd(), _path));
  }
};

expose = (function(_this) {
  return function(grunt, bundle, key, val) {
    var file, fileOpts, files, i, len, results;
    if (key !== 'files') {
      return bundle.require(val, {
        expose: key
      });
    } else {
      results = [];
      for (i = 0, len = val.length; i < len; i++) {
        fileOpts = val[i];
        fileOpts.expand = true;
        fileOpts.flatten = true;
        fileOpts.dest = fileOpts.dest || '';
        files = grunt.file.expandMapping(fileOpts.src, fileOpts.dest, fileOpts);
        results.push((function() {
          var j, len1, results1;
          results1 = [];
          for (j = 0, len1 = files.length; j < len1; j++) {
            file = files[j];
            results1.push(bundle.require('./' + file.src, {
              expose: file.dest.substr(0, file.dest.indexOf('.'))
            }));
          }
          return results1;
        })());
      }
      return results;
    }
  };
})(this);

function browserify2_connect (grunt) {
  return this.registerMultiTask('browserify2', 'commonjs modules in the browser', function() {
    var afterHook, beforeHook, browserify, bundle, compile, config, debug, done, entry, exposeOpts, i, key, len, mount, opt, options, ref, ref1, ref2, ref3, server, targetConfig, val;
    done = this.async();
    browserify = require('browserify');
    config = grunt.config.get(this.name);
    targetConfig = config[this.target];
    options = this.options(this.data);
    entry = options.entry, mount = options.mount, server = options.server, debug = options.debug, compile = options.compile, beforeHook = options.beforeHook, afterHook = options.afterHook;
    bundle = browserify(entry);
    exposeOpts = [];
    if ((ref = targetConfig.options) != null ? ref.expose : void 0) {
      exposeOpts.push((ref1 = targetConfig.options) != null ? ref1.expose : void 0);
    }
    if ((ref2 = config.options) != null ? ref2.expose : void 0) {
      exposeOpts.push((ref3 = config.options) != null ? ref3.expose : void 0);
    }
    for (i = 0, len = exposeOpts.length; i < len; i++) {
      opt = exposeOpts[i];
      for (key in opt) {
        val = opt[key];
        expose(grunt, bundle, key, val);
      }
    }
    if (beforeHook) {
      beforeHook.call(this, bundle);
    }
    return bundle.bundle({
      debug: debug
    }, function(err, src) {
      var app, express_plugin, msg, time;
      if (err) {
        grunt.log.error(err);
      }
      if (!server && !compile) {
        grunt.log.error('either server or compile options must be defined.');
        done();
      }
      if (afterHook) {
        src = afterHook.call(this, src);
      }
      if (server) {
        time = new Date();
        express_plugin = function(req, res, next) {
          if (req.url.split('?')[0] === mount) {
            res.statusCode = 200;
            res.setHeader('last-modified', time);
            res.setHeader('content-type', 'text/javascript');
            return res.end(src);
          } else {
            return next();
          }
        };
        app = helper.require(server);
        app.use(express_plugin);
      }
      if (compile) {
        grunt.file.write(path.resolve(process.cwd(), compile), src);
        msg = "File written to: " + (grunt.log.wordlist([compile], {
          color: 'cyan'
        }));
        grunt.log.writeln(msg);
        return done();
      }
    });
  });
};

// ---
// generated by coffee-script 1.9.2
