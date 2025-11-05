// app/api/articles/comments/[articleId]/segment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
    type LoadMoreCommentsResponseDTO,
    type SortDTO,
    type CommentSortKey,
    type CommentFiltersDTO,
} from '@/types/article-comment.types';
import { queryRootComments, queryChildComments } from '../../_lib/mock';

export async function GET(req: NextRequest, { params }: { params: { articleId: string } }) {
    const url = new URL(req.url);
    const parentId = url.searchParams.get('parentId');
    const cursor = url.searchParams.get('cursor');
    const pageSize = Number(url.searchParams.get('pageSize') ?? 100);
    const sortKey = (url.searchParams.get('sortKey') ?? 'createdAt') as CommentSortKey;
    const sortDir = (url.searchParams.get('sortDir') ?? 'desc') as SortDTO<CommentSortKey>['direction'];

    const filters: CommentFiltersDTO = {
        status: (url.searchParams.get('status') as any) ?? 'any',
        minLikes: url.searchParams.get('minLikes') ? Number(url.searchParams.get('minLikes')) : null,
        hasReplies: url.searchParams.get('hasReplies') ? url.searchParams.get('hasReplies') === 'true' : null,
        authorId: url.searchParams.get('authorId'),
        searchQuery: url.searchParams.get('searchQuery'),
    };

    const sort: SortDTO<CommentSortKey> = { key: sortKey, direction: sortDir };

    const result = parentId
        ? queryChildComments(params.articleId, parentId, cursor, pageSize, sort, filters)
        : queryRootComments(params.articleId, cursor, pageSize, sort, filters);

    const response: LoadMoreCommentsResponseDTO = {
        nodes: result.nodes,
        meta: {
            pagination: result.meta,
            sort,
            filtersApplied: filters,
            scope: { articleId: params.articleId, parentId: parentId ?? null, depthMax: null },
        },
    };

    return NextResponse.json(response, { status: 200 });
}
