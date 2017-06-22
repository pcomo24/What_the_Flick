const session = require('express-session');

app.use(session({
  key: 'wtf.sess',
  secret: '53|<1237',
  saveUninitialized: true,
  resave: true,
  cookie: {maxAge: 1000 * 60 * 60 * 24}
}));
//app.use(app.router);

class Movies {
  constructor (request) {
    this.session = request.session;
  }
  this.session.nextMovie;
//array which stores composite numeric values for previous movie lookups
  this.session.movies = [];
//method which pushed composite numeric values to this.session.movies. Called at the end of this.newMovie.
  this.addMovie = function () {
    //this.session.movies.push(this.session.nextMovie)
    this.session.movies.push(this.session.nextMovie);
  console.log('Played Movies are ' + this.session.movies);
  };
//this function creates two random integers which correspond to values within ranges
//present in "themoviedb.org" database api. The values are checked to be unique,
//-and then returned as a (2) element array.
  this.newMovie = function () {
    this.session.nextMoviePage = Math.ceil(Math.random() * 1000);
    this.session.nextMovieSelection = Math.ceil(Math.random() * 20);
//numeric variable this.session.nextMovieSelection is divided by 100 and added to integer this.session.nextMoviePage so
//-that both variables can be stored as (1) floating point numeric value for crosss-checking efficiency.
    this.session.nextMovie =  this.session.nextMoviePage + (this.session.nextMovieSelection/100);
//for loop compares new movie against previous movies in session and calls another
//-if a matching movie is found in the (used) movies array.
    for(var i = 0; i < this.session.movies.length;i++) {
      if (this.session.nextMovie === this.session.movies[i]) {
        console.log('Duplicate found ' + this.session.nextMovie);
        this.newMovie();
        return;
//Game over logic can be added here if needed
      }else if (this.session.movies.length > 10){
        //G A M E   O V E R
        return;
      }
    }
//Once lookup values are verified to be unique, they are pushed to an array to checked
//-against in future calls.
    console.log('Added ' + this.session.nextMovie);
    this.addMovie();
//numeric variables this.session.nextMoviePage and this.session.nextMovieSelection must be converted to
//-strings before being returned for http interfacing portability.
    return [this.session.nextMoviePage, this.session.nextMovieSelection];
  //  clearSession () {
  //  this.session = {};
  }
}
