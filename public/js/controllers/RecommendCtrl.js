angular.module('RecommendCtrl', []).controller('RecommendController', function($scope, $http, $window, $timeout, $document) {

	$scope.recommendedBooks = [];
	$scope.recommendedMovies = [];
	// Get book recommendations for user
  $http({
		method: 'POST',
		url: '/api/userBook',
		data: { user_id: 655 }
	}).then(function(data) {
		$scope.recommendedBooks = [];
    $scope.recommendedBooks = data.data;
		console.log("books", data.data);
    console.log("books fetched");
  }).catch(function(data) {
    console.log('books fetch err ', data);
  });

	// Get movie recommendations for user
  $http({
		method: 'POST',
		url: '/api/userMovie',
		data: { user_id: 655 }
	}).then(function(data) {
		$scope.recommendedMovies = [];
    $scope.recommendedMovies = data.data;
		console.log("movies", data.data);
		console.log("movies", data.data);
  }).catch(function(data) {
    console.log('movies fetch err ', data);
  });

});
