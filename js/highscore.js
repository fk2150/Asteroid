/**
 * Highscore: localStorage read/write, display in HUD and game over.
 */
window.AsteroidsHighscore = (function () {
  var KEY = 'asteroidsHighscore';

  function get() {
    return parseInt(localStorage.getItem(KEY), 10) || 0;
  }

  function update(score) {
    var current = get();
    if (score > current) {
      localStorage.setItem(KEY, String(score));
      return true;
    }
    return false;
  }

  function display(score) {
    var el = document.getElementById('highscore');
    if (el) el.textContent = 'Highscore: ' + get();
  }

  return {
    get: get,
    update: update,
    display: display
  };
})();
