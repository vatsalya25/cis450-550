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
  app.get('/api/topRated', function(request, response) {
    connection.query('SELECT TOP(10) b.title, m.title FROM cis550.BOOKS b, cis550.MOVIES m ORDER BY rating DESC;', function(err, res) {
      if (err)
        response.send({err: err});
      var result = [];
      res.forEach(function(item, index) {
        result.push({book_name: item.b.title, movie_name: item.m.title});
      });

      response.send(result);
    });
  });

  // get user's favorites(their top 10% of all read or watched) Needs user_id
  app.get('/api/userFavs/:user', function(request, response) {
    connection.query('SELECT TOP 10 PERCENT br.title, mw.title FROM (SELECT r.user_id, b.title FROM cis550.BOOKS b JOIN cis550.READ r ON b.id = r.book_id WHERE user=? ORDER BY r.rating DESC) br, (SELECT w.user_id, m.title FROM cis550.MOVIES m JOIN cis550.WATCHED w ON m.id = w.movie_id WHERE user=? ORDER BY w.rating DESC) mw ', request.params.user, function(err, res) {
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

  // This users ratings compared to our average user's ratings Needs user_id
  // OPTIONAL AND NOT COMPLETED YET
  app.get('/api/userDiff/:user', function(request, response) {
    connection.query('Select From READ r, Watched w', request.params.user, function(err, res) {
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

  // added by Claire

  // added by Sandy

  //LOGIN API: checks if user email already exists in database, if not, will create new user
  //Otherwise signs the user in 
 app.get('/api/createUser', function(request, response) {
  connection.query('INSERT INTO cis550.USERS VALUES ("Claire", "Frankel", UUID(), "claire@gmail.com", "bonjour", 0)', function(err, res) {
    if(err)
      response.send({status: "duplicate"}) 
    else 
      response.send({status: "ok"}); 
  
  });
});

  //checks if user and password exists to login
  app.get('/api/login', function(request, response) {
    inDB = []
    connection.query('select exists(select * from cis550.USERS where cis550.USERS.email = "syin@.com" AND cis550.USERS.password = "hello") as E', function(err,res) {
      var result = [];
      saveResults(res)
      if (err)
        response.send({err: err});

      if(inDB == 1) {
        response.send({status: "in DB"})
      }

      else {
        response.send({status: "not in DB"})
      }
      console.log(result)
    });
  });

  function saveResults(value){
    inDB = value[0].E
  }

  //DISPLAY WATCHLIST MOVIES
  app.get('/api/watchlist', function(request, response) {
    connection.query('SELECT M.title as title, W.rating as user_rating, M.rating as avg_rating FROM cis550.WATCHED as W JOIN cis550.MOVIES as M ON W.movie_id = M.id WHERE user_id = "655"', request.params.user, function(err, res) {
      if (err)
        response.send({err: err});
      var result = [];
      res.forEach(function(item, index) {
        result.push({Title: item.title, User_Rating: item.user_rating, Avg_Rating: item.avg_rating});
      });
      console.log(request.params.name);
      response.send(result);
    });
  });

  //DISPLAY READLIST BOOKS
  app.get('/api/readlist', function(request, response) {
    connection.query('SELECT B.title, B.rating as avg_rating, R.rating as user_rating FROM cis550.READ as R JOIN cis550.book as B ON R.book_id = B.id WHERE user_id = "655"', request.params.user, function(err, res) {
      if (err)
        response.send({err: err});
      var result = [];
      res.forEach(function(item, index) {
        result.push({Title: item.title, User_Rating: item.user_rating, Avg_Rating: item.avg_rating});
      });
      console.log(request.params.name);
      response.send(result);
    });
  });

   //Add book to Readlist or update rating on book: user id, rating, book_id
  app.get('/api/addToReadlist', function(request, response) {
    //try to add down under 
    connection.query('INSERT INTO cis550.READ VALUES (655, 1, 24) ON DUPLICATE KEY UPDATE rating = VALUES(rating);', function(err, res) {
      console.log("err: ", err);
      console.log("res: ", res);
      if (err)
        response.send({err: err});
      response.send(res);
    });
  });

  //Add movie to watchlist or update rating on movie
  app.get('/api/addToWatchlist', function(request, response) {
    // user id, rating, book_id
    //10: Simpson's Movie :) 
   connection.query('INSERT INTO cis550.WATCHED VALUES (655, 10, 35) ON DUPLICATE KEY UPDATE rating = VALUES(rating)', request.params.user, function(err, res) {
      if (err)
        response.send({err: err});
      var result = [];
      response.send(result);
    });
  });

  //Search for movies based on Name, return movie title and average rating
  app.get('/api/searchMovie', function(request, response) {
    // user id, rating, book_id
    connection.query('SELECT M.title, M.rating FROM cis550.MOVIES as M WHERE M.title LIKE "%Harry Potter%" LIMIT 10', request.params.user, function(err, res) {
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
    connection.query('SELECT B.title, B.rating FROM cis550.book as B WHERE B.title LIKE "%The Lord%" LIMIT 10', request.params.user, function(err, res) {
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
