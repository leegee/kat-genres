requirejs([
    'Config.js'
], function (
    Config
) {
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
});

