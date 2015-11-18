define([
   'mocha', 'chai', 'jQuery', '../public/lib/Router.js'
], function (
    mocha, chai, jQuery, Router
) {
    'use strict';
    var expect       = chai.expect,
        testDocument = null,
        testWindow   = null;

    jQuery(document).ready( function () {
        new Router().start();
    });

    return function () {alert('oh')}
});


//     return function (baseURLpath) {

//         function loadURL (path, done) {
//             var iframe = jQuery('#test-document');
//             iframe.ready( function () {
//                 testWindow   = iframe.get(0).contentWindow.document;;
//                 testDocument = testWindow.document;
//                 done();
//             })
//             iframe.attr('src', 'http://localhost:8080' + baseURLpath + path);
//         }

//         describe('GUI Tests', function () {

//             before('load /', function (done){
//                 loadURL('/', done);
//             });

//             describe('initially lists genres', function () {
//                 it('should contain a list of torrents', function () {
//                     console.log( '>>',
//                         jQuery('ul.torrents')
//                     );
//                 });
//             });

//         });
//     };
// });
