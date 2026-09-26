// 软件路由：软件库、分类、合集、详情、下载/收藏/举报
const express = require('express');
const router = express.Router();
const db = require('../db');
const { ok, fail, pageParams, pageResult } = require('../utils/response');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { trackTask } = require('../services/growth');

const SOFT_SELECT = `
  SELECT s.*, c.name AS category_name, c.icon AS category_icon
  FROM software s LEFT JOIN software_categories c ON c.id = s.category_id
`;

// 软件列表：推荐/最新/热门/下载最多/收藏最多 + 分类/搜索
router.get('/', optionalAuth, (req, res) => {
  const { page, pageSize, offset } = pageParams(req, { pageSize: 12 });
  const sort = req.query.sort || 'recommend';
  const categoryId = req.query.categoryId;
  const kw = req.query.q;
  const viewerId = req.user ? req.user.id : null;

  let where = "s.status = 'normal'";
  const params = [];
  if (categoryId) { where += ' AND s.category_id = ?'; params.push(categoryId); }
  if (kw) { where += ' AND (s.name LIKE ? OR s.summary LIKE ? OR s.tags LIKE ?)'; params.push(`%${kw}%`, `%${kw}%`, `%${kw}%`); }

  const order = {
    recommend: 's.is_recommend DESC, s.download_count DESC',
    latest: 's.id DESC',
    hot: 's.is_hot DESC, s.download_count DESC',
    downloads: 's.download_count DESC',
    favorites: 's.favorite_count DESC',
    rating: 's.rating DESC',
  }[sort] || 's.id DESC';

  const total = db.prepare(`SELECT COUNT(*) c FROM software s WHERE ${where}`).get(...params).c;
  const rows = db.prepare(`${SOFT_SELECT} WHERE ${where} ORDER BY ${order} LIMIT ? OFFSET ?`).all(...params, pageSize, offset);
  const list = rows.map((s) => ({
    ...s,
    screenshots: JSON.parse(s.screenshots || '[]'),
    tags: JSON.parse(s.tags || '[]'),
    favorited: viewerId ? !!db.prepare(`SELECT 1 FROM favorites WHERE user_id = ? AND target_type = 'software' AND target_id = ?`).get(viewerId, s.id) : false,
  }));
  return ok(res, pageResult(list, total, page, pageSize));
});

// 分类列表
router.get('/categories', (req, res) => {
  const rows = db.prepare('SELECT * FROM software_categories ORDER BY sort').all();
  return ok(res, rows);
});

// 合集列表
router.get('/collections', (req, res) => {
  const rows = db.prepare(`SELECT * FROM software_collections WHERE status = 'normal' ORDER BY sort`).all();
  const list = rows.map((c) => ({ ...c, software_ids: JSON.parse(c.software_ids || '[]') }));
  return ok(res, list);
});

// 合集详情
router.get('/collections/:id', (req, res) => {
  const c = db.prepare(`SELECT * FROM software_collections WHERE id = ? AND status = 'normal'`).get(req.params.id);
  if (!c) return fail(res, '合集不存在', 1, 404);
  const ids = JSON.parse(c.software_ids || '[]');
  const list = ids.length
    ? db.prepare(`${SOFT_SELECT} WHERE s.id IN (${ids.map(() => '?').join(',')})`).all(...ids)
    : [];
  return ok(res, { ...c, software_list: list.map((s) => ({ ...s, screenshots: JSON.parse(s.screenshots || '[]'), tags: JSON.parse(s.tags || '[]') })) });
});

// 软件详情
router.get('/:id(\\d+)', optionalAuth, (req, res) => {
  const s = db.prepare(`${SOFT_SELECT} WHERE s.id = ?`).get(req.params.id);
  if (!s) return fail(res, '软件不存在', 1, 404);
  if (req.user) trackTask(req.user.id, 'browse');
  const versions = db.prepare('SELECT * FROM software_versions WHERE software_id = ? ORDER BY id DESC').all(s.id);
  const related = db.prepare(`${SOFT_SELECT} WHERE s.category_id = ? AND s.id != ? ORDER BY s.download_count DESC LIMIT 4`).all(s.category_id, s.id);
  const viewerId = req.user ? req.user.id : null;
  return ok(res, {
    ...s,
    screenshots: JSON.parse(s.screenshots || '[]'),
    tags: JSON.parse(s.tags || '[]'),
    versions,
    related: related.map((r) => ({ ...r, screenshots: JSON.parse(r.screenshots || '[]'), tags: JSON.parse(r.tags || '[]') })),
    favorited: viewerId ? !!db.prepare(`SELECT 1 FROM favorites WHERE user_id = ? AND target_type = 'software' AND target_id = ?`).get(viewerId, s.id) : false,
    my_rating: viewerId ? db.prepare('SELECT score, comment FROM software_ratings WHERE software_id = ? AND user_id = ?').get(s.id, viewerId) : null,
  });
});

// 下载（计数 + 返回地址）
// 防刷策略：登录用户同一软件仅首次计入下载量（重复下载不计）；
// 匿名用户按 IP 去重（24h 内同一 IP 同一软件只计一次）。
// 每次下载行为均写入 software_downloads 记录，供下载趋势统计。
router.post('/:id/download', optionalAuth, (req, res) => {
  const s = db.prepare('SELECT * FROM software WHERE id = ?').get(req.params.id);
  if (!s) return fail(res, '软件不存在', 1, 404);

  const uid = req.user ? req.user.id : null;
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString().slice(0, 64);
  let countIt = true;

  if (uid) {
    // 登录用户：整条历史上只首次计下载量
    const once = db.prepare('SELECT 1 FROM software_downloads WHERE software_id = ? AND user_id = ?').get(s.id, uid);
    countIt = !once;
  } else {
    // 匿名：24h 内同一 IP 只计一次
    const dayAgo = new Date(Date.now() - 86400000).toISOString().replace('T', ' ').slice(0, 19);
    const recent = db.prepare('SELECT 1 FROM software_downloads WHERE software_id = ? AND ip = ? AND created_at >= ?').get(s.id, ip, dayAgo);
    countIt = !recent;
  }

  db.prepare('INSERT INTO software_downloads (software_id, user_id, ip) VALUES (?,?,?)').run(s.id, uid, ip);
  if (countIt) db.prepare('UPDATE software SET download_count = download_count + 1 WHERE id = ?').run(s.id);
  if (req.user) trackTask(req.user.id, 'browse');
  const newCount = countIt ? s.download_count + 1 : s.download_count;
  return ok(res, { download_url: s.download_url || '#', download_count: newCount }, countIt ? '开始下载' : '已在下载队列中');
});

// 提交/更新评分（1-5 星，每人每软件一条，可改分）
router.post('/:id/rating', requireAuth, (req, res) => {
  const s = db.prepare('SELECT * FROM software WHERE id = ?').get(req.params.id);
  if (!s) return fail(res, '软件不存在', 1, 404);
  const score = Math.round(Number((req.body || {}).score));
  const comment = String((req.body || {}).comment || '').slice(0, 200);
  if (![1, 2, 3, 4, 5].includes(score)) return fail(res, '评分需为 1-5 星', 1, 400);

  const exists = db.prepare('SELECT * FROM software_ratings WHERE software_id = ? AND user_id = ?').get(s.id, req.user.id);
  const finalComment = comment || (exists ? exists.comment : '');
  if (exists) {
    db.prepare('UPDATE software_ratings SET score = ?, comment = ?, updated_at = datetime(\'now\',\'localtime\') WHERE id = ?')
      .run(score, finalComment, exists.id);
  } else {
    db.prepare('INSERT INTO software_ratings (software_id, user_id, score, comment) VALUES (?,?,?,?)')
      .run(s.id, req.user.id, score, comment);
  }
  // 重算评分均值与评分人数
  const agg = db.prepare('SELECT AVG(score) a, COUNT(*) c FROM software_ratings WHERE software_id = ?').get(s.id);
  const rating = agg.a ? Math.round(agg.a * 10) / 10 : 0;
  db.prepare('UPDATE software SET rating = ?, rating_count = ? WHERE id = ?').run(rating, agg.c, s.id);
  const r = db.prepare('SELECT * FROM software_ratings WHERE software_id = ? AND user_id = ?').get(s.id, req.user.id);
  return ok(res, { my_rating: r, rating, rating_count: agg.c }, exists ? '评分已更新' : '评分成功，感谢反馈');
});

// 软件评分列表（按时间倒序，含评价人昵称）
router.get('/:id(\\d+)/ratings', optionalAuth, (req, res) => {
  const s = db.prepare('SELECT id, name FROM software WHERE id = ?').get(req.params.id);
  if (!s) return fail(res, '软件不存在', 1, 404);
  const rows = db.prepare(`
    SELECT r.id, r.score, r.comment, r.created_at, u.id AS user_id, u.nickname, u.avatar
    FROM software_ratings r JOIN users u ON u.id = r.user_id
    WHERE r.software_id = ? ORDER BY r.id DESC LIMIT 50`).all(s.id);
  const me = req.user
    ? db.prepare('SELECT score, comment, created_at FROM software_ratings WHERE software_id = ? AND user_id = ?').get(s.id, req.user.id)
    : null;
  return ok(res, { software_id: s.id, list: rows, my_rating: me });
});

// 收藏软件
router.post('/:id/favorite', requireAuth, (req, res) => {
  const s = db.prepare('SELECT * FROM software WHERE id = ?').get(req.params.id);
  if (!s) return fail(res, '软件不存在', 1, 404);
  const exists = db.prepare(`SELECT 1 FROM favorites WHERE user_id = ? AND target_type = 'software' AND target_id = ?`).get(req.user.id, s.id);
  if (exists) return fail(res, '已经收藏过了', 1, 400);
  db.prepare('INSERT INTO favorites (user_id, target_type, target_id) VALUES (?,?,?)').run(req.user.id, 'software', s.id);
  db.prepare('UPDATE software SET favorite_count = favorite_count + 1 WHERE id = ?').run(s.id);
  db.prepare('UPDATE users SET favorite_count = favorite_count + 1 WHERE id = ?').run(req.user.id);
  trackTask(req.user.id, 'favorite');
  return ok(res, { favorited: true, favorite_count: s.favorite_count + 1 }, '收藏成功');
});

router.delete('/:id/favorite', requireAuth, (req, res) => {
  db.prepare(`DELETE FROM favorites WHERE user_id = ? AND target_type = 'software' AND target_id = ?`).run(req.user.id, req.params.id);
  db.prepare('UPDATE software SET favorite_count = MAX(0, favorite_count - 1) WHERE id = ?').run(req.params.id);
  db.prepare('UPDATE users SET favorite_count = MAX(0, favorite_count - 1) WHERE id = ?').run(req.user.id);
  const s = db.prepare('SELECT favorite_count FROM software WHERE id = ?').get(req.params.id);
  return ok(res, { favorited: false, favorite_count: s ? s.favorite_count : 0 }, '已取消收藏');
});

// 举报软件
router.post('/:id/report', requireAuth, (req, res) => {
  const { reason, detail } = req.body || {};
  if (!reason) return fail(res, '请选择举报原因', 1, 400);
  db.prepare('INSERT INTO reports (reporter_id, target_type, target_id, reason, detail) VALUES (?,?,?,?,?)')
    .run(req.user.id, 'software', req.params.id, reason, detail || '');
  return ok(res, null, '举报已提交，感谢你的反馈');
});

module.exports = router;