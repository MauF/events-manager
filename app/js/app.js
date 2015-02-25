'use strict';

// Declare app level module which depends on views, and components
angular.module('app', [
    'ngRoute',
    'ngMaterial',
    'app-controllers'
]).
config(['$mdThemingProvider', function($mdThemingProvider) {
  // $mdThemingProvider.theme('default')
  //   .primaryPalette('blue')
  //   .warnPalette('indigo')
  //   .accentPalette('blue-grey');
}])
.config(['$routeProvider', function($routeProvider) {
    // $routeProvider.otherwise({
    //     redirectTo: '/home'
    // });
    $routeProvider.when('/event', {
        templateUrl: 'partials/event.html'
    });
    $routeProvider.when('/event-list', {
        templateUrl: 'partials/event-list.html'
    });
    $routeProvider.when('/test-map', {
        templateUrl: 'partials/test-map.html'
    });
    // $routeProvider.when('/menuItem2', {
    //     template: '<h2 layout layout-align="center center">content for MenuItem2</h2>'
    // });
    // $routeProvider.when('/menuItem3', {
    //     template: '<h2 layout layout-align="center center">content for MenuItem3</h2>'
    // });
    // $routeProvider.when('/settings', {
    //     templateUrl: 'partials/settings.html'
    // });
    // $routeProvider.when('/ui-grid-test', {
    //     templateUrl: 'partials/ui-grid-test.html'
    // });
}]).
// config(['$translateProvider', function($translateProvider) {
    // register german translation table
//    $translateProvider.translations('de', 
//      {'GREETING': 'Hallo Welt!'}
//    );
//    $translateProvider.translations('de', {
//          'USERNAME': 'de_Username'
//        });
//    $translateProvider.translations('de', {
//          'PASSWORD': 'de_Password'
//        });
//    $translateProvider.translations('de', {
//          'LOGIN': 'de_LOGIN'
//        });
//    // register english translation table
//    $translateProvider.translations('en', {
//      'GREETING': 'Hello World!'
//        });
//    $translateProvider.translations('en', {
//          'USERNAME': 'Username'
//        });
//    $translateProvider.translations('en', {
//          'PASSWORD': 'Password'
//        });
//    $translateProvider.translations('en', {
//          'LOGIN': 'LOGIN'
//        });
//    // register english translation table
//    $translateProvider.translations('it', {
//      'GREETING': 'Ciao Mondo!'
//    });
//    $translateProvider.translations('it', {
//          'USERNAME': 'Username'
//        });
//    $translateProvider.translations('it', {
//          'PASSWORD': 'Password'
//        });
//    $translateProvider.translations('it', {
//          'LOGIN': 'ENTRA'
//        });
      // $translateProvider.useStaticFilesLoader({
      //   prefix: 'i18N/locale-',
      //   suffix: '.json'
      // });
      // which language to use?
      // $translateProvider.preferredLanguage('de_DE');
// }]).
config(['$provide', '$httpProvider', function($provide, $httpProvider) {

    // Intercept http calls.
    $provide.factory('RgiHttpInterceptor', ['$q', '$rootScope', function($q, $rootScope) {
        return {
            // On request success
            request: function(config) {
                //               $log.log(config); // Contains the data about the request before it is sent.
                $rootScope.loadingInProgress = true;
                // Return the config or wrap it in a promise if blank.
                return config || $q.when(config);
            },

            // On request failure
            requestError: function(rejection) {
                //               $log.log(rejection); // Contains the data about the error on the request.
                $rootScope.loadingInProgress = false;
                // Return the promise rejection.
                return $q.reject(rejection);
            },

            // On response success
            response: function(response) {
                //               $log.log(response); // Contains the data from the response.
                $rootScope.loadingInProgress = false;
                // Return the response or promise.
                return response || $q.when(response);
            },

            // On response failture
            responseError: function(rejection) {
                //               $log.log(rejection); // Contains the data about the error.
                $rootScope.loadingInProgress = false;
                // Return the promise rejection.
                return $q.reject(rejection);
            }
        };
    }]);

    // Add the interceptor to the $httpProvider.
    $httpProvider.interceptors.push('RgiHttpInterceptor');

}]);
