/** Importer.js */

"use strict";

var request = require('request');

var defaultProperties = {
    archivePath: 'archive.gz',
    downloadFrom: 'https://kat.cr/api/get_dump/daily/'
};

module.exports = function Importer (options){
    Object.keys( defaultProperties ). forEach( function (key){
        this[key] = options.hasOwnProperty(key)? options[key] : defaultProperties[key];
    });
}

request({
    url: this.downloadFrom,
    method: 'GET',
    headers: {},
    qs: {'verified': 1, 'userhash': '93f8dba00cf1b60bf24ea03ab772dc18'}
}, function (error, response, body) {
    if (error) throw error;
    if (response.statusCode != 200) throw new Error(body);
})
