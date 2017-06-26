const express = require('express');
const app = express();
const Promise = require('bluebird');
const morgan = require('morgan');
const axios = require('axios');
const pgp = require('pg-promise')({
  promiseLib: Promise
});
const bodyParser = require('body-parser');
const Status = require('./scoreAndLives.js');
const Selector = require('./session_alt.js');
const session = require('express-session');
//dbConfig can be changed to whatever the database configuration file is named
var db = pgp({database: 'highscores', user:'postgres'});
// import handlebars
app.set('view engine', 'hbs');
//kube for CSS
app.use('/kube', express.static('node_modules/imperavi-kube/dist/css'));
app.use('/public', express.static('public'));
//initializes session
app.use(session({
  key: 'wtf.sess',
  secret: process.env.SESS_KEY,
  saveUninitialized: true,
  resave: true,
  cookie: {maxAge: 1000 * 60 * 60 * 24}
}));

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/static', express.static('public'));

//get genre selection from form and set to variable 'genre'
app.post('/getGenre', function(request, response) {
    var select = new Selector(request.session);
    var status = new Status(request.session);
    // gets proper genre from url
    if (request.body.genreChoice == 'All') {
      status.session.genre = '';
    } else {
      status.session.genre = '&with_genres=' + request.body.genreChoice;
    }
    console.log('genre: ' + status.session.genre);
    var base_url = 'https://api.themoviedb.org/3/discover/';
    var api_key = 'movie?api_key=' + process.env.API_KEY;
    var options = '&language=en&region=US&include_adult=false' + status.session.genre +'&page=1';
    let url = base_url + api_key + options;
    axios.get(url)
      .then(function (api) {
        console.log(api.data.total_pages);
        select.lastPage = api.data.total_pages - 1;
        if (select.lastPage > 1000) {
          select.lastPage = 1000;
        } else {
          select.lastPage = api.data.total_pages;
        }
        response.redirect('/game');
      })
});

// index.hbs should be renamed if different per paul or alston
//in response.render add context dictionary to pass img data to front end through hbs
app.get('/game', function(request, response, next) {
  var select = new Selector(request.session, true);
  var status = new Status(request.session);
  // call new randoms before new api request
  console.log('pageLmt: '+ select.lastPage);
  select.Movie();

  //select.page[0] = select.Movie();

  //set url parts as variables to be concatenated
  var base_url = 'https://api.themoviedb.org/3/discover/';
  var api_key = 'movie?api_key=' + process.env.API_KEY;
  var options = '&language=en&region=US&include_adult=false' + status.session.genre + '&page='
  let url = base_url + api_key + options + select.page;
  console.log(url);
axios.get(url)
    .then(function (api) {
      context = select.MovieData(api);
      console.log(context);
      response.render('index.hbs', context);
    })
    .catch(next);
});

app.post('/something', function(request, response, next) {
  var select = new Selector(request.session);
  var status = new Status(request.session);
//maybe need a cookie from which to log the username for stretch goal
  select.user = request.body.playerName;
//high_scores should be whatever the table name is per jj
  db.query('INSERT INTO highscores VALUES (default, $1, $2)',[select.user, status.score] )
    .then(function() {
//highscores.hbs should be whatever frontend hbs has the highscores per paul or alston
      response.redirect('/highscores');
    })
    .catch(next);
});

app.get('/highscores', function(request, response, next) {
  db.any("SELECT * FROM highscores ORDER BY score DESC LIMIT 10")
    .then(function(results) {
      response.render('highscores.hbs', {layout: 'layout2', results:results});
    })
    .catch(next);
});

app.post('/guess', function(request, response, next) {
  var select = new Selector(request.session)
  var status = new Status(request.session);
  console.log(request.body.answer);
  var answer = request.body.answer;
  var correctAnswer = select.title[select.index];
  console.log(correctAnswer);
  if (answer == correctAnswer && status.session.lives > 0) {
    status.Correct();
    response.redirect('/game');
  } else {
    status.Incorrect();
    if (status.session.lives <= 0) {
      response.redirect('/game_over');
    }
  }
});

app.get('/game_over', function(request, response) {
    var status = new Status(request.session);
    response.render('game_over.hbs', {score:status.session.score})
});

app.get('/genres', function(request, response) {
  getGenres()
    .then(function(api) {
      response.send(api.data.genres);
    });
});

app.get('/', function (request, response) {
  var status = new Status(request);
  status.Initialize();

  axios.all([getGenres()])
    .then(axios.spread(function(api) {
      status.session.genre = request.body.genreChoice;
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
