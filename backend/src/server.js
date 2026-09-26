// 云屿后端服务入口
const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const { verifyToken } = require('./utils/token');

// 初始化数据库与种子数据（幂等）
require('./db');
require('./db/seed');

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// SSE 客户端管理
const sseClients = new Map(); // userId -> Set of res
app.locals.sseClients = sseClients;

function broadcastToUser(userId, event, data) {
  const clients = sseClients.get(userId);
  if (!clients) return;
  const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  clients.forEach((res) => {
    try { res.write(message); } catch (e) { /* ignore closed */ }
  });
}
app.locals.broadcastToUser = broadcastToUser;

// SSE 连接端点（支持 Header Bearer token 或 URL query token）
app.get('/api/events', (req, res) => {
  const header = req.headers.authorization || '';
  const headerToken = header.startsWith('Bearer ') ? header.slice(7) : '';
  const queryToken = req.query.token || '';
  const token = headerToken || queryToken;
  let userId = null;
  if (token) {
    try {
      const payload = verifyToken(token);
      userId = payload.uid;
    } catch (e) { /* invalid token */ }
  }
  if (!userId) {
    return res.status(401).json({ code: 1, message: '请先登录' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  // 发送初始连接确认
  res.write(`event: connected\ndata: ${JSON.stringify({ userId, time: Date.now() })}\n\n`);

  if (!sseClients.has(userId)) sseClients.set(userId, new Set());
  sseClients.get(userId).add(res);

  // 心跳保活
  const heartbeat = setInterval(() => {
    try { res.write(':heartbeat\n\n'); } catch (e) {
      clearInterval(heartbeat);
    }
  }, 30000);

  req.on('close', () => {
    clearInterval(heartbeat);
    const set = sseClients.get(userId);
    if (set) {
      set.delete(res);
      if (set.size === 0) sseClients.delete(userId);
    }
  });
});

// API 路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/software', require('./routes/software'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/events', require('./routes/events'));
app.use('/api', require('./routes/home'));
app.use('/api/admin', require('./routes/admin'));

// 上传文件静态托管
const uploadDir = path.resolve(__dirname, '../data/uploads');
app.use('/uploads', express.static(uploadDir, { maxAge: '7d', immutable: true }));

// 生产模式：托管前端构建产物
const frontendDist = path.resolve(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(frontendDist, 'index.html'), (err) => {
    if (err) res.status(404).send('接口不存在或前端未构建（开发模式请使用前端 dev 服务器）');
  });
});

// 统一错误处理
app.use((err, req, res, next) => {
  console.error('[error]', err.message);
  res.status(500).json({ code: 1, message: '服务器开小差了，请稍后再试', data: null });
});

app.listen(config.port, () => {
  console.log(`☁️  云屿后端已启动: http://localhost:${config.port}`);
  console.log(`   管理员入口: http://localhost:${config.port}/admin  (账号: ${config.superAdmin.email})`);
  if (config.devMode) {
    console.log('   开发模式: 未配置真实 SMTP，邮箱验证码将打印在服务端日志');
  }
});