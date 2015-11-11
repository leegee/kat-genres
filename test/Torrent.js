/** test Torrent.js */
/* globals describe, it, before, after */

"use strict";
var chai     = require('chai'),
    expect   = chai.expect,
    should   = require('chai').should(),
    log4js   = require('Log4js'),
    Torrent  = require('../lib/Torrent.js'),
    sqlite3  = require('sqlite3').verbose()
;

log4js.replaceConsole();

var db;

before( function () {
    db = new sqlite3.Database(':memory:');
    db.serialize(function() {
        Torrent.createSchema(db);
    });
});

after( function () {
    db.close();
});

describe('Torrent', function (){
    it('should load Torrent', function (){
        var torrent = new Torrent({db:db}, []);
        should.equal( typeof torrent, "object", "Construted" );
        torrent.should.be.instanceof(Torrent, "Construted class" );
    });

    it('should get torrent_info_url', function (done){
        this.timeout( 20000 );
        var torrent = new Torrent({db:db}, ['TestID', 'NCIS S01E01', 'TV']);
        torrent.saveWithMetaInfo().then( function() {
            done();
        }).catch( function (e){
            console.error(e);
            done();
        });
    });
});

