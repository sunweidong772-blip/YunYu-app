// 账号体系路由：注册、登录、找回密码、修改邮箱/密码
const express = require('express');
const router = express.Router();
const db = require('../db');
const config = require('../config');
const jwt = require('jsonwebtoken');
const { ok, fail } = require('../utils/response');
const { hashPassword, verifyPassword, normalizeEmail } = require('../utils/crypto');
const { signToken } = require('../utils/token');
const { sendCode, verifyCode } = require('../services/emailCode');
const { publicUser, requireAuth } = require('../middleware/auth');
const { addExp } = require('../services/growth');
const { localDateTimeStr } = require('../utils/date');

const { limitSendCode, limitRegister, limitLogin, clearLoginFail, markLoginFail } = require('../middleware/rateLimit');

// 生成 UID
function genUid() {
  let uid;
  do {
    uid = 'U' + String(Date.now()).slice(-6) + String(Math.floor(Math.random() * 9000 + 1000));
  } while (db.prepare('SELECT 1 FROM users WHERE uid = ?').get(uid));
  return uid;
}

// 生成登录会话记录
function createSession(user, req) {
  const token = signToken({ uid: user.id });
  const expiresAt = localDateTimeStr(new Date(Date.now() + 7 * 24 * 3600000));
  db.prepare('INSERT INTO login_sessions (user_id, token, device, ip, expires_at) VALUES (?,?,?,?,?)')
    .run(user.id, token, req.headers['user-agent'] ? String(req.headers['user-agent']).slice(0, 120) : 'unknown', req.ip || '', expiresAt);
  return token;
}

// 生成刷新令牌（有效期30天，半期15天）
function createRefreshToken(user) {
  const refreshToken = jwt.sign({ uid: user.id, type: 'refresh' }, config.jwtSecret, { expiresIn: '30d' });
  return refreshToken;
}

// 验证刷新令牌
function verifyRefreshToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

// 发送验证码（注册 / 找回密码 / 修改邮箱）
router.post('/send-code', limitSendCode, async (req, res) => {
  const { email, purpose = 'register' } = req.body || {};
  const em = normalizeEmail(email);

  if (purpose === 'register') {
    const exists = db.prepare('SELECT * FROM users WHERE email = ?').get(em);
    if (exists) return fail(res, '该邮箱已经注册，请直接登录');
  }
  if (purpose === 'reset_password') {
    const exists = db.prepare('SELECT * FROM users WHERE email = ?').get(em);
    if (!exists) return fail(res, '该邮箱尚未注册');
  }
  if (purpose === 'change_email') {
    const exists = db.prepare('SELECT * FROM users WHERE email = ?').get(em);
    if (exists) return fail(res, '该邮箱已被注册，请更换其他邮箱');
  }

  const r = await sendCode(em, purpose);
  if (!r.ok) return fail(res, r.message, 1, 400);
  // 开发模式下返回 devCode 便于在没有真实 SMTP 时完整演示流程
  return ok(res, { cooldown: 0, devCode: r.devCode || null, smtpConfigured: r.smtpConfigured }, r.message);
});

// 校验验证码（注册第二步 / 找回密码第二步）
router.post('/verify-code', (req, res) => {
  const { email, purpose = 'register', code } = req.body || {};
  const r = verifyCode(email, purpose, code);
  if (!r.ok) return fail(res, r.message, 1, 400);
  return ok(res, { verified: true }, '验证成功');
});

// 注册：邮箱 + 验证码 + 昵称 + 密码 + 确认密码
router.post('/register', limitRegister, (req, res) => {
  const { email, code, nickname, password, confirmPassword, agree } = req.body || {};
  const em = normalizeEmail(email);

  if (!em || !code || !nickname || !password) return fail(res, '请填写完整注册信息', 1, 400);
  if (password.length < 6) return fail(res, '密码至少 6 位', 1, 400);
  if (password !== confirmPassword) return fail(res, '两次输入的密码不一致', 1, 400);
  if (!agree) return fail(res, '请先同意用户协议与隐私政策', 1, 400);
  const nick = String(nickname).trim();
  if (nick.length < 2 || nick.length > 16) return fail(res, '昵称长度需在 2-16 个字符之间', 1, 400);

  const existsEmail = db.prepare('SELECT * FROM users WHERE email = ?').get(em);
  if (existsEmail) return fail(res, '该邮箱已经注册，请直接登录', 1, 400);
  const existsNick = db.prepare('SELECT * FROM users WHERE nickname = ?').get(nick);
  if (existsNick) return fail(res, '该昵称已被使用，请换一个昵称', 1, 400);

  // 验证码必须有效且一次性使用
  const v = verifyCode(em, 'register', code);
  if (!v.ok) return fail(res, v.message, 1, 400);

  const pwdHash = hashPassword(password);
  const uid = genUid();
  const info = db.prepare(
    'INSERT INTO users (uid, email, email_verified, nickname, password_hash, bio) VALUES (?,?,1,?,?,?)'
  ).run(uid, em, nick, pwdHash, '这个人很懒，还没有写签名~');
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);

  // 邀请追踪处理
  const inviteCode = String((req.body || {}).inviteCode || (req.body || {}).ref || '').trim();
  if (inviteCode) {
    const invite = db.prepare('SELECT * FROM invite_tracks WHERE ref_code = ? AND status = \'pending\'').get(inviteCode);
    if (invite) {
      db.prepare('UPDATE invite_tracks SET invitee_id = ?, status = \'registered\', registered_at = datetime(\'now\',\'localtime\') WHERE id = ?').run(user.id, invite.id);
      // 给邀请人奖励积分
      addExp(invite.inviter_id, 30, 'invite', `邀请用户 ${nick} 注册奖励`);
    }
  }

  addExp(user.id, 20, 'register', '新用户注册奖励');
  const token = createSession(user, req);
  const refreshToken = createRefreshToken(user);
  return ok(res, { token, refreshToken, user: publicUser(user) }, '注册成功，欢迎来到云屿！');
});

// 登录
router.post('/login', limitLogin, (req, res) => {
  const { email, password } = req.body || {};
  const em = normalizeEmail(email);
  if (!em || !password) {
    markLoginFail(req);
    return fail(res, '请输入邮箱和密码', 1, 400);
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(em);
  if (!user) {
    markLoginFail(req);
    return fail(res, '该邮箱尚未注册', 1, 400);
  }
  if (user.status === 'banned') {
    markLoginFail(req);
    return fail(res, '账号已被封禁，无法登录', 403, 403);
  }
  if (user.status === 'suspended') {
    markLoginFail(req);
    return fail(res, '账号已被暂停，请联系管理员', 403, 403);
  }
  if (user.status === 'deleted') {
    markLoginFail(req);
    return fail(res, '账号已注销，无法登录', 403, 403);
  }
  if (!verifyPassword(password, user.password_hash)) {
    markLoginFail(req);
    return fail(res, '密码错误，请重试', 1, 400);
  }
  if (!user.email_verified) {
    return fail(res, '邮箱尚未验证，请联系管理员', 1, 400);
  }

  // 登录成功，清除失败计数
  clearLoginFail(req);

  const token = createSession(user, req);
  const refreshToken = createRefreshToken(user);
  // 管理员信息与今日签到（与 /api/users/me 对齐）
  let adminInfo = null;
  const admin = db.prepare('SELECT * FROM admins WHERE user_id = ?').get(user.id);
  if (admin) {
    const role = db.prepare('SELECT * FROM roles WHERE id = ?').get(admin.role_id);
    adminInfo = { title: admin.title, roleCode: role ? role.code : '', roleName: role ? role.name : '' };
  }
  const today = new Date().toISOString().slice(0, 10);
  const checkedToday = !!db.prepare('SELECT 1 FROM checkins WHERE user_id = ? AND date = ?').get(user.id, today);
  return ok(res, {
    token,
    refreshToken,
    user: { ...publicUser(user), admin: adminInfo, checkedToday },
    mustChangePassword: user.must_change_password ? 1 : 0,
  }, '登录成功');
});

// 找回密码：验证码 → 重置密码
router.post('/reset-password', (req, res) => {
  const { email, code, password, confirmPassword } = req.body || {};
  const em = normalizeEmail(email);
  if (!em || !code || !password) return fail(res, '请填写完整信息', 1, 400);
  if (password.length < 6) return fail(res, '密码至少 6 位', 1, 400);
  if (password !== confirmPassword) return fail(res, '两次输入的密码不一致', 1, 400);

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(em);
  if (!user) return fail(res, '该邮箱尚未注册', 1, 400);

  const v = verifyCode(em, 'reset_password', code);
  if (!v.ok) return fail(res, v.message, 1, 400);

  const pwdHash = hashPassword(password);
  db.prepare("UPDATE users SET password_hash = ?, updated_at = datetime('now','localtime') WHERE id = ?").run(pwdHash, user.id);
  return ok(res, null, '密码已重置，请使用新密码登录');
});

// 修改密码（已登录）
router.post('/change-password', requireAuth, (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body || {};
  if (!oldPassword || !newPassword) return fail(res, '请填写完整信息', 1, 400);
  if (newPassword.length < 6) return fail(res, '新密码至少 6 位', 1, 400);
  if (newPassword !== confirmPassword) return fail(res, '两次输入的新密码不一致', 1, 400);
  if (!verifyPassword(oldPassword, req.user.password_hash)) return fail(res, '原密码错误', 1, 400);

  const pwdHash = hashPassword(newPassword);
  db.prepare("UPDATE users SET password_hash = ?, must_change_password = 0, updated_at = datetime('now','localtime') WHERE id = ?").run(pwdHash, req.user.id);
  return ok(res, null, '密码修改成功');
});

// Token 自动续期（刷新令牌）
router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body || {};
  if (!refreshToken) return fail(res, '缺少刷新令牌', 1, 400);
  try {
    const payload = jwt.verify(refreshToken, config.jwtSecret);
    if (payload.type !== 'refresh') throw new Error('非刷新令牌');
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.uid);
    if (!user) return fail(res, '用户不存在', 1, 401);
    if (user.status === 'banned') return fail(res, '账号已被封禁', 403, 403);
    if (user.status === 'suspended') return fail(res, '账号已被暂停', 403, 403);
    if (user.status === 'deleted') return fail(res, '账号已注销', 401, 401);
    const token = signToken({ uid: user.id });
    const newRefreshToken = jwt.sign({ uid: user.id, type: 'refresh' }, config.jwtSecret, { expiresIn: '30d' });
    return ok(res, { token, refreshToken: newRefreshToken, user: publicUser(user) }, '令牌已刷新');
  } catch (e) {
    return fail(res, '刷新令牌无效或已过期', 1, 401);
  }
});

// 修改邮箱（已登录）：验证当前身份 → 验证新邮箱 → 检查重复 → 绑定
router.post('/change-email', requireAuth, (req, res) => {
  const { currentPassword, newEmail, code } = req.body || {};
  const em = normalizeEmail(newEmail);
  if (!currentPassword || !em || !code) return fail(res, '请填写完整信息', 1, 400);
  if (!verifyPassword(currentPassword, req.user.password_hash)) return fail(res, '当前密码错误', 1, 400);

  const exists = db.prepare('SELECT * FROM users WHERE email = ? AND id != ?').get(em, req.user.id);
  if (exists) return fail(res, '该邮箱已被注册，无法绑定', 1, 400);

  const v = verifyCode(em, 'change_email', code);
  if (!v.ok) return fail(res, v.message, 1, 400);

  db.prepare("UPDATE users SET email = ?, email_verified = 1, updated_at = datetime('now','localtime') WHERE id = ?").run(em, req.user.id);
  return ok(res, null, '邮箱修改成功');
});

module.exports = router;