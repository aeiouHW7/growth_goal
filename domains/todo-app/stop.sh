#!/bin/bash

# TODO App - 停止脚本（配置驱动）
# 从 domain.yaml 读取服务配置，反序停止

set +e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
DOMAIN_YAML="$SCRIPT_DIR/domain.yaml"
PID_DIR="$SCRIPT_DIR/.pids"

# --- YAML 轻量解析 ---
parse_port() {
  local service="$1"
  grep -A5 "^  ${service}:" "$DOMAIN_YAML" 2>/dev/null | grep "port:" | head -1 | sed 's/.*port:\s*//' | tr -d ' '
}

# --- 读取服务端口 ---
FRONTEND_PORT=$(parse_port "frontend")
BACKEND_PORT=$(parse_port "backend")
DB_CONTAINER="todo-app-db"

: "${FRONTEND_PORT:=5173}"
: "${BACKEND_PORT:=3000}"

echo "正在关闭 todo-app 服务..."
echo ""

# --- 停止函数：端口清扫优先，PID 清理收尾 ---
# npm run dev 创建进程树（npm → tsx/vite），必须两层都杀干净
stop_service() {
  local name="$1"
  local port="$2"
  local pid_file="$PID_DIR/${name}.pid"
  local had_something=false

  # 1. 端口清扫：先杀掉真正占端口的进程（tsx/vite 子进程）
  if [ -n "$port" ]; then
    local port_pids
    port_pids=$(lsof -ti :"$port" 2>/dev/null || true)
    if [ -n "$port_pids" ]; then
      echo "$port_pids" | xargs kill 2>/dev/null || true
      sleep 1
      port_pids=$(lsof -ti :"$port" 2>/dev/null || true)
      if [ -n "$port_pids" ]; then
        echo "$port_pids" | xargs kill -9 2>/dev/null || true
      fi
      had_something=true
    fi
  fi

  # 2. PID 清理：杀掉可能存活的 npm 父进程
  if [ -f "$pid_file" ]; then
    local pid
    pid=$(cat "$pid_file")
    if kill -0 "$pid" 2>/dev/null; then
      kill -9 "$pid" 2>/dev/null || true
      had_something=true
    fi
    rm -f "$pid_file"
    [ "$had_something" = false ] && had_something=true
  fi

  if [ "$had_something" = true ]; then
    echo "  ✓ ${name} 已关闭"
  else
    echo "  - ${name} 未运行"
  fi
}

# --- 反序停止：frontend → backend → database ---
stop_service "frontend" "$FRONTEND_PORT"
stop_service "backend" "$BACKEND_PORT"

# Docker 容器单独处理
if docker ps --format '{{.Names}}' 2>/dev/null | grep -q "$DB_CONTAINER"; then
  cd "$SCRIPT_DIR"
  docker compose down 2>/dev/null
  echo "  ✓ 数据库已关闭"
else
  echo "  - 数据库未运行"
fi

# 清理日志（可选，保留最近日志）
echo ""
echo "全部关闭。"
