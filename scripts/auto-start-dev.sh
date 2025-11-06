#!/bin/bash

# 自动启动开发服务器脚本

set -e

echo "🚀 自动启动脚本"
echo "==============================================="
echo ""

# 等待依赖安装完成
echo "⏳ 等待依赖安装完成..."

while [ ! -d "node_modules/next" ]; do
  echo "   等待中... (检查 node_modules/next)"
  sleep 5
done

echo "✅ 依赖安装完成！"
echo ""

# 等待几秒确保安装完全结束
echo "⏳ 确保安装完全完成..."
sleep 3

# 启动开发服务器
echo "🎯 启动开发服务器..."
echo "==============================================="
npm run dev
