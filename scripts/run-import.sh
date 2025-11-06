#!/bin/bash

# 群聊精华导入自动化脚本
# 按顺序执行：同步数据库 schema -> 导入数据

set -e  # 遇到错误立即退出

echo "=========================================="
echo "🚀 群聊精华导入自动化脚本"
echo "=========================================="
echo ""

# 步骤 1: 同步数据库 schema
echo "📊 步骤 1/2: 同步数据库 schema..."
echo "----------------------------------------"
npm run db:push

if [ $? -eq 0 ]; then
  echo "✅ Schema 同步成功"
else
  echo "❌ Schema 同步失败，请检查错误信息"
  exit 1
fi

echo ""

# 步骤 2: 运行导入脚本
echo "📥 步骤 2/2: 导入群聊精华内容..."
echo "----------------------------------------"
npx tsx scripts/import-knowledge-essentials.ts

if [ $? -eq 0 ]; then
  echo ""
  echo "=========================================="
  echo "🎉 所有步骤已完成！"
  echo "=========================================="
  echo ""
  echo "💡 提示："
  echo "   - 访问 http://localhost:3000/zh/reports 查看日报列表"
  echo "   - 查找标题为「新人营群聊精华合集」的特殊日报"
  echo "   - 点击进入查看68篇精华内容"
  echo ""
else
  echo ""
  echo "❌ 导入失败，请检查错误信息"
  exit 1
fi
