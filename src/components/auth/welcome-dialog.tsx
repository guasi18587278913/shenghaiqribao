'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Sparkles, XIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface WelcomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName?: string;
  message?: string;
}

/**
 * 欢迎弹窗 - 登录成功后自动显示
 * 设计理念：温暖、亲切、高级感
 * 采用苹果风格的毛玻璃效果
 */
export function WelcomeDialog({
  open,
  onOpenChange,
  userName = '亲爱的朋友',
  message,
}: WelcomeDialogProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (open) {
      // 延迟显示，创造更流畅的体验
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [open]);

  const defaultMessage = `欢迎回来！很高兴再次见到你。

我们为你准备了最新的日报内容，包含了社区中最有价值的讨论和分享。

希望这些内容能为你带来启发和帮助。如果有任何问题或建议，随时欢迎与我们交流。

祝你今天有美好的收获！`;

  const displayMessage = message || defaultMessage;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'max-w-lg p-0 overflow-hidden border-0',
          // 毛玻璃效果 - 苹果风格
          'bg-white/80 dark:bg-gray-900/80',
          'backdrop-blur-2xl backdrop-saturate-150',
          // 边框和阴影
          'ring-1 ring-gray-200/50 dark:ring-gray-800/50',
          'shadow-2xl shadow-gray-500/10 dark:shadow-black/30',
          // 动画效果
          'transition-all duration-500',
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        )}
      >
        {/* 关闭按钮 */}
        <button
          onClick={() => onOpenChange(false)}
          className={cn(
            'absolute top-4 right-4 z-10',
            'flex h-8 w-8 items-center justify-center',
            'rounded-full',
            'bg-gray-100/80 dark:bg-gray-800/80',
            'backdrop-blur-sm',
            'hover:bg-gray-200/80 dark:hover:bg-gray-700/80',
            'transition-all duration-200',
            'ring-1 ring-gray-200/50 dark:ring-gray-700/50'
          )}
        >
          <XIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </button>

        {/* 装饰性渐变背景 */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-tr from-pink-400/20 to-orange-400/20 blur-3xl" />
        </div>

        {/* 内容区域 */}
        <div className="relative">
          {/* Header - 精致的标题区域 */}
          <DialogHeader className="space-y-4 p-8 pb-6">
            {/* 图标装饰 */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg shadow-blue-500/30">
              <Sparkles className="h-8 w-8 text-white" />
            </div>

            {/* 标题 - 千人千面 */}
            <DialogTitle className="text-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
                你好，{userName}！
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* 内容区域 - 毛玻璃卡片 */}
          <div className="px-8 pb-8">
            <div
              className={cn(
                'rounded-2xl p-6',
                // 内层毛玻璃效果
                'bg-white/50 dark:bg-gray-800/50',
                'backdrop-blur-sm',
                'ring-1 ring-gray-200/50 dark:ring-gray-700/50',
                'shadow-inner'
              )}
            >
              <div className="space-y-4">
                {/* 消息内容 */}
                <div className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {displayMessage}
                </div>
              </div>
            </div>

            {/* 行动按钮 */}
            <div className="mt-6 flex justify-center">
              <Button
                onClick={() => onOpenChange(false)}
                size="lg"
                className={cn(
                  'relative overflow-hidden',
                  'bg-gradient-to-r from-blue-500 to-purple-500',
                  'hover:from-blue-600 hover:to-purple-600',
                  'text-white font-medium',
                  'shadow-lg shadow-blue-500/30',
                  'transition-all duration-200',
                  'hover:shadow-xl hover:shadow-blue-500/40',
                  'hover:scale-105 active:scale-95'
                )}
              >
                <span className="relative z-10">开始探索</span>
                {/* 按钮光效 */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
