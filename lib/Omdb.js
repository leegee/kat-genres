/**
* Agent to interact with OMDb API
* @module Omdb
*/

"use strict";

const Agent = require('../lib/Agent.js'),
    querystring = require('querystring')
;

/**
* @constructor
*/
module.exports = function Omdb (){};
module.exports.prototype = Object.create( Agent.prototype );
module.exports.prototype.constructor = module.exports;

module.exports.prototype.endpoint = 'http://www.omdbapi.com';

/**
* @param {string} subject - Name of the entity to look up
* @param {number} year - Year of release, or `null`
* @return {Promise} resolves with a list of genres.
*/
module.exports.prototype.get = function (subject, year, next) {
    console.debug('Enter get with [',subject,']');

    var self = this,
        qs = { t: subject };

    if (year) {
        qs.y = year;
    }

    var url = this.endpoint + '?' + querystring.stringify( qs );

    return new Promise ( function (resolve, reject){
        self._get( url ).then( function (body) {
            var genres;
            try {
                genres = JSON.parse(body).Genre;
                if (genres){
                    genres = genres.split(/,\s+/);
                }
            }
            catch (e){
                console.error('Could not get JSON.Genre for '+subject);
                return reject(e);
            }
            console.debug("Leave Omdb.get via next with", genres);
            return resolve(genres );
        }).catch( function (e){
            reject(e);
        });
    });
};
