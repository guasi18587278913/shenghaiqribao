'use client';

import {
  addCategoryFields,
  initializeCategories,
} from '@/actions/admin-categories';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { useState } from 'react';

export function CategoryAdminPanel() {
  const [isAdding, setIsAdding] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAddFields = async () => {
    setIsAdding(true);
    setResult(null);

    try {
      const res = await addCategoryFields();
      setResult(res);
    } catch (error) {
      setResult({
        success: false,
        error: '操作失败',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleInitialize = async () => {
    setIsInitializing(true);
    setResult(null);

    try {
      const res = await initializeCategories();
      setResult(res);
    } catch (error) {
      setResult({
        success: false,
        error: '操作失败',
      });
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Step 1: Add Database Fields */}
      <Card>
        <CardHeader>
          <CardTitle>步骤 1: 添加数据库字段</CardTitle>
          <CardDescription>
            为 category_stats 表添加 icon、description 和 order 字段
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-4 text-sm font-mono">
              <div className="space-y-1 text-muted-foreground">
                <div>+ icon TEXT</div>
                <div>+ description TEXT</div>
                <div>+ order INTEGER</div>
                <div className="text-destructive">- display_order</div>
              </div>
            </div>

            <Button
              onClick={handleAddFields}
              disabled={isAdding || isInitializing}
              className="w-full"
            >
              {isAdding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  执行中...
                </>
              ) : (
                '执行数据库更新'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Initialize Categories */}
      <Card>
        <CardHeader>
          <CardTitle>步骤 2: 初始化分类数据</CardTitle>
          <CardDescription>
            创建 10 个预设分类（基于知识库结构）
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span>🔐</span>
                <span>账号与设备</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🌐</span>
                <span>网络与代理</span>
              </div>
              <div className="flex items-center gap-2">
                <span>💳</span>
                <span>支付与订阅</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🛠️</span>
                <span>开发工具</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🚀</span>
                <span>项目执行</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📈</span>
                <span>产品与增长</span>
              </div>
              <div className="flex items-center gap-2">
                <span>👥</span>
                <span>社群与学习</span>
              </div>
              <div className="flex items-center gap-2">
                <span>💡</span>
                <span>认知与避坑</span>
              </div>
              <div className="flex items-center gap-2">
                <span>💰</span>
                <span>成本规划</span>
              </div>
              <div className="flex items-center gap-2">
                <span>💻</span>
                <span>设备与环境</span>
              </div>
            </div>

            <Button
              onClick={handleInitialize}
              disabled={isAdding || isInitializing}
              className="w-full"
              variant="default"
            >
              {isInitializing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  初始化中...
                </>
              ) : (
                '初始化分类数据'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Result Display */}
      {result && (
        <Card
          className={
            result.success
              ? 'border-green-500/50 bg-green-500/5'
              : 'border-destructive/50 bg-destructive/5'
          }
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.success ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  操作成功
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-destructive" />
                  操作失败
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">{result.message || result.error}</p>

              {result.categories && (
                <div className="mt-4 space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground">
                    已创建分类：
                  </p>
                  {result.categories.map((cat: any) => (
                    <div
                      key={cat.order}
                      className="flex items-center gap-2 text-sm"
                    >
                      <span>{cat.icon}</span>
                      <span className="text-muted-foreground">
                        {String(cat.order).padStart(2, '0')}.
                      </span>
                      <span>{cat.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base">使用说明</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-muted-foreground">
          <p>1. 首次使用请先执行"步骤1"添加数据库字段</p>
          <p>2. 然后执行"步骤2"初始化10个预设分类</p>
          <p>3. 初始化后，访问日报页面即可看到新的分类导航</p>
          <p className="text-xs pt-2 border-t">
            💡 提示：如果已有分类数据，初始化操作会被跳过
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
