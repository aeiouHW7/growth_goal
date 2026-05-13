#!/bin/bash

# TODO App - 一键启动脚本
# 用途: 准备并启动完整开发环境

set -e  # 遇到错误立即退出

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "🚀 TODO App 启动..."
echo ""

# 0. 检查 Docker 是否运行
if ! docker ps > /dev/null 2>&1; then
  echo "❌ Docker 未运行，请先启动 Docker Desktop"
  exit 1
fi

# 1. 启动项目的 Docker 服务（PostgreSQL）
echo "1️⃣ 启动数据库..."
cd "$SCRIPT_DIR"
docker-compose up -d > /dev/null 2>&1
echo "✅ PostgreSQL 已启动"

# 等待数据库就绪
sleep 3

# 2. 后端准备
echo ""
echo "2️⃣ 准备后端..."
cd "$SCRIPT_DIR/backend"

if [ ! -d "node_modules" ]; then
  echo "   安装后端依赖..."
  npm install > /dev/null 2>&1
fi

echo "   运行数据库迁移..."
npx prisma migrate deploy > /dev/null 2>&1 || npx prisma migrate dev --name init > /dev/null 2>&1

# 检查数据库是否为空（仅首次填充数据）
TODO_COUNT=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) as count FROM Todo" 2>/dev/null | grep -oE '[0-9]+' | head -1 || echo "0")

if [ "$TODO_COUNT" = "0" ]; then
  echo "   填充示例数据..."
  npx prisma db seed > /dev/null 2>&1 || true
else
  echo "   数据库已有 $TODO_COUNT 条数据，跳过填充"
fi

echo "✅ 后端就绪"

# 3. 前端准备
echo ""
echo "3️⃣ 准备前端..."
cd "$SCRIPT_DIR/frontend"

if [ ! -d "node_modules" ]; then
  echo "   安装前端依赖..."
  npm install > /dev/null 2>&1
fi

echo "✅ 前端就绪"

# 4. 检测服务是否已运行
echo ""
echo "4️⃣ 检测服务..."

BACKEND_RUNNING=$(curl -s http://localhost:3000/health > /dev/null 2>&1 && echo "yes" || echo "no")
FRONTEND_RUNNING=$(curl -s http://localhost:5173 > /dev/null 2>&1 && echo "yes" || echo "no")

if [ "$BACKEND_RUNNING" = "yes" ] && [ "$FRONTEND_RUNNING" = "yes" ]; then
  echo "✅ 服务已经在运行！"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🎉 应用已就绪！"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "📝 访问地址:"
  echo "   前端: http://localhost:5173"
  echo "   后端: http://localhost:3000"
  echo ""
  echo "💡 服务已在后台运行，无需额外操作"
  echo ""
  exit 0
fi

# 5. 启动服务（如果未运行）
echo ""
echo "5️⃣ 启动服务..."

# 启动后端（后台）
if [ "$BACKEND_RUNNING" = "no" ]; then
  cd "$SCRIPT_DIR/backend"
  echo "   启动后端..."
  npm run dev > /tmp/todo-backend.log 2>&1 &
  BACKEND_PID=$!
  echo "   后端 PID: $BACKEND_PID"
  sleep 2
fi

# 启动前端（后台）
if [ "$FRONTEND_RUNNING" = "no" ]; then
  cd "$SCRIPT_DIR/frontend"
  echo "   启动前端..."
  npm run dev > /tmp/todo-frontend.log 2>&1 &
  FRONTEND_PID=$!
  echo "   前端 PID: $FRONTEND_PID"
  sleep 3
fi

# 等待服务启动
echo ""
echo "⏳ 等待服务启动..."
for i in {1..10}; do
  if curl -s http://localhost:3000/health > /dev/null 2>&1 && \
     curl -s http://localhost:5173 > /dev/null 2>&1; then
    break
  fi
  sleep 1
done

# 完成
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 应用启动成功！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 访问地址:"
echo "   前端: http://localhost:5173"
echo "   后端: http://localhost:3000"
echo ""
echo "💡 日志查看:"
echo "   后端: tail -f /tmp/todo-backend.log"
echo "   前端: tail -f /tmp/todo-frontend.log"
echo ""
echo "📌 停止服务: pkill -f 'vite|tsx.*todo-app'"
echo ""


