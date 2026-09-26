// 管理后台路由：Dashboard / 用户 / 帖子 / 评论 / 软件 / 合集 / 分类 / 举报 / 公告 / 话题 /
// 签到 / 任务 / 管理员 / 角色 / 权限 / 邮箱配置 / 系统设置 / 操作日志
const express = require('express');
const router = express.Router();
const db = require('../db');
const config = require('../config');
const { ok, fail, pageParams, pageResult } = require('../utils/response');
const { requireAdmin, requirePerm } = require('../middleware/auth');
const { hashPassword, verifyPassword, normalizeEmail } = require('../utils/crypto');
const { addExp } = require('../services/growth');
const { log } = require('../services/oplog');
const { isSmtpConfigured, isDevMode } = require('../services/mailer');
const { localDateTimeStr } = require('../utils/date');

// ---- 云屿岛主校验 ----
function isOwner(req) {
  return req.role && req.role.code === 'owner';
}

// ---- 所有后台请求均需管理员 ----
router.use(requireAdmin);

// ============ Dashboard ============
router.get('/dashboard', requirePerm('dashboard:view'), (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const stats = {
    userTotal: db.prepare(`SELECT COUNT(*) c FROM users WHERE status != 'deleted'`).get().c,
    userToday: db.prepare("SELECT COUNT(*) c FROM users WHERE status != 'deleted' AND date(created_at) = date('now','localtime')").get().c,
    postTotal: db.prepare(`SELECT COUNT(*) c FROM posts WHERE status != 'deleted'`).get().c,
    postToday: db.prepare("SELECT COUNT(*) c FROM posts WHERE status != 'deleted' AND date(created_at) = date('now','localtime')").get().c,
    softwareTotal: db.prepare(`SELECT COUNT(*) c FROM software WHERE status = 'normal'`).get().c,
    downloadTotal: db.prepare('SELECT COALESCE(SUM(download_count),0) s FROM software').get().s,
    favoriteTotal: db.prepare('SELECT COALESCE(SUM(favorite_count),0) s FROM software').get().s,
    checkinToday: db.prepare('SELECT COUNT(*) c FROM checkins WHERE date = ?').get(today).c,
    reportPending: db.prepare(`SELECT COUNT(*) c FROM reports WHERE status = 'pending'`).get().c,
    commentTotal: db.prepare(`SELECT COUNT(*) c FROM comments WHERE status != 'deleted'`).get().c,
    topicTotal: db.prepare(`SELECT COUNT(*) c FROM topics WHERE status = 'normal'`).get().c,
  };
  stats.activeUsers = db.prepare("SELECT COUNT(*) c FROM users WHERE date(updated_at) = date('now','localtime')").get().c;

  // 近 7 天每日新增用户与帖子
  const trend = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    trend.push({
      date: d,
      users: db.prepare('SELECT COUNT(*) c FROM users WHERE date(created_at) = ?').get(d).c,
      posts: db.prepare('SELECT COUNT(*) c FROM posts WHERE date(created_at) = ?').get(d).c,
      checkins: db.prepare('SELECT COUNT(*) c FROM checkins WHERE date = ?').get(d).c,
    });
  }

  const pendingReports = db.prepare(`
    SELECT r.*, ru.nickname AS reporter_name, u.nickname AS target_name
    FROM reports r
    JOIN users ru ON ru.id = r.reporter_id
    LEFT JOIN users u ON u.id = r.target_id
    WHERE r.status = 'pending' ORDER BY r.id DESC LIMIT 5`).all();
  const recentActivity = db.prepare('SELECT * FROM operation_logs ORDER BY id DESC LIMIT 8').all();
  const latestUsers = db.prepare('SELECT id, uid, nickname, avatar, lv, created_at FROM users ORDER BY id DESC LIMIT 6').all();
  const latestPosts = db.prepare(`
    SELECT p.id, p.title, u.nickname, p.like_count, p.comment_count, p.created_at
    FROM posts p JOIN users u ON u.id = p.user_id ORDER BY p.id DESC LIMIT 6`).all();

  // 近 7 天下载趋势（软件下载记录）
  const downloadTrend = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    downloadTrend.push({
      date: d,
      downloads: db.prepare('SELECT COUNT(*) c FROM software_downloads WHERE date(created_at) = ?').get(d).c,
      ratings: db.prepare('SELECT COUNT(*) c FROM software_ratings WHERE date(created_at) = ?').get(d).c,
    });
  }

  // 评分分布（1-5 星人数）
  const ratingDist = [];
  for (let s = 5; s >= 1; s--) {
    ratingDist.push({
      score: s,
      count: db.prepare('SELECT COUNT(*) c FROM software_ratings WHERE score = ?').get(s).c,
    });
  }

  // 软件活跃榜（下载/评分 TOP 8）
  const activeSoftware = db.prepare(`
    SELECT id, name, icon, icon_color, download_count, favorite_count, rating, rating_count
    FROM software WHERE status = 'normal' ORDER BY download_count DESC LIMIT 8`).all();

  // 用户专题统计
  const collectionTotal = db.prepare("SELECT COUNT(*) c FROM user_collections WHERE status = 'normal'").get().c;

  // 用户行为事件统计（优先从汇总表 event_daily_stats 查询，无数据时回退原始表）
  const hasStats = db.prepare("SELECT COUNT(*) c FROM sqlite_master WHERE name='event_daily_stats'").get().c > 0;
  const eventStats = {
    pageViewsToday: hasStats
      ? (db.prepare("SELECT COALESCE(SUM(total_count), 0) c FROM event_daily_stats WHERE event_type = 'page_view' AND stat_date = date('now','localtime')").get().c || 0)
      : db.prepare("SELECT COUNT(*) c FROM user_events WHERE event_type = 'page_view' AND date(created_at) = date('now','localtime')").get().c,
    eventsToday: hasStats
      ? (db.prepare("SELECT COALESCE(SUM(total_count), 0) c FROM event_daily_stats WHERE stat_date = date('now','localtime')").get().c || 0)
      : db.prepare("SELECT COUNT(*) c FROM user_events WHERE date(created_at) = date('now','localtime')").get().c,
    topEvents: db.prepare("SELECT event_name, COUNT(*) c FROM user_events WHERE date(created_at) >= date('now','-7 days') GROUP BY event_name ORDER BY c DESC LIMIT 8").all(),
    eventTrend: []
  };
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    if (hasStats) {
      eventStats.eventTrend.push({
        date: d,
        pageViews: db.prepare("SELECT COALESCE(SUM(total_count), 0) c FROM event_daily_stats WHERE event_type = 'page_view' AND stat_date = ?").get(d).c || 0,
        clicks: db.prepare("SELECT COALESCE(SUM(total_count), 0) c FROM event_daily_stats WHERE event_type = 'click' AND stat_date = ?").get(d).c || 0,
      });
    } else {
      eventStats.eventTrend.push({
        date: d,
        pageViews: db.prepare("SELECT COUNT(*) c FROM user_events WHERE event_type = 'page_view' AND date(created_at) = ?").get(d).c || 0,
        clicks: db.prepare("SELECT COUNT(*) c FROM user_events WHERE event_type = 'click' AND date(created_at) = ?").get(d).c || 0,
      });
    }
  }

  return ok(res, { stats, trend, downloadTrend, ratingDist, activeSoftware, collectionTotal, pendingReports, recentActivity, latestUsers, latestPosts, eventStats });
});

// ============ 用户管理 ============
router.get('/users', requirePerm('user:view'), (req, res) => {
  const { page, pageSize, offset } = pageParams(req, { pageSize: 15 });
  const kw = req.query.q;
  const status = req.query.status;
  let where = "status != 'deleted'";
  const params = [];
  if (kw) { where += ' AND (nickname LIKE ? OR email LIKE ? OR uid LIKE ?)'; params.push(`%${kw}%`, `%${kw}%`, `%${kw}%`); }
  if (status && status !== 'all') { where += ' AND status = ?'; params.push(status); }
  const total = db.prepare(`SELECT COUNT(*) c FROM users WHERE ${where}`).get(...params).c;
  const rows = db.prepare(`
    SELECT id, uid, email, email_verified, nickname, avatar, bio, lv, exp, status, role_type,
      checkin_streak, checkin_total, post_count, comment_count, favorite_count, like_count, created_at
    FROM users WHERE ${where} ORDER BY id DESC LIMIT ? OFFSET ?`).all(...params, pageSize, offset);
  return ok(res, pageResult(rows, total, page, pageSize));
});

router.get('/users/:id', requirePerm('user:view'), (req, res) => {
  const u = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!u) return fail(res, '用户不存在', 1, 404);
  const admin = db.prepare('SELECT a.*, r.name AS role_name, r.code AS role_code FROM admins a LEFT JOIN roles r ON r.id = a.role_id WHERE a.user_id = ?').get(u.id);
  const posts = db.prepare('SELECT id, title, like_count, comment_count, created_at, status FROM posts WHERE user_id = ? ORDER BY id DESC LIMIT 20').all(u.id);
  const expLogs = db.prepare('SELECT * FROM experience_logs WHERE user_id = ? ORDER BY id DESC LIMIT 20').all(u.id);
  const reports = db.prepare(`SELECT * FROM reports WHERE target_type = 'user' AND target_id = ? ORDER BY id DESC LIMIT 10`).all(u.id);
  const checkins = db.prepare('SELECT * FROM checkins WHERE user_id = ? ORDER BY id DESC LIMIT 14').all(u.id);
  return ok(res, { ...u, password_hash: undefined, admin, posts, expLogs, reports, checkins });
});

// 修改用户状态（禁言/解禁/封禁/解封/暂停）
router.put('/users/:id/status', requirePerm('user:ban'), (req, res) => {
  const { status, reason } = req.body || {};
  const target = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!target) return fail(res, '用户不存在', 1, 404);
  if (target.id === req.user.id) return fail(res, '不能修改自己的状态', 1, 400);
  const allowed = ['normal', 'muted', 'suspended', 'banned'];
  if (!allowed.includes(status)) return fail(res, '非法状态', 1, 400);
  db.prepare("UPDATE users SET status = ?, banned_reason = ?, updated_at = datetime('now','localtime') WHERE id = ?")
    .run(status, reason || '', target.id);
  db.prepare('INSERT INTO notifications (user_id, type, title, content) VALUES (?,?,?,?)')
    .run(target.id, 'system', '账号状态变更', status === 'muted' ? '你已被禁言。' : status === 'banned' ? '你的账号已被封禁。' : status === 'suspended' ? '你的账号已被暂停。' : '你的账号已恢复正常。');
  log(db, req, `用户状态变更：${target.nickname} -> ${status}`, 'user', target.id, reason || '');
  return ok(res, null, '状态已更新');
});

// 调整等级 / EXP
router.put('/users/:id/exp', requirePerm('user:exp'), (req, res) => {
  const { exp } = req.body || {};
  const delta = parseInt(exp, 10);
  if (!delta || delta === 0 || Math.abs(delta) > 100000) return fail(res, '请输入有效的 EXP 调整值', 1, 400);
  const target = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!target) return fail(res, '用户不存在', 1, 404);
  const r = addExp(target.id, delta, 'admin', `管理员 ${req.user.nickname} 调整 EXP ${delta > 0 ? '+' : ''}${delta}`);
  log(db, req, `调整 ${target.nickname} EXP ${delta > 0 ? '+' : ''}${delta}`, 'user', target.id);
  return ok(res, { exp: r.exp, lv: r.lvInfo.lv }, 'EXP 已调整');
});

// 修改用户身份（管理员/普通用户）
router.put('/users/:id/role', requirePerm('user:edit'), (req, res) => {
  const { role_type } = req.body || {};
  const target = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!target) return fail(res, '用户不存在', 1, 404);
  db.prepare("UPDATE users SET role_type = ?, updated_at = datetime('now','localtime') WHERE id = ?").run(role_type === 'admin' ? 'admin' : 'user', target.id);
  log(db, req, `修改 ${target.nickname} 身份为 ${role_type === 'admin' ? '管理员' : '普通用户'}`, 'user', target.id);
  return ok(res, null, '身份已修改');
});

// ============ 内容管理：帖子 ============
router.get('/posts', requirePerm('post:view'), (req, res) => {
  const { page, pageSize, offset } = pageParams(req, { pageSize: 15 });
  const kw = req.query.q;
  let where = "p.status != 'deleted'";
  const params = [];
  if (kw) { where += ' AND (p.title LIKE ? OR p.content LIKE ?)'; params.push(`%${kw}%`, `%${kw}%`); }
  const total = db.prepare(`SELECT COUNT(*) c FROM posts p WHERE ${where}`).get(...params).c;
  const rows = db.prepare(`
    SELECT p.*, u.nickname, u.uid FROM posts p JOIN users u ON u.id = p.user_id
    WHERE ${where} ORDER BY p.id DESC LIMIT ? OFFSET ?`).all(...params, pageSize, offset);
  return ok(res, pageResult(rows, total, page, pageSize));
});

// 置顶 / 加精 / 隐藏 / 恢复
router.put('/posts/:id/state', requirePerm('post:delete'), (req, res) => {
  const { field, value } = req.body || {};
  const p = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
  if (!p) return fail(res, '帖子不存在', 1, 404);
  if (!['is_pinned', 'is_featured', 'is_hidden'].includes(field)) return fail(res, '非法操作', 1, 400);
  db.prepare(`UPDATE posts SET ${field} = ?, updated_at = datetime('now','localtime') WHERE id = ?`).run(value ? 1 : 0, p.id);
  log(db, req, `帖子《${p.title}》${field}=${value ? 1 : 0}`, 'post', p.id);
  return ok(res, null, '已更新');
});

// 管理端编辑帖子
router.put('/posts/:id', requirePerm('post:edit'), (req, res) => {
  const { title, content } = req.body || {};
  if (title && (!String(title).trim() || String(title).length > 60)) return fail(res, '标题不合法', 1, 400);
  db.prepare("UPDATE posts SET title = COALESCE(?, title), content = COALESCE(?, content), updated_at = datetime('now','localtime') WHERE id = ?")
    .run(title || null, content || null, req.params.id);
  log(db, req, `编辑帖子 #${req.params.id}`, 'post', req.params.id);
  return ok(res, null, '帖子已更新');
});

// 管理端删除帖子
router.delete('/posts/:id', requirePerm('post:delete'), (req, res) => {
  const p = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
  if (!p) return fail(res, '帖子不存在', 1, 404);
  db.prepare("UPDATE posts SET status = 'deleted' WHERE id = ?").run(p.id);
  db.prepare('UPDATE users SET post_count = MAX(0, post_count - 1) WHERE id = ?').run(p.user_id);
  log(db, req, `删除帖子《${p.title}》`, 'post', p.id);
  return ok(res, null, '帖子已删除');
});

// ============ 内容管理：评论 ============
router.get('/comments', requirePerm('comment:manage'), (req, res) => {
  const { page, pageSize, offset } = pageParams(req, { pageSize: 15 });
  const kw = req.query.q;
  let where = "c.status != 'deleted'";
  const params = [];
  if (kw) { where += ' AND c.content LIKE ?'; params.push(`%${kw}%`); }
  const total = db.prepare(`SELECT COUNT(*) c FROM comments c WHERE ${where}`).get(...params).c;
  const rows = db.prepare(`
    SELECT c.*, u.nickname, u.uid, p.title AS post_title
    FROM comments c JOIN users u ON u.id = c.user_id JOIN posts p ON p.id = c.post_id
    WHERE ${where} ORDER BY c.id DESC LIMIT ? OFFSET ?`).all(...params, pageSize, offset);
  return ok(res, pageResult(rows, total, page, pageSize));
});

router.delete('/comments/:id', requirePerm('comment:manage'), (req, res) => {
  const c = db.prepare('SELECT * FROM comments WHERE id = ?').get(req.params.id);
  if (!c) return fail(res, '评论不存在', 1, 404);
  db.prepare("UPDATE comments SET status = 'deleted' WHERE id = ?").run(c.id);
  db.prepare('UPDATE posts SET comment_count = MAX(0, comment_count - 1) WHERE id = ?').run(c.post_id);
  log(db, req, `删除评论 #${c.id}`, 'comment', c.id);
  return ok(res, null, '评论已删除');
});

// ============ 话题管理 ============
router.get('/topics', requirePerm('topic:manage'), (req, res) => {
  const rows = db.prepare('SELECT * FROM topics ORDER BY id DESC LIMIT 100').all();
  return ok(res, rows);
});

router.post('/topics', requirePerm('topic:manage'), (req, res) => {
  const { name, description, icon, is_hot } = req.body || {};
  if (!name || !String(name).trim()) return fail(res, '话题名称不能为空', 1, 400);
  try {
    const info = db.prepare('INSERT INTO topics (name, description, icon, is_hot) VALUES (?,?,?,?)')
      .run(String(name).trim(), description || '', icon || '', is_hot ? 1 : 0);
    log(db, req, `创建话题「${name}」`, 'topic', info.lastInsertRowid);
    return ok(res, { id: info.lastInsertRowid }, '话题已创建');
  } catch (e) {
    return fail(res, '话题名称已存在', 1, 400);
  }
});

router.put('/topics/:id', requirePerm('topic:manage'), (req, res) => {
  const { name, description, icon, is_hot } = req.body || {};
  const t = db.prepare('SELECT * FROM topics WHERE id = ?').get(req.params.id);
  if (!t) return fail(res, '话题不存在', 1, 404);
  db.prepare('UPDATE topics SET name = COALESCE(?, name), description = COALESCE(?, description), icon = COALESCE(?, icon), is_hot = ? WHERE id = ?')
    .run(name || null, description || null, icon || null, is_hot ? 1 : 0, t.id);
  log(db, req, `编辑话题「${t.name}」`, 'topic', t.id);
  return ok(res, null, '话题已更新');
});

router.delete('/topics/:id', requirePerm('topic:manage'), (req, res) => {
  const t = db.prepare('SELECT * FROM topics WHERE id = ?').get(req.params.id);
  if (!t) return fail(res, '话题不存在', 1, 404);
  db.prepare("UPDATE topics SET status = 'deleted' WHERE id = ?").run(t.id);
  log(db, req, `删除话题「${t.name}」`, 'topic', t.id);
  return ok(res, null, '话题已删除');
});

// ============ 软件管理 ============
router.get('/software', requirePerm('software:view'), (req, res) => {
  const { page, pageSize, offset } = pageParams(req, { pageSize: 15 });
  const kw = req.query.q;
  let where = '1=1';
  const params = [];
  if (kw) { where += ' AND (s.name LIKE ? OR s.developer LIKE ?)'; params.push(`%${kw}%`, `%${kw}%`); }
  const total = db.prepare(`SELECT COUNT(*) c FROM software s WHERE ${where}`).get(...params).c;
  const rows = db.prepare(`
    SELECT s.*, c.name AS category_name FROM software s
    LEFT JOIN software_categories c ON c.id = s.category_id
    WHERE ${where} ORDER BY s.id DESC LIMIT ? OFFSET ?`).all(...params, pageSize, offset);
  return ok(res, pageResult(rows.map((r) => ({ ...r, tags: JSON.parse(r.tags || '[]') })), total, page, pageSize));
});

router.get('/software/:id', requirePerm('software:view'), (req, res) => {
  const s = db.prepare('SELECT * FROM software WHERE id = ?').get(req.params.id);
  if (!s) return fail(res, '软件不存在', 1, 404);
  return ok(res, { ...s, tags: JSON.parse(s.tags || '[]'), screenshots: JSON.parse(s.screenshots || '[]') });
});

router.post('/software', requirePerm('software:edit'), (req, res) => {
  const { name, icon, icon_color, category_id, summary, description, version, size, developer, download_url, tags, is_recommend, is_hot, is_featured, is_banner } = req.body || {};
  if (!name) return fail(res, '软件名称不能为空', 1, 400);
  const info = db.prepare(`
    INSERT INTO software (name, icon, icon_color, category_id, summary, description, version, size, developer, download_url, tags, is_recommend, is_hot, is_featured, is_banner)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
    String(name).trim(), icon || '📦', icon_color || '#5B8DEF', category_id || null,
    summary || '', description || '', version || '1.0.0', size || '0 MB', developer || '',
    download_url || '', JSON.stringify(tags || []), is_recommend ? 1 : 0, is_hot ? 1 : 0,
    is_featured ? 1 : 0, is_banner ? 1 : 0
  );
  if (category_id) db.prepare('UPDATE software_categories SET software_count = software_count + 1 WHERE id = ?').run(category_id);
  log(db, req, `添加软件「${name}」`, 'software', info.lastInsertRowid);
  return ok(res, { id: info.lastInsertRowid }, '软件已添加');
});

router.put('/software/:id', requirePerm('software:edit'), (req, res) => {
  const s = db.prepare('SELECT * FROM software WHERE id = ?').get(req.params.id);
  if (!s) return fail(res, '软件不存在', 1, 404);
  const b = req.body || {};
  const fields = ['name', 'icon', 'icon_color', 'category_id', 'summary', 'description', 'version', 'size', 'developer', 'download_url', 'changelog', 'is_recommend', 'is_hot', 'is_featured', 'is_banner', 'status'];
  const sets = [];
  const params = [];
  fields.forEach((f) => {
    if (b[f] !== undefined) {
      sets.push(`${f} = ?`);
      params.push(f === 'tags' && Array.isArray(b[f]) ? JSON.stringify(b[f]) : b[f]);
    }
  });
  if (b.tags !== undefined) { sets.push('tags = ?'); params.push(JSON.stringify(Array.isArray(b.tags) ? b.tags : [])); }
  if (!sets.length) return fail(res, '没有需要修改的内容', 1, 400);
  params.push(s.id);
  db.prepare(`UPDATE software SET ${sets.join(', ')} WHERE id = ?`).run(...params);
  log(db, req, `编辑软件「${s.name}」`, 'software', s.id);
  return ok(res, null, '软件已更新');
});

router.delete('/software/:id', requirePerm('software:delete'), (req, res) => {
  const s = db.prepare('SELECT * FROM software WHERE id = ?').get(req.params.id);
  if (!s) return fail(res, '软件不存在', 1, 404);
  db.prepare("UPDATE software SET status = 'deleted' WHERE id = ?").run(s.id);
  if (s.category_id) db.prepare('UPDATE software_categories SET software_count = MAX(0, software_count - 1) WHERE id = ?').run(s.category_id);
  log(db, req, `删除软件「${s.name}」`, 'software', s.id);
  return ok(res, null, '软件已删除');
});

// 软件版本管理
router.get('/software/:id/versions', requirePerm('software:view'), (req, res) => {
  return ok(res, db.prepare('SELECT * FROM software_versions WHERE software_id = ? ORDER BY id DESC').all(req.params.id));
});

router.post('/software/:id/versions', requirePerm('software:edit'), (req, res) => {
  const { version, size, download_url, changelog } = req.body || {};
  if (!version) return fail(res, '版本号不能为空', 1, 400);
  const info = db.prepare('INSERT INTO software_versions (software_id, version, size, download_url, changelog) VALUES (?,?,?,?,?)')
    .run(req.params.id, String(version), size || '', download_url || '', changelog || '');
  db.prepare("UPDATE software SET version = ?, update_time = datetime('now','localtime') WHERE id = ?").run(String(version), req.params.id);
  log(db, req, `添加版本 ${version}`, 'software', req.params.id);
  return ok(res, { id: info.lastInsertRowid }, '版本已添加');
});

router.delete('/software/versions/:id', requirePerm('software:edit'), (req, res) => {
  db.prepare('DELETE FROM software_versions WHERE id = ?').run(req.params.id);
  return ok(res, null, '版本已删除');
});

// ============ 软件分类 ============
router.get('/categories', requirePerm('category:manage'), (req, res) => {
  return ok(res, db.prepare('SELECT * FROM software_categories ORDER BY sort').all());
});

router.post('/categories', requirePerm('category:manage'), (req, res) => {
  const { name, icon } = req.body || {};
  if (!name) return fail(res, '分类名称不能为空', 1, 400);
  try {
    const info = db.prepare('INSERT INTO software_categories (name, icon) VALUES (?,?)').run(String(name).trim(), icon || '📦');
    log(db, req, `创建分类「${name}」`, 'category', info.lastInsertRowid);
    return ok(res, { id: info.lastInsertRowid }, '分类已创建');
  } catch (e) { return fail(res, '分类名称已存在', 1, 400); }
});

router.put('/categories/:id', requirePerm('category:manage'), (req, res) => {
  const { name, icon, sort } = req.body || {};
  const c = db.prepare('SELECT * FROM software_categories WHERE id = ?').get(req.params.id);
  if (!c) return fail(res, '分类不存在', 1, 404);
  db.prepare('UPDATE software_categories SET name = COALESCE(?, name), icon = COALESCE(?, icon), sort = COALESCE(?, sort) WHERE id = ?')
    .run(name || null, icon || null, sort !== undefined ? sort : null, c.id);
  log(db, req, `编辑分类「${c.name}」`, 'category', c.id);
  return ok(res, null, '分类已更新');
});

router.delete('/categories/:id', requirePerm('category:manage'), (req, res) => {
  const c = db.prepare('SELECT * FROM software_categories WHERE id = ?').get(req.params.id);
  if (!c) return fail(res, '分类不存在', 1, 404);
  const cnt = db.prepare('SELECT COUNT(*) c FROM software WHERE category_id = ?').get(c.id).c;
  if (cnt > 0) return fail(res, `该分类下还有 ${cnt} 个软件，无法删除`, 1, 400);
  db.prepare('DELETE FROM software_categories WHERE id = ?').run(c.id);
  log(db, req, `删除分类「${c.name}」`, 'category', c.id);
  return ok(res, null, '分类已删除');
});

// ============ 软件合集 ============
router.get('/collections', requirePerm('collection:manage'), (req, res) => {
  return ok(res, db.prepare('SELECT * FROM software_collections ORDER BY sort').all().map((c) => ({ ...c, software_ids: JSON.parse(c.software_ids || '[]') })));
});

router.post('/collections', requirePerm('collection:manage'), (req, res) => {
  const { name, cover, summary, software_ids } = req.body || {};
  if (!name) return fail(res, '合集名称不能为空', 1, 400);
  const ids = Array.isArray(software_ids) ? software_ids : [];
  const info = db.prepare('INSERT INTO software_collections (name, cover, summary, software_ids, software_count) VALUES (?,?,?,?,?)')
    .run(String(name).trim(), cover || '', summary || '', JSON.stringify(ids), ids.length);
  log(db, req, `创建合集「${name}」`, 'collection', info.lastInsertRowid);
  return ok(res, { id: info.lastInsertRowid }, '合集已创建');
});

router.put('/collections/:id', requirePerm('collection:manage'), (req, res) => {
  const c = db.prepare('SELECT * FROM software_collections WHERE id = ?').get(req.params.id);
  if (!c) return fail(res, '合集不存在', 1, 404);
  const b = req.body || {};
  const ids = Array.isArray(b.software_ids) ? b.software_ids : null;
  db.prepare(`UPDATE software_collections SET
    name = COALESCE(?, name), cover = COALESCE(?, cover), summary = COALESCE(?, summary),
    software_ids = COALESCE(?, software_ids), software_count = COALESCE(?, software_count)
    WHERE id = ?`)
    .run(b.name || null, b.cover || null, b.summary || null, ids ? JSON.stringify(ids) : null, ids ? ids.length : null, c.id);
  log(db, req, `编辑合集「${c.name}」`, 'collection', c.id);
  return ok(res, null, '合集已更新');
});

router.delete('/collections/:id', requirePerm('collection:manage'), (req, res) => {
  const c = db.prepare('SELECT * FROM software_collections WHERE id = ?').get(req.params.id);
  if (!c) return fail(res, '合集不存在', 1, 404);
  db.prepare('DELETE FROM software_collections WHERE id = ?').run(c.id);
  log(db, req, `删除合集「${c.name}」`, 'collection', c.id);
  return ok(res, null, '合集已删除');
});

// ============ 用户专题管理 ============
router.get('/u-collections', requirePerm('collection:manage'), (req, res) => {
  const { page, pageSize, offset } = pageParams(req, { pageSize: 15 });
  const rows = db.prepare(`
    SELECT c.*, u.nickname, u.uid AS user_uid
    FROM user_collections c JOIN users u ON u.id = c.user_id
    ORDER BY c.id DESC LIMIT ? OFFSET ?`).all(pageSize, offset);
  const total = db.prepare('SELECT COUNT(*) c FROM user_collections').get().c;
  const list = rows.map((c) => ({ ...c, software_ids: JSON.parse(c.software_ids || '[]') }));
  return ok(res, pageResult(list, total, page, pageSize));
});

router.delete('/u-collections/:id', requirePerm('collection:manage'), (req, res) => {
  const c = db.prepare("SELECT * FROM user_collections WHERE id = ? AND status != 'deleted'").get(req.params.id);
  if (!c) return fail(res, '专题不存在', 1, 404);
  db.prepare("UPDATE user_collections SET status = 'deleted', updated_at = datetime('now','localtime') WHERE id = ?").run(c.id);
  log(db, req, `下架用户专题「${c.name}」(id=${c.id})`, 'collection', c.id);
  return ok(res, null, '专题已下架');
});

// ============ 举报管理 ============
router.get('/reports', requirePerm('report:handle'), (req, res) => {
  const { page, pageSize, offset } = pageParams(req, { pageSize: 15 });
  const status = req.query.status || 'all';
  let where = '1=1';
  const params = [];
  if (status !== 'all') { where += ' AND r.status = ?'; params.push(status); }
  const total = db.prepare(`SELECT COUNT(*) c FROM reports r WHERE ${where}`).get(...params).c;
  const rows = db.prepare(`
    SELECT r.*, ru.nickname AS reporter_name, ru.uid AS reporter_uid,
      CASE WHEN r.target_type='user' THEN (SELECT nickname FROM users WHERE id = r.target_id)
           WHEN r.target_type='post' THEN (SELECT title FROM posts WHERE id = r.target_id)
           WHEN r.target_type='comment' THEN (SELECT content FROM comments WHERE id = r.target_id)
           WHEN r.target_type='software' THEN (SELECT name FROM software WHERE id = r.target_id)
      END AS target_title,
      h.nickname AS handler_name
    FROM reports r
    JOIN users ru ON ru.id = r.reporter_id
    LEFT JOIN users h ON h.id = r.handler_id
    WHERE ${where} ORDER BY r.id DESC LIMIT ? OFFSET ?`).all(...params, pageSize, offset);
  return ok(res, pageResult(rows, total, page, pageSize));
});

// 处理举报：approve(删除内容/禁言/封禁) / reject
router.put('/reports/:id', requirePerm('report:handle'), (req, res) => {
  const { status, result, action, targetUserId } = req.body || {};
  const r = db.prepare('SELECT * FROM reports WHERE id = ?').get(req.params.id);
  if (!r) return fail(res, '举报不存在', 1, 404);
  if (!['approved', 'rejected', 'handled'].includes(status)) return fail(res, '非法状态', 1, 400);
  db.prepare(`UPDATE reports SET status = ?, result = ?, handler_id = ?, handled_at = datetime('now','localtime') WHERE id = ?`)
    .run(status, result || '', req.user.id, r.id);

  // 处理动作
  if (action === 'delete_content') {
    if (r.target_type === 'post') db.prepare("UPDATE posts SET status='deleted' WHERE id = ?").run(r.target_id);
    if (r.target_type === 'comment') db.prepare("UPDATE comments SET status='deleted' WHERE id = ?").run(r.target_id);
    if (r.target_type === 'software') db.prepare("UPDATE software SET status='deleted' WHERE id = ?").run(r.target_id);
  }
  if (action === 'mute_user' && targetUserId) {
    db.prepare("UPDATE users SET status='muted', banned_reason = ?, updated_at = datetime('now','localtime') WHERE id = ?").run(result || '违反社区规范', targetUserId);
  }
  if (action === 'ban_user' && targetUserId) {
    db.prepare("UPDATE users SET status='banned', banned_reason = ?, updated_at = datetime('now','localtime') WHERE id = ?").run(result || '严重违规', targetUserId);
  }
  if (r.target_type === 'user') {
    db.prepare("UPDATE users SET status='muted', banned_reason = ?, updated_at = datetime('now','localtime') WHERE id = ?").run(result || '违反社区规范', r.target_id);
  }
  // 通知举报人处理结果
  db.prepare('INSERT INTO notifications (user_id, type, title, content) VALUES (?,?,?,?)')
    .run(r.reporter_id, 'report_result', '举报处理结果', status === 'approved' ? '你的举报已被受理，感谢维护社区环境！' : status === 'rejected' ? '你的举报经核实不成立，感谢反馈。' : '你的举报已处理完毕。');
  log(db, req, `处理举报 #${r.id} -> ${status}${action ? '（' + action + '）' : ''}`, 'report', r.id, result || '');
  return ok(res, null, '举报已处理');
});

// ============ 公告管理 ============
router.get('/announcements', requirePerm('announcement:manage'), (req, res) => {
  const rows = db.prepare('SELECT * FROM announcements ORDER BY is_pinned DESC, id DESC LIMIT 100').all();
  return ok(res, rows);
});

router.post('/announcements', requirePerm('announcement:manage'), (req, res) => {
  const { title, type, content, is_pinned, is_published, publish_time } = req.body || {};
  if (!title || !String(title).trim()) return fail(res, '公告标题不能为空', 1, 400);
  const info = db.prepare('INSERT INTO announcements (title, type, content, is_pinned, is_published, publish_time, created_by) VALUES (?,?,?,?,?,?,?)')
    .run(String(title).trim(), type || 'home', content || '', is_pinned ? 1 : 0, is_published === undefined ? 1 : (is_published ? 1 : 0), publish_time || localDateTimeStr(), req.user.id);
  log(db, req, `发布公告「${title}」`, 'announcement', info.lastInsertRowid);
  // 系统公告：通知所有用户（限前 500）
  if (type === 'system') {
    const users = db.prepare(`SELECT id FROM users WHERE status = 'normal' LIMIT 500`).all();
    const ins = db.prepare('INSERT INTO notifications (user_id, type, title, content) VALUES (?,?,?,?)');
    const tx = db.transaction((us) => us.forEach((u) => ins.run(u.id, 'announce', title, content || '')));
    tx(users);
  }
  return ok(res, { id: info.lastInsertRowid }, '公告已发布');
});

router.put('/announcements/:id', requirePerm('announcement:manage'), (req, res) => {
  const a = db.prepare('SELECT * FROM announcements WHERE id = ?').get(req.params.id);
  if (!a) return fail(res, '公告不存在', 1, 404);
  const b = req.body || {};
  db.prepare(`UPDATE announcements SET
    title = COALESCE(?, title), type = COALESCE(?, type), content = COALESCE(?, content),
    is_pinned = COALESCE(?, is_pinned), is_published = COALESCE(?, is_published), publish_time = COALESCE(?, publish_time)
    WHERE id = ?`)
    .run(b.title || null, b.type || null, b.content || null, b.is_pinned !== undefined ? (b.is_pinned ? 1 : 0) : null, b.is_published !== undefined ? (b.is_published ? 1 : 0) : null, b.publish_time || null, a.id);
  log(db, req, `编辑公告「${a.title}」`, 'announcement', a.id);
  return ok(res, null, '公告已更新');
});

router.delete('/announcements/:id', requirePerm('announcement:manage'), (req, res) => {
  const a = db.prepare('SELECT * FROM announcements WHERE id = ?').get(req.params.id);
  if (!a) return fail(res, '公告不存在', 1, 404);
  db.prepare('DELETE FROM announcements WHERE id = ?').run(a.id);
  log(db, req, `删除公告「${a.title}」`, 'announcement', a.id);
  return ok(res, null, '公告已删除');
});

// ============ 签到管理 ============
router.get('/checkins', requirePerm('checkin:manage'), (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const stats = {
    todayCount: db.prepare('SELECT COUNT(*) c FROM checkins WHERE date = ?').get(today).c,
    totalRecords: db.prepare('SELECT COUNT(*) c FROM checkins').get().c,
    streakTop: db.prepare('SELECT nickname, checkin_streak FROM users WHERE checkin_streak > 0 ORDER BY checkin_streak DESC LIMIT 10').all(),
    totalTop: db.prepare('SELECT nickname, checkin_total FROM users WHERE checkin_total > 0 ORDER BY checkin_total DESC LIMIT 10').all(),
    rewards: db.prepare('SELECT * FROM checkin_rewards ORDER BY day').all(),
  };
  return ok(res, stats);
});

router.get('/checkins/records', requirePerm('checkin:manage'), (req, res) => {
  const { page, pageSize, offset } = pageParams(req, { pageSize: 15 });
  const total = db.prepare('SELECT COUNT(*) c FROM checkins').get().c;
  const rows = db.prepare('SELECT c.*, u.nickname, u.avatar FROM checkins c JOIN users u ON u.id = c.user_id ORDER BY c.id DESC LIMIT ? OFFSET ?').all(pageSize, offset);
  return ok(res, pageResult(rows, total, page, pageSize));
});

router.put('/checkin-rewards/:day', requirePerm('checkin:manage'), (req, res) => {
  const { exp, bonus_exp, reward_desc } = req.body || {};
  const day = parseInt(req.params.day, 10);
  const r = db.prepare('SELECT * FROM checkin_rewards WHERE day = ?').get(day);
  if (r) {
    db.prepare('UPDATE checkin_rewards SET exp = ?, bonus_exp = ?, reward_desc = ? WHERE day = ?')
      .run(exp !== undefined ? exp : r.exp, bonus_exp !== undefined ? bonus_exp : r.bonus_exp, reward_desc !== undefined ? reward_desc : r.reward_desc, day);
  } else {
    db.prepare('INSERT INTO checkin_rewards (day, exp, bonus_exp, reward_desc) VALUES (?,?,?,?)')
      .run(day, exp || 10, bonus_exp || 0, reward_desc || '');
  }
  log(db, req, `调整签到奖励第 ${day} 天`, 'checkin', day);
  return ok(res, null, '签到奖励已更新');
});

// ============ 任务管理 ============
router.get('/tasks', requirePerm('task:manage'), (req, res) => {
  return ok(res, db.prepare('SELECT * FROM tasks ORDER BY sort').all());
});

router.post('/tasks', requirePerm('task:manage'), (req, res) => {
  const { code, name, description, exp, target_count, sort } = req.body || {};
  if (!name) return fail(res, '任务名称不能为空', 1, 400);
  try {
    const info = db.prepare('INSERT INTO tasks (code, name, description, exp, target_count, sort) VALUES (?,?,?,?,?,?)')
      .run(code || 'task_' + Date.now(), String(name).trim(), description || '', exp || 5, target_count || 1, sort || 0);
    log(db, req, `创建任务「${name}」`, 'task', info.lastInsertRowid);
    return ok(res, { id: info.lastInsertRowid }, '任务已创建');
  } catch (e) { return fail(res, '任务编码已存在', 1, 400); }
});

router.put('/tasks/:id', requirePerm('task:manage'), (req, res) => {
  const b = req.body || {};
  const t = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!t) return fail(res, '任务不存在', 1, 404);
  db.prepare('UPDATE tasks SET name = COALESCE(?, name), description = COALESCE(?, description), exp = COALESCE(?, exp), target_count = COALESCE(?, target_count), sort = COALESCE(?, sort), status = COALESCE(?, status) WHERE id = ?')
    .run(b.name || null, b.description || null, b.exp !== undefined ? b.exp : null, b.target_count !== undefined ? b.target_count : null, b.sort !== undefined ? b.sort : null, b.status || null, t.id);
  log(db, req, `编辑任务「${t.name}」`, 'task', t.id);
  return ok(res, null, '任务已更新');
});

router.delete('/tasks/:id', requirePerm('task:manage'), (req, res) => {
  const t = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!t) return fail(res, '任务不存在', 1, 404);
  db.prepare('DELETE FROM tasks WHERE id = ?').run(t.id);
  log(db, req, `删除任务「${t.name}」`, 'task', t.id);
  return ok(res, null, '任务已删除');
});

// ============ 管理员管理 ============
router.get('/admins', requirePerm('admin:manage'), (req, res) => {
  const rows = db.prepare(`
    SELECT a.id AS admin_id, a.title, a.created_at, r.name AS role_name, r.code AS role_code,
      u.id AS user_id, u.uid, u.nickname, u.avatar, u.email, u.status
    FROM admins a JOIN users u ON u.id = a.user_id LEFT JOIN roles r ON r.id = a.role_id
    ORDER BY a.id`).all();
  return ok(res, rows);
});

router.post('/admins', requirePerm('admin:manage'), (req, res) => {
  if (!isOwner(req)) return fail(res, '仅云屿岛主可添加管理员', 403, 403);
  const { email, role_id, title } = req.body || {};
  const em = normalizeEmail(email);
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(em);
  if (!user) return fail(res, '该邮箱对应的用户不存在', 1, 404);
  const exists = db.prepare('SELECT 1 FROM admins WHERE user_id = ?').get(user.id);
  if (exists) return fail(res, '该用户已是管理员', 1, 400);
  const role = db.prepare('SELECT * FROM roles WHERE id = ?').get(role_id);
  if (!role) return fail(res, '角色不存在', 1, 400);
  db.prepare("UPDATE users SET role_type = 'admin' WHERE id = ?").run(user.id);
  db.prepare('INSERT INTO admins (user_id, role_id, title) VALUES (?,?,?)').run(user.id, role.id, title || role.name);
  log(db, req, `添加管理员 ${user.nickname}（${role.name}）`, 'admin', user.id);
  return ok(res, null, '管理员已添加');
});

router.put('/admins/:id', requirePerm('admin:manage'), (req, res) => {
  const a = db.prepare('SELECT * FROM admins WHERE id = ?').get(req.params.id);
  if (!a) return fail(res, '管理员不存在', 1, 404);
  const { role_id, title } = req.body || {};
  if (role_id) {
    const role = db.prepare('SELECT * FROM roles WHERE id = ?').get(role_id);
    if (!role) return fail(res, '角色不存在', 1, 400);
    db.prepare('UPDATE admins SET role_id = ? WHERE id = ?').run(role_id, a.id);
  }
  if (title) db.prepare('UPDATE admins SET title = ? WHERE id = ?').run(String(title), a.id);
  log(db, req, `编辑管理员 #${a.id}`, 'admin', a.id);
  return ok(res, null, '管理员已更新');
});

router.delete('/admins/:id', requirePerm('admin:manage'), (req, res) => {
  if (!isOwner(req)) return fail(res, '仅云屿岛主可移除管理员', 403, 403);
  const a = db.prepare('SELECT * FROM admins WHERE id = ?').get(req.params.id);
  if (!a) return fail(res, '管理员不存在', 1, 404);
  const ownerRole = db.prepare(`SELECT id FROM roles WHERE code = 'owner'`).get();
  if (a.role_id === ownerRole.id) return fail(res, '不能移除云屿岛主', 1, 400);
  db.prepare('DELETE FROM admins WHERE id = ?').run(a.id);
  db.prepare("UPDATE users SET role_type = 'user' WHERE id = ?").run(a.user_id);
  log(db, req, `移除管理员 #${a.id}`, 'admin', a.id);
  return ok(res, null, '管理员已移除');
});

// ============ 角色管理 ============
router.get('/roles', requirePerm('role:manage'), (req, res) => {
  const roles = db.prepare('SELECT * FROM roles ORDER BY id').all();
  const perms = db.prepare('SELECT * FROM permissions ORDER BY group_name, id').all();
  const list = roles.map((r) => ({
    ...r,
    permissions: db.prepare('SELECT p.code FROM role_permissions rp JOIN permissions p ON p.id = rp.permission_id WHERE rp.role_id = ?').all(r.id).map((x) => x.code),
  }));
  return ok(res, { roles: list, permissions: perms });
});

router.put('/roles/:id', requirePerm('role:manage'), (req, res) => {
  const { name, description, permissions } = req.body || {};
  const role = db.prepare('SELECT * FROM roles WHERE id = ?').get(req.params.id);
  if (!role) return fail(res, '角色不存在', 1, 404);
  if (permissions && Array.isArray(permissions)) {
    db.prepare('DELETE FROM role_permissions WHERE role_id = ?').run(role.id);
    const ins = db.prepare('INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, (SELECT id FROM permissions WHERE code = ?))');
    const tx = db.transaction((ps) => ps.forEach((code) => ins.run(role.id, code)));
    tx(permissions);
  }
  db.prepare('UPDATE roles SET name = COALESCE(?, name), description = COALESCE(?, description) WHERE id = ?')
    .run(name || null, description || null, role.id);
  log(db, req, `编辑角色「${role.name}」`, 'role', role.id);
  return ok(res, null, '角色已更新');
});

// ============ 权限查看 ============
router.get('/permissions', requirePerm('permission:manage'), (req, res) => {
  return ok(res, db.prepare('SELECT * FROM permissions ORDER BY group_name, id').all());
});

// ============ 邮箱系统配置（只读状态，凭据只在服务端） ============
router.get('/email-config', requirePerm('email:config'), (req, res) => {
  return ok(res, {
    smtpConfigured: isSmtpConfigured(),
    devMode: isDevMode(),
    smtpUser: config.smtp.user || '',
    smtpHost: config.smtp.host || '',
    smtpPort: config.smtp.port,
    smtpFrom: config.smtp.from || '',
    // 不返回 SMTP 密码/授权码
  });
});

// ============ 系统设置 ============
router.get('/settings', requirePerm('settings:manage'), (req, res) => {
  const rows = db.prepare('SELECT key, value FROM system_settings').all();
  const settings = {};
  rows.forEach((r) => { settings[r.key] = r.value; });
  return ok(res, settings);
});

router.put('/settings', requirePerm('settings:manage'), (req, res) => {
  const b = req.body || {};
  const set = db.prepare(`INSERT INTO system_settings (key, value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now','localtime')`);
  Object.entries(b).forEach(([k, v]) => set.run(k, String(v)));
  log(db, req, '更新系统设置');
  return ok(res, null, '设置已保存');
});

// ============ 操作日志 ============
router.get('/logs', requirePerm('log:view'), (req, res) => {
  const { page, pageSize, offset } = pageParams(req, { pageSize: 20 });
  const total = db.prepare('SELECT COUNT(*) c FROM operation_logs').get().c;
  const rows = db.prepare('SELECT * FROM operation_logs ORDER BY id DESC LIMIT ? OFFSET ?').all(pageSize, offset);
  return ok(res, pageResult(rows, total, page, pageSize));
});

// ============ 管理员个人信息 ============
router.get('/me', (req, res) => {
  return ok(res, {
    id: req.user.id,
    nickname: req.user.nickname,
    avatar: req.user.avatar,
    email: req.user.email,
    title: req.admin.title,
    roleName: req.role.name,
    roleCode: req.role.code,
    isOwner: isOwner(req),
    permissions: db.prepare(`
      SELECT p.code FROM role_permissions rp JOIN permissions p ON p.id = rp.permission_id WHERE rp.role_id = ?
    `).all(req.role.id).map((x) => x.code).concat(isOwner(req) ? [req.role.code] : []),
  });
});

module.exports = router;