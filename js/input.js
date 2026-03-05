/**
 * Keyboard input state (left/right/thrust/fire).
 */
var Input = (function () {
  var keys = {};
  var left = false;
  var right = false;
  var thrust = false;
  var fire = false;

  function keyDown(e) {
    keys[e.keyCode] = true;
    setFlags();
  }
  function keyUp(e) {
    keys[e.keyCode] = false;
    setFlags();
  }
  function setFlags() {
    left = !!(keys[37] || keys[65]);
    right = !!(keys[39] || keys[68]);
    thrust = !!(keys[38] || keys[87]);
    fire = !!(keys[32] || keys[82]); // space or R
  }

  return {
    init: function (element) {
      element.addEventListener('keydown', keyDown);
      element.addEventListener('keyup', keyUp);
      element.addEventListener('blur', function () {
        keys = {};
        left = right = thrust = fire = false;
      });
    },
    left: function () { return left; },
    right: function () { return right; },
    thrust: function () { return thrust; },
    fire: function () { return fire; },
    consumeFire: function () {
      var f = fire;
      keys[32] = false;
      keys[82] = false;
      setFlags();
      return f;
    }
  };
})();
