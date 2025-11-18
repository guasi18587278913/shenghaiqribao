-- 为 category_stats 表添加新字段
-- 运行方式：在数据库管理工具中执行，或使用 psql

-- 1. 添加 icon 字段（emoji图标）
ALTER TABLE category_stats
ADD COLUMN IF NOT EXISTS icon TEXT NOT NULL DEFAULT '📁';

-- 2. 添加 description 字段（描述）
ALTER TABLE category_stats
ADD COLUMN IF NOT EXISTS description TEXT;

-- 3. 添加 order 字段（排序）
ALTER TABLE category_stats
ADD COLUMN IF NOT EXISTS "order" INTEGER NOT NULL DEFAULT 0;

-- 4. 删除旧的 display_order 字段（如果存在）
ALTER TABLE category_stats
DROP COLUMN IF EXISTS display_order;

-- 5. 添加索引
CREATE INDEX IF NOT EXISTS category_stats_order_idx ON category_stats ("order");

-- 查看结果
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'category_stats'
ORDER BY ordinal_position;
