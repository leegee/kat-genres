/** Importer.js */

"use strict";

var request     = require('request'),
    fs          = require('fs'),
    zlib        = require('zlib'),
    redis       = require('then-redis'),
    parse       = require('csv-parse'),
    Base        = require('../lib/Base.js'),
    Torrent     = require('../lib/Torrent.js')
;

module.exports = function Importer (options){
    this.setOptions(options);
};

module.exports.prototype = Object.create( Base.prototype );
module.exports.prototype.constructor = module.exports;

module.exports.prototype.options = {
    outputCsv: 'torrents.csv',
    redisOptions: {},
    /* Lazy-load Redis client */
    db: null
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

        var encoding = res.headers['content-encoding'] || res.headers['content-type'];

        if (encoding == 'gzip' || encoding === 'application/x-gzip') {
            res.pipe(zlib.createGunzip()).pipe(outStream)
        }
        else if (encoding == 'deflate') {
            res.pipe(zlib.createInflate()).pipe(outStream)
        }
        else {
            res.pipe(outStream)
        }

        next();
    });
};

module.exports.prototype.repopulate = function (next) {
    var self = this;

    this.options.db = redis.createClient( this.options.redisOptions );
    // this.db.flushdb().then( function () {
    this.options.db.multi();

    var parser = parse({delimiter: '|'});

    parser.on('readable', function(){
        var record;
        while (record = parser.read()){
            new Torrent( {db: self.options.db}, record).save();
        }
    });

    parser.on('error', function(err){
        console.warn( err );
    });

    parser.on('finish', function(){
        self.options.db.exec().then( next );
    });

    console.debug('PATH: ', self.options.outputCsv );
    fs.createReadStream( this.options.outputCsv ).pipe( parser );
};
