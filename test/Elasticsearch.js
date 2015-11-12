/** Test our elasticsearch interface class */
/* globals describe, it, before, after */

"use strict";
var chai          = require('chai'),
    should        = require('chai').should(),
    log4js        = require('Log4js'),
    Elasticsearch = require('../lib/Elasticsearch.js')
;

log4js.replaceConsole();

// before( function (done){
//     Install test fixtures
// });

describe('Elasticsearch class', function (){
    it( 'is as expected', function () {
        var es = new Elasticsearch();
        should.equal( typeof es, "object", "Construted" );
        es.should.be.instanceof(Elasticsearch, "Construted class" );
    });

    it( 'lists generes', function (done) {
        new Elasticsearch().genreList('Sci-fi').then( function (res){
            var genres = res.aggregations.genres.buckets;
            should.equal(typeof genres, 'object', 'genres list');
            genres.should.be.instanceof(Array, 'genres list');
            genres.should.have.length.gt(3);
            genres.should.include('Thriller','Drama','Adventure');
            done();
        }).catch( function (e) {
            done();
        });
    });

    it( 'search with term', function (done) {
        new Elasticsearch().search('Sci-fi').then( function (res){
            var hits = res.hits.hits;
            should.equal(typeof hits, 'object', 'hits list');
            hits.should.be.instanceof(Array, 'hits list');
            hits.should.have.length.gt(0);
            done();
        }).catch( function (e) {
            done();
        });
    });

    it( 'search without term', function (done) {
        new Elasticsearch().search().then( function (res){
            var hits = res.hits.hits;
            should.equal(typeof hits, 'object', 'hits list');
            hits.should.be.instanceof(Array, 'hits list');
            hits.should.have.length.gt(0);
            done();
        }).catch( function (e) {
            done();
        });
    });

});

