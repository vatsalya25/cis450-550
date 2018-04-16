angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

	$routeProvider

		// home page
		.when('/', {
			templateUrl: 'views/home.html'
		})

		.when('/logout', {
			templateUrl: 'views/login.html',
			controller: 'LoginController'
		})

		.when('/geeks', {
			templateUrl: 'views/geek.html',
			controller: 'GeekController'
		});

	$locationProvider.html5Mode(true);

}]);
