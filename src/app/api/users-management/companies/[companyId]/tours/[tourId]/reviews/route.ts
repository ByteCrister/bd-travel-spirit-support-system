import { NextResponse } from "next/server";
import { faker } from "@faker-js/faker";
import { TRAVEL_TYPE } from "@/constants/tour.const";
import { TourReviewsResponseDTO } from "@/types/review.tour.response.type";

/** Helper: generate one fake review for a specific tour */
function getAvatar(userId: string) {
    // Use GitHub avatars as stable, real-looking avatars
    const numericId = parseInt(userId.slice(0, 6), 16) % 1000; // simple hash
    const gender = Math.random() > 0.5 ? "men" : "women";
    return `https://randomuser.me/api/portraits/${gender}/${numericId}.jpg`;
}

function generateRandomReview(tourId: string) {
    const commentLengthType = faker.helpers.arrayElement(["short", "medium", "long"]);
    const comment =
        commentLengthType === "short"
            ? faker.lorem.words(faker.number.int({ min: 5, max: 12 }))
            : commentLengthType === "medium"
                ? faker.lorem.sentences(faker.number.int({ min: 2, max: 4 }))
                : faker.lorem.paragraphs(faker.number.int({ min: 1, max: 2 }));

    const rating = faker.helpers.weightedArrayElement([
        { weight: 5, value: 5 },
        { weight: 4, value: 4 },
        { weight: 2, value: 3 },
        { weight: 1, value: 2 },
        { weight: 1, value: 1 },
    ]);

    return {
        id: faker.database.mongodbObjectId(),
        tourId,
        user: {
            id: faker.database.mongodbObjectId(),
            name: faker.person.fullName(),
            avatar: getAvatar(faker.database.mongodbObjectId()),
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
    };
}

/** Parse integer query param with fallback */
function parseIntOrDefault(value: string | null, fallback: number) {
    if (!value) return fallback;
    const n = parseInt(value, 10);
    return Number.isNaN(n) ? fallback : n;
}

/** GET handler: returns paginated reviews in the shape fetchReviews expects (docs, total, page, pages) */
export async function GET(
    req: Request,
    { params }: { params: { companyId: string; tourId: string } }
) {
    const url = new URL(req.url);
    const page = parseIntOrDefault(url.searchParams.get("page"), 1);
    const limit = parseIntOrDefault(url.searchParams.get("limit"), 10);
    const { companyId, tourId } = await params;

    // produce a stable count per tour so pagination behaves consistently during a run
    const seed = Number(BigInt.asIntN(32, BigInt(tourId.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0))));
    faker.seed(seed);

    const reviewCount = faker.number.int({ min: 20, max: 200 });
    const allReviews = Array.from({ length: reviewCount }, () => generateRandomReview(tourId));

    const total = allReviews.length;
    const pages = Math.max(1, Math.ceil(total / limit));
    const normalizedPage = Math.min(Math.max(1, page), pages);

    const start = (normalizedPage - 1) * limit;
    const end = start + limit;
    const docs = allReviews.slice(start, end);

    // aggregated summary computed from the full set (not just current page)
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = Number((totalRating / total).toFixed(1));

    const ratingBreakdown = [1, 2, 3, 4, 5].reduce((acc, val) => {
        acc[val as 1 | 2 | 3 | 4 | 5] = allReviews.filter(r => r.rating === val).length;
        return acc;
    }, {} as Record<1 | 2 | 3 | 4 | 5, number>);

    const verifiedCount = allReviews.filter(r => r.isVerified).length;

    const data: TourReviewsResponseDTO = {
        companyId: companyId,
        tourId: tourId,
        summary: {
            totalReviews: total,
            averageRating,
            verifiedCount,
            ratingBreakdown,
        },
        docs,
        total,
        page: normalizedPage,
        pages,
    };

    return NextResponse.json({ success: true, data });
}
