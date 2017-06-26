function getHint(overviewHint) {
  var hint = document.getElementById('hint');
  if (hint.innerHTML == '') {
    hint.innerHTML = overviewHint;
  } else {
    hint.innerHTML = '';
  }
}

var gameButton = document.getElementById('newGame-button');
gameButton.href = '/?ts=' + Date.now();
