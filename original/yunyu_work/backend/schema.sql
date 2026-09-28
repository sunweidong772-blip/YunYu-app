-- 云屿数据库表结构
-- 创建时间：2026-08-31

-- 启用UUID扩展
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 用户表
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(40) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user', -- user / admin
  admin_role_code VARCHAR(30), -- owner / chief / super / moderator / inspector / community
  display_name VARCHAR(50),
  bio VARCHAR(500) DEFAULT '',
  avatar_url VARCHAR(500),
  yunyu_id VARCHAR(20) UNIQUE,
  exp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  points INTEGER DEFAULT 0,
  equipped_badge_id INTEGER,
  equipped_frame_id INTEGER,
  status VARCHAR(20) DEFAULT 'active', -- active / banned
  banned_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 帖子表
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  images TEXT[], -- 图片URL数组
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending', -- pending / published / rejected
  reject_reason VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 评论表
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'published', -- published / hidden
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 点赞表
CREATE TABLE likes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, post_id)
);

-- 关注表
CREATE TABLE follows (
  id SERIAL PRIMARY KEY,
  follower_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  following_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(follower_id, following_id)
);

-- 私信表
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 软件表
CREATE TABLE apps (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) DEFAULT '实用工具',
  intro TEXT,
  icon_url VARCHAR(500),
  version VARCHAR(50) DEFAULT '1.0.0',
  official_url VARCHAR(500),
  source_type VARCHAR(20) DEFAULT 'official',
  package_name VARCHAR(100),
  download_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending', -- pending / published / archived / rejected
  reject_reason VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 软件版本表
CREATE TABLE app_versions (
  id SERIAL PRIMARY KEY,
  app_id INTEGER REFERENCES apps(id) ON DELETE CASCADE,
  version_name VARCHAR(50) NOT NULL,
  version_code INTEGER,
  download_url VARCHAR(500) NOT NULL,
  change_log TEXT,
  is_current BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 收藏表
CREATE TABLE favorites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  app_id INTEGER REFERENCES apps(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, app_id)
);

-- 举报表
CREATE TABLE reports (
  id SERIAL PRIMARY KEY,
  reporter_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  target_type VARCHAR(20) NOT NULL, -- post / comment / app / user
  target_id INTEGER NOT NULL,
  reason VARCHAR(500) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending / processing / resolved / rejected
  handler_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  handle_note VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  handled_at TIMESTAMP
);

-- 管理员操作日志
CREATE TABLE admin_logs (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(20),
  target_id INTEGER,
  detail TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 徽章表
CREATE TABLE badges (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  icon VARCHAR(500),
  description VARCHAR(500),
  condition_type VARCHAR(50), -- level / posts / apps / special
  condition_value INTEGER
);

-- 头像框表
CREATE TABLE avatar_frames (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  icon VARCHAR(500),
  condition_type VARCHAR(50),
  condition_value INTEGER
);

-- 公告表
CREATE TABLE announcements (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 插入初始徽章
INSERT INTO badges (name, icon, description, condition_type, condition_value) VALUES
('初来乍到', '🌱', '刚加入云屿', 'level', 1),
('社区新星', '⭐', '等级达到10级', 'level', 10),
('活跃用户', '🔥', '等级达到30级', 'level', 30),
('社区达人', '💎', '等级达到50级', 'level', 50),
('云屿长老', '🏆', '等级达到80级', 'level', 80),
('软件分享者', '📱', '发布过软件', 'apps', 1),
('优质创作者', '✍️', '发布过10篇帖子', 'posts', 10);

-- 插入初始头像框
INSERT INTO avatar_frames (name, icon, condition_type, condition_value) VALUES
('默认框', '', 'level', 1),
('银色框', '🥈', 'level', 20),
('金色框', '🥇', 'level', 50),
('钻石框', '💎', 'level', 80),
('传说框', '👑', 'level', 100);

-- 创建索引
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_apps_status ON apps(status);
CREATE INDEX idx_apps_category ON apps(category);
CREATE INDEX idx_messages_receiver ON messages(receiver_id, is_read);
CREATE INDEX idx_reports_status ON reports(status);

-- 签到记录表
CREATE TABLE check_ins (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  checkin_date DATE NOT NULL,
  continuous_days INTEGER DEFAULT 1,
  exp_earned INTEGER DEFAULT 5,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, checkin_date)
);
CREATE INDEX idx_checkins_user ON check_ins(user_id);

-- 经验值流水表
CREATE TABLE exp_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  exp_change INTEGER NOT NULL,
  reason VARCHAR(50) NOT NULL, -- checkin / post / app / comment / liked / downloaded
  target_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_explogs_user ON exp_logs(user_id);

