import { shortLinks } from '@/config/short-links';
import { NextResponse } from 'next/server';

export function GET(
  _request: Request,
  context: { params: { slug: string } }
) {
  const target = shortLinks[context.params.slug];

  if (!target) {
    return new NextResponse('Not Found', { status: 404 });
  }

  return NextResponse.redirect(target);
}
