# 云屿 · 云服务器部署指南

## 系统要求

- Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- Node.js >= 18 (推荐 20 LTS)
- npm >= 9
- Nginx (可选，用于 HTTPS 和域名)
- Git
- SQLite3

## 快速部署（一键脚本）

### 1. 服务器环境准备

```bash
# SSH 登录服务器
ssh root@your-server-ip

# 更新系统并安装依赖
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git sqlite3 nginx

# 安装 Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 验证安装
node --version  # 应 >= v20.x
npm --version   # 应 >= 10.x
```

### 2. 上传代码到服务器

#### 方案 A：从 GitHub 拉取（推荐）

```bash
cd /opt
git clone https://github.com/your-username/yunyu-app.git
cd yunyu-app
```

#### 方案 B：上传 ZIP 包

```bash
# 本地打包后上传
# 在本地执行：zip -r yunyu-app.zip yunyu-app -x "*/node_modules/*" -x "*/.git/*" -x "*/data/*"

# 上传到服务器
scp yunyu-app.zip root@your-server-ip:/opt/
ssh root@your-server-ip "cd /opt && unzip yunyu-app.zip && rm yunyu-app.zip"
```

### 3. 运行一键部署脚本

```bash
cd /opt/yunyu-app
bash deploy/deploy.sh /opt/yunyu-app
```

脚本会自动完成：
- 安装后端依赖
- 构建前端
- 配置 systemd 服务（开机自启、崩溃重启）
- 启动服务

### 4. 配置生产环境变量

```bash
cd /opt/yunyu-app/backend
cp .env.production.example .env
nano .env
```

**必须修改的安全项：**

```env
# 超级管理员密码（必须修改！）
SUPER_ADMIN_PASSWORD=your-very-secure-password

# JWT 密钥（必须修改！使用 openssl rand -base64 32 生成）
JWT_SECRET=your-random-jwt-secret-key-here

# SMTP 配置（真实生产环境需要）
SMTP_HOST=smtp.example.com
SMTP_PORT=465
SMTP_USER=your-email@example.com
SMTP_PASS=your-email-password
```

重启服务使配置生效：

```bash
sudo systemctl restart yunyu
```

### 5. 配置 Nginx（域名 + HTTPS）

```bash
# 复制 Nginx 配置
sudo cp /opt/yunyu-app/deploy/nginx.conf /etc/nginx/sites-available/yunyu

# 修改域名
sudo sed -i 's/yunyu.example.com/your-domain.com/g' /etc/nginx/sites-available/yunyu

# 启用配置
sudo ln -sf /etc/nginx/sites-available/yunyu /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 安装 SSL 证书（使用 Certbot）
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 6. 配置防火墙

```bash
# 开放 HTTP/HTTPS
sudo ufw allow 'Nginx Full'

# 开放 SSH（如果未开放）
sudo ufw allow OpenSSH

# 启用防火墙
sudo ufw enable
```

## 运维命令

```bash
# 查看服务状态
sudo systemctl status yunyu

# 查看实时日志
sudo journalctl -fu yunyu

# 重启服务
sudo systemctl restart yunyu

# 查看最近错误
sudo journalctl -u yunyu --since "1 hour ago" | grep -i error

# 数据库备份（手动）
sudo -u www-data sqlite3 /opt/yunyu-app/backend/data/yunyu.db ".backup '/opt/yunyu-app/backups/yunyu.db.$(date +%F).bak'"
```

## 自动备份（已集成在部署脚本中）

备份脚本位于 `/opt/yunyu-app/scripts/backup.sh`，每天凌晨 3 点自动执行：

- 使用 SQLite 在线备份（不锁定数据库）
- 自动压缩为 `.gz`
- 保留最近 30 天备份
- 日志输出到 `/var/log/yunyu-backup.log`

## 更新部署

```bash
cd /opt/yunyu-app

# 拉取最新代码
git pull origin main

# 重新部署
bash deploy/deploy.sh /opt/yunyu-app

# 验证
curl -s http://localhost:3000/api/home | head -c 100
```

## 故障排查

### 服务无法启动

```bash
# 检查日志
sudo journalctl -u yunyu --no-pager -n 50

# 检查端口占用
sudo lsof -i :3000

# 检查数据库权限
ls -la /opt/yunyu-app/backend/data/
sudo chown -R www-data:www-data /opt/yunyu-app/backend/data
```

### 前端页面空白

```bash
# 检查前端构建
cat /opt/yunyu-app/frontend/dist/index.html | head -5

# 检查静态文件权限
ls -la /opt/yunyu-app/frontend/dist/

# 重新构建
npm --prefix /opt/yunyu-app/frontend run build
```

### 数据库损坏

```bash
# 检查完整性
sqlite3 /opt/yunyu-app/backend/data/yunyu.db "PRAGMA integrity_check;"

# 从备份恢复
sudo systemctl stop yunyu
cp /opt/yunyu-app/backups/yunyu.db.2026-09-26.bak /opt/yunyu-app/backend/data/yunyu.db
sudo chown www-data:www-data /opt/yunyu-app/backend/data/yunyu.db
sudo systemctl start yunyu
```

## 性能优化

### 启用 Gzip 压缩

Nginx 配置已包含 gzip 设置，无需额外配置。

### 静态资源缓存

Nginx 配置已设置：
- `assets/` 目录缓存 1 年（因为文件名包含内容哈希）
- 图标文件缓存 30 天
- `index.html` 不缓存（确保用户获取最新版本）

### 数据库优化

- 已启用 WAL 模式（Write-Ahead Logging）
- 关键表已创建索引（user_events、search_history 等）
- 建议 DAU > 1 万时迁移到 PostgreSQL（详见 docs/SQLITE-CONCURRENCY.md）

## 安全加固

### 必做项

1. **修改默认密码**：`SUPER_ADMIN_PASSWORD` 必须更改
2. **修改 JWT 密钥**：`JWT_SECRET` 必须重新生成
3. **配置 SMTP**：生产环境需要真实邮箱服务
4. **启用 HTTPS**：使用 Certbot 自动配置 SSL
5. **防火墙**：仅开放 80、443、22 端口

### 可选项

6. **Fail2ban**：防止暴力破解登录
7. **日志监控**：配置 logrotate 防止日志文件过大
8. **定期安全更新**：`sudo apt update && sudo apt upgrade`

## 域名配置示例

假设你的域名是 `yunyu.example.com`：

```bash
# DNS 添加 A 记录
# yunyu.example.com → 你的服务器 IP

# 修改 Nginx 配置中的 server_name
sudo sed -i 's/server_name .*/server_name yunyu.example.com;/' /etc/nginx/sites-available/yunyu

# 申请 SSL 证书
sudo certbot --nginx -d yunyu.example.com
```

## 联系方式

部署过程中遇到问题？
- 检查日志：`sudo journalctl -fu yunyu`
- 查看后端状态：`curl -s http://localhost:3000/api/home`
- 查看冒烟测试结果：`cd /opt/yunyu-app/backend && bash scripts/smoke.sh`
