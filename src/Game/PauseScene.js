// ============================================
// PauseScene — 暂停界面
// ============================================
import * as Phaser from 'phaser';

export class PauseScene extends Phaser.Scene {
  constructor() { super('PauseScene'); }

  create() {
    // 半透明遮罩
    this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.7)
      .setOrigin(0).setDepth(10);

    this.add.text(this.scale.width / 2, this.scale.height / 2 - 80, '暂停', {
      fontSize: '40px', color: '#00f0ff', fontStyle: 'bold',
      stroke: '#004466', strokeThickness: 4
    }).setOrigin(0.5).setDepth(11);

    this._createButton(this.scale.width / 2, this.scale.height / 2, '继续游戏', () => {
      this.scene.stop('PauseScene');
      this.scene.resume('GameScene');
    });

    this._createButton(this.scale.width / 2, this.scale.height / 2 + 70, '返回主菜单', () => {
      this.scene.stop('PauseScene');
      this.scene.start('MenuScene');
    });

    this.add.text(this.scale.width / 2, this.scale.height - 60, '按 ESC 继续', {
      fontSize: '12px', color: '#666666'
    }).setOrigin(0.5).setDepth(11);

    // 按 ESC 继续
    this.input.keyboard.on('keydown-Escape', () => {
      this.scene.stop('PauseScene');
      this.scene.resume('GameScene');
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
