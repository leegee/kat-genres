/**
* HTTP Agent base class
* @module Agent
*/

"use strict";

var request = require('request');

/**
* @constructor
*/
module.exports = function Agent () {};

module.exports.prototype.endpoint = null;

module.exports.prototype.cleanString = function (subject) {
    subject = subject.replace(/^\s+/, '');
    subject = subject.replace(/\s+$/, '');
    subject = subject.replace(/\s+/, ' ');
    return subject;
};

/**
* Send a request.
* @param {string} subject - Name of the entity to look up
* @param {afterRequest} next - Process collected genres, passing error/null and genres array.
*/
module.exports.prototype._get = function (url) {
    console.debug('Enter _get with [', url, ']');
    var self   = this;

    return new Promise( function (resolve, reject) {
        console.log('GET ',url);

        request(url, function (err, res, body) {
            if (err){
                reject( err );
            }
            else if (!res){
                reject( 'No res from', url);
            }
            else if (res.statusCode !== 200) {
                reject( body );
            }
            resolve( body );
        });
    });
};

