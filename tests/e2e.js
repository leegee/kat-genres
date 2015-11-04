/** e2e.t — end-to-end test */
/* globals describe, it */

"use strict";
var chai     = require('chai'),
    expect   = chai.expect,
    should   = require('chai').should(),
    fs       = require('fs'),
    Log4js   = require('Log4js'),
    Importer = require('../lib/Importer.js'),

    FULL_TEST = false
;

Log4js.replaceConsole();
// var logger = Log4js.getLogger();
// logger.setLevel('TRACE');

describe('Import from Kat', function (){
    it('should load', function (){
        var importer = new Importer();
        it( 'constructs', function () {
            should.equal( typeof importer, "object", "Construted" );
            should.equal( importer instanceof Importer, "object", "Construted class" );
        });
    });

    if (FULL_TEST){
        it( 'downloads', function (done){
            this.timeout( 20000 ); // circa 670 MB
            var importer = new Importer();
            should.equal( typeof importer.download, 'function', 'method');
            var after = function () {
                fs.existsSync(importer.options.cachePath).should.be.true;
                done();
            };
            importer.download( 'http://lee/dailydump.txt.gz', after );
        });
    }

    it('imports to Redis', function (){
        var importer = new Importer();
        it('has archive', function (){
            fs.existsSync(importer.options.cachePath).should.be.true;
        });
        should.equal( typeof importer.repopulate, 'function', 'method');
        importer.repopulate();
    })


});

