// app/api/articles/comments/[articleId]/root/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
    type CommentThreadSegmentDTO,
    type SortDTO,
    type CommentSortKey,
    type CommentFiltersDTO,
} from '@/types/article-comment.types';
import { queryRootComments } from '../../_lib/mock';

export async function GET(req: NextRequest, { params }: { params: { articleId: string } }) {
    const url = new URL(req.url);
    const pageSize = Number(url.searchParams.get('pageSize') ?? 100);
    const sortKey = (url.searchParams.get('sortKey') ?? 'createdAt') as CommentSortKey;
    const sortDir = (url.searchParams.get('sortDir') ?? 'desc') as SortDTO<CommentSortKey>['direction'];
    const cursor = url.searchParams.get('cursor');

    const filters: CommentFiltersDTO = {
        status: (url.searchParams.get('status') as any) ?? 'any',
        minLikes: url.searchParams.get('minLikes') ? Number(url.searchParams.get('minLikes')) : null,
        hasReplies: url.searchParams.get('hasReplies') ? url.searchParams.get('hasReplies') === 'true' : null,
        authorId: url.searchParams.get('authorId'),
        searchQuery: url.searchParams.get('searchQuery'),
    };

    const sort: SortDTO<CommentSortKey> = { key: sortKey, direction: sortDir };
    const { nodes, meta } = queryRootComments(params.articleId, cursor, pageSize, sort, filters);

    const response: CommentThreadSegmentDTO = {
        nodes,
        meta: {
            pagination: meta,
            sort,
            filtersApplied: filters,
            scope: { articleId: params.articleId, parentId: null, depthMax: null },
        },
    };

    return NextResponse.json(response, { status: 200 });
}
