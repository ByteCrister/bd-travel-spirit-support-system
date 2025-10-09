// app/api/articles/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { faker } from '@faker-js/faker';
import {
    ARTICLE_STATUS,
    ARTICLE_TYPE,
    TRAVEL_CATEGORY,
    ArticleDetail,
    ArticleDetailApi,
    ImageRef,
    DestinationBlock,
} from '@/types/article.types';

/**
 * GET /api/articles/:id
 * Returns ArticleDetailApi => { ok: true, data: ArticleDetail } or error envelope
 */

/* -------------------------------------------------------------------------- */
/* Utility helpers                                                            */
/* -------------------------------------------------------------------------- */

function randChoice<T>(arr: readonly T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function stringHashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

function makeImageRef(): ImageRef {
    return {
        id: faker.string.uuid(),
        url: faker.image.urlLoremFlickr({ category: 'travel' }),
        alt: faker.lorem.sentence(3),
        width: 1200,
        height: 800,
    };
}

/* -------------------------------------------------------------------------- */
/* Core data factory                                                          */
/* -------------------------------------------------------------------------- */

function makeDetail(idSeed: string): ArticleDetail {
    faker.seed(stringHashCode(idSeed));

    const title = faker.lorem.sentence();
    const hero = Math.random() > 0.4 ? makeImageRef() : undefined;
    const createdAt = faker.date.past({ years: 3 }).toISOString();
    const updatedAt = faker.date.recent().toISOString();
    const publishedAt = Math.random() > 0.4 ? faker.date.past({ years: 2 }).toISOString() : undefined;

    const destinations: DestinationBlock[] | undefined =
        Math.random() > 0.3
            ? [
                {
                    city: faker.location.city(),
                    country: faker.location.country(),
                    description: faker.lorem.paragraph(),
                    content: [{ type: 'paragraph' as const, text: faker.lorem.paragraph() }],
                    highlights: faker.helpers.arrayElements(['food', 'beach', 'temple', 'market'], 2),
                    images: [makeImageRef()],
                },
            ]
            : undefined;

    const seo: ArticleDetail['seo'] = {
        metaTitle: `${title} — Travel Guide`,
        metaDescription: faker.lorem.sentence(),
        ogImage: hero ?? faker.image.urlLoremFlickr({ category: 'landscape' }),
    };

    const detail: ArticleDetail = {
        id: idSeed,
        title,
        slug: faker.helpers.slugify(title).toLowerCase(),
        status: randChoice(Object.values(ARTICLE_STATUS)),
        articleType: randChoice(Object.values(ARTICLE_TYPE)),
        author: {
            id: faker.string.uuid(),
            name: faker.person.fullName(),
            avatarUrl: faker.image.avatar(),
        },
        summary: faker.lorem.paragraph(),
        heroImage: hero,
        categories:
            Math.random() > 0.5
                ? [
                    randChoice([
                        TRAVEL_CATEGORY.DESTINATION_GUIDE,
                        TRAVEL_CATEGORY.BEACHES,
                        TRAVEL_CATEGORY.FOOD_DRINK,
                        TRAVEL_CATEGORY.CULTURE_HISTORY,
                    ]),
                ]
                : undefined,
        tags: faker.helpers.arrayElements(
            ['beach', 'city', 'food', 'budget', 'luxury'],
            faker.number.int({ min: 1, max: 3 })
        ),
        publishedAt,
        readingTime: faker.number.int({ min: 3, max: 20 }),
        wordCount: faker.number.int({ min: 400, max: 3500 }),
        viewCount: faker.number.int({ min: 0, max: 100_000 }),
        likeCount: faker.number.int({ min: 0, max: 10_000 }),
        shareCount: faker.number.int({ min: 0, max: 2_000 }),
        allowComments: Math.random() > 0.2,
        createdAt,
        updatedAt,
        seo,
        destinations,
        faqs:
            Math.random() > 0.6
                ? [
                    {
                        question: faker.lorem.sentence(),
                        answer: faker.lorem.paragraph(),
                    },
                ]
                : undefined,
        commentCount: faker.number.int({ min: 0, max: 500 }),
        pendingCommentCount: faker.number.int({ min: 0, max: 20 }),
    };

    return detail;
}

/* -------------------------------------------------------------------------- */
/* Route handler                                                              */
/* -------------------------------------------------------------------------- */

export async function GET(
    _req: NextRequest,
    context: { params: { id?: string } }
): Promise<NextResponse<ArticleDetailApi>> {
    try {
        const params = await context.params; // <-- await here
        const id = params.id;

        if (!id) {
            return NextResponse.json(
                { ok: false, error: 'Missing id param', status: 400 },
                { status: 400 }
            );
        }

        const detail = makeDetail(id);
        return NextResponse.json({ ok: true, data: detail });
    } catch (error) {
        console.error('[GET /api/articles/:id] Error:', error);
        return NextResponse.json(
            { ok: false, error: 'Failed to generate article detail', status: 500 },
            { status: 500 }
        );
    }
}