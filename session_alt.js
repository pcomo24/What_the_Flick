class Selector {
  constructor(session){
    session.prevMovies = session.prevMovies || [];

    this.prevMovies = session.prevMovies;
    this.movie = [];
    this.page = 0;
    this.index = 0;
    this.lastPage = 1;
    this.title = [];
    this.image = [];
    this.hint = [];
    this.choices = [];
  }

  SaveMovie() {
    this.prevMovies.push(this.movie);
  }
  Movie() {
    console.log('movie selected')
    this.page = Math.ceil(Math.random() * this.lastPage);
    this.index = Math.floor(Math.random() * 20);
    this.movie = this.page + this.index;
  for(var i = 0; i < this.prevMovies.length;i++) {
    if (this.movie === this.prevMovies[i]) {
      console.log('Duplicate found ' + this.movie);
      this.movie();
      break;
    }
  }
    console.log('Added ' + this.movie);
    this.SaveMovie();
    return [this.page, this.index];
  }
  MovieData(api) {
    console.log('function started');
    for(var j=0; j<20; j++) {
      if (api.data.results[j].backdrop_path) {
        this.image.push(api.data.results[j].backdrop_path);
        this.title.push(api.data.results[j].title);
        this.hint.push(api.data.results[j].overview);
      }
    }
      console.log('pushed to arrays');
      console.log('array length = ' + this.title.length);
      // checks to make sure img_url isn't empty if so gets new api call
      if(this.image.length < 5) {
          console.log('check 1 failed');
          response.redirect('/game');
      }
      // replace page[1] choice if arrays less that 20
      if (this.title.length < 20) {
      ////need to refactor page from wtf.js
        console.log('check 2 failed');
        this.index = (Math.floor(Math.random()*this.title.length));
      }
    console.log('new call sucessfull');

    this.choices = this.GenerateChoices();
    //packages movie data into context for the front-end.
    var context = {
        imgUrl: 'https://image.tmdb.org/t/p/w500/' + this.image[this.index],
        title: this.title[this.index],
        overviewHint: this.hint[this.index],
        choice: this.choices,
    };
    return context;
  }
  // creates the multiple choices
  GenerateChoices () {
    var choices = [];

    for (let j=0; j<4; j++) {
      let tmpRnd = Math.floor(Math.random() * this.title.length)
      choices.push(this.title[tmpRnd]);
    }

    // replace random answer with correct answer if not present in choices
    if (!choices.includes(this.title[this.index])) {
      let replace = Math.floor(Math.random() * choices.length);
      choices[replace] = this.title[this.index];
    }

    return choices;
  }
}

module.exports = Selector;
