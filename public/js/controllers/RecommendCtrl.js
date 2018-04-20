angular.module('RecommendCtrl', []).controller('RecommendController', function($scope, $http, $window, $timeout, $document) {

	$scope.recommendedBooks = [];
	$scope.recommendedMovies = [];
	$scope.watchlist = [];
	$scope.readlist = [];

	// Get read and recommended books
	$http({
		method: 'POST',
		url: '/api/readlist',
		data: { user_id: 655 }
	}).then(function(data) {
		$scope.readlist = [];
    $scope.readlist = data.data;
		console.log("readlist", data.data);
		$timeout(function() {
			$scope.readlist.forEach(function(item) {
				$("#bookRating" + item.index).removeClass("value-0 value-1 value-2 value-3 value-4 value-5").addClass("value-" + item.user_rating);
			})
		}, 1);
		$http({
			method: 'POST',
			url: '/api/userBook',
			data: { user_id: 655 }
		}).then(function(data) {
			console.log("*******", data);
			$scope.recommendedBooks = [];
			$scope.recommendedBooks = data.data;
			console.log("books", data.data);
		})
  }).catch(function(err) {
    console.log('fetch err ', err);
  });

	// get watched and recommended movies
	$http({
		method: 'POST',
		url: '/api/watchlist',
		data: { user_id: 655 }
	}).then(function(data) {
		$scope.watchlist = [];
		$scope.watchlist = data.data;
		console.log("watchlist", data.data);
		$timeout(function() {
			$scope.watchlist.forEach(function(item) {
				$("#movieRating" + item.index).removeClass("value-0 value-1 value-2 value-3 value-4 value-5").addClass("value-" + item.user_rating);
			})
		}, 1);
		$http({
			method: 'POST',
			url: '/api/userMovie',
			data: { user_id: 655 }
		}).then(function(data) {
			$scope.recommendedMovies = [];
			$scope.recommendedMovies = data.data;
			console.log("movies", data.data);
		});
	}).catch(function(data) {
		console.log('movies fetch err ', data);
	});

	// Rate Books and Movies
	// Rate Book
	$scope.rateBook = function(book_id, rating) {
		console.log(book_id, rating);
		$("#bookRating" + book_id).removeClass("value-0 value-1 value-2 value-3 value-4 value-5").addClass("value-" + rating);
		$http({
			method: 'POST',
			url: '/api/addToReadlist',
			data: {
				book_id: book_id,
				user_id: 655,
				rating: rating
			}
		}).then(function(data) {
			$http({
				method: 'POST',
				url: '/api/readlist',
				data: { user_id: 655 }
			}).then(function(data) {
				$scope.readlist = [];
				$scope.readlist = data.data;
				$timeout(function() {
					$scope.readlist.forEach(function(item) {
						$("#bookRating" + item.index).removeClass("value-0 value-1 value-2 value-3 value-4 value-5").addClass("value-" + item.user_rating);
					})
				}, 1);
			})
		}).catch(function(data) {
			$("#bookRating" + book_id).removeClass("value-0 value-1 value-2 value-3 value-4 value-5");
			console.log('rateBook err ', data);
		});
	}

	// Rate
	$scope.rateMovie = function(movie_id, rating) {
		console.log(movie_id, rating);
		$("#movieRating" + movie_id).removeClass("value-0 value-1 value-2 value-3 value-4 value-5").addClass("value-" + rating);
		$http({
			method: 'POST',
			url: '/api/addToWatchlist',
			data: {
				movie_id: movie_id,
				user_id: 655,
				rating: rating
			}
		}).then(function(data) {
			$http({
				method: 'POST',
				url: '/api/watchlist',
				data: { user_id: 655 }
			}).then(function(data) {
				$scope.watchlist = [];
				$scope.watchlist = data.data;
				$timeout(function() {
					$scope.watchlist.forEach(function(item) {
						$("#movieRating" + item.index).removeClass("value-0 value-1 value-2 value-3 value-4 value-5").addClass("value-" + item.user_rating);
					})
				}, 1);
			})
		}).catch(function(data) {
			$("#movieRating" + movie_id).removeClass("value-0 value-1 value-2 value-3 value-4 value-5");
			console.log('rateMovie err ', data);
		});
	}

});
