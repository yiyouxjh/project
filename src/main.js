// ============================================
// 主入口 — 初始化 Phaser 游戏
// ============================================
import * as Phaser from 'phaser';
import GameConfig from './Config/phaser.config.js';
import { BootScene } from './Game/BootScene.js';
import { MenuScene } from './Game/MenuScene.js';
import { GameScene } from './Game/GameScene.js';
import { PauseScene } from './Game/PauseScene.js';
import { ResultScene } from './Game/ResultScene.js';

// 注册所有场景
GameConfig.scene = [BootScene, MenuScene, GameScene, PauseScene, ResultScene];

// 创建游戏实例
const game = new Phaser.Game(GameConfig);
window.game = game;

// 防止移动端默认滚动
document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

export default game;
