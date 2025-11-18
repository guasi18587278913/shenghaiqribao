# 历史数据导入模板说明

## 📋 填写指南

将你整理的内容按照以下格式填入 `import-historical-data.ts` 文件的 `historicalData` 数组中。

## 📝 格式说明

### 日报级别字段
- **date**: 日期，格式 'YYYY-MM-DD'
- **title**: 日报标题
- **summary**: 日报摘要（可选）
- **topics**: 话题列表

### 话题级别字段
- **title**: 话题标题
- **summary**: 话题摘要（简短概括，1-2句话）
- **content**: 话题详细内容（可以用 Markdown 格式）
- **category**: 分类，可选值：
  - '账号注册'
  - '开发环节'
  - '产品Idea'
  - '流量获取'
  - '变现方式'
  - '工具推荐'
  - '学习资源'
  - '经验分享'
  - '其他'
- **tags**: 标签数组（可选）
- **importance**: 重要程度 1-5，5最重要（可选，默认3）
- **editorNote**: 编辑点评（可选）
- **sourceUrl**: 来源链接（可选）

## 🎯 填写示例

```typescript
const historicalData: HistoricalReport[] = [
  {
    date: '2024-10-14',
    title: '新人营 10月14日 社群精选',
    summary: '今天讨论了 AI 产品出海、账号注册等核心话题',
    topics: [
      {
        title: '如何选择合适的 AI 产品方向',
        summary: '群友分享了选择 AI 产品方向的 3 个关键要素：市场需求、技术可行性、竞争格局',
        content: `
## 核心观点

用户 @张三 提出：选择 AI 产品方向要看三点：

### 1. 市场需求
- 验证真实痛点
- 目标用户规模
- 付费意愿

### 2. 技术可行性
- 现有 AI 能力是否匹配
- 开发成本
- 迭代速度

### 3. 竞争格局
- 竞品分析
- 差异化优势
- 护城河

## 讨论摘录

> 张三: 不要一上来就做大而全的产品，先找一个细分场景切入
> 李四: 我们团队就是从翻译工具开始，逐步扩展到其他场景
> 王五: +1，小而美更容易验证

## 总结

大家一致认为：先做 MVP，快速验证市场，再考虑扩展。
        `.trim(),
        category: '产品Idea',
        tags: ['产品方向', 'AI', '创业'],
        importance: 5,
        editorNote: '非常实用的经验分享，强烈推荐新人阅读',
      },
      {
        title: 'Google 账号注册最新方案',
        summary: '分享了 2024 年最新的 Google 账号注册方法和注意事项',
        content: `
## 注册步骤

1. 准备材料
   - 海外手机号（推荐使用接码平台）
   - 干净的 IP（建议使用住宅 IP）

2. 注册流程
   - 访问 accounts.google.com
   - 填写基本信息
   - 验证手机号

3. 注意事项
   - 不要频繁切换 IP
   - 完善账号信息
   - 避免批量注册

## 推荐工具

- 接码平台：SMS-Activate
- IP 工具：Luminati
        `.trim(),
        category: '账号注册',
        tags: ['Google', '注册', '工具'],
        importance: 4,
      },
    ],
  },

  {
    date: '2024-10-15',
    title: '新人营 10月15日 社群精选',
    topics: [
      // ... 更多话题
    ],
  },
];
```

## ⚠️ 注意事项

1. **日期格式**：必须是 'YYYY-MM-DD' 格式
2. **分类名称**：必须使用上面列出的固定分类
3. **内容格式**：建议使用 Markdown，系统会自动渲染
4. **去重**：脚本会自动跳过已存在日期的日报
5. **重要性**：重要的话题设置 importance 为 4-5，会有特殊标记

## 🚀 运行导入

填写完成后，运行：

```bash
pnpm tsx scripts/import-historical-data.ts
```

## 📊 导入后检查

访问：http://localhost:3002/reports

查看导入的日报是否正常显示。
