/**
* Agent to interact with DBpedia
* @module Dbpedia
*/

"use strict";

var request     = require('request');

/**
* @constructor
*/
module.exports = function Dbpedia (){};

module.exports.prototype.endpoint       = 'http://dbpedia.org/data/';
module.exports.prototype.parentNodeName = 'http://dbpedia.org/resource';
module.exports.prototype.genreNodeName  = 'http://dbpedia.org/ontology/genre';

/**
* Send a request.
* @param {string} subject - Name of the entity to look up
* @param {afterRequest} next - Process collected genres
* @throws Various HTTP errors
*/
module.exports.prototype.get = function (subject, next) {
    console.debug('Enter get with [',subject,']');
    subject = subject.replace(/^\s+/, '');
    subject = subject.replace(/\s+$/, '');
    subject = subject.replace(/\s+/, ' ');

    var self   = this,
        genres = [],
        pageId = subject.replace(/\s+/, '_') + '_(TV_series)',
        url    = this.endpoint + pageId + '.json';

    request(url, function (err, res, body) {
        if (err || res.statusCode !== 200) {
            console.error( body );
            throw err || new Error('HTTP status '+res.statusCode);
        }

        var parentNode, genreNode, genres = [];
        try {
            parentNode = self.parentNodeName +'/'+ pageId;
            genreNode  = self.genreNodeName;
            JSON.parse(body)[parentNode][genreNode].forEach( function (i){
                genres.push(
                    i.value.match( /([^\/]+)$/ )[1]
                );
            });
            genres = genres.map( function(i) { return i.replace(/_/, ' ');});
        }
        catch (e){
            console.error(e);
            console.debug('Res:', res);
            console.debug('Body:', body);
            console.debug('Body JSON:', JSON.parse(body));
            console.debug('Parent Node:', JSON.parse(body)[parentNode] );
            console.debug('Genre Node:', JSON.parse(body)[parentNode][genreNode] );
            // console.debug(body);
        }

        console.debug('Leave Dbpedia.get via next with', genres);
        next( genres );
    });
};

/**
* This callback is displayed as part of the Requester class.
* @callback Dbpedia~afterRequest
* @param {array} genres
*/
