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
var db = pgp({database: 'highscores', user:'postgres'});

// import handlebars
app.set('view engine', 'hbs');
//kube for CSS
app.use('/kube', express.static('node_modules/imperavi-kube/dist/css'));
app.use('/public', express.static('public'));

// global variables
var username;
// used to keep track of question number
var q = 0;
var score = 0;
var lives = 1;
var img_url = [];
var title = [];
var overviewHint = [];

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/static', express.static('public'));

//Object contains the logic for randomly selecting unique films to lookup from the api.
function Movies() {
  this.nextMovie;
//array which stores composite numeric values for previous movie lookups
  this.movies = [];
//method which pushed composite numeric values to this.movies. Called at the end of this.newMovie.
  this.addMovie = function () {
    this.movies.push(this.nextMovie);
  console.log('Played Movies are ' + this.movies)
  };
//this function creates two random integers which correspond to values within ranges
//present in "themoviedb.org" database api. The values are checked to be unique,
//-and then returned as a (2) element array.
  this.newMovie = function () {
    var nextMoviePage = Math.ceil(Math.random() * 1000);
    var nextMovieSelection = Math.ceil(Math.random() * 20);
//numeric variable nextMovieselection is divided by 100 and added to integer nextMoviePage so
//-that both variables can be stored as (1) floating point numeric value for crosss-checking efficiency.
    this.nextMovie =  nextMoviePage + (nextMovieSelection/100);
//for loop compares new movie against previous movies in session and calls another
//-if a matching movie is found in the (used) movies array.
    for(var i = 0; i < this.movies.length;i++) {
      if (this.nextMovie === this.movies[i]) {
        console.log('Duplicate found ' + this.nextMovie)
        this.newMovie();
        return;
//Game over logic can be added here if needed
      }else if (this.movies.length > 10){
        //G A M E   O V E R
        return;
      }
    }
//Once lookup values are verified to be unique, they are pushed to an array to checked
//-against in future calls.
    console.log('Added ' + this.nextMovie);
    this.addMovie();
//numeric variables nextMoviePage and nextMovieSelection must be converted to
//-strings before being returned for http interfacing portability.
    return [String(nextMoviePage), String(nextMovieSelection)];
  }
}
var movies = new Movies();
//movies.newMovie() must be called and a value returned before a new movie can be loaded.
movies.newMovie();


// temp random generator
var page, i;
function random() {
  page = Math.ceil(Math.random() * 1000);
  i = Math.floor(Math.random() * 20);
}
// run random for initial numbers
random();

//set url parts as variables to be concatenated
var base_url = 'https://api.themoviedb.org/3/discover/';
var api_key = 'movie?api_key=' + process.env.API_KEY;
var options = '&language=en&region=US&page='
// var page = movies.newMovie();


function apiCall(response) {
  axios.get(base_url + api_key + options + page)
      .then(function (api) {
        for(let j=0; j<20; j++) {
          img_url.push(api.data.results[j].backdrop_path);
          title.push(api.data.results[j].title);
          overviewHint.push(api.data.results[j].overview);
        }
        console.log('new call sucessfull');
        console.log(title)
        
        // creates the multiple choices
        var choices = [];
        var tmpRnd;
        function generateChoices () {
          tmpRnd = Math.floor(Math.random() * 20);
          if (choices.includes(title[tmpRnd]))
            generateChoices();
          else
            choices.push(title[tmpRnd]);
        }
        for(let j=0; j<5; j++) {
          generateChoices();
        }

        // replace random answer with correct answer if not present in choices
        if (!choices.includes(title[i])) {
          let replace = Math.floor(Math.random() * 5);
          choices[replace] = title[i];
        }

        var context = {
            imgUrl: 'https://image.tmdb.org/t/p/w500/' + img_url[i],
            title: title[i],
            overviewHint: overviewHint[i],
            choice: choices
        };
        response.render('index.hbs', context);
      })
      .catch(function (error) {
          console.error(error);
      });
}

// index.hbs should be renamed if different per paul or alston
//in response.render add context dictionary to pass img data to front end through hbs
app.get('/', function(request, response) {
  apiCall(response);
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
  console.log(request.body.answer);
  var answer = request.body.answer.toLowerCase().replace(/\W/g, "");
  var title2 = title[i].toLowerCase().replace(/\W/g, "");
  console.log(answer);
  console.log(title2);
  if (answer == title2 && lives > 0) {
    console.log('they matched')
    q += 1;
    score += 1;
    // reset arrays and make new api call
    title=[];
    img_url=[];
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
