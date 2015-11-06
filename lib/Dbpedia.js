/** Dbpedia.js */

"use strict";

var request     = require('request'),
    qs          = require('querystring'),
    fs          = require('fs'),
    Base        = require('../lib/Base.js'),
    Torrent     = require('../lib/Torrent.js')
;

module.exports = function Dbpedia (options){
    this.setOptions(options);
};

module.exports.prototype = Object.create( Base.prototype );
module.exports.prototype.constructor = module.exports;

module.exports.prototype.options = {
    endpoint: 'http://dbpedia.org/sparql'
};

module.exports.prototype.get = function (subject, next) {
    console.debug('Enter get with [',subject,']');

    var sparql = [
        'PREFIX dbpedia-owl: <http://dbpedia.org/ontology/>',
        'PREFIX dbpprop: <http://dbpedia.org/property/>',
        'PREFIX dbres: <http://dbpedia.org/resource/>',
        'SELECT ?y WHERE {',
        ' ?y dbpedia-owl:binomialAuthority dbres:Johan_Christian_Fabricius.',
        ' }',
        'limit 10'
    ].join(' ');

    var url = this.options.endpoint +'?'+ qs.stringify({ query: sparql });

    request({
        url: url,
        headers: {"accept": "application/sparql-results+json"},
    }, function (err, res, body) {
        if (err){
            throw err;
        }

        if (res.statusCode !== 200) {
            console.error( body );
            throw new Error('HTTP status '+res.statusCode);
        }

        console.debug( body );

        console.debug('Leave get via next');
        next();
    });
};
