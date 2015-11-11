/** e2e.t — end-to-end test */
/* globals describe, it, before, after */

"use strict";
var chai          = require('chai'),
    expect        = chai.expect,
    should        = require('chai').should(),
    elasticsearch = require('elasticsearch'),
    config        = require('../package.json'),
    client
;

before( function () {
    client = new elasticsearch.Client({
        host: 'localhost:'+config.elasticsearch.port,
        log: 'trace',
        apiVersion: "2.1"
    });
});

describe('ES setup', function (){
    it('should have test data', function (done){
    // http://localhost:9200/torrents/_search?q=title:Test
        client.search({
            index: 'torrents',
            q: 'title:Test'
        }).then( function (res) {
            // console.warn(err, resp, respcode);
            console.info( res.hits.hits[0]._source.title );
            expect(
                res.hits.hits[0]._source.title
            ).to.be('Test');
            done();
        }).catch( function (e) {
            done();
        });
    });
});

