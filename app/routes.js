var mysql = require('mysql');
module.exports = function(app) {
  var connection = mysql.createConnection({host: 'cis550project.c1plmbfccyny.us-east-1.rds.amazonaws.com', port: '3306', user: 'cis550project', password: 'cis550project!'});

  connection.connect(function(err) {
    if (err) {
      console.error('error connecting: ' + err.stack);
      return;
    }

    console.log('connected in routes as id ' + connection.threadId);
  });

  // server routes ===========================================================
  // handle API calls
  app.get('/api/bookGenres', function(request, response) {
    connection.query('SELECT genre, count(genre) FROM cis550.BOOK_GENRE group by genre having count(genre)>25 order by count(genre) desc;', function(err, res) {
      if (err)
        response.send({err: err});
      var result = [];
      res.forEach(function(item, index) {
        result.push(item.genre);
      });

      response.send(result);
    });
  });

  app.get('/api/movieGenres', function(request, response) {
    connection.query('SELECT distinct genre FROM cis550.MOVIE_GENRES LIMIT 1, 50;', function(err, res) {
      if (err)
        response.send({err: err});
      var result = [];
      res.forEach(function(item, index) {
        result.push(item.genre);
      });

      response.send(result);
    });
  });

  app.get('/api/popularBooks', function(request, response) {
    connection.query('SELECT id, title, rating FROM cis550.book where rating >= 4 ORDER BY RAND() LIMIT 10;', function(err, res) {
      if (err)
        response.send({err: err});
      var result = [];
      res.forEach(function(item, index) {
        result.push({name: item.title, rating: item.rating, index: item.id});
      });

      response.send(result);
    });
  });

  app.get('/api/popularMovies', function(request, response) {
    connection.query('SELECT id, title, rating FROM cis550.movie where rating >= 4 ORDER BY RAND() LIMIT 10;', function(err, res) {
      if (err)
        response.send({err: err});
      var result = [];
      res.forEach(function(item, index) {
        result.push({name: item.title, rating: item.rating, index: item.id});
      });

      response.send(result);
    });
  });

  // added by Kara

  /////////////////////////////////////////////////////////
  //Guest
  ///////////////////////////////////////////////////////////

  // Search based on list of genres guest user inputs:book_genre -> books
  app.post('/api/guestBookGenreSearch', function(request, response) {
    var result = {};
    var query1 = "SELECT b.id, b.title, b.rating FROM cis550.book b WHERE b.rating >= 4 AND b.id IN (SELECT DISTINCT(book_id) FROM cis550.BOOK_GENRE WHERE genre IN " + request.body.genres + ") ORDER BY RAND() LIMIT 20;";

    connection.query(query1, function(err, res) {
      if (err)
        response.send({err: err});
      var bookResult = [];
      res.forEach(function(item, index) {
        bookResult.push({name: item.title, rating: item.rating, index: item.id});
      });

      result.books = bookResult;

      var query2 = "SELECT m.id, m.title, m.rating FROM cis550.movie m WHERE m.rating >= 4 AND m.id IN (SELECT mg.movie_id FROM cis550.MOVIE_GENRES mg WHERE mg.genre IN (SELECT movie_genre FROM cis550.GENRES WHERE book_genre IN " + request.body.genres + ")) ORDER BY RAND() LIMIT 20;"

      connection.query(query2, function(err, res) {
        if (err)
          response.send({err: err});
        var movieResult = [];
        res.forEach(function(item, index) {
          movieResult.push({name: item.title, rating: item.rating, index: item.id});
        });

        result.movies = movieResult;

        response.send(result);
      });
    });
  });

  // Search based on list of genres guest user inputs:movie_genre -> books
  app.post('/api/guestMovieGenreSearch', function(request, response) {
    var result = {};
    var query1 = "SELECT b.title, b.rating FROM cis550.book b WHERE b.rating >= 4 AND b.id IN (SELECT DISTINCT(bg.book_id) FROM cis550.BOOK_GENRE bg WHERE bg.genre IN (SELECT book_genre FROM cis550.GENRES WHERE movie_genre IN " + request.body.genres + ")) ORDER BY RAND() LIMIT 20;";

    connection.query(query1, function(err, res) {
      if (err)
        response.send({err: err});
      var bookResult = [];
      res.forEach(function(item, index) {
        bookResult.push({name: item.title, rating: item.rating});
      });

      result.books = bookResult;
      var query2 = "SELECT m.title, m.rating FROM cis550.movie m WHERE m.rating >= 4 AND m.id IN (SELECT DISTINCT(movie_id) FROM cis550.MOVIE_GENRES WHERE genre IN " + request.body.genres + ") ORDER BY RAND() LIMIT 20;"

      connection.query(query2, function(err, res) {
        if (err)
        response.send({err: err});
        var movieResult = [];
        res.forEach(function(item, index) {
          movieResult.push({name: item.title, rating: item.rating});
        });

        result.movies = movieResult;

        response.send(result);
      });
    });
  });

  // Random choice of book
  app.get('/api/randBook', function(request, response) {
    var result = {};
    connection.query("SELECT title, rating FROM cis550.book ORDER BY RAND() LIMIT 10", function(err, res) {
      if (err)
        response.send({err: err});
      var bookResult = [];
      res.forEach(function(item, index) {
        bookResult.push({name: item.title, rating: item.rating});
      });

      result.books = bookResult;

      // Random choice of movie
      connection.query("SELECT title, rating FROM cis550.movie ORDER BY RAND() LIMIT 10", function(err, res) {
        if (err)
        response.send({err: err});
        var movieResult = [];
        res.forEach(function(item, index) {
          movieResult.push({name: item.title, rating: item.rating});
        });

        result.movies = movieResult;

        response.send(result);
      });
    });
  });

  // Search based on list of genres guest user inputs:tv_genre -> books
  app.post('/api/guestTVGenreSearch', function(request, response) {
    var result = {};
    var query1 = "SELECT b.title, b.rating FROM cis550.book b JOIN	(SELECT bg.book_id FROM cis550.BOOK_GENRE bg JOIN (SELECT g.book_genre FROM cis550.GENRES g JOIN (SELECT movie_genre FROM cis550.MOVIE_TV_GENRE WHERE tv_genre IN " + request.body.genres + ") mtg ON g.movie_genre = mtg.movie_genre) a ON bg.genre = a.book_genre) c ON b.id = c.book_id WHERE b.rating >= 4 ORDER BY RAND() LIMIT 20"
    

    connection.query(query1, function(err, res) {
      if (err)
        response.send({err: err});
      var bookResult = [];
      res.forEach(function(item, index) {
        bookResult.push({name: item.title, rating: item.rating, index: item.id});
      });

      result.books = bookResult;

      // guest logged in tv-genre -> movies
      var query2 = "SELECT m.title, m.rating FROM cis550.movie m JOIN	(SELECT mg.movie_id FROM cis550.MOVIE_GENRES mg JOIN	(SELECT movie_genre FROM cis550.MOVIE_TV_GENRE WHERE tv_genre IN '"+ request.body.genres + "') c ON mg.genre = c.movie_genre) d ON m.id = d.movie_id WHERE m.rating >= 4 ORDER BY RAND() LIMIT 20"

      connection.query(query2, function(err, res) {
        if (err)
          response.send({err: err});
        var movieResult = [];
        res.forEach(function(item, index) {
          movieResult.push({name: item.title, rating: item.rating, index: item.id});
        });

        result.movies = movieResult;

        response.send(result);
      });
    });
  });


  /////////////////////////////////////////////////////////
  //User logged in
  ///////////////////////////////////////////////////////////

  // Search based on list of genres logged in user inputs:book_genre -> books
  app.post('/api/loggedBookGenreSearch', function(request, response) {
    var result = {};
    var query1 = "SELECT b.id, b.title, b.rating FROM cis550.book b WHERE b.rating >= 4 AND b.id IN (SELECT DISTINCT(book_id) FROM cis550.BOOK_GENRE WHERE genre IN " + request.body.genres + ") AND b.id NOT IN (SELECT book_id FROM cis550.READ WHERE user_id = '" + request.body.userId + "') ORDER BY RAND() LIMIT 20;";

    connection.query(query1, function(err, res) {
      if (err)
        response.send({err: err});
      var bookResult = [];
      res.forEach(function(item, index) {
        bookResult.push({name: item.title, rating: item.rating, index: item.id});
      });

      result.books = bookResult;

      var query2 = "SELECT m.id, m.title, m.rating FROM cis550.movie m WHERE m.rating >= 4 AND m.id IN (SELECT mg.movie_id FROM cis550.MOVIE_GENRES mg WHERE mg.genre IN (SELECT movie_genre FROM cis550.GENRES WHERE book_genre IN " + request.body.genres + ")) AND m.id NOT IN (SELECT movie_id FROM cis550.WATCHED WHERE user_id = '" + request.body.userId + "') ORDER BY RAND() LIMIT 20;"

      connection.query(query2, function(err, res) {
        if (err)
          response.send({err: err});
        var movieResult = [];
        res.forEach(function(item, index) {
          movieResult.push({name: item.title, rating: item.rating, index: item.id});
        });

        result.movies = movieResult;

        response.send(result);
      });
    });
  });

  // Search based on list of genres logged in user inputs:movie_genre -> books
  app.post('/api/loggedMovieGenreSearch', function(request, response) {
    var result = {};
    var query1 = "SELECT b.title, b.rating FROM cis550.book b WHERE b.rating >= 4 AND b.id IN (SELECT DISTINCT(bg.book_id) FROM cis550.BOOK_GENRE bg WHERE bg.genre IN (SELECT book_genre FROM cis550.GENRES WHERE movie_genre IN " + request.body.genres + ")) AND b.id NOT IN (SELECT book_id FROM cis550.READ WHERE user_id = '" + request.body.userId + "') ORDER BY RAND() LIMIT 20;";

    connection.query(query1, function(err, res) {
      if (err)
        response.send({err: err});
      var bookResult = [];
      res.forEach(function(item, index) {
        bookResult.push({name: item.title, rating: item.rating});
      });

      result.books = bookResult;
      var query2 = "SELECT m.title, m.rating FROM cis550.movie m WHERE m.rating >= 4 AND m.id IN (SELECT DISTINCT(movie_id) FROM cis550.MOVIE_GENRES WHERE genre IN " + request.body.genres + ") AND m.id NOT IN (SELECT movie_id FROM cis550.WATCHED WHERE user_id ='" + request.body.userId + "') ORDER BY RAND() LIMIT 20;"

      connection.query(query2, function(err, res) {
        if (err)
        response.send({err: err});
        var movieResult = [];
        res.forEach(function(item, index) {
          movieResult.push({name: item.title, rating: item.rating});
        });

        result.movies = movieResult;

        response.send(result);
      });
    });
  });

  // Random choice of book for logged in user
  app.get('/api/randBookLogged', function(request, response) {
    var result = {};
    var query1 = "SELECT title, rating FROM cis550.book WHERE id NOT IN (SELECT book_id FROM cis550.READ WHERE user_id = '" + request.body.userId + "') ORDER BY RAND() LIMIT 10"

    connection.query(query1, function(err, res) {
      if (err)
        response.send({err: err});
      var bookResult = [];
      res.forEach(function(item, index) {
        bookResult.push({name: item.title, rating: item.rating});
      });

      result.books = bookResult;

      // Random choice of movie for logged in user
      var query2 = "SELECT title, rating FROM cis550.movie WHERE id NOT IN (SELECT movie_id FROM cis550.WATCHED WHERE user_id = " + request.body.userId + ") ORDER BY RAND() LIMIT 10"
      connection.query(query2, function(err, res) {
        if (err)
        response.send({err: err});
        var movieResult = [];
        res.forEach(function(item, index) {
          movieResult.push({name: item.title, rating: item.rating});
        });

        result.movies = movieResult;

        response.send(result);
      });
    });
  });

  // Search based on list of genres logged in user inputs:tv_genre -> books
  app.post('/api/LoggedTVGenreSearch', function(request, response) {
    var result = {};
    var query1 = "SELECT b.title, b.rating FROM cis550.book b JOIN	(SELECT bg.book_id FROM cis550.BOOK_GENRE bg JOIN (SELECT g.book_genre FROM cis550.GENRES g JOIN (SELECT movie_genre FROM cis550.MOVIE_TV_GENRE WHERE tv_genre IN " + request.body.genres + ") mtg ON g.movie_genre = mtg.movie_genre) a ON bg.genre = a.book_genre) c ON b.id = c.book_id WHERE b.rating >= 4 AND b.id NOT IN (SELECT book_id FROM cis550.READ WHERE user_id = '" + request.body.userId + "') ORDER BY RAND() LIMIT 20"
    

    connection.query(query1, function(err, res) {
      if (err)
        response.send({err: err});
      var bookResult = [];
      res.forEach(function(item, index) {
        bookResult.push({name: item.title, rating: item.rating, index: item.id});
      });

      result.books = bookResult;

      // tv-genre -> movies
      var query2 = "SELECT m.title, m.rating FROM cis550.movie m JOIN	(SELECT mg.movie_id FROM cis550.MOVIE_GENRES mg JOIN	(SELECT movie_genre FROM cis550.MOVIE_TV_GENRE WHERE tv_genre IN '"+ request.body.genres + "') c ON mg.genre = c.movie_genre) d ON m.id = d.movie_id WHERE m.rating >= 4 AND m.id NOT IN (SELECT movie_id FROM cis550.WATCHED WHERE user_id = '" + request.body.userId + "') ORDER BY RAND() LIMIT 20"

      connection.query(query2, function(err, res) {
        if (err)
          response.send({err: err});
        var movieResult = [];
        res.forEach(function(item, index) {
          movieResult.push({name: item.title, rating: item.rating, index: item.id});
        });

        result.movies = movieResult;

        response.send(result);
      });
    });
  });

  // Search based on list of genres logged in user inputs:tv_genre -> books
  app.post('/api/LoggedTVGenreSearch', function(request, response) {
    var result = {};
    var query1 = "SELECT b.title, b.rating FROM cis550.book b WHERE b.rating >= 4 AND b.id IN (SELECT DISTINCT(bg.book_id) FROM cis550.BOOK_GENRE bg WHERE bg.genre IN (SELECT book_genre FROM cis550.GENRES WHERE movie_genre IN " + request.body.genres + ")) AND b.id NOT IN (SELECT book_id FROM cis550.READ WHERE user_id = " + request.body.userId + ") ORDER BY RAND() LIMIT 20;";

    connection.query(query1, function(err, res) {
      if (err)
        response.send({err: err});
      var bookResult = [];
      res.forEach(function(item, index) {
        bookResult.push({name: item.title, rating: item.rating});
      });

      result.books = bookResult;
      var query2 = "SELECT m.title, m.rating FROM cis550.movie m WHERE m.rating >= 4 AND m.id IN (SELECT DISTINCT(movie_id) FROM cis550.MOVIE_GENRES WHERE genre IN " + request.body.genres + ") AND m.id NOT IN (SELECT movie_id FROM cis550.WATCHED WHERE user_id =" + request.body.userId + ") ORDER BY RAND() LIMIT 20;"

      connection.query(query2, function(err, res) {
        if (err)
        response.send({err: err});
        var movieResult = [];
        res.forEach(function(item, index) {
          movieResult.push({name: item.title, rating: item.rating});
        });

        result.movies = movieResult;

        response.send(result);
      });
    });
  });

  // added by Claire

  // added by Sandy

  app.get('/api/allGenres', function(req, res) {
    res.send({'genre': 'something'});
  });

  // authentication routes
  app.get('/api/login', function(req, res) {
    res.send({'genre': 'something'});
  });

  app.get('/api/register', function(req, res) {
    res.send({'genre': 'something'});
  });

  // frontend routes =========================================================
  // route to handle all angular requests
  app.get('*', function(req, res) {
    res.sendfile('./public/index.html');
  });

};
