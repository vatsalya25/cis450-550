var mysql = require('mysql');
module.exports = function(app) {
  var connection = mysql.createConnection({
    host: 'cis550project.c1plmbfccyny.us-east-1.rds.amazonaws.com',
    port: '3306',
    user: 'cis550project',
    password: 'cis550project!'
  });

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
    connection.query('SELECT id, title, rating FROM cis550.MOVIES where rating >= 8 ORDER BY RAND() LIMIT 10;', function(err, res) {
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
  app.get('/api/guestBookGenreSearch/:user', function(request, response) {
    var result = [];
    connection.query("SELECT b.title, b.rating FROM cis550.book b WHERE b.rating >= 4 AND b.id IN (SELECT DISTINCT(book_id) FROM cis550.BOOK_GENRE WHERE genre IN user=?) ORDER BY RAND() LIMIT 20", request.params.user, function(err, res) {
      if (err)
        response.send({err: err});
      var bookResult = [];
      res.forEach(function(item, index) {
        bookResult.push({name: item.b.title, rating: item.b.rating});
      });

      result.push({books: bookResult});
    });

    connection.query("SELECT m.title, m.rating FROM cis550.MOVIES m WHERE m.rating >= 8 AND m.id IN (SELECT mg.movie_id FROM cis550.MOVIE_GENRES mg WHERE mg.genre IN (SELECT movie_genre FROM cis550.GENRES WHERE book_genre IN user=?))) ORDER BY RAND() LIMIT 20", request.params.user, function(err, res) {
      if (err)
        response.send({err: err});
      var movieResult = [];
      res.forEach(function(item, index) {
        movieResult.push({name: item.m.title, rating: item.m.rating});
      });

      result.push({movies: movieResult});
    });


    response.send(result);
  });

  // Search based on list of genres guest user inputs:movie_genre -> books
  app.get('/api/guestMovieGenreSearchBook/:user', function(request, response) {
    connection.query("SELECT b.title, b.rating FROM cis550.book b WHERE b.rating >= 4 AND b.id IN (SELECT DISTINCT(bg.book_id) FROM cis550.BOOK_GENRE bg WHERE bg.genre IN (SELECT book_genre FROM cis550.GENRES WHERE movie_genre IN user=?)) ORDER BY RAND() LIMIT 20", request.params.user, function(err, res) {
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
      connection.query("SELECT title, rating FROM cis550.book ORDER BY RAND() LIMIT 1", function(err, res) {
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

  //**recommendations from BOOK search bar***
      // book recs based on book
    app.get('/api/bookSearch', function(request, response) {
      var result = [];
      connection.query("SELECT b.title as title1, b.authors, bg.genre, b.rating as rating1 FROM cis550.book b JOIN cis550.BOOK_GENRE bg ON b.id = bg.book_id JOIN (SELECT genre FROM cis550.BOOK_GENRE g WHERE book_id = (SELECT id FROM cis550.book WHERE title=\"The Dark Tower\") ORDER BY count DESC LIMIT 2) g ON g.genre = bg.genre WHERE rating >=4 AND rating_count >=75000 ORDER BY RAND() LIMIT 10;", function(err, res) {
        if (err)
          response.send({err: err});
        var bookResult = [];
        res.forEach(function(item, index) {
          bookResult.push({name: item.title1, rating: item.rating1});
        });

        result.push({books: bookResult});
    // movie recs based on book
      connection.query("SELECT m.title as title1, mg.genre, m.rating as rating1 FROM cis550.MOVIES m JOIN cis550.MOVIE_GENRES mg ON m.id = mg.movie_id JOIN cis550.GENRES g ON g.movie_genre = mg.genre JOIN (SELECT genre FROM cis550.BOOK_GENRE WHERE book_id = (SELECT id FROM cis550.book WHERE title=\"The Dark Tower\") ORDER BY count DESC LIMIT 1) bg ON bg.genre = g.book_genre WHERE rating >=8 ORDER BY RAND() LIMIT 10; ", request.params.user, function(err, res) {
        if (err)
          response.send({err: err});
        var movieResult = [];
        res.forEach(function(item, index) {
          movieResult.push({name: item.title1, rating: item.rating1});
        });

        result.push({movies: movieResult});

      response.send(result);
      
      });
    });
  });


  //***reommendations from MOVIE search bar****
      // book recs based on movie
    app.get('/api/movieSearch', function(request, response) {
      var result = [];
      connection.query("SELECT DISTINCT b.title as title1, b.authors, bg.genre, b.rating as rating1 FROM cis550.book b JOIN cis550.BOOK_GENRE bg ON b.id = bg.book_id JOIN cis550.GENRES g ON g.book_genre = bg.genre JOIN (SELECT genre FROM cis550.MOVIE_GENRES WHERE movie_id =(SELECT id FROM cis550.MOVIES WHERE title=\"Finding Nemo\") LIMIT 1) mg ON mg.genre = g.movie_genre WHERE rating >=4 ORDER BY RAND() LIMIT 10;", function(err, res) {
      if (err)
        response.send({err: err});
      var bookResult = [];
      res.forEach(function(item, index) {
        bookResult.push({name: item.title1, rating: item.rating1});
      });

      result.push({books: bookResult});

      // movie recs based on movie
      connection.query("SELECT m.title as title1, mg.genre, m.rating AS rating1 FROM cis550.MOVIES m JOIN cis550.MOVIE_GENRES mg ON m.id = mg.movie_id JOIN (SELECT genre FROM cis550.MOVIE_GENRES g WHERE movie_id = (SELECT id FROM cis550.MOVIES WHERE title=\"Finding Nemo\") LIMIT 1) g ON g.genre = mg.genre WHERE rating >=8 ORDER BY RAND() LIMIT 10;", request.params.user, function(err, res) {
      if (err)
        response.send({err: err});
      var movieResult = [];
      res.forEach(function(item, index) {
        movieResult.push({name: item.title1, rating: item.rating1});
      });

      result.push({movies: movieResult});

      response.send(result);
    
      }); 
    });
  });


  //user movies recs (based on watched history)
      app.get('/api/userMovie', function(request, response) {
      connection.query("SELECT m.title as title1, mg.genre, m.rating as rating1 FROM cis550.MOVIES m JOIN cis550.MOVIE_GENRES mg ON m.id = mg.movie_id LEFT JOIN cis550.WATCHED w ON w.movie_id = m.id JOIN (SELECT AVG(rating) as r, genre FROM cis550.WATCHED w2 JOIN cis550.MOVIE_GENRES mg2 ON mg2.movie_id = w2.movie_id WHERE w2.user_id = 655 GROUP BY genre ORDER BY AVG(rating) DESC LIMIT 2) tg ON tg.genre = mg.genre WHERE m.rating >=8 ORDER BY RAND() LIMIT 10; ", function(err, res) {
        if (err)
          response.send({err: err});
        var result = [];
        res.forEach(function(item, index) {
          result.push({name: item.title1, rating: item.rating1});
        });

        response.send(result);
      });
    });

  //user book recs (based on read history)
      app.get('/api/userBook', function(request, response) {
      connection.query("SELECT b.title as title1, bg.genre, b.rating as rating1 FROM cis550.book b JOIN cis550.BOOK_GENRE bg ON b.id = bg.book_id LEFT JOIN cis550.READ r ON r.book_id = b.id JOIN (SELECT AVG(rating) as r, genre FROM cis550.READ r2 JOIN cis550.BOOK_GENRE bg2 ON bg2.book_id = r2.book_id WHERE r2.user_id = 655 GROUP BY genre ORDER BY AVG(rating) DESC LIMIT 2) tg ON tg.genre = bg.genre WHERE b.rating >=4 AND b.rating_count >=75000 ORDER BY RAND() LIMIT 10; ", function(err, res) {
        if (err)
          response.send({err: err});
        var result = [];
        res.forEach(function(item, index) {
          result.push({name: item.title1, rating: item.rating1});
        });

        response.send(result);
      });
    });

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
