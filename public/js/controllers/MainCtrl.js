angular.module('MainCtrl', []).controller('MainController', function($scope, $http, $window, $timeout, $document, $location) {

  $scope.genreSearchActive = false;
  $scope.nameText = "";
  $scope.newUser = true;
  $scope.bookGenres = [],
  $scope.movieGenres = [],
  $scope.genreSuggestionList = [],
  $scope.selectedGenres = [];

  if ($window.localStorage.getItem("loggedIn") == "true") {
    $scope.newUser = false;
  }

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
    console.log("popularBooks: ", $scope.popularBooks);
    console.log("popular books fetched");
  }).catch(function(data) {
    console.log('popular books err ', data);
  });

  $http({method: 'GET', url: '/api/popularMovies'}).then(function(data) {
    $scope.popularMovies = data.data;
    console.log("popularMovies: ", $scope.popularMovies);
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

    if (linkName !== 'Books') {
      if ($scope.movieGenres.length === 0) {
        $http.get('/api/movieGenres').then(function(data) {
          $scope.movieGenres = data.data;
          $scope.genreSuggestionList = $scope.movieGenres;
          console.log("movie genres fetched");
        }).catch(function(data) {
          console.log('movieGenres fetch err ', data);
        });
      }

      $scope.genreSuggestionList = $scope.movieGenres;
    } else {
      $scope.genreSuggestionList = $scope.bookGenres;
    }

    $scope.selectedGenres = [];
    $scope.nameText = "";
  }

  // show or hide account options
  $scope.toggleAccountOptions = function() {
    console.log("Called");
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
  angular.element($document[0].body).on('click', function(e) {
    e.stopPropagation();
    // console.log(!angular.element(e.target).hasClass("genre-search") && !angular.element(e.target).hasClass("genre-list-item"));
    if (!angular.element(e.target).hasClass("genre-search") && !angular.element(e.target).hasClass("genre-list-item")) {
      $timeout(function() {
        $scope.genreSearchActive = false;
      }, 1);
    }
  });

  // SHOW RECOMMENDATIONS SEARCH: BOOKS
  $scope.recommendWhenBooks = function() {
    console.log($scope.nameText);
    var bookName = $scope.nameText;
    if (bookName !== "") {
      $http({
        method: 'POST',
        url: '/api/bookSearch',
        data: {
          name: bookName
        }
      }).then(function(data) {
        console.log(data.data.books);
        $scope.popularBooks = [];
        $scope.popularMovies = [];
        $scope.popularBooks = data.data.books;
        $scope.popularMovies = data.data.movies;
        console.log($scope.popularBooks, $scope.popularMovies);
      }).catch(function(data) {
        console.log('recommendWhenBooks search err ', data);
      });
    } else {
      var data = '(';
      if ($scope.selectedGenres.length > 0) {
        $scope.selectedGenres.forEach(function(val, index) {
          if (index != $scope.selectedGenres.length - 1)
            data += "'" + val + "', ";
          else
            data += "'" + val + "'";
          }
        );
        data += ')';
        console.log(data);
        $http({
          method: 'POST',
          url: '/api/guestBookGenreSearch',
          data: {
            genres: data
          }
        }).then(function(data) {
          console.log(data.data.books);
          $scope.popularBooks = [];
          $scope.popularMovies = [];
          $scope.popularBooks = data.data.books;
          $scope.popularMovies = data.data.movies;
          console.log($scope.popularBooks, $scope.popularMovies);
        }).catch(function(data) {
          console.log('recommendWhenBooks search err ', data);
        });
      }
    }
  }

  // SHOW RECOMMENDATIONS SEARCH: MOVIES
  $scope.recommendWhenMovies = function() {
    console.log("movies", $scope.nameText);
    var movieName = $scope.nameText;
    if (movieName !== "") {
      $http({
        method: 'POST',
        url: '/api/movieSearch',
        data: {
          name: movieName
        }
      }).then(function(data) {
        console.log(data.data.books);
        $scope.popularBooks = [];
        $scope.popularMovies = [];
        $scope.popularBooks = data.data.books;
        $scope.popularMovies = data.data.movies;
        console.log($scope.popularBooks, $scope.popularMovies);
      }).catch(function(data) {
        console.log('recommendWhenBooks search err ', data);
      });
    } else {
      var data = '(';
      if ($scope.selectedGenres.length > 0) {
        $scope.selectedGenres.forEach(function(val, index) {
          if (index != $scope.selectedGenres.length - 1)
            data += "'" + val + "', ";
          else
            data += "'" + val + "'";
          }
        );
        data += ')';
        console.log(data);
        $http({
          method: 'POST',
          url: '/api/guestMovieGenreSearch',
          data: {
            genres: data
          }
        }).then(function(data) {
          console.log(data.data.books);
          $scope.popularBooks = [];
          $scope.popularMovies = [];
          $scope.popularBooks = data.data.books;
          $scope.popularMovies = data.data.movies;
          console.log($scope.popularBooks, $scope.popularMovies);
        }).catch(function(data) {
          console.log('recommendWhenMovies search err ', data);
        });
      }
    }
  }

  // Random recommendations
  $scope.randomRecommend = function() {
    $http({method: 'GET', url: '/api/randBook'}).then(function(data) {
      console.log(data.data.books);
      $scope.popularBooks = [];
      $scope.popularMovies = [];
      $scope.popularBooks = data.data.books;
      $scope.popularMovies = data.data.movies;
      console.log($scope.popularBooks, $scope.popularMovies);
    }).catch(function(data) {
      console.log('randomRecommend search err ', data);
    });
  }

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
      console.log(data);
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
      console.log(data);
    }).catch(function(data) {
      $("#movieRating" + movie_id).removeClass("value-0 value-1 value-2 value-3 value-4 value-5");
      console.log('rateMovie err ', data);
    });
  }

  // LOGIN
  $scope.verifyLogin = function() {
    console.log("trying login");
  }

  // REGISTER
  $scope.registerUser = function() {
    console.log("registering user");
  }

  // Close the Authentication popup
  $scope.toggleLogin = function() {
    angular.element('.account-options').addClass('hidden');
    $scope.loginAttempt = !$scope.loginAttempt;
  }

  // Logout
  var logout = function() {
    localStorage.clear();
    $location.path('/login');
  }

  $timeout(function() {
    document.getElementsByClassName("tablink")[0].click();
    angular.element('.account-options').addClass('hidden');
  }, 300);
});
