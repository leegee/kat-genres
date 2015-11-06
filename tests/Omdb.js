/** e2e.t — end-to-end test */
/* globals describe, it, before, after */

"use strict";
var chai     = require('chai'),
    expect   = chai.expect,
    should   = require('chai').should(),
    log4js   = require('Log4js'),
    Omdb     = require('../lib/Omdb.js'),
    sqlite3  = require('sqlite3').verbose()
;

log4js.replaceConsole();

describe('Omdb class', function (){
    it( 'is as expected', function () {
        var agent = new Omdb();
        should.equal( typeof agent, "object", "Construted" );
        agent.should.be.instanceof(Omdb, "Construted class" );
        should.equal( typeof agent.get, "function", "has method 'get'" );
    });

    it( 'gets generes for Movies', function (done) {
        new Omdb().get('Jaws', function (genres){
            should.equal(typeof genres, 'object', 'genres list');
            genres.should.be.instanceof(Array, 'genres list');
            genres.should.have.length(3);
            genres.should.include('Thriller','Drama','Adventure');
            done();
        });
    });
});

