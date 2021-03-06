/** Importer.js */

"use strict";

const request       = require('request'),
    fs            = require('fs'),
    zlib          = require('zlib'),
    parse         = require('csv-parse'),
    Base          = require('../lib/Base.js'),
    Torrent       = require('../lib/Torrent.js')
;

require('es6-promise').polyfill();
require('promise.prototype.finally');

module.exports = function Importer (options){
    this.setOptions(options);
};

module.exports.prototype = Object.create( Base.prototype );
module.exports.prototype.constructor = module.exports;
module.exports.prototype.options = {
    katCsv: 'torrents.csv',
    elasticsearch: null
};

module.exports.prototype.download = function (downloadFrom, next) {
    return new Promise( function (resolve, reject) {
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
                reject( new Error('HTTP status '+res.statusCode) );
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

            resolve();
        });
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
        }),
        self     = this,
        promises = [];

    parser.on('error', function(err){
        console.warn( err );
    });

    parser.on('readable', function(){
        var record, torrent;
        while ((record = parser.read()) !== null){
            new Torrent({}, record)
                .saveWithMetaInfo( self.options.elasticsearch );
        }
    });

    parser.on('finish', function(){
        console.debug('Finished reading in loadTorrentsFromCSV');
        next();
    });

    fs.createReadStream( this.options.katCsv ).pipe( parser );
};
