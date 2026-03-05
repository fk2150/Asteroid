/**
 * Highscore: localStorage read/write, display in HUD and game over.
 * Werte werden bereinigt (nur nichtnegative Ganzzahlen), um Missbrauch zu vermeiden.
 */
window.AsteroidsHighscore = (function () {
  var KEY = 'asteroidsHighscore';
  var MAX_SCORE = 999999999;

  function sanitizeScore(n) {
    var num = parseInt(n, 10);
    if (num !== num || num < 0) return 0;
    return num > MAX_SCORE ? MAX_SCORE : num;
  }

  function get() {
    return sanitizeScore(localStorage.getItem(KEY));
  }

  function update(score) {
    var safe = sanitizeScore(score);
    var current = get();
    if (safe > current) {
      localStorage.setItem(KEY, String(safe));
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
