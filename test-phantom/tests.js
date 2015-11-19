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

        function loadURL (path, next) {
            var iframe = jQuery('#test-document');
            var calls = 0;
            iframe.attr('src', 'http://localhost:8080' + baseURLpath + path);
            iframe.on('load', function () {
                iframe.off('load');
                testWindow   = iframe.get(0).contentWindow.document;;
                $testDocument = jQuery(this).contents()
                $testDocument.get(0).addEventListener(
                    'rendered',
                    function () {
                        if (calls===0) {
                            console.log("NEXT");
                            next();
                        }
                        calls ++;
                        console.log("CALLS="+calls);
                    },
                    false
                );
            });
        }

        describe('GUI Tests', function () {

            describe('initially lists genres', function () {
                before('load /', function (done){
                    loadURL('/', done);
                });
                it('should contain a list of genres', function () {
                    chai.expect(
                        $testDocument.find('ul.torrents').children()
                    ).length.to.be.gt(0);
                });
            });

            describe('follows genre list for torrents', function () {
                it('should contain a link to a torrent page', function (done) {
                    $testDocument.find('ul.torrents li a').first().get(0).click(
                        function (){
                            expect(1).to.be(1);
                            done();
                        })
                });
            });

        });
    };
});
