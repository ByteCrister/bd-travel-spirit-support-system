// api/mock/support/article-comments/[articleId]/children/[parentId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
    type CommentThreadSegmentDTO,
    type SortDTO,
    type CommentSortKey,
    type CommentFiltersDTO,
} from '@/types/article-comment.types';
import { queryChildComments } from '@/lib/mocks/article-comments.mock';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ articleId: string; parentId: string }> }
) {
    const url = new URL(req.url);
    const pageSize = Number(url.searchParams.get('pageSize') ?? 100);
    const sortKey = (url.searchParams.get('sortKey') ?? 'createdAt') as CommentSortKey;
    const sortDir = (url.searchParams.get('sortDir') ?? 'asc') as SortDTO<CommentSortKey>['direction']; // matches store default
    const cursor = url.searchParams.get('cursor');

    const filters: CommentFiltersDTO = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        status: (url.searchParams.get('status') as any) ?? 'any',
        minLikes: url.searchParams.get('minLikes') ? Number(url.searchParams.get('minLikes')) : null,
        hasReplies: url.searchParams.get('hasReplies') ? url.searchParams.get('hasReplies') === 'true' : null,
        authorName: url.searchParams.get('authorName'),
        searchQuery: url.searchParams.get('searchQuery'),
    };

    const sort: SortDTO<CommentSortKey> = { key: sortKey, direction: sortDir };
    const { nodes, meta } = queryChildComments((await params).articleId, (await params).parentId, cursor, pageSize, sort, filters);

    const response: CommentThreadSegmentDTO = {
        nodes,
        meta: {
            pagination: meta,
            sort,
            filtersApplied: filters,
            scope: { articleId: (await params).articleId, parentId: (await params).parentId, depthMax: null },
        },
    };

    return NextResponse.json({ data: response }, { status: 200 });
}
