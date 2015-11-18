 define( [
    'backbone', 'jQuery', 'lib/collections/Torrent'
], function (
    Backbone, jQuery, Collection
){
    'use strict';

    var eventRendered = new Event('rendered');

    return Backbone.View.extend({
        tagName:   "section",
        className: "list",
        collection: null,
        terms: '',

        initialize: function () {
            this.collection = new Collection();
            this.$root    = jQuery('#app-container');
            this.template = _.template( jQuery('#template-list').text() );
        },

        render: function (esRes) {
            esRes = esRes || [];
            if (! jQuery.contains(document, this.$el[0])) {
                this.$root.append( this.$el );
            }
            this.$el.empty();
            this.$el.html(
                this.template({
                    collection : esRes,
                    terms      : this.terms
                })
            );
            document.dispatchEvent(eventRendered);
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

        search: function (terms) {
            var self = this;
            this.terms = terms;
            this.collection.fetch(terms).then( function (res){
                self.render(res);
            } );
        }
    });
});

