class Status {
  constructor(session){
    this.session = session;
    this.session.score = this.session.score || 0;
    this.session.lives = this.session.lives || 1;
  }

  Initialize() {
  this.session.score = 0;
  this.session.lives = 1;
  //this.session.genre;
  }
  Correct() {
    this.session.score += 1;
  }

  Incorrect() {
    this.session.lives -= 1;
  }
}

module.exports = Status;
