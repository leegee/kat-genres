/** Test Importer.js */
/* globals describe, it, before, after */

"use strict";
var chai     = require('chai'),
    expect   = chai.expect,
    should   = require('chai').should(),
    fs       = require('fs'),
    path     = require('path'),
    log4js   = require('Log4js'),
    Importer = require('../lib/Importer.js'),
    Torrent  = require('../lib/Torrent.js'),

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


describe('KAT import', function (){
    it('should load Importer', function (){
        var importer = new Importer();
        should.equal( typeof importer, "object", "Construted" );
        importer.should.be.instanceof(Importer, "Construted class" );
    });

    if (FULL_TEST){
        it( 'downloads', function (done){
            this.timeout( 10000 );
            var importer = new Importer();
            should.equal( typeof importer.download, 'function', 'method');
            importer.download( 'http://lee/dailydump.txt.gz').then( function () {
                it('has size', function (){
                    var stats = fs.statSync( importer.options.katCsv );
                    stats.size.should.be.gt(0);
                    done();
                });
            });
        });
    }

    it('imports and adds genres', function (done){
        this.timeout( 20000 );
        var importer = new Importer({
            katCsv: __dirname+'/fixtures/5_rows.csv'
        });
        it('has archive', function (){
            fs.existsSync(importer.options.katCsv).should.be.true();
        });
        should.equal( typeof importer.loadTorrentsFromCSV, 'function', 'method');
        importer.loadTorrentsFromCSV( function (){
            done();
        });
    });

    // it('imports and adds genres on 1,000', function (done){
    //     this.timeout( 20000 );
    //     var importer = new Importer({
    //         katCsv: __dirname+'/fixtures/1000_rows.csv',
    //     });
    //     it('has archive', function (){
    //         fs.existsSync(importer.options.katCsv).should.be.true();
    //     });
    //     should.equal( typeof importer.loadTorrentsFromCSV, 'function', 'method');
    //     importer.loadTorrentsFromCSV( done );
    // });
});

