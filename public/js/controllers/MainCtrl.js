angular.module('MainCtrl', []).controller('MainController', function($scope, $http, $window, $timeout, $document, $location) {

  $scope.genreSearchActive = false;
  $scope.nameText = "";
  $scope.newUser = true;
  $scope.movieResultEmpty = false;
  $scope.bookResultEmpty = false;
  $scope.bookGenres = [],
  $scope.movieGenres = [],
  $scope.seriesGenres = [],
  $scope.originalSeriesGenreList = [],
  $scope.genreSuggestionList = [],
  $scope.selectedGenres = [];

  // Get movie and book genres
  $http({method: 'GET', url: '/api/bookGenres'}).then(function(data) {
    $scope.bookGenres = data.data;
    $scope.genreSuggestionList = $scope.bookGenres;
  }).catch(function(data) {
    console.log('bookGenres fetch err ', data);
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
      if(linkName === 'Movies') {
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
        if ($scope.seriesGenres.length === 0) {
          const tmdbGenreApi = 'https://api.themoviedb.org/3/genre/tv/list?api_key=184ba85c42f24811ae9df09de965ad02&language=en-US';
          $http.get(tmdbGenreApi).then(function(data) {
            $scope.originalSeriesGenreList = data.data.genres;
            $scope.originalSeriesGenreList.forEach(function(genre) {
              $scope.seriesGenres.push(genre.name);
            });
            $scope.genreSuggestionList = $scope.seriesGenres;
            console.log("series genres fetched", $scope.genreSuggestionList);
          }).catch(function(data) {
            console.log('seriesGenres fetch err ', data);
          });
        }

        $scope.genreSuggestionList = $scope.seriesGenres;
      }
    } else {
      $scope.genreSuggestionList = $scope.bookGenres;
    }

    $scope.selectedGenres = [];
    $scope.nameText = "";
  }

  // Show genre search list
  $scope.addGenreSearch = function() {
    $scope.genreSearchActive = true;
    $scope.nameText = "";
  }

  // Show genre search list
  $scope.addNameSearch = function() {
    $scope.selectedGenres = [];
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
        $scope.bookResultEmpty = false;
        $scope.movieResultEmpty = false;
        if($scope.popularBooks.length === 0) {
          $scope.bookResultEmpty = true;
        }
        if($scope.popularMovies.length === 0) {
          $scope.movieResultEmpty = true;
        }
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
          $scope.popularBooks = [];
          $scope.popularMovies = [];
          $scope.popularBooks = data.data.books;
          $scope.popularMovies = data.data.movies;
          $scope.bookResultEmpty = false;
          $scope.movieResultEmpty = false;
          if($scope.popularBooks.length === 0) {
            $scope.bookResultEmpty = true;
          }
          if($scope.popularMovies.length === 0) {
            $scope.movieResultEmpty = true;
          }
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
        $scope.popularBooks = [];
        $scope.popularMovies = [];
        $scope.popularBooks = data.data.books;
        $scope.popularMovies = data.data.movies;
        $scope.bookResultEmpty = false;
        $scope.movieResultEmpty = false;
        if($scope.popularBooks.length === 0) {
          $scope.bookResultEmpty = true;
        }
        if($scope.popularMovies.length === 0) {
          $scope.movieResultEmpty = true;
        }
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
          $scope.popularBooks = [];
          $scope.popularMovies = [];
          $scope.popularBooks = data.data.books;
          $scope.popularMovies = data.data.movies;
          $scope.bookResultEmpty = false;
          $scope.movieResultEmpty = false;
          if($scope.popularBooks.length === 0) {
            $scope.bookResultEmpty = true;
          }
          if($scope.popularMovies.length === 0) {
            $scope.movieResultEmpty = true;
          }
          console.log($scope.popularBooks, $scope.popularMovies);
        }).catch(function(data) {
          console.log('recommendWhenMovies search err ', data);
        });
      }
    }
  }

  // SHOW RECOMMENDATIONS SEARCH: TV SERIES
  $scope.recommendWhenSeries = function() {
    console.log("series", $scope.nameText);
    var seriesName = $scope.nameText;
    if (seriesName !== "") {
      const url = '/api/seriesSearch/'+seriesName;
      console.log(url);
      $http.get(url).then(function(data) {
        $scope.popularBooks = [];
        $scope.popularMovies = [];
        $scope.popularBooks = data.data.books;
        $scope.popularMovies = data.data.movies;
        $scope.bookResultEmpty = false;
        $scope.movieResultEmpty = false;
        if($scope.popularBooks.length === 0) {
          $scope.bookResultEmpty = true;
        }
        if($scope.popularMovies.length === 0) {
          $scope.movieResultEmpty = true;
        }
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
          url: '/api/guestSeriesGenreSearch',
          data: {
            genres: data
          }
        }).then(function(data) {
          $scope.popularBooks = [];
          $scope.popularMovies = [];
          $scope.popularBooks = data.data.books;
          $scope.popularMovies = data.data.movies;
          $scope.bookResultEmpty = false;
          $scope.movieResultEmpty = false;
          if($scope.popularBooks.length === 0) {
            $scope.bookResultEmpty = true;
          }
          if($scope.popularMovies.length === 0) {
            $scope.movieResultEmpty = true;
          }
          console.log($scope.popularBooks, $scope.popularMovies);
        }).catch(function(data) {
          console.log('recommendWhenMovies search err ', data);
        });
      }
    }
  }

  // Random recommendations
  $scope.randomRecommend = function() {
    $scope.selectedGenres = [];
    $scope.nameText = "";

    $http({method: 'GET', url: '/api/randBook'}).then(function(data) {
      $scope.popularBooks = [];
      $scope.popularMovies = [];
      $scope.popularBooks = data.data.books;
      $scope.popularMovies = data.data.movies;
      $scope.bookResultEmpty = false;
      $scope.movieResultEmpty = false;
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
        user_id: $scope.userId,
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
        user_id: $scope.userId,
        rating: rating
      }
    }).then(function(data) {
      console.log(data);
    }).catch(function(data) {
      $("#movieRating" + movie_id).removeClass("value-0 value-1 value-2 value-3 value-4 value-5");
      console.log('rateMovie err ', data);
    });
  }

  $timeout(function() {
    document.getElementsByClassName("tablink")[0].click();
    angular.element('.account-options').addClass('hidden');
    if ($window.localStorage.getItem("loggedIn") == "true") {
      $scope.newUser = false;
      $scope.userId = parseInt($window.localStorage.getItem("userId"));
      console.log($scope.userId);

      console.log('Getting recommended items');
      $http({
        method: 'POST',
        url: '/api/userBook',
        data: {
          user_id: $scope.userId
        }
      }).then(function(data) {
        $scope.popularBooks = [];
        $scope.popularBooks = data.data;
        if($scope.popularBooks.length === 0) {
          $scope.bookResultEmpty = true;
        }
      });

      $http({
        method: 'POST',
        url: '/api/userMovie',
        data: {
          user_id: $scope.userId
        }
      }).then(function(data) {
        $scope.popularMovies = [];
        $scope.popularMovies = data.data;
        if($scope.popularMovies.length === 0) {
          $scope.movieResultEmpty = true;
        }
      });
    } else {
      // GET the POPULAR books and movies
      console.log('Getting popular items');
      $http({method: 'GET', url: '/api/popularBooks'}).then(function(data) {
        $scope.popularBooks = []
        $scope.popularBooks = data.data;
        $scope.bookResultEmpty = false;

        return $http({method: 'GET', url: '/api/popularMovies'})
      }).then(function(data) {
        $scope.popularMovies = []
        $scope.popularMovies = data.data;
        $scope.movieResultEmpty = false;
      }).catch(function(data) {
        console.log('popular books err ', data);
      });
    }
  }, 1);
});
