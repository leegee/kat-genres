module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        jshint: {
            options: {
                node: true
            },
            files: ['lib/**/*.js', 'tests/**/*.js']
        },

        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                },
                src: ['tests/**/*.js']
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-test');

    grunt.registerTask('test', ['jshint', 'mochaTest']);
    grunt.registerTask('default', ['jshint', 'mochaTest']);
};
