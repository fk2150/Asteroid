/**
 * Asteroid: polygon shape, size (large/medium/small), break on hit, wrap.
 */
function Asteroid(x, y, size) {
  this.x = x;
  this.y = y;
  this.size = size; // 'large' | 'medium' | 'small'
  this.angle = Math.random() * Math.PI * 2;
  this.rotationSpeed = (Math.random() - 0.5) * 2;
  var speed = 20 + Math.random() * 40;
  var angle = Math.random() * Math.PI * 2;
  this.vx = Math.cos(angle) * speed;
  this.vy = Math.sin(angle) * speed;
  this.radius = size === 'large' ? 40 : size === 'medium' ? 25 : 12;
  this.verts = this.buildVerts();
}

Asteroid.SCORES = { large: 20, medium: 50, small: 100 };

Asteroid.prototype.buildVerts = function () {
  var n = 8 + Math.floor(Math.random() * 4);
  var r = this.radius;
  var verts = [];
  for (var i = 0; i < n; i++) {
    var a = (i / n) * Math.PI * 2 + Math.random() * 0.5;
    var ri = r * (0.7 + Math.random() * 0.3);
    verts.push({ x: Math.cos(a) * ri, y: Math.sin(a) * ri });
  }
  return verts;
};

Asteroid.prototype.update = function (dt, width, height) {
  this.x += this.vx * dt;
  this.y += this.vy * dt;
  this.angle += this.rotationSpeed * dt;
  if (this.x < -this.radius) this.x = width + this.radius;
  if (this.x > width + this.radius) this.x = -this.radius;
  if (this.y < -this.radius) this.y = height + this.radius;
  if (this.y > height + this.radius) this.y = -this.radius;
};

Asteroid.prototype.draw = function (ctx) {
  var color = this.size === 'large' ? '#ff9f43' : this.size === 'medium' ? '#ffd93d' : '#6bcb77';
  ctx.save();
  ctx.translate(this.x, this.y);
  ctx.rotate(this.angle);
  ctx.beginPath();
  this.verts.forEach(function (v, i) {
    if (i === 0) ctx.moveTo(v.x, v.y);
    else ctx.lineTo(v.x, v.y);
  });
  ctx.closePath();
  if (this.size === 'large') ctx.fillStyle = 'rgba(255,159,67,0.2)';
  else if (this.size === 'medium') ctx.fillStyle = 'rgba(255,217,61,0.2)';
  else ctx.fillStyle = 'rgba(107,203,119,0.2)';
  ctx.fill();
  ctx.shadowColor = color;
  ctx.shadowBlur = this.size === 'large' ? 16 : this.size === 'medium' ? 12 : 8;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.restore();
};

Asteroid.prototype.breakApart = function (game) {
  if (window.AsteroidsSound) window.AsteroidsSound.playExplosion();
  game.score += Asteroid.SCORES[this.size] || 0;
  var next = this.size === 'large' ? 'medium' : this.size === 'medium' ? 'small' : null;
  if (!next) return [];
  var a1 = new Asteroid(this.x, this.y, next);
  var a2 = new Asteroid(this.x, this.y, next);
  var angle = Math.random() * Math.PI * 2;
  a1.vx = this.vx + Math.cos(angle) * 30;
  a1.vy = this.vy + Math.sin(angle) * 30;
  a2.vx = this.vx + Math.cos(angle + Math.PI) * 30;
  a2.vy = this.vy + Math.sin(angle + Math.PI) * 30;
  return [a1, a2];
};

Asteroid.updateAll = function (asteroids, dt, width, height) {
  asteroids.forEach(function (a) {
    a.update(dt, width, height);
  });
};
