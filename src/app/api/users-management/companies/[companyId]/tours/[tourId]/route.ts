// \api\users-management\companies\[companyId]\tours\[tourId]\route.ts
import { NextResponse } from "next/server";
import { faker } from "@faker-js/faker";
import { TourDetailDTO } from "@/types/tour.types";
import { TOUR_STATUS, TRAVEL_TYPE } from "@/constants/tour.const";

function randomEnum<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

// --- Helpers for nested types ---
function generateGeoPoint() {
    return {
        type: "Point" as const,
        coordinates: [faker.location.longitude(), faker.location.latitude()] as [number, number],
    };
}

function generateMeetingPoint() {
    return {
        title: faker.lorem.words(2),
        description: faker.lorem.sentence(),
        location: { address: faker.location.streetAddress(), coordinates: generateGeoPoint() },
        time: faker.date.future().toISOString(),
    };
}

function generateRoadMapPoint() {
    return {
        title: faker.lorem.words(2),
        description: faker.lorem.sentence(),
        imageId: faker.database.mongodbObjectId(),
        location: { address: faker.location.streetAddress(), coordinates: generateGeoPoint() },
    };
}

function generateItineraryEntry(day: number) {
    return {
        day,
        title: faker.lorem.words(3),
        description: faker.lorem.sentences(),
        mealsProvided: faker.helpers.arrayElements(["Breakfast", "Lunch", "Dinner"], faker.number.int({ min: 0, max: 3 })),
        accommodation: faker.company.name(),
        activities: [faker.word.noun()],
        imageIds: [faker.database.mongodbObjectId()],
    };
}

function generateFAQ(id: string) {
    return {
        id,
        question: faker.lorem.sentence(),
        answer: faker.lorem.sentence(),
        isAnswered: true,
        order: faker.number.int({ min: 1, max: 10 }),
    };
}

function generateHost() {
    return {
        name: faker.person.fullName(),
        bio: faker.lorem.sentences(),
        avatarId: faker.database.mongodbObjectId(),
        languagesSpoken: faker.helpers.arrayElements(["English", "Spanish", "French"], 1),
        rating: faker.number.float({ min: 3, max: 5, fractionDigits: 1 }),
    };
}

export async function GET(
    req: Request,
    { params }: { params: { companyId: string; tourId: string } }
) {
    const startDate = faker.date.future();
    const endDate = faker.date.soon({
        days: faker.number.int({ min: 3, max: 14 }),
        refDate: startDate,
    });
    const maxGroupSize = faker.number.int({ min: 10, max: 50 });
    const bookingCount = faker.number.int({ min: 0, max: maxGroupSize });

    const tour: TourDetailDTO = {
        id: (await params).tourId,
        title: faker.lorem.words(4),
        slug: faker.lorem.slug(),
        status: randomEnum(Object.values(TOUR_STATUS)),
        highlights: [faker.lorem.words(2), faker.lorem.words(2)],
        description: faker.lorem.paragraph(),
        includes: [{ label: "Hotel pickup", included: true }],
        importantInfo: [faker.lorem.sentence()],
        meetingPoints: Array.from({ length: 2 }, generateMeetingPoint),
        activities: [faker.word.noun(), faker.word.noun()],
        tags: [faker.word.noun(), faker.word.noun()],
        travelTypes: [randomEnum(Object.values(TRAVEL_TYPE))],
        difficulty: randomEnum(["easy", "moderate", "challenging"]),
        category: faker.helpers.arrayElement(["Adventure", "Cultural", "Leisure"]),
        subCategory: faker.helpers.arrayElement(["Hiking", "City Tour", "Safari"]),
        priceOptions: [
            { name: "Standard", amount: 200, currency: "USD" },
            { name: "Premium", amount: 400, currency: "USD" },
        ],
        discounts: [
            { code: "SUMMER23", percentage: 10, description: "Summer special" },
        ],
        priceSummary: { minAmount: 200, maxAmount: 400, currency: "USD" },
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        durationDays: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
        maxGroupSize,
        repeatCount: 1,
        booking: {
            userIds: Array.from({ length: bookingCount }, () => faker.database.mongodbObjectId()),
            count: bookingCount,
            isFull: bookingCount >= maxGroupSize,
            remaining: maxGroupSize - bookingCount,
        },
        cancellationPolicy: { freeCancellationUntil: faker.date.soon().toISOString(), refundPercentage: 80, notes: "Up to 1 day before start" },
        ageRestriction: { minAge: 18, maxAge: 60 },
        reviewCount: faker.number.int({ min: 0, max: 200 }),
        reportCount: faker.number.int({ min: 0, max: 20 }),
        averageRating: faker.number.float({ min: 3, max: 5, fractionDigits: 1 }),
        imageIds: [faker.database.mongodbObjectId(), faker.database.mongodbObjectId()],
        heroImageId: faker.database.mongodbObjectId(),
        galleryImageIds: [faker.database.mongodbObjectId()],
        videoUrls: [faker.internet.url()],
        virtualTourUrl: faker.internet.url(),
        roadMap: Array.from({ length: 3 }, generateRoadMapPoint),
        itinerary: Array.from({ length: 3 }, (_, i) => generateItineraryEntry(i + 1)),
        packingList: [
            { item: "Backpack", required: true },
            { item: "Sunscreen", required: false, notes: "Optional but recommended" },
        ],
        faqs: Array.from({ length: 3 }, () => generateFAQ(faker.database.mongodbObjectId())),
        host: generateHost(),
        healthAndSafety: [{ title: "COVID-19", description: "Masks recommended" }],
        accessibilityFeatures: ["Wheelchair accessible"],
        accessibilityRating: 4,
        emergencyContact: { phone: faker.phone.number(), email: faker.internet.email() },
        weatherTips: ["Raincoat recommended", "Sunscreen required"],
        seasonalHighlights: [
            { season: "Summer", description: "Ideal for hiking", imageId: faker.database.mongodbObjectId() },
        ],
        seoTitle: faker.lorem.sentence(),
        seoDescription: faker.lorem.sentence(),
        createdAt: faker.date.past().toISOString(),
        updatedAt: faker.date.recent().toISOString(),
        serverNow: new Date().toISOString(),
    };

    return NextResponse.json({ data: tour });
}
