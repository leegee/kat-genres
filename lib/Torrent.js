/* Torrent.js */

var Base = require('../lib/Base.js');

module.exports = function Torrent (options, fields) {
    this.setOptions(options);
    if (!fields instanceof Array) throw new TypeError("Fields array is not an Array");
    this.id = fields.shift();
    for (var i = 0; i < this.fieldNames.length; i++){
        this.fields[ this.fieldNames[i] ] = fields[i];
    };
};

module.exports.prototype = Object.create( Base.prototype );
module.exports.prototype.constructor = module.exports;
module.exports.prototype.options = {
    db: null
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
    console.debug( this.toString() );
    this.options.db.hmset( this.id, this.fields);
};
