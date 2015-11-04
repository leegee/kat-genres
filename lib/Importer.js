/** Importer.js */

"use strict";

var httpRequest = require('http-request'),
    fs          = require('fs'),
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
    cachePath: 'archive.gz',
    redisOptions: {}
};

module.exports.prototype.download = function (downloadFrom, next) {
    var self = this;
    httpRequest.get({
        url: downloadFrom,
        gzip: true,
        progress: function (current, total) {
            console.log('Got '+current+' bytes of '+ total);
        }
    }, this.options.cachePath, function (err, res) {
        if (err) throw err;
        if (res.code !== 200) throw new Error( 'HTTP response: '+res.code );
        console.log( res.headers );
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
