require.config({
    baseUrl: "/js",
    paths: {
        'angular'       : 'bower/angular/angular.min',
        'angular-route' : 'bower/angular-route/angular-route.min',
        'angularAMD'    : 'bower/angularAMD/angularAMD.min',
         'ngload'       : 'bower/ng-load/ngload',

        'Home'          : 'controller/Home'
    },
    shim: {
        'angularAMD'    : ['angular'],
        'angular-route' : ['angular'],
        'ngload'        : ['angular']
    },
    deps: ['app']
});
