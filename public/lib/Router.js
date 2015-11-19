define( [
    'backbone','lib/views/Search'
], function (
    Backbone, ViewSearch
){
    'use strict';
    var AppRouter = Backbone.Router.extend({
        routes: {
            "search(/:terms)(/:page)" : "search",
            "*default"                : "search"
        }
    });

    var showing,
        viewSearch  = new ViewSearch();

    function Runner (){
        var router = new AppRouter();

        router.on('route:search', function (term, page) {
            // if (showing) showing.hide();
            viewSearch.search(term, page);
            showing = viewSearch;
        });
    }

    Runner.prototype.start = function () {
        Backbone.history.start();
    };

    return Runner;
});
