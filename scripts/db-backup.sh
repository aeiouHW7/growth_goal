#!/bin/bash
# growth-miniprogram 数据库备份脚本
# 用法: bash scripts/db-backup.sh [备注]
# 备份文件: backend/backups/growth-{日期}-{备注}.sql

set -euo pipefail

BACKUP_DIR="$(cd "$(dirname "$0")/../backend/backups" && pwd)"
mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
NOTE="${1:-manual}"
FILENAME="growth-${TIMESTAMP}-${NOTE}.sql"
FILEPATH="${BACKUP_DIR}/${FILENAME}"

echo "backup:start|${FILENAME}"

# stdout 管道模式 (兼容 Windows Docker 路径映射)
docker exec growth-miniprogram-db pg_dump \
  -U growthuser \
  -d growth-miniprogram \
  --no-owner \
  --no-acl \
  --format=plain \
  -f - \
  2>/dev/null \
  > "$FILEPATH"

# 验证
if [ -s "$FILEPATH" ]; then
  LINE_COUNT=$(wc -l < "$FILEPATH")
  echo "backup:done|${FILENAME}|${LINE_COUNT}"
  # 保留最近 30 个备份，清理旧的
  ls -t "$BACKUP_DIR"/growth-*.sql 2>/dev/null | tail -n +31 | xargs -r rm 2>/dev/null || true
else
  echo "backup:fail|empty file"
  exit 1
fi
