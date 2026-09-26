#!/usr/bin/env bash
# ============================================================
# 云屿 YunYu · 一键部署脚本（Ubuntu/Debian + systemd）
# 用法：
#   bash deploy/deploy.sh /opt/yunyu-app
# 说明：
#   - 以 www-data 运行 systemd 服务，后端自动托管前端构建产物
#   - 生产环境变量模板见 deploy/.env.production.example
# ============================================================
set -euo pipefail

APP_DIR="${1:-/opt/yunyu-app}"
SRC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "==> 1/5 校验环境"
command -v node >/dev/null || { echo "缺少 nodejs，请先安装 Node.js >= 18"; exit 1; }
command -v npm  >/dev/null || { echo "缺少 npm"; exit 1; }
node -e "if(parseInt(process.versions.node.split('.')[0])<18){console.error('Node.js 版本过低，需要 >=18');process.exit(1)}"

echo "==> 2/5 拷贝源码到 ${APP_DIR}"
mkdir -p "${APP_DIR}"
rsync -a --delete \
  --exclude node_modules --exclude data \
  --exclude .git --exclude '*.db*' \
  "${SRC_DIR}/backend/" "${APP_DIR}/backend/"
rsync -a --delete \
  --exclude node_modules --exclude dist \
  "${SRC_DIR}/frontend/" "${APP_DIR}/frontend/"

echo "==> 3/5 安装依赖并构建前端"
npm --prefix "${APP_DIR}/backend" install --omit=dev
npm --prefix "${APP_DIR}/frontend" install
npm --prefix "${APP_DIR}/frontend" run build

if [ ! -f "${APP_DIR}/backend/.env" ]; then
  echo "==> 4/5 提示：尚未配置生产环境文件"
  echo "    请先创建 ${APP_DIR}/backend/.env（参照 deploy/.env.production.example），"
  echo "    并【强制修改】SUPER_ADMIN_PASSWORD 与 JWT_SECRET，再继续。"
  exit 1
fi

echo "==> 4/5 安装 systemd 服务"
sudo rsync -a "${SRC_DIR}/deploy/yunyu.service" /etc/systemd/system/yunyu.service
sudo sed -i "s|/opt/yunyu-app|${APP_DIR}|g" /etc/systemd/system/yunyu.service
sudo systemctl daemon-reload

echo "==> 5/5 启动服务"
sudo systemctl enable --now yunyu
sleep 2
sudo systemctl status yunyu --no-pager --lines=5

echo "==> 6/6 安装数据库备份脚本"
BACKUP_SCRIPT="${APP_DIR}/scripts/backup.sh"
mkdir -p "${APP_DIR}/scripts" "${APP_DIR}/backups"
cat > "${BACKUP_SCRIPT}" << 'EOF'
#!/usr/bin/env bash
# 云屿 SQLite 数据库每日备份
set -euo pipefail
DB_DIR="/opt/yunyu-app/backend/data"
BACKUP_DIR="/opt/yunyu-app/backups"
DB_NAME="yunyu.db"
RETENTION_DAYS=30
mkdir -p "${BACKUP_DIR}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}.${TIMESTAMP}.bak"
sqlite3 "${DB_DIR}/${DB_NAME}" ".backup '${BACKUP_FILE}'"
gzip -f "${BACKUP_FILE}"
find "${BACKUP_DIR}" -name "${DB_NAME}.*.bak.gz" -mtime +${RETENTION_DAYS} -delete
echo "[$(date)] 备份完成: ${BACKUP_FILE}.gz"
EOF
chmod +x "${BACKUP_SCRIPT}"
# 安装 crontab（如果不存在）
(crontab -l 2>/dev/null | grep -q "yunyu-backup" || (crontab -l 2>/dev/null; echo "0 3 * * * ${BACKUP_SCRIPT} >> /var/log/yunyu-backup.log 2>&1")) | crontab -
mkdir -p /var/log

echo
echo "部署完成！访问:  http://<服务器IP>:3000  （前端已被后端托管）"
echo "管理员登录: ${SUPER_ADMIN_EMAIL:-admin@yunyu.app}（使用你在 .env 中设置的密码）"
echo "查看日志:   sudo journalctl -fu yunyu"
echo "如使用域名，请在 Nginx 中把 / 反向代理到 127.0.0.1:3000（示例见 deploy/nginx.conf）"
echo "数据库备份: 每天凌晨 3 点自动执行，保留 30 天"