angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

	$routeProvider

		// home page
		.when('/', {
			templateUrl: 'views/home.html'
		})

		.when('/login', {
			templateUrl: 'views/login.html'
		})

		.when('/recommend', {
			templateUrl: 'views/recommend.html'
			// controller: 'RecommendController'
		});

	$locationProvider.html5Mode(true);

}]);
