// 云屿等级体系定义：LV1-LV15 + 经验阈值
const LEVELS = [
  { lv: 1, name: '新人', minExp: 0 },
  { lv: 2, name: '初来乍到', minExp: 50 },
  { lv: 3, name: '云屿居民', minExp: 150 },
  { lv: 4, name: '活跃居民', minExp: 350 },
  { lv: 5, name: '热心用户', minExp: 700 },
  { lv: 6, name: '云屿达人', minExp: 1250 },
  { lv: 7, name: '资深居民', minExp: 2100 },
  { lv: 8, name: '云屿精英', minExp: 3300 },
  { lv: 9, name: '云屿核心', minExp: 5000 },
  { lv: 10, name: '云屿元老', minExp: 7500 },
  { lv: 11, name: '云屿传说', minExp: 12000 },
  { lv: 12, name: '云屿传奇', minExp: 18000 },
  { lv: 13, name: '云屿宗师', minExp: 26000 },
  { lv: 14, name: '云屿至尊', minExp: 36000 },
  { lv: 15, name: '云屿不朽', minExp: 50000 },
];

const MAX_LV = LEVELS[LEVELS.length - 1].lv;

// 根据 EXP 计算等级；返回等级对象与进度
function levelFromExp(exp) {
  let current = LEVELS[0];
  let next = null;
  for (let i = 0; i < LEVELS.length; i++) {
    if (exp >= LEVELS[i].minExp) {
      current = LEVELS[i];
      next = LEVELS[i + 1] || null;
    }
  }
  const progress = {
    lv: current.lv,
    name: current.name,
    exp,
    currentMin: current.minExp,
    nextMin: next ? next.minExp : null,
    percent: next ? Math.min(100, Math.round(((exp - current.minExp) / (next.minExp - current.minExp)) * 100)) : 100,
  };
  return progress;
}

module.exports = { LEVELS, MAX_LV, levelFromExp };