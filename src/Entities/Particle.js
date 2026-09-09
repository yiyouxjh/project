// ============================================
// 爆炸粒子特效
// ============================================
import * as Phaser from 'phaser';

export class Explosion {
  constructor(scene, x, y, size = 'medium') {
    this.scene = scene;
    const colors = [0xff4400, 0xff8800, 0xffff00, 0xff0000, 0xffffff];
    
    switch (size) {
      case 'small':
        this._emit(x, y, 8, 100, 200, colors);
        break;
      case 'medium':
        this._emit(x, y, 15, 80, 300, colors);
        break;
      case 'large':
        this._emit(x, y, 30, 120, 500, colors);
        break;
      case 'boss':
        this._emit(x, y, 50, 150, 800, colors);
        break;
      default:
        this._emit(x, y, 15, 100, 300, colors);
    }
  }
  
  _emit(x, y, count, minSpeed, maxSpeed, colors) {
    const lifespan = 400 + Math.random() * 200;
    const emitter = this.scene.add.particles(x, y, 'explosion', {
      speed: { min: minSpeed, max: maxSpeed },
      angle: { min: 0, max: 360 },
      scale: { start: 0.8, end: 0 },
      lifespan: lifespan,
      tint: colors,
      emitting: false,
      quantity: count,
      blendMode: 'ADD'
    });
    emitter.explode();
    
    // 闪光效果
    const flash = this.scene.add.circle(x, y, 5, 0xffffaa).setAlpha(0.8).setDepth(100);
    this.scene.tweens.add({
      targets: flash, scale: 4, alpha: 0,
      duration: 200, onComplete: () => flash.destroy()
    });
    
    // 粒子发射器在粒子全部消失后销毁，避免残留
    this.scene.time.delayedCall(lifespan + 100, () => emitter.destroy());
  }
}
