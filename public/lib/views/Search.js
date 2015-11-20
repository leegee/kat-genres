define( [
    'backbone', 'jQuery', 'lib/collections/Elasticsearch'
], function (
    Backbone, jQuery, Collection
){
    'use strict';

    _.partial = function(which, data) {
        var tmpl = jQuery('#' + which).text();
        return _.template(tmpl)(data);
    };

    var eventRendered = new Event('rendered');

    return Backbone.View.extend({
        tagName    :   "section",
        className  : "list",
        collection : null,
        terms      : '',
        page       : 0,
        pageSize   : 20,

        initialize: function () {
            this.collection = new Collection();
            this.$root      = jQuery('#app-container');
            this.template   = _.template( jQuery('#template-list').text() );
            this.templateMore = _.template( jQuery('#template-more').text() );
            this.templateResults = _.template( jQuery('#template-results').text() );
        },

        events: {
            'submit #genre-search': 'callSearch',
            'click  #more' : 'searchMore'
        },

        callSearch: function (e) {
            e.preventDefault();
            Backbone.history.navigate('#/search/' +
                encodeURIComponent(
                    jQuery( e.currentTarget ).find('input[type=text]').val()
                )
            );
        },

        search: function (terms, page) {
            var self = this;
            this.terms = terms || null;
            this.page  = page || 0;
            this.collection.fetch(this.terms, this.pageSize, this.page).then( function (res){
                self.render(res);
            } );
        },

        searchMore: function () {
            var self = this;
            this.page++;
            this.collection.fetch(this.terms, this.pageSize, this.page).then( function (res){
                self.render(res);
            } );
        },

        render: function (esRes) {
            var self = this;
            esRes = esRes || [];
            if (! jQuery.contains(document, this.$el[0])) {
                this.$root.append( this.$el );
            }

            this.$resultsEl = jQuery('#results');

            var totalPages = esRes? (esRes.totalHits / this.pageSize) : null;

            // If rendering the first page, repopulate the template
            if (this.page===0){
                this.$el.empty();
                this.$el.html(
                    this.template({
                        collection : esRes.hits,
                        terms      : this.terms,
                        page       : this.page,
                        totalPages : totalPages,
                        took       : esRes.took
                    })
                );

                if (this.page < totalPages){
                    this.$el.append(
                        this.templateMore()
                    );
                }
            }

            // If adding results, add children to the result element
            else {
                this.$resultsEl.append(
                        this.templateResults( {
                        collection : esRes.hits
                    } )
                );
                if (this.page >= totalPages){
                    jQuery('#more').remove();
                }
            }

            document.dispatchEvent(eventRendered);
        }
    });
});

