#!/usr/bin/env node

var Elasticsearch = require('../lib/Elasticsearch.js'),
    Torrent = require('../lib/Torrent.js'),
    Stream  = require('bufferedstream'),
    mach    = require('mach'),
    app     = mach.stack(),
    es      = new Elasticsearch()
;

app.use(mach.logger);

app.get('/genres', function (conn) {
    return es.genreList().then( function (json) {
        conn.json(200, json.aggregations);
    });
});

app.get('/search', function (conn) {
    return es.search().then( function (json) {
        conn.json(200, json );
    });
});

app.get('/search/:term', function (conn) {
    return es.search( conn.params.term ).then( function (json) {
        conn.json(200, json );
    });
});

mach.serve(app);
