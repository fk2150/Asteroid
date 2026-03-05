/**
 * Game loop, state machine (MENU, PLAYING, LEVEL_CLEAR, GAME_OVER), spawn logic.
 */
function Game(canvas) {
  this.canvas = canvas;
  this.ctx = canvas.getContext('2d');
  this.width = canvas.width;
  this.height = canvas.height;

  this.state = 'MENU'; // MENU | PLAYING | LEVEL_CLEAR | GAME_OVER
  this.lastTime = 0;
  this.dt = 0;

  this.ship = null;
  this.bullets = [];
  this.asteroids = [];
  this.ufos = [];
  this.ufoBullets = [];

  this.score = 0;
  this.lives = 3;
  this.level = 1;
  this.invincibleUntil = 0;
  this.levelClearUntil = 0;

  this.ASTEROID_COUNT_BASE = 4;
  this.INVINCIBLE_SECONDS = 2;
  this.LEVEL_CLEAR_SECONDS = 2;
}

Game.STATES = { MENU: 'MENU', PLAYING: 'PLAYING', LEVEL_CLEAR: 'LEVEL_CLEAR', GAME_OVER: 'GAME_OVER' };

Game.prototype.start = function () {
  this.setupOverlays();
  if (window.Input && window.Input.init) window.Input.init(this.canvas);
  this.resize();
  window.addEventListener('resize', this.resize.bind(this));
  this.lastTime = performance.now();
  this.tick(this.lastTime);
};

Game.prototype.setupOverlays = function () {
  var container = this.canvas.parentElement;
  var menu = document.getElementById('menu-overlay');
  var gameover = document.getElementById('gameover-overlay');
  var levelOverlay = document.getElementById('level-overlay');
  if (!menu) {
    menu = document.createElement('div');
    menu.id = 'menu-overlay';
    menu.innerHTML = '<h1>ASTEROIDS</h1><p>Zerstöre die Asteroiden. Weiche aus oder schieße.</p>' +
      '<button class="btn" id="btn-play">Spielen</button>' +
      '<p class="controls-hint">Pfeiltasten: Steuerung · Leertaste: Schuss</p>';
    container.appendChild(menu);
  }
  if (!gameover) {
    gameover = document.createElement('div');
    gameover.id = 'gameover-overlay';
    gameover.innerHTML = '<h1>GAME OVER</h1><p id="gameover-score">Punkte: 0</p><button class="btn" id="btn-restart">Nochmal spielen</button>';
    container.appendChild(gameover);
  }
  if (!levelOverlay) {
    levelOverlay = document.createElement('div');
    levelOverlay.id = 'level-overlay';
    levelOverlay.innerHTML = '<h1 id="level-title">Level 1</h1>';
    container.appendChild(levelOverlay);
  }
  this.menuOverlay = menu;
  this.gameoverOverlay = gameover;
  this.levelOverlay = levelOverlay;
  var self = this;
  document.getElementById('btn-play').addEventListener('click', function () { self.startGame(); });
  document.getElementById('btn-restart').addEventListener('click', function () { self.startGame(); });
};

Game.prototype.resize = function () {
  var container = this.canvas.parentElement;
  var w = container.clientWidth;
  var h = container.clientHeight;
  this.canvas.width = w;
  this.canvas.height = h;
  this.width = w;
  this.height = h;
  this.stars = null;
};

Game.prototype.tick = function (now) {
  this.dt = Math.min((now - this.lastTime) / 1000, 0.1);
  this.lastTime = now;

  if (this.state === Game.STATES.MENU) {
    this.updateMenu();
  } else if (this.state === Game.STATES.PLAYING) {
    this.updatePlaying();
  } else if (this.state === Game.STATES.LEVEL_CLEAR) {
    this.updateLevelClear(now);
  } else if (this.state === Game.STATES.GAME_OVER) {
    this.updateGameOver();
  }

  this.draw();
  requestAnimationFrame(this.tick.bind(this));
};

Game.prototype.updateMenu = function () {
  this.menuOverlay.classList.add('visible');
  this.gameoverOverlay.classList.remove('visible');
};

Game.prototype.updatePlaying = function () {
  this.menuOverlay.classList.remove('visible');
  if (this.ship) {
    this.ship.update(this.dt, this);
    Ship.wrap(this.ship, this.width, this.height);
  }
  Bullet.updateAll(this.bullets, this.dt, this.width, this.height);
  Asteroid.updateAll(this.asteroids, this.dt, this.width, this.height);
  Ufo.updateAll(this.ufos, this.dt, this);
  Bullet.updateAll(this.ufoBullets, this.dt, this.width, this.height);
  Collision.checkAll(this);
  this.cleanupBullets();
  this.maybeSpawnUfo(performance.now());
  this.checkLevelClear();
  this.updateHUD();
};

Game.prototype.updateLevelClear = function (now) {
  if (now / 1000 >= this.levelClearUntil) {
    this.level++;
    this.levelClearUntil = 0;
    this.spawnAsteroids();
    this.state = Game.STATES.PLAYING;
    this.levelOverlay.classList.remove('visible');
  }
};

Game.prototype.updateGameOver = function () {
  this.gameoverOverlay.classList.add('visible');
  var scoreEl = document.getElementById('gameover-score');
  if (scoreEl) scoreEl.textContent = 'Punkte: ' + this.score;
  if (window.AsteroidsHighscore) {
    window.AsteroidsHighscore.update(this.score);
    window.AsteroidsHighscore.display();
  }
};

Game.prototype.draw = function () {
  var ctx = this.ctx;
  var w = this.width;
  var h = this.height;

  var bg = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.8);
  bg.addColorStop(0, '#0d0a1a');
  bg.addColorStop(0.5, '#0a0618');
  bg.addColorStop(1, '#050308');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  if (!this.stars) {
    this.stars = [];
    for (var i = 0; i < 120; i++) {
      this.stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.2 + 0.3,
        bright: Math.random() > 0.7
      });
    }
  }
  var t = performance.now() * 0.002;
  this.stars.forEach(function (s) {
    ctx.fillStyle = s.bright ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,' + (0.3 + Math.sin(t + s.x) * 0.2) + ')';
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  });

  if (this.state === Game.STATES.PLAYING || this.state === Game.STATES.LEVEL_CLEAR) {
    if (this.ship) this.ship.draw(ctx, this);
    this.bullets.forEach(function (b) { b.draw(ctx); });
    this.asteroids.forEach(function (a) { a.draw(ctx); });
    this.ufos.forEach(function (u) { u.draw(ctx); });
    this.ufoBullets.forEach(function (b) { b.draw(ctx); });
  }
};

Game.prototype.startGame = function () {
  this.state = Game.STATES.PLAYING;
  this.score = 0;
  this.lives = 3;
  this.level = 1;
  this.bullets = [];
  this.asteroids = [];
  this.ufos = [];
  this.ufoBullets = [];
  this.ship = new Ship(this.width / 2, this.height / 2);
  this.invincibleUntil = 0;
  this.levelClearUntil = 0;
  this.spawnAsteroids();
  this.updateHUD();
  this.menuOverlay.classList.remove('visible');
  this.gameoverOverlay.classList.remove('visible');
  if (window.AsteroidsHighscore) window.AsteroidsHighscore.display(this.score);
  this.canvas.focus();
};

Game.prototype.spawnAsteroids = function () {
  var n = this.ASTEROID_COUNT_BASE + (this.level - 1);
  this.asteroids = [];
  var sx = this.ship ? this.ship.x : this.width / 2;
  var sy = this.ship ? this.ship.y : this.height / 2;
  for (var i = 0; i < n; i++) {
    var x = Math.random() * this.width;
    var y = Math.random() * this.height;
    var d = Math.hypot(x - sx, y - sy);
    if (d < 80) {
      x = (x + 150) % this.width;
      y = (y + 150) % this.height;
    }
    this.asteroids.push(new Asteroid(x, y, 'large'));
  }
};

Game.prototype.cleanupBullets = function () {
  this.bullets = this.bullets.filter(function (b) { return b.active; });
  this.ufoBullets = this.ufoBullets.filter(function (b) { return b.active; });
};

Game.prototype.maybeSpawnUfo = function (now) {
  if (!window.UfoSpawnTimer) window.UfoSpawnTimer = now;
  if (now - window.UfoSpawnTimer < 15000) return;
  if (this.ufos.length >= 1) return;
  window.UfoSpawnTimer = now;
  var side = Math.random() < 0.5 ? 0 : 1;
  var x = side === 0 ? -20 : this.width + 20;
  var y = Math.random() * this.height;
  this.ufos.push(new Ufo(x, y, this.width, this.height));
};

Game.prototype.checkLevelClear = function () {
  if (this.asteroids.length > 0 || this.ufos.length > 0) return;
  this.state = Game.STATES.LEVEL_CLEAR;
  this.levelClearUntil = (performance.now() / 1000) + this.LEVEL_CLEAR_SECONDS;
  this.levelOverlay.classList.add('visible');
  var title = document.getElementById('level-title');
  if (title) title.textContent = 'Level ' + (this.level + 1);
};

Game.prototype.updateHUD = function () {
  var scoreEl = document.getElementById('score');
  var livesEl = document.getElementById('lives');
  var levelEl = document.getElementById('level-display');
  var hsEl = document.getElementById('highscore');
  if (scoreEl) scoreEl.textContent = 'Punkte: ' + this.score;
  if (livesEl) livesEl.textContent = 'Leben: ' + this.lives;
  if (levelEl) levelEl.textContent = 'Level: ' + this.level;
  if (hsEl && window.AsteroidsHighscore) hsEl.textContent = 'Highscore: ' + (window.AsteroidsHighscore.get() || 0);
};
