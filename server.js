const express = require('express');
const promise = require('bluebird');
const morgan = require('morgan');
const pgp = require('pg-promise')({
  promiseLib: Promise
});
const bodyParser = require('body-parser');
//dbConfig can be changed to whatever the database configuration file is named
const dbConfig = require('./db-config');
const db = pgp(dbConfig);

const app = express();

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

app.post('/new_High_Score', function(request, response, next) {
//maybe need a cookie from which to log the username for stretch goal
//var username =
  username = request.query.username
  score = request.query.score;
//high_scores should be whatever the table name is per jj
  db.any(`insert into high_scores values ('${username}','${score}')`)
    .then(function() {
//highscores.hbs should be whatever frontend hbs has the highscores per paul or alston
      response.redirect('/highscores.hbs');
    })
    .catch(next);
  });
});

//Port 3000 is optional
app.listen(3000, function() {
  console.log('Example app listening on port 3000!')
})
