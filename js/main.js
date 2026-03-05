/**
 * Main entry point – initializes game and starts loop after DOM ready.
 */
(function () {
  function init() {
    const canvas = document.getElementById('game-canvas');
    if (!canvas || !canvas.getContext) return;
    canvas.focus();
    window.AsteroidsGame = new Game(canvas);
    window.AsteroidsGame.start();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
