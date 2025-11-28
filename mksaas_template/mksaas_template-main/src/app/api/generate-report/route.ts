import { generateReportFiles } from '@/actions/generate-report';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * Generate Report API Route
 *
 * POST /api/generate-report
 * 生成日报和知识库文件的 API 路由
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证必需字段
    if (!body.metadata || !body.markdown) {
      return NextResponse.json(
        { success: false, error: '缺少必需字段' },
        { status: 400 }
      );
    }

    // 调用 Server Action
    const result = await generateReportFiles({
      metadata: body.metadata,
      markdown: body.markdown,
      approvedTopics: body.approvedTopics || [],
    });

    // 返回结果
    if (result.success) {
      return NextResponse.json({
        success: true,
        results: result.results,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          results: result.results,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('API route error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '服务器内部错误',
      },
      { status: 500 }
    );
  }
}
