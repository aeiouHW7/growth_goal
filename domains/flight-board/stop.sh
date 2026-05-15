#!/bin/bash
echo "正在关闭 flight-board 服务..."

# 关前端（端口 5174）
FRONTEND_PIDS=$(lsof -ti :5174 2>/dev/null)
if [ -n "$FRONTEND_PIDS" ]; then
  kill $FRONTEND_PIDS 2>/dev/null
  echo "  ✓ 前端已关闭"
else
  echo "  - 前端未运行"
fi

# 关后端（端口 3001）
BACKEND_PIDS=$(lsof -ti :3001 2>/dev/null)
if [ -n "$BACKEND_PIDS" ]; then
  kill $BACKEND_PIDS 2>/dev/null
  echo "  ✓ 后端已关闭"
else
  echo "  - 后端未运行"
fi

# 关数据库
if docker ps --format '{{.Names}}' 2>/dev/null | grep -q flight-board-db; then
  docker compose down 2>/dev/null
  echo "  ✓ 数据库已关闭"
else
  echo "  - 数据库未运行"
fi

echo "全部关闭。"
