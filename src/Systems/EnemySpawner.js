// ============================================
// 敌机生成器 — 波次管理 + 道具保证
// ============================================
import * as Phaser from 'phaser';
import { Enemy } from '../Entities/Enemy.js';
import { Boss } from '../Entities/Boss.js';
import { GAME_CONFIG } from '../Config/game.config.js';

export class EnemySpawner {
  constructor(scene) {
    this.scene = scene;
    this.currentWave = 0;
    this.currentLevel = 1;
    this.totalWaves = GAME_CONFIG.totalWaves;
    this.isBossWave = false;
    this.spawnQueue = [];
    this.spawnTimer = null;
    this.waveActive = false;
    this.seenTypes = new Set();
  }

  getLevel() {
    return Math.ceil(this.currentWave / 3);
  }

  getBossType() {
    return 'level' + this.getLevel();
  }

  startWave(waveNumber) {
    this.currentWave = waveNumber;
    this.waveActive = true;

    if (waveNumber % 3 === 1) {
      this.seenTypes.clear();
    }


    if (waveNumber % 3 === 0) {
      this._startBossWave(waveNumber);
      return;
    }

    const waveConfig = GAME_CONFIG.waves[waveNumber] || GAME_CONFIG.waves[1];
    this.spawnQueue = [];
    this._waveStartTime = this.scene.time.now;

    waveConfig.forEach(group => {
      for (let i = 0; i < group.count; i++) {
        this.spawnQueue.push({
          type: group.type,
          absTime: this._waveStartTime + i * group.interval + Math.random() * 200
        });
      }
    });

    this.spawnQueue.sort((a, b) => a.absTime - b.absTime);
    this._scheduleNextSpawn();
  }

  _startBossWave(waveNumber) {
    this.isBossWave = true;
    const bossType = this.getBossType();
    const level = this.getLevel();
    const levelName = GAME_CONFIG.levelNames[level - 1] || 'Boss Wave';

    this.scene.events.emit('showFloatingText', GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 - 50,
      levelName + ' - BOSS!', '#ff0044');

    const boss = new Boss(this.scene, GAME_CONFIG.width / 2, 0, bossType);
    this.scene.events.emit('bossSpawned', boss);

    this.waveActive = false;
    this._startBossPowerupDrop();
  }

  _startBossPowerupDrop() {
    const dropInterval = 1000;
    const dropTypes = ['weapon', 'shield', 'score', 'life'];
    
    const dropLoop = () => {
      if (!this.isBossWave || !this.scene || (this.scene.boss && this.scene.boss.isDead)) {
        return;
      }
      
      const randomType = dropTypes[Math.floor(Math.random() * dropTypes.length)];
      const x = Phaser.Math.Between(40, GAME_CONFIG.width - 40);
      const y = -20;
      
      const powerUp = this.scene.powerUpFactory.spawn(x, y, randomType);
      powerUp.speed = 4;
      this.scene.powerUps.push(powerUp);
      this.seenTypes.add(randomType);
      
      this.scene.time.delayedCall(dropInterval, dropLoop);
    };
    
    this.scene.time.delayedCall(1000, dropLoop);
  }

  registerSeen(type) {
    this.seenTypes.add(type);
  }

  _scheduleNextSpawn(spawnItem) {
    if (this.spawnQueue.length === 0) return;
    const next = spawnItem || this.spawnQueue[0];
    const delay = Math.max(0, next.absTime - this.scene.time.now);
    this.spawnTimer = this.scene.time.delayedCall(delay, () => {
      this.spawnQueue.shift();
      this._spawnEnemy(next.type);
      this._scheduleNextSpawn();
    });
  }

  _spawnEnemy(type) {
    const x = Phaser.Math.Between(40, GAME_CONFIG.width - 40);
    const y = -30;
    const enemy = new Enemy(this.scene, x, y, type);
    this.scene.enemies.push(enemy);
  }

  isWaveComplete() {
    if (this.isBossWave) return false;
    const allDead = !this.scene.enemies || this.scene.enemies.every(e => e.isDead || !e.active);
    if (this.spawnQueue.length === 0 && this.waveActive && allDead) {
      return true;
    }
    return false;
  }

  destroy() {
    if (this.spawnTimer) this.spawnTimer.remove();
  }
}
