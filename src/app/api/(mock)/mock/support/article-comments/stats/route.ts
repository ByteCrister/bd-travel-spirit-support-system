// api/mock/support/article-comments/stats/route.ts
import { NextResponse } from 'next/server';
import { buildStats } from '@/lib/mocks/article-comments.mock';

import type { CommentAdminStatsDTO } from '@/types/article/article-comment.types';

export async function GET() {
  const stats = buildStats() as CommentAdminStatsDTO;
  return NextResponse.json({data: stats}, { status: 200 });
}
