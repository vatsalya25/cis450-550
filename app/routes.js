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

// Mongo stuff
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://cis550:cis550@ds249299.mlab.com:49299/cis550m"

//requeres an array of titles
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("cis550m");
  var query = {original_name: {$in: ['Mega64', 'NBA on TNT'] }};


  // dbo.collection("series").find(query).toArray(function(err, result){
  //   if (err) throw err;
  //   console.log(result);
  //   db.close();
  // });
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
    connection.query('SELECT id, title, rating FROM cis550.movie where rating >= 4 ORDER BY RAND() LIMIT 10;', function(err, res) {
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
  app.post('/api/guestBookGenreSearch', function(request, response) {
    var result = {};
    var query1 = "SELECT b.id, b.title, b.rating FROM cis550.book b WHERE b.rating >= 4 AND b.id IN (SELECT DISTINCT(book_id) FROM cis550.BOOK_GENRE WHERE genre IN " + request.body.genres + ") ORDER BY RAND() LIMIT 20;";

    connection.query(query1, function(err, res) {
      if (err)
        response.send({err: err});
      var result = [];
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
    var query1 = "SELECT b.title, b.rating FROM cis550.book b JOIN 	(SELECT DISTINCT(bg.book_id) FROM cis550.BOOK_GENRE bg JOIN	(SELECT book_genre FROM cis550.GENRES WHERE movie_genre IN " + request.body.genres + ") d ON bg.genre = d.book_genre) e ON b.id = e.book_id WHERE b.rating >= 4 ORDER BY RAND() LIMIT 20";

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

  //*** recommendations from BOOK search bar ***
  // book recs based on book
  app.post('/api/bookSearch', function(request, response) {
    var result = {};
    var query1 = "SELECT b.title as title1, b.authors, bg.genre, b.rating as rating1 FROM cis550.book b JOIN cis550.BOOK_GENRE bg ON b.id = bg.book_id JOIN (SELECT genre FROM cis550.BOOK_GENRE g WHERE book_id = (SELECT id FROM cis550.book WHERE title=\"" + request.body.name + "\") ORDER BY count DESC LIMIT 2) g ON g.genre = bg.genre WHERE rating >=4 AND rating_count >=75000 ORDER BY RAND() LIMIT 10;"
    connection.query(query1, function(err, res) {
      if (err)
        response.send({err: err});
      var bookResult = [];
      res.forEach(function(item, index) {
        bookResult.push({name: item.title1, rating: item.rating1});
      });

      result.books = bookResult;
      // movie recs based on book
      var query2 = "SELECT m.title as title1, mg.genre, m.rating as rating1 FROM cis550.movie m JOIN cis550.MOVIE_GENRES mg ON m.id = mg.movie_id JOIN cis550.GENRES g ON g.movie_genre = mg.genre JOIN (SELECT genre FROM cis550.BOOK_GENRE WHERE book_id = (SELECT id FROM cis550.book WHERE title=\"" + request.body.name + "\") ORDER BY count DESC LIMIT 1) bg ON bg.genre = g.book_genre WHERE rating >=4 ORDER BY RAND() LIMIT 10; "
      connection.query(query2, function(err, res) {
        if (err)
          response.send({err: err});
        var movieResult = [];
        res.forEach(function(item, index) {
          movieResult.push({name: item.title1, rating: item.rating1});
        });

        result.movies = movieResult;

        response.send(result);

      });
    });
  });

  //*** recommendations from MOVIE search bar ***
  // book recs based on movie
  app.post('/api/movieSearch', function(request, response) {
    var result = {};
    var query1 = "SELECT DISTINCT b.title as title1, b.authors, bg.genre, b.rating as rating1 FROM cis550.book b JOIN cis550.BOOK_GENRE bg ON b.id = bg.book_id JOIN cis550.GENRES g ON g.book_genre = bg.genre JOIN (SELECT genre FROM cis550.MOVIE_GENRES WHERE movie_id =(SELECT id FROM cis550.movie WHERE title=\"" + request.body.name + "\") LIMIT 1) mg ON mg.genre = g.movie_genre WHERE rating >=4 ORDER BY RAND() LIMIT 10;"
    connection.query(query1, function(err, res) {
      if (err)
        response.send({err: err});
      var bookResult = [];
      res.forEach(function(item, index) {
        bookResult.push({name: item.title1, rating: item.rating1});
      });

      result.books = bookResult;

      // movie recs based on movie
      var query2 = "SELECT m.title as title1, mg.genre, m.rating AS rating1 FROM cis550.movie m JOIN cis550.MOVIE_GENRES mg ON m.id = mg.movie_id JOIN (SELECT genre FROM cis550.MOVIE_GENRES g WHERE movie_id = (SELECT id FROM cis550.movie WHERE title=\"" + request.body.name + "\") LIMIT 1) g ON g.genre = mg.genre WHERE rating >=4 ORDER BY RAND() LIMIT 10;"
      connection.query(query2, request.params.user, function(err, res) {
        if (err)
          response.send({err: err});
        var movieResult = [];
        res.forEach(function(item, index) {
          movieResult.push({name: item.title1, rating: item.rating1});
        });

        result.movies = movieResult;

        response.send(result);
      });
      console.log(request.params.name);
      response.send(result);
    });
  });

  //user movies recs (based on watched history)
  app.post('/api/userMovie', function(request, response) {
    var query1 = "SELECT m.title as title1, mg.genre, m.rating as rating1 FROM cis550.movie m JOIN cis550.MOVIE_GENRES mg ON m.id = mg.movie_id LEFT JOIN cis550.WATCHED w ON w.movie_id = m.id JOIN (SELECT AVG(rating) as r, genre FROM cis550.WATCHED w2 JOIN cis550.MOVIE_GENRES mg2 ON mg2.movie_id = w2.movie_id WHERE w2.user_id =" + request.body.user_id + " GROUP BY genre ORDER BY AVG(rating) DESC LIMIT 2) tg ON tg.genre = mg.genre WHERE m.rating >=4 ORDER BY RAND() LIMIT 10;"
    console.log(query1);
    connection.query(query1, function(err, res) {
      if (err)
        response.send({err: err});
      var result = [];
      res.forEach(function(item, index) {
        result.push({Title: item.title, Rating: item.rating});
      });
      console.log(request.params.name);
      response.send(result);
    });
  });

  app.get('/api/allGenres', function(request, response) {
    res.send({'genre': 'something'});
  });

  // authentication routes
  app.get('/api/login', function(request, response) {
    res.send({'genre': 'something'});
  });

  app.get('/api/register', function(request, response) {
    res.send({'genre': 'something'});
  });

  // frontend routes =========================================================
  // route to handle all angular requests
  app.get('*', function(req, res) {
    res.sendfile('./public/index.html');
  });

};
