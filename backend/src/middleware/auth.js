// 认证与授权中间件
const db = require('../db');
const { verifyToken } = require('../utils/token');
const { fail } = require('../utils/response');

function publicUser(u) {
  if (!u) return null;
  return {
    id: u.id,
    uid: u.uid,
    nickname: u.nickname,
    avatar: u.avatar,
    bio: u.bio,
    lv: u.lv,
    exp: u.exp,
    role_type: u.role_type,
    like_count: u.like_count,
    post_count: u.post_count,
    comment_count: u.comment_count,
    favorite_count: u.favorite_count,
    checkin_streak: u.checkin_streak,
    checkin_total: u.checkin_total,
    created_at: u.created_at,
  };
}

// 注入当前用户（可选）
function optionalAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (token) {
    try {
      const payload = verifyToken(token);
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.uid);
      if (user && user.status !== 'banned') req.user = user;
    } catch (e) { /* token 无效则按匿名处理 */ }
  }
  next();
}

// 必须登录
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return fail(res, '请先登录', 401, 401);
  try {
    const payload = verifyToken(token);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.uid);
    if (!user) return fail(res, '账号不存在', 401, 401);
    if (user.status === 'banned') return fail(res, '账号已被封禁，无法操作', 403, 403);
    if (user.status === 'suspended') return fail(res, '账号已被暂停，请联系管理员', 403, 403);
    if (user.status === 'deleted') return fail(res, '账号已注销', 401, 401);
    req.user = user;
    next();
  } catch (e) {
    return fail(res, '登录已过期，请重新登录', 401, 401);
  }
}

// 必须管理员（用户需在 admins 表且有角色）
function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    const admin = db.prepare('SELECT * FROM admins WHERE user_id = ?').get(req.user.id);
    if (!admin) return fail(res, '无权访问管理后台', 403, 403);
    const role = db.prepare('SELECT * FROM roles WHERE id = ?').get(admin.role_id);
    if (!role) return fail(res, '管理员角色不存在', 403, 403);
    if (req.user.status === 'muted') return fail(res, '账号被禁言，无法操作后台', 403, 403);
    req.admin = admin;
    req.role = role;
    next();
  });
}

// 权限校验（必须 requireAdmin 之后调用）
function requirePerm(permCode) {
  return (req, res, next) => {
    if (!req.role) return fail(res, '权限校验失败', 403, 403);
    // 云屿岛主拥有全部权限
    if (req.role.code === 'owner' || req.role.is_system && req.role.code === 'owner') return next();
    const p = db.prepare(
      'SELECT 1 FROM role_permissions rp JOIN permissions p ON p.id = rp.permission_id WHERE rp.role_id = ? AND p.code = ?'
    ).get(req.role.id, permCode);
    if (!p) return fail(res, '没有执行该操作的权限', 403, 403);
    next();
  };
}

// 校验用户状态（禁言用户禁止发帖/评论等）
function requireActive(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.status === 'muted') return fail(res, '你已被禁言，暂时无法发布内容', 403, 403);
    next();
  });
}

module.exports = { publicUser, optionalAuth, requireAuth, requireAdmin, requirePerm, requireActive };