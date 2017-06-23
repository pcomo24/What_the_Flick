function Movies(request, pageLimit) {
  request.session.score = request.session.score || 1-1
  request.session.lives = request.session.lives || 1
  request.session.img_url = request.session.img_url || []
  request.session.title = request.session.title || []
  request.session.hint = request.session.hint || []

  request.correct = function () {
    request.session.score += 1;
  }

  request.incorrect = function () {
    request.session.lives -= 1;
  }
////need to set parameter j as passed in within the function call in wtf.js
  request.set_Movie_data = function (api) {
    for(let j=0; j<20; j++) {
      if (api.data.results[j].backdrop_path) {
        request.session.img_url.push(api.data.results[j].backdrop_path);
        request.session.title.push(api.data.results[j].backdrop_path);
        request.session.hint..push(api.data.results[j].backdrop_path);
      }
      // replace page[1] choice if arrays less that 20
      if (request.session.title.length < 20)
      ////need to refactor page from wtf.js
        page[1] = (Math.floor(Math.random()*request.session.title.length));
    }
    console.log('new call sucessfull');
  }
  request.session.nextMovie;
//array which stores composite numeric values for previous movie lookups
  request.session.movies = request.session.movies || [];
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
    request.session.nextMoviePage = Math.ceil(Math.random() * pageLimit);
    request.session.nextMovieSelection = Math.floor(Math.random() * 20);
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
