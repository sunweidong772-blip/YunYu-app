// 用户成长服务：EXP 变更、等级重算、经验流水、每日任务
const db = require('../db');
const { levelFromExp, MAX_LV } = require('./level');

const TASKS = {
  checkin: { name: '每日签到', description: '完成一次签到', exp: 10 },
  post: { name: '发布帖子', description: '在社区发布 1 篇帖子', exp: 15 },
  comment: { name: '发表评论', description: '发表 1 条评论', exp: 5 },
  like: { name: '点赞内容', description: '点赞 1 次内容', exp: 3 },
  browse: { name: '浏览软件', description: '浏览 1 个软件', exp: 2 },
  favorite: { name: '收藏内容', description: '收藏 1 个内容', exp: 4 },
};

// 增加用户 EXP：更新 users.exp、自动重算等级，写经验流水
function addExp(userId, delta, action, description = '') {
  if (!delta) return null;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  if (!user) return null;
  const newExp = user.exp + delta;
  const lvInfo = levelFromExp(newExp);
  const upgraded = lvInfo.lv > user.lv;
  db.prepare("UPDATE users SET exp = ?, lv = ?, updated_at = datetime('now','localtime') WHERE id = ?").run(newExp, lvInfo.lv, userId);
  db.prepare('INSERT INTO experience_logs (user_id, delta, action, description) VALUES (?,?,?,?)').run(userId, delta, action, description);
  if (upgraded) {
    db.prepare('INSERT INTO notifications (user_id, type, title, content, target_type, target_id) VALUES (?,?,?,?,?,?)')
      .run(userId, 'system', '🎉 等级提升', `恭喜你升级到 LV${lvInfo.lv} ${lvInfo.name}！`, 'level', lvInfo.lv);
  }
  return { exp: newExp, lvInfo, upgraded };
}

// 记录每日任务进度，完成后自动发放 EXP
function trackTask(userId, code) {
  const task = db.prepare("SELECT * FROM tasks WHERE code = ? AND status = 'active'").get(code);
  if (!task) return null;
  const today = new Date().toISOString().slice(0, 10);
  let ut = db.prepare('SELECT * FROM user_tasks WHERE user_id = ? AND task_id = ? AND date = ?').get(userId, task.id, today);
  if (!ut) {
    db.prepare('INSERT INTO user_tasks (user_id, task_id, date, progress, completed) VALUES (?,?,?,0,0)').run(userId, task.id, today);
    ut = db.prepare('SELECT * FROM user_tasks WHERE user_id = ? AND task_id = ? AND date = ?').get(userId, task.id, today);
  }
  if (ut.completed && ut.claimed) return { task, alreadyDone: true };
  const progress = Math.min(task.target_count, ut.progress + 1);
  const completed = progress >= task.target_count ? 1 : 0;
  db.prepare('UPDATE user_tasks SET progress = ?, completed = ? WHERE id = ?').run(progress, completed, ut.id);
  let gained = 0;
  if (completed && !ut.claimed) {
    db.prepare('UPDATE user_tasks SET claimed = 1 WHERE id = ?').run(ut.id);
    addExp(userId, task.exp, 'task', `完成任务：${task.name}`);
    gained = task.exp;
  }
  return { task, progress, completed, gained };
}

// 领取已完成任务的奖励（统一入口）
function claimTask(userId, taskId) {
  const ut = db.prepare('SELECT * FROM user_tasks WHERE user_id = ? AND task_id = ?').get(userId, taskId);
  if (!ut) return { ok: false, message: '任务进度不存在' };
  if (!ut.completed) return { ok: false, message: '任务尚未完成' };
  if (ut.claimed) return { ok: false, message: '奖励已领取' };
  db.prepare('UPDATE user_tasks SET claimed = 1 WHERE id = ?').run(ut.id);
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
  addExp(userId, task.exp, 'task', `完成任务：${task.name}`);
  return { ok: true, gained: task.exp };
}

module.exports = { addExp, trackTask, claimTask, TASKS, levelFromExp, MAX_LV };