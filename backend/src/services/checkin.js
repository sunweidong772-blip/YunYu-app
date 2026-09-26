// 签到服务：今日签到、连续签到计算、奖励发放、月日历
const db = require('../db');
const { addExp } = require('./growth');

// 签到奖励规则（与 CheckInReward 配置一致，动态查询）
function rewardForDay(day) {
  let r = db.prepare('SELECT * FROM checkin_rewards WHERE day = ?').get(day);
  if (!r) {
    const base = Math.min(10 + (day - 1) * 5, 50);
    const bonus = day % 7 === 0 ? 30 : 0;
    return { day, exp: base, bonus_exp: bonus };
  }
  return r;
}

// 执行签到
function doCheckin(userId) {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  if (!user) return { ok: false, message: '用户不存在' };

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  // 同一天不能重复签到
  const existed = db.prepare('SELECT * FROM checkins WHERE user_id = ? AND date = ?').get(userId, todayStr);
  if (existed) return { ok: false, message: '今天已经签到过了', data: { done: true } };

  // 计算连续天数：昨天是否签到
  const yesterday = new Date(today.getTime() - 86400000).toISOString().slice(0, 10);
  let streak = user.last_checkin_date === yesterday ? user.checkin_streak + 1 : 1;

  const reward = rewardForDay(streak);
  const totalExp = reward.exp + reward.bonus_exp;

  db.prepare('INSERT INTO checkins (user_id, date, day, reward_exp) VALUES (?,?,?,?)')
    .run(userId, todayStr, streak, totalExp);
  db.prepare("UPDATE users SET checkin_streak = ?, checkin_total = checkin_total + 1, last_checkin_date = ?, updated_at = datetime('now','localtime') WHERE id = ?")
    .run(streak, todayStr, userId);

  const result = addExp(userId, totalExp, 'checkin', `第 ${streak} 天签到${reward.bonus_exp ? '（含连续奖励 +' + reward.bonus_exp + '）' : ''}`);

  const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  return {
    ok: true,
    data: {
      streak,
      total: updated.checkin_total,
      reward: totalExp,
      baseExp: reward.exp,
      bonusExp: reward.bonus_exp,
      date: todayStr,
      exp: updated.exp,
      lv: updated.lv,
      upgraded: result ? result.upgraded : false,
      lvInfo: result ? result.lvInfo : null,
    },
  };
}

// 获取月签到日历
function monthCheckins(userId, year, month) {
  const ym = `${year}-${String(month).padStart(2, '0')}`;
  const rows = db.prepare("SELECT date FROM checkins WHERE user_id = ? AND date LIKE ?").all(userId, `${ym}%`);
  return rows.map((r) => r.date);
}

module.exports = { doCheckin, monthCheckins, rewardForDay };