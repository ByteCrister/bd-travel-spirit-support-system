// api/mock/support/article-comments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
    type ArticleCommentSummaryListResponseDTO,
    type SortDTO,
    type ArticleSortKey,
    type ArticleFiltersDTO,
} from '@/types/article-comment.types';
import { queryArticleSummary } from '@/lib/mocks/article-comments.mock';
import { CommentStatus } from '@/constants/articleComment.const';

export async function GET(req: NextRequest) {

    const url = new URL(req.url);
    const page = Number(url.searchParams.get('page') ?? 1);
    const pageSize = Number(url.searchParams.get('pageSize') ?? 20);
    const sortKey = (url.searchParams.get('sortKey') ?? 'createdAt') as ArticleSortKey;
    const sortDir = (url.searchParams.get('sortDir') ?? 'desc') as SortDTO<ArticleSortKey>['direction'];

    const filters: ArticleFiltersDTO = {
        searchQuery: url.searchParams.get('searchQuery'),
        status: (url.searchParams.get('status') as CommentStatus | 'any') ?? 'any',
        authorId: url.searchParams.get('authorId'),
        taggedRegion: url.searchParams.get('taggedRegion'),
    };

    const sort: SortDTO<ArticleSortKey> = { key: sortKey, direction: sortDir };
    const { data, meta } = queryArticleSummary(page, pageSize, sort, filters);

    const response: ArticleCommentSummaryListResponseDTO = {
        data,
        meta: {
            pagination: meta,
            sort,
            filtersApplied: filters,
        },
    };

    return NextResponse.json({ data: response }, { status: 200 });
}
