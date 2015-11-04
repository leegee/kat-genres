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

module.exports.download = function () {
    var out = fs.createWriteStream('out');
    request({
        url: this.downloadFrom,
        method: 'GET',
        headers: {},
        qs: {'verified': 1, 'userhash': userHash}
    }, function (error, response, body) {
        if (error) throw error;
        if (response.statusCode != 200) throw new Error(body);
    }).pipe(zlib.createGunzip()).pipe(out);
};

