define(['angularAMD', 'angular-route'], function (angularAMD) {
    var app = angular.module("kat-genres", ['ngRoute']);

    app.config(function ($routeProvider) {
        $routeProvider.when(
            "/",
            angularAMD.route({
                templateUrl: '/views/home.html',
                controller: 'Home'
            })
        );
    });

    return angularAMD.bootstrap(app);
});

