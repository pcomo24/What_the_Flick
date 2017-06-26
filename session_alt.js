class Select {
  constructor(cartouche){
    this.name = cartouche;
    this.savedMovies = request.session.savedMovies
  }
  request.session.savedMovies = []
  saveMovie() {
    this.savedMovies.push(request.session.nextMovie);
  };

  selectMovie() {
    console.log('movie selected')
    request.session.nextMoviePage = Math.ceil(Math.random() * 3);
    request.session.nextMovieSelection = Math.floor(Math.random() * 20);
    request.session.nextMovie =  request.session.nextMoviePage;
  for(var i = 0; i < request.session.savedMovies.length;i++) {
    if (request.session.nextMovie === request.session.savedMovies[i]) {
      console.log('Duplicate found ' + request.session.nextMovie);
      request.newMovie();
      break;
    }
  }
//Game over logic can be added here if needed
//Once lookup values are verified to be unique, they are pushed to an array to checked
//-against in future calls.
    console.log('Added ' + request.session.nextMovie);
    request.addMovie();
//numeric variables request.session.nextMoviePage and request.session.nextMovieSelection must be converted to
//-strings before being returned for http interfacing portability.
    return [request.session.nextMoviePage, request.session.nextMovieSelection];
  }
}

function Movies(request, response) {
  request.session.img_url = []
  request.session.title = []
  request.session.hint = []
  request.session.choices = [];
  request.session.username;
  request.session.pageLimit;
  request.session.page;

////need to set parameter j as passed in within the function call in wtf.js
  request.set_Movie_data = function (api) {
    console.log('function started');
    for(var j=0; j<20; j++) {
      if (api.data.results[j].backdrop_path) {
        request.session.img_url.push(api.data.results[j].backdrop_path);
        request.session.title.push(api.data.results[j].title);
        request.session.hint.push(api.data.results[j].overview);
      }
    }
      console.log('pushed to arrays');
      console.log('array length = ' + request.session.title.length);
      // checks to make sure img_url isn't empty if so gets new api call
      if(request.session.img_url.length < 5) {
          console.log('check 1 failed');
          response.redirect('/game');
      }
      // replace page[1] choice if arrays less that 20
      if (request.session.title.length < 20) {
      ////need to refactor page from wtf.js
        console.log('check 2 failed');
        request.session.page[1] = (Math.floor(Math.random()*request.session.title.length));
      }
    console.log('new call sucessfull');

    // creates the multiple choices
    var tmpRnd;
    function generateChoices () {
      tmpRnd = Math.floor(Math.random() * request.session.title.length)
      if (request.session.choices.includes(request.session.title[tmpRnd]))
        generateChoices();
      else
        request.session.choices.push(request.session.title[tmpRnd]);
    }
    for(let j=0; j<4; j++) {
      generateChoices();
    }

    // replace random answer with correct answer if not present in choices
    if (!request.session.choices.includes(request.session.title[request.session.page[1]])) {
      let replace = Math.floor(Math.random() * 4);
      request.session.choices[replace] = request.session.title[request.session.page[1]];
    }

    var context = {
        imgUrl: 'https://image.tmdb.org/t/p/w500/' + request.session.img_url[request.session.page[1]],
        title: request.session.title[request.session.page[1]],
        overviewHint: request.session.hint[request.session.page[1]],
        choice: request.session.choices,
    };
    return context;
  }
  request.newMovie = function () {
    request.session.nextMoviePage = Math.ceil(Math.random() * request.session.pageLimit);
    request.session.nextMovieSelection = Math.floor(Math.random() * 20);

    return [request.session.nextMoviePage, request.session.nextMovieSelection];
  }

}

exports.Movies = Movies;
