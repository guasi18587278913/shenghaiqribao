#!/bin/bash

# 监控开发服务器启动状态

echo "🔍 监控开发服务器启动..."
echo ""

MAX_ATTEMPTS=60  # 最多等待 60 次（每次 5 秒 = 5 分钟）
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  ATTEMPT=$((ATTEMPT + 1))

  # 检查端口是否打开
  if lsof -i :3000 | grep LISTEN > /dev/null 2>&1; then
    echo ""
    echo "✅ 开发服务器已启动！"
    echo "==============================================="
    echo ""
    echo "🎉 您现在可以访问："
    echo ""
    echo "   📋 日报列表:"
    echo "   http://localhost:3000/zh/reports"
    echo ""
    echo "   ✨ 精华合集:"
    echo "   http://localhost:3000/zh/reports/special-knowledge-essentials-2024-10"
    echo ""
    echo "==============================================="
    exit 0
  fi

  # 显示进度
  if [ $((ATTEMPT % 3)) -eq 0 ]; then
    echo "⏳ 等待中... (${ATTEMPT}/60) Next.js 正在编译页面..."
  fi

  sleep 5
done

echo ""
echo "⚠️  服务器启动超时，请检查错误日志"
exit 1
