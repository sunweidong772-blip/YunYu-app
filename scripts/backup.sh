#!/usr/bin/env bash
set -euo pipefail
DB_DIR="/opt/yunyu-app/backend/data"
BACKUP_DIR="/opt/yunyu-app/backups"
DB_NAME="yunyu.db"
RETENTION_DAYS=30
mkdir -p ""
TIMESTAMP=20260927_000659
BACKUP_FILE="/..bak"
sqlite3 "/" ".backup ''"
gzip -f ""
find "" -name ".*.bak.gz" -mtime + -delete
echo "[Sun Sep 27 00:06:59 CST 2026] 备份完成: .gz"
