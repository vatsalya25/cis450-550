angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

	$routeProvider

		// home page
		.when('/', {
			templateUrl: 'views/home.html'
		})

		.when('/login', {
			templateUrl: 'views/login.html',
			controller: 'LoginController'
		})

		.when('/recommend', {
			templateUrl: 'views/geek.html',
			controller: 'RecommendController'
		});

	$locationProvider.html5Mode(true);

}]);
