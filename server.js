const express = require('express');
const app = express();
const promise = require('bluebird');
const morgan = require('morgan');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const pgp = require('pg-promise')({
  promiseLib: Promise
});
const bodyParser = require('body-parser');
//dbConfig can be changed to whatever the database configuration file is named
var db = pgp({database: 'highscores'});

//check if this dependency is necessary in production, if so save in packages.json
var xhr = new XMLHttpRequest();

// import handlebars
app.set('view engine', 'hbs');

// global variables
var username, score;

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/static', express.static('public'));


//set url parts as variables to be concatenated
var base_url = 'https://api.themoviedb.org/3/movie/';
var api_key = 'api_key=7e1972182eb6105c196b67794648a379';
var film_id = (Math.floor(Math.random() * 1000) + 1);

app.get('/', function(req, res) {
  //xhr request to get data from api
  var data = null;

  var xhr = new XMLHttpRequest();
  xhr.withCredentials = true;

  xhr.addEventListener("readystatechange", function () {
      if (this.readyState === 4) {
          console.log(this.responseText);

          data = JSON.parse(this.responseText);
          var context = {
              imgUrl: 'https://image.tmdb.org/t/p/w500'+ data.backdrop_path,
              movieTitle: data.title
          };
          res.render('index.hbs', context);
      }
  });

  xhr.open("GET", base_url + film_id + '?' + api_key);
  xhr.setRequestHeader("cache-control", "no-cache");
  xhr.setRequestHeader("postman-token", "5c3fc906-100f-1a57-68a9-fabebf603107");
  //api data returned as varible 'data'
  xhr.send();
})

// index.hbs should be renamed if different per paul or alston
//in response.render add context dictionary to pass img data to front end through hbs
// app.get('/', function(request, response) {
//   var context = {
//       imgUrl: data.poster_path,
//       title: data.title
//   }
//   res.render('index.hbs', context);
// });

//Login
//redirect is equal to the path of the page that redirected to the login screen
app.post('/login', function(request, response, next) {
  var redirect = request.query.redirect;
  username = request.query.username;
  response.redirect('index.hbs')
});

app.post('/new_High_Score', function(request, response, next) {
//maybe need a cookie from which to log the username for stretch goal
//var username =
  username = request.query.username
  score = request.query.score;
//high_scores should be whatever the table name is per jj
  db.query(`INSERT INTO highscores VALUES (default, ${username}, ${score})`)
    .then(function() {
//highscores.hbs should be whatever frontend hbs has the highscores per paul or alston
      response.redirect('/highscores');
    })
    .catch(next);
});

app.get('/highscores', function(request, response, next) {
  db.any("SELECT * FROM highscores ORDER BY score DESC LIMIT 10")
    .then(function(results) {
      response.render('highscores.hbs', {results:results});
    })
    .catch(next);
});

//Port 3000 is optional
app.listen(3000, function() {
  console.log('Example app listening on port 3000!')
})
