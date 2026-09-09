// ============================================
// GameScene — 主游戏场景
// ============================================
import * as Phaser from 'phaser';
import { GAME_CONFIG } from '../Config/game.config.js';
import { Player } from '../Entities/Player.js';
import { BulletFactory, Missile } from '../Entities/Bullet.js';
import { PowerUpFactory } from '../Entities/PowerUp.js';
import { Explosion } from '../Entities/Particle.js';
import { EnemySpawner } from '../Systems/EnemySpawner.js';
import { UIManager } from '../Systems/UIManager.js';
import { audio } from '../Systems/AudioController.js';
import { SaveManager } from '../Systems/SaveManager.js';

window.gameScene = null;

export class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }
  
  create() {
    window.gameScene = this;
    
    this.spawner = new EnemySpawner(this);
    this.ui = new UIManager(this);
    this.bulletFactory = new BulletFactory(this);
    this.powerUpFactory = new PowerUpFactory(this);
    
    this.playerBullets = [];
    this.missileBullets = [];
    this.enemyBullets = [];
    this.enemyBulletGraphics = [];
    this.enemies = [];
    this.powerUps = [];
    this.boss = null;
    this._bulletGraphics = [];
    
    this.player = new Player(this, GAME_CONFIG.width / 2, GAME_CONFIG.height - 80);
    this.bombCount = this.player.bombCount;
    
    // Pause button (top right)
    this._pauseBtn = this.add.rectangle(this.scale.width - 50, 50, 60, 30, 0x003344, 0.8)
      .setStrokeStyle(1, 0x00f0ff).setDepth(55).setInteractive({ useHandCursor: true });
    this.add.text(this.scale.width - 50, 50, "II", {
      fontSize: "14px", color: "#00f0ff", fontStyle: "bold"
    }).setOrigin(0.5).setDepth(56);
    this._pauseBtn.on("pointerdown", () => this.scene.start("PauseScene"));

    this._setupEvents();
    
    this.time.delayedCall(1000, () => this._startWave(1));
  }
  
  _setupEvents() {
    this.events.on('playerShoot', (x, y, weaponLevel) => {
      const bullets = this.bulletFactory.create(x, y, weaponLevel);
      bullets.forEach(b => {
        this.playerBullets.push(b);
        const g = this.add.graphics();
        g.fillStyle(b.color, 1);
        g.fillRect(-b._w/2, -b._h/2, b._w, b._h);
        g.setBlendMode(Phaser.BlendModes.ADD);
        g.setDepth(9);
        g.x = b.x; g.y = b.y;
        b._gfx = g;
        this._bulletGraphics.push(g);
      });
    });
    
    this.events.on('enemyFire', (x, y, angle, speed) => {
      const b = this.bulletFactory.createEnemyBullet(x, y, angle, speed);
      this.enemyBullets.push(b);
      const g = this.add.graphics();
      g.fillStyle(b.color || 0xff4444, 1);
      g.fillRect(-b._w/2, -b._h/2, b._w, b._h);
      g.setBlendMode(Phaser.BlendModes.ADD);
      g.setDepth(8);
      g.x = b.x; g.y = b.y;
      b._gfx = g;
      this.enemyBulletGraphics.push(g);
    });
    
    this.events.on('playerDeath', (x, y) => {
      new Explosion(this, x, y, 'large');
      this.time.delayedCall(1000, () => this._gameOver());
    });
    
    this.events.on('showFloatingText', (x, y, text, color) => {
      this.ui.showFloatingText(x, y, text, color);
    });
    
    this.events.on('bossSpawned', (boss) => {
      this.boss = boss;
    });
    
    this.events.on('bossDeath', (x, y, score) => {
      new Explosion(this, x, y, 'boss');
      audio.play('explosion');
      this.ui.addScore(score);
      this.boss = null;
      
      const currentLevel = this.spawner.getLevel();
      const nextLevel = currentLevel + 1;
      const nextWave = nextLevel * 3;
      
      // 新关卡重置道具追踪
      if (nextWave <= this.spawner.totalWaves) {
        this.time.delayedCall(2000, () => this._startWave(nextWave));
      } else {
        this._victory();
      }
    });
    
    this.events.on('enemyDeath', (x, y, score, type) => {
      new Explosion(this, x, y, 'medium');
      audio.play('explosion');
      this.ui.addScore(score);
      
      if (Math.random() < 0.156) {
        // 从屏幕顶部生成道具
        const spawnX = Phaser.Math.Between(40, GAME_CONFIG.width - 40);
        const powerUp = this.powerUpFactory.spawn(spawnX, -20);
        this.powerUps.push(powerUp);
      }
      
      const deadIdx = this.enemies.findIndex(e => e.isDead);
      if (deadIdx >= 0) {
        this.enemies.splice(deadIdx, 1);
      }
    });
    
    this.events.on('enemyHit', (x, y) => {
      audio.play('hit');
    });
    
    this.events.on('playerMissile', (x, y) => {
      const m = new Missile(x, y, this);
      this.missileBullets.push(m);
      const g = this.add.graphics();
      g.fillStyle(0xff4400, 1);
      g.fillTriangle(0, -10, -6, 10, 6, 10);
      g.setBlendMode(Phaser.BlendModes.ADD);
      g.setDepth(9);
      g.x = m.x; g.y = m.y;
      m._gfx = g;
      this._bulletGraphics.push(g);
    });
    
    this.input.keyboard.on('keydown-Escape', () => this.scene.start('PauseScene'));
    this.input.keyboard.on('keydown-B', () => this.player.launchMissile());
  }
  
  _startWave(waveNumber) {
    if (waveNumber > this.spawner.totalWaves) {
      this._victory();
      return;
    }
    
    const level = this.spawner.getLevel();
    const levelName = GAME_CONFIG.levelNames[level - 1] || 'Wave ' + waveNumber;
    this.ui.showWaveAnnouncement(waveNumber, levelName);
    this.spawner.startWave(waveNumber);
  }
  
  update() {
    this.player.update();
    this.ui.update(this.player);
    
    for (let i = this.playerBullets.length - 1; i >= 0; i--) {
      const b = this.playerBullets[i];
      b.update();
      if (b._gfx) { b._gfx.x = b.x; b._gfx.y = b.y; }
      if (b.markedForDeletion) {
        b.destroy();
        this.playerBullets.splice(i, 1);
        if (b._gfx) { b._gfx.destroy(); const gi = this._bulletGraphics.indexOf(b._gfx); if (gi >= 0) this._bulletGraphics.splice(gi, 1); }
        continue;
      }
      for (const enemy of this.enemies) {
        if (enemy.isDead) continue;
        const dx = b.x - enemy.x;
        const dy = b.y - enemy.y;
        if (Math.abs(dx) < 80 && Math.abs(dy) < 80) {
          b.markedForDeletion = true;
          b.destroy();
          this.playerBullets.splice(i, 1);
          if (b._gfx) { b._gfx.destroy(); const gi = this._bulletGraphics.indexOf(b._gfx); if (gi >= 0) this._bulletGraphics.splice(gi, 1); }
          enemy.takeDamage(b.damage);
          break;
        }
      }
      if (this.boss && !this.boss.isDead) {
        const dx = b.x - this.boss.x;
        const dy = b.y - this.boss.y;
        if (Math.abs(dx) < 40 && Math.abs(dy) < 40) {
          b.markedForDeletion = true;
          b.destroy();
          this.playerBullets.splice(i, 1);
          if (b._gfx) { b._gfx.destroy(); const gi = this._bulletGraphics.indexOf(b._gfx); if (gi >= 0) this._bulletGraphics.splice(gi, 1); }
          this.boss.takeDamage(b.damage);
        }
      }
      // 道具改为玩家碰撞收集，移除子弹击逻辑
      for (const p of this.powerUps) {
        if (p.isDead || p.hitByBullet) continue;
        const dx = b.x - p.x;
        const dy = b.y - p.y;
        if (Math.abs(dx) < 80 && Math.abs(dy) < 80) {
          b.markedForDeletion = true;
          b.destroy();
          this.playerBullets.splice(i, 1);
          if (b._gfx) { b._gfx.destroy(); const gi = this._bulletGraphics.indexOf(b._gfx); if (gi >= 0) this._bulletGraphics.splice(gi, 1); }
          p.onBulletHit();
          audio.play('hit');
          break;
        }
      }
    }
    
    for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
      const b = this.enemyBullets[i];
      b.update();
      if (b._gfx) { b._gfx.x = b.x; b._gfx.y = b.y; }
      if (b.markedForDeletion) {
        b.destroy();
        this.enemyBullets.splice(i, 1);
        if (b._gfx) { b._gfx.destroy(); const idx = this.enemyBulletGraphics.indexOf(b._gfx); if (idx >= 0) this.enemyBulletGraphics.splice(idx, 1); }
        continue;
      }
      if (!this.player.isDead) {
        const dx = b.x - this.player.x;
        const dy = b.y - this.player.y;
        if (Math.abs(dx) < 20 && Math.abs(dy) < 20) {
          b.markedForDeletion = true;
          b.destroy();
          this.enemyBullets.splice(i, 1);
          if (b._gfx) { b._gfx.destroy(); const gi = this.enemyBulletGraphics.indexOf(b._gfx); if (gi >= 0) this.enemyBulletGraphics.splice(gi, 1); }
          this.player.takeDamage();
        }
      }
    }
    
    for (const enemy of this.enemies) {
      if (enemy.isDead) continue;
      const dx = enemy.x - this.player.x;
      const dy = enemy.y - this.player.y;
      if (Math.abs(dx) < 80 && Math.abs(dy) < 80) {
        enemy.takeDamage(999);
        this.player.takeDamage();
      }
    }
    
    // 检查玩家是否靠近固定的道具
    for (const p of this.powerUps) {
      if (p.isDead || !p.isFixed) continue;
      const dx = p.x - this.player.x;
      const dy = p.y - this.player.y;
      if (Math.abs(dx) < 30 && Math.abs(dy) < 30) {
        p.applyToPlayer(this.player);
        audio.play('powerup');
      }
    }
    
    for (let i = this.missileBullets.length - 1; i >= 0; i--) {
      const m = this.missileBullets[i];
      m.update();
      if (m._gfx) { m._gfx.x = m.x; m._gfx.y = m.y; }
      if (m.markedForDeletion) {
        m.destroy();
        this.missileBullets.splice(i, 1);
        if (m._gfx) { m._gfx.destroy(); const gi = this._bulletGraphics.indexOf(m._gfx); if (gi >= 0) this._bulletGraphics.splice(gi, 1); }
        continue;
      }
      for (const enemy of this.enemies) {
        if (enemy.isDead) continue;
        const dx = m.x - enemy.x;
        const dy = m.y - enemy.y;
        if (Math.abs(dx) < 80 && Math.abs(dy) < 80) {
          m.markedForDeletion = true;
          m.destroy();
          this.missileBullets.splice(i, 1);
          if (m._gfx) { m._gfx.destroy(); const gi = this._bulletGraphics.indexOf(m._gfx); if (gi >= 0) this._bulletGraphics.splice(gi, 1); }
          new Explosion(this, m.x, m.y, 'medium');
          audio.play('explosion');
          enemy.takeDamage(m.damage);
          break;
        }
      }
      if (this.boss && !this.boss.isDead) {
        const dx = m.x - this.boss.x;
        const dy = m.y - this.boss.y;
        if (Math.abs(dx) < 50 && Math.abs(dy) < 50) {
          m.markedForDeletion = true;
          m.destroy();
          this.missileBullets.splice(i, 1);
          if (m._gfx) { m._gfx.destroy(); const gi = this._bulletGraphics.indexOf(m._gfx); if (gi >= 0) this._bulletGraphics.splice(gi, 1); }
          new Explosion(this, m.x, m.y, 'boss');
          audio.play('explosion');
          this.boss.takeDamage(m.damage);
        }
      }
    }

    this.enemies.forEach(e => e.update());
    if (this.boss) this.boss.update();
    this.powerUps.forEach(p => p.update());
    
    this.enemies = this.enemies.filter(e => !e.isDead && e.active);
    this.powerUps = this.powerUps.filter(p => !p.isDead && p.active);
    
    if (this.spawner.isWaveComplete() && !this.boss) {
      const nextWave = this.spawner.currentWave + 1;
      if (nextWave > this.spawner.totalWaves) {
        this._victory();
      } else {
        this._startWave(nextWave);
      }
    }
  }
  
  _gameOver() {
    audio.play('gameover');
    this.scene.start('ResultScene', { 
      score: this.ui.score, 
      isVictory: false,
      highScore: SaveManager.getHighScore() 
    });
  }
  
  _victory() {
    audio.play('powerup');
    this.time.delayedCall(1000, () => {
      this.scene.start('ResultScene', {
        score: this.ui.score,
        isVictory: true,
        highScore: SaveManager.getHighScore()
      });
    });
  }
}
