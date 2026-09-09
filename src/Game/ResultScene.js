// ============================================
// ResultScene — 结算界面
// ============================================
import * as Phaser from 'phaser';
import { SaveManager } from '../Systems/SaveManager.js';

export class ResultScene extends Phaser.Scene {
  constructor() { super('ResultScene'); }
  
  create(data) {
    const { score, isVictory, highScore } = data;
    const isNewRecord = score >= highScore && score > 0;
    
    // 遮罩
    this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.85)
      .setOrigin(0).setDepth(10);
    
    // 标题
    const title = isVictory ? '🎉 胜利! 🎉' : '💥 游戏结束';
    this.add.text(this.scale.width / 2, 150, title, {
      fontSize: '32px', color: isVictory ? '#ffff00' : '#ff4444',
      fontStyle: 'bold', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setDepth(11);
    
    // 分数
    this.add.text(this.scale.width / 2, 230, '得分', {
      fontSize: '16px', color: '#888888'
    }).setOrigin(0.5).setDepth(11);
    
    this.add.text(this.scale.width / 2, 270, score.toString(), {
      fontSize: '48px', color: '#00f0ff', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(11);
    
    if (isNewRecord) {
      this.add.text(this.scale.width / 2, 310, '★ 新纪录! ★', {
        fontSize: '18px', color: '#ffaa00', fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(11);
    }
    
    // 最高分
    this.add.text(this.scale.width / 2, 360, 'Best: ' + highScore, {
      fontSize: '14px', color: '#666666'
    }).setOrigin(0.5).setDepth(11);
    
    // 按钮
    this._createButton(this.scale.width / 2, 440, '再来一局', () => {
      this.scene.start('GameScene');
    });
    
    this._createButton(this.scale.width / 2, 510, '返回主菜单', () => {
      this.scene.start('MenuScene');
    });
  }
  
  _createButton(x, y, text, callback) {
    const btn = this.add.container(x, y).setDepth(11);
    const bg = this.add.rectangle(0, 0, 220, 50, 0x003344)
      .setAlpha(0.9).setStrokeStyle(2, 0x00f0ff);
    const label = this.add.text(0, 0, text, {
      fontSize: '16px', color: '#00f0ff', fontStyle: 'bold'
    }).setOrigin(0.5);
    btn.add([bg, label]);
    btn.setSize(220, 50);
    btn.setInteractive({ useHandCursor: true });
    btn.on('pointerover', () => { bg.setFillStyle(0x005566); label.setColor('#fff'); });
    btn.on('pointerout', () => { bg.setFillStyle(0x003344); label.setColor('#00f0ff'); });
    btn.on('pointerdown', callback);
    return btn;
  }
}
