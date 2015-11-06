/** e2e.t — end-to-end test */
/* globals describe, it */

"use strict";
var chai     = require('chai'),
    expect   = chai.expect,
    should   = require('chai').should(),
    fs       = require('fs'),
    log4js   = require('Log4js'),
    Importer = require('../lib/Importer.js'),
    Torrent  = require('../lib/Torrent.js'),
    sqlite3  = require('sqlite3').verbose(),

    FULL_TEST = false
;

var $depth = 11;
var config = {
    appenders: [{
        type: "console",
        layout: {
            type    : "pattern",
            pattern : "%[%p {%x{ln}} -%]\t%m",
            tokens: {
                ln : function() {
                    // The caller:
                    return (new Error).stack.split("\n")[$depth]
                    // Just the filename, line:
                    .replace(/^\s+at\s+(\S+)\s\((.+?)([^\/]+):(\d+):\d+\)$/, function (){
                        return arguments[1] +' '+ arguments[3] +' line '+ arguments[4];
                        // return arguments[0] +' '+ arguments[2] +' line '+arguments[3]
                    });
                }
            }
        }
    }]
};

// log4js.configure(config, {});
log4js.replaceConsole();
// var logger = log4js.getLogger();
// logger.setLevel('TRACE');

var db, sthInsertTorrent;

before(function () {
    db = new sqlite3.Database(':memory:');
    db.serialize(function() {
        Torrent.createSchema(db);
        sthInsertTorrent = Torrent.sthInsertTorrent(db);
    });
});

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
            importer.download( 'http://lee/dailydump.txt.gz', function () {
                it('has size', function (){
                    var stats = fs.statSync( importer.options.katCsv );
                    stats.size.should.be.gt(0);
                    done();
                });
            });
        });
    }

    it('imports to DB', function (done){
        this.timeout( 1000 * 60 * 3 );
        var importer = new Importer({
            katCsv: 'tests/fixtures/1000_rows.csv'
        });
        it('has archive', function (){
            fs.existsSync(importer.options.katCsv).should.be.true
        });
        should.equal( typeof importer.repopulate, 'function', 'method');
        importer.repopulate( sthInsertTorrent, done );
    })
});

