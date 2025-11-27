'use client';

import { loginWithPhonePlanet } from '@/actions/auth';
import { getWelcomeMessage } from '@/actions/welcome';
import { WelcomeDialog } from '@/components/auth/welcome-dialog';
import { FormError } from '@/components/shared/form-error';
import { FormSuccess } from '@/components/shared/form-success';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2Icon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

export interface PhonePlanetLoginFormProps {
  className?: string;
  callbackUrl?: string;
}

const LoginSchema = z.object({
  phone: z.string().min(1, {
    message: '请输入手机号',
  }),
});

export const PhonePlanetLoginForm = ({
  className,
  callbackUrl = '/reports',
}: PhonePlanetLoginFormProps) => {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>('');
  const [success, setSuccess] = useState<string | undefined>('');
  const [isPending, setIsPending] = useState(false);

  // 欢迎弹窗状态
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeData, setWelcomeData] = useState<{
    userName: string;
    message: string;
  }>({
    userName: '',
    message: '',
  });

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      phone: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
    setIsPending(true);
    setError('');
    setSuccess('');

    const result = await loginWithPhonePlanet(values.phone);

    if (result.success) {
      setSuccess('登录成功!');

      // 获取用户信息和欢迎消息
      if (result.user) {
        const welcomeMsg = await getWelcomeMessage(result.user.id);

        setWelcomeData({
          userName: result.user.name || '亲爱的朋友',
          message: welcomeMsg.success ? welcomeMsg.message || '' : '',
        });

        // 显示欢迎弹窗
        setShowWelcome(true);
        setIsPending(false);
      }
    } else {
      setError(result.error);
      setIsPending(false);
    }
  };

  // 关闭欢迎弹窗后跳转
  const handleWelcomeClose = () => {
    setShowWelcome(false);
    setTimeout(() => {
      router.push(callbackUrl);
      router.refresh();
    }, 300);
  };

  return (
    <>
      <Card className={cn('w-full max-w-md mx-auto', className)}>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            欢迎登录
          </CardTitle>
          <CardDescription className="text-center">
            使用手机号登录
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>手机号</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isPending}
                          placeholder="请输入手机号"
                          type="tel"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormError message={error} />
              <FormSuccess message={success} />
              <Button
                disabled={isPending}
                size="lg"
                type="submit"
                className="w-full flex items-center justify-center gap-2"
              >
                {isPending && (
                  <Loader2Icon className="mr-2 size-4 animate-spin" />
                )}
                <span>登录</span>
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* 欢迎弹窗 */}
      <WelcomeDialog
        open={showWelcome}
        onOpenChange={handleWelcomeClose}
        userName={welcomeData.userName}
        message={welcomeData.message}
      />
    </>
  );
};
