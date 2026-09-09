// ============================================
// 普通敌机
// ============================================
import * as Phaser from 'phaser';
import { GAME_CONFIG } from '../Config/game.config.js';

export class Enemy extends Phaser.GameObjects.Container {
  constructor(scene, x, y, type) {
    super(scene, x, y);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    const cfg = GAME_CONFIG.enemies[type] || GAME_CONFIG.enemies.scout;
    this.type = type;
    this.hp = cfg.hp;
    this.maxHp = cfg.hp;
    this.speed = cfg.speed;
    this.score = cfg.score;
    this.color = cfg.color;
    this.isDead = false;
    this.fireTimer = null;
    this.movePattern = this._getMovePattern(type);
    this.timeOffset = Math.random() * 1000;
    
    this._createBody(cfg);
    this._setupBehavior();
    
    this.x = x;
    this.y = y;
  }
  
  _getMovePattern(type) {
    const patterns = {
      scout: 'straight',
      fighter: 'sine',
      bomber: 'straight_slow',
      fast: 'zigzag',
    };
    return patterns[type] || 'straight';
  }
  
  _createBody(cfg) {
    const g = this.scene.add.graphics();
    const c = cfg.color;
    
    switch (this.type) {
      case 'scout':
        g.fillStyle(c, 1);
        g.fillTriangle(0, 15, -12, -15, 12, -15);
        g.lineStyle(1, 0xffffff, 0.5);
        g.strokeTriangle(0, 15, -12, -15, 12, -15);
        break;
      case 'fighter':
        g.fillStyle(c, 1);
        g.fillRoundedRect(-15, -12, 30, 24, 4);
        g.fillStyle(Phaser.Display.Color.ValueToColor(0x333333).color, 1);
        g.fillCircle(0, 0, 6);
        g.lineStyle(1, 0xffffff, 0.4);
        g.strokeRoundedRect(-15, -12, 30, 24, 4);
        break;
      case 'bomber':
        g.fillStyle(c, 1);
        g.fillCircle(0, 0, 18);
        g.fillStyle(Phaser.Display.Color.ValueToColor(0x660033).color, 1);
        g.fillCircle(0, 0, 10);
        g.lineStyle(2, 0xffffff, 0.5);
        g.strokeCircle(0, 0, 18);
        break;
      case 'fast':
        g.fillStyle(c, 1);
        g.fillTriangle(0, 18, -8, -12, 8, -12);
        g.fillTriangle(-8, -12, -16, -5, -8, 5);
        g.fillTriangle(8, -12, 16, -5, 8, 5);
        break;
      default:
        g.fillStyle(c, 1);
        g.fillCircle(0, 0, 12);
    }
    
    this.body = g;
    this.add(g);
    this.setDepth(8);
    
    // 碰撞体积
    // Collision handled by Container physics body
    // Collision handled by Container physics body
  }
  
  _setupBehavior() {
    if (this.type === 'fighter' || this.type === 'bomber') {
      this.fireTimer = this.scene.time.addEvent({
        delay: this.type === 'bomber' ? 2000 : 1500,
        callback: this.fire,
        callbackScope: this,
        loop: true,
        startAt: this.timeOffset
      });
    }
  }
  
  fire() {
    if (this.isDead) return;
    const angle = Math.PI / 2 + (Math.random() - 0.5) * 0.3;
    const speed = this.type === 'bomber' ? 200 : 300;
    this.scene.events.emit('enemyFire', this.x, this.y, angle, speed);
  }
  
  update() {
    if (this.isDead || !this.scene) return;
    
    const dt = (this.scene.time.physicsDeltaTime > 0 ? this.scene.time.physicsDeltaTime : 16);
    const t = this.scene.time.now + this.timeOffset;
    
    switch (this.movePattern) {
      case 'straight':
      case 'straight_slow':
        this.y += this.speed * dt / 16;
        break;
      case 'sine':
        this.y += this.speed * dt / 16;
        this.x += Math.sin(t * 0.003) * 1.5;
        break;
      case 'zigzag':
        this.y += this.speed * dt / 16;
        this.x += Math.sin(t * 0.008) * 3;
        break;
    }
    
    this.x = Phaser.Math.Clamp(this.x, 20, GAME_CONFIG.width - 20);
    
    if (this.y > GAME_CONFIG.height + 30) {
      this.isDead = true;
      this.destroy();
    }
  }
  
  takeDamage(damage) {
    if (this.isDead) return false;
    this.hp -= damage;
    this.scene.events.emit('enemyHit', this.x, this.y);
    
    if (this.hp <= 0) {
      this.die();
      return true;
    }
    return false;
  }
  
  die() {
    this.isDead = true;
    this.scene.events.emit('enemyDeath', this.x, this.y, this.score, this.type);
    if (this.fireTimer) this.fireTimer.remove();
    // 立即销毁可视对象，避免残影
    if (this.body) { this.body.destroy(); this.body = null; }
    this.destroy();
  }
}
