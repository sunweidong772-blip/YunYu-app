// 用户行为事件埋点接收路由（轻量级，不阻塞主流程）
const express = require('express');
const router = express.Router();
const db = require('../db');
const { ok } = require('../utils/response');
const { optionalAuth } = require('../middleware/auth');

// POST /api/events/track { event_type, event_name, target_type?, target_id?, payload?, session_id? }
// 接收并保存用户行为事件，不返回错误（静默失败不影响用户体验）
router.post('/track', optionalAuth, (req, res) => {
  const body = req.body || {};
  const eventType = String(body.event_type || 'custom').slice(0, 30);
  const eventName = String(body.event_name || 'unknown').slice(0, 50);
  const targetType = String(body.target_type || '').slice(0, 20);
  const targetId = String(body.target_id || '').slice(0, 20);
  const payload = JSON.stringify(body.payload || {});
  const sessionId = String(body.session_id || '').slice(0, 40);
  const userId = req.user ? req.user.id : null;
  const ip = req.ip || '';
  const ua = req.headers['user-agent'] ? String(req.headers['user-agent']).slice(0, 120) : '';

  try {
    db.prepare(
      'INSERT INTO user_events (user_id, session_id, event_type, event_name, target_type, target_id, payload, ip, ua) VALUES (?,?,?,?,?,?,?,?,?)'
    ).run(userId, sessionId, eventType, eventName, targetType, targetId, payload, ip, ua);
    // 实时写入每日汇总（REPLACE 幂等增量）
    const today = new Date().toISOString().slice(0, 10);
    db.prepare(
      `INSERT INTO event_daily_stats (stat_date, event_type, event_name, total_count, unique_sessions, updated_at)
       VALUES (?, ?, ?, 1, 1, datetime('now','localtime'))
       ON CONFLICT(stat_date, event_type, event_name) DO UPDATE SET
       total_count = total_count + 1,
       unique_sessions = MAX(unique_sessions, total_count),
       updated_at = datetime('now','localtime')`
    ).run(today, eventType, eventName);
  } catch (e) {
    // 静默失败，不影响用户
  }
  return ok(res, { tracked: true });
});

module.exports = router;
