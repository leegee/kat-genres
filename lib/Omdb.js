/**
* Agent to interact with OMDb API
* @module Omdb
*/

"use strict";

var request     = require('request');

/**
* @constructor
*/
module.exports = function Omdb (){};

module.exports.prototype.endpoint = 'http://www.omdbapi.com';

/**
* Send a request.
* @param {string} subject - Name of the entity to look up
* @param {afterRequest} next - Process collected genres
*/
module.exports.prototype.get = function (subject, next) {
    console.debug('Enter get with [',subject,']');
    request({
            uri: this.endpoint,
            qs:  { t: subject }
        },
        function (err, res, body) {
            if (err){
                return err;
            }
            else if (!res){
                console.error( 'No res from', this.endpoint);
            }
            else if (res.statusCode !== 200) {
                console.error( 'Body', body );
                return (err || new Error('HTTP status '+res.statusCode));
            }

            var genres;

            try {
                genres = JSON.parse(body).Genre.split(/,\s+/);
            }
            catch (e){
                console.error('Could not get JSON.Genre for '+subject);
                return next(e);
            }

            console.debug("Leave Omdb.get via next with", this.genres);
            next( null, genres );
        }
    );
};

/**
* This callback is displayed as part of the Requester class.
* @callback Dbpedia~afterRequest
* @param {Error} Error or null
* @param {array} genres
*/
