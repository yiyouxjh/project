// ============================================
// 存档管理器 — localStorage
// ============================================
import { GAME_CONFIG } from '../Config/game.config.js';

export class SaveManager {
  static getHighScore() {
    try {
      return parseInt(localStorage.getItem(GAME_CONFIG.storageKeys.highScore) || '0', 10);
    } catch { return 0; }
  }
  
  static setHighScore(score) {
    try {
      const current = this.getHighScore();
      if (score > current) {
        localStorage.setItem(GAME_CONFIG.storageKeys.highScore, score.toString());
        return true;
      }
    } catch {}
    return false;
  }
  
  static getUnlocked() {
    try {
      return JSON.parse(localStorage.getItem(GAME_CONFIG.storageKeys.unlocked) || '[]');
    } catch { return []; }
  }
  
  static unlock(id) {
    try {
      const list = this.getUnlocked();
      if (!list.includes(id)) {
        list.push(id);
        localStorage.setItem(GAME_CONFIG.storageKeys.unlocked, JSON.stringify(list));
      }
    } catch {}
  }
  
  static clear() {
    try {
      localStorage.removeItem(GAME_CONFIG.storageKeys.highScore);
      localStorage.removeItem(GAME_CONFIG.storageKeys.unlocked);
    } catch {}
  }
}
