/**
 * Sound effects via Web Audio API (no external files).
 */
window.AsteroidsSound = (function () {
  var ctx = null;
  var unlocked = false;

  function getCtx() {
    if (ctx) return ctx;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      return null;
    }
    return ctx;
  }

  function unlock() {
    if (unlocked) return;
    var c = getCtx();
    if (!c) return;
    var buf = c.createBuffer(1, 1, 22050);
    var src = c.createBufferSource();
    src.buffer = buf;
    src.connect(c.destination);
    src.start(0);
    unlocked = true;
  }

  function playTone(freq, duration, type) {
    var c = getCtx();
    if (!c) return;
    unlock();
    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.frequency.value = freq;
    osc.type = type || 'square';
    gain.gain.setValueAtTime(0.15, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, c.currentTime + duration);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + duration);
  }

  function playShoot() {
    playTone(800, 0.05, 'square');
  }

  function playExplosion() {
    playTone(100, 0.1, 'sawtooth');
    setTimeout(function () { playTone(80, 0.15, 'sawtooth'); }, 50);
  }

  function playUfo() {
    playTone(400, 0.08, 'sine');
  }

  document.addEventListener('keydown', unlock, { once: true });
  document.addEventListener('click', unlock, { once: true });

  return {
    playShoot: playShoot,
    playExplosion: playExplosion,
    playUfo: playUfo
  };
})();
