#!/bin/bash
# FSE Agent — Termux 启动脚本
# 用法: bash start.sh

echo "FSE Agent 启动中..."

# 检查 Node.js
if ! command -v node &>/dev/null; then
  echo "❌ 未找到 Node.js，请先安装：pkg install nodejs"
  exit 1
fi

# 检查 npm
if ! command -v npm &>/dev/null; then
  echo "❌ 未找到 npm"
  exit 1
fi

# 进入脚本所在目录
cd "$(dirname "$0")" || exit 1

# 安装依赖（首次运行）
if [ ! -d "node_modules" ]; then
  echo "📦 安装依赖..."
  npm install
fi

echo "🚀 启动 Agent..."
npx tsx src/index.ts
