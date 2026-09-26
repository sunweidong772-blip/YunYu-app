// 基于内存的速率限制中间件（轻量级，适合单进程部署；多进程场景需迁移到 Redis）
const { fail } = require('../utils/response');

const store = new Map(); // key -> { count, resetAt }

function getClientIp(req) {
  // 优先从反向代理头获取，否则取直连 IP
  const xf = req.headers['x-forwarded-for'];
  if (xf) return String(xf).split(',')[0].trim();
  return req.ip || req.connection?.remoteAddress || 'unknown';
}

function makeKey(type, identifier) {
  return `${type}:${identifier}`;
}

function isBlocked(key, maxCount, windowMs) {
  const now = Date.now();
  const record = store.get(key);
  if (!record || now > record.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { blocked: false };
  }
  if (record.count >= maxCount) {
    const waitSeconds = Math.ceil((record.resetAt - now) / 1000);
    return { blocked: true, waitSeconds };
  }
  record.count += 1;
  return { blocked: false };
}

// 定期清理过期条目（避免内存泄漏）
setInterval(() => {
  const now = Date.now();
  let cleaned = 0;
  for (const [key, record] of store) {
    if (now > record.resetAt) {
      store.delete(key);
      cleaned += 1;
    }
  }
  if (cleaned > 0) {
    // console.log(`[rateLimit] 清理 ${cleaned} 条过期记录，当前 ${store.size} 条`);
  }
}, 60000); // 每分钟清理一次

// ===== 预设策略 =====

// 发送验证码：同一邮箱 60 秒 1 次，同一 IP 60 秒 3 次
function limitSendCode(req, res, next) {
  const ip = getClientIp(req);
  const { email } = req.body || {};
  const em = email ? String(email).toLowerCase().trim() : '';

  const ipCheck = isBlocked(makeKey('sendcode_ip', ip), 3, 60000);
  if (ipCheck.blocked) {
    return fail(res, `操作太频繁，请 ${ipCheck.waitSeconds} 秒后再试`, 429, 429);
  }
  if (em) {
    const emailCheck = isBlocked(makeKey('sendcode_email', em), 1, 60000);
    if (emailCheck.blocked) {
      return fail(res, `该邮箱验证码发送太频繁，请 ${emailCheck.waitSeconds} 秒后再试`, 429, 429);
    }
  }
  next();
}

// 注册：同一 IP 24 小时最多 10 次，同一邮箱 24 小时最多 3 次
function limitRegister(req, res, next) {
  const ip = getClientIp(req);
  const { email } = req.body || {};
  const em = email ? String(email).toLowerCase().trim() : '';

  const ipCheck = isBlocked(makeKey('register_ip', ip), 10, 86400000);
  if (ipCheck.blocked) {
    return fail(res, `该 IP 注册次数已达上限，请 ${Math.ceil(ipCheck.waitSeconds / 3600)} 小时后再试`, 429, 429);
  }
  if (em) {
    const emailCheck = isBlocked(makeKey('register_email', em), 3, 86400000);
    if (emailCheck.blocked) {
      return fail(res, `该邮箱注册次数已达上限，请 ${Math.ceil(emailCheck.waitSeconds / 3600)} 小时后再试`, 429, 429);
    }
  }
  next();
}

// 登录：同一邮箱 5 分钟最多 5 次失败，同一 IP 5 分钟最多 20 次
// 注意：只在密码验证失败时计数，成功不计
function limitLogin(req, res, next) {
  const ip = getClientIp(req);
  const { email } = req.body || {};
  const em = email ? String(email).toLowerCase().trim() : '';

  const ipCheck = isBlocked(makeKey('login_ip', ip), 20, 300000);
  if (ipCheck.blocked) {
    return fail(res, `该 IP 登录尝试太频繁，请 ${Math.ceil(ipCheck.waitSeconds / 60)} 分钟后再试`, 429, 429);
  }
  if (em) {
    const emailCheck = isBlocked(makeKey('login_email', em), 5, 300000);
    if (emailCheck.blocked) {
      return fail(res, `该账号登录尝试太频繁，请 ${Math.ceil(emailCheck.waitSeconds / 60)} 分钟后再试`, 429, 429);
    }
  }
  next();
}

// 通用 IP 限流（用于发帖、评论等敏感操作）
function limitByIp(maxCount, windowMs, actionName) {
  return (req, res, next) => {
    const ip = getClientIp(req);
    const check = isBlocked(makeKey(`action_${actionName || 'ip'}`, ip), maxCount, windowMs);
    if (check.blocked) {
      return fail(res, `操作太频繁，请 ${Math.ceil(check.waitSeconds / 60)} 分钟后再试`, 429, 429);
    }
    next();
  };
}

// 登录成功后释放失败计数（可选优化）
function clearLoginFail(req) {
  const ip = getClientIp(req);
  const { email } = req.body || {};
  const em = email ? String(email).toLowerCase().trim() : '';
  store.delete(makeKey('login_ip', ip));
  if (em) store.delete(makeKey('login_email', em));
}

// 登录失败后增加计数（在路由中手动调用）
function markLoginFail(req) {
  const ip = getClientIp(req);
  const { email } = req.body || {};
  const em = email ? String(email).toLowerCase().trim() : '';

  // 先确保条目存在并增加计数
  const ipKey = makeKey('login_ip', ip);
  const ipRec = store.get(ipKey);
  if (ipRec) ipRec.count += 1; else store.set(ipKey, { count: 1, resetAt: Date.now() + 300000 });

  if (em) {
    const emKey = makeKey('login_email', em);
    const emRec = store.get(emKey);
    if (emRec) emRec.count += 1; else store.set(emKey, { count: 1, resetAt: Date.now() + 300000 });
  }
}

module.exports = {
  limitSendCode,
  limitRegister,
  limitLogin,
  limitByIp,
  clearLoginFail,
  markLoginFail,
  getClientIp,
};
