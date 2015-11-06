/**
* Agent to interact with DBpedia
* @module Dbpedia
*/

"use strict";

var request     = require('request'),
    fs          = require('fs'),
    Base        = require('../lib/Base.js')
;

/**
* @constructor
* @augments Base
* @param {object} options
*/
module.exports = function Dbpedia (options){
    this.setOptions(options);
};

module.exports.prototype = Object.create( Base.prototype );
module.exports.prototype.constructor = module.exports;

/**
* @type {object} pageIdTypeSuffix maps KAT categories to Wikipedia page suffixes
*/
module.exports.prototype.pageIdTypeSuffix = {
    TV: '',
    Movies: '_(film)'
};

/**
* @type {object} options
*/
module.exports.prototype.options = {
    endpoint: 'http://dbpedia.org/data/',
    genreParentNodeName: 'http://dbpedia.org/resource',
    genreNodeName: 'http://dbpedia.org/ontology/genre'
};

/**
* @ignore
*/
module.exports.prototype.disambiguate = function (subject, next) {
    console.debug('Enter get with [',subject,']');
    request(
        this.options.endpoint + subject + '.json',
        function (err, res, body) {
            if (err || res.statusCode !== 200) {
                console.error( body );
                throw err || new Error('HTTP status '+res.statusCode);
            }

            var json = JSON.parse(body);
            console.debug(json[
                "http://dbpedia.org/resource/NCIS"
            ][
                "http://dbpedia.org/ontology/wikiPageDisambiguates"
            ]);
            console.debug('Leave get via next');
            next();
        }
    );
};

/**
* Send a request.
* @param {string} subject - Name of the entity to look up
* @param {string} type - `TV` or `Movies`
* @param {afterRequest} next - Process collected genres
* @throws Various HTTP errors
*/
module.exports.prototype.get = function (subject, next) {
    console.debug('Enter get with [',subject,']');
    var genres = [],
        pageId = subject.replace(/\s+/, '_') + '_(TV_series)',
        url    = this.options.endpoint + pageId + '.json';

    request(url, function (err, res, body) {
        if (err || res.statusCode !== 200) {
            console.error( body );
            throw err || new Error('HTTP status '+res.statusCode);
        }

        try {
            JSON.parse(body)[
                module.exports.prototype.options.genreParentNodeName +'/'+ pageId
            ][
                module.exports.prototype.options.genreNodeName
            ].forEach( function (i){
                genres.push(
                    i.value.match( /([^\/]+)$/ )[1]
                );
            });
        }
        catch (e){
            console.error(e);
            console.debug(body);
        }

        console.debug('Leave get via next');
        next( genres );
    });
};

/**
* This callback is displayed as part of the Requester class.
* @callback Dbpedia~afterRequest
* @param {array} genres
*/
