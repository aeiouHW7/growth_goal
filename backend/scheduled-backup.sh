#!/bin/bash
# 定时备份脚本 — 供 crontab/launchd 调用
# 建议每天运行一次：0 22 * * * bash /path/to/scheduled-backup.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DB_FILE="$ROOT/prisma/dev.db"
BACKUP_DIR="$ROOT/backups"
mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="growth-${TIMESTAMP}-auto.db"

if [ ! -f "$DB_FILE" ]; then
  echo "[$(date)] SKIP: no database at $DB_FILE" >> "$BACKUP_DIR/backup.log"
  exit 0
fi

cp "$DB_FILE" "$BACKUP_DIR/$FILENAME"
SIZE=$(du -h "$BACKUP_DIR/$FILENAME" | cut -f1)
echo "[$(date)] BACKUP: $FILENAME ($SIZE)" >> "$BACKUP_DIR/backup.log"

# 保留最近 30 个自动备份
ls -t "$BACKUP_DIR"/growth-*-auto.db 2>/dev/null | tail -n +31 | xargs -r rm
