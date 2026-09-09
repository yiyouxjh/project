// ============================================
// BootScene — 初始化场景
// ============================================
import * as Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }
  
  create() {
    // 创建程序化星空背景
    this._createStarfield();
    
    // 创建通用粒子纹理
    this._createParticles();
    
    this.time.delayedCall(500, () => this.scene.start('MenuScene'));
  }
  
  _createStarfield() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0a0a1a, 1);
    graphics.fillRect(0, 0, this.scale.width, this.scale.height);
    
    // 随机星星
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * this.scale.width;
      const y = Math.random() * this.scale.height;
      const size = Math.random() * 2 + 0.5;
      const alpha = Math.random() * 0.8 + 0.2;
      graphics.fillStyle(0xffffff, alpha);
      graphics.fillCircle(x, y, size);
    }
    graphics.setDepth(-1);
  }
  
  _createParticles() {
    // 使用 graphics 创建粒子纹理
    const makeTexture = (name, drawFn) => {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      drawFn(g);
      g.generateTexture(name, 8, 8);
      g.destroy();
    };
    
    makeTexture('thrust', (g) => {
      g.fillStyle(0x00aaff, 1);
      g.fillCircle(4, 4, 3);
    });
    
    makeTexture('explosion', (g) => {
      g.fillStyle(0xff8800, 1);
      g.fillCircle(4, 4, 3);
    });
  }
}
