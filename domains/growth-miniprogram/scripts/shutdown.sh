#!/bin/bash
# growth-miniprogram 一键停止
# 用法: bash scripts/shutdown.sh
#
# 停止后端(3001) + 前端(3002)，保留 PostgreSQL 和 Bridge 继续运行

set -euo pipefail

echo "▶ Stopping services..."

# 1) 通过端口查 PID 并 kill
for port in 3001 3002; do
  pid=""
  # Windows Git Bash: netstat -ano
  pid=$(netstat -ano 2>/dev/null | grep ":$port " | grep -i listening | awk '{print $NF}' | sort -u | head -1 || true)
  # macOS/Linux: lsof
  if [ -z "$pid" ] || [ "$pid" = "0" ]; then
    pid=$(lsof -ti:$port 2>/dev/null || true)
  fi
  if [ -n "$pid" ] && [ "$pid" != "0" ]; then
    echo "   Killing port $port (PID $pid)..."
    kill "$pid" 2>/dev/null || taskkill //PID "$pid" //F 2>/dev/null || true
  fi
done

# 2) 兜底：杀 tsx/vite 进程
pkill -f "tsx watch.*backend" 2>/dev/null || true
pkill -f "vite.*frontend" 2>/dev/null || true
pkill -f "node.*dev" 2>/dev/null || true

echo "✓ Services stopped (PostgreSQL + Bridge still running)"
echo "   Start again:  bash scripts/startup.sh"
