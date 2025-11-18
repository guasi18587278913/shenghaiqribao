'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SparklesText } from '@/components/magicui/sparkles-text';
import { ShimmerButton } from '@/components/magicui/shimmer-button';
import { Confetti } from '@/components/magicui/confetti';
import { cn } from '@/lib/utils';
import { Sparkles, XIcon } from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react';

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
  const confettiRef = useRef<any>(null);

  useEffect(() => {
    if (open) {
      // 延迟显示，创造更流畅的体验
      const timer = setTimeout(() => {
        setIsVisible(true);
        // 触发彩带效果
        setTimeout(() => {
          confettiRef.current?.fire({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        }, 300);
      }, 100);
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
    <React.Fragment>
      {/* 彩带效果 */}
      <Confetti
        ref={confettiRef}
        className="fixed inset-0 pointer-events-none z-[100]"
        manualstart
      />

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

            {/* 标题 - 千人千面 - 带闪烁星星效果 */}
            <DialogTitle className="text-center">
              <SparklesText
                className="text-2xl font-bold"
                colors={{
                  first: '#3b82f6',
                  second: '#a855f7',
                }}
                sparklesCount={8}
              >
                你好，{userName}！
              </SparklesText>
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

            {/* 行动按钮 - 闪光按钮效果 */}
            <div className="mt-6 flex justify-center">
              <ShimmerButton
                onClick={() => onOpenChange(false)}
                className="px-8 py-3 text-base font-medium"
                shimmerColor="#ffffff"
                shimmerSize="0.1em"
                shimmerDuration="2s"
                borderRadius="12px"
                background="linear-gradient(to right, #3b82f6, #a855f7)"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  开始探索
                </span>
              </ShimmerButton>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </React.Fragment>
  );
}
