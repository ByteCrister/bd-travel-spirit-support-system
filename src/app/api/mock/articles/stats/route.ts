// app/api/articles/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { faker } from '@faker-js/faker';
import { ArticleDashboardStats, UserRef } from '@/types/article.types';

/** Random array choice helper */
function randChoice<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

/** Create a fake user reference */
function makeUserRef(seed?: string): UserRef {
    if (seed) faker.seed(seed.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0));
    return {
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        avatarUrl: faker.image.avatar(),
    };
}

/** Generate a fake ArticleDashboardStats payload */
function makeDashboardStats(): ArticleDashboardStats {
    faker.seed(12345); // deterministic for demo
    const totalArticles = faker.number.int({ min: 50, max: 300 });
    const draftCount = faker.number.int({ min: 0, max: totalArticles / 3 });
    const publishedCount = faker.number.int({ min: 0, max: totalArticles - draftCount });
    const archivedCount = totalArticles - draftCount - publishedCount;

    const topAuthors = Array.from({ length: 5 }).map(() => ({
        author: makeUserRef(faker.string.uuid()),
        articleCount: faker.number.int({ min: 1, max: 30 }),
    }));

    const topDestinations = Array.from({ length: 5 }).map(() => ({
        city: faker.location.city(),
        country: faker.location.country(),
        articleCount: faker.number.int({ min: 1, max: 25 }),
    }));

    const popularTags = Array.from({ length: 5 }).map(() => ({
        tag: faker.lorem.word(),
        articleCount: faker.number.int({ min: 1, max: 50 }),
    }));

    const byStatusOverTime = Array.from({ length: 6 }).map((_, i) => ({
        bucketLabel: `2025-0${i + 1}`,
        count: faker.number.int({ min: 0, max: 20 }),
    }));

    return {
        summary: {
            totalArticles,
            draftCount,
            publishedCount,
            archivedCount,
            totalViews: faker.number.int({ min: 5000, max: 100_000 }),
            totalLikes: faker.number.int({ min: 500, max: 10_000 }),
            totalShares: faker.number.int({ min: 100, max: 5_000 }),
            averageReadingTime: faker.number.int({ min: 2, max: 15 }),
            averageWordCount: faker.number.int({ min: 500, max: 2000 }),
        },
        topAuthors,
        topDestinations,
        popularTags,
        byStatusOverTime,
    };
}

export async function GET(req: NextRequest) {
    try {
        const stats: ArticleDashboardStats = makeDashboardStats();
        return NextResponse.json({ ok: true, data: stats });
    } catch (err) {
        console.error('Error generating article stats:', err);
        return NextResponse.json(
            { ok: false, error: 'Failed to generate article stats' },
            { status: 500 }
        );
    }
}
