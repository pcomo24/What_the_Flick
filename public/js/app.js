// track how many hints the user has seen
var hintCount = 0 ;

function getHint(overviewHint) {
  // controls clicking of the hint button
  var hint = document.getElementById('hint');
  // checks if hint count is less than 3 and displays hint
  if (hintCount < 3) {
    if (hint.innerHTML == '') {
      hint.innerHTML = overviewHint;
      hintCount++;
    // user can close hint with a second click
    } else {
      hint.innerHTML = '';
    }
  // checks if hint count is over 3 and displays message
  } else {
    if (hint.innerHTML == '') {
      hint.innerHTML = 'You already used up your 3 hints.';
    // user can close hint with a second click
    } else {
      hint.innerHTML = '';
    }
  }
}

var gameButton = document.getElementById('newGame-button');
gameButton.href = '/?ts=' + Date.now();
