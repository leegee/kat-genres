/** e2e.t — end-to-end test */
/* globals describe, it, before, after */

"use strict";
var chai     = require('chai'),
    should   = require('chai').should(),
    log4js   = require('Log4js'),
    Omdb     = require('../lib/Omdb.js')
;

log4js.replaceConsole();

describe('Omdb class', function (){
    it( 'is as expected', function () {
        var agent = new Omdb();
        should.equal( typeof agent, "object", "Construted" );
        agent.should.be.instanceof(Omdb, "Construted class" );
        should.equal( typeof agent.get, "function", "has method 'get'" );
    });

    it( 'gets generes for Movies, no yaer', function (done) {
        new Omdb().get('Jaws', null).then( function (err, genres){
            should.equal(typeof genres, 'object', 'genres list');
            genres.should.be.instanceof(Array, 'genres list');
            genres.should.have.length(3);
            genres.should.include('Thriller','Drama','Adventure');
            done();
        }).catch( function (e) {
            done();
        });
    });

    it( 'gets generes for Movies', function (done) {
        new Omdb().get('Star Wars', 1977).then( function (err, genres){
            should.equal(err, null, 'No error');
            should.equal(typeof genres, 'object', 'genres list');
            genres.should.be.instanceof(Array, 'genres list');
            genres.should.have.length(3);
            genres.should.include('Action','Fantasy','Adventure');
            done();
        }).catch( function (e) {
            done();
        });
    });

});

