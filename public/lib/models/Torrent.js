define( ['backbone', '../views/Record.js'], function (Backbone, View){
    'use strict';
    return Backbone.Model.extend({
        defaults: {
            name: "Not specified",
            link: null
        },
        initialize: function (){
            this.view = new View({model:this});
        }
    });
});

