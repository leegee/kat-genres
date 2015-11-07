/* Torrent.js */

var Base     = require('../lib/Base.js'),
    request  = require('request'),
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
module.exports.prototype.reMovie = /<li><strong>Movie:<\/strong>\s*<a\s+href="[^"]+"><span>\s*(.+?)\s*<\/span>/; // "
module.exports.prototype.reTV    = /View\s+all\s+<strong>\s*(.+?)\s*<\/strong>\s+episodes/;
module.exports.prototype.id      = null;
module.exports.prototype.title   = null;
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
        return;
    }
    this._getInfo( function (){
        self.saveToDb( next );
    });
};

module.exports.prototype.saveToDb = function (next){
    var fields = [this.id];
    for (var i = 0; i < this.katFields.length; i++){
        fields.push( this.katFields[ this.fieldNames[i] ] );
    }
    fields.push( this.title );
    console.debug('hi');
    this.sthInsertTorrent.run.apply(
        this.sthInsertTorrent, fields
    );
    next();
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

    console.log('Get ', this.katFields.torrent_info_url);

    request({
        uri: this.katFields.torrent_info_url,
        gzip: true,
    }, function (err, res, body) {
        if (err){
            throw err;
        }
        else if (res.statusCode !== 200) {
            throw new Error('HTTP status '+res.statusCode);
        }

        self.setTitleFromHTML( body );
        next();
    });
};

module.exports.prototype.setTitleFromHTML = function (html) {
    var m;
    if (this.katFields.torrent_category === 'Movie'){
        m = this.reMovie.exec(html);
    }
    else if (this.katFields.torrent_category === 'TV') {
        m = this.reTV.exec(html);
    }
    else {
        console.trace(this.katFields.torrent_category);
        throw new Error('Bad category: '+this.katFields.torrent_category);
    }
    if (m){
        this.title = entities.decode(m[1]);
    }
    else {
        console.error("No title");
    }
    return m? true : false;
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
*/
module.exports.prototype.sthInsertTorrent = function (){
    console.log('hi');
    return this.options.db.prepare(
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
    console.debug('Leave toAlladdGenres via next');
    next();
};
