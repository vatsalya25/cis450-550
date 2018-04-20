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

  // added by Sandy

  //LOGIN API: checks if user email already exists in database, if not, will create new user
  //Otherwise signs the user in 
 // app.get('/api/userLogin/:user', function(request, response) {
 //    inDatabase = []
 //    connection.query('select exists(select * from cis550.USERS where cis550.USERS.email = "syin@gmail.com")', request.params.user, function(err,res))
    
 //    //create new user
 //    connection.query('INSERT INTO cis550.USERS VALUES (first_name, last_name, UUID(), email, password, gender)', request.params.user, function(err, res) {
    
 //    //login user: return true if user password and email in db
 //    connection.query('select exists(select * from cis550.USERS where cis550.USERS.email = "syin@gmail.com" and cis550.USERS.password = "hola")', request.params.user, function(err, res) {

 //      if (err)
 //        response.send({err: err});
 //      var result = [];
 //      inDatabase = res.FIELD //use this in the future
 //      res.forEach(function(item, index) {
 //        result.push({Books: item.b.title, Movies: item.m.title});
 //      });
 //      console.log(request.params.name);
 //      response.send(result); //can only do this once
 //    });
 //  });

  //DISPLAY WATCHLIST MOVIES
  app.get('/api/watchlist', function(req, res) {
    onnection.query('SELECT M.title as title, W.rating as user_rating, M.rating as avg_rating FROM cis550.WATCHED as W JOIN cis550.MOVIES as M ON W.movie_id = M.id WHERE user_id = "655"', request.params.user, function(err, res) {
      if (err)
        response.send({err: err});
      var result = [];
      res.forEach(function(item, index) {
        result.push({Books: item.b.title, Movies: item.m.title});
      });
      console.log(request.params.name);
      response.send(result);
    });
  });

  //DISPLAY READLIST BOOKS
  app.get('/api/readlist', function(req, res) {
    onnection.query('SELECT B.title, B.rating, R.rating FROM cis550.READ as R JOIN cis550.book as B ON R.book_id = B.id WHERE user_id = "655"', request.params.user, function(err, res) {
      if (err)
        response.send({err: err});
      var result = [];
      res.forEach(function(item, index) {
        result.push({Books: item.b.title, Movies: item.m.title});
      });
      console.log(request.params.name);
      response.send(result);
    });
  });

   //Add book to Readlist or update rating on book
  app.get('/api/addToReadlist', function(req, res) {
    // user id, rating, book_id
    onnection.query('INSERT INTO cis550.READ VALUES (655, 5, 33) ON DUPLICATE KEY UPDATE rating = VALUES(rating);', request.params.user, function(err, res) {
      if (err)
        response.send({err: err});
      var result = [];
      res.forEach(function(item, index) {
        result.push({Books: item.b.title, Movies: item.m.title});
      });
      console.log(request.params.name);
      response.send(result);
    });
  });

  //Add movie to watchlist or update rating on movie
  app.get('/api/addToWatchlist', function(req, res) {
    // user id, rating, book_id
    onnection.query('INSERT INTO cis550.WATCHED VALUES (655, 8, 13) ON DUPLICATE KEY UPDATE rating = VALUES(rating)', request.params.user, function(err, res) {
      if (err)
        response.send({err: err});
      var result = [];
      res.forEach(function(item, index) {
        result.push({Books: item.b.title, Movies: item.m.title});
      });
      console.log(request.params.name);
      response.send(result);
    });
  });

  //Search for movies based on Name, return movie title and average rating
  app.get('/api/searchMovie', function(req, res) {
    // user id, rating, book_id
    onnection.query('SELECT M.title, M.rating FROM cis550.MOVIES as M WHERE M.title LIKE "%Harry Potter% LIMIT 10', request.params.user, function(err, res) {
      if (err)
        response.send({err: err});
      var result = [];
      res.forEach(function(item, index) {
        result.push({Books: item.b.title, Movies: item.m.title});
      });
      console.log(request.params.name);
      response.send(result);
    });
  });

   //Search for books based on Name, return book title and average rating
  app.get('/api/searchBook', function(req, res) {
    // user id, rating, book_id
    onnection.query('SELECT B.title, B.rating FROM cis550.book as B WHERE B.title LIKE "%Harry Potter%" LIMIT 10', request.params.user, function(err, res) {
      if (err)
        response.send({err: err});
      var result = [];
      res.forEach(function(item, index) {
        result.push({Books: item.b.title, Movies: item.m.title});
      });
      console.log(request.params.name);
      response.send(result);
    });
  });


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
