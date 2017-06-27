function initialSNL(request) {
request.session.score = 0;
request.session.lives = 1;
request.session.genre;
}
function updateSNL(request) {
request.correct = function () {
  request.session.score += 1;
}

request.incorrect = function () {
  request.session.lives -= 1;
}
}
exports.initialSNL = initialSNL;
exports.updateSNL = updateSNL;
