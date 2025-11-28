'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useEffect } from 'react';

export default function StyleTestPage() {
  useEffect(() => {
    // 显示当前应用到 body 的类
    const bodyClasses = document.body.className;
    console.log('current body classes:', bodyClasses);

    // 检查主题变量
    const root = document.documentElement;
    const currentTheme =
      getComputedStyle(root).getPropertyValue('--background');
    console.log('CSS --background variable:', currentTheme);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">样式优化测试页面</h1>
        <p className="text-muted-foreground">验证所有样式优化效果</p>

        <div className="mt-4 p-4 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground">
            查看控制台 (F12 → Console) 查看当前应用的样式信息
          </p>
        </div>
      </div>

      {/* 主题测试 */}
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">主题测试</h2>
        <p>当前主题会显示在控制台的 theme-[name] 类中</p>
        <div className="mt-4 p-4 bg-primary/10 border-l-4 border-primary">
          这个区域使用了 --primary 颜色变量
        </div>
      </Card>

      {/* Prose 样式测试 */}
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Prose Premium 样式</h2>

        <div className="prose-premium max-w-none">
          <p>这是一个测试段落，用于验证 prose-premium 样式的应用。</p>

          <h3>标题测试</h3>
          <p>测试段落内容，查看 [文字颜色] 和默认行距效果。</p>

          <h4>代码测试</h4>
          <p>内联代码 `const value = true` 应该显示特殊样式。</p>

          <pre>
            <code>{`// 代码块测试
function test() {
  console.log("Hello World");
}`}</code>
          </pre>

          <blockquote>
            <p>
              这是一个引用块，用于测试引用样式的优化效果。引用的文字应该比普通文字更突出。
            </p>
          </blockquote>

          <p>
            这是一个 <a href="#">测试链接</a>，验证下划线 hover 效果。
          </p>

          <table>
            <thead>
              <tr>
                <th>标题1</th>
                <th>标题2</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>内容1</td>
                <td>内容2</td>
              </tr>
              <tr>
                <td>内容3</td>
                <td>内容4</td>
              </tr>
            </tbody>
          </table>

          <hr />

          <p>这是最后的测试段落。</p>
        </div>
      </Card>

      {/* 升级主题测试 */}
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">优化主题测试</h2>

        <p className="mb-4">当前应用的样式类通过 JavaScript 动态显示：</p>

        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-md">
            <p>
              <strong>背景色：</strong> <span id="bg-color">检测中...</span>
            </p>
            <p>
              <strong>正文字体色：</strong> <span id="fg-color">检测中...</span>
            </p>
            <p>
              <strong>主色调：</strong>{' '}
              <span id="primary-color">检测中...</span>
            </p>
          </div>

          <Button
            onClick={() => {
              const body = document.body;
              const computedStyles = getComputedStyle(body);
              const bg = computedStyles.getPropertyValue('--background');
              const fg = computedStyles.getPropertyValue('--foreground');
              const primary = computedStyles.getPropertyValue('--primary');

              document.getElementById('bg-color')!.textContent = bg || '未应用';
              document.getElementById('fg-color')!.textContent = fg || '未应用';
              document.getElementById('primary-color')!.textContent =
                primary || '未应用';

              console.log('=== 当前主题检测 ===');
              console.log('body className:', body.className);
              console.log('--background:', bg);
              console.log('--foreground:', fg);
              console.log('--primary:', primary);

              // 检查 theme application
              const themeClasses = Array.from(body.classList).filter((cls) =>
                cls.startsWith('theme-')
              );
              console.log('theme classes found:', themeClasses);
            }}
          >
            检测当前主题
          </Button>
        </div>
      </Card>

      {/* 暗色模式对比度测试 */}
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">暗色模式对比度测试</h2>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            切换到暗色模式，验证对比度提升
          </p>

          <div className="border p-4 rounded-md">
            <p className="text-foreground">主要文字</p>
            <p className="text-muted-foreground">次要文字 - 对比度已优化</p>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
              主要按钮
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
