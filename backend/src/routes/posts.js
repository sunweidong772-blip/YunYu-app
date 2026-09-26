// 社区路由：帖子、评论、点赞、话题
const express = require('express');
const router = express.Router();
const db = require('../db');
const { ok, fail, pageParams, pageResult } = require('../utils/response');
const { requireAuth, optionalAuth, requireActive } = require('../middleware/auth');
const { trackTask } = require('../services/growth');

const { limitByIp } = require('../middleware/rateLimit');

// 帖子列表视图（含作者信息与我的互动状态）
function postView(p, viewerId) {
  const v = {
    id: p.id,
    title: p.title,
    content: p.content,
    images: JSON.parse(p.images || '[]'),
    tags: JSON.parse(p.tags || '[]'),
    like_count: p.like_count,
    comment_count: p.comment_count,
    favorite_count: p.favorite_count,
    view_count: p.view_count,
    is_pinned: p.is_pinned,
    is_featured: p.is_featured,
    created_at: p.created_at,
    updated_at: p.updated_at,
    user: { id: p.user_id, uid: p.uid, nickname: p.nickname, avatar: p.avatar, lv: p.lv, bio: p.bio, role_type: p.role_type },
    topic: p.topic_id ? { id: p.topic_id, name: p.topic_name, icon: p.topic_icon } : null,
    software: p.software_id ? { id: p.software_id, name: p.software_name } : null,
  };
  if (viewerId) {
    v.liked = !!db.prepare(`SELECT 1 FROM likes WHERE user_id = ? AND target_type = 'post' AND target_id = ?`).get(viewerId, p.id);
    v.favorited = !!db.prepare(`SELECT 1 FROM favorites WHERE user_id = ? AND target_type = 'post' AND target_id = ?`).get(viewerId, p.id);
  } else {
    v.liked = false; v.favorited = false;
  }
  return v;
}

const POST_SELECT = `
  SELECT p.*, u.uid, u.nickname, u.avatar, u.lv, u.bio, u.role_type,
    t.name AS topic_name, t.icon AS topic_icon,
    s.name AS software_name
  FROM posts p
  JOIN users u ON u.id = p.user_id
  LEFT JOIN topics t ON t.id = p.topic_id
  LEFT JOIN software s ON s.id = p.software_id
`;

// 社区信息流：推荐/热门/最新/关注/分类话题
router.get('/', optionalAuth, (req, res) => {
  const { page, pageSize, offset } = pageParams(req, { pageSize: 10 });
  const sort = req.query.sort || 'recommend';
  const topicId = req.query.topicId;
  const userId = req.query.userId;
  const kw = req.query.q;
  const viewerId = req.user ? req.user.id : null;

  let where = "p.status != 'deleted' AND p.is_hidden = 0";
  const params = [];
  if (topicId) { where += ' AND p.topic_id = ?'; params.push(topicId); }
  if (userId) { where += ' AND p.user_id = ?'; params.push(userId); }
  if (kw) { where += ' AND (p.title LIKE ? OR p.content LIKE ?)'; params.push(`%${kw}%`, `%${kw}%`); }
  if (sort === 'follow' && viewerId) {
    where += ' AND EXISTS (SELECT 1 FROM follows f WHERE f.follower_id = ? AND f.following_id = p.user_id)';
    params.unshift(viewerId);
  }

  const order = {
    hot: 'p.like_count + p.comment_count * 2 + p.view_count * 0.1 DESC',
    latest: 'p.id DESC',
    recommend: 'p.is_pinned DESC, p.is_featured DESC, p.like_count + p.comment_count * 2 DESC',
    follow: 'p.id DESC',
  }[sort] || 'p.id DESC';

  const total = db.prepare(`SELECT COUNT(*) c FROM posts p WHERE ${where}`).get(...params).c;
  const rows = db.prepare(`${POST_SELECT} WHERE ${where} ORDER BY ${order} LIMIT ? OFFSET ?`).all(...params, pageSize, offset);
  return ok(res, pageResult(rows.map((p) => postView(p, viewerId)), total, page, pageSize));
});

// 帖子详情
router.get('/:id(\\d+)', optionalAuth, (req, res) => {
  const p = db.prepare(`${POST_SELECT} WHERE p.id = ?`).get(req.params.id);
  if (!p) return fail(res, '帖子不存在', 1, 404);
  if (p.is_hidden && (!req.user || req.user.id !== p.user_id)) return fail(res, '帖子不存在', 1, 404);
  db.prepare('UPDATE posts SET view_count = view_count + 1 WHERE id = ?').run(p.id);
  p.view_count += 1;
  return ok(res, postView(p, req.user ? req.user.id : null));
});

// 发帖（限流：同一 IP 5 分钟最多 5 次发帖）
router.post('/', requireActive, limitByIp(5, 300000, 'post'), (req, res) => {
  const { title, content, images, tags, topicId, softwareId } = req.body || {};
  const t = String(title || '').trim();
  if (!t) return fail(res, '请填写标题', 1, 400);
  if (t.length < 2 || t.length > 60) return fail(res, '标题长度需在 2-60 个字符之间', 1, 400);
  if (!content || !String(content).trim()) return fail(res, '请填写正文内容', 1, 400);

  const info = db.prepare(
    'INSERT INTO posts (user_id, title, content, images, topic_id, software_id, tags) VALUES (?,?,?,?,?,?,?)'
  ).run(
    req.user.id, t, String(content),
    JSON.stringify(Array.isArray(images) ? images.slice(0, 9) : []),
    topicId || null, softwareId || null,
    JSON.stringify(Array.isArray(tags) ? tags.slice(0, 5) : [])
  );
  db.prepare('UPDATE users SET post_count = post_count + 1 WHERE id = ?').run(req.user.id);
  if (topicId) db.prepare('UPDATE topics SET post_count = post_count + 1 WHERE id = ?').run(topicId);
  trackTask(req.user.id, 'post');
  return ok(res, { id: info.lastInsertRowid }, '发布成功');
});

// 编辑帖子
router.put('/:id', requireAuth, (req, res) => {
  const p = db.prepare(`SELECT * FROM posts WHERE id = ? AND status != 'deleted'`).get(req.params.id);
  if (!p) return fail(res, '帖子不存在', 1, 404);
  const isAdmin = !!db.prepare('SELECT 1 FROM admins WHERE user_id = ?').get(req.user.id);
  if (p.user_id !== req.user.id && !isAdmin) return fail(res, '没有权限编辑该帖子', 403, 403);

  const { title, content, images, tags, topicId } = req.body || {};
  if (title !== undefined && (!String(title).trim() || String(title).length > 60)) return fail(res, '标题长度需在 2-60 个字符之间', 1, 400);
  if (content !== undefined && !String(content).trim()) return fail(res, '正文不能为空', 1, 400);

  db.prepare(`UPDATE posts SET
    title = COALESCE(?, title),
    content = COALESCE(?, content),
    images = COALESCE(?, images),
    tags = COALESCE(?, tags),
    topic_id = COALESCE(?, topic_id),
    updated_at = datetime('now','localtime')
    WHERE id = ?`)
    .run(
      title !== undefined ? String(title).trim() : null,
      content !== undefined ? String(content) : null,
      images !== undefined ? JSON.stringify(images) : null,
      tags !== undefined ? JSON.stringify(tags) : null,
      topicId !== undefined ? (topicId || null) : null,
      p.id
    );
  return ok(res, { id: p.id }, '帖子已更新');
});

// 删除帖子
router.delete('/:id', requireAuth, (req, res) => {
  const p = db.prepare(`SELECT * FROM posts WHERE id = ? AND status != 'deleted'`).get(req.params.id);
  if (!p) return fail(res, '帖子不存在', 1, 404);
  const isAdmin = !!db.prepare('SELECT 1 FROM admins WHERE user_id = ?').get(req.user.id);
  if (p.user_id !== req.user.id && !isAdmin) return fail(res, '没有权限删除该帖子', 403, 403);
  db.prepare("UPDATE posts SET status = 'deleted' WHERE id = ?").run(p.id);
  db.prepare('UPDATE users SET post_count = MAX(0, post_count - 1) WHERE id = ?').run(p.user_id);
  return ok(res, null, '帖子已删除');
});

// 点赞帖子
router.post('/:id/like', requireAuth, (req, res) => {
  const p = db.prepare(`SELECT * FROM posts WHERE id = ? AND status != 'deleted'`).get(req.params.id);
  if (!p) return fail(res, '帖子不存在', 1, 404);
  const exists = db.prepare(`SELECT 1 FROM likes WHERE user_id = ? AND target_type = 'post' AND target_id = ?`).get(req.user.id, p.id);
  if (exists) return fail(res, '已经点过赞了', 1, 400);
  db.prepare('INSERT INTO likes (user_id, target_type, target_id) VALUES (?,?,?)').run(req.user.id, 'post', p.id);
  db.prepare('UPDATE posts SET like_count = like_count + 1 WHERE id = ?').run(p.id);
  db.prepare('UPDATE users SET like_count = like_count + 1 WHERE id = ?').run(p.user_id);
  trackTask(req.user.id, 'like');
  // 通知作者
  if (p.user_id !== req.user.id) {
    db.prepare('INSERT INTO notifications (user_id, type, actor_id, title, content, target_type, target_id) VALUES (?,?,?,?,?,?,?)')
      .run(p.user_id, 'like', req.user.id, '', `${req.user.nickname} 赞了你的帖子《${p.title}》`, 'post', p.id);
  }
  return ok(res, { liked: true, like_count: p.like_count + 1 }, '点赞成功');
});

// 取消点赞
router.delete('/:id/like', requireAuth, (req, res) => {
  const p = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
  if (!p) return fail(res, '帖子不存在', 1, 404);
  db.prepare(`DELETE FROM likes WHERE user_id = ? AND target_type = 'post' AND target_id = ?`).run(req.user.id, p.id);
  db.prepare('UPDATE posts SET like_count = MAX(0, like_count - 1) WHERE id = ?').run(p.id);
  db.prepare('UPDATE users SET like_count = MAX(0, like_count - 1) WHERE id = ?').run(p.user_id);
  return ok(res, { liked: false, like_count: Math.max(0, p.like_count - 1) }, '已取消点赞');
});

// 收藏帖子
router.post('/:id/favorite', requireAuth, (req, res) => {
  const p = db.prepare(`SELECT * FROM posts WHERE id = ? AND status != 'deleted'`).get(req.params.id);
  if (!p) return fail(res, '帖子不存在', 1, 404);
  const exists = db.prepare(`SELECT 1 FROM favorites WHERE user_id = ? AND target_type = 'post' AND target_id = ?`).get(req.user.id, p.id);
  if (exists) return fail(res, '已经收藏过了', 1, 400);
  db.prepare('INSERT INTO favorites (user_id, target_type, target_id) VALUES (?,?,?)').run(req.user.id, 'post', p.id);
  db.prepare('UPDATE posts SET favorite_count = favorite_count + 1 WHERE id = ?').run(p.id);
  trackTask(req.user.id, 'favorite');
  return ok(res, { favorited: true, favorite_count: p.favorite_count + 1 }, '收藏成功');
});

// 取消收藏帖子
router.delete('/:id/favorite', requireAuth, (req, res) => {
  db.prepare(`DELETE FROM favorites WHERE user_id = ? AND target_type = 'post' AND target_id = ?`).run(req.user.id, req.params.id);
  db.prepare('UPDATE posts SET favorite_count = MAX(0, favorite_count - 1) WHERE id = ?').run(req.params.id);
  const p = db.prepare('SELECT favorite_count FROM posts WHERE id = ?').get(req.params.id);
  return ok(res, { favorited: false, favorite_count: p ? p.favorite_count : 0 }, '已取消收藏');
});

// 评论区
router.get('/:id/comments', optionalAuth, (req, res) => {
  const { page, pageSize, offset } = pageParams(req, { pageSize: 20 });
  const postId = req.params.id;
  const sort = req.query.sort || 'latest'; // hot / latest
  const total = db.prepare(`SELECT COUNT(*) c FROM comments WHERE post_id = ? AND status != 'deleted'`).get(postId).c;
  const order = sort === 'hot' ? 'c.like_count DESC, c.id ASC' : 'c.id DESC';
  const rows = db.prepare(`
    SELECT c.*, u.nickname, u.avatar, u.lv, u.role_type,
      ru.nickname AS reply_to_nickname
    FROM comments c
    JOIN users u ON u.id = c.user_id
    LEFT JOIN users ru ON ru.id = c.reply_to_user_id
    WHERE c.post_id = ? AND c.status != 'deleted'
    ORDER BY ${order} LIMIT ? OFFSET ?
  `).all(postId, pageSize, offset);
  const list = rows.map((c) => ({
    ...c,
    liked: req.user ? !!db.prepare(`SELECT 1 FROM likes WHERE user_id = ? AND target_type = 'comment' AND target_id = ?`).get(req.user.id, c.id) : false,
    replies: db.prepare(`SELECT COUNT(*) c FROM comments WHERE parent_id = ? AND status != 'deleted'`).get(c.id).c,
  }));
  return ok(res, pageResult(list, total, page, pageSize));
});

// 发表评论 / 回复（限流：同一 IP 5 分钟最多 15 次评论）
router.post('/:id/comments', requireActive, limitByIp(15, 300000, 'comment'), (req, res) => {
  const { content, parentId, replyToUserId } = req.body || {};
  const post = db.prepare(`SELECT * FROM posts WHERE id = ? AND status != 'deleted'`).get(req.params.id);
  if (!post) return fail(res, '帖子不存在', 1, 404);
  const c = String(content || '').trim();
  if (!c) return fail(res, '评论内容不能为空', 1, 400);
  if (c.length > 500) return fail(res, '评论最多 500 字', 1, 400);

  const info = db.prepare(
    'INSERT INTO comments (post_id, user_id, parent_id, reply_to_user_id, content) VALUES (?,?,?,?,?)'
  ).run(post.id, req.user.id, parentId || null, replyToUserId || null, c);
  db.prepare('UPDATE posts SET comment_count = comment_count + 1 WHERE id = ?').run(post.id);
  db.prepare('UPDATE users SET comment_count = comment_count + 1 WHERE id = ?').run(req.user.id);
  trackTask(req.user.id, 'comment');
  // 通知楼主 / 被回复人
  const notifyUserId = parentId ? replyToUserId : post.user_id;
  if (notifyUserId && notifyUserId !== req.user.id) {
    const nType = parentId ? 'reply' : 'comment';
    const targetName = parentId ? '你的评论' : `你的帖子《${post.title}》`;
    db.prepare('INSERT INTO notifications (user_id, type, actor_id, title, content, target_type, target_id) VALUES (?,?,?,?,?,?,?)')
      .run(notifyUserId, nType, req.user.id, '', `${req.user.nickname} 回复了${targetName}`, 'post', post.id);
  }
  return ok(res, { id: info.lastInsertRowid }, '评论成功');
});

// 评论点赞
router.post('/comments/:id/like', requireAuth, (req, res) => {
  const c = db.prepare(`SELECT * FROM comments WHERE id = ? AND status != 'deleted'`).get(req.params.id);
  if (!c) return fail(res, '评论不存在', 1, 404);
  const exists = db.prepare(`SELECT 1 FROM likes WHERE user_id = ? AND target_type = 'comment' AND target_id = ?`).get(req.user.id, c.id);
  if (exists) return fail(res, '已经点过赞了', 1, 400);
  db.prepare('INSERT INTO likes (user_id, target_type, target_id) VALUES (?,?,?)').run(req.user.id, 'comment', c.id);
  db.prepare('UPDATE comments SET like_count = like_count + 1 WHERE id = ?').run(c.id);
  return ok(res, { liked: true, like_count: c.like_count + 1 }, '点赞成功');
});

router.delete('/comments/:id/like', requireAuth, (req, res) => {
  db.prepare(`DELETE FROM likes WHERE user_id = ? AND target_type = 'comment' AND target_id = ?`).run(req.user.id, req.params.id);
  db.prepare('UPDATE comments SET like_count = MAX(0, like_count - 1) WHERE id = ?').run(req.params.id);
  const c = db.prepare('SELECT like_count FROM comments WHERE id = ?').get(req.params.id);
  return ok(res, { liked: false, like_count: c ? c.like_count : 0 }, '已取消点赞');
});

// 删除评论
router.delete('/comments/:id', requireAuth, (req, res) => {
  const c = db.prepare(`SELECT * FROM comments WHERE id = ? AND status != 'deleted'`).get(req.params.id);
  if (!c) return fail(res, '评论不存在', 1, 404);
  const isAdmin = !!db.prepare('SELECT 1 FROM admins WHERE user_id = ?').get(req.user.id);
  if (c.user_id !== req.user.id && !isAdmin) return fail(res, '没有权限删除该评论', 403, 403);
  db.prepare("UPDATE comments SET status = 'deleted' WHERE id = ?").run(c.id);
  db.prepare('UPDATE posts SET comment_count = MAX(0, comment_count - 1) WHERE id = ?').run(c.post_id);
  db.prepare('UPDATE users SET comment_count = MAX(0, comment_count - 1) WHERE id = ?').run(c.user_id);
  return ok(res, null, '评论已删除');
});

// 举报帖子
router.post('/:id/report', requireAuth, (req, res) => {
  const { reason, detail } = req.body || {};
  if (!reason) return fail(res, '请选择举报原因', 1, 400);
  db.prepare('INSERT INTO reports (reporter_id, target_type, target_id, reason, detail) VALUES (?,?,?,?,?)')
    .run(req.user.id, 'post', req.params.id, reason, detail || '');
  return ok(res, null, '举报已提交，感谢你的反馈');
});

// 话题列表
router.get('/topics', optionalAuth, (req, res) => {
  const rows = db.prepare(`SELECT * FROM topics WHERE status = 'normal' ORDER BY is_hot DESC, post_count DESC`).all();
  return ok(res, rows);
});

// 热门用户 / 热门话题（首页社区热门）
router.get('/hot-users', (req, res) => {
  const rows = db.prepare(`SELECT id, uid, nickname, avatar, bio, lv, exp, like_count FROM users WHERE role_type != 'admin' ORDER BY like_count DESC, exp DESC LIMIT 6`).all();
  return ok(res, rows);
});

module.exports = router;