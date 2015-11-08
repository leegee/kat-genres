/** Importer.js */

"use strict";

var request     = require('request'),
    fs          = require('fs'),
    zlib        = require('zlib'),
    parse       = require('csv-parse'),
    Base        = require('../lib/Base.js'),
    Torrent     = require('../lib/Torrent.js'),
    AgentTV     = require('../lib/Dbpedia.js'),
    AgentFilm   = require('../lib/Omdb.js')
;

module.exports = function Importer (options){
    this.setOptions(options);
};

module.exports.prototype = Object.create( Base.prototype );
module.exports.prototype.constructor = module.exports;

module.exports.prototype.options = {
    katCsv: 'torrents.csv',
    db: null
};

module.exports.prototype.download = function (downloadFrom, next) {
    var outStream = fs.createWriteStream( this.options.katCsv ),
        req = request({
            url: downloadFrom,
            headers: {'accept-encoding': 'gzip'}
        });

    req.on('error', function (err) {
        throw err;
    });

    req.on('response', function (res) {
        if (res.statusCode !== 200) {
            throw new Error('HTTP status '+res.statusCode);
        }

        var encoding = res.headers['content-encoding'] || res.headers['content-type'];

        if (encoding == 'gzip' || encoding === 'application/x-gzip') {
            res.pipe(zlib.createGunzip()).pipe(outStream);
        }
        else if (encoding == 'deflate') {
            res.pipe(zlib.createInflate()).pipe(outStream);
        }
        else {
            res.pipe(outStream);
        }

        next();
    });
};

/**
* Parse the gunzipped KAT CSV
* @param {callback} callback after CSV is read (not after Torrents saved)
*/
module.exports.prototype.loadTorrentsFromCSV = function (next) {
    var parser = parse({
        delimiter: '|',
        relax: true
    });

    parser.on('readable', function(){
        var record;
        while ((record = parser.read()) !== null){
            new Torrent(this.options.db, record).save();
        }
    });

    parser.on('error', function(err){
        console.warn( err );
    });

    parser.on('finish', function(){
        console.debug('Finished reading in loadTorrentsFromCSV');
        next();
    });

    fs.createReadStream( this.options.katCsv ).pipe( parser );
};
