function Movies(request) {
  request.session.nextMovie;
//array which stores composite numeric values for previous movie lookups
  request.session.movies = [];
//method which pushed composite numeric values to request.session.movies. Called at the end of request.newMovie.
  request.addMovie = function () {
    //request.session.movies.push(request.session.nextMovie)
    request.session.movies.push(request.session.nextMovie);
  console.log('Played Movies are ' + request.session.movies);
  };
//this function creates two random integers which correspond to values within ranges
//present in "themoviedb.org" database api. The values are checked to be unique,
//-and then returned as a (2) element array.
  request.newMovie = function () {
    request.session.nextMoviePage = Math.ceil(Math.random() * 1000);
    request.session.nextMovieSelection = Math.ceil(Math.random() * 20);
//numeric variable request.session.nextMovieSelection is divided by 100 and added to integer request.session.nextMoviePage so
//-that both variables can be stored as (1) floating point numeric value for crosss-checking efficiency.
    request.session.nextMovie =  request.session.nextMoviePage + (request.session.nextMovieSelection/100);
//for loop compares new movie against previous movies in session and calls another
//-if a matching movie is found in the (used) movies array.
    for(var i = 0; i < request.session.movies.length;i++) {
      if (request.session.nextMovie === request.session.movies[i]) {
        console.log('Duplicate found ' + request.session.nextMovie);
        request.newMovie();
        return;
//Game over logic can be added here if needed
      }else if (request.session.movies.length > 10){
        //G A M E   O V E R
        return;
      }
    }
//Once lookup values are verified to be unique, they are pushed to an array to checked
//-against in future calls.
    console.log('Added ' + request.session.nextMovie);
    request.addMovie();
//numeric variables request.session.nextMoviePage and request.session.nextMovieSelection must be converted to
//-strings before being returned for http interfacing portability.
    return [request.session.nextMoviePage, request.session.nextMovieSelection];
  //  clearSession () {
  //  request.session = {};
  }
}

exports.Movies = Movies;
