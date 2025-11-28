import { enrichTopics } from '@/actions/enrich-topics';
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

    const topics = body.topics.map((t: any) => ({
      title: String(t.title ?? ''),
      content: String(t.content ?? ''),
    }));

    const results = await enrichTopics(topics);
    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error('enrich-topics API error:', error);
    return NextResponse.json(
      { success: false, error: error.message ?? '服务器内部错误' },
      { status: 500 }
    );
  }
}
