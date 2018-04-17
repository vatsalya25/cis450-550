angular.module('MainCtrl', []).controller('MainController', function($scope, $http, $window, $timeout, $document) {

  $scope.genreSearchActive = false;
  $scope.newUser = true;
	$scope.bookGenres = [], $scope.movieGenres = [], $scope.allGenres = [], $scope.genreSuggestionList = [], $scope.selectedGenres = [];
  if ($window.localStorage.getItem("login") == true) {
    $scope.newUser = false;
  }

	console.log("CONTROLER");

  // Get movie and book genres
  $http({method: 'GET', url: '/api/bookGenres'}).then(function(data) {
    $scope.bookGenres = data.data;
		$scope.genreSuggestionList = $scope.bookGenres;
    console.log("book genres fetched");
  }).catch(function(data) {
    console.log('bookGenres fetch err ', data);
  });

  // GET the POPULAR books and movies
  $http({method: 'GET', url: '/api/popularBooks'}).then(function(data) {
    $scope.popularBooks = data.data;
    console.log("popular books fetched");
  }).catch(function(data) {
    console.log('popular books err ', data);
  });

  $http({method: 'GET', url: '/api/popularMovies'}).then(function(data) {
    $scope.popularMovies = data.data;
    console.log("popular movies fetched");
  }).catch(function(data) {
    console.log('popular movies fetch err ', data);
  });

  $scope.loginAttempt = false;
  $scope.openLink = function(evt, linkName) {
    var i,
      x,
      tablinks;
    x = document.getElementsByClassName("myLink");
    for (i = 0; i < x.length; i++) {
      x[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablink");
    for (i = 0; i < x.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" w3-red", "");
    }
    document.getElementById(linkName).style.display = "block";
    evt.currentTarget.className += " w3-red";

		if(linkName !== 'Books') {
			if($scope.movieGenres.length === 0) {
				$http.get('/api/movieGenres').then(function(data) {
					$scope.movieGenres = data.data;
					$scope.genreSuggestionList = $scope.movieGenres;
					console.log($scope.movieGenres);
					console.log("movie genres fetched");
				}).then(function(data){
					$scope.allGenres = $scope.movieGenres.concat($scope.bookGenres)
					if(linkName !== 'Movies') {
						$scope.genreSuggestionList = $scope.allGenres;
						console.log('all', $scope.genreSuggestionList);
					} else {
						$scope.genreSuggestionList = $scope.movieGenres;
						console.log('movies', $scope.genreSuggestionList);
					}
				}).catch(function(data) {
					console.log('movieGenres fetch err ', data);
				});
			}

			if(linkName !== 'Movies') {
				$scope.genreSuggestionList = $scope.allGenres;
				console.log('all', $scope.genreSuggestionList);
			} else {
				$scope.genreSuggestionList = $scope.movieGenres;
				console.log('movies', $scope.genreSuggestionList);
			}
		} else {
			$scope.genreSuggestionList = $scope.bookGenres;
			console.log('books', $scope.genreSuggestionList);
		}

		$scope.selectedGenres = [];
  }

  // show or hide account options
  $scope.toggleAccountOptions = function() {
    if ($scope.newUser) {
      angular.element('#newUserOptions').toggleClass('hidden');
    } else {
      angular.element('#registeredUserOptions').toggleClass('hidden');
    }
  }

	// Show genre search list
	$scope.addGenreSearch = function() {
		$scope.genreSearchActive = true;
		// $scope.genreText = "";
	}

	// Select genre items
	$scope.selectGenreItem = function(item) {
		$scope.genreSuggestionList.splice($scope.genreSuggestionList.indexOf(item), 1);
		$scope.selectedGenres.push(item);
	}

	// Remove genre items
	$scope.removeSelectedTag = function(item) {
		$scope.selectedGenres.splice($scope.selectedGenres.indexOf(item), 1);
		$scope.genreSuggestionList.push(item);
	}

	// Close genre list on clicking anywhere else in the body
	angular.element($document[0].body).on('click',function(e) {
		e.stopPropagation();
		// console.log(!angular.element(e.target).hasClass("genre-search") && !angular.element(e.target).hasClass("genre-list-item"));
		if(!angular.element(e.target).hasClass("genre-search") && !angular.element(e.target).hasClass("genre-list-item")) {
			$timeout(function() {
				$scope.genreSearchActive = false;
			}, 1);
		}
	});

  // LOGIN
  $scope.verifyLogin = function() {
    console.log("trying login");
  }

  // REGISTER
  $scope.registerUser = function() {
    console.log("registering user");
  }

  // Close the Authentication popup
  $scope.toggleLoginPopup = function() {
    angular.element('.account-options').addClass('hidden');
    $scope.loginAttempt = !$scope.loginAttempt;
  }

  $timeout(function() {
    document.getElementsByClassName("tablink")[0].click();
  }, 0);
});
