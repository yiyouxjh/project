// ============================================
// 道具系统
// ============================================
import * as Phaser from 'phaser';
import { GAME_CONFIG } from '../Config/game.config.js';
import { audio } from '../Systems/AudioController.js';

const POWERUP_TYPES = ['weapon', 'shield', 'bomb', 'score', 'life'];

export class PowerUp {
  constructor(scene, x, y, type) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.type = type;
    this.speed = 2;
    this.isDead = false;
    this.active = true;
    
    const cfg = GAME_CONFIG.powerUps[type];
    this.color = cfg.color;
    this.label = cfg.label;
    
    // 创建图形
    this.gfx = scene.add.graphics();
    const colorValue = Phaser.Display.Color.HexStringToColor(cfg.color).color;
    this.gfx.fillStyle(colorValue, 1.0);
    this.gfx.fillCircle(0, 0, 35);
    this.gfx.setDepth(8);
    this.gfx.setPosition(x, y);
    
    // 文字标签
    this.txt = scene.add.text(x, y, cfg.label, {
      fontSize: '24px', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(10).setStroke('#000000', 2);
  }
  
  update() {
    if (this.isDead || !this.scene) return;
    
    // 持续下落
    this.y += this.speed;
    this.gfx.setPosition(this.x, this.y);
    this.txt.setPosition(this.x, this.y);
    
    // 超出屏幕底部销毁
    if (this.y > GAME_CONFIG.height + 50) {
      this.destroy();
    }
  }
  
  applyToPlayer(player) {
    if (this.isDead) return;
    this.isDead = true;
    this.active = false;
    
    try { audio.play('powerup'); } catch(e) {}
    
    if (this.scene && this.scene.spawner) {
      this.scene.spawner.registerSeen(this.type);
    }
    if (this.scene && this.scene.ui) {
      this.scene.ui.addPowerupCount(this.type);
    }
    
    switch (this.type) {
      case 'weapon':
        player.upgradeWeapon();
        break;
      case 'shield':
        player.addShield();
        break;
      case 'bomb':
        player.addBomb();
        break;
      case 'score':
        if (this.scene && this.scene.ui) {
          this.scene.ui.addScore(GAME_CONFIG.scoring.powerUpScore);
          try { this.scene.events.emit('showFloatingText', this.x, this.y, '+' + GAME_CONFIG.scoring.powerUpScore, '#ffff00'); } catch(e) {}
        }
        break;
      case 'life':
        if (player.lives < GAME_CONFIG.player.maxLives) {
          player.lives++;
          try { this.scene.events.emit('showFloatingText', this.x, this.y, '+1 Life!', '#ff0088'); } catch(e) {}
        }
        break;
    }
    this.destroy();
  }
  
  destroy() {
    // 即使 isDead 已经设置，也要确保图形被销毁
    if (this.isDead && this.gfx === null && this.txt === null) return;
    this.isDead = true;
    this.active = false;
    
    // 立即销毁图形和文字
    if (this.gfx) { 
      this.gfx.clear();
      this.gfx.destroy(); 
      this.gfx = null; 
    }
    if (this.txt) { 
      this.txt.destroy(); 
      this.txt = null; 
    }
  }
}

export class PowerUpFactory {
  constructor(scene) {
    this.scene = scene;
  }
  
  spawn(x, y, forceType) {
    let chosenType;
    if (forceType && POWERUP_TYPES.includes(forceType)) {
      chosenType = forceType;
    } else {
      const roll = Math.random();
      let cumulative = 0;
      chosenType = 'score';
      for (const type of POWERUP_TYPES) {
        cumulative += GAME_CONFIG.powerUps[type].chance;
        if (roll < cumulative) {
          chosenType = type;
          break;
        }
      }
    }
    return new PowerUp(this.scene, x, y, chosenType);
  }
}
