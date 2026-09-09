// ============================================
// MenuScene — 主菜单
// ============================================
import * as Phaser from 'phaser';
import { SaveManager } from '../Systems/SaveManager.js';
import { audio } from '../Systems/AudioController.js';

export class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }
  
  create() {
    audio.init();
    
    // 背景星空滚动
    this._startStarScroll();
    
    // 标题
    const title = this.add.text(this.scale.width / 2, 180, '星际猎手', {
      fontSize: '48px', color: '#00f0ff', fontStyle: 'bold',
      stroke: '#004466', strokeThickness: 6
    }).setOrigin(0.5).setDepth(10);
    
    this.add.text(this.scale.width / 2, 230, 'STAR HUNTER', {
      fontSize: '18px', color: '#0088aa',
      stroke: '#003344', strokeThickness: 3
    }).setOrigin(0.5).setDepth(10);
    
    // 最高分
    const highScore = SaveManager.getHighScore();
    if (highScore > 0) {
      this.add.text(this.scale.width / 2, 280, 'Score: ' + SaveManager.getHighScore(), {
        fontSize: '16px', color: '#ffaa00'
      }).setOrigin(0.5).setDepth(10);
    }
    
    // 开始按钮
    this._createButton(this.scale.width / 2, 380, '开始游戏', () => {
      audio.play('powerup');
      this.scene.start('GameScene');
    });
    
    // 操作说明
    this._createButton(this.scale.width / 2, 450, '操作说明', () => {
      this._showInstructions();
    });
    
    // 操作提示
    this.add.text(this.scale.width / 2, this.scale.height - 60, 
      '鼠标/触摸拖动 · WASD/方向键移动 · 空格射击 · 右上角按钮暂停', {
        fontSize: '12px', color: '#666666'
      }).setOrigin(0.5).setDepth(10);
  }
  
  _startStarScroll() {
    this.stars = [];
    for (let i = 0; i < 50; i++) {
      const star = this.add.circle(
        Math.random() * this.scale.width,
        Math.random() * this.scale.height,
        Math.random() * 1.5 + 0.5,
        0xffffff,
        Math.random() * 0.5 + 0.3
      ).setDepth(-1);
      this.stars.push(star);
    }
    
    this.time.addEvent({
      delay: 16, callback: () => {
        this.stars.forEach(s => {
          s.y += 0.5;
          if (s.y > this.scale.height) { s.y = 0; s.x = Math.random() * this.scale.width; }
        });
      }, loop: true
    });
  }
  
  _createButton(x, y, text, callback) {
    const btn = this.add.container(x, y).setDepth(10);
    
    const bg = this.add.rectangle(0, 0, 200, 50, 0x003344)
      .setAlpha(0.8).setStrokeStyle(2, 0x00f0ff);
    const label = this.add.text(0, 0, text, {
      fontSize: '18px', color: '#00f0ff', fontStyle: 'bold'
    }).setOrigin(0.5);
    
    btn.add([bg, label]);
    btn.setSize(200, 50);
    
    btn.setInteractive({ useHandCursor: true });
    btn.on('pointerover', () => {
      bg.setFillStyle(0x005566);
      label.setColor('#ffffff');
    });
    btn.on('pointerout', () => {
      bg.setFillStyle(0x003344);
      label.setColor('#00f0ff');
    });
    btn.on('pointerdown', callback);
    
    return btn;
  }
  
  _showInstructions() {
    const overlay = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.9)
      .setOrigin(0).setDepth(20);
    
    const instructions = [
      '🎮 操作说明',
      '',
      '• 鼠标/触摸拖动 → 移动战机',
      '• WASD / 方向键 → 移动战机',
      '• 空格键射击',
      '',
      '🎯 收集道具:',
      '• P道具 — 武器升级 (最多 Lv.5)',
      '• S — 护盾 (抵挡一次伤害)',
      '• B — 导弹 (远程追踪打击)',
      '• ★ — 加分 (+100)',
      '• ♥ — 额外生命',
      '',
      '⚠ 每 3 波出现 Boss！每关道具保证齐全',
      '',
      '[ 返回 ]'
    ];
    
    instructions.forEach((line, i) => {
      this.add.text(this.scale.width / 2, 80 + i * 28, line, {
        fontSize: line.includes('🎮') || line.includes('🎯') || line.includes('⚠') 
          ? '16px' : '13px',
        color: line.startsWith('•') ? '#aaaacc' : '#00f0ff',
        fontStyle: line.includes('🎮') || line.includes('🎯') || line.includes('⚠') ? 'bold' : 'normal'
      }).setOrigin(0.5).setDepth(21);
    });
    
    const backBtn = this._createButton(this.scale.width / 2, this.scale.height - 80, '返回', () => {
      overlay.destroy();
      this.children.getChildren().filter(c => c.depth === 21).forEach(c => c.destroy());
    });
  }
}
