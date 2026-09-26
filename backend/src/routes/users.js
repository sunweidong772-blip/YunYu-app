// 用户路由：个人资料、主页、关注/粉丝、签到、任务、消息、通知
const express = require('express');
const router = express.Router();
const db = require('../db');
const { ok, fail, pageParams, pageResult } = require('../utils/response');
const { publicUser, requireAuth, optionalAuth } = require('../middleware/auth');
const { doCheckin, monthCheckins, rewardForDay } = require('../services/checkin');
const { trackTask } = require('../services/growth');
const { levelFromExp, MAX_LV } = require('../services/level');

function userBrief(u, viewer = null) {
  const b = publicUser(u);
  if (viewer && viewer.id !== u.id) {
    b.isFollowing = !!db.prepare('SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?').get(viewer.id, u.id);
  } else {
    b.isFollowing = false;
  }
  return b;
}

// 我的信息
router.get('/me', requireAuth, (req, res) => {
  const u = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  const admin = db.prepare('SELECT * FROM admins WHERE user_id = ?').get(u.id);
  let adminInfo = null;
  if (admin) {
    const role = db.prepare('SELECT * FROM roles WHERE id = ?').get(admin.role_id);
    adminInfo = { title: admin.title, roleCode: role ? role.code : '', roleName: role ? role.name : '' };
  }
  const today = new Date().toISOString().slice(0, 10);
  const checkedToday = !!db.prepare('SELECT 1 FROM checkins WHERE user_id = ? AND date = ?').get(u.id, today);
  const unreadCount = db.prepare('SELECT COUNT(*) c FROM notifications WHERE user_id = ? AND is_read = 0').get(u.id).c;
  return ok(res, {
    ...publicUser(u),
    email: u.email,
    email_verified: u.email_verified,
    status: u.status,
    admin: adminInfo,
    checkedToday,
    unreadCount,
    followCount: db.prepare('SELECT COUNT(*) c FROM follows WHERE follower_id = ?').get(u.id).c,
    followerCount: db.prepare('SELECT COUNT(*) c FROM follows WHERE following_id = ?').get(u.id).c,
  });
});

// 我的邀请码与统计
router.get('/me/invite-code', requireAuth, (req, res) => {
  const user = req.user;
  const refCode = user.uid;
  const exists = db.prepare('SELECT * FROM invite_tracks WHERE inviter_id = ? AND ref_code = ?').get(user.id, refCode);
  if (!exists) {
    db.prepare('INSERT INTO invite_tracks (inviter_id, ref_code, status) VALUES (?,?,?)').run(user.id, refCode, 'pending');
  }
  return ok(res, { refCode, inviteUrl: '/register?ref=' + refCode });
});

router.get('/me/invite-stats', requireAuth, (req, res) => {
  const user = req.user;
  const total = db.prepare('SELECT COUNT(*) c FROM invite_tracks WHERE inviter_id = ?').get(user.id).c;
  const registered = db.prepare("SELECT COUNT(*) c FROM invite_tracks WHERE inviter_id = ? AND status = 'registered'").get(user.id).c;
  const rewarded = db.prepare("SELECT COUNT(*) c FROM invite_tracks WHERE inviter_id = ? AND status = 'rewarded'").get(user.id).c;
  return ok(res, { total, registered, rewarded });
});

// 用户主页（公开信息，邮箱不展示）
router.get('/:id(\\d+)', optionalAuth, (req, res) => {
  const u = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!u) return fail(res, '用户不存在', 1, 404);
  const viewer = req.user && req.user.id !== u.id ? req.user : null;
  const level = levelFromExp(u.exp);
  const postCount = db.prepare(`SELECT COUNT(*) c FROM posts WHERE user_id = ? AND status != 'deleted'`).get(u.id).c;
  const commentCount = db.prepare(`SELECT COUNT(*) c FROM comments WHERE user_id = ? AND status != 'deleted'`).get(u.id).c;
  const favoriteCount = db.prepare("SELECT COUNT(*) c FROM favorites WHERE user_id = ? AND target_type='software'").get(u.id).c;
  const followCount = db.prepare('SELECT COUNT(*) c FROM follows WHERE follower_id = ?').get(u.id).c;
  const followerCount = db.prepare('SELECT COUNT(*) c FROM follows WHERE following_id = ?').get(u.id).c;
  const likeCount = db.prepare(
    "SELECT COUNT(*) c FROM likes WHERE target_type='post' AND target_id IN (SELECT id FROM posts WHERE user_id = ?)"
  ).get(u.id).c;

  // activeTimeline: 最近 20 条综合操作记录
  const timeline = [
    ...db.prepare(`SELECT 'post' as type, id, title as content, created_at FROM posts WHERE user_id = ? AND status != 'deleted' ORDER BY id DESC LIMIT 20`).all(u.id),
    ...db.prepare(`SELECT 'comment' as type, id, content, created_at FROM comments WHERE user_id = ? AND status != 'deleted' ORDER BY id DESC LIMIT 20`).all(u.id),
    ...db.prepare(`SELECT 'like' as type, id, target_type || ':' || target_id as content, created_at FROM likes WHERE user_id = ? ORDER BY id DESC LIMIT 20`).all(u.id),
    ...db.prepare(`SELECT 'checkin' as type, id, '签到第 ' || day || ' 天' as content, created_at FROM checkins WHERE user_id = ? ORDER BY id DESC LIMIT 20`).all(u.id),
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 20);

  // contributionHeatmap: 最近 365 天
  const heatmapRows = db.prepare(`
    SELECT date(created_at) as day, COUNT(*) as count FROM (
      SELECT created_at FROM posts WHERE user_id = ? AND status != 'deleted'
      UNION ALL
      SELECT created_at FROM comments WHERE user_id = ? AND status != 'deleted'
      UNION ALL
      SELECT created_at FROM likes WHERE user_id = ?
    ) GROUP BY day ORDER BY day
  `).all(u.id, u.id, u.id);
  const contributionHeatmap = heatmapRows.map(r => ({ date: r.day, count: r.count }));

  // userTags: TOP 5 话题标签
  const tagRows = db.prepare(`
    SELECT t.name as tag, COUNT(*) as cnt
    FROM posts p JOIN topics t ON t.id = p.topic_id
    WHERE p.user_id = ? AND p.status != 'deleted'
    GROUP BY t.name ORDER BY cnt DESC LIMIT 5
  `).all(u.id);
  const userTags = tagRows.map(r => r.tag);

  return ok(res, {
    ...userBrief(u, viewer),
    level, followCount, followerCount, likeCount, postCount, commentCount, favoriteCount,
    recentPosts: db.prepare(`SELECT id, title, like_count, comment_count, created_at FROM posts WHERE user_id = ? AND status != 'deleted' ORDER BY id DESC LIMIT 6`).all(u.id),
    activeTimeline: timeline,
    contributionHeatmap,
    userTags,
  });
});

// 修改资料
router.put('/profile', requireAuth, (req, res) => {
  const { nickname, bio, avatar } = req.body || {};
  const updates = [];
  const params = [];
  if (nickname !== undefined) {
    const nick = String(nickname).trim();
    if (nick.length < 2 || nick.length > 16) return fail(res, '昵称长度需在 2-16 个字符之间', 1, 400);
    const dup = db.prepare('SELECT * FROM users WHERE nickname = ? AND id != ?').get(nick, req.user.id);
    if (dup) return fail(res, '该昵称已被使用，请换一个昵称', 1, 400);
    updates.push('nickname = ?'); params.push(nick);
  }
  if (bio !== undefined) {
    if (String(bio).length > 120) return fail(res, '个性签名不能超过 120 字', 1, 400);
    updates.push('bio = ?'); params.push(String(bio).trim());
  }
  if (avatar !== undefined) {
    updates.push('avatar = ?'); params.push(String(avatar).slice(0, 30));
  }
  if (!updates.length) return fail(res, '没有需要修改的内容', 1, 400);
  params.push(req.user.id);
  db.prepare(`UPDATE users SET ${updates.join(',')}, updated_at = datetime('now','localtime') WHERE id = ?`).run(...params);
  const u = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  return ok(res, publicUser(u), '资料已更新');
});

// 我的帖子
router.get('/me/posts', requireAuth, (req, res) => {
  const { page, pageSize, offset } = pageParams(req);
  const uid = req.user.id;
  const total = db.prepare(`SELECT COUNT(*) c FROM posts WHERE user_id = ? AND status != 'deleted'`).get(uid).c;
  const rows = db.prepare(`
    SELECT p.*, u.nickname, u.avatar, u.lv,
      (SELECT COUNT(*) FROM likes l WHERE l.target_type='post' AND l.target_id = p.id) AS like_total
    FROM posts p JOIN users u ON u.id = p.user_id
    WHERE p.user_id = ? AND p.status != 'deleted' ORDER BY p.id DESC LIMIT ? OFFSET ?
  `).all(uid, pageSize, offset);
  return ok(res, pageResult(rows, total, page, pageSize));
});

// 我的评论
router.get('/me/comments', requireAuth, (req, res) => {
  const { page, pageSize, offset } = pageParams(req);
  const uid = req.user.id;
  const total = db.prepare(`SELECT COUNT(*) c FROM comments WHERE user_id = ? AND status != 'deleted'`).get(uid).c;
  const rows = db.prepare(`
    SELECT c.*, p.title AS post_title, p.id AS post_id
    FROM comments c JOIN posts p ON p.id = c.post_id
    WHERE c.user_id = ? AND c.status != 'deleted' ORDER BY c.id DESC LIMIT ? OFFSET ?
  `).all(uid, pageSize, offset);
  return ok(res, pageResult(rows, total, page, pageSize));
});

// 我的收藏
router.get('/me/favorites', requireAuth, (req, res) => {
  const { page, pageSize, offset } = pageParams(req);
  const uid = req.user.id;
  const total = db.prepare('SELECT COUNT(*) c FROM favorites WHERE user_id = ?').get(uid).c;
  const rows = db.prepare(`
    SELECT f.id AS fav_id, f.target_type, f.target_id, f.created_at,
      CASE WHEN f.target_type='post' THEN (SELECT p.title FROM posts p WHERE p.id = f.target_id)
           ELSE (SELECT s.name FROM software s WHERE s.id = f.target_id) END AS name,
      CASE WHEN f.target_type='post' THEN (SELECT p.content FROM posts p WHERE p.id = f.target_id)
           ELSE (SELECT s.summary FROM software s WHERE s.id = f.target_id) END AS summary
    FROM favorites f WHERE f.user_id = ? ORDER BY f.id DESC LIMIT ? OFFSET ?
  `).all(uid, pageSize, offset);
  return ok(res, pageResult(rows, total, page, pageSize));
});

// 我的关注 / 粉丝
router.get('/me/following', requireAuth, (req, res) => {
  const rows = db.prepare(`
    SELECT u.id, u.uid, u.nickname, u.avatar, u.bio, u.lv, u.exp
    FROM follows f JOIN users u ON u.id = f.following_id WHERE f.follower_id = ? ORDER BY f.id DESC
  `).all(req.user.id);
  return ok(res, rows);
});

router.get('/me/followers', requireAuth, (req, res) => {
  const rows = db.prepare(`
    SELECT u.id, u.uid, u.nickname, u.avatar, u.bio, u.lv, u.exp
    FROM follows f JOIN users u ON u.id = f.follower_id WHERE f.following_id = ? ORDER BY f.id DESC
  `).all(req.user.id);
  return ok(res, rows);
});

// 关注 / 取消关注
router.post('/follow/:id', requireAuth, (req, res) => {
  const targetId = parseInt(req.params.id, 10);
  if (targetId === req.user.id) return fail(res, '不能关注自己', 1, 400);
  const target = db.prepare('SELECT * FROM users WHERE id = ?').get(targetId);
  if (!target) return fail(res, '用户不存在', 1, 404);
  const exists = db.prepare('SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?').get(req.user.id, targetId);
  if (exists) return fail(res, '你已经关注该用户了', 1, 400);
  db.prepare('INSERT INTO follows (follower_id, following_id) VALUES (?,?)').run(req.user.id, targetId);
  db.prepare('INSERT INTO notifications (user_id, type, actor_id, title, content, target_type, target_id) VALUES (?,?,?,?,?,?,?)')
    .run(targetId, 'follow', req.user.id, '', `${req.user.nickname} 关注了你`, 'user', req.user.id);
  return ok(res, { isFollowing: true }, '关注成功');
});

router.delete('/follow/:id', requireAuth, (req, res) => {
  const targetId = parseInt(req.params.id, 10);
  db.prepare('DELETE FROM follows WHERE follower_id = ? AND following_id = ?').run(req.user.id, targetId);
  return ok(res, { isFollowing: false }, '已取消关注');
});

// 今日签到
router.post('/checkin', requireAuth, (req, res) => {
  const r = doCheckin(req.user.id);
  if (!r.ok) return fail(res, r.message, 1, 400);
  trackTask(req.user.id, 'checkin');
  // 读取签到后的最新用户数据（含任务奖励），保证 EXP/等级立即同步
  const fresh = db.prepare('SELECT exp, lv FROM users WHERE id = ?').get(req.user.id);
  if (fresh) {
    r.data.exp = fresh.exp;
    r.data.lv = fresh.lv;
  }
  return ok(res, r.data, '签到成功');
});

// 签到状态 + 月日历
router.get('/checkin/status', requireAuth, (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const done = !!db.prepare('SELECT 1 FROM checkins WHERE user_id = ? AND date = ?').get(req.user.id, today);
  const year = parseInt(req.query.year, 10) || new Date().getFullYear();
  const month = parseInt(req.query.month, 10) || new Date().getMonth() + 1;
  const days = monthCheckins(req.user.id, year, month);
  const rewards = db.prepare('SELECT * FROM checkin_rewards ORDER BY day').all();
  return ok(res, { done, streak: req.user.checkin_streak, total: req.user.checkin_total, days, rewards, level: levelFromExp(req.user.exp) });
});

// 等级中心
router.get('/levels', (req, res) => {
  const { LEVELS } = require('../services/level');
  return ok(res, LEVELS);
});

// 每日任务列表 + 进度
router.get('/tasks', requireAuth, (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const tasks = db.prepare(`SELECT * FROM tasks WHERE status = 'active' ORDER BY sort`).all();
  const list = tasks.map((t) => {
    const ut = db.prepare('SELECT * FROM user_tasks WHERE user_id = ? AND task_id = ? AND date = ?').get(req.user.id, t.id, today);
    return { ...t, progress: ut ? ut.progress : 0, completed: ut ? ut.completed : 0, claimed: ut ? ut.claimed : 0 };
  });
  const doneCount = list.filter((t) => t.completed).length;
  const expToday = db.prepare(
    "SELECT COALESCE(SUM(delta),0) s FROM experience_logs WHERE user_id = ? AND date(created_at) = date('now','localtime')"
  ).get(req.user.id).s;
  // 可领取奖励数
  const claimable = list.filter((t) => t.completed && !t.claimed).length;
  return ok(res, { list, doneCount, total: list.length, expToday, claimable });
});

// 领取任务奖励
router.post('/tasks/:id/claim', requireAuth, (req, res) => {
  const ut = db.prepare('SELECT * FROM user_tasks WHERE user_id = ? AND task_id = ? AND date = ?').get(req.user.id, req.params.id, new Date().toISOString().slice(0, 10));
  if (!ut) return fail(res, '任务进度不存在', 1, 400);
  if (!ut.completed) return fail(res, '任务尚未完成', 1, 400);
  if (ut.claimed) return fail(res, '奖励已领取', 1, 400);
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  db.prepare('UPDATE user_tasks SET claimed = 1 WHERE id = ?').run(ut.id);
  const { addExp } = require('../services/growth');
  addExp(req.user.id, task.exp, 'task', `完成任务：${task.name}`);
  return ok(res, { gained: task.exp }, `领取成功 +${task.exp} EXP`);
});

// 消息：通知列表
router.get('/notifications', requireAuth, (req, res) => {
  const { page, pageSize, offset } = pageParams(req, { pageSize: 30 });
  const uid = req.user.id;
  const type = req.query.type;
  let where = 'user_id = ?';
  const params = [uid];
  if (type && type !== 'all') { where += ' AND type = ?'; params.push(type); }
  const total = db.prepare(`SELECT COUNT(*) c FROM notifications WHERE ${where}`).get(...params).c;
  const rows = db.prepare(`
    SELECT n.*, u.nickname AS actor_name, u.avatar AS actor_avatar
    FROM notifications n LEFT JOIN users u ON u.id = n.actor_id
    WHERE ${where} ORDER BY n.id DESC LIMIT ? OFFSET ?
  `).all(...params, pageSize, offset);
  return ok(res, pageResult(rows, total, page, pageSize));
});

// 标记通知已读
router.post('/notifications/read', requireAuth, (req, res) => {
  const { id } = req.body || {};
  if (id) db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(id, req.user.id);
  else db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(req.user.id);
  const unread = db.prepare('SELECT COUNT(*) c FROM notifications WHERE user_id = ? AND is_read = 0').get(req.user.id).c;
  return ok(res, { unread }, '已读');
});

// 全部已读
router.post('/notifications/read-all', requireAuth, (req, res) => {
  db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(req.user.id);
  return ok(res, { unread: 0 }, '全部已读');
});

// 私信会话列表
router.get('/conversations', requireAuth, (req, res) => {
  const uid = req.user.id;
  const rows = db.prepare(`
    SELECT other.id AS user_id, other.nickname, other.avatar, other.lv,
      (SELECT content FROM messages m WHERE (m.sender_id = ? AND m.receiver_id = other.id) OR (m.sender_id = other.id AND m.receiver_id = ?) ORDER BY m.id DESC LIMIT 1) AS last_content,
      (SELECT m.created_at FROM messages m WHERE (m.sender_id = ? AND m.receiver_id = other.id) OR (m.sender_id = other.id AND m.receiver_id = ?) ORDER BY m.id DESC LIMIT 1) AS last_time,
      (SELECT COUNT(*) FROM messages m WHERE m.sender_id = other.id AND m.receiver_id = ? AND m.is_read = 0) AS unread
    FROM (
      SELECT DISTINCT CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END AS other_id
      FROM messages WHERE sender_id = ? OR receiver_id = ?
    ) conv JOIN users other ON other.id = conv.other_id
  `).all(uid, uid, uid, uid, uid, uid, uid, uid);
  return ok(res, rows);
});

// 与某人的聊天记录
router.get('/messages/:userId', requireAuth, (req, res) => {
  const otherId = parseInt(req.params.userId, 10);
  db.prepare('UPDATE messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ?').run(otherId, req.user.id);
  const rows = db.prepare(`
    SELECT * FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
    ORDER BY id DESC LIMIT 100
  `).all(req.user.id, otherId, otherId, req.user.id).reverse();
  return ok(res, rows);
});

// 发送私信
router.post('/messages', requireAuth, (req, res) => {
  const { to, content } = req.body || {};
  const targetId = parseInt(to, 10);
  if (!targetId || !content) return fail(res, '参数不完整', 1, 400);
  const target = db.prepare('SELECT * FROM users WHERE id = ?').get(targetId);
  if (!target) return fail(res, '用户不存在', 1, 404);
  db.prepare('INSERT INTO messages (sender_id, receiver_id, content) VALUES (?,?,?)').run(req.user.id, targetId, String(content).slice(0, 1000));
  db.prepare('INSERT INTO notifications (user_id, type, actor_id, title, content, target_type, target_id) VALUES (?,?,?,?,?,?,?)')
    .run(targetId, 'message', req.user.id, '', `收到来自 ${req.user.nickname} 的私信`, 'message', req.user.id);
  return ok(res, null, '私信已发送');
});

// 未读数量汇总（消息 Tab 红点）
router.get('/unread-summary', requireAuth, (req, res) => {
  const uid = req.user.id;
  const notifUnread = db.prepare('SELECT COUNT(*) c FROM notifications WHERE user_id = ? AND is_read = 0').get(uid).c;
  const msgUnread = db.prepare('SELECT COUNT(*) c FROM messages WHERE receiver_id = ? AND is_read = 0').get(uid).c;
  return ok(res, { notifications: notifUnread, messages: msgUnread, total: notifUnread + msgUnread });
});

// ============ 用户收藏专题（基于收藏的软件整理生成） ============

function collectionSoftwareList(ids) {
  const arr = Array.isArray(ids) ? ids.filter((x) => Number.isInteger(x) || /^\d+$/.test(String(x))).map(Number) : [];
  if (!arr.length) return [];
  const rows = db.prepare(
    `SELECT id, name, icon, icon_color, summary, version, size, developer, rating, rating_count, download_count, favorite_count
     FROM software WHERE id IN (${arr.map(() => '?').join(',')}) AND status = 'normal'`
  ).all(...arr);
  const byId = new Map(rows.map((r) => [r.id, r]));
  return arr.map((id) => byId.get(id)).filter(Boolean);
}

// 我的专题列表
router.get('/me/collections', requireAuth, (req, res) => {
  const rows = db.prepare("SELECT c.*, u.nickname FROM user_collections c JOIN users u ON u.id = c.user_id WHERE c.user_id = ? AND c.status = 'normal' ORDER BY c.id DESC").all(req.user.id);
  const list = rows.map((c) => {
    const ids = JSON.parse(c.software_ids || '[]');
    return { ...c, software_ids: ids, software_list: collectionSoftwareList(ids) };
  });
  return ok(res, list);
});

// 创建专题（软件 id 数组，可含不在收藏中的软件）
router.post('/me/collections', requireAuth, (req, res) => {
  const { name, summary, softwareIds, coverColor, isPublic } = req.body || {};
  const n = String(name || '').trim();
  if (!n) return fail(res, '请输入专题名称', 1, 400);
  if (n.length > 30) return fail(res, '专题名称不能超过 30 字', 1, 400);
  const ids = Array.isArray(softwareIds) ? softwareIds.filter((x) => Number.isInteger(x) || /^\d+$/.test(String(x))).map(Number).slice(0, 30) : [];
  if (!ids.length) return fail(res, '请至少选择一款软件', 1, 400);
  const info = db.prepare(
    'INSERT INTO user_collections (user_id, name, summary, cover_color, software_ids, software_count, is_public) VALUES (?,?,?,?,?,?,?)'
  ).run(req.user.id, n, String(summary || '').slice(0, 200), String(coverColor || '#5B8DEF'), JSON.stringify(ids), ids.length, isPublic === false ? 0 : 1);
  const c = db.prepare("SELECT c.*, u.nickname FROM user_collections c JOIN users u ON u.id = c.user_id WHERE c.id = ?").get(info.lastInsertRowid);
  return ok(res, { ...c, software_ids: ids, software_list: collectionSoftwareList(ids) }, '专题创建成功');
});

// 专题详情（公开专题可匿名查看；私有仅本人）
router.get('/collections/:id', optionalAuth, (req, res) => {
  const c = db.prepare("SELECT c.*, u.nickname FROM user_collections c JOIN users u ON u.id = c.user_id WHERE c.id = ? AND c.status = 'normal'").get(req.params.id);
  if (!c) return fail(res, '专题不存在', 1, 404);
  if (!c.is_public && (!req.user || req.user.id !== c.user_id)) return fail(res, '该专题不公开', 403, 403);
  const ids = JSON.parse(c.software_ids || '[]');
  return ok(res, { ...c, software_ids: ids, software_list: collectionSoftwareList(ids) });
});

// 专题关注（关注/取消关注）
router.post('/me/collections/:id/follow', requireAuth, (req, res) => {
  const c = db.prepare('SELECT * FROM user_collections WHERE id = ? AND status = \'normal\'').get(req.params.id);
  if (!c) return fail(res, '专题不存在', 1, 404);
  if (!c.is_public && c.user_id !== req.user.id) return fail(res, '该专题不公开', 403, 403);
  try {
    db.prepare('INSERT INTO collection_follows (user_id, collection_id) VALUES (?,?)').run(req.user.id, c.id);
  } catch (e) {
    // UNIQUE 冲突 = 已关注，静默处理
  }
  const followCount = db.prepare('SELECT COUNT(*) c FROM collection_follows WHERE collection_id = ?').get(c.id).c;
  return ok(res, { is_followed: true, follow_count: followCount }, '关注成功');
});

router.delete('/me/collections/:id/follow', requireAuth, (req, res) => {
  db.prepare('DELETE FROM collection_follows WHERE user_id = ? AND collection_id = ?').run(req.user.id, req.params.id);
  const followCount = db.prepare('SELECT COUNT(*) c FROM collection_follows WHERE collection_id = ?').get(req.params.id).c;
  return ok(res, { is_followed: false, follow_count: followCount }, '已取消关注');
});

// 我关注的专题列表
router.get('/me/followed-collections', requireAuth, (req, res) => {
  const rows = db.prepare(`
    SELECT c.*, u.nickname FROM collection_follows f
    JOIN user_collections c ON c.id = f.collection_id
    JOIN users u ON u.id = c.user_id
    WHERE f.user_id = ? AND c.status = 'normal'
    ORDER BY f.id DESC
  `).all(req.user.id);
  const list = rows.map((c) => {
    const ids = JSON.parse(c.software_ids || '[]');
    return { ...c, software_ids: ids, software_list: collectionSoftwareList(ids) };
  });
  return ok(res, list);
});

// 修改公开专题详情：追加 is_followed
router.get('/collections/:id', optionalAuth, (req, res) => {
  const c = db.prepare("SELECT c.*, u.nickname FROM user_collections c JOIN users u ON u.id = c.user_id WHERE c.id = ? AND c.status = 'normal'").get(req.params.id);
  if (!c) return fail(res, '专题不存在', 1, 404);
  if (!c.is_public && (!req.user || req.user.id !== c.user_id)) return fail(res, '该专题不公开', 403, 403);
  const ids = JSON.parse(c.software_ids || '[]');
  const isFollowed = req.user ? !!db.prepare('SELECT 1 FROM collection_follows WHERE user_id = ? AND collection_id = ?').get(req.user.id, c.id) : false;
  const followCount = db.prepare('SELECT COUNT(*) c FROM collection_follows WHERE collection_id = ?').get(c.id).c;
  return ok(res, { ...c, software_ids: ids, software_list: collectionSoftwareList(ids), is_followed: isFollowed, follow_count: followCount });
});

// 公开专题广场：追加 follow_count
router.get('/collections', (req, res) => {
  const userId = req.query.userId ? parseInt(req.query.userId, 10) : null;
  const rows = userId
    ? db.prepare("SELECT c.*, u.nickname FROM user_collections c JOIN users u ON u.id = c.user_id WHERE c.user_id = ? AND c.is_public = 1 AND c.status = 'normal' ORDER BY c.id DESC").all(userId)
    : db.prepare("SELECT c.*, u.nickname FROM user_collections c JOIN users u ON u.id = c.user_id WHERE c.is_public = 1 AND c.status = 'normal' ORDER BY c.id DESC LIMIT 50").all();
  const list = rows.map((c) => {
    const ids = JSON.parse(c.software_ids || '[]');
    const followCount = db.prepare('SELECT COUNT(*) c FROM collection_follows WHERE collection_id = ?').get(c.id).c;
    return { ...c, software_ids: ids, software_list: collectionSoftwareList(ids), follow_count: followCount };
  });
  return ok(res, list);
});

// 更新专题（名称/简介/软件列表/公开性）
router.put('/me/collections/:id', requireAuth, (req, res) => {
  const c = db.prepare('SELECT * FROM user_collections WHERE id = ? AND status = \'normal\'').get(req.params.id);
  if (!c || c.user_id !== req.user.id) return fail(res, '专题不存在或无权修改', 1, 404);
  const { name, summary, softwareIds, coverColor, isPublic } = req.body || {};
  const ids = Array.isArray(softwareIds)
    ? softwareIds.filter((x) => Number.isInteger(x) || /^\d+$/.test(String(x))).map(Number).slice(0, 30)
    : JSON.parse(c.software_ids || '[]');
  db.prepare('UPDATE user_collections SET name = ?, summary = ?, cover_color = ?, software_ids = ?, software_count = ?, is_public = ?, updated_at = datetime(\'now\',\'localtime\') WHERE id = ?')
    .run(
      String(name || c.name).trim().slice(0, 30) || c.name,
      String(summary !== undefined ? summary : c.summary).slice(0, 200),
      String(coverColor || c.cover_color),
      JSON.stringify(ids),
      ids.length,
      isPublic === undefined ? c.is_public : (isPublic ? 1 : 0),
      c.id
    );
  const upd = db.prepare("SELECT c.*, u.nickname FROM user_collections c JOIN users u ON u.id = c.user_id WHERE c.id = ?").get(c.id);
  return ok(res, { ...upd, software_ids: ids, software_list: collectionSoftwareList(ids) }, '专题已更新');
});

// 删除专题
router.delete('/me/collections/:id', requireAuth, (req, res) => {
  const c = db.prepare('SELECT * FROM user_collections WHERE id = ?').get(req.params.id);
  if (!c || c.user_id !== req.user.id) return fail(res, '专题不存在或无权删除', 1, 404);
  db.prepare("UPDATE user_collections SET status = 'deleted', updated_at = datetime('now','localtime') WHERE id = ?").run(c.id);
  return ok(res, null, '专题已删除');
});

module.exports = router;