/* Torrent.js */

var Base     = require('../lib/Base.js'),
    Dbpedia  = require('../lib/Dbpedia.js'),
    Omdb     = require('../lib/Omdb.js'),
    request  = require('request'),
    merge    = require('merge'),
    // Fiber    = require('fibers'),
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
    this.id = katFields.shift();
    for (var i = 0; i < katFields.length; i++){
        this.katFields[ this.fieldNames[i] ] = katFields[i] || null;
    }
};

module.exports.prototype = Object.create( Base.prototype );
module.exports.prototype.constructor = module.exports;
module.exports.prototype.options = {
    db: null
};
module.exports.prototype.reMovieTitleDate   = /^\W*(.+?)[-._\s]*[\({\*.\[]?(19\d\d|20\d\d)/;
module.exports.prototype.reMovieTitleNoDate = /(.+?)(\s*-\s*|\.|\s+)(\(CAM|FRENCH|TRUEFRENCH|SPANISH)/i;
module.exports.prototype.reTvTitle = /^\W*(.+?)(S\d+|Season|Series|Episode|Ep?\d+|\d{4}|\d+\s*x|\d\s*of\s*\d)/i;
module.exports.prototype.id      = null;
module.exports.prototype.title   = null;
module.exports.prototype.genres  = [];
module.exports.prototype.katFields  = {};
module.exports.prototype.fieldNames = [
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
    return '['+ this.katFields.torrent_name +'] in ['+
        this.katFields.torrent_category +'] ('+
        this.katFields.category_id +')'
    ;
};

/**
* Get the title of the media via the `torrent_info_url`
* and store it along with the `katFields` supplied during instantiation.
*/
module.exports.prototype.save = function (next) {
    if (! this.katFields.torrent_category.match(/^(Movies|TV)$/)){
        console.warn('Called Torrent.save with incorrect category,', this.katFields.torrent_category);
        return typeof next==='function'? next() : null;
    }
    var self = this;
    this.setTitle();
    this.setGenres( function (err) {
        if (err) {
            console.error(err);
        }
        else {
            self.saveToDb( next );
        }
    });
};

/**
* Saves id, title, and any set katFields.
*/
module.exports.prototype.saveToDb = function (next){
    console.debug('Enter saveToDb');
    if (! this.genres){
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
                genres: this.genres.join(',')
            },
            this.katFields
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

    var args = values;
    args.unshift( sql );

    this.options.db.serialize( function (){
        self.options.db.run.apply(
            self.options.db,
            args
        );
        return typeof next==='function'? next() : null;
    });
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
        "torrent_download_url   VARCHAR(255)," +
        "size                   INT,"  +
        "category_id            INT,"  +
        "files_count            INT,"  +
        "seeders                INT,"  +
        "leechers               INT,"  +
        "upload_date            DATE," +
        "verified               BOOLEAN DEFAULT false," +
        "title                  VARCHAR(255)," +
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
    next();
};

/**
* Set the genres field based on `torrent_category`, and call `next.
* @param {callback} next
* @returns {Error} error
*/
module.exports.prototype.setGenres = function (next) {
    if (typeof this.katFields.torrent_category === 'undefined'){
        return next( new Error('No katFields.torrent_category'));
    }

    if (this.title === null){
        return next( new Error('No title'));
    }

    var self = this;

    // Be less anti-social
    var getGenreDelayed = function (ms) {
        sleep( ms ).wait();
        var err, klass;
        if (self.katFields.torrent_category === 'Movies'){
            klass = Omdb;
        }
        else if (self.katFields.torrent_category === 'TV'){
            klass = Dbpedia;
        }
        new klass().get( self.title, function (err,genres){
            if (err){
                console.error(err);
            } else {
                self.genres = genres;
            }
            console.debug('Set genres:', genres);
            return typeof next==='function'? next(err) : null;
        } );
    }.future();

    getGenreDelayed(1000).resolve( function (err){} );
};

// This function returns a future which resolves after a timeout. This
// demonstrates manually resolving futures.
function sleep(ms) {
    var future = new Future();
    setTimeout(function() {
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
    if (this.katFields.torrent_category === 'Movies'){
        td = this.reMovieTitleDate.exec( this.katFields.torrent_name );
        if (td){
            this.title = td[1];
            this.date  = td[2];
        } else {
            td = reMovieTitleNoDate.exec( this.katFields.torrent_name );
            if (td) {
                this.title = td[1];
            } else {
                // console.warn( this.katFields.torrent_name );
            }
        }
    }
    else if (this.katFields.torrent_category === 'TV'){
        td = this.reTvTitle.exec( this.katFields.torrent_name );
        if (td) {
            this.title = td[1];
        } else {
            console.warn( this.katFields.torrent_name );
        }
    }

    if (this.title){
        this.title = this.title.replace(/^\s+/, '');
        this.title = this.title.replace(/\s+$/, '');
        this.title = this.title.replace(/\s+/, ' ');
    }
};




