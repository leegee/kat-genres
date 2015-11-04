/** Importer.js */

"use strict";

var httpRequest = require('http-request'),
    fs          = require('fs');

module.exports = function Importer (options){
    options = options || {};
    Object.keys( this.options ). forEach( function (key){
        this[key] = options.hasOwnProperty(key)? options[key] : this.options[key];
    }, this);
};

module.exports.prototype.options = {
    cachePath: 'archive.gz'
};

module.exports.prototype.download = function (downloadFrom, next) {
    var self = this;
    httpRequest.get({
        url: downloadFrom,
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

