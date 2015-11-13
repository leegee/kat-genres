define(['app'], function (app) { // prettify
    app.controller('Home', function ($scope, $http) {
        $scope.title = "KAT Genres";
        // config.httpRestServer.port
        $http.get('http://localhost:8080/').
        success(function(data) {
            $scope.greeting = data;
        });
    });
});
