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
var logger = Log4js.getLogger();
logger.setLevel('FATAL');

describe('Import from Kat', function (){
    it('should download', function (){
        var importer = new Importer();
        it( 'Constructs', function () {
            should.equal( typeof importer, "object", "Construted" );
            should.equal( importer instanceof Importer, "object", "Construted class" );
        });
    });
});

