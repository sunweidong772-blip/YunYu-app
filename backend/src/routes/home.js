// 首页与公告路由
const express = require('express');
const router = express.Router();
const db = require('../db');
const { ok, fail, pageParams, pageResult } = require('../utils/response');
const { optionalAuth, requireAuth } = require('../middleware/auth');

// 首页聚合数据
router.get('/home', optionalAuth, (req, res) => {
  const banners = db.prepare(`SELECT * FROM software WHERE is_banner = 1 AND status = 'normal' ORDER BY download_count DESC LIMIT 5`).all();
  const announcements = db.prepare("SELECT * FROM announcements WHERE is_published = 1 AND type IN ('home','activity') ORDER BY is_pinned DESC, publish_time DESC LIMIT 5").all();

  const recommendSoft = db.prepare(`SELECT * FROM software WHERE is_recommend = 1 AND status = 'normal' ORDER BY download_count DESC LIMIT 8`).all();
  const latestSoft = db.prepare(`SELECT * FROM software WHERE status = 'normal' ORDER BY id DESC LIMIT 8`).all();
  const hotSoft = db.prepare(`SELECT * FROM software WHERE is_hot = 1 AND status = 'normal' ORDER BY download_count DESC LIMIT 8`).all();
  const featuredCollections = db.prepare(`SELECT * FROM software_collections WHERE status = 'normal' ORDER BY sort LIMIT 6`).all();

  const hotPosts = db.prepare(`
    SELECT p.id, p.title, p.like_count, p.comment_count, p.created_at, u.nickname, u.avatar, u.lv
    FROM posts p JOIN users u ON u.id = p.user_id
    WHERE p.status = 'normal' AND p.is_hidden = 0
    ORDER BY p.like_count + p.comment_count * 2 DESC LIMIT 6`).all();
  const hotTopics = db.prepare(`SELECT * FROM topics WHERE status = 'normal' AND is_hot = 1 ORDER BY post_count DESC LIMIT 6`).all();
  const hotUsers = db.prepare(`SELECT id, uid, nickname, avatar, bio, lv, exp, like_count FROM users WHERE status = 'normal' AND role_type != 'admin' ORDER BY like_count DESC, exp DESC LIMIT 6`).all();

  const viewerId = req.user ? req.user.id : null;
  const viewer = req.user;
  let todayDone = false;
  if (viewer) {
    const today = new Date().toISOString().slice(0, 10);
    todayDone = !!db.prepare('SELECT 1 FROM checkins WHERE user_id = ? AND date = ?').get(viewer.id, today);
  }

  return ok(res, {
    banners: banners.map((b) => ({ ...b, tags: JSON.parse(b.tags || '[]') })),
    announcements,
    recommendSoft: recommendSoft.map((s) => ({ ...s, tags: JSON.parse(s.tags || '[]'), favorited: viewerId ? !!db.prepare(`SELECT 1 FROM favorites WHERE user_id = ? AND target_type = 'software' AND target_id = ?`).get(viewerId, s.id) : false })),
    latestSoft: latestSoft.map((s) => ({ ...s, tags: JSON.parse(s.tags || '[]') })),
    hotSoft: hotSoft.map((s) => ({ ...s, tags: JSON.parse(s.tags || '[]') })),
    featuredCollections: featuredCollections.map((c) => ({ ...c, software_ids: JSON.parse(c.software_ids || '[]') })),
    hotPosts, hotTopics, hotUsers,
    unreadCount: viewer ? db.prepare('SELECT COUNT(*) c FROM notifications WHERE user_id = ? AND is_read = 0').get(viewer.id).c : 0,
    checkedToday: todayDone,
  });
});

// 公告列表
router.get('/announcements', (req, res) => {
  const { type } = req.query;
  let sql = 'SELECT * FROM announcements WHERE is_published = 1';
  const params = [];
  if (type && type !== 'all') { sql += ' AND type = ?'; params.push(type); }
  sql += ' ORDER BY is_pinned DESC, publish_time DESC LIMIT 30';
  return ok(res, db.prepare(sql).all(...params));
});

// 公告详情
router.get('/announcements/:id', (req, res) => {
  const a = db.prepare('SELECT * FROM announcements WHERE id = ?').get(req.params.id);
  if (!a) return fail(res, '公告不存在', 1, 404);
  return ok(res, a);
});

function highlight(text, kw) {
  if (!text || !kw) return text || '';
  const re = new RegExp(`(${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(re, '<mark>$1</mark>');
}

// 全局搜索（软件 + 帖子 + 用户）
router.get('/search', optionalAuth, (req, res) => {
  const kw = String(req.query.q || '').trim();
  if (!kw) return ok(res, { software: [], posts: [], users: [] });

  // 记录搜索历史
  if (req.user) {
    try {
      db.prepare('INSERT INTO search_history (user_id, keyword, created_at) VALUES (?, ?, datetime("now","localtime"))').run(req.user.id, kw);
    } catch (e) { /* ignore */ }
  }

  const like = `%${kw}%`;
  const software = db.prepare(`SELECT id, name, icon, icon_color, summary, category_id, download_count FROM software WHERE status = 'normal' AND (name LIKE ? OR summary LIKE ?) ORDER BY download_count DESC LIMIT 10`).all(like, like);
  const posts = db.prepare(`SELECT id, title, like_count, comment_count, created_at FROM posts WHERE status = 'normal' AND is_hidden = 0 AND (title LIKE ? OR content LIKE ?) ORDER BY like_count + comment_count DESC LIMIT 10`).all(like, like);
  const users = db.prepare(`SELECT id, uid, nickname, avatar, bio, lv, like_count FROM users WHERE status = 'normal' AND nickname LIKE ? ORDER BY like_count DESC LIMIT 10`).all(like);

  return ok(res, {
    software: software.map(s => ({ ...s, highlighted: highlight(s.name, kw) })),
    posts: posts.map(p => ({ ...p, highlighted: highlight(p.title, kw) })),
    users: users.map(u => ({ ...u, highlighted: highlight(u.nickname, kw) })),
  });
});

// 热门搜索词 TOP10（最近 7 天）
router.get('/search/hot', (req, res) => {
  const rows = db.prepare(`
    SELECT keyword, COUNT(*) as count FROM search_history
    WHERE created_at >= datetime('now', '-7 days')
    GROUP BY keyword
    ORDER BY count DESC
    LIMIT 10
  `).all();
  return ok(res, rows);
});

// 当前用户搜索历史（最近 10 条）
router.get('/search/history', requireAuth, (req, res) => {
  const rows = db.prepare(`
    SELECT DISTINCT keyword, MAX(created_at) as created_at FROM search_history
    WHERE user_id = ?
    GROUP BY keyword
    ORDER BY created_at DESC
    LIMIT 10
  `).all(req.user.id);
  return ok(res, rows);
});

// 清空当前用户搜索历史
router.delete('/search/history', requireAuth, (req, res) => {
  db.prepare('DELETE FROM search_history WHERE user_id = ?').run(req.user.id);
  return ok(res, { cleared: true });
});

// 关于云屿
router.get('/about', (req, res) => {
  return ok(res, {
    name: '云屿',
    slogan: '软件好找 · 社区好逛 · 内容好玩',
    version: '1.0.0',
    description: '云屿是一个软件聚合社区，汇集实用软件、工具与兴趣社群。在这里发现好软件、分享好内容、认识同频的朋友。',
    stats: {
      software: db.prepare(`SELECT COUNT(*) c FROM software WHERE status='normal'`).get().c,
      users: db.prepare('SELECT COUNT(*) c FROM users').get().c,
      posts: db.prepare(`SELECT COUNT(*) c FROM posts WHERE status='normal'`).get().c,
    },
  });
});

module.exports = router;