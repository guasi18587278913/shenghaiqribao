'use client';

import { planetLogin } from '@/actions/planet-auth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function PlanetLoginForm() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [planetNumber, setPlanetNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await planetLogin({
        phone: phone.trim(),
        planetNumber: planetNumber.trim(),
      });

      if (result.success) {
        // 登录成功，跳转到首页或日报列表
        router.push('/reports');
        router.refresh();
      } else {
        setError(result.error || '登录失败');
      }
    } catch (err) {
      setError('登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">欢迎登录</CardTitle>
        <CardDescription>请输入您的手机号和星球编号登录</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="phone">手机号</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="请输入手机号"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              disabled={loading}
              maxLength={11}
              pattern="1[3-9]\d{9}"
            />
            <p className="text-sm text-muted-foreground">
              请输入11位中国大陆手机号
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="planetNumber">星球编号</Label>
            <Input
              id="planetNumber"
              type="text"
              placeholder="请输入星球编号"
              value={planetNumber}
              onChange={(e) => setPlanetNumber(e.target.value)}
              required
              disabled={loading}
            />
            <p className="text-sm text-muted-foreground">知识星球的编号</p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading || !phone || !planetNumber}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? '登录中...' : '登录'}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            <p>还没有账号？请联系管理员开通</p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
