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
    connection.query('SELECT genre, count(genre) FROM cis550.BOOK_GENRES group by genre having count(genre)>25 order by count(genre) desc;', function(err, res) {
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
    connection.query('SELECT title, rating FROM cis550.BOOKS where rating >= 4 ORDER BY RAND() LIMIT 10;', function(err, res) {
      if (err)
        response.send({err: err});
      var result = [];
      res.forEach(function(item, index) {
        result.push({name: item.title, rating: item.rating});
      });

      response.send(result);
    });
  });

  app.get('/api/popularMovies', function(request, response) {
    connection.query('SELECT title, rating FROM cis550.MOVIES where rating >= 8 ORDER BY RAND() LIMIT 10;', function(err, res) {
      if (err)
        response.send({err: err});
      var result = [];
      res.forEach(function(item, index) {
        result.push({name: item.title, rating: item.rating});
      });

      response.send(result);
    });
  });

  // added by Kara

  /////////////////////////////////////////////////////////
  //Guest
  ///////////////////////////////////////////////////////////

  // Search based on list of genres guest user inputs:book_genre -> books
  app.get('/api/guestBookGenreSearchBook/:user', function(request, response) {
    connection.query("SELECT b.title, b.rating FROM cis550.BOOKS b WHERE b.rating >= 4 AND b.id IN (SELECT DISTINCT(book_id) FROM cis550.BOOK_GENRES WHERE genre IN user=?) ORDER BY RAND() LIMIT 20", request.params.user, function(err, res) {
      if (err)
        response.send({err: err});
      var result = [];
      res.forEach(function(item, index) {
        result.push({name: item.b.title, rating: item.b.rating});
      });

      response.send(result);
    });
  });

  // Search based on list of genres guest user inputs: book_genre -> movies
  app.get('/api/guestBookGenreSearchMovie/:user', function(request, response) {
    connection.query("SELECT m.title, m.rating FROM cis550.MOVIES m WHERE m.rating >= 8 AND m.id IN (SELECT mg.movie_id FROM cis550.MOVIE_GENRES mg WHERE mg.genre IN (SELECT movie_genre FROM cis550.GENRES WHERE book_genre IN user=?))) ORDER BY RAND() LIMIT 20", request.params.user, function(err, res) {
      if (err)
        response.send({err: err});
      var result = [];
      res.forEach(function(item, index) {
        result.push({name: item.m.title, rating: item.m.rating});
      });

      response.send(result);
    });
  });

  // Search based on list of genres guest user inputs:movie_genre -> books
  app.get('/api/guestMovieGenreSearchBook/:user', function(request, response) {
    connection.query("SELECT b.title, b.rating FROM cis550.BOOKS b WHERE b.rating >= 4 AND b.id IN (SELECT DISTINCT(bg.book_id) FROM cis550.BOOK_GENRES bg WHERE bg.genre IN (SELECT book_genre FROM cis550.GENRES WHERE movie_genre IN user=?)) ORDER BY RAND() LIMIT 20", request.params.user, function(err, res) {
      if (err)
        response.send({err: err});
      var result = [];
      res.forEach(function(item, index) {
        result.push({name: item.b.title, rating: item.b.rating});
      });

      response.send(result);
    });
  });

  // Search based on list of genres guest user inputs: movie_genre -> movies
  app.get('/api/guestBookGenreSearchMovie/:user', function(request, response) {
    connection.query("SELECT m.title, m.rating FROM cis550.MOVIES m WHERE m.rating >= 8 AND m.id IN (SELECT DISTINCT(movie_id) FROM cis550.MOVIE_GENRES WHERE genre IN user=?) ORDER BY RAND() LIMIT 20", request.params.user, function(err, res) {
      if (err)
        response.send({err: err});
      var result = [];
      res.forEach(function(item, index) {
        result.push({name: item.m.title, rating: item.m.rating});
      });

      response.send(result);
    });
  });

    // Random choice of book
    app.get('/api/randBook', function(request, response) {
      connection.query("SELECT title, rating FROM cis550.BOOKS ORDER BY RAND() LIMIT 1", function(err, res) {
        if (err)
          response.send({err: err});
        var result = [];
        res.forEach(function(item, index) {
          result.push({name: item.title, rating: item.rating});
        });
  
        response.send(result);
      });
    });

    // Random choice of movie
    app.get('/api/randBook', function(request, response) {
      connection.query("SELECT title, rating FROM cis550.MOVIES ORDER BY RAND() LIMIT 1", function(err, res) {
        if (err)
          response.send({err: err});
        var result = [];
        res.forEach(function(item, index) {
          result.push({name: item.title, rating: item.rating});
        });
  
        response.send(result);
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
