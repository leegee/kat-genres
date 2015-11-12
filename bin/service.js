var mach = require('mach'),
    app = mach.stack(),
    Torrent = require('../lib/Torrent.js'),
    sqlite3 = require('sqlite3'),
    Stream = require('bufferedstream'),
    db = new sqlite3.Database('torrents.db'),
    Elasticsearch = require('../lib/Elasticsearch.js')
;

var es = new Elasticsearch();

app.use(mach.logger);

app.get('/genres', function (conn) {
    return es.genreList().then( function (json) {
        conn.json(200, json.aggregations);
    });
});

app.get('/all', function (conn) {
    return es.all().then( function (json) {
        conn.json(200, json );
    })
});

app.get('/search/:term', function (conn) {
    return es.all( conn.params.term).then( function (json) {
        conn.json(200, json );
    })
});

mach.serve(app);
