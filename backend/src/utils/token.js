// JWT 令牌生成与校验
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config');

function signToken(payload) {
  // 每次签名注入随机 jti，保证同一用户多次登录产生不同的 token（login_sessions.token 唯一）
  return jwt.sign({ ...payload, jti: crypto.randomUUID() }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
}

function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

module.exports = { signToken, verifyToken };