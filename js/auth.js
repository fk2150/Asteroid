/**
 * Passwortschutz: Nur Hash wird gespeichert, Vergleich per Web Crypto API.
 * Nach 5 Fehlversuchen: Sperre 15 Minuten (sessionStorage).
 */
(function () {
  var HASH_HEX = '388533b00143dad5550d7f458a1d6ab4e80c1ccf0ea112af2daec7e8e8d08509';
  var STORAGE_KEY = 'asteroids_auth';
  var LOCK_KEY = 'asteroids_lock';
  var MAX_ATTEMPTS = 5;
  var LOCK_MINUTES = 15;

  function isLocked() {
    try {
      var end = sessionStorage.getItem(LOCK_KEY);
      if (!end) return false;
      return Date.now() < parseInt(end, 10);
    } catch (e) { return false; }
  }

  function setLock() {
    try {
      sessionStorage.setItem(LOCK_KEY, String(Date.now() + LOCK_MINUTES * 60 * 1000));
    } catch (e) {}
  }

  function clearLock() {
    try { sessionStorage.removeItem(LOCK_KEY); } catch (e) {}
  }

  function isUnlocked() {
    try {
      return sessionStorage.getItem(STORAGE_KEY) === '1';
    } catch (e) { return false; }
  }

  function setUnlocked() {
    try {
      sessionStorage.setItem(STORAGE_KEY, '1');
      clearLock();
    } catch (e) {}
  }

  function sha256Hex(text) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
      .then(function (buf) {
        var arr = new Uint8Array(buf);
        var hex = '';
        for (var i = 0; i < arr.length; i++) {
          var h = arr[i].toString(16);
          hex += h.length === 1 ? '0' + h : h;
        }
        return hex;
      });
  }

  function checkPassword(input) {
    return sha256Hex(input).then(function (hash) {
      return hash.toLowerCase() === HASH_HEX.toLowerCase();
    });
  }

  function getAttemptCount() {
    try {
      return parseInt(sessionStorage.getItem('asteroids_attempts') || '0', 10);
    } catch (e) { return 0; }
  }

  function setAttemptCount(n) {
    try { sessionStorage.setItem('asteroids_attempts', String(n)); } catch (e) {}
  }

  function showLockMessage(until) {
    var el = document.getElementById('auth-error');
    var mins = Math.ceil((until - Date.now()) / 60000);
    if (el) el.textContent = 'Zu viele Fehlversuche. Bitte warten Sie ' + mins + ' Minute(n).';
    document.getElementById('auth-password').disabled = true;
    document.getElementById('auth-submit').disabled = true;
  }

  function init() {
    if (isUnlocked()) {
      document.getElementById('auth-overlay').style.display = 'none';
      return;
    }

    var overlay = document.getElementById('auth-overlay');
    var input = document.getElementById('auth-password');
    var submit = document.getElementById('auth-submit');
    var error = document.getElementById('auth-error');

    if (!overlay || !input || !submit) return;

    overlay.style.display = 'flex';

    if (isLocked()) {
      var end = parseInt(sessionStorage.getItem(LOCK_KEY), 10);
      showLockMessage(end);
      var interval = setInterval(function () {
        if (Date.now() >= end) {
          clearInterval(interval);
          clearLock();
          input.disabled = false;
          submit.disabled = false;
          if (error) error.textContent = '';
        } else {
          showLockMessage(end);
        }
      }, 10000);
      return;
    }

    submit.addEventListener('click', function () {
      var pw = (input.value || '').trim();
      if (!pw) {
        if (error) error.textContent = 'Bitte Passwort eingeben.';
        return;
      }
      if (error) error.textContent = '';
      submit.disabled = true;

      checkPassword(pw).then(function (ok) {
        if (ok) {
          setUnlocked();
          setAttemptCount(0);
          overlay.style.display = 'none';
          input.value = '';
          if (window.AsteroidsGame && window.AsteroidsGame.canvas) {
            window.AsteroidsGame.canvas.focus();
          }
        } else {
          var n = getAttemptCount() + 1;
          setAttemptCount(n);
          if (error) error.textContent = 'Falsches Passwort. Versuch ' + n + ' von ' + MAX_ATTEMPTS + '.';
          if (n >= MAX_ATTEMPTS) {
            setLock();
            showLockMessage(Date.now() + LOCK_MINUTES * 60 * 1000);
          }
        }
        submit.disabled = false;
      }).catch(function () {
        if (error) error.textContent = 'Fehler bei der Prüfung.';
        submit.disabled = false;
      });
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') submit.click();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
