 define( [
    'backbone'
], function (
    Backbone
){
    'use strict';

    return Backbone.View.extend({
        tagName    : "li",
        className  : "record",

        initialize: function () {
            this.$resultsEl = jQuery('#results');
            this.template   = _.template( jQuery('#template-record').text() );
        },

        render: function () {
            return this.template(this);
        }
    });
});

