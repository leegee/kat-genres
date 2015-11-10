var mach = require('mach'),
    app = mach.stack(),
    Torrent = require('../lib/Torrent.js'),
    sqlite3 = require('sqlite3'),
    Stream = require('bufferedstream'),
    db = new sqlite3.Database('torrents.db')
;

app.use(mach.logger);

app.get('/', function () {
    return '<a href="/b">go to b</a>';
});

app.get('/all', function (conn) {
    var content = conn.response.content = new Stream;
    db.all("SELECT * FROM torrents", function(err, rows) {
        rows.forEach(function (row) {
            content.write(
                [row.torrent_name, row.title,row.genres].join("\t")+"\n"
            );
        });
        db.close();
    });
});

app.get('/c/:id', function (conn) {
    return JSON.stringify({
        method: conn.method,
        location: conn.location,
        headers: conn.request.headers,
        params: conn.params
    }, null, 2);
});

mach.serve(app);
