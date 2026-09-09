// ============================================
// Boss 敌机
// ============================================
import * as Phaser from 'phaser';
import { audio } from '../Systems/AudioController.js';
import { GAME_CONFIG } from '../Config/game.config.js';

export class Boss extends Phaser.GameObjects.Container {
  constructor(scene, x, y, bossType) {
    super(scene, x, y);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    const cfg = GAME_CONFIG.bosses[bossType] || GAME_CONFIG.bosses.mothership;
    this.bossType = bossType;
    this.hp = cfg.hp;
    this.maxHp = cfg.hp;
    this.speed = cfg.speed;
    this.score = cfg.score;
    this.color = cfg.color;
    this.isDead = false;
    this.currentPhase = 1;
    this.attackTimer = null;
    this.moveTimer = null;
    this.timeOffset = Math.random() * 2000;
    
    this._createBody(cfg);
    this._createHealthBar();
    this._setupBehavior();
    
    this.x = x;
    this.y = -80;
    this.targetY = 100;
    this._entering = true;
    this._enterY = -80;
    this._targetY = 100;
    
    scene.events.once('bossDeath', () => {
      scene.events.removeListener('sceneShutdown', this.destroy, this);
    });
  }
  
  _createBody(cfg) {
    const g = this.scene.add.graphics();
    const c = cfg.color;
    
    g.fillStyle(c, 1);
    g.fillCircle(0, 0, 50);
    g.fillStyle(Phaser.Display.Color.ValueToColor(0x220022).color, 1);
    g.fillCircle(0, 0, 30);
    
    g.fillStyle(c, 0.8);
    g.fillTriangle(-30, -20, -70, 10, -30, 30);
    g.fillTriangle(30, -20, 70, 10, 30, 30);
    
    g.fillStyle(0xffff00, 1);
    g.fillCircle(0, -5, 10);
    g.fillStyle(0xff0000, 1);
    g.fillCircle(0, -5, 5);
    
    g.lineStyle(2, 0xffffff, 0.6);
    g.strokeCircle(0, 0, 50);
    
    this.body = g;
    this.add(g);
    this.setDepth(20);
  }
  
  _createHealthBar() {
    const barWidth = 160;
    const barHeight = 10;
    const barX = -barWidth / 2;
    const barY = -65;
    
    this.healthBarBg = this.scene.add.rectangle(0, barY, barWidth, barHeight, 0x333333)
      .setOrigin(0.5).setDepth(21);
    this.healthBar = this.scene.add.rectangle(barX + barWidth / 2, barY, barWidth, barHeight, this.color)
      .setOrigin(0, 0.5).setDepth(22);
    this.healthBarText = this.scene.add.text(0, barY + 14, '', {
      fontSize: '10px', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(23);
    
    this.add([this.healthBarBg, this.healthBar, this.healthBarText]);
    this._updateHealthBar();
  }
  
  _updateHealthBar() {
    const pct = this.hp / this.maxHp;
    this.healthBar.width = 160 * pct;
    this.healthBar.fillColor = pct > 0.5 ? this.color : (pct > 0.25 ? 0xff8800 : 0xff0000);
    this.healthBarText.setText(Math.ceil(pct * 100) + '%');
  }
  
  _setupBehavior() {
    this.moveTimer = this.scene.time.addEvent({
      delay: 2000, callback: this._changeDirection,
      callbackScope: this, loop: true
    });
    
    this.attackTimer = this.scene.time.addEvent({
      delay: 1500, callback: this._attack,
      callbackScope: this, loop: true
    });
  }
  
  _changeDirection() {
    if (this.isDead) return;
    this.targetX = Phaser.Math.Between(80, GAME_CONFIG.width - 80);
    this.x = this.targetX;
  }
  
  _attack() {
    if (this.isDead) return;
    
    const phase = this.currentPhase;
    const cx = this.x, cy = this.y;
    
    switch (phase) {
      case 1:
        for (let i = -2; i <= 2; i++) {
          const angle = Math.PI / 2 + i * 0.25;
          this.scene.events.emit('enemyFire', cx, cy + 40, angle, 200);
        }
        break;
      case 2:
        for (let i = 0; i < 12; i++) {
          const angle = (Math.PI * 2 / 12) * i;
          this.scene.events.emit('enemyFire', cx, cy, angle + Math.PI / 2, 180);
        }
        break;
      case 3:
        for (let i = 0; i < 5; i++) {
          this.scene.time.delayedCall(i * 200, () => {
            if (!this.isDead) this.scene.events.emit('enemyFire', cx, cy + 40, Math.PI / 2, 300);
          });
        }
        break;
      case 4:
        for (let i = -3; i <= 3; i++) {
          const angle = Math.PI / 2 + i * 0.2;
          this.scene.time.delayedCall(Math.abs(i) * 100, () => {
            if (!this.isDead) this.scene.events.emit('enemyFire', cx, cy + 40, angle, 220);
          });
        }
        break;
    }
  }
  
  update() {
    if (this.isDead || !this.scene) return;
    
    if (this._entering) {
      this.y += (this._targetY - this._enterY) / 60;
      if (this.y >= this._targetY) {
        this.y = this._targetY;
        this._entering = false;
      }
    } else if (this.y < this.targetY) {
      this.y += 1;
    }
    
    const hpPct = this.hp / this.maxHp;
    let newPhase;
    if (this.bossType === 'mothership') {
      if (hpPct < 0.25) newPhase = 4;
      else if (hpPct < 0.5) newPhase = 3;
      else if (hpPct < 0.75) newPhase = 2;
      else newPhase = 1;
    } else {
      if (hpPct < 0.33) newPhase = 4;
      else if (hpPct < 0.6) newPhase = 3;
      else if (hpPct < 0.8) newPhase = 2;
      else newPhase = 1;
    }
    
    if (newPhase !== this.currentPhase) {
      this.currentPhase = newPhase;
      this._onPhaseChange(newPhase);
    }
  }
  
  _onPhaseChange(phase) {
    this.scene.cameras.main.shake(400, 0.01);
    this.scene.events.emit('showFloatingText', this.x, this.y - 80, 'Phase ' + this.currentPhase + '!', '#ffff00');
    audio.play('boss');
    
    if (this.attackTimer) this.attackTimer.remove();
    this.attackTimer = this.scene.time.addEvent({
      delay: Math.max(600, 1500 - phase * 200),
      callback: this._attack, callbackScope: this, loop: true
    });
  }
  
  takeDamage(damage) {
    if (this.isDead) return false;
    this.hp -= damage;
    this._updateHealthBar();
    this.scene.events.emit('enemyHit', this.x, this.y);
    
    if (this.hp <= 0) {
      this.die();
      return true;
    }
    return false;
  }
  
  die() {
    this.isDead = true;
    if (this.attackTimer) this.attackTimer.remove();
    if (this.moveTimer) this.moveTimer.remove();
    
    this.scene.cameras.main.shake(500, 0.02);
    this.scene.events.emit('bossDeath', this.x, this.y, this.score);
    // 显式销毁所有可视对象
    if (this.body) { this.body.destroy(); this.body = null; }
    if (this.healthBarBg) { this.healthBarBg.destroy(); this.healthBarBg = null; }
    if (this.healthBar) { this.healthBar.destroy(); this.healthBar = null; }
    if (this.healthBarText) { this.healthBarText.destroy(); this.healthBarText = null; }
    this.destroy();
  }
}
