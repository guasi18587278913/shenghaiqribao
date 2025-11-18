import { CategoryAdminPanel } from '@/components/admin/category-admin-panel';
import { authClient } from '@/lib/auth-client';
import { redirect } from 'next/navigation';

export const metadata = {
  title: '分类管理 - 管理后台',
  description: '初始化和管理日报分类',
};

/**
 * 分类管理页面
 * 只有管理员可以访问
 */
export default async function CategoryAdminPage() {
  // 检查管理员权限
  const { data: session } = await authClient.getSession();

  if (!session?.user || session.user.role !== 'admin') {
    redirect('/');
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">分类管理</h1>
        <p className="text-muted-foreground">初始化和管理日报分类数据</p>
      </div>

      <CategoryAdminPanel />
    </div>
  );
}
