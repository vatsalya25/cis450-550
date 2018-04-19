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
