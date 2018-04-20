angular.module('RecommendCtrl', []).controller('RecommendController', function($scope, $http, $window, $timeout, $document) {

	$scope.recommendedBooks = [];
	$scope.recommendedMovies = [];
	$scope.watchlist = [];
	$scope.readlist = [];
	// Get readlist
	// $http({
	// 	method: 'POST',
	// 	url: '/api/readlist',
	// 	data: { user_id: 655 }
	// }).then(function(data) {
	// 	$scope.readlist = [];
  //   $scope.readlist = data.data;
	// 	console.log("readlist", data.data);
	// 	$http({
	// 		method: 'POST',
	// 		url: '/api/userBook',
	// 		data: { user_id: 655 }
	// 	}).then(function(data) {
	// 		console.log("*******", data);
	// 		$scope.recommendedBooks = [];
	// 		$scope.recommendedBooks = data.data;
	// 		console.log("books", data.data);
	// 	})
  // }).catch(function(err) {
  //   console.log('fetch err ', err);
  // });

	$http({
		method: 'POST',
		url: '/api/watchlist',
		data: { user_id: 655 }
	}).then(function(data) {
		$scope.watchlist = [];
		$scope.watchlist = data.data;
		console.log("watchlist", data.data);
		// $http({
		// 	method: 'POST',
		// 	url: '/api/userMovie',
		// 	data: { user_id: 655 }
		// }).then(function(data) {
		// 	$scope.recommendedMovies = [];
		// 	$scope.recommendedMovies = data.data;
		// 	console.log("movies", data.data);
		// });
	}).catch(function(data) {
		console.log('movies fetch err ', data);
	});

	// Get book recommendations for user

	// Get watchlist

	// Get movie recommendations for user


});
