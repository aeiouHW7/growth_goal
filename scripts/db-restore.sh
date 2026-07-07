#!/bin/bash
# growth-miniprogram 数据库恢复脚本 (SQLite 版)
# 用法: bash scripts/db-restore.sh [备份文件名]
# 如果不指定文件名，则列出所有可用备份
#
# 原理：将备份的 .db 文件复制回 backend/dev.db
# 注意：执行前请确保后端服务已停止

set -euo pipefail

BACKUP_DIR="$(cd "$(dirname "$0")/../backend/backups" && pwd)"
DB_FILE="$(cd "$(dirname "$0")/../backend" && pwd)/dev.db"

# 如果没有指定文件，列出备份
if [ $# -eq 0 ]; then
  echo "可用备份:"
  ls -lh "$BACKUP_DIR"/growth-*.db 2>/dev/null | awk '{print "  " $9 "  (" $5 ")"}'
  echo ""
  echo "用法: bash scripts/db-restore.sh <备份文件名>"
  echo "也可使用 Prisma JSON 备份恢复: npx tsx backend/scripts/restore.ts"
  exit 0
fi

FILENAME="$1"
FILEPATH="${BACKUP_DIR}/${FILENAME}"

if [ ! -f "$FILEPATH" ]; then
  echo "❌ 备份文件不存在: ${FILEPATH}"
  exit 1
fi

echo "⚠️  即将用备份覆盖数据库: ${FILENAME}"
echo -n "确认? 输入 YES 继续: "
read -r CONFIRM
if [ "$CONFIRM" != "YES" ]; then
  echo "已取消"
  exit 0
fi

echo "🔄 恢复中..."
# 确保后端未占用数据库
cp "$FILEPATH" "$DB_FILE"
echo "✅ 恢复完成: ${FILENAME} → backend/dev.db"
