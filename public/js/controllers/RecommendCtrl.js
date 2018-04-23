angular.module('RecommendCtrl', []).controller('RecommendController', function($scope, $http, $window, $timeout, $document) {

  $scope.recommendedBooks = [];
  $scope.recommendedMovies = [];
  $scope.watchlist = [];
  $scope.readlist = [];
  $scope.movieSearchList = [];
  $scope.bookSearchList = [];
	$scope.bookSearch = false;
	$scope.movieSearch = false;
  $scope.bookResultEmpty = false;
	$scope.movieResultEmpty = false;
	$scope.readlistEmpty = false;
	$scope.watchlistEmpty = false;
	$scope.bookSearchInput = "";
	$scope.movieSearchInput = "";
	$scope.movieSearchOption = "";
	$scope.userId = parseInt($window.localStorage.getItem("userId"));

  // Get read and recommended books
  $http({
    method: 'POST',
    url: '/api/readlist',
    data: {
      user_id: $scope.userId
    }
  }).then(function(data) {
    $scope.readlist = [];
    $scope.readlist = data.data;
		if($scope.readlist.length === 0) {
			$scope.readlistEmpty = true;
		} else {
			$scope.readlistEmpty = false;
		}
    $timeout(function() {
      $scope.readlist.forEach(function(item) {
        $("#bookRating" + item.index).removeClass("value-0 value-1 value-2 value-3 value-4 value-5").addClass("value-" + item.user_rating);
      })
    }, 1);
		if($scope.readlist.length !== 0) {
			$http({
				method: 'POST',
				url: '/api/userBook',
				data: {
					user_id: $scope.userId
				}
			}).then(function(data) {
				$scope.recommendedBooks = [];
				$scope.recommendedBooks = data.data;
				console.log($scope.recommendedBooks, $scope.recommendedBooks.length);
				if($scope.recommendedBooks.length === 0) {
					$scope.bookResultEmpty = true;
				} else {
					$scope.bookResultEmpty = false;
				}
			})
		} else {
			$scope.bookResultEmpty = true;
		}
  }).catch(function(err) {
    console.log('fetch err ', err);
  });

  // get watched and recommended movies
  $http({
    method: 'POST',
    url: '/api/watchlist',
    data: {
      user_id: $scope.userId
    }
  }).then(function(data) {
    $scope.watchlist = [];
    $scope.watchlist = data.data;
		if($scope.watchlist.length === 0) {
			$scope.watchlistEmpty = true;
		} else {
			$scope.watchlistEmpty = false;
		}
    $timeout(function() {
      $scope.watchlist.forEach(function(item) {
        $("#movieRating" + item.index).removeClass("value-0 value-1 value-2 value-3 value-4 value-5").addClass("value-" + item.user_rating);
      })
    }, 1);
		if($scope.watchlist.length !== 0) {
			$http({
				method: 'POST',
				url: '/api/userMovie',
				data: {
					user_id: $scope.userId
				}
			}).then(function(data) {
				$scope.recommendedMovies = [];
				$scope.recommendedMovies = data.data;
				if($scope.recommendedMovies.length === 0) {
					$scope.movieResultEmpty = true;
				} else {
					$scope.movieResultEmpty = false;
				}
			})
		} else {
			$scope.movieResultEmpty = true;
		}
  }).catch(function(data) {
    console.log('movies fetch err ', data);
  });

  // Rate Books and Movies
  // Rate Book
  $scope.rateBook = function(book_id, rating) {
    $("#bookRating" + book_id).removeClass("value-0 value-1 value-2 value-3 value-4 value-5").addClass("value-" + rating);
    $(".book-list #bookRating" + book_id).removeClass("value-0 value-1 value-2 value-3 value-4 value-5").addClass("value-" + rating);
    $(".book-search-list #bookRating" + book_id).removeClass("value-0 value-1 value-2 value-3 value-4 value-5").addClass("value-" + rating);
    $http({
      method: 'POST',
      url: '/api/addToReadlist',
      data: {
        book_id: book_id,
        user_id: $scope.userId,
        rating: rating
      }
    }).then(function(data) {
      return $http({
        method: 'POST',
        url: '/api/readlist',
        data: {
          user_id: $scope.userId
        }
      })
    }).then(function(data) {
			$scope.readlist = [];
			$scope.readlist = data.data;
			$scope.readlistEmpty = false;
			$timeout(function() {
				$scope.readlist.forEach(function(item) {
					$("#bookRating" + item.index).removeClass("value-0 value-1 value-2 value-3 value-4 value-5").addClass("value-" + item.user_rating);
				})
			}, 1);
		}).catch(function(data) {
      $("#bookRating" + book_id).removeClass("value-0 value-1 value-2 value-3 value-4 value-5");
      console.log('rateBook err ', data);
    });
  }

  // Rate
  $scope.rateMovie = function(movie_id, rating) {
    $("#movieRating" + movie_id).removeClass("value-0 value-1 value-2 value-3 value-4 value-5").addClass("value-" + rating);
    $(".movie-list #movieRating" + movie_id).removeClass("value-0 value-1 value-2 value-3 value-4 value-5").addClass("value-" + rating);
    $(".movie-search-list #movieRating" + movie_id).removeClass("value-0 value-1 value-2 value-3 value-4 value-5").addClass("value-" + rating);
    $http({
      method: 'POST',
      url: '/api/addToWatchlist',
      data: {
        movie_id: movie_id,
        user_id: $scope.userId,
        rating: rating
      }
    }).then(function(data) {
      return $http({
        method: 'POST',
        url: '/api/watchlist',
        data: {
          user_id: $scope.userId
        }
      })
    }).then(function(data) {
			$scope.watchlist = [];
			$scope.watchlist = data.data;
			$scope.watchlistEmpty = false;
			$timeout(function() {
				$scope.watchlist.forEach(function(item) {
					$("#movieRating" + item.index).removeClass("value-0 value-1 value-2 value-3 value-4 value-5").addClass("value-" + item.user_rating);
				})
			}, 1);
		}).catch(function(data) {
      $("#movieRating" + movie_id).removeClass("value-0 value-1 value-2 value-3 value-4 value-5");
      console.log('rateMovie err ', data);
    });
  }

	// Open search bar
	$scope.activateSearch = function(type) {
		if(type === 'book') {
			$scope.bookSearch = true;
		} else {
			$scope.movieSearch = true;
		}
	}

	// Perform search action and return results
	$scope.performSearch = function(type) {
		if(type === 'book') {
			$http({
        method: 'POST',
        url: '/api/searchBook',
        data: {
          user_id: $scope.userId,
          name: this.bookSearchInput
        }
      }).then(function(data) {
        $scope.bookSearchList = [];
        $scope.bookSearchList = data.data;
      })
		} else {
			$http({
				method: 'POST',
				url: '/api/searchMovie',
				data: {
					user_id: $scope.userId,
					name: this.movieSearchInput
				}
			}).then(function(data) {
				$scope.movieSearchList = [];
				$scope.movieSearchList = data.data;
			})
		}
	}

	// Close search bar
	$scope.closeSearch = function(type) {
		if(type === 'book') {
			$scope.bookSearch = false;
			$scope.bookSearchList = [];
			$http({
		    method: 'POST',
		    url: '/api/readlist',
		    data: {
		      user_id: $scope.userId
		    }
		  }).then(function(data) {
		    $scope.readlist = [];
		    $scope.readlist = data.data;
				if($scope.readlist.length === 0) {
					$scope.readlistEmpty = true;
				} else {
					$scope.readlistEmpty = false;
				}
		    $timeout(function() {
		      $scope.readlist.forEach(function(item) {
		        $("#bookRating" + item.index).removeClass("value-0 value-1 value-2 value-3 value-4 value-5").addClass("value-" + item.user_rating);
		      })
		    }, 1);
		  }).catch(function(err) {
		    console.log('fetch err ', err);
		  });
		} else {
			$scope.movieSearch = false;
			$scope.movieSearchList = [];
			$http({
		    method: 'POST',
		    url: '/api/watchlist',
		    data: {
		      user_id: $scope.userId
		    }
		  }).then(function(data) {
		    $scope.watchlist = [];
		    $scope.watchlist = data.data;
				if($scope.watchlist.length === 0) {
					$scope.watchlistEmpty = true;
				} else {
					$scope.watchlistEmpty = false;
				}
		    $timeout(function() {
		      $scope.watchlist.forEach(function(item) {
		        $("#movieRating" + item.index).removeClass("value-0 value-1 value-2 value-3 value-4 value-5").addClass("value-" + item.user_rating);
		      })
		    }, 1);
		  }).catch(function(err) {
		    console.log('fetch err ', err);
		  });
		}
	}

	// Update recommended list for books or movies
	$scope.updateList = function(type) {
		if(type === 'book') {
			$http({
				method: 'POST',
				url: '/api/userBook',
				data: {
					user_id: $scope.userId
				}
			}).then(function(data) {
				$scope.recommendedBooks = [];
				$scope.recommendedBooks = data.data;
				if($scope.recommendedBooks.length === 0) {
					$scope.bookResultEmpty = true;
				} else {
					$scope.bookResultEmpty = false;
				}
			})
		} else {
			$http({
				method: 'POST',
				url: '/api/userMovie',
				data: {
					user_id: $scope.userId
				}
			}).then(function(data) {
				$scope.recommendedMovies = [];
				$scope.recommendedMovies = data.data;
				if($scope.recommendedMovies.length === 0) {
					$scope.movieResultEmpty = true;
				} else {
					$scope.movieResultEmpty = false;
				}
			});
		}
	}

	// // show dropdown for selecting movie or tv series
	// $scope.toggleMovieDropdown = function() {
	// 	if($('#movieDropdown').hasClass('w3-show')) {
	// 		$('#movieDropdown').removeClass('w3-show');
	// 	} else {
	// 		$('#movieDropdown').addClass('w3-show');
	// 	}
	// }
	//
	// // change dropdown selection option
	// $scope.selectDropdownOption = function(option) {
	// 	$scope.movieSearchOption = option;
	// 	$('#movieDropdownSelected').text(option);
	// }

  $timeout(function() {
    $scope.userId = parseInt($window.localStorage.getItem("userId"));
		console.log($scope.userId);
  }, 300);
});
