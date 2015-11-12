/**
* Agent to interact with Elasticsearch
* @module Elasticsearch
*/

"use strict";

var elasticsearch = require('elasticsearch'),
    Base          = require('../lib/Base.js'),
    config        = require('../package.json'),
    merge         = require('merge')
;

/**
* @constructor
*/
module.exports = function Elasticsearch (options) {
    this.setOptions(
        merge(options, config.elasticsearch)
    );
    this.client = new elasticsearch.Client({
        host: config.elasticsearch.host +':'+ config.elasticsearch.port,
        log: 'trace',
        apiVersion: "2.1"
    });
};

module.exports.prototype = Object.create( Base.prototype );
module.exports.constructor = module.exports;

module.exports.prototype.all = function () {
    return this.client.search({
        index: 'torrents',
        body: {
            query: {
                match_all: {}
            }
        }
    });
};

module.exports.prototype.search = function (term) {
    return this.client.search({
        index: 'torrents',
        body: {
            multi_match: {
                query: term,
                fields: ['genres', 'title']
            }
        }
    });
};

module.exports.prototype.genreList = function () {
    return this.client.search({
        index: 'torrents',
        body: {
            aggs : {
                genres: {
                    terms : { field: "genres" }
                }
            }
        }
    });
};

