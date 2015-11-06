/**
* Agent to interact with OMDb API
* @module Omdb
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
module.exports = function Omdb (options){
    this.setOptions(options);
};

module.exports.prototype = Object.create( Base.prototype );
module.exports.prototype.constructor = module.exports;

/**
* @type {object} options
*/
module.exports.prototype.options = {
    endpoint: 'http://www.omdbapi.com'
};

/**
* Send a request.
* @param {string} subject - Name of the entity to look up
* @param {afterRequest} next - Process collected genres
* @throws Various HTTP errors
*/
module.exports.prototype.get = function (subject, next) {
    console.debug('Enter get with [',subject,']');
    request({
            uri: this.options.endpoint,
            qs:  { t: subject }
        },
        function (err, res, body) {
            if (err || res.statusCode !== 200) {
                console.error( body );
                throw err || new Error('HTTP status '+res.statusCode);
            }

            var genres;
            try {
                genres = JSON.parse(body).Genre.split(/,\s+/);
            }
            catch (e){
                console.error('Could not get JSON.Genre for '+subject);
                throw e;
            }
            next( genres );
        }
    );
};

/**
* This callback is displayed as part of the Requester class.
* @callback Dbpedia~afterRequest
* @param {array} genres
*/
