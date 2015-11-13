(function() {
  'use strict';

  // Bind the angular app to the document
  angular.element(document)
    .ready(function() {
      angular.bootstrap(document, ['beam']);
    });

  function config(authProvider, jwtInterceptorProvider, $httpProvider, $stateProvider, $urlRouterProvider) {

    // Auth Stuff Below
    authProvider.init({
      domain: 'redventures.auth0.com',
      clientID: 'TOlgro0b06hz91bXimXC1PLGI1Qzy409',
      callbackURL: location.href
    });

    jwtInterceptorProvider.tokenGetter = ['store', function(store) {
      return store.get('token');
    }];

    $httpProvider.interceptors.push('jwtInterceptor');
    $httpProvider.interceptors.push('httpInterceptor');


    $urlRouterProvider.otherwise('/');
  }

  function run($rootScope, auth, token) {
    auth.hookEvents();

    // Check if a user is logged in when they try to transition to a different state
    $rootScope.$on('$locationChangeStart', function() {
      var token = store.get('token');
      if (token) {
        if (!jwtHelper.isTokenExpired(token)) {
          if (!auth.isAuthenticated) {
            auth.authenticate(store.get('token'), token);
          }
        } else {
          $rootScope.isAuthenticated = false;
          $location.path('/');
        }
        $rootScope.isAuthenticated = auth.isAuthenticated;
      }
    });

    $rootScope.login = function() {
      auth.signin({
        authParams: {
          scope: 'openid profile' // This gets us the entire user profile
        }
      }, function (profile, token) {
        store.set('profile', profile);
        store.set('token', token);

        $state.go('root.home');
      }, function() {
        console.error("Failed to login the user!");
      });
    };

    $rootScope.logout = function() {
      auth.signout();
      store.remove('profile');
      store.remove('token');

      $state.go('root.landing');
    };

  }

  angular
    .module('beam', [
      'auth0',
      'ui.router',
      'ngMaterial'
    ])
    .config(config)
    .run(run);
})();