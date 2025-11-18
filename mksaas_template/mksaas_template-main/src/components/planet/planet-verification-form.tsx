'use client';

import { verifyPlanetAccess } from '@/actions/planet-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function PlanetVerificationForm() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [planetNumber, setPlanetNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await verifyPlanetAccess({ phone, planetNumber });

      if (result.success) {
        // 验证成功，跳转到日报页面
        router.push('/reports');
        router.refresh();
      } else {
        setError(result.error || '验证失败');
      }
    } catch (err: any) {
      setError('验证失败，请重试');
      console.error('Verification error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 错误提示 */}
      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* 手机号 */}
      <div className="space-y-2">
        <Label htmlFor="phone">手机号</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="请输入11位手机号"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          maxLength={11}
          pattern="^1[3-9]\d{9}$"
          disabled={isLoading}
          className="text-base"
        />
        <p className="text-xs text-muted-foreground">
          请输入您在知识星球使用的手机号
        </p>
      </div>

      {/* 星球编号 */}
      <div className="space-y-2">
        <Label htmlFor="planetNumber">星球编号</Label>
        <Input
          id="planetNumber"
          type="text"
          placeholder="请输入星球编号"
          value={planetNumber}
          onChange={(e) => setPlanetNumber(e.target.value)}
          required
          pattern="^\d+$"
          disabled={isLoading}
          className="text-base"
        />
        <p className="text-xs text-muted-foreground">
          纯数字编号，可在知识星球APP个人资料中查看
        </p>
      </div>

      {/* 提交按钮 */}
      <Button type="submit" className="w-full" disabled={isLoading} size="lg">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            验证中...
          </>
        ) : (
          '提交验证'
        )}
      </Button>

      {/* 隐私说明 */}
      <p className="text-xs text-center text-muted-foreground">
        我们仅使用此信息验证您的星球成员身份，不会用于其他目的
      </p>
    </form>
  );
}
