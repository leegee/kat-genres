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

before(function () {
    db = new sqlite3.Database(':memory:');
    db.serialize(function() {
        Torrent.createSchema(db);
    });
});

describe('Torrent', function (){
    it('should load Torrent', function (){
        var torrent = new Torrent({db:db}, []);
        should.equal( typeof torrent, "object", "Construted" );
        torrent.should.be.instanceof(Torrent, "Construted class" );
    });

    // it('should get title from KAT HTML', function () {
    //     var torrent = new Torrent({db:db}, []);
    //     torrent.katFields.torrent_category = 'TV';
    //     expect( torrent.setTitleFromHTML(
    //         '<li><a href="/ncis-tv2604/">View all <strong>NCIS</strong> episodes</a></li>'
    //     )).to.eql(true);
    // });

    it('should get torrent_info_url', function (done){
        this.timeout( 20000 );
        var torrent = new Torrent({db:db}, []);
        torrent.id = 'TestID';
        torrent.katFields.torrent_name = 'NCIS S01E01';
        torrent.katFields.torrent_category = 'TV';
        torrent.katFields.torrent_info_url = 'https://kat.cr/ncis-s13e07-hdtv-x264-lol-ettv-t11522935.html';
        torrent.save( function (){
            done();
        });
    });
});

