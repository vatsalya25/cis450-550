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

  //Guest
  

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

  // added by Claire

  //*** recommendations from BOOK search bar ***
  // book recs based on book
  app.post('/api/bookSearch', function(request, response) {
    var result = {};
    var query1 = "SELECT b.id, b.title as title1, b.authors, bg.genre, b.rating as rating1 FROM cis550.book b JOIN cis550.BOOK_GENRE bg ON b.id = bg.book_id JOIN (SELECT genre FROM cis550.BOOK_GENRE g WHERE book_id = (SELECT id FROM cis550.book WHERE title=\"" + request.body.name + "\") ORDER BY count DESC LIMIT 2) g ON g.genre = bg.genre WHERE rating >=4 AND rating_count >=75000 ORDER BY RAND() LIMIT 10;"
    connection.query(query1, function(err, res) {
      if (err)
        response.send({err: err});
      var bookResult = [];
      res.forEach(function(item, index) {
        bookResult.push({name: item.title1, rating: item.rating1, index: item.id});
      });

      result.books = bookResult;
      // movie recs based on book
      var query2 = "SELECT m.id, m.title as title1, mg.genre, m.rating as rating1 FROM cis550.movie m JOIN cis550.MOVIE_GENRES mg ON m.id = mg.movie_id JOIN cis550.GENRES g ON g.movie_genre = mg.genre JOIN (SELECT genre FROM cis550.BOOK_GENRE WHERE book_id = (SELECT id FROM cis550.book WHERE title=\"" + request.body.name + "\") ORDER BY count DESC LIMIT 1) bg ON bg.genre = g.book_genre WHERE rating >=4 ORDER BY RAND() LIMIT 10; "
      connection.query(query2, function(err, res) {
        if (err)
          response.send({err: err});
        var movieResult = [];
        res.forEach(function(item, index) {
          movieResult.push({name: item.title1, rating: item.rating1, index: item.id});
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
    var query1 = "SELECT DISTINCT b.id, b.title as title1, b.authors, bg.genre, b.rating as rating1 FROM cis550.book b JOIN cis550.BOOK_GENRE bg ON b.id = bg.book_id JOIN cis550.GENRES g ON g.book_genre = bg.genre JOIN (SELECT genre FROM cis550.MOVIE_GENRES WHERE movie_id =(SELECT id FROM cis550.movie WHERE title=\"" + request.body.name + "\") LIMIT 1) mg ON mg.genre = g.movie_genre WHERE rating >=4 ORDER BY RAND() LIMIT 10;"
    connection.query(query1, function(err, res) {
      if (err)
        response.send({err: err});
      var bookResult = [];
      res.forEach(function(item, index) {
        bookResult.push({name: item.title1, rating: item.rating1, index: item.id});
      });

      result.books = bookResult;

      // movie recs based on movie
      var query2 = "SELECT m.id, m.title as title1, mg.genre, m.rating AS rating1 FROM cis550.movie m JOIN cis550.MOVIE_GENRES mg ON m.id = mg.movie_id JOIN (SELECT genre FROM cis550.MOVIE_GENRES g WHERE movie_id = (SELECT id FROM cis550.movie WHERE title=\"" + request.body.name + "\") LIMIT 1) g ON g.genre = mg.genre WHERE rating >=4 ORDER BY RAND() LIMIT 10;"
      connection.query(query2, request.params.user, function(err, res) {
        if (err)
          response.send({err: err});
        var movieResult = [];
        res.forEach(function(item, index) {
          movieResult.push({name: item.title1, rating: item.rating1, index: item.id});
        });

        result.movies = movieResult;

        response.send(result);
      });
    });
  });

  //user movies recs (based on watched history)
  app.post('/api/userMovie', function(request, response) {
    var query1 = "SELECT m.id, m.title as title1, mg.genre, m.rating as rating1 FROM cis550.movie m JOIN cis550.MOVIE_GENRES mg ON m.id = mg.movie_id LEFT JOIN cis550.WATCHED w ON w.movie_id = m.id JOIN (SELECT AVG(rating) as r, genre FROM cis550.WATCHED w2 JOIN cis550.MOVIE_GENRES mg2 ON mg2.movie_id = w2.movie_id WHERE w2.user_id =" + request.body.user_id + " GROUP BY genre ORDER BY AVG(rating) DESC LIMIT 2) tg ON tg.genre = mg.genre WHERE m.rating >=4 ORDER BY RAND() LIMIT 10;"

    connection.query(query1, function(err, res) {
      if (err)
        response.send({err: err});
      var result = [];
      res.forEach(function(item, index) {
        result.push({name: item.title1, rating: item.rating1, index: item.id});
      });

      response.send(result);
    });
  });

  //user book recs (based on read history)
  app.post('/api/userBook', function(request, response) {
    var query1 = "SELECT b.id, b.title as title1, bg.genre, b.rating as rating1 FROM cis550.book b JOIN cis550.BOOK_GENRE bg ON b.id = bg.book_id LEFT JOIN cis550.READ r ON r.book_id = b.id JOIN (SELECT AVG(rating) as r, genre FROM cis550.READ r2 JOIN cis550.BOOK_GENRE bg2 ON bg2.book_id = r2.book_id WHERE r2.user_id =" + request.body.user_id + " GROUP BY genre ORDER BY AVG(rating) DESC LIMIT 2) tg ON tg.genre = bg.genre WHERE b.rating >=4 AND b.rating_count >=75000 ORDER BY RAND() LIMIT 10; "

    // console.log(query1);
    connection.query(query1, function(err, res) {
      if (err)
        response.send({err: err});
      var result = [];
      res.forEach(function(item, index) {
        result.push({name: item.title1, rating: item.rating1, index: item.id});
      });

      response.send(result);
    });
  });

  // added by Sandy

  //LOGIN API: checks if user email already exists in database, if not, will create new user
  //Otherwise signs the user in
  app.post('/api/register', function(request, response) {
    var query = 'INSERT INTO cis550.USERS VALUES ("'+request.body.fname+'", "'+request.body.lname+'", UUID(), "'+request.body.email+'", "'+request.body.password+'")'
    console.log(query);
    connection.query(query, function(err, res) {
      if (err)
        response.send({status: "duplicate"})
      else
        connections.query('SELECT user_id, first_name FROM cis550.USERS WHERE email = "v@g.com"', function(err, res)) {
        if (err)
          response.send({err: err});
        else
            response.send({status: "ok"}, res);

      });

      }
    );
  });

  //checks if user and password exists to login
  app.post('/api/login', function(request, response) {
    inDB = [];
    var query = 'select exists(select * from cis550.USERS where cis550.USERS.email = "'+request.body.email+'" AND cis550.USERS.password = "'+request.body.password+'") as E';
    connection.query(query, function(err, res) {
      var result = [];
      saveResults(res)
      if (err)
        response.send({err: err});

      if (inDB == 1) {
        connections.query('SELECT user_id, first_name FROM cis550.USERS WHERE email = "v@g.com"', function(err, res)) {
        if (err)
          response.send({err: err});
        else
          response.send({status: "ok"}, res);
      });
      } 
      else {
        response.send({status: "error"})
      }
    });
  });

  function saveResults(value) {
    inDB = value[0].E
  }

  //DISPLAY WATCHLIST MOVIES
  app.post('/api/watchlist', function(request, response) {
    var query = 'SELECT M.id, M.title as title, W.rating as user_rating, M.rating as avg_rating FROM cis550.WATCHED as W JOIN cis550.movie as M ON W.movie_id = M.id WHERE user_id = "'+ request.body.user_id +'"';
    // console.log(query);
    connection.query(query, function(err, res) {
      if (err)
        response.send({err: err});
      var result = [];
      res.forEach(function(item, index) {
        result.push({name: item.title, index: item.id, user_rating: item.user_rating, rating: item.avg_rating});
      });
      response.send(result);
    });
  });

  //DISPLAY READLIST BOOKS
  app.post('/api/readlist', function(request, response) {
    var query = 'SELECT B.id, B.title, B.rating as avg_rating, R.rating as user_rating FROM cis550.READ as R JOIN cis550.book as B ON R.book_id = B.id WHERE user_id = "'+ request.body.user_id +'"';
    // console.log(query);
    connection.query(query, function(err, res) {
      if (err)
        response.send({err: err});
      var result = [];
      res.forEach(function(item, index) {
        result.push({name: item.title, index: item.id, user_rating: item.user_rating, rating: item.avg_rating});
      });
      response.send(result);
    });
  });

  //Add book to Readlist or update rating on book: user id, rating, book_id
  app.post('/api/addToReadlist', function(request, response) {
    //try to add down under
    var query = 'INSERT INTO cis550.READ VALUES ('+ request.body.user_id +', '+ request.body.rating +', '+ request.body.book_id +') ON DUPLICATE KEY UPDATE rating = VALUES(rating);';
    console.log(query);
    connection.query(query, function(err, res) {
      console.log("err: ", err);
      console.log("res: ", res);
      if (err)
        response.send({err: err});
      response.send(res);
    });
  });

  //Add movie to watchlist or update rating on movie
  app.post('/api/addToWatchlist', function(request, response) {
    // user id, rating, book_id
    //10: Simpson's Movie :)
    var query = 'INSERT INTO cis550.WATCHED VALUES ("'+ request.body.user_id +'", "'+ request.body.rating +'", "'+ request.body.movie_id +'") ON DUPLICATE KEY UPDATE rating = VALUES(rating)'
    console.log(query);
    connection.query(query, function(err, res) {
      if (err)
        response.send({err: err});
      var result = [];
      response.send(result);
    });
  });

  //Search for movies based on Name, return movie title and average rating
  app.get('/api/searchMovie', function(request, response) {
    // user id, rating, book_id
<<<<<<< HEAD
    connection.query('SELECT M.title, M.rating, WW.rating FROM cis550.movie as M LEFT JOIN (SELECT * FROM cis550.WATCHED as W WHERE W.user_id = 655) as WW on M.id = WW.movie_id   WHERE M.title LIKE "%Finding%" LIMIT 10', request.params.user, function(err, res) {
=======
    connection.query('SELECT M.title, M.rating FROM cis550.movie as M WHERE M.title LIKE "%Harry Potter%" LIMIT 10', request.params.user, function(err, res) {
>>>>>>> 4dce9ac832b244ea124c58243cb723e1f0e30d5f
      if (err)
        response.send({err: err});
      var result = [];
      res.forEach(function(item, index) {
        // console.log({Title: item.title, Rating: item.rating}) how to do this?
        result.push({Title: item.title, Rating: item.rating});
      });
      console.log(request.params.name);
      response.send(result);
    });
  });

  //Search for books based on Name, return book title and average rating
  app.get('/api/searchBook', function(request, response) {
    // user id, rating, book_id
    connection.query('SELECT B.title, B.rating, RR.rating FROM cis550.book as B LEFT JOIN (SELECT * FROM cis550.READ as R WHERE R.user_id = 655) as RR on B.id = RR.book_id  WHERE B.title LIKE "%The Lord%"  LIMIT 10', request.params.user, function(err, res) {
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

  // Original

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
