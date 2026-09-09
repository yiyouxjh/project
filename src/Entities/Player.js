// ============================================
// 玩家战机
// ============================================
import * as Phaser from 'phaser';
import { GAME_CONFIG } from '../Config/game.config.js';
import { audio } from '../Systems/AudioController.js';

export class Player extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.hp = 1;
    this.maxHp = 1;
    this.lives = GAME_CONFIG.player.startLives;
    this.weaponLevel = 0;
    this.hasShield = false;
    this.invincible = false;
    this.invincibleTimer = null;
    this.isDead = false;
    this.lastFireTime = 0;
    this.fireRate = GAME_CONFIG.player.fireRate;
    this._tipLocalY = -25;
    this.bombCount = 0;

    this._createBody();
    this._createThrustParticles();
    this._setupControls();
    this.setPosition(x, y);
  }

  _createBody() {
    const g = this.scene.add.graphics();
    g.fillStyle(0x00f0ff, 1);
    g.fillTriangle(0, -20, -15, 20, 15, 20);
    g.fillStyle(0x0088aa, 1);
    g.fillTriangle(-8, 5, 8, 5, 0, 20);
    g.lineStyle(2, 0xffffff, 0.8);
    g.strokeTriangle(0, -20, -15, 20, 15, 20);
    g.setPosition(0, 0);
    this.add(g);
    this.setDepth(10);
    this._gfx = g;
  }

  _createThrustParticles() {
    this.thrustEmitter = this.scene.add.particles(0, 18, 'thrust', {
      speed: { min: 60, max: 120 },
      angle: { min: 80, max: 100 },
      scale: { start: 0.6, end: 0 },
      lifespan: 250,
      tint: 0x00aaff,
      emitting: true,
      frequency: 30,
      blendMode: 'ADD'
    });
    this.thrustEmitter.setDepth(5);
    this.add(this.thrustEmitter);
  }

  _setupControls() {
    const cfg = GAME_CONFIG;
    this._targetX = this.x;
    this._targetY = this.y;
    this._lerpFactor = 0.15;
    this.shootOnPointer = true;
    this._mouseDown = false;

    const handleMove = (x, y) => {
      this._targetX = Phaser.Math.Clamp(x, 20, cfg.width - 20);
      this._targetY = Phaser.Math.Clamp(y, 50, cfg.height - 20);
    };

    this.scene.input.on('pointermove', (pointer) => {
      handleMove(pointer.x, pointer.y);
    });

    this.scene.input.on('pointerdown', (pointer) => {
      handleMove(pointer.x, pointer.y);
      if (pointer.button === 0) {
        this._mouseDown = true;
      }
    });

    this.scene.input.on('pointerup', (pointer) => {
      if (pointer.button === 0) {
        this._mouseDown = false;
      }
    });

    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.wasd = this.scene.input.keyboard.addKeys('W,S,A,D,SPACE');
  }

  update() {
    if (!this.scene) return;

    const dx = this._targetX - this.x;
    const dy = this._targetY - this.y;
    this.x += dx * this._lerpFactor;
    this.y += dy * this._lerpFactor;

    const KB_SPEED = 5;
    let kbX = 0, kbY = 0;
    if (this.wasd.A.isDown || this.cursors.left.isDown)  kbX -= KB_SPEED;
    if (this.wasd.D.isDown || this.cursors.right.isDown) kbX += KB_SPEED;
    if (this.wasd.W.isDown || this.cursors.up.isDown)    kbY -= KB_SPEED;
    if (this.wasd.S.isDown || this.cursors.down.isDown)  kbY += KB_SPEED;
    if (kbX !== 0 || kbY !== 0) {
      this._targetX = Phaser.Math.Clamp(this._targetX + kbX, 20, GAME_CONFIG.width - 20);
      this._targetY = Phaser.Math.Clamp(this._targetY + kbY, 20, GAME_CONFIG.height - 20);
    }

    const now = this.scene.time.now;
    if (this._mouseDown && now - this.lastFireTime >= this.fireRate) {
      this.shoot();
      this.lastFireTime = now;
    }
    if (this.wasd.SPACE.isDown && now - this.lastFireTime >= this.fireRate) {
      this.shoot();
      this.lastFireTime = now;
    }
  }

  shoot() {
    if (this.isDead) return;
    const x = this.x;
    const y = this.y + this._tipLocalY;
    this.scene.events.emit('playerShoot', x, y, this.weaponLevel);
    audio.play('shoot');
  }

  addShield() {
    if (this.hasShield) return;
    this.hasShield = true;
    audio.play('shield');
    this.scene.events.emit('showFloatingText', this.x, this.y - 30, 'Shield!', '#0088ff');
  }

  upgradeWeapon() {
    if (this.weaponLevel >= 5) {
      this.scene.events.emit('showFloatingText', this.x, this.y - 30, 'Max Level!', '#ffff00');
      return;
    }
    this.weaponLevel++;
    audio.play('powerup');
    this.scene.events.emit('showFloatingText', this.x, this.y - 30, 'Weapon Lv.' + this.weaponLevel + '!', '#00ff88');
  }

  addBomb() {
    this.bombCount = Math.min((this.bombCount || 0) + 1, 99);
    this.scene.events.emit('showFloatingText', this.x, this.y - 30, '+1 Bomb!', '#ff8800');
  }

  launchMissile() {
    if (this.isDead || !this.scene || (this.bombCount || 0) <= 0) return;
    this.bombCount--;
    audio.play('missile');
    this.scene.events.emit('playerMissile', this.x, this.y + this._tipLocalY);
    this.scene.events.emit('showFloatingText', this.x, this.y - 30, 'Missile launched!', '#ff4400');
  }

  takeDamage() {
    if (this.isDead || this.invincible) return false;

    if (this.hasShield) {
      this.hasShield = false;
      this.scene.events.emit('showFloatingText', this.x, this.y - 30, 'Shield broken!', '#ff8800');
      this.setAlpha(0.5);
      this.scene.time.delayedCall(500, () => this.setAlpha(1));
      return false;
    }

    this.lives--;
    audio.play('hit');
    this.scene.cameras.main.shake(150, 0.005);

    if (this.lives <= 0) {
      this.die();
      return true;
    }

    this.invincible = true;
    this.setAlpha(0.4);
    if (this.invincibleTimer) this.invincibleTimer.remove();
    this.invincibleTimer = this.scene.time.delayedCall(2000, () => {
      this.invincible = false;
      this.setAlpha(1);
    });

    this.scene.events.emit('showFloatingText', this.x, this.y - 30,
      'Life -1 (remaining: ' + this.lives + ')', '#ff4444');
    return false;
  }

  die() {
    this.isDead = true;
    audio.play('explosion');
    this.scene.cameras.main.shake(300, 0.01);
    this.scene.events.emit('playerDeath', this.x, this.y);
    this.setVisible(false);
    if (this.thrustEmitter) this.thrustEmitter.stop();
  }

  reset(x, y) {
    this.isDead = false;
    this.lives = GAME_CONFIG.player.startLives;
    this.weaponLevel = 0;
    this.hasShield = false;
    this.invincible = false;
    this.bombCount = 0;
    this.x = x;
    this.y = y;
    this._targetX = x;
    this._targetY = y;
    this.lastFireTime = 0;
    this.setVisible(true);
    this.setAlpha(1);
    if (this.thrustEmitter) this.thrustEmitter.start();
    if (this.invincibleTimer) this.invincibleTimer.remove();
  }
}