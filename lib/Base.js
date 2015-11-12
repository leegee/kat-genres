/* Base.js */

module.exports = function Base (options) {
    this.setOptions(options);
};

/**
* Set allowed options by merging supplied hash
* with object prototypes declared options.
*/
module.exports.prototype.setOptions = function (options){
    options = options || {};
    Object.keys( this.options ).forEach( function (key){
        this.options[key] = options.hasOwnProperty(key)?
             options[key] : this.options[key];
    }, this);
};

/* @abstact */
module.exports.prototype.options = {};
