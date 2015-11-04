/** e2e.t — end-to-end test */
/* globals describe, it */

"use strict";
var chai     = require('chai'),
    expect   = chai.expect,
    should   = require('chai').should(),
    fs       = require('fs'),
    log4js   = require('Log4js'),
    Importer = require('../lib/Importer.js'),
    redis    = require('then-redis'),

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

log4js.configure(config, {});
log4js.replaceConsole();
// var logger = log4js.getLogger();
// logger.setLevel('TRACE');

var db = redis.createClient();

before(function () {
  db.flushdb().then(function (reply) {
    expect(reply).eql('OK');
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
                    var stats = fs.statSync( importer.options.outputCsv );
                    stats.size.should.be.gt(0);
                    done();
                });
            });
        });
    }

    it('imports to Redis', function (done){
        this.timeout( 20000 );
        var importer = new Importer();
        it('has archive', function (){
            fs.existsSync(importer.options.outputCsv).should.be.true
        });
        should.equal( typeof importer.repopulate, 'function', 'method');
        importer.repopulate( done );
    })


});

