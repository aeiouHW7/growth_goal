#!/bin/bash
# ============================================================
# 从本地 MySQL 容器导出全量 DDL
# 用法: bash scripts/export_schema.sh [agent_dir]
# 示例: bash skills/common/db-schema-manager/scripts/export_schema.sh wms-agent
# ============================================================

set -e

AGENT_DIR="${1:-wms-agent}"
CONTAINER="wms-mysql"
DB_USER="root"
DB_PASS="root123"
DB_NAME="xp_wms"
OUTPUT_DIR="${AGENT_DIR}/local-dev/init-sql"
OUTPUT_FILE="${OUTPUT_DIR}/WMS_INIT.sql"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# 检查 Docker 容器是否运行
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER}$"; then
  echo "错误: MySQL 容器 ${CONTAINER} 未运行"
  echo "请先启动: cd ${AGENT_DIR} && bash local-dev.sh infra"
  exit 1
fi

# 检查输出目录
if [ ! -d "${OUTPUT_DIR}" ]; then
  echo "错误: 目录 ${OUTPUT_DIR} 不存在"
  exit 1
fi

echo "正在从 ${CONTAINER} 导出 ${DB_NAME} 全量 DDL..."

# 导出 DDL（不含数据、不含注释噪音）
docker exec "${CONTAINER}" mysqldump \
  -u"${DB_USER}" -p"${DB_PASS}" \
  --no-data \
  --skip-comments \
  --skip-add-drop-table \
  --skip-lock-tables \
  --default-character-set=utf8mb4 \
  "${DB_NAME}" 2>/dev/null \
  | sed 's/ AUTO_INCREMENT=[0-9]*//' \
  | sed '/^\/\*!40/d' \
  | sed '/^\/\*!50/d' \
  | sed '/^--/d' \
  | sed '/^$/N;/^\n$/d' \
  > "${OUTPUT_FILE}.tmp"

# 添加文件头
cat > "${OUTPUT_FILE}" << EOF
-- ============================================================
-- WMS 数据库初始化脚本（全量 DDL）
-- 数据库：${DB_NAME}
-- 导出时间：${TIMESTAMP}
-- 来源：${CONTAINER} 容器自动导出
-- ============================================================

USE \`${DB_NAME}\`;

EOF

# 在每个 CREATE TABLE 前加表名注释
awk '
/^CREATE TABLE/ {
  match($0, /`([^`]+)`/, arr)
  if (arr[1] != "") {
    print ""
    print "-- " arr[1]
  }
}
{ print }
' "${OUTPUT_FILE}.tmp" >> "${OUTPUT_FILE}"

rm -f "${OUTPUT_FILE}.tmp"

# 统计表数量
TABLE_COUNT=$(grep -c '^CREATE TABLE' "${OUTPUT_FILE}")

echo "导出完成: ${OUTPUT_FILE}"
echo "表数量: ${TABLE_COUNT}"
echo "导出时间: ${TIMESTAMP}"
