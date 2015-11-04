/** Importer.js */

"use strict";

var request = require('request'),
    zlib    = require('zlib'),
    fs      = require('fs');

var defaultProperties = {
    archivePath:    'archive.gz',
    downloadFrom:   'https://kat.cr/api/get_dump/daily/',
    userHash:       '93f8dba00cf1b60bf24ea03ab772dc18'
};

module.exports = function Importer (options){
    options = options || {};
    Object.keys( defaultProperties ). forEach( function (key){
        this[key] = options.hasOwnProperty(key)? options[key] : defaultProperties[key];
    }, this);
};

module.exports.download = function (next) {
    console.debug('HI');
    var out = fs.createWriteStream('out');
    request({
        url: this.downloadFrom,
        method: 'GET',
        headers: {},
        qs: {'verified': 1, 'userhash': this.userHash}
    }, function (error, res, body) {
        if (error) throw error;
        if (res.statusCode != 200) throw new Error(body);
        console.log('ok');

        var buffer = [],
            gunzip = zlib.createGunzip();
        res.pipe(gunzip);

        gunzip.on('data', function(data) {
            buffer.push(data.toString());
            console.log(data.toString());
        })
        .on("end", function() {
            // response and decompression complete, join the buffer and return
            next(null, buffer.join(""));

        })
        .on("error", function(e) {
            next(e);
        });

    });
};

