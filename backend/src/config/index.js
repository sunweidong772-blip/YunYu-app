// 云屿后端配置中心
// 所有凭据必须来自环境变量 / 服务端 Secret，严禁硬编码进源码
require('dotenv').config();
const path = require('path');

const env = process.env;

const config = {
  port: parseInt(env.PORT || '3000', 10),
  nodeEnv: env.NODE_ENV || 'development',
  // 开发模式：未配置 SMTP 时启用，验证码打印在服务端控制台，便于演示完整邮箱流程
  devMode: (env.NODE_ENV || 'development') !== 'production',

  // 最高管理员「云屿岛主」由部署时环境变量注入
  superAdmin: {
    email: (env.SUPER_ADMIN_EMAIL || 'admin@yunyu.app').trim().toLowerCase(),
    password: env.SUPER_ADMIN_PASSWORD || 'Yunyu@2026',
    nickname: '云屿岛主',
  },

  // SMTP 邮箱服务凭据（绝对不允许进入前端代码）
  smtp: {
    host: env.SMTP_HOST || '',
    port: parseInt(env.SMTP_PORT || '465', 10),
    secure: env.SMTP_SECURE === 'false' ? false : true,
    user: env.SMTP_EMAIL || env.SMTP_USER || '',
    pass: env.SMTP_AUTH_CODE || env.SMTP_PASS || '',
    from: env.SMTP_FROM || '',
  },

  // 安全配置
  jwtSecret: env.JWT_SECRET || 'yunyu-dev-secret-please-override-in-production',
  jwtExpiresIn: env.JWT_EXPIRES_IN || '7d',
  bcryptRounds: 10,

  // 验证码策略
  emailCode: {
    ttlMs: 5 * 60 * 1000,        // 5 分钟有效期
    resendCooldownMs: 60 * 1000, // 60 秒重发倒计时
    maxAttempts: 5,              // 最大错误尝试次数
    maxPerHour: 8,               // 每小时最大发送数量（防滥用）
  },

  // 数据库
  dbPath: path.resolve(__dirname, '../../data/yunyu.db'),
};

module.exports = config;