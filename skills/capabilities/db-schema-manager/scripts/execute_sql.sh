#!/bin/bash
# ============================================================
# 在本地 MySQL 容器中执行 SQL，执行后增量更新 init 脚本
# 用法: bash scripts/execute_sql.sh <sql_file_or_statement> [agent_dir]
# 示例:
#   bash scripts/execute_sql.sh "ALTER TABLE xxx ADD ..." wms-agent
#   bash scripts/execute_sql.sh "CREATE TABLE yyy (...)" wms-agent
#   bash scripts/execute_sql.sh path/to/file.sql wms-agent
# ============================================================

set -e

CONTAINER="wms-mysql"
DB_USER="root"
DB_PASS="root123"
DB_NAME="xp_wms"

INPUT="$1"
AGENT_DIR="${2:-wms-agent}"
SCRIPT_DIR="$(dirname "$0")"
INIT_FILE="${AGENT_DIR}/local-dev/init-sql/WMS_INIT.sql"

if [ -z "${INPUT}" ]; then
  echo "用法: bash scripts/execute_sql.sh <sql_file_or_statement> [agent_dir]"
  exit 1
fi

# 检查 Docker 容器是否运行
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER}$"; then
  echo "错误: MySQL 容器 ${CONTAINER} 未运行"
  echo "请先启动: cd ${AGENT_DIR} && bash local-dev.sh infra"
  exit 1
fi

# 获取 SQL 内容
if [ -f "${INPUT}" ]; then
  SQL_CONTENT=$(cat "${INPUT}")
  echo "执行 SQL 文件: ${INPUT}"
else
  SQL_CONTENT="${INPUT}"
  echo "执行 SQL 语句..."
fi

# 执行 SQL（设置 UTF-8 字符集）
echo "SET NAMES utf8mb4; ${SQL_CONTENT}" | docker exec -i "${CONTAINER}" mysql -u"${DB_USER}" -p"${DB_PASS}" "${DB_NAME}" 2>/dev/null
echo "执行完成"

# ============================================================
# 增量更新 init 脚本：从 SQL 中提取表名，只刷新受影响的表
# ============================================================

# 提取涉及的表名（CREATE TABLE / ALTER TABLE）
TABLES=$(echo "${SQL_CONTENT}" | grep -ioE '(CREATE|ALTER)\s+TABLE\s+`?[a-zA-Z_][a-zA-Z0-9_]*`?' | grep -ioE '`[a-zA-Z_][a-zA-Z0-9_]*`|[a-zA-Z_][a-zA-Z0-9_]*$' | tr -d '`' | sort -u)

if [ -z "${TABLES}" ]; then
  echo "非 DDL 语句，无需更新 init 脚本"
  exit 0
fi

if [ ! -f "${INIT_FILE}" ]; then
  echo "警告: ${INIT_FILE} 不存在，跳过增量更新。请先运行 export_schema.sh 生成全量基线"
  exit 0
fi

echo "增量更新 init 脚本（涉及表: ${TABLES}）..."
python3 "${SCRIPT_DIR}/sync_init_sql.py" ${TABLES} --init-file "${INIT_FILE}"
