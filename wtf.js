const express = require('express');
const app = express();
const Promise = require('bluebird');
const morgan = require('morgan');
const axios = require('axios');
const pgp = require('pg-promise')({
  promiseLib: Promise
});
const bodyParser = require('body-parser');
//dbConfig can be changed to whatever the database configuration file is named
var db = pgp({database: 'highscores'});

// import handlebars
app.set('view engine', 'hbs');

// global variables
var username;
// used to keep track of question number
var q = 0;
var score = 0;
var lives = 1;
var img_url = [];
var title = [];



app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/static', express.static('public'));

function Movies() {
  this.nextMovie;
  this.movies = [];
  this.addMovie = function () {
    this.movies.push(this.nextMovie);
  console.log('Played Movies are ' + this.movies)
  };

  this.newMovie = function () {
    this.nextMovie = Math.ceil(Math.random() * 1000);
    for(var i = 0; i < this.movies.length;i++) {
      if (this.nextMovie === this.movies[i]) {
        console.log('Duplicate found ' + this.nextMovie)
        this.newMovie();
        return;
      }else if (this.movies.length > 10){
        //G A M E   O V E R
        return;
      }
    }
    this.nextMovie = this.nextMovie.toString();
    console.log('Added ' + this.nextMovie);
    this.addMovie();
    return this.nextMovie;
  }
}

var movies = new Movies();
movies.newMovie();

// temp random generator
var page, i;
function random() {
  page = Math.ceil(Math.random() * 1000);
  i = Math.floor(Math.random() * 20);
}

//set url parts as variables to be concatenated
var base_url = 'https://api.themoviedb.org/3/discover/';
var api_key = 'movie?api_key=' + process.env.API_KEY;
var options = '&language=en&region=US&page='
// var page = movies.newMovie();

//axios request
axios.get(base_url + api_key + options + page)
    .then(function (response) {
      for(let j=0; j<20; j++) {
        random();
        img_url.push(response.data.results[j].backdrop_path);
        title.push(response.data.results[j].title);
      }
    })
    .catch(function (error) {
        console.error(error);
    });

// index.hbs should be renamed if different per paul or alston
//in response.render add context dictionary to pass img data to front end through hbs
app.get('/', function(request, response) {
      var context = {
          imgUrl: 'https://image.tmdb.org/t/p/w500/' + img_url[i],
          title: title[i]
      };
    response.render('index.hbs', context);
});

//Login
//redirect is equal to the path of the page that redirected to the login screen
app.post('/login', function(request, response, next) {
  var redirect = request.query.redirect;
  username = request.query.username;
  response.redirect('index.hbs')
});

app.post('/something', function(request, response, next) {
//maybe need a cookie from which to log the username for stretch goal
//var username =
  username = request.body.playerName;
//high_scores should be whatever the table name is per jj
  db.query('INSERT INTO highscores VALUES (default, $1, $2)',[username, score] )
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


app.post('/guess', function(request, response, next) {
  var answer = request.body.answer.toLowerCase().replace(/\W/g, "");
  var title2 = title[i].toLowerCase().replace(/\W/g, "");
  console.log(answer);
  console.log(title2);
  if (answer == title2) {
    console.log('they matched')
    q += 1;
    score += 1;
    // gets new random number
    // movies.newMovie();
    random();
    response.redirect('/?q=' + q);

  } else {
    console.log('no match')
    lives -= 1;
    if (lives <= 0) {
      response.redirect('/game_over');
    }
  }

});

app.get('/game_over', function(request, response) {
    response.render('game_over.hbs', {score:score})
});

//Port 3000 is optional
app.listen(3000, function() {
  console.log('Example app listening on port 3000!')
});
