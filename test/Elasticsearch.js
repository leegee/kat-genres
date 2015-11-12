/** Test our elasticsearch interface class */
/* globals describe, it, before, after */

"use strict";
var chai          = require('chai'),
    should        = require('chai').should(),
    log4js        = require('Log4js'),
    Elasticsearch = require('../lib/Elasticsearch.js')
;

log4js.replaceConsole();

describe('Elasticsearch class', function (){
    it( 'is as expected', function () {
        var es = new Elasticsearch();
        should.equal( typeof es, "object", "Construted" );
        es.should.be.instanceof(Elasticsearch, "Construted class" );
    });

    it( 'lists generes', function (done) {
        new Elasticsearch().genreList('Sci-fi').then( function (genres){
            should.equal(typeof genres, 'object', 'genres list');
            genres.should.be.instanceof(Array, 'genres list');
            genres.should.have.length(3);
            genres.should.include('Thriller','Drama','Adventure');
            done();
        }).catch( function (e) {
            done();
        });
    });


});

