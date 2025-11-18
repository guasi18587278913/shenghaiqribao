# 路由结构文档

## 日报系统路由

### ⚠️ 重要提示：防止路由冲突

本项目使用 **MDX 文件系统** 作为日报的唯一数据源。

**当前活跃路由:**
- `/[locale]/reports` - 日报列表页和详情页
  - 位置: `src/app/[locale]/(docs)/reports/[[...slug]]/page.tsx`
  - 数据源: `content/reports/` 目录下的 MDX 文件
  - 使用 fumadocs 进行内容管理

**已废弃的路由（已删除）:**
- ~~`src/app/[locale]/(marketing)/reports/page.tsx`~~ - 数据库版本（已删除）
- ~~`src/app/[locale]/(docs)/_reports_backup/`~~ - 旧备份（已删除）

### 其他路由

**后台管理:**
- `/[locale]/dashboard/reports` - 后台日报管理
  - 位置: `src/app/[locale]/(protected)/dashboard/reports/page.tsx`
  - 用于管理和创建日报

## 路由冲突预防规则

### 1. 一个功能只保留一个路由实现

**错误示例 ❌:**
```
src/app/[locale]/(marketing)/reports/page.tsx        → /[locale]/reports
src/app/[locale]/(docs)/reports/[[...slug]]/page.tsx → /[locale]/reports[[...slug]]
```
这会导致路由冲突错误。

**正确示例 ✅:**
```
只保留一个:
src/app/[locale]/(docs)/reports/[[...slug]]/page.tsx → /[locale]/reports[[...slug]]
```

### 2. 使用下划线前缀禁用路由

如果需要临时禁用某个路由但保留代码:
```
src/app/[locale]/(marketing)/_reports/  ← 下划线开头,Next.js 会忽略
```

### 3. 完全删除不需要的代码

**建议:** 如果确定不再使用某个实现,直接删除而不是重命名。避免代码库中存在多个相似的实现。

## 当前项目的日报系统架构

```
日报数据流:
content/reports/*.mdx
  ↓ (fumadocs-mdx)
  ↓
src/lib/source.ts (reportsSource)
  ↓
src/app/[locale]/(docs)/reports/[[...slug]]/page.tsx
  ↓
用户访问 /reports 或 /reports/specific-report
```

## 如何验证路由没有冲突

1. 启动开发服务器: `pnpm dev`
2. 查看终端输出,确保没有 "route with the same specificity" 错误
3. 访问 http://localhost:3000/reports 确认页面正常

## 修改路由时的检查清单

- [ ] 确认新路由不与现有路由冲突
- [ ] 删除旧实现的代码(不要只是重命名)
- [ ] 更新本文档说明
- [ ] 重启开发服务器验证
- [ ] 测试所有相关页面能正常访问

## 紧急修复路由冲突

如果遇到路由冲突错误:

1. 查看错误信息,找到冲突的两个路由
2. 决定保留哪个实现
3. 完全删除另一个实现
4. 重启开发服务器

```bash
# 查找所有 reports 相关路由
find src/app -type d -name "*report*"

# 删除不需要的路由
rm -rf src/app/[locale]/(marketing)/_reports_db

# 重启服务器
pnpm dev
```

## 最后更新

- 日期: 2025-11-14
- 修改人: Claude
- 变更: 删除数据库版本日报,统一使用 MDX 版本
