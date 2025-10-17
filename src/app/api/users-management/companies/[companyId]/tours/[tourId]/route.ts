// /api/users-management/companies/[companyId]/tours/[tourId]/route.ts
import { NextResponse } from "next/server";
import { faker } from "@faker-js/faker";
import { TourDetailDTO } from "@/types/tour.types";
import {
    TOUR_STATUS,
    TRAVEL_TYPE,
    AUDIENCE_TYPE,
    CONTENT_CATEGORY,
    SEASON,
    TRANSPORT_MODE,
    PAYMENT_METHOD,
    DIFFICULTY_LEVEL,
} from "@/constants/tour.const";

function randomEnum<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomSubset<T>(arr: T[], count: number): T[] {
    return faker.helpers.shuffle(arr).slice(0, count);
}

// --- Helpers for nested structures ---
function generateGeoPoint() {
    return {
        type: "Point" as const,
        coordinates: [faker.location.longitude(), faker.location.latitude()] as [
            number,
            number,
        ],
    };
}

function generateMeetingPoint() {
    return {
        title: faker.lorem.words(2),
        description: faker.lorem.sentence(),
        location: {
            address: faker.location.streetAddress(),
            coordinates: generateGeoPoint(),
        },
        time: faker.date.future().toISOString(),
    };
}

function generateRoadMapPoint() {
    return {
        title: faker.lorem.words(2),
        description: faker.lorem.sentence(),
        imageId: faker.database.mongodbObjectId(),
        location: {
            address: faker.location.streetAddress(),
            coordinates: generateGeoPoint(),
        },
    };
}

function generateItineraryEntry(day: number) {
    return {
        day,
        title: faker.lorem.words(3),
        description: faker.lorem.sentences(),
        mealsProvided: faker.helpers.arrayElements(
            ["Breakfast", "Lunch", "Dinner"],
            faker.number.int({ min: 0, max: 3 })
        ),
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
        languagesSpoken: faker.helpers.arrayElements(
            ["English", "Spanish", "French"],
            1
        ),
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
        owner: faker.database.mongodbObjectId(),

        // Marketing
        highlights: [faker.lorem.words(2), faker.lorem.words(2)],
        description: faker.lorem.paragraph(),

        // Includes / Info
        includes: [{ label: "Hotel pickup", included: true }],
        importantInfo: [faker.lorem.sentence()],

        // Logistics
        meetingPoints: Array.from({ length: 2 }, generateMeetingPoint),
        activities: [faker.word.noun(), faker.word.noun()],
        tags: [faker.word.noun(), faker.word.noun()],
        travelTypes: randomSubset(Object.values(TRAVEL_TYPE), 2),
        difficulty: randomEnum(Object.values(DIFFICULTY_LEVEL)),
        category: faker.helpers.arrayElement(["Adventure", "Cultural", "Leisure"]),
        subCategory: faker.helpers.arrayElement(["Hiking", "City Tour", "Safari"]),

        // 🆕 New domain fields
        audience: randomSubset(Object.values(AUDIENCE_TYPE), 2),
        categories: randomSubset(Object.values(CONTENT_CATEGORY), 2),
        bestSeason: randomSubset(Object.values(SEASON), 2),
        transportModes: randomSubset(Object.values(TRANSPORT_MODE), 2),
        pickupOptions: [
            { city: faker.location.city(), price: 20, currency: "USD" },
            { city: faker.location.city(), price: 50, currency: "USD" },
        ],
        mainLocation: {
            address: {
                line1: faker.location.streetAddress(),
                city: faker.location.city(),
                district: faker.location.state(),
                region: faker.location.state(),
                country: "Bangladesh",
                postalCode: faker.location.zipCode(),
            },
            coordinates: generateGeoPoint(),
        },

        // Pricing & Discounts
        priceOptions: [
            { name: "Standard", amount: 200, currency: "USD" },
            { name: "Premium", amount: 400, currency: "USD" },
        ],
        discounts: [
            { code: "SUMMER23", percentage: 10, description: "Summer special" },
        ],
        priceSummary: { minAmount: 200, maxAmount: 400, currency: "USD" },

        // Schedule & Booking
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        durationDays: Math.ceil(
            (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        ),
        bookingDeadline: faker.date.soon({ days: 7 }).toISOString(),
        maxGroupSize,
        repeatCount: 1,
        booking: {
            userIds: Array.from({ length: bookingCount }, () =>
                faker.database.mongodbObjectId()
            ),
            count: bookingCount,
            isFull: bookingCount >= maxGroupSize,
            remaining: maxGroupSize - bookingCount,
        },

        // Policies
        cancellationPolicy: {
            freeCancellationUntil: faker.date.soon().toISOString(),
            refundPercentage: 80,
            notes: "Up to 1 day before start",
        },
        refundPolicy: {
            method: randomSubset(Object.values(PAYMENT_METHOD), 2),
            processingDays: faker.number.int({ min: 1, max: 7 }),
        },
        ageRestriction: { minAge: 18, maxAge: 60 },

        // Engagement & Analytics
        wishlistCount: faker.number.int({ min: 0, max: 5000 }),
        popularityScore: faker.number.float({ min: 0, max: 1, fractionDigits: 2 }),
        featured: faker.datatype.boolean(),
        trendingUntil: faker.date.future().toISOString(),
        viewCount: faker.number.int({ min: 100, max: 10000 }),
        likeCount: faker.number.int({ min: 10, max: 5000 }),
        shareCount: faker.number.int({ min: 5, max: 2000 }),
        terms: faker.lorem.paragraph(),

        // Relations
        reviewCount: faker.number.int({ min: 0, max: 200 }),
        reportCount: faker.number.int({ min: 0, max: 20 }),
        averageRating: faker.number.float({ min: 3, max: 5, fractionDigits: 1 }),

        // Media
        imageIds: [
            faker.database.mongodbObjectId(),
            faker.database.mongodbObjectId(),
        ],
        heroImageId: faker.database.mongodbObjectId(),
        galleryImageIds: [faker.database.mongodbObjectId()],
        videoUrls: [faker.internet.url()],
        virtualTourUrl: faker.internet.url(),

        // Content & Structure
        roadMap: Array.from({ length: 3 }, generateRoadMapPoint),
        itinerary: Array.from({ length: 3 }, (_, i) =>
            generateItineraryEntry(i + 1)
        ),
        packingList: [
            { item: "Backpack", required: true },
            { item: "Sunscreen", required: false, notes: "Optional but recommended" },
        ],
        faqs: Array.from({ length: 3 }, () =>
            generateFAQ(faker.database.mongodbObjectId())
        ),

        // People & Safety
        host: generateHost(),
        healthAndSafety: [{ title: "COVID-19", description: "Masks recommended" }],
        accessibilityFeatures: ["Wheelchair accessible"],
        accessibilityRating: 4,
        emergencyContact: {
            phone: faker.phone.number(),
            email: faker.internet.email(),
        },

        // Seasonal / Tips
        weatherTips: ["Raincoat recommended", "Sunscreen required"],
        seasonalHighlights: [
            {
                season: "Summer",
                description: "Ideal for hiking",
                imageId: faker.database.mongodbObjectId(),
            },
        ],

        // 🆕 Translations
        translations: [
            {
                language: "en",
                title: faker.lorem.words(4),
                summary: faker.lorem.sentence(),
                content: [
                    { type: "paragraph", text: faker.lorem.paragraph() },
                    { type: "link", text: "Learn more", href: faker.internet.url() },
                ],
            },
            {
                language: "bn",
                title: "বাংলায় ট্যুর শিরোনাম",
                summary: "বাংলা সারসংক্ষেপ",
                content: [{ type: "paragraph", text: "এটি একটি বাংলা বর্ণনা।" }],
            },
        ],

        // SEO
        seoTitle: faker.lorem.sentence(),
        seoDescription: faker.lorem.sentence(),

        // System
        createdAt: faker.date.past().toISOString(),
        updatedAt: faker.date.recent().toISOString(),
        serverNow: new Date().toISOString(),
    };

    return NextResponse.json({ data: tour });
}
