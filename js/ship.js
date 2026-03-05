/**
 * Ship: triangle, rotate, thrust, shoot, wrap.
 */
function Ship(x, y) {
  this.x = x;
  this.y = y;
  this.vx = 0;
  this.vy = 0;
  this.angle = -Math.PI / 2;
  this.radius = 12;
  this.thrust = 180;
  this.rotateSpeed = 4;
}

Ship.wrap = function (ship, width, height) {
  if (ship.x < -ship.radius) ship.x = width + ship.radius;
  if (ship.x > width + ship.radius) ship.x = -ship.radius;
  if (ship.y < -ship.radius) ship.y = height + ship.radius;
  if (ship.y > height + ship.radius) ship.y = -ship.radius;
};

Ship.prototype.update = function (dt, game) {
  if (window.Input) {
    if (Input.left()) this.angle -= this.rotateSpeed * dt;
    if (Input.right()) this.angle += this.rotateSpeed * dt;
    if (Input.thrust()) {
      this.vx += Math.cos(this.angle) * this.thrust * dt;
      this.vy += Math.sin(this.angle) * this.thrust * dt;
    }
    if (Input.consumeFire()) {
      var bx = this.x + Math.cos(this.angle) * (this.radius + 4);
      var by = this.y + Math.sin(this.angle) * (this.radius + 4);
      var bv = 400;
      game.bullets.push(new Bullet(bx, by, this.vx + Math.cos(this.angle) * bv, this.vy + Math.sin(this.angle) * bv, false));
      if (window.AsteroidsSound) window.AsteroidsSound.playShoot();
    }
  }
  this.x += this.vx * dt;
  this.y += this.vy * dt;
  var damp = 0.995;
  this.vx *= damp;
  this.vy *= damp;
};

Ship.prototype.draw = function (ctx, game) {
  var invincible = game.invincibleUntil > performance.now() / 1000;
  if (invincible && Math.floor((performance.now() / 100) % 2) === 0) return;
  ctx.save();
  ctx.translate(this.x, this.y);
  ctx.rotate(this.angle);
  ctx.shadowColor = '#00d4ff';
  ctx.shadowBlur = 14;
  ctx.strokeStyle = '#00d4ff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(this.radius, 0);
  ctx.lineTo(-this.radius * 0.8, this.radius * 0.6);
  ctx.lineTo(-this.radius * 0.5, 0);
  ctx.lineTo(-this.radius * 0.8, -this.radius * 0.6);
  ctx.closePath();
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(0, 212, 255, 0.25)';
  ctx.fill();
  ctx.restore();
};
