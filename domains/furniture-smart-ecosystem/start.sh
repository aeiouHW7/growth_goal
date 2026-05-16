#!/bin/bash
# furniture-smart-ecosystem — 一键启动

set -e

echo "🚀 启动 furniture-smart-ecosystem..."

# 检查 Docker
if ! command -v docker >/dev/null 2>&1; then
  echo "❌ 请先安装 Docker"
  exit 1
fi

# 启动所有服务
echo "📦 启动 PostgreSQL + Backend + Frontend..."
docker compose up -d

echo ""
echo "✅ 启动完成！"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:3001"
echo "  Database: localhost:5432"
echo ""
echo "查看日志: docker compose logs -f"
echo "停止服务: docker compose down"
