 define( ['backbone', '../views/Record.js'], function (Backbone, View){
    'use strict';
    return Backbone.Model.extend({
        defaults: {
            name: "Not specified",
            count: -1,
            link: '#/search/'
        },
        initialize: function (){
            this.set('link',
                this.get('link') + this.get('name')
            );
            this.view = new View({model:this});
        }
    });
});

