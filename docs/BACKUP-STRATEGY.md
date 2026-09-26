# 云屿 · 数据库备份策略

## 概述

云屿使用 SQLite 单文件数据库（`backend/data/yunyu.db`），生产环境必须配置定期备份以防止数据丢失。

## 自动备份脚本

创建 `/opt/yunyu-app/scripts/backup.sh`：

```bash
#!/usr/bin/env bash
# 云屿 SQLite 数据库每日备份
set -euo pipefail

DB_DIR="/opt/yunyu-app/backend/data"
BACKUP_DIR="/opt/yunyu-app/backups"
DB_NAME="yunyu.db"
RETENTION_DAYS=30

# 确保备份目录存在
mkdir -p "${BACKUP_DIR}"

# 生成带时间戳的备份文件名
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}.${TIMESTAMP}.bak"

# 使用 SQLite 在线备份（不锁定数据库）
sqlite3 "${DB_DIR}/${DB_NAME}" ".backup '${BACKUP_FILE}'"

# 压缩备份
gzip -f "${BACKUP_FILE}"

# 清理超过保留期的旧备份
find "${BACKUP_DIR}" -name "${DB_NAME}.*.bak.gz" -mtime +${RETENTION_DAYS} -delete

echo "[$(date)] 备份完成: ${BACKUP_FILE}.gz"
```

## 安装 Crontab

```bash
# 编辑 crontab
sudo crontab -e

# 添加以下行（每天凌晨 3 点执行备份）
0 3 * * * /opt/yunyu-app/scripts/backup.sh >> /var/log/yunyu-backup.log 2>&1

# 确保日志目录存在
sudo mkdir -p /var/log
sudo touch /var/log/yunyu-backup.log
```

## 手动备份

```bash
# 快速备份（复制文件，需要停止服务或确保无写入）
cp /opt/yunyu-app/backend/data/yunyu.db /opt/yunyu-app/backups/yunyu.db.$(date +%F).bak

# 在线备份（推荐，不中断服务）
sqlite3 /opt/yunyu-app/backend/data/yunyu.db ".backup '/opt/yunyu-app/backups/yunyu.db.$(date +%F).bak'"
```

## 恢复备份

```bash
# 1. 停止服务
sudo systemctl stop yunyu

# 2. 备份当前数据库（以防万一）
cp /opt/yunyu-app/backend/data/yunyu.db /opt/yunyu-app/backups/yunyu.db.before-restore.$(date +%F).bak

# 3. 恢复指定日期的备份
cp /opt/yunyu-app/backups/yunyu.db.2026-09-26.bak /opt/yunyu-app/backend/data/yunyu.db

# 4. 启动服务
sudo systemctl start yunyu
```

## 备份验证

```bash
# 检查备份文件完整性
sqlite3 /path/to/backup.bak "PRAGMA integrity_check;"

# 检查备份文件大小（应与原库相近）
ls -lh /opt/yunyu-app/backups/
```

## 监控建议

- 备份脚本输出到 `/var/log/yunyu-backup.log`，可配置 logrotate
- 建议监控备份目录磁盘使用率（超过 80% 时告警）
- 每月至少一次从备份恢复测试环境，验证备份可用性

## 灾难恢复时间（RTO/RPO）

| 指标 | 目标值 | 说明 |
|------|--------|------|
| RPO | < 24 小时 | 每日备份，最坏丢失 1 天数据 |
| RTO | < 5 分钟 | 停止服务 → 恢复备份 → 启动服务 |

> 如需更小的 RPO（如 1 小时），可将 crontab 改为每小时执行，或配置 WAL 归档到远程存储。
