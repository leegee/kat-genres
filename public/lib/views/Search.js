 define( [
    'backbone', 'jQuery', 'lib/collections/Elasticsearch'
], function (
    Backbone, jQuery, Collection
){
    'use strict';

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
            this.$resultsEl = jQuery('#results');
            this.template   = _.template( jQuery('#template-list').text() );
        },

        events: {
            'submit #genre-search': 'callSearch'
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

        render: function (esRes) {
            esRes = esRes || [];
            if (! jQuery.contains(document, this.$el[0])) {
                this.$root.append( this.$el );
            }

            // If rendering the first page, repopulate the template
            // If adding results, add children to the result element
            if (this.page===0){
                this.$el.empty();
                this.$el.html(
                    this.template({
                        collection : esRes.hits,
                        terms      : this.terms,
                        page       : this.page,
                        totalPages : esRes.totalHits / this.pageSize,
                        took       : esRes.took
                    })
                );
            }
            document.dispatchEvent(eventRendered);
        }

    });
});

