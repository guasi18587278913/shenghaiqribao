import { PlanetLoginForm } from '@/components/auth/planet-login-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '星球用户登录',
  description: '使用手机号和星球编号登录',
};

export default function PlanetLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">AI 出海社群日报</h1>
          <p className="text-muted-foreground">星球用户专属登录</p>
        </div>
        <PlanetLoginForm />
      </div>
    </div>
  );
}
