/** Importer.js */

"use strict";

var request = require('request'),
    fs          = require('fs'),
    zlib        = require('zlib'),
    redis       = require('then-redis'),
    parse       = require('csv-parse')
;

module.exports = function Importer (options){
    options = options || {};
    Object.keys( this.options ). forEach( function (key){
        this[key] = options.hasOwnProperty(key)? options[key] : this.options[key];
    }, this);
};

module.exports.prototype.options = {
    cachePath: 'torrents.gz',
    outputCsv: 'torrents.csv',
    redisOptions: {}
};

module.exports.prototype.download = function (downloadFrom, next) {
    var self = this;
    var outStream = fs.createWriteStream( this.options.outputCsv );
    var req = request({
        url: downloadFrom,
        headers: {'accept-encoding': 'gzip'}
    });

    req.on('error', function (err) {
        throw err;
    });

    req.on('response', function (res) {
        if (res.statusCode !== 200) throw new Error('HTTP status '+res.statusCode)

        console.debug( res.headers );

        var encoding = res.headers['content-encoding']
        if (encoding == 'gzip'
            || res.headers['content-type'] == 'application/x-gzip'
        ) {
            res.pipe(zlib.createGunzip()).pipe(outStream)
        } else if (encoding == 'deflate') {
            res.pipe(zlib.createInflate()).pipe(outStream)
        } else {
            res.pipe(outStream)
        }

        next();
    });
};

/*
torrent_info_hash|torrent_name|torrent_category|torrent_info_url|torrent_download_url|size|category_id|files_count|seeders|leechers|upload_date|verified
*/

module.exports.prototype.repopulate = function (install, next) {
    var db = redis.createClient( this.redisOptions );

    var parser = parse({delimiter: '|'});

    parser.on('readable', function(){
        while(record = parser.read()){
            console.log(record);
        }
    });

    parser.on('error', function(err){
        console.error(err.message);
    });

    parser.on('finish', function(){
        console.debug("Done");
        next();
    });

    fs.createReadStream( this.cachePath ).pipe( parser );
};
