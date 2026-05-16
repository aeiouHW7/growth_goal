#!/bin/bash

# TODO App - 一键启动脚本（配置驱动）
# 从 domain.yaml 读取服务配置，按依赖拓扑启动

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
DOMAIN_YAML="$SCRIPT_DIR/domain.yaml"
PID_DIR="$SCRIPT_DIR/.pids"
LOG_DIR="$SCRIPT_DIR/.logs"

mkdir -p "$PID_DIR" "$LOG_DIR"

# --- YAML 轻量解析 ---
parse_port() {
  local service="$1"
  grep -A5 "^  ${service}:" "$DOMAIN_YAML" 2>/dev/null | grep "port:" | head -1 | sed 's/.*port:\s*//' | tr -d ' '
}

parse_health_path() {
  grep -A3 "health_check:" "$DOMAIN_YAML" 2>/dev/null | grep "backend:" | head -1 | sed 's/.*backend:\s*//' | tr -d ' "'
}

parse_health_timeout() {
  grep -A3 "health_check:" "$DOMAIN_YAML" 2>/dev/null | grep "timeout:" | head -1 | sed 's/.*timeout:\s*//' | tr -d ' '
}

parse_db_container() {
  grep "container_name:" "$SCRIPT_DIR/docker-compose.yml" 2>/dev/null | head -1 | sed 's/.*container_name:\s*//' | tr -d ' '
}

# --- 读取配置 ---
FRONTEND_PORT=$(parse_port "frontend")
BACKEND_PORT=$(parse_port "backend")
DB_PORT=$(parse_port "database")
HEALTH_PATH=$(parse_health_path)
HEALTH_TIMEOUT=$(parse_health_timeout)
DB_CONTAINER=$(parse_db_container)

: "${FRONTEND_PORT:=5173}"
: "${BACKEND_PORT:=3000}"
: "${DB_PORT:=5432}"
: "${HEALTH_PATH:=/health}"
: "${HEALTH_TIMEOUT:=30}"
: "${DB_CONTAINER:=todo-app-db}"

# --- 健康检查轮询 ---
wait_for_url() {
  local url="$1"
  local max_wait="$2"
  local label="$3"
  local elapsed=0
  while [ $elapsed -lt "$max_wait" ]; do
    if curl -s "$url" > /dev/null 2>&1; then
      return 0
    fi
    sleep 2
    elapsed=$((elapsed + 2))
  done
  echo "  ❌ ${label} 在 ${max_wait}s 内未就绪"
  return 1
}

wait_for_db() {
  local max_wait="$1"
  local elapsed=0
  while [ $elapsed -lt "$max_wait" ]; do
    local status
    status=$(docker inspect --format='{{.State.Health.Status}}' "$DB_CONTAINER" 2>/dev/null || echo "missing")
    if [ "$status" = "healthy" ]; then
      return 0
    fi
    sleep 2
    elapsed=$((elapsed + 2))
  done
  echo "  ❌ 数据库在 ${max_wait}s 内未就绪"
  return 1
}

# --- 检测服务是否已运行 ---
is_running() {
  local port="$1"
  curl -s "http://localhost:${port}" > /dev/null 2>&1
}

echo "🚀 TODO App 启动..."
echo ""

# ==========================================
# 1. 数据库（无依赖，最先启动）
# ==========================================
echo "1️⃣  数据库 (port: ${DB_PORT})..."

if ! docker ps > /dev/null 2>&1; then
  echo "  ❌ Docker 未运行，请先启动 Docker Desktop"
  exit 1
fi

cd "$SCRIPT_DIR"
docker compose up -d > /dev/null 2>&1
echo "  ⏳ 等待数据库就绪..."

if wait_for_db "$HEALTH_TIMEOUT"; then
  echo "  ✅ 数据库就绪"
else
  exit 1
fi

# ==========================================
# 2. 后端（依赖 database）
# ==========================================
echo ""
echo "2️⃣  后端 (port: ${BACKEND_PORT})..."

cd "$SCRIPT_DIR/backend"

if [ ! -d "node_modules" ]; then
  echo "  📦 安装依赖..."
  npm install > /dev/null 2>&1
fi

echo "  🔄 数据库迁移..."
npx prisma migrate deploy > /dev/null 2>&1 || npx prisma migrate dev --name init > /dev/null 2>&1

# 首次填充数据
TODO_COUNT=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) as count FROM \"Todo\"" 2>/dev/null | grep -oE '[0-9]+' | head -1 || echo "0")
if [ "$TODO_COUNT" = "0" ]; then
  echo "  🌱 填充示例数据..."
  npx prisma db seed > /dev/null 2>&1 || true
fi

if is_running "$BACKEND_PORT"; then
  echo "  ✅ 后端已在运行"
else
  echo "  🚀 启动后端..."
  npm run dev > "$LOG_DIR/backend.log" 2>&1 &
  BACKEND_PID=$!
  echo "$BACKEND_PID" > "$PID_DIR/backend.pid"

  if wait_for_url "http://localhost:${BACKEND_PORT}${HEALTH_PATH}" "$HEALTH_TIMEOUT" "后端"; then
    echo "  ✅ 后端就绪 (PID: ${BACKEND_PID})"
  else
    exit 1
  fi
fi

# ==========================================
# 3. 前端（依赖 backend）
# ==========================================
echo ""
echo "3️⃣  前端 (port: ${FRONTEND_PORT})..."

cd "$SCRIPT_DIR/frontend"

if [ ! -d "node_modules" ]; then
  echo "  📦 安装依赖..."
  npm install > /dev/null 2>&1
fi

if is_running "$FRONTEND_PORT"; then
  echo "  ✅ 前端已在运行"
else
  echo "  🚀 启动前端..."
  npm run dev > "$LOG_DIR/frontend.log" 2>&1 &
  FRONTEND_PID=$!
  echo "$FRONTEND_PID" > "$PID_DIR/frontend.pid"

  if wait_for_url "http://localhost:${FRONTEND_PORT}" "$HEALTH_TIMEOUT" "前端"; then
    echo "  ✅ 前端就绪 (PID: ${FRONTEND_PID})"
  else
    exit 1
  fi
fi

# ==========================================
# 完成
# ==========================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 应用启动成功！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 访问地址:"
echo "   前端: http://localhost:${FRONTEND_PORT}"
echo "   后端: http://localhost:${BACKEND_PORT}"
echo ""
echo "💡 日志查看:"
echo "   后端: tail -f ${LOG_DIR}/backend.log"
echo "   前端: tail -f ${LOG_DIR}/frontend.log"
echo ""
echo "📌 停止服务: ./stop.sh"
echo ""
