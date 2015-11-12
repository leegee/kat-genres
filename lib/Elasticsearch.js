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
* Promise-based interface to Elasticsearch 2.1
* @constructor
*/
module.exports = function Elasticsearch (options) {
    this.setOptions( merge(options, config.elasticsearch) );
    this.client = new elasticsearch.Client({
        host: config.elasticsearch.host +':'+ config.elasticsearch.port,
        log: 'trace',
        apiVersion: "2.1"
    });
};

module.exports.prototype = Object.create( Base.prototype );
module.exports.constructor = module.exports;
module.exports.prototype.options = {
    host: 'localhost',
    port: 9200,
    index: 'torrents'
};

/* Toy index */
module.exports.prototype.setup = function (term) {
    var self = this;
    return this.client.indices.delete({
        index: this.options.index,
        ignore: [404]
    }).then( function (err, resp, respcode) {
        self.client.indices.create({
            index: self.options.index,
            body: {
                mappings: {
                    torrent: {
                        properties: {
                            id:     {type: "string", index: "not_analyzed"},
                            title:  {type: "string", index: "not_analyzed"},
                            genres: {type: "string", index: "not_analyzed"},
                            torrent_info_url: {
                               type: "string", index: "not_analyzed"
                            }
                        }
                    }
                }
            }
        });
    });
};

module.exports.prototype.index = function (record) {
    return this.client.index({
        index: this.options.index,
        type: "torrrent", // XXX Use as category?
        body: {
            id:     record.id,
            title:  record.title,
            genres: record.genres,
            torrent_info_url: record.torrent_info_url
        }
    });
};


module.exports.prototype.all = function () {
    return this.client.search({
        index: this.options.index,
        body: {
            query: {
                match_all: {}
            }
        }
    });
};

module.exports.prototype.search = function (term) {
    return this.client.search({
        index: this.options.index,
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
        index: this.options.index,
        body: {
            aggs : {
                genres: {
                    terms : { field: "genres" }
                }
            }
        }
    });
};

