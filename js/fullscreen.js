/**
 * Optionaler Vollbild-Modus per Icon-Button (Fullscreen API).
 */
(function () {
  function getContainer() {
    return document.getElementById('game-container');
  }

  function getBtn() {
    return document.getElementById('fullscreen-btn');
  }

  function isFullscreen() {
    var c = getContainer();
    return !!(document.fullscreenElement || document.webkitFullscreenElement ||
      document.mozFullScreenElement || c && c.webkitRequestFullscreen === undefined && document.fullscreenElement === c);
  }

  function getFullscreenElement() {
    return document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement;
  }

  function isContainerFullscreen() {
    var el = getFullscreenElement();
    return el && el.id === 'game-container';
  }

  function updateIcon() {
    var btn = getBtn();
    if (!btn) return;
    var enter = btn.querySelector('.fullscreen-icon--enter');
    var exit = btn.querySelector('.fullscreen-icon--exit');
    if (!enter || !exit) return;
    if (isContainerFullscreen()) {
      enter.style.display = 'none';
      exit.style.display = 'block';
      btn.setAttribute('title', 'Vollbild beenden');
      btn.setAttribute('aria-label', 'Vollbild beenden');
    } else {
      enter.style.display = 'block';
      exit.style.display = 'none';
      btn.setAttribute('title', 'Vollbild');
      btn.setAttribute('aria-label', 'Vollbild umschalten');
    }
  }

  function requestFullscreen() {
    var c = getContainer();
    if (!c) return;
    if (c.requestFullscreen) {
      c.requestFullscreen();
    } else if (c.webkitRequestFullscreen) {
      c.webkitRequestFullscreen();
    } else if (c.mozRequestFullScreen) {
      c.mozRequestFullScreen();
    }
  }

  function exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    }
  }

  function toggle() {
    if (isContainerFullscreen()) {
      exitFullscreen();
    } else {
      requestFullscreen();
    }
  }

  function init() {
    var btn = getBtn();
    if (!btn) return;

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      toggle();
    });

    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    document.addEventListener('mozfullscreenchange', onFullscreenChange);
  }

  function onFullscreenChange() {
    updateIcon();
    if (window.AsteroidsGame && typeof window.AsteroidsGame.resize === 'function') {
      window.AsteroidsGame.resize();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
