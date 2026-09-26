// 密码哈希与验证
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const config = require('../config');

function hashPassword(plain) {
  return bcrypt.hashSync(plain, config.bcryptRounds);
}

function verifyPassword(plain, hash) {
  return bcrypt.compareSync(plain, hash);
}

// 生成邮箱验证码（6 位数字）
function generateEmailCode() {
  return String(crypto.randomInt(100000, 1000000));
}

// 生成安全令牌（注册临时令牌 / 密码重置令牌）
function generateToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

// 规范化邮箱：去空格 + 转小写
function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

module.exports = { hashPassword, verifyPassword, generateEmailCode, generateToken, normalizeEmail };