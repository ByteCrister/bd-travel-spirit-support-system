// app/api/articles/comments/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { buildStats } from '../_lib/mock';
import type { CommentAdminStatsDTO } from '@/types/article-comment.types';

export async function GET(_req: NextRequest) {
  const stats = buildStats() as CommentAdminStatsDTO;
  return NextResponse.json(stats, { status: 200 });
}
