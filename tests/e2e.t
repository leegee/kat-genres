/** e2e.t — end-to-end test */

"use strict";
var chai     = require('chai'),
    expect   = chai.expect,
    should   = require('chai').should(),
    fs       = require('fs'),
    path     = require('path'),
    Log4js   = require('Log4js'),
    Importer   = require('../lib/Importer.js')
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
    it( 'downloads', function (done){
        var importer = new Importer();
        should.equal( typeof importer.download, 'function', 'method');
        var path = importer.download();
        path.should.equal('foo');
        done();
    });
});

