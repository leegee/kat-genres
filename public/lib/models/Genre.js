 define( ['backbone'], function (Backbone){
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
        }
    });
});

