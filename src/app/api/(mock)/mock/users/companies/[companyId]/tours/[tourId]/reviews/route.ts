import { NextResponse } from "next/server";
import { faker } from "@faker-js/faker";
import { TRAVEL_TYPE } from "@/constants/tour.const";
import { TourReviewsResponseDTO, ReviewReplyDTO } from "@/types/tour-detail-review.type";

/** Helper: generate a consistent avatar for each user/employee */
function getAvatar(userId: string) {
    const numericId = parseInt(userId.slice(0, 6), 16) % 100; // 0–99
    const gender = Math.random() > 0.5 ? "men" : "women";
    return `https://randomuser.me/api/portraits/${gender}/${numericId}.jpg`;
}

/** Generate one fake employee reply */
function generateRandomReply(): ReviewReplyDTO {
    const employeeId = faker.database.mongodbObjectId();
    return {
        id: faker.database.mongodbObjectId(),
        employee: {
            id: employeeId,
            name: faker.person.fullName(),
            avatar: getAvatar(employeeId),
        },
        message: faker.lorem.sentences(faker.number.int({ min: 1, max: 3 })),
        isApproved: faker.datatype.boolean({ probability: 0.9 }),
        createdAt: faker.date.recent({ days: 30 }).toISOString(),
        updatedAt: faker.date.recent({ days: 15 }).toISOString(),
        deletedAt: faker.datatype.boolean({ probability: 0.05 }) ? faker.date.recent({ days: 10 }).toISOString() : null,
    };
}

/** Generate one fake review with optional replies */
function generateRandomReview(tourId: string) {
    const commentType = faker.helpers.arrayElement(["short", "medium", "long"]);
    const comment =
        commentType === "short"
            ? faker.lorem.words(faker.number.int({ min: 5, max: 12 }))
            : commentType === "medium"
                ? faker.lorem.sentences(faker.number.int({ min: 2, max: 4 }))
                : faker.lorem.paragraphs(faker.number.int({ min: 1, max: 2 }));

    const rating = faker.helpers.weightedArrayElement([
        { weight: 5, value: 5 },
        { weight: 4, value: 4 },
        { weight: 2, value: 3 },
        { weight: 1, value: 2 },
        { weight: 1, value: 1 },
    ]);

    const userId = faker.database.mongodbObjectId();

    // Generate 0–3 random replies for each review
    const replies: ReviewReplyDTO[] = Array.from({ length: faker.number.int({ min: 0, max: 3 }) }, () =>
        generateRandomReply()
    );

    return {
        id: faker.database.mongodbObjectId(),
        tourId,
        user: {
            id: userId,
            name: faker.person.fullName(),
            avatar: getAvatar(userId),
        },
        rating,
        title: faker.lorem.words(faker.number.int({ min: 2, max: 6 })),
        comment,
        tripType: faker.helpers.arrayElement(Object.values(TRAVEL_TYPE)),
        travelDate: faker.date.past({ years: 1 }).toISOString(),
        isVerified: faker.datatype.boolean({ probability: 0.8 }),
        isApproved: faker.datatype.boolean({ probability: 0.9 }),
        helpfulCount: faker.number.int({ min: 0, max: faker.helpers.arrayElement([10, 20, 50, 100]) }),
        createdAt: faker.date.between({ from: "2022-01-01", to: new Date() }).toISOString(),
        updatedAt: faker.date.recent({ days: 30 }).toISOString(),
        replies, // 🔹 include generated replies
    };
}

/** Safe integer parsing */
function parseIntOrDefault(value: string | null, fallback: number) {
    const n = value ? parseInt(value, 10) : NaN;
    return Number.isNaN(n) ? fallback : n;
}

/** GET handler: returns paginated reviews in a consistent format */
export async function GET(
    req: Request,
    { params }: { params: Promise<{ companyId: string; tourId: string }> } // Note: params is now a Promise
) {
    try {
        // Await the params since they're now a Promise
        const awaitedParams = await params;
        const { companyId, tourId } = awaitedParams;

        const url = new URL(req.url);
        const page = parseIntOrDefault(url.searchParams.get("page"), 1);
        const limit = parseIntOrDefault(url.searchParams.get("limit"), 10);

        // Fix: Use string methods instead of spread operator
        // const seed = [...tourId].reduce((acc, ch) => acc + ch.charCodeAt(0), 0); // Old way
        const seed = Array.from(tourId).reduce((acc, ch) => acc + ch.charCodeAt(0), 0); // Fixed way

        faker.seed(seed);

        const reviewCount = faker.number.int({ min: 40, max: 200 });
        const allReviews = Array.from({ length: reviewCount }, () => generateRandomReview(tourId));

        const total = allReviews.length;
        const pages = Math.max(1, Math.ceil(total / limit));
        const normalizedPage = Math.min(Math.max(page, 1), pages);

        const docs = allReviews.slice((normalizedPage - 1) * limit, normalizedPage * limit);

        // Aggregated summary
        const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = Number((totalRating / total).toFixed(1));

        const ratingBreakdown = [1, 2, 3, 4, 5].reduce((acc, val) => {
            acc[val as 1 | 2 | 3 | 4 | 5] = allReviews.filter(r => r.rating === val).length;
            return acc;
        }, {} as Record<1 | 2 | 3 | 4 | 5, number>);

        const isApproved = allReviews.filter(r => r.isVerified).length;

        const data: TourReviewsResponseDTO = {
            companyId,
            tourId,
            summary: {
                totalReviews: total,
                averageRating,
                isApproved,
                ratingBreakdown,
            },
            docs,
            total,
            page: normalizedPage,
            pages,
        };

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("Error in reviews API:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
                stack: process.env.NODE_ENV === "development" ? error : undefined
            },
            { status: 500 }
        );
    }
}