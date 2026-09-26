// 邮箱验证码服务：随机码、5 分钟有效期、一次性、错误次数限制、60s 重发倒计时
const db = require('../db');
const config = require('../config');
const { sendEmail, buildVerifyMail, isSmtpConfigured } = require('./mailer');
const { generateEmailCode, normalizeEmail } = require('../utils/crypto');
const { localDateTimeStr } = require('../utils/date');
const crypto = require('crypto');

function hashCode(code) {
  return crypto.createHash('sha256').update(config.jwtSecret + ':' + code).digest('hex');
}

// 校验邮箱格式
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// 检查是否 60s 冷却中
function cooldownOf(email, purpose) {
  const last = db.prepare(
    "SELECT created_at FROM email_verification_codes WHERE email = ? AND purpose = ? ORDER BY id DESC LIMIT 1"
  ).get(email, purpose);
  if (!last) return 0;
  const lastTs = new Date(last.created_at.replace(' ', 'T')).getTime();
  const now = Date.now();
  if (isNaN(lastTs)) return 0;
  const remain = config.emailCode.resendCooldownMs - (now - lastTs);
  return remain > 0 ? Math.ceil(remain / 1000) : 0;
}

// 检查每小时发送上限（防滥用）
function hourlyCount(email) {
  const hourAgo = localDateTimeStr(new Date(Date.now() - 3600000));
  return db.prepare('SELECT COUNT(*) c FROM email_verification_codes WHERE email = ? AND created_at >= ?').get(email, hourAgo).c;
}

// 发送验证码；返回 { ok, message, devCode? }（devCode 仅开发模式返回以用于演示）
async function sendCode(email, purpose) {
  email = normalizeEmail(email);
  if (!isValidEmail(email)) return { ok: false, message: '邮箱格式不正确' };

  const cooldown = cooldownOf(email, purpose);
  if (cooldown > 0) return { ok: false, message: `发送过于频繁，请 ${cooldown} 秒后重试`, cooldown };

  if (hourlyCount(email) >= config.emailCode.maxPerHour) {
    return { ok: false, message: '发送次数过多，请稍后再试' };
  }

  const code = generateEmailCode();
  const expiresAt = localDateTimeStr(new Date(Date.now() + config.emailCode.ttlMs));
  db.prepare('INSERT INTO email_verification_codes (email, purpose, code_hash, expires_at) VALUES (?,?,?,?)')
    .run(email, purpose, hashCode(code), expiresAt);

  // 发送邮件
  // 开发模式（未配置 SMTP 且 devMode=true）：验证码打印控制台并返回 devCode 便于演示
  // 生产模式（未配置 SMTP）：拒绝发码，避免验证码泄露与功能形同虚设
  const mail = buildVerifyMail(code);
  let devCode = null;
  if (!isSmtpConfigured()) {
    if (config.devMode) {
      devCode = code;
      console.log(`[mail][dev] 验证码（${purpose}）=> ${email} : ${code}`);
    } else {
      return { ok: false, message: '邮件服务未配置，请联系管理员' };
    }
  } else {
    try {
      const sent = await sendEmail(email, mail.subject, mail.html);
      if (!sent.sent) return { ok: false, message: '邮件发送失败，请稍后重试' };
    } catch (e) {
      console.error('[mail] 发送失败:', e.message);
      return { ok: false, message: '邮件发送失败，请稍后重试' };
    }
  }
  return { ok: true, message: '验证码已发送到邮箱', devCode, smtpConfigured: isSmtpConfigured() };
}

// 校验验证码；correct=true 时校验成功后立即标记使用（一次性）
function verifyCode(email, purpose, code, { consume = true } = {}) {
  email = normalizeEmail(email);
  if (!code) return { ok: false, message: '请输入验证码' };
  const row = db.prepare(
    'SELECT * FROM email_verification_codes WHERE email = ? AND purpose = ? ORDER BY id DESC LIMIT 1'
  ).get(email, purpose);
  if (!row) return { ok: false, message: '未找到验证码，请先获取' };
  if (row.used) return { ok: false, message: '验证码已使用，请重新获取' };
  if (new Date(row.expires_at.replace(' ', 'T')).getTime() < Date.now()) {
    return { ok: false, message: '验证码已过期，请重新获取' };
  }
  if (row.attempts >= config.emailCode.maxAttempts) {
    return { ok: false, message: '错误次数过多，验证码已失效，请重新获取' };
  }
  if (hashCode(String(code).trim()) !== row.code_hash) {
    db.prepare('UPDATE email_verification_codes SET attempts = attempts + 1 WHERE id = ?').run(row.id);
    const remain = config.emailCode.maxAttempts - row.attempts - 1;
    return { ok: false, message: remain > 0 ? `验证码错误，还可尝试 ${remain} 次` : '错误次数过多，验证码已失效，请重新获取' };
  }
  if (consume) {
    db.prepare('UPDATE email_verification_codes SET used = 1 WHERE id = ?').run(row.id);
  }
  return { ok: true, message: '验证码正确' };
}

module.exports = { sendCode, verifyCode, isValidEmail };