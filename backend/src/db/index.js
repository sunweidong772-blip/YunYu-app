// 云屿数据库：SQLite 初始化与连接
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const config = require('../config');

// 确保数据目录存在
fs.mkdirSync(path.dirname(config.dbPath), { recursive: true });

const db = new Database(config.dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const SCHEMA = `
-- ============ 云屿核心数据模型 ============

-- 用户
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uid TEXT NOT NULL UNIQUE,                    -- 唯一 UID（对外展示）
  email TEXT NOT NULL UNIQUE,                  -- 邮箱唯一索引（忽略大小写，存小写）
  email_verified INTEGER NOT NULL DEFAULT 0,   -- 邮箱验证状态
  nickname TEXT NOT NULL UNIQUE,               -- 昵称唯一
  password_hash TEXT NOT NULL,                 -- bcrypt 哈希
  avatar TEXT DEFAULT '',
  bio TEXT DEFAULT '',                         -- 个性签名
  lv INTEGER NOT NULL DEFAULT 1,
  exp INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'normal',       -- normal / unverified / muted / suspended / banned / deleted
  role_type TEXT NOT NULL DEFAULT 'user',      -- user / admin（是否为管理员）
  checkin_streak INTEGER NOT NULL DEFAULT 0,   -- 连续签到
  checkin_total INTEGER NOT NULL DEFAULT 0,    -- 累计签到
  last_checkin_date TEXT DEFAULT '',           -- 最近签到日期 YYYY-MM-DD
  like_count INTEGER NOT NULL DEFAULT 0,       -- 获赞
  post_count INTEGER NOT NULL DEFAULT 0,
  comment_count INTEGER NOT NULL DEFAULT 0,
  favorite_count INTEGER NOT NULL DEFAULT 0,
  banned_reason TEXT DEFAULT '',
  must_change_password INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

-- 管理员
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
  role_id INTEGER REFERENCES roles(id),
  title TEXT DEFAULT '管理员',                -- 显示身份：云屿岛主 / 高级管理员...
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

-- 角色
CREATE TABLE IF NOT EXISTS roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  is_system INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

-- 权限
CREATE TABLE IF NOT EXISTS permissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  group_name TEXT DEFAULT '通用',
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

-- 角色-权限关联
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id INTEGER NOT NULL REFERENCES roles(id),
  permission_id INTEGER NOT NULL REFERENCES permissions(id),
  PRIMARY KEY (role_id, permission_id)
);

-- 帖子
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  images TEXT DEFAULT '[]',                    -- JSON 数组
  topic_id INTEGER REFERENCES topics(id),
  software_id INTEGER REFERENCES software(id),
  tags TEXT DEFAULT '[]',                      -- JSON 数组
  like_count INTEGER NOT NULL DEFAULT 0,
  comment_count INTEGER NOT NULL DEFAULT 0,
  favorite_count INTEGER NOT NULL DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0,
  is_pinned INTEGER NOT NULL DEFAULT 0,        -- 置顶
  is_featured INTEGER NOT NULL DEFAULT 0,      -- 加精
  is_hidden INTEGER NOT NULL DEFAULT 0,        -- 隐藏
  status TEXT NOT NULL DEFAULT 'normal',       -- normal / deleted / hidden
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
CREATE INDEX IF NOT EXISTS idx_posts_user ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_topic ON posts(topic_id);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at);

-- 评论
CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL REFERENCES posts(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  parent_id INTEGER REFERENCES comments(id),   -- 回复的父评论
  reply_to_user_id INTEGER REFERENCES users(id),
  content TEXT NOT NULL,
  like_count INTEGER NOT NULL DEFAULT 0,
  is_hidden INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'normal',
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);

-- 点赞
CREATE TABLE IF NOT EXISTS likes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  target_type TEXT NOT NULL,                   -- post / comment
  target_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
  UNIQUE (user_id, target_type, target_id)
);

-- 收藏
CREATE TABLE IF NOT EXISTS favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  target_type TEXT NOT NULL,                   -- post / software
  target_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
  UNIQUE (user_id, target_type, target_id)
);

-- 关注
CREATE TABLE IF NOT EXISTS follows (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  follower_id INTEGER NOT NULL REFERENCES users(id),  -- 关注者
  following_id INTEGER NOT NULL REFERENCES users(id), -- 被关注者
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
  UNIQUE (follower_id, following_id)
);

-- 话题
CREATE TABLE IF NOT EXISTS topics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  icon TEXT DEFAULT '',
  post_count INTEGER NOT NULL DEFAULT 0,
  follower_count INTEGER NOT NULL DEFAULT 0,
  is_hot INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'normal',
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

-- 消息（私信）
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sender_id INTEGER NOT NULL REFERENCES users(id),
  receiver_id INTEGER NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages(sender_id, receiver_id);

-- 通知
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),   -- 接收者
  type TEXT NOT NULL,                              -- like/comment/reply/follow/system/announce/report_result
  actor_id INTEGER REFERENCES users(id),
  title TEXT DEFAULT '',
  content TEXT NOT NULL,
  target_type TEXT DEFAULT '',
  target_id INTEGER DEFAULT 0,
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);

-- 软件
CREATE TABLE IF NOT EXISTS software (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '',                     -- 图标（emoji 或颜色渐变标识）
  icon_color TEXT DEFAULT '#5B8DEF',
  category_id INTEGER REFERENCES software_categories(id),
  summary TEXT DEFAULT '',                  -- 简介
  description TEXT DEFAULT '',              -- 详细介绍
  screenshots TEXT DEFAULT '[]',            -- 截图 JSON
  version TEXT DEFAULT '1.0.0',
  size TEXT DEFAULT '0 MB',                 -- 大小
  developer TEXT DEFAULT '',
  update_time TEXT DEFAULT (datetime('now','localtime')),
  download_url TEXT DEFAULT '',
  download_count INTEGER NOT NULL DEFAULT 0,
  favorite_count INTEGER NOT NULL DEFAULT 0,
  rating REAL NOT NULL DEFAULT 0,           -- 软件评分 0-5
  rating_count INTEGER NOT NULL DEFAULT 0,
  tags TEXT DEFAULT '[]',
  changelog TEXT DEFAULT '',                -- 更新日志
  is_recommend INTEGER NOT NULL DEFAULT 0,  -- 推荐
  is_hot INTEGER NOT NULL DEFAULT 0,        -- 热门
  is_featured INTEGER NOT NULL DEFAULT 0,   -- 精品
  is_banner INTEGER NOT NULL DEFAULT 0,     -- 首页 Banner
  status TEXT NOT NULL DEFAULT 'normal',
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
CREATE INDEX IF NOT EXISTS idx_software_cat ON software(category_id);

-- 软件分类
CREATE TABLE IF NOT EXISTS software_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  icon TEXT DEFAULT '',
  sort INTEGER NOT NULL DEFAULT 0,
  software_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

-- 软件合集
CREATE TABLE IF NOT EXISTS software_collections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  cover TEXT DEFAULT '',
  summary TEXT DEFAULT '',
  software_ids TEXT DEFAULT '[]',
  software_count INTEGER NOT NULL DEFAULT 0,
  sort INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'normal',
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

-- 软件历史版本
CREATE TABLE IF NOT EXISTS software_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  software_id INTEGER NOT NULL REFERENCES software(id),
  version TEXT NOT NULL,
  size TEXT DEFAULT '',
  download_url TEXT DEFAULT '',
  changelog TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

-- 签到记录
CREATE TABLE IF NOT EXISTS checkins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  date TEXT NOT NULL,                        -- YYYY-MM-DD
  day INTEGER NOT NULL DEFAULT 0,            -- 连续第几天
  reward_exp INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
  UNIQUE (user_id, date)
);

-- 签到奖励配置
CREATE TABLE IF NOT EXISTS checkin_rewards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  day INTEGER NOT NULL UNIQUE,               -- 连续第 N 天
  exp INTEGER NOT NULL DEFAULT 10,
  bonus_exp INTEGER NOT NULL DEFAULT 0,      -- 额外奖励
  reward_desc TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

-- 每日任务
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,                 -- checkin/post/comment/like/browse/favorite
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  exp INTEGER NOT NULL DEFAULT 5,
  target_count INTEGER NOT NULL DEFAULT 1,   -- 完成次数
  sort INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

-- 用户任务进度
CREATE TABLE IF NOT EXISTS user_tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  task_id INTEGER NOT NULL REFERENCES tasks(id),
  date TEXT NOT NULL,                        -- YYYY-MM-DD
  progress INTEGER NOT NULL DEFAULT 0,
  completed INTEGER NOT NULL DEFAULT 0,
  claimed INTEGER NOT NULL DEFAULT 0,        -- 已领取奖励
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
  UNIQUE (user_id, task_id, date)
);

-- 举报
CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reporter_id INTEGER NOT NULL REFERENCES users(id),
  target_type TEXT NOT NULL,                 -- user / post / comment / software
  target_id INTEGER NOT NULL,
  reason TEXT NOT NULL,
  detail TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',    -- pending / approved / rejected / handled
  result TEXT DEFAULT '',
  handler_id INTEGER REFERENCES users(id),
  handled_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

-- 公告
CREATE TABLE IF NOT EXISTS announcements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'home',         -- home / community / software / activity / system
  content TEXT NOT NULL DEFAULT '',
  is_pinned INTEGER NOT NULL DEFAULT 0,
  is_published INTEGER NOT NULL DEFAULT 1,
  publish_time TEXT NOT NULL DEFAULT (datetime('now','localtime')),
  created_by INTEGER REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

-- 经验流水
CREATE TABLE IF NOT EXISTS experience_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  delta INTEGER NOT NULL,
  action TEXT NOT NULL,                      -- checkin/post/comment/liked/favorite/task...
  description TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
CREATE INDEX IF NOT EXISTS idx_exp_user ON experience_logs(user_id);

-- 邮箱验证码
CREATE TABLE IF NOT EXISTS email_verification_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  purpose TEXT NOT NULL,                     -- register / reset_password / change_email
  code_hash TEXT NOT NULL,                   -- 验证码哈希存储
  expires_at TEXT NOT NULL,
  used INTEGER NOT NULL DEFAULT 0,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
CREATE INDEX IF NOT EXISTS idx_email_code ON email_verification_codes(email, purpose);

-- 密码重置令牌
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  token_hash TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

-- 登录会话
CREATE TABLE IF NOT EXISTS login_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  token TEXT NOT NULL UNIQUE,
  device TEXT DEFAULT '',
  ip TEXT DEFAULT '',
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

-- 操作日志（管理员）
CREATE TABLE IF NOT EXISTS operation_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_user_id INTEGER REFERENCES users(id),
  admin_name TEXT DEFAULT '',
  action TEXT NOT NULL,
  target_type TEXT DEFAULT '',
  target_id INTEGER DEFAULT 0,
  detail TEXT DEFAULT '',
  ip TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

-- 系统设置（KV）
CREATE TABLE IF NOT EXISTS system_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  value TEXT DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

-- ============ 云屿扩展数据模型（v2：下载/评分/用户专题/上传） ============

-- 软件下载记录（防刷 + 下载趋势统计）
CREATE TABLE IF NOT EXISTS software_downloads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  software_id INTEGER NOT NULL REFERENCES software(id),
  user_id INTEGER REFERENCES users(id),        -- 匿名下载可为 NULL
  ip TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
CREATE INDEX IF NOT EXISTS idx_sw_dl_sw ON software_downloads(software_id);
CREATE INDEX IF NOT EXISTS idx_sw_dl_user ON software_downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_sw_dl_time ON software_downloads(created_at);

-- 软件评分（每人每软件一条，可改分，UNIQUE 防刷）
CREATE TABLE IF NOT EXISTS software_ratings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  software_id INTEGER NOT NULL REFERENCES software(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  score INTEGER NOT NULL CHECK (score BETWEEN 1 AND 5),
  comment TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
  UNIQUE (software_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_sw_rt_sw ON software_ratings(software_id);

-- 用户收藏专题（基于收藏的软件生成/整理的专题）
CREATE TABLE IF NOT EXISTS user_collections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  summary TEXT DEFAULT '',
  cover_color TEXT DEFAULT '',
  software_ids TEXT DEFAULT '[]',              -- JSON 数组
  software_count INTEGER NOT NULL DEFAULT 0,
  is_public INTEGER NOT NULL DEFAULT 1,        -- 是否公开
  status TEXT NOT NULL DEFAULT 'normal',       -- normal / deleted
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
CREATE INDEX IF NOT EXISTS idx_user_coll_user ON user_collections(user_id);

-- 上传文件登记（帖子图片等；文件本体存 data/uploads/）
CREATE TABLE IF NOT EXISTS upload_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  filename TEXT NOT NULL,                      -- 存储文件名（含随机前缀）
  original_name TEXT DEFAULT '',
  mime TEXT DEFAULT '',
  size INTEGER NOT NULL DEFAULT 0,
  url TEXT NOT NULL,                           -- 对外访问路径 /uploads/xxx
  thumb_url TEXT DEFAULT '',                   -- 缩略图路径 /uploads/xxx.thumb.jpg
  webp_url TEXT DEFAULT '',                    -- WebP 压缩路径 /uploads/xxx.webp
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
CREATE INDEX IF NOT EXISTS idx_upload_user ON upload_files(user_id);

-- 专题关注（用户关注其他人的专题）
CREATE TABLE IF NOT EXISTS collection_follows (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  collection_id INTEGER NOT NULL REFERENCES user_collections(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
  UNIQUE(user_id, collection_id)
);
CREATE INDEX IF NOT EXISTS idx_coll_follow_user ON collection_follows(user_id);
CREATE INDEX IF NOT EXISTS idx_coll_follow_coll ON collection_follows(collection_id);

-- 搜索历史（登录用户个人搜索记录）
CREATE TABLE IF NOT EXISTS search_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  keyword TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
CREATE INDEX IF NOT EXISTS idx_search_user ON search_history(user_id);

-- 邀请追踪（分享邀请关系）
CREATE TABLE IF NOT EXISTS invite_tracks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  inviter_id INTEGER NOT NULL REFERENCES users(id),
  invitee_id INTEGER REFERENCES users(id),      -- 被邀请人注册后回填
  ref_code TEXT NOT NULL,                        -- 邀请码
  source TEXT DEFAULT '',                        -- 来源渠道
  status TEXT NOT NULL DEFAULT 'pending',       -- pending / registered / rewarded
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
  registered_at TEXT,
  rewarded_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_invite_inviter ON invite_tracks(inviter_id);
CREATE INDEX IF NOT EXISTS idx_invite_code ON invite_tracks(ref_code);

-- 用户行为事件埋点
CREATE TABLE IF NOT EXISTS user_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),           -- 匿名用户可为 null
  session_id TEXT DEFAULT '',
  event_type TEXT NOT NULL,                       -- page_view / click / conversion / ...
  event_name TEXT NOT NULL,                       -- 具体事件标识
  target_type TEXT DEFAULT '',                    -- 目标对象类型
  target_id TEXT DEFAULT '',                      -- 目标对象 ID
  payload TEXT DEFAULT '{}',                      -- JSON 额外数据
  ip TEXT DEFAULT '',
  ua TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
CREATE INDEX IF NOT EXISTS idx_event_user ON user_events(user_id);
  CREATE INDEX IF NOT EXISTS idx_event_type ON user_events(event_type, created_at);
  CREATE INDEX IF NOT EXISTS idx_event_name ON user_events(event_name, created_at);
  CREATE INDEX IF NOT EXISTS idx_event_session ON user_events(session_id);

  -- 事件每日汇总（用于看板快速查询）
  CREATE TABLE IF NOT EXISTS event_daily_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stat_date TEXT NOT NULL,        -- YYYY-MM-DD
    event_type TEXT NOT NULL,
    event_name TEXT DEFAULT '',
    total_count INTEGER NOT NULL DEFAULT 0,
    unique_sessions INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
    UNIQUE(stat_date, event_type, event_name)
  );
  CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON event_daily_stats(stat_date);
  CREATE INDEX IF NOT EXISTS idx_daily_stats_type ON event_daily_stats(stat_date, event_type);
`;

// 执行建表
db.exec(SCHEMA);

module.exports = db;