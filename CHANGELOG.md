# 云屿 · 变更记录（CHANGELOG）

## v1.4.0（2026-09-26）· 数据库基建优化 + Token 续期 + 前端监控 + 部署文档 + Capacitor APK 支持

> 本轮补齐系统稳定性、用户体验与可部署性：数据库索引优化、Token 自动续期、前端错误监控、完整部署文档与 APK 打包支持。

### 1. 数据库基建优化
- `user_events` 表追加 `session_id` 单列索引，加速会话级查询；
- 等级体系扩展至 **LV15**（新增「云屿传说」「云屿传奇」「云屿宗师」「云屿至尊」「云屿不朽」），经验阈值覆盖至 50000 EXP，保持长期成长感；
- 新增 `event_daily_stats` 每日事件汇总表，Dashboard 优先读汇总表（自动检测表存在并回退原始表），降低看板 COUNT(*) 全表扫描压力。

### 2. Token 自动续期机制
- 后端登录/注册接口返回 `refreshToken`（JWT 30 天有效期，`type: 'refresh`）；
- 新增 `POST /api/auth/refresh` 接口，验证 refreshToken 后签发新 `token` + 新 `refreshToken`；
- 前端 `request.js` 拦截器重构：401 时自动调用刷新，并发请求排队等待新 Token，刷新失败统一回调登出；支持 `setRefreshToken` / `getRefreshToken` API。

### 3. 前端全局错误监控
- `App.vue` 注册 `window.addEventListener('error', …)` 与 `unhandledrejection`，捕获 JS 异常与 Promise 拒绝；
- 自动上报到 `/api/events/track`，`event_type='js_error'`，携带 message / stack / filename / lineno；
- 静默失败不阻塞业务。

### 4. 数据库备份策略文档
- 新增 `docs/BACKUP-STRATEGY.md`：自动备份脚本（SQLite 在线 `.backup` + gzip）、crontab 定时任务、手动备份/恢复流程、完整性验证、RTO/RPO 目标、监控建议。
- `deploy/deploy.sh` 已集成备份脚本安装（`scripts/backup.sh` + crontab）。

### 5. 静态资源缓存策略
- `deploy/nginx.conf` 细化缓存规则：
  - `assets/` 目录（带哈希文件名）→ `expires 1y` 长期缓存；
  - 图标/manifest → `expires 30d`；
  - `index.html` → `no-cache` 确保用户获取最新版本；
  - SSE 支持：`proxy_buffering off`。

### 6. 云服务器部署指南
- 新增 `docs/DEPLOY.md`：完整环境准备（Node.js / Nginx / SSL）、一键部署脚本说明、生产环境变量配置（必须修改 `SUPER_ADMIN_PASSWORD` 与 `JWT_SECRET`）、域名 + HTTPS 配置、运维命令、故障排查。

### 7. Android APK 打包（Capacitor）
- 前端集成 **Capacitor v5**（兼容 Node 18）：
  - `capacitor.config.json`：应用 ID `com.yunyu.app`、应用名「云屿」、webDir `dist`、启动页 3 秒 + 品牌色 `#2F8CFF`；
  - `android/` 原生项目已初始化（Gradle 构建、自适应图标、mipmap 全密度覆盖、Splash 横竖屏各 DPI）；
  - `app/build.gradle` versionName 同步为 `1.3.0`；
- 新增 `docs/APK-BUILD.md`：环境要求（JDK 17 + Android Studio）、命令行 / Android Studio 两种打包方式、应用签名配置（KeyStore + 环境变量安全方案）、AAB 与 APK 区别、USB 调试安装、Google Play / 国内商店上架指南、Capacitor 插件扩展说明。

### 质量验证
- 冒烟测试 **47 项断言全部通过**；
- Token 刷新链路端到端验证（登录获取 refreshToken → 调 refresh 获取新 token → 新 token 可用）；
- 前端生产构建通过（gzip 48.03 kB）；
- 生产模式验证通过（静态页 / API / SPA 路由 / 登录）。

---

> 本轮一次性落地 13 项体验与运营能力改进，补齐用户行为埋点与看板，并沉淀 SQLite 并发策略文档；全量回归通过后重新打包交付。

### 1. 图片压缩与缩略图
- 上传图片经 Python Pillow 压缩并生成 `thumb_url`（缩略图）/ `webp_url`（WebP 版），`upload_files` 表补齐对应列；前端列表与详情优先使用轻量缩略图，节省流量、加速首屏。

### 2. SSE 实时推送
- 新增 `GET /api/events`（SSE 长连接，需登录）：点赞、评论、私信、通知等事件实时推送到在线用户；断线自动重连。

### 3. 限流防爬
- 全站接口按 IP 限流（60 秒窗口），登录/注册/验证码独立计数；后台操作与写接口额外保护，日志可追踪。

### 4. 截图预览
- 软件详情支持上传截图（多图），详情页轮播预览；`software_screenshots` 表随启动自动创建。

### 5. 评论楼层
- 评论支持楼层号（1F/2F…），与楼中楼回复并存；新评论自动编号。

### 6. 帖子富文本
- 发帖支持加粗、斜体、行内代码、链接、引用与列表（白名单 HTML 清洗），预览即时渲染，防 XSS。

### 7. 搜索增强
- 全局搜索（软件/帖子/用户）返回 `highlighted` 高亮片段（`<mark>` 标注命中词）；新增热门搜索词接口与用户搜索历史记录；前端搜索页展示热词与历史。

### 8. 版本历史
- 软件新增「版本历史」：`software_versions` 表 + 详情页版本时间线（版本号/说明/日期）。

### 9. 专题关注
- 用户可关注专题（`collection_follows` 表）：专题列表显示关注数，个人中心可查看我关注的专题。

### 10. 用户主页增强
- 主页新增：动态时间轴（发帖/点赞/评论/收藏聚合）、活跃热力图（近 30 天）、兴趣标签展示。

### 11. 邀请分享后端
- 邀请码体系：`GET /api/users/me/invite-code` 幂等生成邀请码并拼出邀请链接；`GET /api/users/me/invite-stats` 返回邀请统计；被邀请人注册成功后邀请人获得 +30 EXP（`experience_logs` 记录 action=invite）。

### 12. SEO 动态 meta
- 服务端按路由（首页/软件/帖子/话题）注入动态 title / description / og 标签，未匹配路由回退默认值；利于分享卡片与搜索引擎收录。

### 13. 首屏骨架屏
- 首页、软件列表、帖子列表等核心页面在数据加载期间展示骨架屏占位，弱化白屏等待。

### 14. 数据分析埋点（用户行为）
- 后端新增 `POST /api/events/track`（`user_events` 表）：事件类型/名称/目标/载荷/会话 ID 入库，静默失败不阻塞业务；
- 前端 App.vue 自动上报页面浏览（sessionId + watch 路由 + sendBeacon 降级），支持业务自定义事件；
- 管理后台看板新增事件模块：今日 PV / 今日总事件 / 近 7 天趋势图（PV 与点击双系列）/ 热门事件 TOP8。

### 15. SQLite 并发策略文档
- 新增 `docs/SQLITE-CONCURRENCY.md`：better-sqlite3 单连接 + WAL 现状说明、单进程为何足够、多进程迁移路径（IPC 队列化 / 分库 / PostgreSQL / Turso、D1）、WAL 膨胀监控建议与结论表（DAU < 1 万 SQLite 足够，> 5 万迁移 PostgreSQL）。

### 质量验证
- 冒烟测试从 42 项扩展至 **47 项断言全部通过**（新增：搜索高亮、邀请码生成、邀请统计、事件埋点、看板含事件统计）；
- 邀请完整链路端到端验证通过（生成邀请码 → 带 ref 注册 → `invite_tracks` pending→registered 落库 → 邀请人 +30 EXP 写入流水）；
- 前端生产构建通过（gzip 47.56 kB）；生产模式单实例验证静态页 / SPA 路由 / API / 登录均 200。

---

## v1.2.1（2026-09-26）· 标准品牌图标（梦幻风格）

> 补齐站点级标准图标：此前工程无 favicon / 应用图标资源，本轮按用户提供的梦幻参考图风格重新设计并生成「云屿」品牌图标全套资源。

### 图标设计
- **风格**：粉蓝渐变梦幻背景，清新二次元插画风格；
- **主体**：中央白色手写艺术字「云屿」，「屿」字旁点缀粉色爱心；
- **底部**：白色浮空小岛带柔和立体感；
- **点缀**：四周散布白色小星星和小云朵；
- **形状**：圆角方形 App 图标（iOS 风格 22% 圆角）。

### 图标资源（frontend/public/）
- **源稿**：`icons/icon-master.png`（1024×1024，AI 生成源稿，梦幻粉蓝渐变风格）；
- **favicon.ico**：含 16 / 32 / 48 三帧；
- **apple-touch-icon.png**（180×180）：iOS 主屏 / Safari 分享图标；
- **icons/icon-16/32/48/64/128/192/256/512.png**：全尺寸 PNG 系列，覆盖浏览器标签页、桌面快捷方式、PWA 清单、Android 各密度。
- **manifest.webmanifest**：PWA 清单（名称「云屿」、主题色 #2F8CFF、standalone 展示、192/512 图标）。
- 所有尺寸由源稿通过 Pillow 高质量 LANCZOS 缩放生成，视觉一致；生产模式已验证 9 种 PNG 尺寸、ICO 三帧均正确返回。

### 接入
`frontend/index.html` 已更新 `<link>` 声明：`favicon.ico`（首选）、`apple-touch-icon.png`、`manifest.webmanifest`；既有 `theme-color #2F8CFF` 保持不变。

## v1.2.0（2026-09-26）· 五项新功能

> 本轮新增「软件下载/评分体系、收藏专题生成、帖子图片上传、管理后台数据图表、深色模式」，同时修复深色模式两处既有缺陷。

### 1. 软件下载量与评分体系
- **数据模型**：新增 `software_downloads`（下载记录表）与 `software_ratings`（评分表，`UNIQUE(software_id, user_id)` 每用户一款软件一条）。
- **后端**：
  - 下载量统计防刷：登录用户同一软件历史上仅首次累计 +1；匿名按 IP 24 小时去重；每次下载都写入记录表，支持趋势分析。
  - `POST /api/software/:id/rating`：1–5 星评分 + 可选评论，重复评分即改分（自动保留原评论），并实时重算软件的 `rating / rating_count`。
  - `GET /api/software/:id/ratings`：评价列表 + 我的评分；软件详情接口同步返回 `my_rating`。
- **前端**（软件详情页）：
  - 展示下载量、⭐ 平均分（一位小数）与评分人数，点击评分人数可查看全部评价；
  - 「评分」按钮弹出底部评分面板：5 星点选 + 评论输入 + 提交；已评用户显示"我已评 X 星 / 修改评价"。

### 2. 收藏专题生成
- **数据模型**：新增 `user_collections`（用户专题表：名称/简介/封面色/软件 JSON 列表/公开状态）。
- **后端**（`/api/users` 下）：
  - `GET/POST /api/users/me/collections`：我的专题列表 / 创建；
  - `PUT/DELETE /api/users/me/collections/:id`：编辑（含公开↔私密切换）/ 删除（软删）；
  - `GET /api/users/collections/:id`：专题详情（公开可匿名访问、私密仅本人），返回作者昵称与完整软件列表；
  - `GET /api/users/collections`：公开专题广场（支持按 userId 过滤）。
- **前端**：
  - 「我的收藏」页新增「📚 我的专题」「＋ 生成专题」入口；生成模式下勾选收藏的软件，一键生成专题；
  - 新增「我的专题」列表页（`/my/collections`）、专题创建/编辑页（`/collection/create`、`/collection/:id/edit`）、用户专题详情页（`/collection/:id`，作者可编辑/设公开/删除）；
  - 原「精品合集」详情迁移到 `/s-collection/:id`，与用户专题互不干扰。

### 3. 帖子图片上传
- **后端**：新增 `POST /api/upload` 图片上传接口与 `upload_files` 登记表，`/uploads` 静态托管；
  - MIME 白名单（jpeg/png/gif/webp）、单张 ≤3MB、`express.json` 上限 5MB；
  - **魔数（文件头）二次校验**：伪造扩展名的 SVG 等一律拦截，杜绝 XSS 载体；
  - 随机文件名 + 7 天缓存头。
- **前端**：发帖/编辑帖子页「添加图片」由"输入 URL"改为**本地文件选择**（FileReader → 后端上传 → 返回 `/uploads/…`），支持 9 张、可删除。

### 4. 管理后台数据图表
- **数据看板**（`/admin`）扩展为 6 张统计卡：新增「累计下载」「用户专题」；
- 新增三块数据可视化（纯 CSS/SVG，无外部图表库）：
  - **下载 / 评分趋势**：近 7 天双色柱状图；
  - **评分分布**：5→1 星人数占比条形图 + 平均分；
  - **活跃软件 TOP8**：按下载量排序的软件榜单（下载/评分/收藏）。
- 新增「用户专题」管理页（`/admin/u-collections`，侧边栏"📚 用户专题"）：全量列表（作者、软件数、可见性、状态）+ **下架**违规专题，下架后用户端不可见。

### 5. 深色模式（修复 + 全页面适配）
- 修复设置页深色模式切换失效（`setTheme` → `setMode` 方法名不一致）；
- 修复我的收藏页引用未定义的 `--warn` CSS 变量（改为 `--warning-soft / --warning`）；
- 排查并保留合理的品牌色硬编码（启动图、登录装饰等），确保亮/暗两套主题下 55+ 页面全部正常；偏好持久化沿用原有主题状态管理。

### 技术栈（未变）
Vue3 + Vite + Pinia + 原生 fetch（无 UI 框架），Express + better-sqlite3 + JWT + bcryptjs + nodemailer。

### 数据与兼容
- 所有新表均 `CREATE TABLE IF NOT EXISTS`，已有库启动即自动增量建表，无需手动迁移；
- 历史冒烟测试 **42 项断言全部通过**；新增功能专项验证 **22 项全部通过**；前端生产构建通过；生产模式单进程托管验证通过。