// ============================================
// Phaser 游戏配置
// ============================================
import * as Phaser from 'phaser';
import { GAME_CONFIG } from './game.config.js';

const config = {
  type: Phaser.AUTO,
  width: GAME_CONFIG.width,
  height: GAME_CONFIG.height,
  backgroundColor: GAME_CONFIG.backgroundColor,
  parent: 'game-container',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_CONFIG.width,
    height: GAME_CONFIG.height,
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { y: 0 }
    }
  },
  scene: [],
  render: {
    antialias: true,
    pixelArt: false,
    roundPixels: true,
  }
};

export default config;
