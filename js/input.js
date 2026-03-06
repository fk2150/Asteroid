/**
 * Keyboard and touch input state (left/right/thrust/fire).
 */
var Input = (function () {
  var keys = {};
  var left = false;
  var right = false;
  var thrust = false;
  var fire = false;
  var touchLeft = false;
  var touchRight = false;
  var touchThrust = false;
  var touchFire = false;

  function keyDown(e) {
    keys[e.keyCode] = true;
    setFlags();
  }
  function keyUp(e) {
    keys[e.keyCode] = false;
    setFlags();
  }
  function setFlags() {
    left = !!(keys[37] || keys[65] || touchLeft);
    right = !!(keys[39] || keys[68] || touchRight);
    thrust = !!(keys[38] || keys[87] || touchThrust);
    fire = !!(keys[32] || keys[82] || touchFire);
  }

  function setTouchState(state) {
    if (state.left !== undefined) touchLeft = !!state.left;
    if (state.right !== undefined) touchRight = !!state.right;
    if (state.thrust !== undefined) touchThrust = !!state.thrust;
    if (state.fire !== undefined) touchFire = !!state.fire;
    setFlags();
  }

  return {
    init: function (element) {
      element.addEventListener('keydown', keyDown);
      element.addEventListener('keyup', keyUp);
      element.addEventListener('blur', function () {
        keys = {};
        left = right = thrust = fire = false;
        touchLeft = touchRight = touchThrust = touchFire = false;
        setFlags();
      });
    },
    left: function () { return left; },
    right: function () { return right; },
    thrust: function () { return thrust; },
    fire: function () { return fire; },
    setTouchState: setTouchState,
    consumeFire: function () {
      var f = fire;
      keys[32] = false;
      keys[82] = false;
      touchFire = false;
      setFlags();
      return f;
    }
  };
})();
