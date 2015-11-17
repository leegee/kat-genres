 define( [
    'backbone', 'elasticsearch', 'jQuery',
    'lib/models/Genre.js', 'lib/models/Torrent.js'
], function (
    Backbone, Elasticsearch, jQuery,
    Genre, Torrent
){
    'use strict';
    return Backbone.Collection.extend({

        initialize: function () {
            this.client = jQuery.es.Client({
                hosts: 'localhost:9200'
            });
        },

        parse: function (res){
            var rv = [];
            if (res.hasOwnProperty('aggregations')){
                res.aggregations.genres.buckets.forEach( function (i){
                    rv.push( new Genre({
                        name: i.key,
                        count: i.doc_count
                    }) );
                })
            }
            else {
                res.hits.hits.forEach( function (i){
                    rv.push( new Torrent({
                        name: i._source.title,
                        genres: i._source.genres,
                        link: i._source.torrent_download_url
                    }) );
                });
            }
            return rv;
        },

        fetch: function (terms) {
            var self = this;
            var body = terms === null ? {
                aggs : {
                    genres: {
                        terms : { field: "genres" }
                    }
                }
            } : {
                query: {
                    wildcard: {
                        _all : { value : terms }
                    }
                }
            };
            return this.client.search({
                index: 'torrents', // this.options.index,
                body: body
            }).then( function (res) {
                return self.parse(res);
            })
        }
    });
});

