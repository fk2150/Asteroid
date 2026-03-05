/**
 * UFO: spawn, movement, shoot at player.
 */
function Ufo(x, y, width, height) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.vx = (x < width / 2 ? 1 : -1) * (60 + Math.random() * 40);
  this.vy = (Math.random() - 0.5) * 40;
  this.radius = 15;
  this.lastShot = 0;
  this.points = 200;
  this.active = true;
}

Ufo.prototype.update = function (dt, game) {
  this.x += this.vx * dt;
  this.y += this.vy * dt;
  if (this.y < 0 || this.y > this.height) this.vy = -this.vy;
  if (this.x < -30 || this.x > this.width + 30) {
    this.active = false;
    return;
  }
  var now = performance.now() / 1000;
  if (now - this.lastShot > 1.5 && game.ship) {
    var dx = game.ship.x - this.x;
    var dy = game.ship.y - this.y;
    var dist = Math.hypot(dx, dy);
    if (dist < 400 && dist > 20) {
      this.lastShot = now;
      var a = Math.atan2(dy, dx);
      var bv = 250;
      game.ufoBullets.push(new Bullet(this.x, this.y, Math.cos(a) * bv, Math.sin(a) * bv, true));
      if (window.AsteroidsSound) window.AsteroidsSound.playUfo();
    }
  }
};

Ufo.prototype.draw = function (ctx) {
  ctx.save();
  ctx.shadowColor = '#22c55e';
  ctx.shadowBlur = 18;
  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(this.x, this.y, this.radius * 0.5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(34, 197, 94, 0.2)';
  ctx.beginPath();
  ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

Ufo.updateAll = function (ufos, dt, game) {
  ufos.forEach(function (u) {
    u.update(dt, game);
  });
};
