/**
* Agent to interact with Elasticsearch
* @module Elasticsearch
*/

"use strict";

var elasticsearch = require('elasticsearch'),
    config = require('../package.json');

/**
* @constructor
*/
module.exports = function Elasticsearch () {
    this.client = new elasticsearch.Client({
        host: config.elasticsearch.host +':'+ config.elasticsearch.port,
        log: 'trace',
        apiVersion: "2.1"
    });
};

module.exports.prototype.distinctGenres = function () {
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

