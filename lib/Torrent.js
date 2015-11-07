/* Torrent.js */

var Base     = require('../lib/Base.js'),
    request  = require('request'),
    Entities = require('html-entities').XmlEntities,
    entities = new Entities()
;

/**
* @module Torrent
* @constructor
* @param {object} options
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
    db: null,
    sthInsertTorrent: null
};
module.exports.prototype.id = null;
module.exports.prototype.title = null;
module.exports.prototype.katFields = {};
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
        console.log('Not saving - category is [', this.katFields.torrent_category, ']');
    }
    else {
        console.debug('Yes saving - category is [', this.katFields.torrent_category, ']');
        var fields = [this.id];
        for (var i = 0; i < this.katFields.length; i++){
            fields.push( this.katFields[ this.fieldNames[i] ] );
        }
        this._getInfo( function (){
            fields.push( self.title );
            self.options.sthInsertTorrent.run.apply(
                self.options.sthInsertTorrent, fields
            );
            next();
        });
    }
};

/**
* Sets the `title` from KAT
* @throws {TypeError} Throws a `TypeError` if the category is not Moveis or TV.
*/
module.exports.prototype._getInfo = function (next) {
    var self = this;

    if (! this.katFields.torrent_category.match(/^(Movies|TV)$/)){
        throw new TypeError('Bad cat');
    }

    console.debug('Make request');

    request({
        uri: this.katFields.torrent_info_url,
        gzip: true,
    }, function (err, res, body) {
        console.debug('Got resposne');
        if (err || res.statusCode !== 200) {
            if (err) {
                throw err
            }
            else {
                throw new Error('HTTP status '+res.statusCode);
            }
        }

        var m;
        if (self.katFields.torrent_category === 'Movie'){
            m = body.match(/<li><strong>Movie:<\/strong>\s*<a href="[^"]+"><span>)(.+?)<\/span>/);
        }
        else if (self.katFields.torrent_category === 'TV') {
            m = body.match(/View\s+all\s+<strong>(.+?)<\/strong>\s+episodes/);
        }
        else {
            console.trace(self.katFields.torrent_category);
            throw new Error(self.katFields.torrent_category);
        }
        if (m){
            self.title = entities.decode(m[1]);
        }
        else {
            console.debug('No title', self.katFields);
            throw new Error('Stop');
        }

        console.debug('Leave get via next with ', self.katFields.torrent_category, ' title [',title,']');
        next();
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
        "torrent_name           VARCHAR(255) NOT NULL," +
        "torrent_category       VARCHAR(255) NOT NULL," +
        "torrent_info_url       VARCHAR(255) NOT NULL," +
        "torrent_download_url   VARCHAR(255) NOT NULL," +
        "size                   INT NOT NULL,"  +
        "category_id            INT NOT NULL,"  +
        "files_count            INT NOT NULL,"  +
        "seeders                INT NOT NULL,"  +
        "leechers               INT NOT NULL,"  +
        "upload_date            DATE NOT NULL," +
        "verified               BOOLEAN DEFAULT false," +
        "title                  VARCHAR(255) NOT NULL" +
    ")");
};

/**
* @return a prepared statement handler
* @param {object} db - a connected database handle
*/
module.exports.sthInsertTorrent = function (db){
    return db.prepare(
        "INSERT INTO torrents VALUES (?," + // id
        module.exports.prototype.fieldNames.map(
            function(){return'?';}
        ).join(',') +
        ")"
    );
};

module.exports.toAlladdGenres = function (db, next) {
    console.debug("Enter toAlladdGenres");
    db.each("SELECT * FROM torrents", function(err, row) {
        if (err) {
            console.warn(err);
        }
        else {
            console.log('OK in DB:',row);
        }
    });
    next();
};
