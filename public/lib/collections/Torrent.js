 define( [
    'backbone', 'elasticsearch', 'jQuery',
    'lib/models/Genre', 'lib/models/Torrent'
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

        fetch: function (terms, pageSize, page) {
            var self = this,
                body,
                sortField,
                from = 0;

            if (terms === null){
                sortField = '';
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
                    from = pageSize * page-1;
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
                index : 'torrents', // this.options.index,
                body  : body,
                sort  : sortField
            }).then( function (res) {
                return self.parse(res);
            })
        }
    });
});

