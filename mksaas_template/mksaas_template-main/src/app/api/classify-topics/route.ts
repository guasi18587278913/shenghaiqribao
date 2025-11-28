import { classifyTopics } from '@/actions/classify-topics';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!Array.isArray(body.topics)) {
      return NextResponse.json(
        { success: false, error: 'topics 字段缺失' },
        { status: 400 }
      );
    }

    const topics = body.topics.map((topic: any) => ({
      title: topic.title ?? '',
      summary: topic.summary ?? '',
      content: topic.content ?? '',
    }));

    const results = await classifyTopics(topics);
    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error('classify-topics API error:', error);
    return NextResponse.json(
      { success: false, error: error.message ?? '服务器内部错误' },
      { status: 500 }
    );
  }
}
