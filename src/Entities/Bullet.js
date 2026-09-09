// ============================================
// 子弹 — 纯数据对象，不与 Phaser 交互
// ============================================
import { GAME_CONFIG } from '../Config/game.config.js';


// ============================================
// 导弹 — 追踪最近的敌人
// ============================================
export class Missile {
  constructor(x, y, scene) {
    this.x = x;
    this.y = y;
    this.scene = scene;
    this.speed = 400;
    this.damage = 50;
    this.isMissile = true;
    this.markedForDeletion = false;
    this._w = 8;
    this._h = 20;
    this.color = 0xff4400;
    this.target = null;
    this._findTarget();
  }

  _findTarget() {
    let nearest = null;
    let nearestDist = 600; // 探测范围
    for (const e of this.scene.enemies) {
      if (e.isDead) continue;
      const d = Phaser.Math.Distance.Between(this.x, this.y, e.x, e.y);
      if (d < nearestDist) { nearestDist = d; nearest = e; }
    }
    if (this.scene.boss && !this.scene.boss.isDead) {
      const d = Phaser.Math.Distance.Between(this.x, this.y, this.scene.boss.x, this.scene.boss.y);
      if (d < nearestDist) { nearestDist = d; nearest = this.scene.boss; }
    }
    this.target = nearest;
  }

  update() {
    if (!this.target || this.target.isDead) {
      this._findTarget();
    }
    if (this.target) {
      const angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
      this.vx = Math.cos(angle) * this.speed;
      this.vy = Math.sin(angle) * this.speed;
    } else {
      this.vx = 0;
      this.vy = -this.speed;
    }
    this.x += this.vx * (this.scene.time.physicsDeltaTime > 0 ? this.scene.time.physicsDeltaTime : 16) / 16;
    this.y += this.vy * (this.scene.time.physicsDeltaTime > 0 ? this.scene.time.physicsDeltaTime : 16) / 16;
    if (this.y < -50 || this.y > this.scene.scale.height + 50 ||
        this.x < -50 || this.x > this.scene.scale.width + 50) {
      this.markedForDeletion = true;
    }
  }

  destroy() {
    this.markedForDeletion = true;
  }
}

export class Bullet {
  constructor(x, y, config) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = -(config.speed || 600);
    this.damage = config.damage || 10;
    this.isEnemy = false;
    this.isEnemyBullet = false;
    this.markedForDeletion = false;
    this._w = config.width || 4;
    this._h = config.height || 12;
    this.color = config.color || 0x00f0ff;
  }

  update(delta) {
    const ms = delta !== undefined ? delta : 16;
    const dt = ms / 1000;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    if (this.y < -50 || this.y > GAME_CONFIG.height + 50 ||
        this.x < -50 || this.x > GAME_CONFIG.width + 50) {
      this.markedForDeletion = true;
    }
  }

  destroy() {
    this.markedForDeletion = true;
  }
}

export class BulletFactory {
  constructor(scene) {
    this.scene = scene;
  }

  create(x, y, weaponLevel) {
    const level = Math.min(weaponLevel, GAME_CONFIG.weaponLevels.length - 1);
    const baseDamage = GAME_CONFIG.player.bulletDamage + level * 3;
    switch (level) {
      case 0: return this._createSingle(x, y, baseDamage);
      case 1: return this._createDouble(x, y, baseDamage);
      case 2: return this._createSpread(x, y, baseDamage);
      case 3: return this._createLaser(x, y, baseDamage);
      case 4: return this._createSpiral(x, y, baseDamage);
      case 5: return this._createBomb(x, y);
      default: return this._createSingle(x, y, baseDamage);
    }
  }

  _createSingle(x, y, damage) {
    return [new Bullet(x, y, { speed: 600, width: 4, height: 12, color: 0x00f0ff, damage })];
  }

  _createDouble(x, y, damage) {
    return [
      new Bullet(x - 10, y - 15, { speed: 600, width: 4, height: 12, color: 0x00e5ff, damage }),
      new Bullet(x + 10, y - 15, { speed: 600, width: 4, height: 12, color: 0x00e5ff, damage }),
    ];
  }

  _createSpread(x, y, damage) {
    const bullets = [];
    for (let i = -1; i <= 1; i++) {
      const b = new Bullet(x + i * 8, y - 20, { speed: 550, width: 4, height: 10, color: 0x00d4ff, damage });
      b.vx = i * 80;
      b.vy = -550;
      bullets.push(b);
    }
    return bullets;
  }

  _createLaser(x, y, damage) {
    return [new Bullet(x, y - 25, { speed: 900, width: 6, height: 30, color: 0xff00ff, damage })];
  }

  _createSpiral(x, y, damage) {
    const bullets = [];
    const count = 8;
    const spread = 30;
    for (let i = 0; i < count; i++) {
      const offset = (i - count / 2) * (spread / (count / 2));
      bullets.push(new Bullet(x + offset, y, { speed: 500, width: 5, height: 10, color: 0xff00aa, damage }));
    }
    return bullets;
  }

  _createBomb(x, y) {
    const b = new Bullet(x, y, { speed: 0, width: 40, height: 40, color: 0xffff00, damage: 100 });
    b.isBomb = true;
    return [b];
  }

  createEnemyBullet(x, y, angle = Math.PI / 2, speed = 250, color = 0xff4444, damage = 1) {
    const b = new Bullet(x, y, { speed, width: 4, height: 8, color, damage });
    b.vx = Math.cos(angle) * speed;
    b.vy = Math.sin(angle) * speed;
    b.isEnemy = true;
    b.isEnemyBullet = true;
    return b;
  }
}
