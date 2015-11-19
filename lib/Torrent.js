/* Torrent.js */

var Base     = require('../lib/Base.js'),
    Dbpedia  = require('../lib/Dbpedia.js'),
    Omdb     = require('../lib/Omdb.js'),
    request  = require('request'),
    merge    = require('merge'),
    Entities = require('html-entities').XmlEntities,
    entities = new Entities()
;

/**
* @module Torrent
* @constructor
* @param {object} options Options
* @param {object} options.dbh Connected database handle
* @param {array} katFields List as exported by KAT
* @throws {TypeError} If `katFields` is not an `Array`
*/
module.exports = function Torrent (options, katFields) {
    this.setOptions(options);
    if (! (katFields instanceof Array)) {
        throw new TypeError("katFields array is not an Array");
    }
    this.id               = katFields.shift();
    this.torrent_name     = katFields.shift();
    this.torrent_category = katFields.shift();
    this.torrent_info_url = katFields.shift();
    this.torrent_download_url = katFields.shift();
    console.log('Made',this.torrent_category, this.torrent_name);
};

module.exports.prototype = Object.create( Base.prototype );
module.exports.prototype.constructor = module.exports;
module.exports.prototype.options = {
    db: null
};
module.exports.prototype.reMovieTitleDate   = /^\W*(.+?)[-._\s]*[\({\*.\[]?(19\d\d|20\d\d)/;
module.exports.prototype.reMovieTitleNoDate = /(.+?)(\s*-\s*|\.|\s+)(\(CAM|FRENCH|TRUEFRENCH|SPANISH)?/i;
module.exports.prototype.reTvTitle = /^\W*(.+?)(S\d+|Season|Series|Episode|Ep?\d+|\d{4}|\d+\s*x|\d\s*of\s*\d)/i;
module.exports.prototype.id               = null;
module.exports.prototype.title            = null;
module.exports.prototype.torrent_name     = null;
module.exports.prototype.torrent_category = null;
module.exports.prototype.genres           = [];
module.exports.prototype.fieldNames       = [
    // "id",
    "torrent_name",
    "torrent_category",
    "torrent_info_url",
    "torrent_download_url",
    "size",
    "category_id",
    "files_count",
    "seeders",
    "leechers",
    "upload_date",
    "verified",
    "title"
];

module.exports.prototype.changeHost = function (str) {
    return str.replace(/kat.cr/, 'kickass.unblocked.la');
};

module.exports.prototype.toString = function () {
    return '['+ this.torrent_name +'] in ['+
        this.torrent_category +'] ('+
        this.torrent_category +')'
    ;
};

/**
* For Movies and TV,
* try to guesss the title
* and the genres for the media,
* and store along with the `katFields` data supplied during instantiation.
* @param {object} elasticsearch connected client (optional)
* @returns {Promise} Rejected on usage errors; sucess is signified by `null`
*    (and completed `title` and `genres` fields); other non-fartal errors indicated
*    by a descriptive string.
*/
module.exports.prototype.saveWithMetaInfo = function (esClient) {
    var self = this;
    return new Promise( function (resolve, reject) {
        if (typeof self.torrent_category === 'undefined'){
            return reject( new Error('No torrent_category'));
        }
        else if (! self.torrent_category.match(/^(Movies|TV)$/) ){
            return resolve( new Error('Ignoring torrent_category "'+self.torrent_category+'"'));
        }
        else {
            console.debug("Setting genre for", self.torrent_category, self.torrent_name);
        }

        self.setTitle();

        if (self.title === null){
            return reject( new Error('No title'));
        }

        var klass   = self.torrent_category === 'Movies'? Omdb : Dbpedia;
        var catcher = function (err){
            console.error(err);
            resolve( err );
        };
        var after   = function (genres){
            self.genres = genres;

            esClient.index({
                id                      :     self.id,
                title                   :  self.title,
                genres                  : self.genres,
                torrent_info_url        : self.torrent_info_url,
                torrent_download_url    : self.torrent_download_url
            }).then( function () {
                resolve( genres );
            }).catch( function (e){
                reject(e);
            });
        };

        if (self.torrent_category === 'Movies'){
            new Omdb().get( self.title, self.year )
                .then( after )
                .catch( catcher );
        }
        else {
            new Dbpedia().get( self.title, after )
                .then( after )
                .catch( catcher );
        }
    });
};


/**
* Getting the title from KAT stopped KAT working, and seemed
* less reliable over small batches. Rather than batch an pause,
* these re seem to get good enough results.
* ```
* { Movies: { read: 186672, ok: 164551, fail: 22121 },
*   TV:     { read: 267185, ok: 244969, fail: 22216 },
* ```
*/
module.exports.prototype.setTitle = function () {
    var td;
    if (this.torrent_category === 'Movies'){
        td = this.reMovieTitleDate.exec( this.torrent_name );
        if (td){
            this.title = td[1];
            this.date  = td[2];
        } else {
            td = this.reMovieTitleNoDate.exec( this.torrent_name );
            if (td) {
                this.title = td[1];
            } else {
                console.warn( this.torrent_name );
            }
        }
    }
    else if (this.torrent_category === 'TV'){
        td = this.reTvTitle.exec( this.torrent_name );
        if (td) {
            this.title = td[1];
        } else {
            console.warn( this.torrent_name );
        }
    }

    if (this.title){
        this.title = this.title.replace(/^\s+/, '');
        this.title = this.title.replace(/\s+$/, '');
        this.title = this.title.replace(/\s+/, ' ');
    }
};




