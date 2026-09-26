# 云屿 YunYu · 软件聚合社区 App

> 一个完整的「软件聚合社区」全栈应用：可浏览/收藏/下载开源软件，可发帖讨论、签到升级、做任务攒 EXP，管理后台支持软件/帖子/用户/签到/任务/角色权限全量运营。

## 技术栈

| 端 | 技术 |
| --- | --- |
| 后端 | Node.js + Express + better-sqlite3 + JWT + bcryptjs + nodemailer |
| 前端 | Vue 3 + Vite + Pinia + Vue Router（原生 fetch 封装，无 UI 框架依赖） |
| 数据库 | SQLite（单文件，开箱即用，首启自动建表、自动种子数据） |

## 目录结构

```
yunyu-app/
├── package.json          # 根工作流（setup / dev / start / build）
├── backend/              # Node.js + Express 后端
│   ├── src/
│   │   ├── server.js     # 入口
│   │   ├── config/       # 配置中心（端口/SMTP/JWT/超级管理员，全部来自环境变量）
│   │   ├── db/           # SQLite 建表 + 种子数据
│   │   ├── routes/       # 业务路由（auth/users/posts/software/collections/chat/admin…）
│   │   ├── services/     # 业务逻辑（签到/等级/成长任务/邮箱验证码…）
│   │   ├── middleware/   # 鉴权与权限
│   │   └── utils/        # 响应/加密/Token/日期工具
│   └── data/             # 运行时生成 yunyu.db（不入库）
└── frontend/             # Vue 3 单页应用
    └── src/
        ├── views/        # 55+ 页面（5 Tab + 社区/软件/账号 + 18 管理后台页）
        ├── stores/       # Pinia（用户/会话）
        ├── api/          # fetch 封装 + 全部接口
        └── router/       # 路由与守卫
```

## 快速开始

环境要求：**Node.js ≥ 18**（推荐 20+）、npm。

```bash
# 1. 进入工程根目录
cd yunyu-app

# 2. 一键安装前后端依赖
npm run setup          # 等价于 npm --prefix backend install && npm --prefix frontend install

# 3. 一键启动前后端（开发模式，后端 3000 + 前端 5173 带 /api 代理）
npm run dev

# 4. 浏览器访问
#    前端  http://localhost:5173
#    后端  http://localhost:3000/api/home
```

生产构建：

```bash
npm run build          # 前端产物输出到 frontend/dist，随后启动后端
# 后端单独启动：npm --prefix backend run start
```

## 默认账号

| 角色 | 邮箱 | 密码 | 说明 |
| --- | --- | --- | --- |
| 云屿岛主（超级管理员） | `admin@yunyu.app` | `Yunyu@2026` | 首次登录强制改密，可进管理后台 |
| 普通用户 | 注册即可 | — | 注册即送 20 EXP |

> 超级管理员邮箱/密码可用环境变量覆盖：`SUPER_ADMIN_EMAIL`、`SUPER_ADMIN_PASSWORD`（生产环境必须覆盖默认密码）。

## 开发模式与邮箱验证码

未配置 SMTP 时自动进入**开发模式**：注册/找回密码所需的邮箱验证码会**打印在后端控制台日志**（形如 `验证码 123456 -> user@example.com`），可直接使用，方便本地演示完整邮箱流程。

> 生产模式（`NODE_ENV=production`）下未配置 SMTP 时，发码请求会被**直接拒绝**（返回"邮件服务未配置"），不会泄露验证码；请务必在部署时配置真实 SMTP。

生产环境配置 SMTP（环境变量）：

```bash
SMTP_HOST=smtp.example.com
SMTP_PORT=465            # 或 587，配合 SMTP_SECURE=false
SMTP_SECURE=true
SMTP_EMAIL=no-reply@example.com
SMTP_PASS=你的授权码
SMTP_FROM=云屿 <no-reply@example.com>
```

其他可用环境变量：`PORT`（后端端口，默认 3000）、`JWT_SECRET`（生产必须更换）、`JWT_EXPIRES_IN`（默认 7d）。

## 生产部署（一键脚本）

后端已原生托管前端构建产物 `frontend/dist`，生产环境**只需运行后端单个 Node 进程**即可对外提供完整服务。

```bash
# 1. 准备环境变量（复制模板并修改，强制替换 SUPER_ADMIN_PASSWORD 与 JWT_SECRET）
cp deploy/.env.production.example backend/.env
nano backend/.env

# 2. 一键部署（自动安装依赖、构建前端、注册 systemd 服务并启动）
bash deploy/deploy.sh /opt/yunyu-app
```

部署完成后访问 `http://<服务器IP>:3000`。配套文件：

| 文件 | 用途 |
| --- | --- |
| `deploy/.env.production.example` | 生产环境变量模板（带安全注解） |
| `deploy/deploy.sh` | Ubuntu/Debian + systemd 一键部署脚本 |
| `deploy/yunyu.service` | systemd 服务单元（开机自启、崩溃自动重启、基础加固） |
| `deploy/nginx.conf` | 可选 Nginx 反代 + HTTPS 示例（需域名时使用） |

运维命令：`sudo journalctl -fu yunyu`（日志）、`sudo systemctl restart yunyu`（重启）。

## 冒烟测试

```bash
# 后端需已启动（默认 http://127.0.0.1:3000）
bash backend/scripts/smoke.sh            # 47 项全链路断言：注册/登录/C端/社区/签到/后台/事件埋点/权限
bash backend/scripts/smoke.sh http://127.0.0.1:3100   # 指定地址
```

## 功能清单

**C 端（移动优先 App 风格）**

- 首页：轮播 Banner、推荐/热门软件、最新公告、快捷入口
- 软件：分类浏览、聚合列表、专题合集、搜索、详情、版本历史、收藏、下载跳转
- 社区：话题广场、帖子发布/点赞/评论/收藏/举报、精华置顶
- 用户：注册/登录/找回密码、资料编辑、等级（EXP 成长体系）、每日签到（连续奖励）、每日任务、通知、私信会话
- 我的：我的帖子/评论/收藏、关注列表、收藏合集、系统设置、关于

**管理后台（`/admin`，桌面侧边栏 + 移动端抽屉）**

- 数据看板、用户管理（封禁/改密/角色/EXP）、帖子与评论管理、标签/专题/软件管理与版本维护、举报处理、公告管理、签到奖励与排行、任务管理、管理员与 RBAC 角色权限、邮箱配置说明、系统设置（KV 开关）、操作日志

## 安全说明

- 密码 bcrypt 加密存储；JWT 7 天有效
- 管理端 RBAC 权限校验，普通用户越权访问一律拒绝
- 邮箱验证码：5 分钟有效、60 秒重发、5 次错误上限、每小时 8 封防滥用
- 关键操作（登录/发布/签到/后台操作）记入操作日志

## 数据初始化

首次启动自动创建 SQLite 数据库并写入种子数据（管理员、角色权限、软件分类、示例软件、话题、公告等），无需手工初始化。如需重置：删除 `backend/data/yunyu.db` 后重启服务即可（会重新生成）。