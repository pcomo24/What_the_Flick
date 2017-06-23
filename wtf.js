const express = require('express');
const app = express();
const Promise = require('bluebird');
const morgan = require('morgan');
const axios = require('axios');
const pgp = require('pg-promise')({
  promiseLib: Promise
});
const bodyParser = require('body-parser');
const sessions = require('./sessions.js');
const session = require('express-session');
//dbConfig can be changed to whatever the database configuration file is named
var db = pgp({database: 'highscores', user:'postgres'});

// import handlebars
app.set('view engine', 'hbs');
//kube for CSS
app.use('/kube', express.static('node_modules/imperavi-kube/dist/css'));
app.use('/public', express.static('public'));

app.use(session({
  key: 'wtf.sess',
  secret: process.env.SESS_KEY,
  saveUninitialized: true,
  resave: true,
  cookie: {maxAge: 1000 * 60 * 60 * 24}
}));

// global variables
var username, genre;
var score = 0;
var lives = 1;
var img_url = [];
var title = [];
var overviewHint = [];
var page, pageLimit;
var tagline = [];

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/static', express.static('public'));

//get genre selection from form and set to variable 'genre'
app.post('/getGenre', function(request, response) {
    genre = request.body.genreChoice;
    console.log('genre: ' + genre);
    var base_url = 'https://api.themoviedb.org/3/discover/';
    var api_key = 'movie?api_key=' + process.env.API_KEY;
    var options = '&language=en&region=US&include_adult=false&with_genres=' + genre +'&page=1';
    let url = base_url + api_key + options;
    // url = 'https://api.themoviedb.org/3/discover/movie?api_key=7e1972182eb6105c196b67794648a379&language=en&region=US&include_adult=false&with_genres=36&page=1'
    axios.get(url)
      .then(function (api) {
        pageLimit = api.data.total_pages;
        response.redirect('/game');
      })

});

// index.hbs should be renamed if different per paul or alston
//in response.render add context dictionary to pass img data to front end through hbs
app.get('/game', function(request, response) {
  // call new randoms before new api request
  console.log('pageLmt: '+pageLimit);
  sessions.Movies(request, pageLimit);
  page = request.newMovie();
  console.log(page);

  // gets proper genre from url
  if (genre == 'All') {
    genre = '';
  } else {
    genre = 'with_genres=' + genre + '&';
    console.log(genre);
  }

  //set url parts as variables to be concatenated
  var base_url = 'https://api.themoviedb.org/3/discover/';
  var api_key = 'movie?api_key=' + process.env.API_KEY;
  var options = '&language=en&region=US&include_adult=false&' + genre + 'page='
  let url = base_url + api_key + options + page[0];
  console.log(url);
axios.get(url)
    .then(function (api) {
        for(let j=0; j<20; j++) {
          if (api.data.results[j].backdrop_path) {
            img_url.push(api.data.results[j].backdrop_path);
            title.push(api.data.results[j].title);
            overviewHint.push(api.data.results[j].overview);
          }
          // replace page[1] choice if arrays less that 20
          if (title.length < 20)
            page[1] = (Math.floor(Math.random()*title.length));
        }
        console.log('new call sucessfull');

        // creates the multiple choices
        var choices = [];
        var tmpRnd;
        function generateChoices () {
          tmpRnd = Math.floor(Math.random() * title.length)
          if (choices.includes(title[tmpRnd]))
            generateChoices();
          else
            choices.push(title[tmpRnd]);
        }
        for(let j=0; j<5; j++) {
          generateChoices();
        }

        // replace random answer with correct answer if not present in choices
        if (!choices.includes(title[page[1]])) {
          let replace = Math.floor(Math.random() * 5);
          choices[replace] = title[page[1]];
        }

        var context = {
            imgUrl: 'https://image.tmdb.org/t/p/w500/' + img_url[page[1]],
            title: title[page[1]],
            overviewHint: overviewHint[page[1]],
            choice: choices,
            // genres: apiGenres.data.genres
        };
        response.render('index.hbs', context);
    })
    .catch(function (error) {
        console.error(error);
    });
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
  var answer = request.body.answer;
  var title2 = title[page[1]];
  if (answer == title2 && lives > 0) {
    console.log('they matched')
    // reset arrays and make new api call
    title=[];
    img_url=[];
    score += 1;
    response.redirect('/game/');

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

app.get('/genres', function(request, response) {
  getGenres()
    .then(function(api) {
      response.send(api.data.genres);
    });
});

app.get('/', function (request, response) {
  sessions.Movies(request);
  axios.all([getGenres()])
    .then(axios.spread(function(api) {
      genre = request.body.genreChoice;
      response.render('home.hbs', {layout: 'layout2', genres: api.data.genres});
    }))
});

//Port 3000 is optional
app.listen(3000, function() {
  console.log('Example app listening on port 3000!')
});

//////////////////////////////

/**
 * @returns Promise that might have genres
 *   success: Contains Axios result with genres
 *   error: Contains error object
 */
function getGenres() {
  let url = `https://api.themoviedb.org/3/genre/movie/list?api_key=${process.env.API_KEY}&language=en-US`
  console.log(url);

  return axios.get(url)
    .then(function(api) {
      console.log('Retrieved genres');
      return api;
    })
    .catch(function (error) {
      console.error(error);
      return Promise.reject(error);
    });
}
