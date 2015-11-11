var mach = require('mach'),
    app = mach.stack(),
    Torrent = require('../lib/Torrent.js'),
    sqlite3 = require('sqlite3'),
    Stream = require('bufferedstream'),
    db = new sqlite3.Database('torrents.db')
;

app.use(mach.logger);

app.get('/all', function (conn) {
    var content = conn.response.content = new Stream;
    db.all("SELECT * FROM torrents", function(err, rows) {
        if (err){
            content.write( JSON.stringify({error:err}) );
        }
        else if (rows === null){
            content.write( JSON.stringify({error:'Table is empty'}) );
        }
        else {
            console.log(rows.length, 'rows');
            rows.forEach(function (row) {
                content.write(
                    [row.torrent_name, row.title,row.genres].join("\t")+"\n"
                );
            });
        }
    });
});

mach.serve(app);
