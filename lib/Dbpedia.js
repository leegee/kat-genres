/**
* Agent to interact with DBpedia
* @module Dbpedia
*/

"use strict";

const Agent = require('../lib/Agent.js');

/**
* @constructor
*/
module.exports = function Dbpedia () {};
module.exports.prototype = Object.create( Agent.prototype );
module.exports.prototype.constructor = module.exports;

module.exports.prototype.endpoint       = 'http://dbpedia.org/data/';
module.exports.prototype.parentNodeName = 'http://dbpedia.org/resource';
module.exports.prototype.genreNodeName  = 'http://dbpedia.org/ontology/genre';

/**
* Send a request.
* @param {string} subject - Name of the entity to look up
* @param {Promise} Resolves with an array of genres.
*/
module.exports.prototype.get = function (subject) {
    console.debug('Enter Dbpedia.get with [',subject,']');
    subject = this.cleanString(subject);
    subject.replace(/^\s+/, '');

    var self   = this,
        pageId = subject.replace(/\s+/, '_') + '_(TV_series)',
        url    = this.endpoint + pageId + '.json';

    console.log('GET ',url);

    return new Promise ( function (resolve, reject){
        self._get( url ).then( function (body) {
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
                console.error('Error',url,e);
                return reject(e);
            }

            console.debug('Resolve Dbpedia.get with', genres);
            return resolve( genres );
        });
    });
};
