import { db } from '@/db';
import { categoryStats } from '@/db/schema';
import { nanoid } from 'nanoid';

/**
 * 种子数据：初始化10个主分类
 * 基于文档结构：/Users/liyadong/Desktop/群聊精华-主题精修
 */

const initialCategories = [
	{
		id: nanoid(),
		name: '账号与设备',
		slug: 'account-device',
		icon: '🔐',
		description: '账号注册、风控策略、设备选购与配置',
		order: 1,
		isFeatured: true,
	},
	{
		id: nanoid(),
		name: '网络与代理',
		slug: 'network-proxy',
		icon: '🌐',
		description: '网络配置、代理设置、科学上网指南',
		order: 2,
		isFeatured: true,
	},
	{
		id: nanoid(),
		name: '支付与订阅',
		slug: 'payment-subscription',
		icon: '💳',
		description: '国际支付、订阅管理、虚拟卡使用',
		order: 3,
		isFeatured: true,
	},
	{
		id: nanoid(),
		name: '开发工具',
		slug: 'dev-tools',
		icon: '🛠️',
		description: 'AI开发工具、Cursor、Claude Code等使用攻略',
		order: 4,
		isFeatured: true,
	},
	{
		id: nanoid(),
		name: '项目执行',
		slug: 'project-execution',
		icon: '🚀',
		description: '环境配置、部署上线、调试排错全流程',
		order: 5,
		isFeatured: true,
	},
	{
		id: nanoid(),
		name: '产品与增长',
		slug: 'product-growth',
		icon: '📈',
		description: '从创意到上线、产品验证、增长方法论',
		order: 6,
		isFeatured: true,
	},
	{
		id: nanoid(),
		name: '社群与学习',
		slug: 'community-learning',
		icon: '👥',
		description: '社群资源、学习路径、知识沉淀',
		order: 7,
		isFeatured: true,
	},
	{
		id: nanoid(),
		name: '认知与避坑',
		slug: 'mindset-pitfalls',
		icon: '💡',
		description: '学习认知、常见误区、避坑指南',
		order: 8,
		isFeatured: true,
	},
	{
		id: nanoid(),
		name: '成本规划',
		slug: 'cost-planning',
		icon: '💰',
		description: '成本优化、预算规划、省钱策略',
		order: 9,
		isFeatured: true,
	},
	{
		id: nanoid(),
		name: '设备与环境',
		slug: 'device-environment',
		icon: '💻',
		description: '开发环境、设备选型、系统配置',
		order: 10,
		isFeatured: true,
	},
];

/**
 * 运行种子数据脚本
 * 用法：pnpm tsx src/db/seed-categories.ts
 */
async function seedCategories() {
	console.log('🌱 开始初始化分类数据...');

	try {
		// 先检查是否已有数据
		const existing = await db.select().from(categoryStats).limit(1);

		if (existing.length > 0) {
			console.log('⚠️  数据库中已有分类数据，跳过初始化');
			console.log('   如需重新初始化，请先手动清空 category_stats 表');
			return;
		}

		// 批量插入
		await db.insert(categoryStats).values(initialCategories);

		console.log('✅ 成功初始化 10 个分类！');
		console.log('\n分类列表：');
		initialCategories.forEach((cat) => {
			console.log(`  ${cat.icon} ${cat.order}. ${cat.name} (${cat.slug})`);
		});
	} catch (error) {
		console.error('❌ 初始化失败:', error);
		throw error;
	}
}

// 如果直接运行此脚本，则执行初始化
if (require.main === module) {
	seedCategories()
		.then(() => {
			console.log('\n🎉 分类初始化完成！');
			process.exit(0);
		})
		.catch((error) => {
			console.error('\n💥 初始化过程出错:', error);
			process.exit(1);
		});
}

export { seedCategories, initialCategories };
