var elasticsearch = require('elasticsearch');
var config        = require('../package.json');

var client = new elasticsearch.Client({
    host: 'localhost:'+config.elasticsearch.port,
    log: 'trace',
    apiVersion: "2.1"
});

client.indices.delete({
    index: "torrents",
    ignore: [404]
}).then( function (err, resp, respcode) {
    console.log(err, resp, respcode);
    client.index({
        index: "torrents",
        type: "torrrent",
        body: {
            "id":     "1",
            "title":  "Test",
            "genres": ['test','foo'],
            "torrent_info_url": 'http://foo.com'
        }
    });
}).then( function (err, resp, respcode) {
    console.log(err, resp, respcode);
});
