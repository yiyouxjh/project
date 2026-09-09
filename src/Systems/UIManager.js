// ============================================
// UI 管理器
// ============================================
import * as Phaser from 'phaser';
import { SaveManager } from './SaveManager.js';

export class UIManager {
  constructor(scene) {
    this.scene = scene;
    this.score = 0;
    this.highScore = SaveManager.getHighScore();
    this.elements = {};
    this._createUI();
  }
  
  _createUI() {
    const s = this.scene;
    
    this.elements.score = s.add.text(10, 10, '0', {
      fontSize: '20px', color: '#00f0ff', fontStyle: 'bold'
    }).setDepth(50);
    
    this.elements.highScore = s.add.text(10, 35, 'Best: 0', {
      fontSize: '12px', color: '#888888'
    }).setDepth(50);
    
    this.elements.lives = s.add.text(s.scale.width - 10, 10, '♥♥♥', {
      fontSize: '18px', color: '#ff0088'
    }).setOrigin(1, 0).setDepth(50);
    
    this.elements.level = s.add.text(10, 55, 'Level 1', {
      fontSize: '12px', color: '#00ff88', fontStyle: 'bold'
    }).setDepth(50);
    
    this.elements.wave = s.add.text(s.scale.width - 10, 35, 'Wave 1/15', {
      fontSize: '12px', color: '#888888'
    }).setOrigin(1, 0).setDepth(50);
    
    this.elements.weapon = s.add.text(10, 72, 'Weapon: Lv.0', {
      fontSize: '12px', color: '#00ff88'
    }).setDepth(50);
    
    this.elements.bomb = s.add.text(10, 89, 'Missiles: 0', {
      fontSize: '12px', color: '#ff8800'
    }).setDepth(50);

    // 道具收集计数显示
    this.powerupCounts = { weapon: 0, shield: 0, score: 0, life: 0 };
    this.elements.pupCount = s.add.text(10, 106, 'P:0 S:*:0 H:0', {
      fontSize: '11px', color: '#888888'
    }).setDepth(50);
    
    this.elements.floatingTexts = [];
  }
  
  update(player) {
    if (!player) return;
    this.elements.score.setText(this.score.toString());
    this.elements.lives.setText('♥'.repeat(player.lives) + '♡'.repeat(Math.max(0, player.maxHp - player.lives)));
    this.elements.weapon.setText('Weapon: Lv.' + player.weaponLevel);
    this.elements.bomb.setText('Missiles: ' + (player.bombCount || 0));
    this._updatePowerupCount();
    
    const level = this.scene.spawner ? this.scene.spawner.getLevel() : 1;
    const wave = this.scene.spawner ? this.scene.spawner.currentWave : 1;
    this.elements.level.setText('Level ' + level);
    this.elements.wave.setText('Wave ' + wave + '/15');
  }
  
  _updatePowerupCount() {
    const c = this.powerupCounts;
    const pColor = c.weapon > 0 ? '#00ff88' : '#444444';
    const sColor = c.shield > 0 ? '#0088ff' : '#444444';
    const starColor = c.score > 0 ? '#ffff00' : '#444444';
    const hColor = c.life > 0 ? '#ff0088' : '#444444';
    this.elements.pupCount.setText(
      'P:' + c.weapon + ' S:' + c.shield + ' *:' + c.score + ' H:' + c.life
    );
    this.elements.pupCount.setColor('#888888');
  }
  
  addPowerupCount(type) {
    if (this.powerupCounts[type] !== undefined) {
      this.powerupCounts[type]++;
    }
  }
  
  addScore(points) {
    this.score += points;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      SaveManager.setHighScore(this.highScore);
      this.elements.highScore.setText('Best: ' + this.highScore);
    }
  }
  
  showFloatingText(x, y, text, color = '#ffffff') {
    const ft = this.scene.add.text(x, y, text, {
      fontSize: '14px', color: color, fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 2
    }).setOrigin(0.5).setDepth(60);
    
    this.scene.tweens.add({
      targets: ft, y: y - 40, alpha: 0,
      duration: 1000, onComplete: () => ft.destroy()
    });
  }
  
  showWaveAnnouncement(waveNumber, levelName) {
    const s = this.scene;
    const isBoss = waveNumber % 3 === 0;
    
    const text = isBoss 
      ? (levelName || '') + ' - BOSS!'
      : (levelName || 'Wave') + ' ' + waveNumber;
    
    const ann = s.add.text(s.scale.width / 2, s.scale.height / 2 - 100, text, {
      fontSize: isBoss ? '28px' : '22px',
      color: isBoss ? '#ff0044' : '#00f0ff',
      fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setDepth(60);
    
    s.tweens.add({
      targets: ann, alpha: 0, scale: 1.2,
      delay: 1800, duration: 500,
      onComplete: () => ann.destroy()
    });
  }
}