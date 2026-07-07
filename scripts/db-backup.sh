#!/bin/bash
# growth-miniprogram 数据库备份脚本 (SQLite 版)
# 用法: bash scripts/db-backup.sh [备注]
# 备份文件: backend/backups/growth-{日期}-{备注}.db
#
# 原理：直接拷贝 SQLite 数据库文件
# 恢复时复制回去即可：cp backend/backups/growth-xxx.db backend/dev.db

set -euo pipefail

BACKUP_DIR="$(cd "$(dirname "$0")/../backend/backups" && pwd)"
DB_FILE="$(cd "$(dirname "$0")/../backend/prisma" && pwd)/dev.db"
mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
NOTE="${1:-manual}"
FILENAME="growth-${TIMESTAMP}-${NOTE}.db"
FILEPATH="${BACKUP_DIR}/${FILENAME}"

echo "backup:start|${FILENAME}"

if [ ! -f "$DB_FILE" ]; then
  echo "backup:skip|no database file found at ${DB_FILE}"
  exit 0
fi

cp "$DB_FILE" "$FILEPATH"

# 验证
if [ -s "$FILEPATH" ]; then
  SIZE=$(du -h "$FILEPATH" | cut -f1)
  echo "backup:done|${FILENAME}|${SIZE}"
  # 保留最近 30 个备份，清理旧的
  ls -t "$BACKUP_DIR"/growth-*.db 2>/dev/null | tail -n +31 | xargs -r rm 2>/dev/null || true
else
  echo "backup:fail|empty file"
  exit 1
fi
