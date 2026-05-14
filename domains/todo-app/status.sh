#!/bin/bash

# TODO App - 状态检查脚本
# 用途: 查看所有服务的运行状态

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 TODO App 服务状态"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 检查 Docker 状态
echo "【Docker 服务】"
if docker ps > /dev/null 2>&1; then
  DB_STATUS=$(docker ps --filter "name=todo-app-db" --format "table {{.Names}}\t{{.Status}}" | tail -n +2)
  if [ -n "$DB_STATUS" ]; then
    echo "✅ PostgreSQL: 运行中"
    echo "   容器: $DB_STATUS"
  else
    echo "❌ PostgreSQL: 未运行"
  fi
else
  echo "❌ Docker: 未运行（请启动 Docker Desktop）"
fi

echo ""

# 检查后端状态
echo "【后端服务】"
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
  BACKEND_PID=$(ps aux | grep -E '[t]sx.*todo-app.*backend' | awk '{print $2}' | head -1)
  echo "✅ 后端: 运行中"
  echo "   地址: http://localhost:3000"
  if [ -n "$BACKEND_PID" ]; then
    echo "   PID: $BACKEND_PID"
  fi
else
  echo "❌ 后端: 未运行"
fi

echo ""

# 检查前端状态
echo "【前端服务】"
if curl -s http://localhost:5173 > /dev/null 2>&1; then
  FRONTEND_PID=$(ps aux | grep -E '[v]ite.*todo-app' | awk '{print $2}' | head -1)
  echo "✅ 前端: 运行中"
  echo "   地址: http://localhost:5173"
  if [ -n "$FRONTEND_PID" ]; then
    echo "   PID: $FRONTEND_PID"
  fi
else
  echo "❌ 前端: 未运行"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 端口占用检查
echo ""
echo "【端口占用】"
echo "后端端口 (3000):"
lsof -i :3000 2>/dev/null | tail -n +2 || echo "  未占用"

echo ""
echo "前端端口 (5173):"
lsof -i :5173 2>/dev/null | tail -n +2 || echo "  未占用"

echo ""
echo "数据库端口 (5432):"
lsof -i :5432 2>/dev/null | tail -n +2 || echo "  未占用"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 日志文件检查
echo ""
echo "【日志文件】"
if [ -f /tmp/todo-backend.log ]; then
  BACKEND_SIZE=$(ls -lh /tmp/todo-backend.log | awk '{print $5}')
  echo "后端日志: /tmp/todo-backend.log ($BACKEND_SIZE)"
  echo "  查看: tail -f /tmp/todo-backend.log"
else
  echo "后端日志: 不存在"
fi

echo ""
if [ -f /tmp/todo-frontend.log ]; then
  FRONTEND_SIZE=$(ls -lh /tmp/todo-frontend.log | awk '{print $5}')
  echo "前端日志: /tmp/todo-frontend.log ($FRONTEND_SIZE)"
  echo "  查看: tail -f /tmp/todo-frontend.log"
else
  echo "前端日志: 不存在"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 健康检查
echo ""
echo "【健康检查】"

ALL_RUNNING=true

# 检查各服务
if ! docker ps --filter "name=todo-app-db" --format "{{.Names}}" | grep -q "todo-app-db"; then
  echo "⚠️  数据库未运行"
  ALL_RUNNING=false
fi

if ! curl -s http://localhost:3000/health > /dev/null 2>&1; then
  echo "⚠️  后端未响应"
  ALL_RUNNING=false
fi

if ! curl -s http://localhost:5173 > /dev/null 2>&1; then
  echo "⚠️  前端未响应"
  ALL_RUNNING=false
fi

if [ "$ALL_RUNNING" = true ]; then
  echo "✅ 所有服务运行正常！"
  echo ""
  echo "📝 访问应用: http://localhost:5173"
else
  echo ""
  echo "💡 启动服务: ./start.sh"
fi

echo ""
