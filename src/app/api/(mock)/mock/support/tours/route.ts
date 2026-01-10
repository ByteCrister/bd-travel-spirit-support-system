import { faker } from "@faker-js/faker";
import {
    TourDetailDTO,
    TourListItemDTO,
    TourFilterOptions,
} from "@/types/tour.types";
import {
    TourApprovalList,
    TourApprovalStats,
    TourApprovalResponse,
    TourApprovalRequest,
} from "@/types/tour-approval.types";
import {
    MODERATION_STATUS,
    TOUR_STATUS,
    TRAVEL_TYPE,
    DIVISION,
    DISTRICT,
    DIFFICULTY_LEVEL,
    CURRENCY,
    PAYMENT_METHOD,
    AUDIENCE_TYPE,
    TOUR_CATEGORIES,
    SEASON,
    ACCOMMODATION_TYPE,
    ModerationStatus,
    TourStatus,
    Division,
    District,
    TravelType,
    DifficultyLevel
} from "@/constants/tour.const";
import { NextRequest, NextResponse } from "next/server";

// Mock database of tours (in-memory)
let mockToursDatabase: TourDetailDTO[] = [];
let tourIdCounter = 1000;

// Helper functions
function generateRandomModerationStatus(): ModerationStatus {
    const weights = {
        [MODERATION_STATUS.PENDING]: 40, // 40% pending
        [MODERATION_STATUS.APPROVED]: 30, // 30% approved
        [MODERATION_STATUS.DENIED]: 20, // 20% denied
        [MODERATION_STATUS.SUSPENDED]: 10, // 10% suspended
    };

    const total = Object.values(weights).reduce((a, b) => a + b, 0);
    let random = Math.random() * total;

    for (const [status, weight] of Object.entries(weights)) {
        random -= weight;
        if (random <= 0) {
            return status as ModerationStatus;
        }
    }

    return MODERATION_STATUS.PENDING;
}

function generateRandomTourStatus(moderationStatus: ModerationStatus): TourStatus {
    if (moderationStatus === MODERATION_STATUS.APPROVED) {
        const weights = {
            [TOUR_STATUS.ACTIVE]: 80, // 80% active if approved
            [TOUR_STATUS.COMPLETED]: 15, // 15% completed
            [TOUR_STATUS.ARCHIVED]: 5, // 5% archived
        };

        const total = Object.values(weights).reduce((a, b) => a + b, 0);
        let random = Math.random() * total;

        for (const [status, weight] of Object.entries(weights)) {
            random -= weight;
            if (random <= 0) {
                return status as TourStatus;
            }
        }
    }

    return TOUR_STATUS.SUBMITTED;
}

function generateTourDetailDTO(id: string): TourDetailDTO {
    const createdAt = faker.date.past({ years: 1 });
    const updatedAt = faker.date.between({ from: createdAt, to: new Date() });
    const moderationStatus = generateRandomModerationStatus();
    const status = generateRandomTourStatus(moderationStatus);
    const publishedAt =
        status === TOUR_STATUS.ACTIVE
            ? faker.date.between({ from: createdAt, to: updatedAt }).toISOString()
            : undefined;

    const basePrice = {
        amount: faker.number.int({ min: 1000, max: 10000 }),
        currency: CURRENCY.BDT,
    };

    const hasActiveDiscount = faker.datatype.boolean({ probability: 0.3 });
    const discounts = hasActiveDiscount
        ? [
            {
                type: faker.helpers.arrayElement([
                    "seasonal",
                    "early_bird",
                    "group",
                    "promo",
                ]),
                value: faker.number.int({ min: 5, max: 30 }),
                code: faker.word.noun().toUpperCase(),
                validFrom: faker.date.past().toISOString(),
                validUntil: faker.date.future().toISOString(),
            },
        ]
        : undefined;

    const seatsTotal = faker.number.int({ min: 10, max: 50 });
    const seatsBooked = faker.number.int({ min: 0, max: seatsTotal });
    const occupancyPercentage = Math.round((seatsBooked / seatsTotal) * 100);

    const nextDeparture = faker.date.future().toISOString();
    const isUpcoming = new Date(nextDeparture) > new Date();
    const isExpired = faker.datatype.boolean({ probability: 0.1 });

    return {
        // =============== IDENTITY & BASIC INFO ===============
        id,
        title: faker.lorem.words(faker.number.int({ min: 3, max: 7 })),
        slug: faker.lorem.slug(),
        status: status,
        summary: faker.lorem.paragraph(),
        heroImage: `https://picsum.photos/seed/tour-${id}/1200/800`,
        gallery: Array.from(
            { length: faker.number.int({ min: 3, max: 8 }) },
            (_, i) => `https://picsum.photos/seed/gallery-${id}-${i}/800/600`
        ),
        seo: {
            metaTitle: faker.lorem.sentence(),
            metaDescription: faker.lorem.paragraph(),
        },

        // =============== BANGLADESH-SPECIFIC FIELDS ===============
        tourType: faker.helpers.arrayElement(Object.values(TRAVEL_TYPE)),
        division: faker.helpers.arrayElement(Object.values(DIVISION)),
        district: faker.helpers.arrayElement(Object.values(DISTRICT)),
        accommodationType: faker.helpers.arrayElements(
            Object.values(ACCOMMODATION_TYPE),
            faker.number.int({ min: 1, max: 3 })
        ),
        guideIncluded: faker.datatype.boolean(),
        transportIncluded: faker.datatype.boolean(),
        emergencyContacts: {
            policeNumber: faker.phone.number(),
            ambulanceNumber: faker.phone.number(),
            fireServiceNumber: faker.phone.number(),
            localEmergency: faker.phone.number(),
        },

        // =============== CONTENT & ITINERARY ===============
        destinations: Array.from(
            { length: faker.number.int({ min: 2, max: 5 }) },
            () => ({
                id: faker.database.mongodbObjectId(),
                description: faker.lorem.paragraph(),
                highlights: [faker.lorem.sentence(), faker.lorem.sentence()],
                attractions: Array.from(
                    { length: faker.number.int({ min: 1, max: 3 }) },
                    () => ({
                        id: faker.database.mongodbObjectId(),
                        title: faker.lorem.words(3),
                        description: faker.lorem.sentence(),
                        bestFor: faker.lorem.words(2),
                        insiderTip: faker.lorem.sentence(),
                        address: faker.location.streetAddress(),
                        openingHours: "9:00 AM - 6:00 PM",
                        imageIds: Array.from(
                            { length: faker.number.int({ min: 1, max: 3 }) },
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            (_, i) => ({
                                id: faker.database.mongodbObjectId(),
                                url: `https://picsum.photos/seed/attraction-${faker.number.int({ min: 1, max: 1000 })}/600/400`,
                            })
                        ),
                        coordinates: {
                            lat: faker.location.latitude(),
                            lng: faker.location.longitude(),
                        },
                    })
                ),
                imageIds: Array.from(
                    { length: faker.number.int({ min: 2, max: 5 }) },
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    (_, i) => ({
                        id: faker.database.mongodbObjectId(),
                        url: `https://picsum.photos/seed/destination-${faker.number.int({ min: 1, max: 1000 })}/800/600`,
                    })
                ),
                coordinates: {
                    lat: faker.location.latitude(),
                    lng: faker.location.longitude(),
                },
            })
        ),
        itinerary: Array.from(
            { length: faker.number.int({ min: 3, max: 7 }) },
            (_, i) => ({
                day: i + 1,
                title: faker.lorem.words(3),
                description: faker.lorem.paragraph(),
                mealsProvided: faker.helpers.arrayElements(
                    ["Breakfast", "Lunch", "Dinner"],
                    faker.number.int({ min: 0, max: 3 })
                ),
                accommodation: faker.company.name(),
                activities: [faker.word.noun(), faker.word.noun()],
                travelDistance: `${faker.number.int({ min: 10, max: 200 })} km`,
                travelMode: faker.helpers.arrayElement([
                    "bus",
                    "train",
                    "domestic_flight",
                    "boat",
                    "private_car",
                ]),
                estimatedTime: `${faker.number.int({ min: 1, max: 8 })} hours`,
                importantNotes: [faker.lorem.sentence(), faker.lorem.sentence()],
            })
        ),
        inclusions: Array.from(
            { length: faker.number.int({ min: 5, max: 10 }) },
            () => ({
                label: faker.lorem.words(2),
                description: faker.lorem.sentence(),
            })
        ),
        exclusions: Array.from(
            { length: faker.number.int({ min: 3, max: 7 }) },
            () => ({
                label: faker.lorem.words(2),
                description: faker.lorem.sentence(),
            })
        ),
        difficulty: faker.helpers.arrayElement(Object.values(DIFFICULTY_LEVEL)),
        bestSeason: faker.helpers.arrayElements(
            Object.values(SEASON),
            faker.number.int({ min: 1, max: 3 })
        ),
        audience: faker.helpers.arrayElements(
            Object.values(AUDIENCE_TYPE),
            faker.number.int({ min: 1, max: 3 })
        ),
        categories: faker.helpers.arrayElements(
            Object.values(TOUR_CATEGORIES),
            faker.number.int({ min: 1, max: 3 })
        ),
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
                district: faker.helpers.arrayElement(Object.values(DISTRICT)),
                region: faker.helpers.arrayElement(Object.values(DIVISION)),
                postalCode: faker.location.zipCode(),
            },
            coordinates: {
                lat: faker.location.latitude(),
                lng: faker.location.longitude(),
            },
        },
        transportModes: faker.helpers.arrayElements(
            ["bus", "train", "boat", "private_car"],
            faker.number.int({ min: 1, max: 3 })
        ),
        pickupOptions: [
            {
                city: faker.location.city(),
                price: faker.number.int({ min: 10, max: 100 }),
                currency: CURRENCY.BDT,
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
        discounts,
        duration: {
            days: faker.number.int({ min: 3, max: 10 }),
            nights: faker.number.int({ min: 2, max: 9 }),
        },
        operatingWindows: Array.from(
            { length: faker.number.int({ min: 1, max: 3 }) },
            () => ({
                startDate: faker.date.future().toISOString(),
                endDate: faker.date.future().toISOString(),
                seatsTotal: faker.number.int({ min: 10, max: 30 }),
                seatsBooked: faker.number.int({ min: 0, max: 25 }),
            })
        ),
        departures: Array.from(
            { length: faker.number.int({ min: 3, max: 7 }) },
            () => ({
                date: faker.date.future().toISOString(),
                seatsTotal: faker.number.int({ min: 10, max: 30 }),
                seatsBooked: faker.number.int({ min: 0, max: 30 }),
                meetingPoint: faker.location.streetAddress(),
                meetingCoordinates: {
                    lat: faker.location.latitude(),
                    lng: faker.location.longitude(),
                },
            })
        ),
        paymentMethods: faker.helpers.arrayElements(
            Object.values(PAYMENT_METHOD),
            faker.number.int({ min: 2, max: 4 })
        ),

        // =============== COMPLIANCE & ACCESSIBILITY ===============
        licenseRequired: faker.datatype.boolean({ probability: 0.2 }),
        ageSuitability: faker.helpers.arrayElement([
            "all",
            "kids",
            "adults",
            "seniors",
        ]),
        accessibility: {
            wheelchair: faker.datatype.boolean(),
            familyFriendly: faker.datatype.boolean(),
            petFriendly: faker.datatype.boolean(),
            notes: faker.lorem.sentence(),
        },

        // =============== POLICIES ===============
        cancellationPolicy: {
            refundable: faker.datatype.boolean(),
            rules: Array.from(
                { length: faker.number.int({ min: 2, max: 4 }) },
                () => ({
                    daysBefore: faker.number.int({ min: 1, max: 30 }),
                    refundPercent: faker.number.int({ min: 0, max: 100 }),
                })
            ),
        },
        refundPolicy: {
            method: faker.helpers.arrayElements(Object.values(PAYMENT_METHOD), 2),
            processingDays: faker.number.int({ min: 3, max: 14 }),
        },
        terms: faker.lorem.paragraphs(3),

        // =============== ENGAGEMENT & RATINGS ===============
        ratings: {
            average: faker.number.float({ min: 3.5, max: 5, fractionDigits: 1 }),
            count: faker.number.int({ min: 10, max: 500 }),
        },
        wishlistCount: faker.number.int({ min: 0, max: 1000 }),
        featured: faker.datatype.boolean({ probability: 0.2 }),

        // =============== MODERATION ===============
        moderationStatus: moderationStatus,
        rejectionReason:
            moderationStatus === MODERATION_STATUS.DENIED
                ? faker.lorem.sentence()
                : undefined,
        completedAt:
            status === TOUR_STATUS.COMPLETED
                ? faker.date.recent().toISOString()
                : undefined,
        reApprovalRequestedAt: faker.datatype.boolean({ probability: 0.1 })
            ? faker.date.recent().toISOString()
            : undefined,

        // =============== SYSTEM FIELDS ===============
        companyId: faker.database.mongodbObjectId(),
        authorId: faker.database.mongodbObjectId(),
        tags: [faker.word.noun(), faker.word.noun(), faker.word.noun()],
        publishedAt,
        viewCount: faker.number.int({ min: 100, max: 10000 }),
        likeCount: faker.number.int({ min: 10, max: 1000 }),
        shareCount: faker.number.int({ min: 5, max: 500 }),
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt.toISOString(),
        deletedAt: faker.datatype.boolean({ probability: 0.05 })
            ? faker.date.recent().toISOString()
            : undefined,

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
            occupancyPercentage,
        },
        nextDeparture,
        isUpcoming,
        isExpired,
        hasActiveDiscount,
    };
}

function convertToTourListItemDTO(tour: TourDetailDTO): TourListItemDTO {
    return {
        id: tour.id,
        title: tour.title,
        slug: tour.slug,
        status: tour.status,
        summary: tour.summary,
        heroImage: tour.heroImage,

        // Basic info
        tourType: tour.tourType,
        division: tour.division,
        district: tour.district,
        difficulty: tour.difficulty,

        // Pricing
        basePrice: tour.basePrice,
        hasActiveDiscount: tour.hasActiveDiscount,
        activeDiscountValue: tour.discounts?.[0]?.value,

        // Schedule
        duration: tour.duration,
        nextDeparture: tour.nextDeparture,

        // Stats
        ratings: tour.ratings,
        wishlistCount: tour.wishlistCount,
        viewCount: tour.viewCount,
        likeCount: tour.likeCount,
        shareCount: tour.shareCount,

        // Moderation
        moderationStatus: tour.moderationStatus,
        featured: tour.featured,

        // System
        companyId: tour.companyId,
        authorId: tour.authorId,
        publishedAt: tour.publishedAt,
        createdAt: tour.createdAt,
        updatedAt: tour.updatedAt,

        // Computed fields
        isUpcoming: tour.isUpcoming,
        isExpired: tour.isExpired,
        occupancyPercentage: tour.bookingSummary?.occupancyPercentage,
    };
}

// Helper to parse array query parameters
function parseArrayParam(param: string | null): string[] | undefined {
    if (!param) return undefined;
    return param.split(',').filter(item => item.trim() !== '');
}

// Helper to parse number query parameters
function parseNumberParam(param: string | null): number | undefined {
    if (!param) return undefined;
    const num = Number(param);
    return isNaN(num) ? undefined : num;
}

function filterTours(
    tours: TourDetailDTO[],
    filters: Partial<TourFilterOptions>,
    page: number,
    limit: number
): { filtered: TourDetailDTO[]; total: number; stats: TourApprovalStats } {
    let filteredTours = [...tours];

    // Apply filters
    // 1. Text search filter
    if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredTours = filteredTours.filter(
            (tour) =>
                tour.title.toLowerCase().includes(searchLower) ||
                tour.summary.toLowerCase().includes(searchLower) ||
                tour.slug.toLowerCase().includes(searchLower)
        );
    }

    // 2. Division filter (array)
    if (filters.division && filters.division.length > 0) {
        filteredTours = filteredTours.filter((tour) =>
            filters.division!.includes(tour.division)
        );
    }

    // 3. District filter (array)
    if (filters.district && filters.district.length > 0) {
        filteredTours = filteredTours.filter((tour) =>
            filters.district!.includes(tour.district)
        );
    }

    // 4. Tour Type filter (array)
    if (filters.tourType && filters.tourType.length > 0) {
        filteredTours = filteredTours.filter((tour) =>
            filters.tourType!.includes(tour.tourType)
        );
    }

    // 5. Difficulty filter (array)
    if (filters.difficulty && filters.difficulty.length > 0) {
        filteredTours = filteredTours.filter((tour) =>
            filters.difficulty!.includes(tour.difficulty)
        );
    }

    // 15. Status filter (array)
    if (filters.status && filters.status.length > 0) {
        filteredTours = filteredTours.filter((tour) =>
            filters.status!.includes(tour.status)
        );
    }

    // 16. Moderation Status filter (array)
    if (filters.moderationStatus && filters.moderationStatus.length > 0) {
        filteredTours = filteredTours.filter((tour) =>
            filters.moderationStatus!.includes(tour.moderationStatus)
        );
    }

    // Calculate stats based on the original database
    const stats: TourApprovalStats = {
        pending: tours.filter(
            (t) => t.moderationStatus === MODERATION_STATUS.PENDING
        ).length,
        approved: tours.filter(
            (t) => t.moderationStatus === MODERATION_STATUS.APPROVED
        ).length,
        rejected: tours.filter(
            (t) => t.moderationStatus === MODERATION_STATUS.DENIED
        ).length,
        suspended: tours.filter(
            (t) => t.moderationStatus === MODERATION_STATUS.SUSPENDED
        ).length,
        total: tours.length,
    };

    // Paginate
    const total = filteredTours.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTours = filteredTours.slice(startIndex, endIndex);

    return {
        filtered: paginatedTours,
        total,
        stats,
    };
}

// Initialize mock database
function initializeMockDatabase(count: number = 100): void {
    mockToursDatabase = [];
    for (let i = 0; i < count; i++) {
        const tourId = `tour_${tourIdCounter++}`;
        mockToursDatabase.push(generateTourDetailDTO(tourId));
    }
}

// POST handler for approval actions
export async function POST(
    req: NextRequest,
    { params }: { params: { tourId: string } }
) {
    try {
        const { tourId } = params;
        const body = await req.json();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { action, reason, suspensionDuration }: TourApprovalRequest = body;

        // Initialize mock DB once
        if (mockToursDatabase.length === 0) {
            initializeMockDatabase();
        }

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 400));

        const index = mockToursDatabase.findIndex((t) => t.id === tourId);

        if (index === -1) {
            return NextResponse.json(
                { error: `Tour with ID ${tourId} not found` },
                { status: 404 }
            );
        }

        const tour = mockToursDatabase[index];
        let updatedTour = { ...tour };

        // Update based on action
        switch (action) {
            case MODERATION_STATUS.APPROVED:
                updatedTour = {
                    ...tour,
                    moderationStatus: MODERATION_STATUS.APPROVED,
                    status: TOUR_STATUS.ACTIVE,
                    rejectionReason: undefined,
                    updatedAt: new Date().toISOString(),
                    publishedAt: tour.publishedAt || new Date().toISOString(),
                };
                break;

            case MODERATION_STATUS.DENIED:
                if (!reason?.trim()) {
                    return NextResponse.json(
                        { error: "Rejection reason is required" },
                        { status: 400 }
                    );
                }
                updatedTour = {
                    ...tour,
                    moderationStatus: MODERATION_STATUS.DENIED,
                    rejectionReason: reason,
                    updatedAt: new Date().toISOString(),
                };
                break;

            case MODERATION_STATUS.SUSPENDED:
                if (!reason?.trim()) {
                    return NextResponse.json(
                        { error: "Suspension reason is required" },
                        { status: 400 }
                    );
                }
                updatedTour = {
                    ...tour,
                    moderationStatus: MODERATION_STATUS.SUSPENDED,
                    rejectionReason: reason,
                    updatedAt: new Date().toISOString(),
                };
                break;

            default:
                return NextResponse.json(
                    { error: `Invalid action: ${action}` },
                    { status: 400 }
                );
        }

        // Update in database
        mockToursDatabase[index] = updatedTour;

        const response: TourApprovalResponse = {
            success: true,
            message: `Tour "${tour.title}" has been ${action}${reason ? `: ${reason}` : ""
                }`,
            tour: updatedTour,
            updatedAt: new Date(),
        };

        return NextResponse.json({ data: response });
    } catch (error) {
        console.error("Error in POST handler:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// GET handler for fetching tours with filters
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);

    // Parse pagination parameters
    const page = parseNumberParam(searchParams.get("page")) || 1;
    const limit = parseNumberParam(searchParams.get("limit")) || 10;

    // Parse all filter parameters according to TourFilterOptions
    const filters: Partial<TourFilterOptions> = {
        search: searchParams.get("search") || undefined,
        division: parseArrayParam(searchParams.get("division")) as Division[],
        district: parseArrayParam(searchParams.get("district")) as District[],
        tourType: parseArrayParam(searchParams.get("tourType")) as TravelType[],
        difficulty: parseArrayParam(searchParams.get("difficulty")) as DifficultyLevel[],
        status: parseArrayParam(searchParams.get("status")) as TourStatus[],
        moderationStatus: parseArrayParam(searchParams.get("moderationStatus")) as ModerationStatus[],
    };

    // Clean up undefined values
    Object.keys(filters).forEach((key) => {
        if (filters[key as keyof TourFilterOptions] === undefined) {
            delete filters[key as keyof TourFilterOptions];
        }
    });

    // Initialize mock DB once
    if (mockToursDatabase.length === 0) {
        initializeMockDatabase();
    }

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Apply filtering + pagination
    const { filtered, total, stats } = filterTours(
        mockToursDatabase,
        filters,
        page,
        limit
    );

    const tours = filtered.map(convertToTourListItemDTO);
    const totalPages = Math.ceil(total / limit);

    const response: TourApprovalList = {
        tours,
        total,
        page,
        limit,
        totalPages,
        stats,
    };

    return NextResponse.json({
        data: response,
    });
}