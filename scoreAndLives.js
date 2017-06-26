class Status {
  constructor(session){
    this.session = session;
  }

  Initialize(request) {
  this.session.score = 0;
  this.session.lives = 1;
  //this.session.genre;
  }
  Correct(request) {
    this.session.score += 1;
  }

  Incorrect(request) {
    this.session.lives -= 1;
  }
}

module.exports = Status;
