// app/api/articles/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { faker } from '@faker-js/faker';
import { ARTICLE_STATUS, ARTICLE_TYPE, ArticleListApi, ArticleListItem, ImageRef, TRAVEL_CATEGORY, UserRef } from '@/types/article.types';

/**
 * GET /api/articles
 * Query params supported (all optional):
 *  - page (1-based, default 1)
 *  - pageSize (default 20)
 *  - query (free-text search)
 *  - status (comma separated statuses)
 *
 * Response: ArticleListApi (offset-style)
 */

/** Random array choice helper */
function randChoice<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

/** Simple deterministic hash (for seeding) */
function stringHashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const chr = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0;
    }
    return Math.abs(hash);
}

/** Safe integer parsing */
function parseIntOrDefault(v: string | null, def: number): number {
    if (!v) return def;
    const n = parseInt(v, 10);
    return Number.isFinite(n) && n > 0 ? n : def;
}

/** Create a fake user reference */
function makeUserRef(seed?: string): UserRef {
    if (seed) faker.seed(stringHashCode(seed));
    return {
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        avatarUrl: faker.image.avatar(),
    };
}

/** Create a fake image reference */
function makeImageRef(): ImageRef {
    return {
        id: faker.string.uuid(),
        url: faker.image.urlLoremFlickr({ category: 'nature' }),
        alt: faker.lorem.sentence(3),
        width: 1200,
        height: 800,
    };
}

/** Create one fake article list item */
function makeListItem(seed: string | number): ArticleListItem {
    const seedVal = typeof seed === 'number' ? seed : stringHashCode(seed);
    faker.seed(seedVal);

    const title = faker.lorem.sentence();

    return {
        id: faker.string.uuid(),
        title,
        slug: faker.helpers.slugify(title).toLowerCase(),
        status: randChoice(Object.values(ARTICLE_STATUS)),
        articleType: randChoice(Object.values(ARTICLE_TYPE)),
        author: makeUserRef(`${seedVal}-author`),
        summary: faker.lorem.paragraph(),
        heroImage: Math.random() > 0.5 ? makeImageRef() : undefined,
        categories:
            Math.random() > 0.6
                ? [randChoice([
                    TRAVEL_CATEGORY.DESTINATION_GUIDE,
                    TRAVEL_CATEGORY.BEACHES,
                    TRAVEL_CATEGORY.FOOD_DRINK,
                    TRAVEL_CATEGORY.CULTURE_HISTORY
                ])]
                : undefined,

        tags: faker.helpers.arrayElements(
            ['beach', 'city', 'food', 'budget', 'luxury', 'family'],
            faker.number.int({ min: 1, max: 3 })
        ),
        publishedAt: faker.date.past({ years: 2 }).toISOString(),
        readingTime: faker.number.int({ min: 2, max: 20 }),
        wordCount: faker.number.int({ min: 300, max: 4200 }),
        viewCount: faker.number.int({ min: 0, max: 100_000 }),
        likeCount: faker.number.int({ min: 0, max: 10_000 }),
        shareCount: faker.number.int({ min: 0, max: 2_000 }),
        allowComments: Math.random() > 0.2,
        createdAt: faker.date.past({ years: 3 }).toISOString(),
        updatedAt: faker.date.recent().toISOString(),
        destinationCount: Math.random() > 0.6 ? faker.number.int({ min: 1, max: 5 }) : undefined,
        topDestinations:
            Math.random() > 0.6
                ? faker.helpers.arrayElements(
                    ["Cox's Bazar", 'Dhaka', 'Sylhet', 'Sundarbans'],
                    faker.number.int({ min: 1, max: 3 })
                )
                : undefined,
    };
}

export async function GET(req: NextRequest): Promise<NextResponse<ArticleListApi>> {
    try {
        const url = new URL(req.url);
        const page = parseIntOrDefault(url.searchParams.get('page'), 1);
        const pageSize = parseIntOrDefault(url.searchParams.get('pageSize'), 20);
        const query = url.searchParams.get('query')?.toLowerCase() ?? '';
        const statusParam = url.searchParams.get('status');

        const totalCount = 137;
        const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
        const pageClamped = Math.min(Math.max(1, page), totalPages);

        const items: ArticleListItem[] = [];
        const startIndex = (pageClamped - 1) * pageSize;

        for (let i = 0; i < pageSize; i++) {
            const globalIndex = startIndex + i;
            if (globalIndex >= totalCount) break;

            const seed = `article-${globalIndex}-${query}-${statusParam ?? ''}`;
            const item = makeListItem(seed);

            if (statusParam) {
                const allowedStatuses = statusParam.split(',').map((s) => s.trim());
                if (!allowedStatuses.includes(item.status)) continue;
            }

            if (query && !item.title.toLowerCase().includes(query) && !item.summary.toLowerCase().includes(query)) {
                continue;
            }

            items.push(item);
        }

        return NextResponse.json({
            ok: true,
            data: {
                items,
                page: pageClamped,
                pageSize,
                totalPages,
                totalCount,
                paginationType: 'offset',
            },
        });
    } catch (err) {
        console.error('Error in /api/articles:', err);
        return NextResponse.json({ ok: false, error: 'Failed to generate articles list' }, { status: 500 });
    }
}
