/** e2e.t — end-to-end test */
/* globals describe, it, before, after */

"use strict";
var chai     = require('chai'),
    expect   = chai.expect,
    should   = require('chai').should(),
    log4js   = require('Log4js'),
    Dbpedia  = require('../lib/Dbpedia.js'),
    sqlite3  = require('sqlite3').verbose()
;

log4js.replaceConsole();

describe('Dbpedia class', function (){
    it( 'is as expected', function () {
        var agent = new Dbpedia();
        should.equal( typeof agent, "object", "Construted" );
        agent.should.be.instanceof(Dbpedia, "Construted class" );
        should.equal( typeof agent.get, "function", "has method 'get'" );
    });

    it( 'get functions', function (done) {
        new Dbpedia().get('NCIS', function (genres){
            should.equal(typeof genres, 'object', 'genres list');
            genres.should.be.instanceof(Array, 'genres list');
            genres.should.have.length(2);
            genres.should.include('Drama');
            genres.should.include('Action_(fiction)');
            done();
        });
    });
});

