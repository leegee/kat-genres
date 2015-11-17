require.config({
    baseUrl: '/public/',
    shim: {
        'jQuery': {
            exports: 'jQuery'
        },
        'underscore': {
            exports: '_'
        },
        'elasticsearch': {
            deps: [
                'jQuery'
            ]
        },
        'backbone': {
            deps: [
                'underscore',
                'jQuery'
            ],
            exports: 'backbone'
        }
    },
    map: {
        '*': {
            jQuery: 'jQuery',
            backbone: 'backbone',
            underscore: 'underscore'
        }
    },
    paths: {
        elasticsearch: 'bower/elasticsearch/elasticsearch.jquery.min',
        jQuery:        'bower/jquery/dist/jquery.min',
        underscore:    'bower/underscore/underscore-min',
        backbone:      'bower/backbone/backbone-min'
        // text: '../lib/require/text',
    }
});

requirejs([
    'jQuery', 'lib/Router.js'
], function (
    jQuery, Router
) {
    'use strict';
    jQuery(document).ready( function () {
        new Router().start();
    });
});

