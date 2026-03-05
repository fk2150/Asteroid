/**
 * Bullet: position, velocity, lifetime/range, draw.
 */
function Bullet(x, y, vx, vy, isUfo) {
  this.x = x;
  this.y = y;
  this.vx = vx;
  this.vy = vy;
  this.active = true;
  this.age = 0;
  this.maxAge = isUfo ? 1.5 : 1;
  this.radius = 2;
}

Bullet.prototype.update = function (dt, width, height) {
  this.x += this.vx * dt;
  this.y += this.vy * dt;
  this.age += dt;
  if (this.age >= this.maxAge) this.active = false;
  if (this.x < -10 || this.x > width + 10 || this.y < -10 || this.y > height + 10) this.active = false;
};

Bullet.prototype.draw = function (ctx) {
  if (!this.active) return;
  ctx.save();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

Bullet.updateAll = function (bullets, dt, width, height) {
  bullets.forEach(function (b) {
    if (b.active) b.update(dt, width, height);
  });
};
