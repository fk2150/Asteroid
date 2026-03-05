/**
 * Collision: bullet–asteroid, ship–asteroid, ship–UFO, ship–UFO bullet.
 */
var Collision = (function () {
  function circleCircle(x1, y1, r1, x2, y2, r2) {
    return Math.hypot(x1 - x2, y1 - y2) < r1 + r2;
  }

  return {
    checkAll: function (game) {
      var ship = game.ship;
      var now = performance.now() / 1000;
      var invincible = game.invincibleUntil > now;

      if (ship && !invincible) {
        game.asteroids.forEach(function (a) {
          if (circleCircle(ship.x, ship.y, ship.radius, a.x, a.y, a.radius)) {
            game.lives--;
            game.invincibleUntil = now + game.INVINCIBLE_SECONDS;
            if (window.AsteroidsSound) window.AsteroidsSound.playExplosion();
            if (game.lives <= 0) {
              game.state = Game.STATES.GAME_OVER;
            }
            a.dead = true;
          }
        });
        game.ufos.forEach(function (u) {
          if (circleCircle(ship.x, ship.y, ship.radius, u.x, u.y, u.radius)) {
            game.lives--;
            game.invincibleUntil = now + game.INVINCIBLE_SECONDS;
            game.score += u.points || 200;
            u.active = false;
            if (game.lives <= 0) game.state = Game.STATES.GAME_OVER;
          }
        });
        game.ufoBullets.forEach(function (b) {
          if (!b.active) return;
          if (circleCircle(ship.x, ship.y, ship.radius, b.x, b.y, b.radius)) {
            b.active = false;
            game.lives--;
            game.invincibleUntil = now + game.INVINCIBLE_SECONDS;
            if (window.AsteroidsSound) window.AsteroidsSound.playExplosion();
            if (game.lives <= 0) {
              game.state = Game.STATES.GAME_OVER;
            }
          }
        });
      }

      game.bullets.forEach(function (b) {
        if (!b.active) return;
        game.asteroids.slice().forEach(function (a) {
          if (a.dead) return;
          if (circleCircle(b.x, b.y, b.radius, a.x, a.y, a.radius)) {
            b.active = false;
            a.dead = true;
            var newA = a.breakApart(game);
            newA.forEach(function (na) { game.asteroids.push(na); });
          }
        });
        game.ufos.forEach(function (u) {
          if (circleCircle(b.x, b.y, b.radius, u.x, u.y, u.radius)) {
            b.active = false;
            u.active = false;
            game.score += u.points || 200;
            if (window.AsteroidsSound) window.AsteroidsSound.playExplosion();
          }
        });
      });

      game.asteroids = game.asteroids.filter(function (a) { return !a.dead; });
      game.ufos = game.ufos.filter(function (u) { return u.active !== false; });
    }
  };
})();
