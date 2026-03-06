/**
 * Touch-Steuerung für Handy/Tablet: On-Screen-Zonen, nur bei Touch oder schmalem Viewport.
 */
(function () {
  var CONTAINER_ID = 'touch-controls';
  var VIEWPORT_THRESHOLD = 768;
  var activeTouchZones = {};

  function isTouchOrNarrow() {
    if (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0) return true;
    if ('ontouchstart' in window) return true;
    if (typeof window.matchMedia === 'function' && window.matchMedia('(max-width: ' + VIEWPORT_THRESHOLD + 'px)').matches) return true;
    if (typeof window.matchMedia === 'function' && window.matchMedia('(hover: none)').matches) return true;
    return false;
  }

  function getZoneFromElement(el) {
    if (!el || !el.getAttribute) return null;
    var zone = el.getAttribute('data-touch-zone');
    if (zone === 'left' || zone === 'right' || zone === 'thrust' || zone === 'fire') return zone;
    return getZoneFromElement(el.parentElement);
  }

  function updateInputFromActive() {
    if (!window.Input || !window.Input.setTouchState) return;
    var left = false, right = false, thrust = false, fire = false;
    var id;
    for (id in activeTouchZones) {
      if (activeTouchZones[id] === 'left') left = true;
      if (activeTouchZones[id] === 'right') right = true;
      if (activeTouchZones[id] === 'thrust') thrust = true;
      if (activeTouchZones[id] === 'fire') fire = true;
    }
    window.Input.setTouchState({ left: left, right: right, thrust: thrust, fire: fire });
  }

  function onTouchStart(e) {
    var i, touch, zone, el;
    for (i = 0; i < e.changedTouches.length; i++) {
      touch = e.changedTouches[i];
      el = document.elementFromPoint(touch.clientX, touch.clientY);
      zone = getZoneFromElement(el);
      if (zone) {
        activeTouchZones[touch.identifier] = zone;
        e.preventDefault();
      }
    }
    updateInputFromActive();
  }

  function onTouchEnd(e) {
    var i, touch;
    for (i = 0; i < e.changedTouches.length; i++) {
      touch = e.changedTouches[i];
      delete activeTouchZones[touch.identifier];
    }
    updateInputFromActive();
  }

  function onTouchMove(e) {
    var i, touch, zone, el;
    for (i = 0; i < e.changedTouches.length; i++) {
      touch = e.changedTouches[i];
      if (activeTouchZones[touch.identifier] == null) continue;
      el = document.elementFromPoint(touch.clientX, touch.clientY);
      zone = getZoneFromElement(el);
      if (zone !== activeTouchZones[touch.identifier]) {
        delete activeTouchZones[touch.identifier];
      }
    }
    updateInputFromActive();
  }

  function createOverlay() {
    var container = document.getElementById(CONTAINER_ID);
    if (container) return container;

    container = document.createElement('div');
    container.id = CONTAINER_ID;
    container.className = 'touch-controls';
    container.setAttribute('aria-hidden', 'true');

    var leftPanel = document.createElement('div');
    leftPanel.className = 'touch-controls__left';
    leftPanel.innerHTML = '<button type="button" class="touch-btn touch-btn--left" data-touch-zone="left" aria-label="Links">‹</button>' +
      '<button type="button" class="touch-btn touch-btn--thrust" data-touch-zone="thrust" aria-label="Schub">▲</button>' +
      '<button type="button" class="touch-btn touch-btn--right" data-touch-zone="right" aria-label="Rechts">›</button>';

    var fireBtn = document.createElement('button');
    fireBtn.type = 'button';
    fireBtn.className = 'touch-btn touch-btn--fire';
    fireBtn.setAttribute('data-touch-zone', 'fire');
    fireBtn.setAttribute('aria-label', 'Feuer');
    fireBtn.textContent = 'FEUER';

    container.appendChild(leftPanel);
    container.appendChild(fireBtn);

    var gameContainer = document.getElementById('game-container');
    if (gameContainer) gameContainer.appendChild(container);

    return container;
  }

  function setVisible(show) {
    var container = document.getElementById(CONTAINER_ID);
    if (!container) return;
    if (show) {
      container.classList.add('touch-controls--visible');
      document.documentElement.classList.add('touch-controls-available');
    } else {
      container.classList.remove('touch-controls--visible');
      document.documentElement.classList.remove('touch-controls-available');
      activeTouchZones = {};
      if (window.Input && window.Input.setTouchState) {
        window.Input.setTouchState({ left: false, right: false, thrust: false, fire: false });
      }
    }
  }

  function init() {
    if (!isTouchOrNarrow()) return;

    var container = createOverlay();
    if (!container.parentNode) return;

    container.addEventListener('touchstart', onTouchStart, { passive: false });
    container.addEventListener('touchend', onTouchEnd, { passive: true });
    container.addEventListener('touchcancel', onTouchEnd, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: true });

    setVisible(true);

    window.addEventListener('resize', function () {
      if (isTouchOrNarrow()) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(init, 100);
    });
  } else {
    setTimeout(init, 100);
  }
})();
