const express = require('express');
const app = express();
const promise = require('bluebird');
const morgan = require('morgan');
const pgp = require('pg-promise')({
  promiseLib: Promise
});
const bodyParser = require('body-parser');
//dbConfig can be changed to whatever the database configuration file is named
var db = pgp({database: 'highscores'});

// import handlebars
app.set('view engine', 'hbs');

// global variables
var username, score;

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/static', express.static('public'));

// index.hbs should be renamed if different per paul or alston
app.get('/', function(request, response) {
  response.render('index.hbs');
});

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
  db.any("SELECT * FROM highscores")
    .then(function(results) {
      response.render('highscores.hbs', {results:results});
    })
    .catch(next);
});

//Port 3000 is optional
app.listen(3000, function() {
  console.log('Example app listening on port 3000!')
})
