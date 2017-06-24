function Movies(request, pageLimit, response) {
  request.session.score = request.session.score || 0
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
        request.session.hint.push(api.data.results[j].backdrop_path);
      }
      // checks to make sure img_url isn't empty if so gets new api call
      if(img_url.length < 5) {
          response.redirect('/game');
      }
      // replace page[1] choice if arrays less that 20
      if (request.session.title.length < 20)
      ////need to refactor page from wtf.js
        page[1] = (Math.floor(Math.random()*request.session.title.length));
    }
    console.log('new call sucessfull');
  }
  request.newMovie = function () {
    request.session.nextMoviePage = Math.ceil(Math.random() * pageLimit);
    request.session.nextMovieSelection = Math.floor(Math.random() * 20);

    return [request.session.nextMoviePage, request.session.nextMovieSelection];
  }

}

exports.Movies = Movies;
