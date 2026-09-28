import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { query } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const JWT_SECRET = process.env.JWT_SECRET || 'yunyu_secret_key_2024_very_long_and_secure';
const PORT = process.env.PORT || 3000;

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const avatarDir = path.join(uploadDir, 'avatars');
const apkDir = path.join(uploadDir, 'apks');
if (!fs.existsSync(avatarDir)) fs.mkdirSync(avatarDir, { recursive: true });
if (!fs.existsSync(apkDir)) fs.mkdirSync(apkDir, { recursive: true });

// Multer配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'avatar') cb(null, avatarDir);
    else if (file.fieldname === 'apk') cb(null, apkDir);
    else cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } });

// ============ 工具函数 ============
function signToken(user) {
  return jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
}

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return res.status(401).json({ code: 401, message: '请先登录' });
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ code: 401, message: '登录已失效，请重新登录' });
  }
}

function adminAuth(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ code: 403, message: '需要管理员权限' });
  next();
}

// 管理员权限判断
const ADMIN_PERMS = {
  owner: ['all'],
  chief: ['user_manage', 'post_audit', 'app_audit', 'report_handle', 'stats', 'announcement', 'admin_log'],
  super: ['post_audit', 'app_audit', 'report_handle', 'user_ban', 'stats'],
  moderator: ['post_audit', 'app_audit', 'comment_audit'],
  inspector: ['post_view', 'report_submit'],
  community: ['user_guide', 'feedback']
};

function hasPerm(adminRoleCode, perm) {
  if (!adminRoleCode) return false;
  if (ADMIN_PERMS[adminRoleCode]?.includes('all')) return true;
  return ADMIN_PERMS[adminRoleCode]?.includes(perm) || false;
}

async function getUserFull(userId) {
  const r = await query('SELECT * FROM users WHERE id=$1', [userId]);
  return r.rows[0];
}

function levelTitle(level) {
  if (level >= 100) return '云屿传说 👑';
  if (level >= 81) return '云屿守望者 🏝️';
  if (level >= 61) return '星海航行者 🌌';
  if (level >= 41) return '逐云探索者 ☁️';
  if (level >= 21) return '拾光行者 ✨';
  if (level >= 11) return '听风旅人 🍃';
  return '初见云屿 🌱';
}

// 经验值等级系统：根据总经验值计算等级
function expToLevel(totalExp) {
  const exp = Math.max(0, totalExp);
  const t10 = [0, 50, 120, 220, 350, 520, 730, 1000, 1350, 1800];
  if (exp < t10[9]) { for (let i = 9; i >= 0; i--) if (exp >= t10[i]) return i + 1; return 1; }
  if (exp < 6800) return 10 + Math.floor((exp - 1800) / 500) + 1;
  if (exp < 22800) return 20 + Math.floor((exp - 6800) / 800) + 1;
  if (exp < 46800) return 40 + Math.floor((exp - 22800) / 1200) + 1;
  if (exp < 86800) return 60 + Math.floor((exp - 46800) / 2000) + 1;
  return 80 + Math.floor((exp - 86800) / 3000) + 1;
}

// 计算等级进度
function levelProgress(totalExp) {
  const lv = expToLevel(totalExp);
  const t10 = [0, 50, 120, 220, 350, 520, 730, 1000, 1350, 1800];
  let cur, next;
  if (lv <= 10) { cur = t10[lv-1]; next = lv < 10 ? t10[lv] : cur + 500; }
  else if (lv <= 20) { cur = 1800 + (lv-10)*500; next = cur + 500; }
  else if (lv <= 40) { cur = 6800 + (lv-20)*800; next = cur + 800; }
  else if (lv <= 60) { cur = 22800 + (lv-40)*1200; next = cur + 1200; }
  else if (lv <= 80) { cur = 46800 + (lv-60)*2000; next = cur + 2000; }
  else { cur = 86800 + (lv-80)*3000; next = cur + 3000; }
  const inLv = totalExp - cur, need = next - cur;
  return { level: lv, exp_in_level: inLv, exp_needed: need, progress: Math.min(1, inLv/need) };
}

// 发放经验值并自动升级
async function grantExp(userId, amount, reason, targetId = null) {
  if (amount <= 0) return null;
  const u = await query('SELECT exp, level FROM users WHERE id=$1', [userId]);
  if (!u.rows[0]) return null;
  const newExp = (u.rows[0].exp || 0) + amount;
  const newLevel = expToLevel(newExp);
  await query('UPDATE users SET exp=$1, level=$2 WHERE id=$3', [newExp, newLevel, userId]);
  await query('INSERT INTO exp_logs(user_id, exp_change, reason, target_id) VALUES($1,$2,$3,$4)', [userId, amount, reason, targetId]);
  return { newExp, newLevel, leveledUp: newLevel > (u.rows[0].level || 1) };
}

// ============ 健康检查 ============
app.get('/health', async (req, res) => {
  try {
    await query('SELECT 1');
    res.json({ code: 0, message: 'ok', data: { version: '4.1.0' } });
  } catch (e) {
    res.status(500).json({ code: 500, message: '数据库连接失败' });
  }
});

// 签到
app.post('/checkin', auth, async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const exist = await query('SELECT id FROM check_ins WHERE user_id=$1 AND checkin_date=$2', [req.user.id, today]);
    if (exist.rows.length > 0) return res.status(400).json({ code: 400, message: '今日已签到' });
    // 计算连续签到天数
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const last = await query('SELECT continuous_days FROM check_ins WHERE user_id=$1 AND checkin_date=$2', [req.user.id, yesterday]);
    const continuous = last.rows[0] ? last.rows[0].continuous_days + 1 : 1;
    // 基础经验5，连续签到加成
    let bonus = 0;
    if (continuous === 3) bonus = 5;
    else if (continuous === 7) bonus = 15;
    else if (continuous === 30) bonus = 50;
    const totalExp = 5 + bonus;
    await query('INSERT INTO check_ins(user_id, checkin_date, continuous_days, exp_earned) VALUES($1,$2,$3,$4)', [req.user.id, today, continuous, totalExp]);
    const result = await grantExp(req.user.id, totalExp, 'checkin');
    res.json({ code: 0, message: '签到成功', data: { continuous_days: continuous, exp_earned: totalExp, bonus, leveled_up: result?.leveledUp || false, new_exp: result?.newExp, new_level: result?.newLevel } });
  } catch (e) {
    if (e.code === '23505') return res.status(400).json({ code: 400, message: '今日已签到' });
    console.error(e);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});
// 查询签到状态
app.get('/checkin/status', auth, async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const todayCheck = await query('SELECT id FROM check_ins WHERE user_id=$1 AND checkin_date=$2', [req.user.id, today]);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const last = await query('SELECT continuous_days FROM check_ins WHERE user_id=$1 AND checkin_date=$2', [req.user.id, yesterday]);
    const continuous = todayCheck.rows[0] ? (last.rows[0] ? last.rows[0].continuous_days + 1 : 1) : (last.rows[0]?.continuous_days || 0);
    res.json({ code: 0, data: { checked_in_today: todayCheck.rows.length > 0, continuous_days: continuous } });
  } catch (e) {
    res.json({ code: 0, data: { checked_in_today: false, continuous_days: 0 } });
  }
});
// ============ 用户认证 ============
app.post('/auth/register', async (req, res) => {
  try {
    const username = String(req.body?.username || '').trim();
    const password = String(req.body?.password || '');
    if (username.length < 3 || username.length > 40) return res.status(400).json({ code: 400, message: '用户名长度需为3-40位' });
    if (password.length < 6) return res.status(400).json({ code: 400, message: '密码至少6位' });
    // 检查用户名是否已存在
    const exist = await query('SELECT id FROM users WHERE username=$1', [username]);
    if (exist.rows.length > 0) return res.status(400).json({ code: 400, message: '该用户名已被注册' });
    const hash = await bcrypt.hash(password, 12);
    const yunyuId = 'YY' + String(Date.now()).slice(-8);
    const r = await query(
      'INSERT INTO users(username,password_hash,display_name,yunyu_id) VALUES($1,$2,$3,$4) RETURNING *',
      [username, hash, username, yunyuId]
    );
    const user = r.rows[0];
    const token = signToken(user);
    res.status(201).json({
      code: 0, message: '注册成功',
      data: { token, id: user.id, username: user.username, role: user.role, admin_role_code: user.admin_role_code, display_name: user.display_name, level: user.level, avatar_url: user.avatar_url }
    });
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ code: 409, message: '用户名已存在' });
    console.error(e);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const username = String(req.body?.username || '').trim();
    const password = String(req.body?.password || '');
    const r = await query('SELECT * FROM users WHERE username=$1', [username]);
    const user = r.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ code: 401, message: '用户名或密码错误' });
    }
    if (user.status === 'banned') {
      return res.status(403).json({ code: 403, message: '账号已被封禁' });
    }
    const token = signToken(user);
    res.json({
      code: 0, message: '登录成功',
      data: { token, id: user.id, username: user.username, role: user.role, admin_role_code: user.admin_role_code, display_name: user.display_name, level: user.level, avatar_url: user.avatar_url, bio: user.bio }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

app.get('/me', auth, async (req, res) => {
  try {
    const user = await getUserFull(req.user.id);
    if (!user) return res.status(404).json({ code: 404, message: '用户不存在' });
    const stats = await query(`
      SELECT (SELECT COUNT(*) FROM posts WHERE user_id=$1) as posts,
             (SELECT COUNT(*) FROM favorites WHERE user_id=$1) as favorites,
             (SELECT COUNT(*) FROM follows WHERE follower_id=$1) as following,
             (SELECT COUNT(*) FROM follows WHERE following_id=$1) as followers
    `, [req.user.id]);
    res.json({ code: 0, data: { ...user, password_hash: undefined, ...stats.rows[0], level_title: levelTitle(user.level), level_progress: levelProgress(user.exp || 0) } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

app.patch('/me', auth, async (req, res) => {
  try {
    const fields = [];
    const params = [];
    let idx = 1;
    if (req.body?.display_name !== undefined) { fields.push(`display_name=$${idx++}`); params.push(String(req.body.display_name).slice(0, 50)); }
    if (req.body?.bio !== undefined) { fields.push(`bio=$${idx++}`); params.push(String(req.body.bio).slice(0, 500)); }
    if (req.body?.avatar_url !== undefined) { fields.push(`avatar_url=$${idx++}`); params.push(String(req.body.avatar_url).slice(0, 500)); }
    if (fields.length === 0) return res.status(400).json({ code: 400, message: '没有可更新的字段' });
    params.push(req.user.id);
    const r = await query(`UPDATE users SET ${fields.join(',')} WHERE id=$${idx} RETURNING id,username,display_name,bio,avatar_url,level`, params);
    res.json({ code: 0, message: '修改成功', data: r.rows[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 上传头像
app.post('/upload/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ code: 400, message: '请选择图片' });
    const url = `http://8.160.178.28:3000/uploads/avatars/${req.file.filename}`;
    await query('UPDATE users SET avatar_url=$1 WHERE id=$2', [url, req.user.id]);
    res.json({ code: 0, message: '上传成功', data: { url } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ code: 500, message: '上传失败' });
  }
});

// 上传APK
app.post('/upload/apk', auth, upload.single('apk'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ code: 400, message: '请选择APK文件' });
    const url = `http://8.160.178.28:3000/uploads/apks/${req.file.filename}`;
    res.json({ code: 0, message: '上传成功', data: { url, filename: req.file.originalname, size: req.file.size } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ code: 500, message: '上传失败' });
  }
});

// ============ 社区模块 ============
// 帖子列表
app.get('/posts', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const sort = req.query.sort || 'hot'; // hot / new
    const offset = (page - 1) * limit;
    let orderBy = 'p.is_top DESC, p.like_count DESC, p.created_at DESC';
    if (sort === 'new') orderBy = 'p.is_top DESC, p.created_at DESC';
    const r = await query(`
      SELECT p.*, u.username, u.display_name, u.avatar_url, u.level as user_level
      FROM posts p JOIN users u ON p.user_id = u.id
      WHERE p.status = 'published'
      ORDER BY ${orderBy} LIMIT $1 OFFSET $2
    `, [limit, offset]);
    const total = await query("SELECT COUNT(*) FROM posts WHERE status='published'");
    res.json({ code: 0, data: { list: r.rows, total: parseInt(total.rows[0].count), page, limit } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 帖子详情
app.get('/posts/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await query('UPDATE posts SET view_count = view_count + 1 WHERE id=$1', [id]);
    const r = await query(`
      SELECT p.*, u.username, u.display_name, u.avatar_url, u.level as user_level
      FROM posts p JOIN users u ON p.user_id = u.id WHERE p.id=$1
    `, [id]);
    if (!r.rows[0]) return res.status(404).json({ code: 404, message: '帖子不存在' });
    res.json({ code: 0, data: r.rows[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 发布帖子
app.post('/posts', auth, async (req, res) => {
  try {
    const title = String(req.body?.title || '').trim();
    const content = String(req.body?.content || '').trim();
    const images = req.body?.images || [];
    if (!title || title.length > 200) return res.status(400).json({ code: 400, message: '标题不能为空且不超过200字' });
    if (!content) return res.status(400).json({ code: 400, message: '内容不能为空' });
    const r = await query(
      'INSERT INTO posts(user_id,title,content,images,status) VALUES($1,$2,$3,$4,$5) RETURNING *',
      [req.user.id, title, content, images, 'pending']
    );
    res.status(201).json({ code: 0, message: '发布成功，等待审核', data: r.rows[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 我的帖子
app.get('/my/posts', auth, async (req, res) => {
  try {
    const r = await query(`
      SELECT p.*, u.username, u.display_name FROM posts p
      JOIN users u ON p.user_id = u.id WHERE p.user_id=$1 ORDER BY p.created_at DESC
    `, [req.user.id]);
    res.json({ code: 0, data: r.rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 点赞
app.post('/posts/:id/like', auth, async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const exist = await query('SELECT id FROM likes WHERE user_id=$1 AND post_id=$2', [req.user.id, postId]);
    if (exist.rows.length > 0) {
      await query('DELETE FROM likes WHERE user_id=$1 AND post_id=$2', [req.user.id, postId]);
      await query('UPDATE posts SET like_count = like_count - 1 WHERE id=$1', [postId]);
      res.json({ code: 0, message: '已取消点赞', data: { liked: false } });
    } else {
      await query('INSERT INTO likes(user_id,post_id) VALUES($1,$2)', [req.user.id, postId]);
      await query('UPDATE posts SET like_count = like_count + 1 WHERE id=$1', [postId]);
      // 给帖子作者发放经验
      const postAuthor = await query('SELECT user_id FROM posts WHERE id=$1', [postId]);
      if (postAuthor.rows[0] && postAuthor.rows[0].user_id !== req.user.id) {
        grantExp(postAuthor.rows[0].user_id, 1, 'liked', postId).catch(()=>{});
      }
      res.json({ code: 0, message: '点赞成功', data: { liked: true } });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});


// 检查点赞状态
app.get('/posts/:id/liked', auth, async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const exist = await query('SELECT id FROM likes WHERE user_id=$1 AND post_id=$2', [req.user.id, postId]);
    res.json({ code: 0, data: { liked: exist.rows.length > 0 } });
  } catch (e) {
    res.json({ code: 0, data: { liked: false } });
  }
});

// 删除帖子
app.delete('/posts/:id', auth, async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const post = await query('SELECT user_id FROM posts WHERE id=$1', [postId]);
    if (!post.rows[0]) return res.status(404).json({ code: 404, message: '帖子不存在' });
    const user = await getUserFull(req.user.id);
    const isAdmin = user.role === 'admin' || user.admin_role_code === 'owner';
    if (post.rows[0].user_id !== req.user.id && !isAdmin) {
      return res.status(403).json({ code: 403, message: '无权限删除此帖子' });
    }
    await query('DELETE FROM posts WHERE id=$1', [postId]);
    res.json({ code: 0, message: '删除成功' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 管理员置顶/取消置顶
app.patch('/admin/posts/:id/top', auth, adminAuth, async (req, res) => {
  try {
    const user = await getUserFull(req.user.id);
    if (!hasPerm(user.admin_role_code, 'post_audit') && user.admin_role_code !== 'owner') {
      return res.status(403).json({ code: 403, message: '无权限操作' });
    }
    const postId = parseInt(req.params.id);
    const { is_top } = req.body;
    await query('UPDATE posts SET is_top=$1 WHERE id=$2', [is_top ? true : false, postId]);
    res.json({ code: 0, message: is_top ? '置顶成功' : '取消置顶成功' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 检查是否已点赞
app.get('/posts/:id/liked', auth, async (req, res) => {
  const postId = parseInt(req.params.id);
  const r = await query('SELECT id FROM likes WHERE user_id=$1 AND post_id=$2', [req.user.id, postId]);
  res.json({ code: 0, data: { liked: r.rows.length > 0 } });
});

// 评论列表
app.get('/posts/:id/comments', async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const r = await query(`
      SELECT c.*, u.username, u.display_name, u.avatar_url, u.level as user_level
      FROM comments c JOIN users u ON c.user_id = u.id
      WHERE c.post_id=$1 AND c.status='published' ORDER BY c.created_at DESC
    `, [postId]);
    res.json({ code: 0, data: r.rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 发表评论
app.post('/posts/:id/comments', auth, async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const content = String(req.body?.content || '').trim();
    if (!content) return res.status(400).json({ code: 400, message: '评论内容不能为空' });
    const r = await query('INSERT INTO comments(post_id,user_id,content) VALUES($1,$2,$3) RETURNING *', [postId, req.user.id, content]);
    await query('UPDATE posts SET comment_count = comment_count + 1 WHERE id=$1', [postId]);
    grantExp(req.user.id, 2, 'comment', r.rows[0].id).catch(()=>{});
    res.status(201).json({ code: 0, message: '评论成功', data: r.rows[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 关注
app.post('/users/:id/follow', auth, async (req, res) => {
  try {
    const targetId = parseInt(req.params.id);
    if (targetId === req.user.id) return res.status(400).json({ code: 400, message: '不能关注自己' });
    const exist = await query('SELECT id FROM follows WHERE follower_id=$1 AND following_id=$2', [req.user.id, targetId]);
    if (exist.rows.length > 0) {
      await query('DELETE FROM follows WHERE follower_id=$1 AND following_id=$2', [req.user.id, targetId]);
      res.json({ code: 0, message: '已取消关注', data: { following: false } });
    } else {
      await query('INSERT INTO follows(follower_id,following_id) VALUES($1,$2)', [req.user.id, targetId]);
      res.json({ code: 0, message: '关注成功', data: { following: true } });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 用户主页
app.get('/users/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const r = await query('SELECT id,username,display_name,bio,avatar_url,level,exp,points,created_at FROM users WHERE id=$1', [id]);
    if (!r.rows[0]) return res.status(404).json({ code: 404, message: '用户不存在' });
    const stats = await query(`
      SELECT (SELECT COUNT(*) FROM posts WHERE user_id=$1) as posts,
             (SELECT COUNT(*) FROM follows WHERE follower_id=$1) as following,
             (SELECT COUNT(*) FROM follows WHERE following_id=$1) as followers
    `, [id]);
    res.json({ code: 0, data: { ...r.rows[0], ...stats.rows[0], level_title: levelTitle(r.rows[0].level) } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 私信列表
app.get('/messages', auth, async (req, res) => {
  try {
    const r = await query(`
      SELECT DISTINCT ON (CASE WHEN sender_id=$1 THEN receiver_id ELSE sender_id END)
        m.*, u.username, u.display_name, u.avatar_url
      FROM messages m JOIN users u ON u.id = CASE WHEN m.sender_id=$1 THEN m.receiver_id ELSE m.sender_id END
      WHERE m.sender_id=$1 OR m.receiver_id=$1
      ORDER BY (CASE WHEN sender_id=$1 THEN receiver_id ELSE sender_id END), m.created_at DESC
    `, [req.user.id]);
    res.json({ code: 0, data: r.rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 私信详情
app.get('/messages/:userId', auth, async (req, res) => {
  try {
    const otherId = parseInt(req.params.userId);
    const r = await query(`
      SELECT m.*, u.username, u.display_name, u.avatar_url
      FROM messages m JOIN users u ON m.sender_id = u.id
      WHERE (m.sender_id=$1 AND m.receiver_id=$2) OR (m.sender_id=$2 AND m.receiver_id=$1)
      ORDER BY m.created_at ASC
    `, [req.user.id, otherId]);
    await query('UPDATE messages SET is_read=true WHERE sender_id=$1 AND receiver_id=$2', [otherId, req.user.id]);
    res.json({ code: 0, data: r.rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 发送私信
app.post('/messages/:userId', auth, async (req, res) => {
  try {
    const receiverId = parseInt(req.params.userId);
    const content = String(req.body?.content || '').trim();
    if (!content) return res.status(400).json({ code: 400, message: '消息内容不能为空' });
    const r = await query('INSERT INTO messages(sender_id,receiver_id,content) VALUES($1,$2,$3) RETURNING *', [req.user.id, receiverId, content]);
    res.status(201).json({ code: 0, message: '发送成功', data: r.rows[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 未读消息数
app.get('/messages/unread/count', auth, async (req, res) => {
  try {
    const r = await query('SELECT COUNT(*) FROM messages WHERE receiver_id=$1 AND is_read=false', [req.user.id]);
    res.json({ code: 0, data: { count: parseInt(r.rows[0].count) } });
  } catch (e) {
    res.json({ code: 0, data: { count: 0 } });
  }
});

// ============ 软件模块 ============
// 软件列表
app.get('/apps', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const category = req.query.category;
    const search = req.query.search;
    const offset = (page - 1) * limit;
    let where = "a.status='published'";
    const params = [];
    if (category) { params.push(category); where += ` AND category=$${params.length}`; }
    if (search) { params.push(`%${search}%`); where += ` AND name ILIKE $${params.length}`; }
    params.push(limit, offset);
    const r = await query(`
      SELECT a.*, u.username, u.display_name FROM apps a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE ${where} ORDER BY a.download_count DESC, a.created_at DESC LIMIT $${params.length-1} OFFSET $${params.length}
    `, params);
    const total = await query(`SELECT COUNT(*) FROM apps a WHERE ${where}`, params.slice(0, -2));
    res.json({ code: 0, data: { list: r.rows, total: parseInt(total.rows[0].count), page, limit } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 软件详情
app.get('/apps/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const r = await query(`
      SELECT a.*, u.username, u.display_name FROM apps a
      LEFT JOIN users u ON a.user_id = u.id WHERE a.id=$1
    `, [id]);
    if (!r.rows[0]) return res.status(404).json({ code: 404, message: '软件不存在' });
    const versions = await query('SELECT * FROM app_versions WHERE app_id=$1 ORDER BY created_at DESC', [id]);
    // 检查用户是否已收藏（需要登录）
    let isFavorited = false;
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded) {
          const fav = await query('SELECT id FROM favorites WHERE user_id=$1 AND app_id=$2', [decoded.id, id]);
          isFavorited = fav.rows.length > 0;
        }
      } catch (e) { /* token无效则忽略 */ }
    }
    res.json({ code: 0, data: { ...r.rows[0], versions: versions.rows, is_favorited: isFavorited } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 发布软件
app.post('/apps', auth, async (req, res) => {
  try {
    const { name, category, intro, icon_url, version, official_url, package_name, download_url } = req.body;
    if (!name || name.length > 100) return res.status(400).json({ code: 400, message: '软件名称不能为空且不超过100字' });
    const r = await query(
      `INSERT INTO apps(user_id,name,category,intro,icon_url,version,official_url,package_name,status)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,'pending') RETURNING *`,
      [req.user.id, name, category || '实用工具', intro || '', icon_url || '', version || '1.0.0', official_url || '', package_name || '']
    );
    if (download_url) {
      await query(
        'INSERT INTO app_versions(app_id,version_name,download_url,is_current) VALUES($1,$2,$3,true)',
        [r.rows[0].id, version || '1.0.0', download_url]
      );
    }
    res.status(201).json({ code: 0, message: '发布成功，等待审核', data: r.rows[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 发布版本
app.post('/apps/:id/versions', auth, async (req, res) => {
  try {
    const appId = parseInt(req.params.id);
    const { version_name, version_code, download_url, change_log } = req.body;
    if (!version_name || !download_url) return res.status(400).json({ code: 400, message: '版本号和下载地址不能为空' });
    await query('UPDATE app_versions SET is_current=false WHERE app_id=$1', [appId]);
    const r = await query(
      'INSERT INTO app_versions(app_id,version_name,version_code,download_url,change_log,is_current) VALUES($1,$2,$3,$4,$5,true) RETURNING *',
      [appId, version_name, version_code || null, download_url, change_log || '']
    );
    await query('UPDATE apps SET version=$1, updated_at=CURRENT_TIMESTAMP WHERE id=$2', [version_name, appId]);
    res.status(201).json({ code: 0, message: '版本发布成功', data: r.rows[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 记录下载
app.post('/apps/:id/download', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await query('UPDATE apps SET download_count = download_count + 1 WHERE id=$1', [id]);
    // 给软件发布者发放经验
    const app = await query('SELECT user_id FROM apps WHERE id=$1', [id]);
    if (app.rows[0]?.user_id) grantExp(app.rows[0].user_id, 1, 'downloaded', id).catch(()=>{});
    res.json({ code: 0, message: 'ok' });
  } catch (e) {
    res.json({ code: 0, message: 'ok' });
  }
});

// 收藏
app.post('/apps/:id/favorite', auth, async (req, res) => {
  try {
    const appId = parseInt(req.params.id);
    const exist = await query('SELECT id FROM favorites WHERE user_id=$1 AND app_id=$2', [req.user.id, appId]);
    if (exist.rows.length > 0) {
      await query('DELETE FROM favorites WHERE user_id=$1 AND app_id=$2', [req.user.id, appId]);
      res.json({ code: 0, message: '已取消收藏', data: { favorited: false } });
    } else {
      await query('INSERT INTO favorites(user_id,app_id) VALUES($1,$2)', [req.user.id, appId]);
      res.json({ code: 0, message: '收藏成功', data: { favorited: true } });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 我的收藏
app.get('/my/favorites', auth, async (req, res) => {
  try {
    const r = await query(`
      SELECT a.* FROM apps a JOIN favorites f ON a.id = f.app_id
      WHERE f.user_id=$1 ORDER BY f.created_at DESC
    `, [req.user.id]);
    res.json({ code: 0, data: r.rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 举报
app.post('/reports', auth, async (req, res) => {
  try {
    const { target_type, target_id, reason } = req.body;
    if (!target_type || !target_id || !reason) return res.status(400).json({ code: 400, message: '举报类型、对象和原因不能为空' });
    const r = await query(
      'INSERT INTO reports(reporter_id,target_type,target_id,reason) VALUES($1,$2,$3,$4) RETURNING *',
      [req.user.id, target_type, target_id, reason]
    );
    res.status(201).json({ code: 0, message: '举报成功，我们会尽快处理', data: r.rows[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// ============ 管理员模块 ============
// 数据统计
app.get('/admin/stats', auth, adminAuth, async (req, res) => {
  try {
    const user = await getUserFull(req.user.id);
    if (!hasPerm(user.admin_role_code, 'stats') && user.admin_role_code !== 'owner') {
      return res.status(403).json({ code: 403, message: '无权限查看统计' });
    }
    const today = new Date().toISOString().slice(0, 10);
    const stats = await query(`
      SELECT
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM users WHERE created_at::date = $1) as today_users,
        (SELECT COUNT(*) FROM apps) as total_apps,
        (SELECT COUNT(*) FROM apps WHERE status='published') as published_apps,
        (SELECT COUNT(*) FROM apps WHERE status='pending') as pending_apps,
        (SELECT COALESCE(SUM(download_count),0) FROM apps) as total_downloads,
        (SELECT COUNT(*) FROM posts) as total_posts,
        (SELECT COUNT(*) FROM posts WHERE status='published') as published_posts,
        (SELECT COUNT(*) FROM posts WHERE status='pending') as pending_posts,
        (SELECT COUNT(*) FROM reports WHERE status='pending') as pending_reports
    `, [today]);
    // 热门帖子排行
    const hotPosts = await query(`
      SELECT id,title,view_count,like_count,comment_count,created_at
      FROM posts WHERE status='published' ORDER BY view_count DESC LIMIT 10
    `);
    // 把所有统计值转换成数字类型
    const statsData = {};
    for (const key in stats.rows[0]) {
      if (key !== 'hot_posts') {
        statsData[key] = Number(stats.rows[0][key]) || 0;
      }
    }
    res.json({ code: 0, data: { ...statsData, hot_posts: hotPosts.rows } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 待审核帖子
app.get('/admin/posts/pending', auth, adminAuth, async (req, res) => {
  try {
    const user = await getUserFull(req.user.id);
    if (!hasPerm(user.admin_role_code, 'post_audit') && user.admin_role_code !== 'owner') {
      return res.status(403).json({ code: 403, message: '无权限审核帖子' });
    }
    const r = await query(`
      SELECT p.*, u.username, u.display_name FROM posts p
      JOIN users u ON p.user_id = u.id WHERE p.status='pending' ORDER BY p.created_at DESC
    `);
    res.json({ code: 0, data: r.rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 审核帖子
app.patch('/admin/posts/:id/status', auth, adminAuth, async (req, res) => {
  try {
    const user = await getUserFull(req.user.id);
    if (!hasPerm(user.admin_role_code, 'post_audit') && user.admin_role_code !== 'owner') {
      return res.status(403).json({ code: 403, message: '无权限审核帖子' });
    }
    const id = parseInt(req.params.id);
    const { status, reject_reason } = req.body;
    if (!['published', 'rejected'].includes(status)) return res.status(400).json({ code: 400, message: '状态无效' });
    await query('UPDATE posts SET status=$1, reject_reason=$2 WHERE id=$3', [status, reject_reason || null, id]);
    await query('INSERT INTO admin_logs(admin_id,action,target_type,target_id,detail) VALUES($1,$2,$3,$4,$5)',
      [req.user.id, status === 'published' ? '审核通过帖子' : '拒绝帖子', 'post', id, reject_reason || '']);
    // 审核通过时给作者发放经验
    if (status === 'published') {
      const post = await query('SELECT user_id FROM posts WHERE id=$1', [id]);
      if (post.rows[0]?.user_id) grantExp(post.rows[0].user_id, 10, 'post', id).catch(()=>{});
    }
    res.json({ code: 0, message: '操作成功' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 待审核软件
app.get('/admin/apps/pending', auth, adminAuth, async (req, res) => {
  try {
    const user = await getUserFull(req.user.id);
    if (!hasPerm(user.admin_role_code, 'app_audit') && user.admin_role_code !== 'owner') {
      return res.status(403).json({ code: 403, message: '无权限审核软件' });
    }
    const r = await query(`
      SELECT a.*, u.username, u.display_name FROM apps a
      LEFT JOIN users u ON a.user_id = u.id WHERE a.status='pending' ORDER BY a.created_at DESC
    `);
    res.json({ code: 0, data: r.rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 审核/下架软件
app.patch('/admin/apps/:id/status', auth, adminAuth, async (req, res) => {
  try {
    const user = await getUserFull(req.user.id);
    if (!hasPerm(user.admin_role_code, 'app_audit') && user.admin_role_code !== 'owner') {
      return res.status(403).json({ code: 403, message: '无权限管理软件' });
    }
    const id = parseInt(req.params.id);
    const { status, reject_reason } = req.body;
    if (!['published', 'archived', 'rejected'].includes(status)) return res.status(400).json({ code: 400, message: '状态无效' });
    await query('UPDATE apps SET status=$1, reject_reason=$2, updated_at=CURRENT_TIMESTAMP WHERE id=$3', [status, reject_reason || null, id]);
    await query('INSERT INTO admin_logs(admin_id,action,target_type,target_id,detail) VALUES($1,$2,$3,$4,$5)',
      [req.user.id, `软件状态更新为${status}`, 'app', id, reject_reason || '']);
    // 审核通过时给发布者发放经验
    if (status === 'published') {
      const app = await query('SELECT user_id FROM apps WHERE id=$1', [id]);
      if (app.rows[0]?.user_id) grantExp(app.rows[0].user_id, 20, 'app', id).catch(()=>{});
    }
    res.json({ code: 0, message: '操作成功' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 所有软件（管理员）
app.get('/admin/apps', auth, adminAuth, async (req, res) => {
  try {
    const r = await query(`
      SELECT a.*, u.username, u.display_name FROM apps a
      LEFT JOIN users u ON a.user_id = u.id ORDER BY a.created_at DESC
    `);
    res.json({ code: 0, data: r.rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 用户列表
app.get('/admin/users', auth, adminAuth, async (req, res) => {
  try {
    const user = await getUserFull(req.user.id);
    if (!hasPerm(user.admin_role_code, 'user_manage') && user.admin_role_code !== 'owner') {
      return res.status(403).json({ code: 403, message: '无权限管理用户' });
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const r = await query(`
      SELECT id,username,display_name,role,admin_role_code,level,status,created_at
      FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2
    `, [limit, offset]);
    const total = await query('SELECT COUNT(*) FROM users');
    res.json({ code: 0, data: { list: r.rows, total: parseInt(total.rows[0].count) } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 封禁/解封用户
app.patch('/admin/users/:id/status', auth, adminAuth, async (req, res) => {
  try {
    const user = await getUserFull(req.user.id);
    if (!hasPerm(user.admin_role_code, 'user_ban') && user.admin_role_code !== 'owner') {
      return res.status(403).json({ code: 403, message: '无权限封禁用户' });
    }
    const id = parseInt(req.params.id);
    const { status } = req.body;
    if (!['active', 'banned'].includes(status)) return res.status(400).json({ code: 400, message: '状态无效' });
    await query('UPDATE users SET status=$1 WHERE id=$2', [status, id]);
    await query('INSERT INTO admin_logs(admin_id,action,target_type,target_id) VALUES($1,$2,$3,$4)',
      [req.user.id, status === 'banned' ? '封禁用户' : '解封用户', 'user', id]);
    res.json({ code: 0, message: '操作成功' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 设置管理员
app.patch('/admin/users/:id/role', auth, adminAuth, async (req, res) => {
  try {
    const user = await getUserFull(req.user.id);
    if (user.admin_role_code !== 'owner') {
      return res.status(403).json({ code: 403, message: '只有岛主可以设置管理员' });
    }
    const id = parseInt(req.params.id);
    const { role, admin_role_code } = req.body;
    await query('UPDATE users SET role=$1, admin_role_code=$2 WHERE id=$3', [role || 'user', admin_role_code || null, id]);
    res.json({ code: 0, message: '设置成功' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 举报列表
app.get('/admin/reports', auth, adminAuth, async (req, res) => {
  try {
    const user = await getUserFull(req.user.id);
    if (!hasPerm(user.admin_role_code, 'report_handle') && user.admin_role_code !== 'owner') {
      return res.status(403).json({ code: 403, message: '无权限处理举报' });
    }
    const status = req.query.status || 'pending';
    const r = await query(`
      SELECT r.*, u.username as reporter_name, u.display_name as reporter_display
      FROM reports r LEFT JOIN users u ON r.reporter_id = u.id
      WHERE r.status=$1 ORDER BY r.created_at DESC
    `, [status]);
    res.json({ code: 0, data: r.rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 处理举报
app.patch('/admin/reports/:id', auth, adminAuth, async (req, res) => {
  try {
    const user = await getUserFull(req.user.id);
    if (!hasPerm(user.admin_role_code, 'report_handle') && user.admin_role_code !== 'owner') {
      return res.status(403).json({ code: 403, message: '无权限处理举报' });
    }
    const id = parseInt(req.params.id);
    const { status, handle_note } = req.body;
    await query('UPDATE reports SET status=$1, handler_id=$2, handle_note=$3, handled_at=CURRENT_TIMESTAMP WHERE id=$4',
      [status || 'resolved', req.user.id, handle_note || '', id]);
    res.json({ code: 0, message: '处理成功' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 公告
app.get('/announcements', async (req, res) => {
  try {
    const r = await query('SELECT * FROM announcements WHERE is_active=true ORDER BY created_at DESC LIMIT 10');
    res.json({ code: 0, data: r.rows });
  } catch (e) {
    res.json({ code: 0, data: [] });
  }
});

app.post('/admin/announcements', auth, adminAuth, async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) return res.status(400).json({ code: 400, message: '标题和内容不能为空' });
    const r = await query('INSERT INTO announcements(title,content) VALUES($1,$2) RETURNING *', [title, content]);
    res.status(201).json({ code: 0, message: '发布成功', data: r.rows[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 管理员操作日志
app.get('/admin/logs', auth, adminAuth, async (req, res) => {
  try {
    const r = await query(`
      SELECT l.*, u.username, u.display_name FROM admin_logs l
      LEFT JOIN users u ON l.admin_id = u.id ORDER BY l.created_at DESC LIMIT 50
    `);
    res.json({ code: 0, data: r.rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 徽章列表
app.get('/badges', async (req, res) => {
  try {
    const r = await query('SELECT * FROM badges ORDER BY id');
    res.json({ code: 0, data: r.rows });
  } catch (e) {
    res.json({ code: 0, data: [] });
  }
});

// 头像框列表
app.get('/avatar-frames', async (req, res) => {
  try {
    const r = await query('SELECT * FROM avatar_frames ORDER BY id');
    res.json({ code: 0, data: r.rows });
  } catch (e) {
    res.json({ code: 0, data: [] });
  }
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ code: 500, message: '服务器内部错误' });
});

// 自动创建所有表（兼容旧数据库）
async function initNewTables() {
  try {
    const tables = [
      `CREATE TABLE IF NOT EXISTS follows (
        id SERIAL PRIMARY KEY,
        follower_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        following_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(follower_id, following_id)
      )`,
      `CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS check_ins (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        checkin_date DATE NOT NULL,
        continuous_days INTEGER DEFAULT 1,
        exp_earned INTEGER DEFAULT 5,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, checkin_date)
      )`,
      `CREATE TABLE IF NOT EXISTS exp_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        exp_change INTEGER NOT NULL,
        reason VARCHAR(50) NOT NULL,
        target_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
    ];
    for (const sql of tables) {
      try { await query(sql); } catch(e) { console.log('建表跳过:', e.message); }
    }
    // 确保 users 表有 exp 字段
    try { await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS exp INTEGER DEFAULT 0'); } catch(e) {}
    console.log('所有表初始化完成');
  } catch (e) {
    console.error('表初始化失败:', e.message);
  }
}
initNewTables();

app.listen(PORT, () => {
  console.log(`云屿后端服务启动成功，端口: ${PORT}`);
});
