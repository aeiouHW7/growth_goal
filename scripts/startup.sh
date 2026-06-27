#!/bin/bash
# growth-miniprogram 一键启动
# 用法: bash scripts/startup.sh
#
# 启动顺序: Docker DB → 等待 DB 就绪 → 后端(3001) → 前端(3002)
# Bridge 由 PM2 独立管理，不受此脚本影响
#
# 输出格式: startup:<key>|<value> 方便 Bridge 或外部工具解析

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "▶ Starting PostgreSQL..."
cd "$ROOT" && docker compose up -d

echo "▶ Waiting for DB to be ready..."
for i in $(seq 1 30); do
  if docker exec growth-miniprogram-db pg_isready -U growthuser -d growth-miniprogram >/dev/null 2>&1; then
    echo "   DB ready"
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "   DB wait timeout"
    exit 1
  fi
  sleep 1
done

echo "▶ Starting backend (port 3001)..."
cd "$ROOT/backend" && npm run dev &
BACKEND_PID=$!

# Give backend a moment to start before frontend
sleep 3

echo "▶ Starting frontend (port 3002)..."
cd "$ROOT/frontend" && npm run dev &
FRONTEND_PID=$!

echo "✓ All services started"
echo "   DB:      localhost:5434 (container: growth-miniprogram-db)"
echo "   Backend: localhost:3001 (PID: $BACKEND_PID)"
echo "   Frontend: localhost:3002 (PID: $FRONTEND_PID)"
echo ""
echo "   Bridge:  managed by PM2 — 'pm2 status' to check"
echo "   Stop:    bash scripts/shutdown.sh"
