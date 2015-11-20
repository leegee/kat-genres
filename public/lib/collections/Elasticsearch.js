 define( [
    'backbone', 'elasticsearch', 'jQuery',
    'lib/models/Genre', 'lib/models/Torrent'
], function (
    Backbone, Elasticsearch, jQuery,
    Genre, Torrent
){
    'use strict';
    return Backbone.Collection.extend({

        indexName: null,

        initialize: function () {
            this.indexName = 'torrents';
            this.client = jQuery.es.Client({
                hosts: 'localhost:9200'
            });
        },

        parse: function (res){
            var hits = [];
            if (res.hasOwnProperty('aggregations')){
                res.aggregations.genres.buckets.forEach( function (i){
                    hits.push( new Genre({
                        name: i.key,
                        count: i.doc_count
                    }) );
                })
            }
            else {
                res.hits.hits.forEach( function (i){
                    hits.push( new Torrent({
                        name: i._source.title,
                        genres: i._source.genres,
                        link: i._source.torrent_download_url
                    }) );
                });
            }
            return {
                hits       : hits,
                took       : res.took,
                totalHits  : res.hits.total
            };
        },

        // page = 0-based
        fetch: function (terms, pageSize, page) {
            var self = this,
                body,
                sortField,
                from = 0;

            if (terms === null){
                sortField = '';
                pageSize = 999;
                body = {
                    aggs : {
                        genres: {
                            terms : { field: "genres" }
                        }
                    }
                };
            }

            else {
                if (typeof page !== 'undefined' ){
                    from = pageSize * page; // 0-based index
                }
                sortField = 'title';
                body = {
                    query: {
                        wildcard: {
                            _all : { value : terms }
                        }
                    }
                }
            };

            return this.client.search({
                from  : from,
                size  : pageSize,
                index : this.indexName,
                body  : body,
                sort  : sortField
            }).then( function (res) {
                return self.parse(res);
            })
        }
    });
});

