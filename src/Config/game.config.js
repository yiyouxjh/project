// ============================================
// 游戏全局配置 — 5 关系统
// ============================================
export const GAME_CONFIG = {
  width: 480,
  height: 800,
  backgroundColor: '#0a0a1a',

  player: {
    startLives: 3,
    maxLives: 5,
    speed: 0,
    bulletDamage: 10,
    fireRate: 200,
  },

  weaponLevels: [
    { name: '单发子弹', color: '#00f0ff', damage: 10 },
    { name: '双发', color: '#00e5ff', damage: 12 },
    { name: '散射', color: '#00d4ff', damage: 8 },
    { name: '激光', color: '#ff00ff', damage: 25 },
    { name: '螺旋弹', color: '#ff00aa', damage: 15 },
    { name: '终极炮', color: '#ffff00', damage: 100 },
  ],

  enemies: {
    scout:  { hp: 30,  speed: 3,  score: 10, color: '#ff4444' },
    fighter:{ hp: 100, speed: 3,  score: 25, color: '#ff8800' },
    bomber: { hp: 200, speed: 2,  score: 50, color: '#ff0088' },
    fast:   { hp: 35,  speed: 5,  score: 15, color: '#ffff00' },
  },

  bosses: {
    level1:  { hp: 3000, speed: 20, score: 500,  color: '#ff0044' },
    level2:  { hp: 4500, speed: 22, score: 800,  color: '#ff4400' },
    level3:  { hp: 6000, speed: 24, score: 1200, color: '#cc00ff' },
    level4:  { hp: 7500, speed: 26, score: 1600, color: '#00aaff' },
    level5:  { hp: 10000, speed: 28, score: 2500, color: '#ff00aa' },
  },

  totalWaves: 15,
  levelsPerGame: 5,

  levelNames: [
    '第 1 关 新兵训练',
    '第 2 关 星际巡逻',
    '第 3 关 深空战斗',
    '第 4 关 决战前夜',
    '第 5 关 终极决战',
  ],

  waves: {
    1: [{ type: 'scout', count: 6, interval: 600 }],
    2: [
      { type: 'scout', count: 6, interval: 500 },
      { type: 'fighter', count: 2, interval: 900 }
    ],
    3: [{ type: 'scout', count: 8, interval: 400 }],
    4: [
      { type: 'scout', count: 8, interval: 400 },
      { type: 'fighter', count: 3, interval: 700 }
    ],
    5: [
      { type: 'fighter', count: 4, interval: 500 },
      { type: 'bomber', count: 2, interval: 1200 }
    ],
    6: [{ type: 'fighter', count: 6, interval: 350 }],
    7: [
      { type: 'scout', count: 10, interval: 300 },
      { type: 'fast', count: 4, interval: 400 },
      { type: 'fighter', count: 3, interval: 600 }
    ],
    8: [
      { type: 'fighter', count: 5, interval: 400 },
      { type: 'bomber', count: 3, interval: 900 },
      { type: 'fast', count: 4, interval: 350 }
    ],
    9: [
      { type: 'fast', count: 8, interval: 250 },
      { type: 'bomber', count: 4, interval: 500 },
      { type: 'fighter', count: 5, interval: 400 }
    ],
    10: [
      { type: 'scout', count: 12, interval: 250 },
      { type: 'fast', count: 8, interval: 250 },
      { type: 'fighter', count: 5, interval: 400 },
      { type: 'bomber', count: 3, interval: 700 }
    ],
    11: [
      { type: 'bomber', count: 4, interval: 500 },
      { type: 'fast', count: 10, interval: 200 },
      { type: 'fighter', count: 6, interval: 350 }
    ],
    12: [
      { type: 'fast', count: 14, interval: 180 },
      { type: 'scout', count: 12, interval: 250 },
      { type: 'fighter', count: 8, interval: 300 },
      { type: 'bomber', count: 5, interval: 500 }
    ],
    13: [
      { type: 'fast', count: 14, interval: 180 },
      { type: 'fighter', count: 8, interval: 300 },
      { type: 'bomber', count: 5, interval: 500 }
    ],
  },

  powerUps: {
    weapon: { color: '#00ff88', chance: 0.0845, label: 'P' },
    shield: { color: '#0088ff', chance: 0.0563, label: 'S' },
    bomb:   { color: '#ff8800', chance: 0.0282, label: 'B' },
    score:  { color: '#ffff00', chance: 0.1127, label: '*' },
    life:   { color: '#ff0088', chance: 0.0113, label: 'H' },
  },

  scoring: {
    powerUpScore: 100,
    bossKillBonus: 500,
  },

  storageKeys: {
    highScore: 'starhunter_highscore',
    unlocked: 'starhunter_unlocked',
  }
};




