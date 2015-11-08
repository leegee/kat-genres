/** e2e.t — end-to-end test */
/* globals describe, it, before, after */

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
                    return (new Error()).stack.split("\n")[$depth]
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

var db;

before(function () {
    db = new sqlite3.Database(':memory:');
    db.serialize(function() {
        Torrent.createSchema(db);
    });
});

describe('KAT import', function (){
    it('should load Importer', function (){
        var importer = new Importer({db:db});
        should.equal( typeof importer, "object", "Construted" );
        importer.should.be.instanceof(Importer, "Construted class" );
    });

    if (FULL_TEST){
        it( 'downloads', function (done){
            this.timeout( 10000 );
            var importer = new Importer({db:db});
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

    // it('imports to DB', function (done){
    //     before( function (){
    //         db.run('TRUNCATE torrents');
    //     });
    //     var importer = new Importer({
    //         katCsv: 'tests/fixtures/20_rows.csv',
    //         db: db
    //     });
    //     it('has archive', function (){
    //         fs.existsSync(importer.options.katCsv).should.be.true();
    //     });
    //     should.equal( typeof importer.loadTorrentsFromCSV, 'function', 'method');
    //     importer.loadTorrentsFromCSV( done );
    // });

    it('imports and adds genres', function (done){
        this.timeout( 20000 );
        before( function (){
            db.run('TRUNCATE torrents');
        });
        var importer = new Importer({
            katCsv: 'tests/fixtures/5_rows.csv',
            db: db
        });
        it('has archive', function (){
            fs.existsSync(importer.options.katCsv).should.be.true();
        });
        should.equal( typeof importer.loadTorrentsFromCSV, 'function', 'method');
        importer.loadTorrentsFromCSV( function (){
            Torrent.showAll( db, done );
        });
    });
});

