define( [
    'backbone','lib/views/Search'
], function (
    Backbone, ViewSearch
){
    'use strict';
    var AppRouter = Backbone.Router.extend({
        routes: {
            "search(/:terms)" : "search",
            "*default"        : "search"
        }
    });

    var viewSearch  = new ViewSearch();

    function Runner (){
        var router = new AppRouter();
        router.on('route:search', function (term) {
            viewSearch.search(term);
        });
    }

    Runner.prototype.start = function () {
        Backbone.history.start();
    };

    return Runner;
});
