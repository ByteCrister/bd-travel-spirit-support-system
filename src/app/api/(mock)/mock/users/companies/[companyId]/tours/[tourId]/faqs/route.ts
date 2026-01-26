// api/users-management/companies/[companyId]/tours/[tourId]/faqs/route.ts

import { NextRequest, NextResponse } from "next/server";
import { faker } from "@faker-js/faker";

/**
 * Mock moderation statuses used by the frontend types.
 * Adjust values if your real app exports different constants.
 */
const MODERATION_STATUSES = ["approved", "pending", "rejected"] as const;

type ModerationStatus = (typeof MODERATION_STATUSES)[number];

type FAQUserDTO = {
    id: string;
    name: string;
    avatarUrl?: string;
};

type FAQReportDTO = {
    reportedBy: FAQUserDTO;
    reason?: string;
    customReason?: string;
    explanation?: string;
    createdAt: string;
};

type TourFAQDTO = {
    id: string;
    tourId: string;
    question: string;
    answer?: string;
    askedBy: FAQUserDTO;
    answeredBy?: FAQUserDTO;
    status: ModerationStatus;
    order: number;
    isActive: boolean;
    likes: number;
    dislikes: number;
    userVote?: "like" | "dislike";
    reports: FAQReportDTO[];
    createdAt: string;
    updatedAt: string;
    answeredAt?: string;
    editedAt?: string;
};

type GetTourFaqsResponse = {
    data: {
        docs: TourFAQDTO[];
        total: number;
        page: number;
        pages: number;
    };
};

/**
 * Helper: create a fake user
 */
const makeUser = (): FAQUserDTO => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    avatarUrl: faker.image.avatar(),
});

/**
 * Helper: create a single fake FAQ (tourId passed through)
 */
const makeFaq = (tourId: string, order: number): TourFAQDTO => {
    const asked = makeUser();
    const answered = Math.random() > 0.4 ? makeUser() : undefined;
    const hasAnswer = Boolean(answered);
    const createdAt = faker.date.recent({ days: 60 }).toISOString();
    const answeredAt = hasAnswer
        ? faker.date
            .between({ from: new Date(createdAt), to: new Date() })
            .toISOString()
        : undefined;
    const updatedAt = faker.date
        .between({ from: new Date(createdAt), to: new Date() })
        .toISOString();
    const editedAt =
        Math.random() > 0.7
            ? faker.date
                .between({ from: new Date(updatedAt), to: new Date() })
                .toISOString()
            : undefined;

    const reportsCount = Math.floor(Math.random() * 3);
    const reports: FAQReportDTO[] = Array.from({ length: reportsCount }).map(
        () => ({
            reportedBy: makeUser(),
            reason: faker.helpers.arrayElement(["spam", "abuse", "other"]),
            customReason: Math.random() > 0.6 ? faker.lorem.words(3) : undefined,
            explanation: Math.random() > 0.5 ? faker.lorem.sentence() : undefined,
            createdAt: faker.date
                .between({ from: new Date(createdAt), to: new Date() })
                .toISOString(),
        })
    );

    const likes = faker.number.int({ min: 0, max: 500 });
    const dislikes = faker.number.int({ min: 0, max: 50 });
    const userVote =
        Math.random() > 0.8
            ? Math.random() > 0.5
                ? "like"
                : "dislike"
            : undefined;

    return {
        id: faker.string.uuid(),
        tourId,
        question: faker.lorem.sentence(),
        answer: hasAnswer ? faker.lorem.paragraph() : undefined,
        askedBy: asked,
        answeredBy: answered,
        status: faker.helpers.arrayElement(MODERATION_STATUSES),
        order,
        isActive: Math.random() > 0.05,
        likes,
        dislikes,
        userVote,
        reports,
        createdAt,
        updatedAt,
        answeredAt,
        editedAt,
    };
};

/**
 * GET handler - supports query params: page, limit, sort, order
 *
 * Example: /api/.../faqs?page=2&limit=5
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ companyId: string; tourId: string }> }
) {
    const {  tourId } = await params;
    const url = new URL(req.url);

    const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
    const limit = Math.max(
        1,
        Math.min(100, Number(url.searchParams.get("limit") ?? "10"))
    );
    // sort and order are accepted but for mock we ignore them or use to shuffle
    const sort = url.searchParams.get("sort") ?? "order";
    const order = (url.searchParams.get("order") ?? "asc").toLowerCase();

    // For repeatable-ish mock data across pages, set a total and deterministically derive items
    const TOTAL_FAQS = 57; // change as needed for testing pagination
    const pages = Math.ceil(TOTAL_FAQS / limit);
    const currentPage = Math.min(page, pages || 1);

    // compute start index and count
    const start = (currentPage - 1) * limit;
    const count = Math.min(limit, TOTAL_FAQS - start);

    // create items
    const docs: TourFAQDTO[] = Array.from({ length: count }).map((_, i) => {
        const index = start + i + 1; // 1-based
        // Use tourId and index to make data easier to inspect
        return makeFaq(tourId, index);
    });

    // optional: apply a simple sort simulation for 'order' field
    if (sort === "order") {
        docs.sort((a, b) =>
            order === "desc" ? b.order - a.order : a.order - b.order
        );
    }

    const body: GetTourFaqsResponse = {
        data: {
            docs,
            total: TOTAL_FAQS,
            page: currentPage,
            pages,
        },
    };

    return NextResponse.json(body);
}
