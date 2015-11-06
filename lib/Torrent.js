/* Torrent.js */

var Base = require('../lib/Base.js');

module.exports = function Torrent (options, fields) {
    this.setOptions(options);
    if (! (fields instanceof Array)) {
        throw new TypeError("Fields array is not an Array");
    }
    this.id = fields.shift();
    for (var i = 0; i < this.fieldNames.length; i++){
        this.fields[ this.fieldNames[i] ] = fields[i];
    }
};

module.exports.prototype = Object.create( Base.prototype );
module.exports.prototype.constructor = module.exports;
module.exports.prototype.options = {
    db: null,
    sthInsertTorrent: null
};
module.exports.prototype.id = null;
module.exports.prototype.fields = {};
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
    "verified"
];

module.exports.prototype.toString = function () {
    return '['+ this.fields.torrent_name +'] in ['+
        this.fields.torrent_category +'] ('+
        this.fields.category_id +')'
    ;
};

module.exports.prototype.save = function () {
    var args = [this.id];
    for (var i = 0; i < this.fieldNames.length; i++){
        args.push( this.fields[ this.fieldNames[i] ] );
    }
    this.options.sthInsertTorrent.run.apply(
        this.options.sthInsertTorrent, args
    );
};

module.exports.createSchema = function (db){
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
        "verified               BOOLEAN DEFAULT false" +
    ")");
};

module.exports.sthInsertTorrent = function (db){
    var sql = "INSERT INTO torrents VALUES (?," + // id
        module.exports.prototype.fieldNames.map(
            function(){return'?';}
        ).join(',') +
        ")";
    return  db.prepare(sql);
};

