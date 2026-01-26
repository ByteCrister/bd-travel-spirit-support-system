import { NextResponse } from "next/server";
import { faker } from "@faker-js/faker";
import { TourDetailDTO } from "@/types/tour.types";
import {
    TOUR_STATUS,
    TRAVEL_TYPE,
    AUDIENCE_TYPE,
    TOUR_CATEGORIES,
    SEASON,
    TRANSPORT_MODE,
    PAYMENT_METHOD,
    DIFFICULTY_LEVEL,
    MODERATION_STATUS,
    AGE_SUITABILITY,
    TOUR_DISCOUNT,
    CURRENCY,
    MEALS_PROVIDED,
    ACCOMMODATION_TYPE,
    DIVISION,
    DISTRICT,
    Currency,
} from "@/constants/tour.const";

// --- Helpers ---
function generateImageIds(prefix: string, count = 3): { id: string; url: string }[] {
    return Array.from({ length: count }, (_, i) => ({
        id: faker.database.mongodbObjectId(),
        url: `https://picsum.photos/seed/${prefix}-${i}/800/600`,
    }));
}

function randomEnum<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomSubset<T>(arr: T[], count: number): T[] {
    return faker.helpers.shuffle(arr).slice(0, count);
}

function generateGeoPoint(): { lat: number; lng: number } {
    return {
        lat: faker.location.latitude(),
        lng: faker.location.longitude(),
    };
}

function generatePriceDTO(): { amount: number; currency: Currency } {
    return {
        amount: faker.number.int({ min: 1000, max: 10000 }),
        currency: randomEnum(Object.values(CURRENCY)),
    };
}

function generateAttractionDTO() {
    return {
        id: faker.database.mongodbObjectId(),
        title: faker.lorem.words(3),
        description: faker.lorem.sentence(),
        bestFor: faker.lorem.words(2),
        insiderTip: faker.lorem.sentence(),
        address: faker.location.streetAddress(),
        openingHours: "9:00 AM - 6:00 PM",
        imageIds: generateImageIds("attraction", 2),
        coordinates: generateGeoPoint(),
    };
}

function generateDestinationBlockDTO() {
    return {
        id: faker.database.mongodbObjectId(),
        description: faker.lorem.paragraph(),
        highlights: [faker.lorem.words(3), faker.lorem.words(3)],
        attractions: Array.from({ length: 2 }, () => generateAttractionDTO()),
        activities: [
            {
                title: faker.lorem.words(2),
                url: faker.internet.url(),
                provider: faker.company.name(),
                duration: "2 hours",
                price: generatePriceDTO(),
                rating: faker.number.float({ min: 3, max: 5, fractionDigits: 1 }),
            },
        ],
        imageIds: generateImageIds("destination", 3),
        coordinates: generateGeoPoint(),
    };
}

function generateItineraryEntryDTO(day: number) {
    return {
        day,
        title: faker.lorem.words(3),
        description: faker.lorem.paragraph(),
        mealsProvided: randomSubset(Object.values(MEALS_PROVIDED), 2),
        accommodation: faker.company.name(),
        activities: [faker.lorem.word(), faker.lorem.word()],
        travelDistance: `${faker.number.int({ min: 10, max: 200 })} km`,
        travelMode: randomEnum(Object.values(TRANSPORT_MODE)),
        estimatedTime: "2-3 hours",
        importantNotes: [faker.lorem.sentence(), faker.lorem.sentence()],
    };
}

function generateInclusionDTO() {
    return {
        label: faker.lorem.words(2),
        description: faker.lorem.sentence(),
    };
}

function generateExclusionDTO() {
    return {
        label: faker.lorem.words(2),
        description: faker.lorem.sentence(),
    };
}

function generateOperatingWindowDTO() {
    const startDate = faker.date.future();
    const endDate = faker.date.soon({ days: 7, refDate: startDate });

    return {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        seatsTotal: faker.number.int({ min: 10, max: 50 }),
        seatsBooked: faker.number.int({ min: 0, max: 30 }),
    };
}

function generateDepartureDTO() {
    const date = faker.date.future();
    const seatsTotal = faker.number.int({ min: 10, max: 30 });
    const seatsBooked = faker.number.int({ min: 0, max: seatsTotal });

    return {
        date: date.toISOString(),
        seatsTotal,
        seatsBooked,
        meetingPoint: faker.location.streetAddress(),
        meetingCoordinates: generateGeoPoint(),
    };
}

function generateCancellationRuleDTO() {
    return {
        daysBefore: faker.number.int({ min: 1, max: 30 }),
        refundPercent: faker.number.int({ min: 0, max: 100 }),
    };
}

export async function GET(
    req: Request,
    { params }: { params: Promise<{ tourId: string }> }
) {
    const { tourId } = await params;
    const authorId = faker.database.mongodbObjectId();
    const createdAt = faker.date.past().toISOString();
    const updatedAt = faker.date.recent().toISOString();
    const publishedAt = faker.date.recent().toISOString();

    const basePrice = generatePriceDTO();
    const seatsTotal = faker.number.int({ min: 20, max: 100 });
    const seatsBooked = faker.number.int({ min: 0, max: seatsTotal });
    const hasActiveDiscount = faker.datatype.boolean();

    const tour: TourDetailDTO = {
        // =============== IDENTITY & BASIC INFO ===============
        id: tourId,
        title: faker.lorem.words(4),
        slug: faker.lorem.slug(),
        status: randomEnum(Object.values(TOUR_STATUS)),
        summary: faker.lorem.paragraph(),
        heroImage: `https://picsum.photos/seed/hero-${faker.number.int({ min: 1, max: 1000 })}/1200/800`,
        gallery: Array.from({ length: 3 }, () =>
            `https://picsum.photos/seed/gallery-${faker.number.int({ min: 1, max: 1000 })}/800/600`
        ),
        seo: {
            metaTitle: faker.lorem.sentence(),
            metaDescription: faker.lorem.paragraph(),
        },

        // =============== BANGLADESH-SPECIFIC FIELDS ===============
        tourType: randomEnum(Object.values(TRAVEL_TYPE)),
        division: randomEnum(Object.values(DIVISION)),
        district: randomEnum(Object.values(DISTRICT)),
        accommodationType: randomSubset(Object.values(ACCOMMODATION_TYPE), 2),
        guideIncluded: faker.datatype.boolean(),
        transportIncluded: faker.datatype.boolean(),
        emergencyContacts: {
            policeNumber: faker.phone.number(),
            ambulanceNumber: faker.phone.number(),
            fireServiceNumber: faker.phone.number(),
            localEmergency: faker.phone.number(),
        },

        // =============== CONTENT & ITINERARY ===============
        destinations: Array.from({ length: 3 }, () => generateDestinationBlockDTO()),
        itinerary: Array.from({ length: 5 }, (_, i) => generateItineraryEntryDTO(i + 1)),
        inclusions: Array.from({ length: 5 }, () => generateInclusionDTO()),
        exclusions: Array.from({ length: 3 }, () => generateExclusionDTO()),
        difficulty: randomEnum(Object.values(DIFFICULTY_LEVEL)),
        bestSeason: randomSubset(Object.values(SEASON), 3),
        audience: randomSubset(Object.values(AUDIENCE_TYPE), 2),
        categories: randomSubset(Object.values(TOUR_CATEGORIES), 2),
        translations: {
            bn: {
                title: "বাংলায় ট্যুর শিরোনাম",
                summary: "এটি বাংলা সারসংক্ষেপ",
                description: faker.lorem.paragraph(),
            },
            en: {
                title: faker.lorem.words(4),
                summary: faker.lorem.sentence(),
                description: faker.lorem.paragraph(),
            },
        },

        // =============== LOGISTICS ===============
        mainLocation: {
            address: {
                line1: faker.location.streetAddress(),
                city: faker.location.city(),
                district: randomEnum(Object.values(DISTRICT)),
                region: randomEnum(Object.values(DIVISION)),
                postalCode: faker.location.zipCode(),
            },
            coordinates: generateGeoPoint(),
        },
        transportModes: randomSubset(Object.values(TRANSPORT_MODE), 2),
        pickupOptions: [
            {
                city: faker.location.city(),
                price: faker.number.int({ min: 10, max: 100 }),
                currency: randomEnum(Object.values(CURRENCY)),
            },
        ],
        meetingPoint: faker.location.streetAddress(),
        packingList: [
            { item: "Backpack", required: true, notes: "Waterproof recommended" },
            { item: "Sunscreen", required: false, notes: "SPF 30+" },
            { item: "Water Bottle", required: true },
        ],

        // =============== PRICING & COMMERCE ===============
        basePrice,
        discounts: hasActiveDiscount ? [
            {
                type: randomEnum(Object.values(TOUR_DISCOUNT)),
                value: faker.number.int({ min: 5, max: 20 }),
                code: faker.word.noun().toUpperCase(),
                validFrom: faker.date.past().toISOString(),
                validUntil: faker.date.future().toISOString(),
            },
        ] : undefined,
        duration: {
            days: faker.number.int({ min: 3, max: 10 }),
            nights: faker.number.int({ min: 2, max: 9 }),
        },
        operatingWindows: Array.from({ length: 2 }, () => generateOperatingWindowDTO()),
        departures: Array.from({ length: 3 }, () => generateDepartureDTO()),
        paymentMethods: randomSubset(Object.values(PAYMENT_METHOD), 3),

        // =============== COMPLIANCE & ACCESSIBILITY ===============
        licenseRequired: faker.datatype.boolean(),
        ageSuitability: randomEnum(Object.values(AGE_SUITABILITY)),
        accessibility: {
            wheelchair: faker.datatype.boolean(),
            familyFriendly: faker.datatype.boolean(),
            petFriendly: faker.datatype.boolean(),
            notes: faker.lorem.sentence(),
        },

        // =============== POLICIES ===============
        cancellationPolicy: {
            refundable: faker.datatype.boolean(),
            rules: Array.from({ length: 3 }, () => generateCancellationRuleDTO()),
        },
        refundPolicy: {
            method: randomSubset(Object.values(PAYMENT_METHOD), 2),
            processingDays: faker.number.int({ min: 3, max: 14 }),
        },
        terms: faker.lorem.paragraphs(3),

        // =============== ENGAGEMENT & RATINGS ===============
        ratings: {
            average: faker.number.float({ min: 3.5, max: 5, fractionDigits: 1 }),
            count: faker.number.int({ min: 10, max: 500 }),
        },
        wishlistCount: faker.number.int({ min: 0, max: 1000 }),
        featured: faker.datatype.boolean(),

        // =============== MODERATION ===============
        moderationStatus: randomEnum(Object.values(MODERATION_STATUS)),
        rejectionReason: faker.datatype.boolean() ? faker.lorem.sentence() : undefined,
        completedAt: faker.datatype.boolean() ? faker.date.recent().toISOString() : undefined,
        reApprovalRequestedAt: faker.datatype.boolean() ? faker.date.recent().toISOString() : undefined,

        // =============== SYSTEM FIELDS ===============
        companyId: "4hgf983h4t9h349gf39fj4f82",
        authorId,
        tags: [faker.word.noun(), faker.word.noun()],
        publishedAt,
        viewCount: faker.number.int({ min: 100, max: 10000 }),
        likeCount: faker.number.int({ min: 10, max: 1000 }),
        shareCount: faker.number.int({ min: 5, max: 500 }),
        createdAt,
        updatedAt,
        deletedAt: faker.datatype.boolean() ? faker.date.recent().toISOString() : undefined,

        // =============== COMPUTED/UI-ONLY FIELDS ===============
        priceSummary: {
            minAmount: basePrice.amount,
            maxAmount: basePrice.amount + 500,
            currency: basePrice.currency,
            discountedAmount: hasActiveDiscount ? basePrice.amount * 0.8 : undefined,
        },
        bookingSummary: {
            totalSeats: seatsTotal,
            bookedSeats: seatsBooked,
            availableSeats: seatsTotal - seatsBooked,
            isFull: seatsBooked >= seatsTotal,
            occupancyPercentage: Math.round((seatsBooked / seatsTotal) * 100),
        },
        nextDeparture: faker.date.future().toISOString(),
        isUpcoming: faker.datatype.boolean(),
        isExpired: faker.datatype.boolean(),
        hasActiveDiscount,
    };

    return NextResponse.json({ data: tour });
}