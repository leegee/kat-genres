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

    var showing,
        viewSearch = new ViewSearch();

    function Runner (){
        var router = new AppRouter();

        router.on('route:search', function (term) {
            // if (showing) showing.hide();
            console.info("Route:search", term);
            viewSearch.search(term);
            showing = viewSearch;
        });
    }

    Runner.prototype.start = function () {
        Backbone.history.start();
    };

    return Runner;
});
