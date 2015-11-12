var client = require('lib/Elasticsearch.js');

client.indices.delete({
    index: "torrents",
    ignore: [404]
}).then( function (err, resp, respcode) {
    console.log(err, resp, respcode);
    client.indices.create({
        index: "torrents",
        body: {
            "mappings": {
                "torrent": {
                    "properties": {
                        "id":     {"type": "string", "index": "not_analyzed"},
                        "title":  {"type": "string", "index": "not_analyzed"},
                        "genres": {"type": "string", "index": "not_analyzed"},
                        "torrent_info_url": {
                                   "type": "string", "index": "not_analyzed"
                        }
                    }
                }
            }
        }
    });
}).then( function (err, resp, respcode) {
    console.log(err, resp, respcode);
});
