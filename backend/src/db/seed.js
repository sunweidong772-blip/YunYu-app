// 云屿初始化种子数据：角色/权限/管理员/演示内容
const db = require('./index');
const config = require('../config');
const { hashPassword, normalizeEmail, generateToken } = require('../utils/crypto');
const { PERMISSIONS, ROLES } = require('../services/permissions');
const { addExp } = require('../services/growth');

function now() {
  return require('../utils/date').localDateTimeStr();
}

function ago(days, hours = 0) {
  const d = new Date(Date.now() - days * 86400000 - hours * 3600000);
  return require('../utils/date').localDateTimeStr(d);
}

function init() {
  const tx = db.transaction(() => {
    // ---------- 权限 ----------
    const hasPerm = db.prepare('SELECT COUNT(*) c FROM permissions').get().c;
    if (!hasPerm) {
      const insP = db.prepare('INSERT OR IGNORE INTO permissions (code, name, group_name) VALUES (?,?,?)');
      PERMISSIONS.forEach((p) => insP.run(p.code, p.name, p.group_name));
    }

    // ---------- 角色 ----------
    const insRole = db.prepare('INSERT OR IGNORE INTO roles (name, code, description, is_system) VALUES (?,?,?,?)');
    const roleIdByCode = {};
    ROLES.forEach((r) => {
      insRole.run(r.name, r.code, r.description, r.is_system);
      roleIdByCode[r.code] = db.prepare('SELECT id FROM roles WHERE code = ?').get(r.code).id;
    });
    // 角色权限
    db.prepare('DELETE FROM role_permissions').run();
    const rolePermStmt = db.prepare('INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (?,?)');
    ROLES.forEach((r) => {
      const roleId = roleIdByCode[r.code];
      const permIds = db.prepare(`SELECT id FROM permissions WHERE code IN (${r.perms.map(() => '?').join(',')})`).all(...r.perms);
      permIds.forEach((p) => rolePermStmt.run(roleId, p.id));
    });

    // ---------- 签到奖励默认配置 ----------
    const hasCR = db.prepare('SELECT COUNT(*) c FROM checkin_rewards').get().c;
    if (!hasCR) {
      const insCR = db.prepare('INSERT OR IGNORE INTO checkin_rewards (day, exp, bonus_exp, reward_desc) VALUES (?,?,?,?)');
      const plans = [
        [1, 10, 0], [2, 15, 0], [3, 20, 0], [4, 25, 0], [5, 30, 0], [6, 35, 0],
        [7, 40, 30], [8, 40, 0], [9, 45, 0], [10, 50, 0], [11, 50, 0], [12, 55, 0],
        [13, 60, 0], [14, 60, 30],
      ];
      plans.forEach(([day, exp, bonus]) => insCR.run(day, exp, bonus, bonus ? `连续 ${day} 天额外奖励` : ''));
    }

    // ---------- 每日任务 ----------
    const hasTask = db.prepare('SELECT COUNT(*) c FROM tasks').get().c;
    if (!hasTask) {
      const insT = db.prepare('INSERT OR IGNORE INTO tasks (code, name, description, exp, target_count, sort) VALUES (?,?,?,?,?,?)');
      insT.run('checkin', '每日签到', '完成一次签到', 10, 1, 1);
      insT.run('post', '发布帖子', '在社区发布 1 篇帖子', 15, 1, 2);
      insT.run('comment', '发表评论', '发表 1 条评论', 5, 1, 3);
      insT.run('like', '点赞内容', '点赞 1 次内容', 3, 1, 4);
      insT.run('browse', '浏览软件', '浏览 1 个软件', 2, 1, 5);
      insT.run('favorite', '收藏内容', '收藏 1 个内容', 4, 1, 6);
    }

    // ---------- 最高管理员「云屿岛主」----------
    const adminEmail = normalizeEmail(config.superAdmin.email);
    let owner = db.prepare('SELECT * FROM users WHERE email = ?').get(adminEmail);
    if (!owner) {
      const pwdHash = hashPassword(config.superAdmin.password);
      const uid = 'UU' + String(100000 + Math.floor(Math.random() * 899999));
      const info = db.prepare(
        'INSERT INTO users (uid, email, email_verified, nickname, password_hash, bio, status, role_type, must_change_password) VALUES (?,?,1,?,?,?,?,?,1)'
      ).run(uid, adminEmail, config.superAdmin.nickname, pwdHash, '云屿的缔造者与守护者：欢迎来到云屿。', 'normal', 'admin');
      owner = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
      // 岛主初始 EXP 与等级
      addExp(owner.id, 2600, 'init', '云屿岛主初始经验');
      const ownerRow = db.prepare('SELECT * FROM users WHERE id = ?').get(owner.id);
      owner = ownerRow;
    }
    const hasAdmin = db.prepare('SELECT COUNT(*) c FROM admins WHERE user_id = ?').get(owner.id).c;
    if (!hasAdmin) {
      const ownerRole = db.prepare('SELECT * FROM roles WHERE code = ?').get('owner');
      db.prepare('INSERT INTO admins (user_id, role_id, title) VALUES (?,?,?)').run(owner.id, ownerRole.id, '云屿岛主');
    }

    // 已有用户则跳过演示数据（避免重复）
    const userCount = db.prepare('SELECT COUNT(*) c FROM users').get().c;
    if (userCount > 1) return;

    // ---------- 12 个演示用户 ----------
    const demoUsers = [
      ['小屿', 'izzy.dev@example.com', '在云屿，发现好软件，认识新朋友 🌊', '👨‍💻'],
      ['云端漫步', 'cloud.walk@example.com', '科技产品控，效率工具收集者', '☁️'],
      ['岛屿回声', 'echo.isle@example.com', '独立开发中，喜欢小而美的应用', '🛠️'],
      ['星光收集者', 'star.collect@example.com', '摄影与修图爱好者 📷', '✨'],
      ['阿澈', 'a.che@example.com', '游戏玩家，主机与手游都玩', '🎮'],
      ['米粒同学', 'mili.student@example.com', '学生党，专注学习效率', '📚'],
      ['风里的船长', 'captain.wind@example.com', '音乐发烧友，耳机不离身', '🎧'],
      ['橘子树下', 'orange.tree@example.com', '设计狮，喜欢干净清爽的界面', '🍊'],
      ['北屿', 'north.isle@example.com', '理性种草，只推真正好用的', '🧭'],
      ['柠檬气泡', 'lemon.bubble@example.com', '少女心测评博主', '🍋'],
      ['开垦者', 'pioneer@example.com', '软件开发者，关注开源', '🌱'],
      ['晚风', 'evening.breeze@example.com', '间歇性更新的生活记录者', '🌙'],
    ];
    const userIds = [];
    demoUsers.forEach(([nick, email, bio, avatar], i) => {
      const pwd = hashPassword('yunyu123');
      const uid = 'UU' + String(200001 + i);
      const info = db.prepare(
        'INSERT INTO users (uid, email, email_verified, nickname, password_hash, avatar, bio, status, role_type) VALUES (?,?,1,?,?,?,?,?,?)'
      ).run(uid, email, nick, pwd, avatar, bio, 'normal', 'user');
      userIds.push(info.lastInsertRowid);
      // 随机经验
      const exp = [30, 120, 260, 80, 420, 66, 210, 150, 480, 90, 320, 40][i];
      addExp(info.lastInsertRowid, exp, 'init', '注册奖励');
      // 模拟部分签到
      const streak = [2, 5, 1, 7, 3, 0, 6, 4, 8, 1, 5, 2][i];
      for (let s = 0; s < streak; s++) {
        const d = new Date(Date.now() - (streak - s) * 86400000).toISOString().slice(0, 10);
        db.prepare('INSERT OR IGNORE INTO checkins (user_id, date, day, reward_exp) VALUES (?,?,?,?)').run(info.lastInsertRowid, d, s + 1, 10 + s * 5);
      }
      if (streak > 0) {
        db.prepare('UPDATE users SET checkin_streak = ?, checkin_total = ?, last_checkin_date = ? WHERE id = ?')
          .run(streak, streak, new Date(Date.now() - 86400000).toISOString().slice(0, 10), info.lastInsertRowid);
      }
    });

    // ---------- 软件分类 ----------
    const demoCategories = [
      ['应用', '📦'], ['游戏', '🎮'], ['工具', '🔧'], ['社交', '💬'],
      ['娱乐', '🎬'], ['学习', '📚'], ['效率', '⚡'], ['系统', '🖥️'],
      ['摄影', '📷'], ['音乐', '🎵'], ['视频', '🎞️'], ['其他', '🧩'],
    ];
    const catIds = {};
    demoCategories.forEach(([name, icon], i) => {
      const info = db.prepare('INSERT OR IGNORE INTO software_categories (name, icon, sort) VALUES (?,?,?)').run(name, icon, i);
      catIds[name] = db.prepare('SELECT id FROM software_categories WHERE name = ?').get(name).id;
    });

    // ---------- 20 个软件 ----------
    const demoSoftware = [
      ['白日梦笔记', 'notebook', '效率', '⚡', '#5B8DEF', '轻量级灵感记录工具，支持 Markdown 与快速卡片', '1.4.2', '38.6 MB', '白日梦工作室', 4.9, 12840],
      ['潮汐白噪音', 'white-noise', '娱乐', '🌊', '#5EC8F0', '沉浸式白噪音助眠，海浪与雨声陪伴入眠', '2.1.0', '52.3 MB', '潮汐实验室', 4.7, 8620],
      ['像素星球', 'pixel-planet', '游戏', '🪐', '#8B7CF6', '像素风沙盒小游戏，建造你的星球', '1.9.3', '188 MB', '像素工厂', 4.5, 23500],
      ['极简待办', 'todo-lite', '效率', '✅', '#34C48B', '专注当下的一件小事，极简待办清单', '3.0.1', '21.4 MB', '极简主义小组', 4.8, 15600],
      ['云相册', 'cloud-album', '摄影', '🖼️', '#F6A94C', '智能分类的云端相册，自动整理回忆', '5.2.0', '96.8 MB', '云屿工作室', 4.6, 19800],
      ['岛屿阅读', 'isle-read', '学习', '📖', '#E86B7A', '碎片时间阅读，精选长文与知识卡片', '2.3.4', '45.0 MB', '岛屿文化', 4.7, 7310],
      ['飞快浏览器', 'fast-browser', '系统', '🧭', '#3B82F6', '极速搜索与浏览，广告拦截神器', '8.4.1', '78.2 MB', '飞快团队', 4.4, 30200],
      ['音符捕手', 'note-catcher', '音乐', '🎧', '#9B59B6', '听歌识曲与歌词翻译，捕捉每一段旋律', '4.0.0', '66.7 MB', '音符工作室', 4.8, 11400],
      ['剪辑快手', 'clip-fast', '视频', '🎬', '#EF5350', '手机端快速剪辑，模板一键出片', '7.3.6', '152 MB', '快手映画', 4.3, 27600],
      ['光之摄影', 'light-photo', '摄影', '📷', '#FFB300', '专业级手机摄影参数控制', '2.8.2', '88.9 MB', '光影工坊', 4.7, 9450],
      ['岛屿社交', 'isle-social', '社交', '💬', '#26A69A', '同兴趣岛屿社区，认识同频的人', '1.6.8', '42.1 MB', '岛屿网络', 4.2, 5600],
      ['每日英语', 'daily-english', '学习', '🇬🇧', '#5C6BC0', '每天 10 分钟英语打卡，单词听力两不误', '3.5.0', '35.4 MB', '知行教育', 4.6, 12900],
      ['文件快递', 'file-express', '工具', '📦', '#7E57C2', '跨设备文件互传，无需登录秒传', '1.2.5', '28.0 MB', '快递小队', 4.5, 18300],
      ['睡眠管家', 'sleep-keeper', '健康', '🌙', '#3949AB', '睡眠监测与智能闹钟，记录你的每一夜', '2.0.3', '49.6 MB', '安眠实验室', 4.4, 8760],
      ['代码仓库', 'code-vault', '开发', '👨‍💻', '#1E88E5', '手机端代码浏览与 Git 管理', '6.1.0', '67.3 MB', '开发者联盟', 4.6, 6820],
      ['地图旅途', 'map-trip', '出行', '🗺️', '#43A047', '旅行路线规划与离线地图', '3.2.1', '112 MB', '旅途科技', 4.5, 10400],
      ['钱包管家', 'wallet-master', '效率', '💰', '#F9A825', '记账管钱，让每一分都有去处', '4.6.7', '31.2 MB', '管家小组', 4.7, 15200],
      ['桌面美化', 'desktop-art', '系统', '🎨', '#EC407A', '桌面壁纸与小组件美化', '2.9.0', '57.8 MB', '美化大师', 4.3, 9800],
      ['时间胶囊', 'time-capsule', '娱乐', '⏳', '#66BB6A', '写给未来自己的信，慢下来感受时间', '1.0.4', '18.9 MB', '慢时光', 4.9, 4210],
      ['随身翻译', 'pocket-translator', '学习', '🌐', '#FB8C00', '离线词典与实时翻译，旅行必备', '5.4.0', '72.5 MB', '翻译官团队', 4.5, 16700],
    ];
    const softwareIds = [];
    demoSoftware.forEach(([name, slug, cat, icon, color, summary, version, size, dev, rating, dl], i) => {
      const info = db.prepare(
        `INSERT INTO software (name, icon, icon_color, category_id, summary, description, version, size, developer, download_count, favorite_count, rating, rating_count, tags, changelog, is_recommend, is_hot, is_featured, is_banner, update_time)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
      ).run(
        name, icon, color, catIds[cat], summary,
        `${summary}\n\n云屿精选优质 ${cat} 类软件，界面清爽、功能完善，由云屿团队与社区用户共同维护。\n\n· 支持版本更新提醒\n· 社区用户真实评价\n· 安全下载，无捆绑安装`,
        version, size, dev, dl, Math.floor(dl / 8 + (i * 37) % 300), rating, Math.floor(200 + i * 83),
        JSON.stringify([cat, '云屿精选', dev]), `v${version} 版本更新：\n- 修复已知问题\n- 优化启动速度\n- 新增多项细节体验`,
        i < 6 ? 1 : 0, i < 8 ? 1 : 0, i < 6 ? 1 : 0, i < 4 ? 1 : 0,
        ago(i % 5, i % 23)
      );
      const id = info.lastInsertRowid;
      softwareIds.push(id);
      // 历史版本
      db.prepare('INSERT INTO software_versions (software_id, version, size, changelog, created_at) VALUES (?,?,?,?,?)')
        .run(id, `${version.slice(0, 3)}1`, size, '优化体验与稳定性', ago(i % 5 + 10));
      db.prepare('INSERT INTO software_versions (software_id, version, size, changelog, created_at) VALUES (?,?,?,?,?)')
        .run(id, `${version.slice(0, 3)}0`, size, '首次上架云屿', ago(i % 5 + 20));
      // 更新计数
      db.prepare('UPDATE software_categories SET software_count = software_count + 1 WHERE id = ?').run(catIds[cat]);
    });

    // ---------- 软件合集 ----------
    const collections = [
      ['云屿精选', '🛡️', '云屿团队每周精选的优质软件', [0, 2, 4, 6, 8]],
      ['装机必备', '💻', '新设备到手，先装这些', [13, 11, 6, 2, 18]],
      ['效率工具', '⚡', '让你的工作学习事半功倍', [1, 3, 14, 15, 16]],
      ['实用工具', '🔧', '小而美的宝藏工具合集', [12, 15, 3, 13]],
      ['学生党必备', '🎓', '学习神器，拿来就能用', [11, 3, 18, 7, 9]],
      ['热门游戏', '🎮', '最近大家都在玩', [2, 1, 14, 8]],
    ];
    collections.forEach(([name, cover, summary, idxs], i) => {
      const ids = idxs.map((x) => softwareIds[x]);
      db.prepare('INSERT INTO software_collections (name, cover, summary, software_ids, software_count, sort) VALUES (?,?,?,?,?,?)')
        .run(name, cover, summary, JSON.stringify(ids), ids.length, i);
    });

    // ---------- 话题 ----------
    const topics = [
      ['软件推荐', '分享你发现的好软件', '💡'],
      ['效率工具', '提升效率的一切', '⚡'],
      ['游戏交流', '一起分享游戏快乐', '🎮'],
      ['桌面美化', '让桌面变成喜欢的样子', '🎨'],
      ['学生专区', '学习路上的好帮手', '📚'],
      ['独立开发', '聊聊开发者那些事', '👨‍💻'],
      ['摄影后期', '修图与摄影技巧', '📷'],
      ['音乐分享', '好音乐值得被听到', '🎧'],
      ['云屿活动', '官方活动与福利', '🎁'],
      ['新人报到', '欢迎加入云屿', '👋'],
    ];
    const topicIds = [];
    topics.forEach(([name, desc, icon], i) => {
      const info = db.prepare('INSERT OR IGNORE INTO topics (name, description, icon, is_hot, post_count) VALUES (?,?,?,?,?)')
        .run(name, desc, icon, i < 4 ? 1 : 0, 10 + i * 4);
      topicIds.push(db.prepare('SELECT id FROM topics WHERE name = ?').get(name).id);
    });

    // ---------- 20 个帖子 ----------
    const posts = [
      ['安利一款超好用的笔记软件「白日梦笔记」', '这篇帖子讲的是我最近遇见的宝藏……', '软件推荐', 0, 1],
      ['你们手机上必装的软件是什么？', '想收集大家的装机清单……', '软件推荐', 0, 1],
      ['效率工具合集：5 款让学习事半功倍的应用', '第 1 款是极简待办……', '效率工具', 1, 4],
      ['像素星球玩了一个月，分享我的星球建造', '从零开始建造的过程……', '游戏交流', 1, 3],
      ['新人报到！刚加入云屿', '大家好，我是小屿……', '新人报到', 0, 10],
      ['潮汐白噪音真的能改善睡眠吗？实测体验', '用了两周，说说感受……', '音乐分享', 0, 8],
      ['云相册自动整理功能太强了', '几万张照片自动按时间地点分类……', '摄影后期', 0, 6],
      ['独立开发者的日常：从想法到上线', '记录我开发一个小工具的全过程……', '独立开发', 0, 5],
      ['学生党必备学习 App 盘点', '整理了 6 个学习神器……', '学生专区', 1, 5],
      ['桌面美化分享：我的极简风桌面', '先上图，配置清单在下面……', '桌面美化', 1, 4],
      ['今日云屿话题：你最喜欢哪个分类的软件？', '评论区聊聊……', '软件推荐', 0, 2],
      ['剪视频用什么软件？欢欢交流', '手机端剪辑方案对比……', '软件推荐', 0, 1],
      ['岛屿阅读的每日推荐质量真高', '连续读了一周……', '软件推荐', 0, 2],
      ['手机后台耗电严重？试试这个优化思路', '减少后台进程的几个实用方法……', '效率工具', 0, 1],
      ['音符捕手听歌识曲准确率测试', '测了 20 首歌的识别率……', '音乐分享', 0, 7],
      ['时间胶囊：写给一年后的自己', '刚写完一封，还挺有仪式感……', '云屿活动', 1, 1],
      ['用飞快浏览器替换默认浏览器的体验', '广告拦截确实强……', '效率工具', 0, 2],
      ['独立开发者请求支援：帮我测试 App', '开发了一款记账应用……', '独立开发', 0, 5],
      ['微信读书和岛屿阅读，你选哪个？', '各有各的好……', '学生专区', 0, 2],
      ['晚安的岛屿：今天你在云屿发现了什么？', '每日闲聊帖……', '新人报到', 0, 1],
    ];
    const postIds = [];
    posts.forEach(([title, content, topicName, featured, uidIdx], i) => {
      const author = userIds[uidIdx % userIds.length];
      const postCount = 1 + (i % 3);
      const info = db.prepare(
        `INSERT INTO posts (user_id, title, content, images, topic_id, tags, like_count, comment_count, favorite_count, view_count, is_featured, created_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`
      ).run(
        author, title, content + '（演示内容：' + title + '）\n\n这里是帖子正文。云屿是一个温暖、年轻的软件聚合社区，欢迎分享你发现的好软件、好工具与生活碎片。',
        JSON.stringify([]), topicIds[topics.findIndex((t) => t[0] === topicName)], JSON.stringify([topicName, '云屿']),
        (i * 7) % 88, (i * 3) % 16, (i * 5) % 30, 100 + i * 57, featured, ago(i % 6, i * 3)
      );
      postIds.push(info.lastInsertRowid);
      db.prepare('UPDATE users SET post_count = post_count + ? WHERE id = ?').run(postCount, author);
      db.prepare('UPDATE topics SET post_count = post_count + 1 WHERE id = ?').run(topicIds[topics.findIndex((t) => t[0] === topicName)]);
    });

    // ---------- 30 条评论 ----------
    const comments = [
      '确实好用，我用了半年了！', '感谢分享，马上试试', '同款推荐，特别好用 👍',
      '这个思路不错', '哈哈哈真实', '能不能详细说说第 3 款？',
      '已收藏，慢慢研究', '楼主有心了', '我也有同感',
      '想问下这个是付费的吗？', '免费版就够用了', '好家伙，入坑了',
      '支持一下楼主', '路过帮顶', '这个软件我也有，支持',
      '内容很实用，收藏了', '学到了，谢谢', '正好需要，感谢',
      '哇，看起来不错', '请问支持 iOS 吗？', '安卓可以吗？',
      '试了一下，确实流畅', '界面很干净', '已经下载了',
      '楼主的品味不错', '期待更多这样的分享', '关注了，持续更新呀',
      '这个功能太强了', '谢谢分享宝藏', '云屿真是个宝地，发现了好多好软件',
    ];
    comments.forEach((content, i) => {
      const pid = postIds[i % postIds.length];
      const uid = userIds[(i + 3) % userIds.length];
      const info = db.prepare('INSERT INTO comments (post_id, user_id, content, created_at) VALUES (?,?,?,?)')
        .run(pid, uid, content, ago(i % 5, i * 2));
      db.prepare('UPDATE posts SET comment_count = comment_count + 1 WHERE id = ?').run(pid);
      // 部分评论带回复
      if (i % 3 === 0) {
        db.prepare('INSERT INTO comments (post_id, user_id, parent_id, reply_to_user_id, content, created_at) VALUES (?,?,?,?,?,?)')
          .run(pid, uid, info.lastInsertRowid, uid, '回复楼上：' + content + ' +1', ago(i % 4, i));
      }
      db.prepare('UPDATE users SET comment_count = comment_count + 1 WHERE id = ?').run(uid);
    });

    // ---------- 点赞 / 收藏 / 关注 ----------
    const likeStmt = db.prepare('INSERT OR IGNORE INTO likes (user_id, target_type, target_id) VALUES (?,?,?)');
    const favStmt = db.prepare('INSERT OR IGNORE INTO favorites (user_id, target_type, target_id) VALUES (?,?,?)');
    const followStmt = db.prepare('INSERT OR IGNORE INTO follows (follower_id, following_id) VALUES (?,?)');
    userIds.forEach((uid, i) => {
      // 点赞若干个帖子与评论
      for (let k = 0; k < 3; k++) {
        const pid = postIds[(i + k * 5) % postIds.length];
        likeStmt.run(uid, 'post', pid);
        db.prepare("UPDATE posts SET like_count = (SELECT COUNT(*) FROM likes WHERE target_type='post' AND target_id=?) WHERE id = ?").run(pid, pid);
        const cid = db.prepare('SELECT id FROM comments WHERE post_id = ? LIMIT 1').get(pid);
        if (cid) { likeStmt.run(uid, 'comment', cid.id); db.prepare("UPDATE comments SET like_count = (SELECT COUNT(*) FROM likes WHERE target_type='comment' AND target_id=?) WHERE id = ?").run(cid.id, cid.id); }
      }
      // 收藏软件与帖子
      favStmt.run(uid, 'software', softwareIds[(i * 3) % softwareIds.length]);
      favStmt.run(uid, 'software', softwareIds[(i * 3 + 5) % softwareIds.length]);
      favStmt.run(uid, 'post', postIds[(i * 2) % postIds.length]);
      // 关注
      const target = userIds[(i + 4) % userIds.length];
      if (target !== uid) followStmt.run(uid, target);
    });
    // 重新统计获赞
    db.prepare(`UPDATE users SET like_count = (SELECT COUNT(*) FROM likes WHERE target_type='post' AND target_id IN (SELECT id FROM posts WHERE user_id = users.id)) + (SELECT COUNT(*) FROM likes WHERE target_type='comment' AND target_id IN (SELECT id FROM comments WHERE user_id = users.id))
    `).run();
    const likeVote = db.prepare('SELECT COUNT(*) c FROM likes');
    db.prepare("UPDATE users SET favorite_count = (SELECT COUNT(*) FROM favorites WHERE target_type='software' AND target_id IN (SELECT id FROM software) AND user_id = users.id)").run();

    // ---------- 通知（给部分演示用户）----------
    const notifStmt = db.prepare('INSERT OR IGNORE INTO notifications (user_id, type, actor_id, title, content, target_type, target_id, is_read, created_at) VALUES (?,?,?,?,?,?,?,?,?)');
    notifStmt.run(userIds[0], 'like', userIds[1], '', '云端漫步 赞了你的帖子《安利一款超好用的笔记软件》', 'post', postIds[0], 0, ago(0, 2));
    notifStmt.run(userIds[0], 'comment', userIds[2], '', '岛屿回声 评论了你的帖子：确实好用，我用了半年了！', 'post', postIds[0], 0, ago(0, 5));
    notifStmt.run(userIds[0], 'follow', userIds[3], '', '星光收集者 关注了你', 'user', userIds[0], 0, ago(1, 3));
    notifStmt.run(userIds[1], 'system', null, '欢迎来到云屿', '完成每日任务可获得 EXP，升级你的等级！', '', 0, 0, ago(0, 8));

    // ---------- 私信 ----------
    db.prepare('INSERT INTO messages (sender_id, receiver_id, content, is_read, created_at) VALUES (?,?,?,?,?)')
      .run(userIds[1], userIds[0], '你好呀，看了你的帖子，用的什么笔记软件？', 1, ago(0, 6));
    db.prepare('INSERT INTO messages (sender_id, receiver_id, content, is_read, created_at) VALUES (?,?,?,?,?)')
      .run(userIds[0], userIds[1], '哈哈是白日梦笔记，挺好用的！', 1, ago(0, 5));

    // ---------- 举报（演示）----------
    db.prepare('INSERT INTO reports (reporter_id, target_type, target_id, reason, detail, status, created_at) VALUES (?,?,?,?,?,?,?)')
      .run(userIds[5], 'post', postIds[9], '广告推广', '疑似广告内容，请管理员审核', 'pending', ago(1, 4));
    db.prepare('INSERT INTO reports (reporter_id, target_type, target_id, reason, detail, status, created_at) VALUES (?,?,?,?,?,?,?)')
      .run(userIds[4], 'software', softwareIds[6], '信息不准确', '版本号与实际不符', 'pending', ago(0, 9));

    // ---------- 公告 ----------
    const anStmt = db.prepare('INSERT INTO announcements (title, type, content, is_pinned, is_published, publish_time, created_by) VALUES (?,?,?,?,?,?,?)');
    anStmt.run('欢迎来到云屿 ☁️', 'home', '这里收藏着全网最实用的软件与工具，还有一群热爱分享的岛民。注册即可签到、发帖、参与讨论，累计 EXP 升级你的岛屿等级！', 1, 1, ago(0, 10), owner.id);
    anStmt.run('云屿社区规范 v1.0', 'community', '请友善发言，禁止广告刷屏与人身攻击。违规内容将由管理员处理。', 1, 1, ago(1, 0), owner.id);
    anStmt.run('「云屿精选」每周更新', 'software', '每周五云屿团队会更新一期精选软件合集，敬请关注。', 0, 1, ago(2, 5), owner.id);
    anStmt.run('新人签到有礼 🎁', 'activity', '连续签到 7 天即可获得额外 EXP 奖励！坚持就是胜利。', 0, 1, ago(3, 2), owner.id);
    anStmt.run('系统维护通知', 'system', '云屿将于每周日凌晨 3:00-4:00 进行例行维护，期间部分功能可能短暂不可用。', 0, 1, ago(4, 6), owner.id);

    console.log('[seed] 初始化完成：12 用户 / 20 软件 / 12 分类 / 20 帖子 / 30+ 评论 / 10 话题 / 6 合集');
  });
  tx();
}

init();
module.exports = { init };