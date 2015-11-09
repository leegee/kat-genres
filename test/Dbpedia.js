/** e2e.t — end-to-end test */
/* globals describe, it, before, after */

"use strict";
var chai     = require('chai'),
    expect   = chai.expect,
    should   = require('chai').should(),
    log4js   = require('Log4js'),
    Dbpedia  = require('../lib/Dbpedia.js')
;

log4js.replaceConsole();

describe('Dbpedia class', function (){
    it( 'is as expected', function () {
        var agent = new Dbpedia();
        should.equal( typeof agent, "object", "Construted" );
        agent.should.be.instanceof(Dbpedia, "Construted class" );
        should.equal( typeof agent.get, "function", "has method 'get'" );
    });

    it( 'gets generes for TV', function (done) {
        new Dbpedia().get('NCIS', function (err, genres){
            should.equal(err, null, 'No error');
            should.equal(typeof genres, 'object', 'genres list');
            genres.should.be.instanceof(Array, 'genres list');
            genres.should.have.length(2);
            genres.should.include('Drama', 'Action_(fiction)');
            done();
        });
    });
});

