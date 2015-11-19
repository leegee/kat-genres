/** test Torrent.js */
/* globals describe, it, before, after */

"use strict";
var chai     = require('chai'),
    expect   = chai.expect,
    should   = require('chai').should(),
    log4js   = require('Log4js'),
    Torrent  = require('../lib/Torrent.js'),
;

log4js.replaceConsole();

describe('Torrent', function (){
    it('should load Torrent', function (){
        var torrent = new Torrent({}, []);
        should.equal( typeof torrent, "object", "Construted" );
        torrent.should.be.instanceof(Torrent, "Construted class" );
    });

    it('should get info for TV', function (done){
        this.timeout( 20000 );
        var torrent = new Torrent({}, ['TestID', 'NCIS S01E01', 'TV']);
        torrent.saveWithMetaInfo().then( function (res) {
            res.should.contain( 'Drama', 'Action (fiction)' );
            done();
        }).catch( function (e){
            console.error(e);
            done();
        });
    });

    it('should get info for Movies', function (done){
        this.timeout( 20000 );
        var torrent = new Torrent({}, ['TestID2', 'Jaws', 'Movies']);
        torrent.saveWithMetaInfo().then( function (res) {
            res.should.contain( 'Drama', 'Action (fiction)' );
            done();
        }).catch( function (e){
            console.error(e);
            done();
        });
    });
});

