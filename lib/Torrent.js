/* Torrent.js */

var Base     = require('../lib/Base.js'),
    Dbpedia  = require('../lib/Dbpedia.js'),
    Omdb     = require('../lib/Omdb.js'),
    request  = require('request'),
    merge    = require('merge'),
    Future   = require('fibers/future'),
    wait     = Future.wait,
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
* get the title of the media via the `torrent_info_url`
* and the genres for the media,
* and store along with the `katFields` data supplied during instantiation.
* @returns {Promise} Rejected on usage errors; sucess is signified by `null`
*    (and completed `title` and `genres` fields); other non-fartal errors indicated
*    by a descriptive string.
*/
module.exports.prototype.saveWithMetaInfo = function () {
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

        var klass = self.torrent_category === 'Movies'? Omdb : Dbpedia;
        var after = function (err,genres){
            if (err){
                console.error(err);
                resolve( err );
            } else {
                console.debug("Set genres to", genres,"for",self.torrent_name);
                self.genres = genres;
                resolve( genres );
            }
        };
        if (self.torrent_category === 'Movies'){
            new Omdb().get( self.title, self.year, after );
        } else {
            new Dbpedia().get( self.title, after );
        }
    });
};

/**
* Saves id, title, and the katFields.
*/
module.exports.prototype.saveToDb = function (next){
    console.debug('Enter saveToDb');
    if (this.genres.length===0){
        console.warn('No genres');
        return typeof next==='function'? next() : null;
    }
    var self   = this,
        keys   = [],
        values = [],
        params = merge(
            {
                id: this.id,
                title: this.title,
                year: this.year,
                genres: this.genres.join(','),
                torrent_name: this.torrent_name,
                torrent_category: this.torrent_category,
                torrent_info_url: this.torrent_info_url
            }
        );

    Object.keys( params ).forEach( function (key){
        keys.push( key );
        values.push( params[key] );
    }, this);

    var sql = "INSERT INTO torrents (" +
        keys.join(',') +
        ") VALUES (" +
        values.map( function(){ return'?'; } ).join(',') +
    ")";

    var x = this.options.db.run(
        sql,
        values,
        function (err){
            if (err) {
                console.warn(err);
            }
            console.debug("Leave saveToDb via next");
            if (typeof next==='function'){
                next();
            }
        }
    );
    console.debug(x);
};

/**
* Creates the `torrent` table, dropping it if it already exists.
* @param {object} db - a connected database handle
*/
module.exports.createSchema = function (db){
    db.run("DROP TABLE IF EXISTS torrents");
    db.run("CREATE TABLE torrents (" +
        "id                     VARCHAR(255) NOT NULL," +
        "torrent_name           VARCHAR(255)," +
        "torrent_category       VARCHAR(255)," +
        "torrent_info_url       VARCHAR(255)," +
        "title                  VARCHAR(255)," +
        "year                   INT," +
        "genres                 TEXT" +
    ")");
};

module.exports.showAll = function (db, next) {
    console.debug("Enter showAll");
    db.each("SELECT * FROM torrents", function (err, row) {
        if (err) {
            console.warn(err);
        }
        else {
            console.log('OK in DB:',row);
        }
    });
    console.debug('Leave showAll via next');
};


function sleep (ms) {
    var future = new Future();
    setTimeout( function () {
        future.return();
    }, ms);
    return future;
}

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




