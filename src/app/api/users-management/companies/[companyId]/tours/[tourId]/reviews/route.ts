import { NextResponse } from "next/server";
import { faker } from "@faker-js/faker";
import { ReviewsPageDTO } from "@/types/reviews.types";

function generateRandomReview() {
    // Random comment length variation
    const commentLengthType = faker.helpers.arrayElement(["short", "medium", "long"]);
    const commentExcerpt =
        commentLengthType === "short"
            ? faker.lorem.words(faker.number.int({ min: 3, max: 8 }))
            : commentLengthType === "medium"
                ? faker.lorem.sentences(faker.number.int({ min: 1, max: 2 }))
                : faker.lorem.paragraph(faker.number.int({ min: 1, max: 2 }));

    // Weighted rating distribution (more 4–5 stars)
    const rating = faker.helpers.weightedArrayElement([
        { weight: 5, value: 5 },
        { weight: 4, value: 4 },
        { weight: 2, value: 3 },
        { weight: 1, value: 2 },
        { weight: 1, value: 1 },
    ]);

    return {
        id: faker.database.mongodbObjectId(),
        tourId: faker.database.mongodbObjectId(),
        userId: faker.database.mongodbObjectId(),
        username: faker.internet.userName(),
        userImage: faker.image.avatar(),
        rating,
        commentExcerpt,
        isVerified: faker.datatype.boolean({ probability: 0.8 }), // 80% verified
        isApproved: faker.datatype.boolean({ probability: 0.9 }), // 90% approved
        helpfulCount: faker.number.int({ min: 0, max: faker.helpers.arrayElement([10, 20, 50, 100]) }),
        createdAt: faker.date.between({ from: "2022-01-01", to: new Date() }).toISOString(),
        updatedAt: faker.date.recent({ days: 30 }).toISOString(),
    };
}

export async function GET(
    req: Request,
    { params }: { params: { companyId: string; tourId: string } }
) {
    const reviews = Array.from({ length: faker.number.int({ min: 0, max: 200 }) }, generateRandomReview);

    const dto: ReviewsPageDTO = {
        companyId: params.companyId,
        tourId: params.tourId,
        table: {
            docs: reviews,
            total: reviews.length,
            page: 1,
            pages: 1,
        },
    };

    return NextResponse.json({ data: dto });
}
