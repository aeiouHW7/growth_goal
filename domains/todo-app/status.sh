#!/bin/bash

# TODO App - 状态检查脚本（配置驱动）
# 从 domain.yaml 读取服务定义，检测各端口状态

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
DOMAIN_YAML="$SCRIPT_DIR/domain.yaml"
PID_DIR="$SCRIPT_DIR/.pids"
LOG_DIR="$SCRIPT_DIR/.logs"

# --- YAML 轻量解析 ---
parse_port() {
  local service="$1"
  grep -A5 "^  ${service}:" "$DOMAIN_YAML" 2>/dev/null | grep "port:" | head -1 | sed 's/.*port:\s*//' | tr -d ' '
}

parse_db_container() {
  grep "container_name:" "$SCRIPT_DIR/docker-compose.yml" 2>/dev/null | head -1 | sed 's/.*container_name:\s*//' | tr -d ' '
}

# --- 读取配置 ---
FRONTEND_PORT=$(parse_port "frontend")
BACKEND_PORT=$(parse_port "backend")
DB_PORT=$(parse_port "database")
DB_CONTAINER=$(parse_db_container)

: "${FRONTEND_PORT:=5173}"
: "${BACKEND_PORT:=3000}"
: "${DB_PORT:=5432}"
: "${DB_CONTAINER:=todo-app-db}"

# --- 服务状态检测 ---
check_service() {
  local name="$1" port="$2" pid_file="$PID_DIR/${name}.pid"
  local status="DOWN" pid_info=""

  if curl -s "http://localhost:${port}" > /dev/null 2>&1; then
    status="UP"
  fi

  # PID 一致性检查
  if [ -f "$pid_file" ]; then
    local saved_pid
    saved_pid=$(cat "$pid_file")
    if kill -0 "$saved_pid" 2>/dev/null; then
      pid_info="PID:${saved_pid}"
    else
      pid_info="PID:stale"
    fi
  fi

  printf "│ %-10s │ %5s │ %-4s │ %-10s │\n" "$name" "$port" "$status" "$pid_info"
}

check_db() {
  local status="DOWN"
  if docker ps --format '{{.Names}}' 2>/dev/null | grep -q "$DB_CONTAINER"; then
    local health
    health=$(docker inspect --format='{{.State.Health.Status}}' "$DB_CONTAINER" 2>/dev/null || echo "unknown")
    if [ "$health" = "healthy" ]; then
      status="UP"
    else
      status="$health"
    fi
  fi
  printf "│ %-10s │ %5s │ %-4s │ %-10s │\n" "database" "$DB_PORT" "$status" "$DB_CONTAINER"
}

# --- 输出 ---
echo "┌────────────┬───────┬──────┬────────────┐"
echo "│ Service    │  Port │ Status │ Info       │"
echo "├────────────┼───────┼──────┼────────────┤"
check_db
check_service "backend" "$BACKEND_PORT"
check_service "frontend" "$FRONTEND_PORT"
echo "└────────────┴───────┴──────┴────────────┘"

# --- 日志信息 ---
echo ""
if [ -f "$LOG_DIR/backend.log" ] || [ -f "$LOG_DIR/frontend.log" ]; then
  echo "📋 日志:"
  [ -f "$LOG_DIR/backend.log" ] && echo "   后端: tail -f $LOG_DIR/backend.log"
  [ -f "$LOG_DIR/frontend.log" ] && echo "   前端: tail -f $LOG_DIR/frontend.log"
else
  echo "📋 无日志文件（服务未通过 start.sh 启动）"
fi

echo ""
echo "💡 启动: ./start.sh  |  停止: ./stop.sh"
