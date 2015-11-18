// define([
//    'mocha', 'chai', 'jQuery', '../public/lib/Router.js'
// ], function (
//     mocha, chai, jQuery, Router
// ) {
//     'use strict';
//     var expect       = chai.expect,
//         $testDocument = null,
//         testWindow   = null;

//     jQuery(document).ready( function () {
//         new Router().start();
//     });

//     return function () {alert('oh')}
// });


define([
   'mocha', 'chai', 'jQuery'
], function (
    mocha, chai, jQuery
) {

    return function (baseURLpath) {

        var testWindow, $testDocument;

        function loadURL (path, done) {
            var iframe = jQuery('#test-document');
            iframe.attr('src', 'http://localhost:8080' + baseURLpath + path);
            iframe.on('load', function () {
                testWindow   = iframe.get(0).contentWindow.document;;
                $testDocument = jQuery(this).contents()
                $testDocument.get(0).addEventListener(
                    'rendered',
                    function () {
                        console.log($testDocument);
                        done();
                    },
                    false
                );
            });
        }

        describe('GUI Tests', function () {

            before('load /', function (done){
                loadURL('/', done);
            });

            describe('initially lists genres', function () {
                it('should contain a list of torrents', function () {
                    chai.expect(
                        $testDocument.find('ul.torrents').children()
                    ).length.to.be.gt(0);
                });
            });

        });
    };
});
