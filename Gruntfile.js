module.exports = function(grunt) {
    var Path          = require('path'),
        serveStatic   = require('serve-static'),
        child_process = require('child_process'),
        config        = require('./package.json'),
        sleep         = require('sleep'),
        esChild       = null
     ;

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-browserify2');

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


    grunt.registerTask('elasticsearch-start', 'Start Elasticsearch', function () {
        if (esChild === null) {
            grunt.log.writeln('Attempting elasticsearch start via '+config.elasticsearch.bin);
            esChild = child_process.spawn( config.elasticsearch.bin );
            esChild.on('close', function (code, signal) {
                grunt.log.writeln('elasticsearch stopping for signal '+signal);
            });
            grunt.log.writeln('Hang on...');
            sleep.sleep(5);
            grunt.log.writeln('elasticsearch started');
        }
    });

    grunt.registerTask('elasticsearch-stop', 'Start Elasticsearch', function () {
        if (esChild !== null) {
            esChild.kill('SIGTERM');
        }
    });

    grunt.registerTask('default', ['jshint', 'mochaTest']);
    grunt.registerTask('test', [
        'jshint',
        'elasticsearch-start',
        'mochaTest',
        'elasticsearch-stop'
    ]);
};



