import { checkPlanetVerification } from '@/actions/planet-auth';
import { PlanetVerificationForm } from '@/components/planet/planet-verification-form';
import { authClient } from '@/lib/auth-client';
import { redirect } from 'next/navigation';

export const metadata = {
  title: '星球成员验证',
  description: '验证您的知识星球成员身份以访问日报内容',
};

/**
 * 星球成员验证页面
 */
export default async function VerifyPlanetPage() {
  // 检查用户登录状态
  const { data: session } = await authClient.getSession();

  if (!session?.user) {
    // 未登录，重定向到登录页，登录后返回这里
    redirect('/sign-in?callbackUrl=/verify-planet');
  }

  // 检查是否已完成验证
  const { verified } = await checkPlanetVerification();

  if (verified) {
    // 已验证，重定向到日报页面
    redirect('/reports');
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <span className="text-3xl">🌟</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">星球成员验证</h1>
          <p className="text-muted-foreground">
            请输入您的手机号和星球编号，以验证您的成员身份
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-lg border bg-card shadow-sm p-6">
          <PlanetVerificationForm />
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>找不到星球编号？</p>
          <p className="mt-1">请在知识星球APP中查看您的个人资料</p>
        </div>
      </div>
    </div>
  );
}
