// /api/users-management/companies/[companyId]/tours/route.ts
import { NextRequest, NextResponse } from "next/server";
import { faker } from "@faker-js/faker";
import {
  TourListItemDTO,
  SortableTourKeys,
} from "@/types/tour.types";
import {
  TOUR_STATUS,
  TRAVEL_TYPE,
//   AUDIENCE_TYPE,
//   TOUR_CATEGORIES,
  MODERATION_STATUS,
  DIFFICULTY_LEVEL,
  CURRENCY,
//   Season,
//   AccommodationType,
//   MealsProvided,
//   TransportMode,
  DIVISION,
  DISTRICT,
} from "@/constants/tour.const";

// --- Helper: pick random enum value ---
function randomEnum<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// --- Helper: pick random subset ---
// function randomSubset<T>(arr: T[], count: number): T[] {
//   return faker.helpers.shuffle(arr).slice(0, count);
// }

// --- Generate one fake tour aligned with updated TourListItemDTO ---
function generateFakeTour(companyId: string): TourListItemDTO {
  const status = randomEnum(Object.values(TOUR_STATUS));
  const moderationStatus = randomEnum(Object.values(MODERATION_STATUS));
  const difficulty = randomEnum(Object.values(DIFFICULTY_LEVEL));
  const tourType = randomEnum(Object.values(TRAVEL_TYPE));
  const division = randomEnum(Object.values(DIVISION));
  const district = randomEnum(Object.values(DISTRICT));
  
  const basePrice = {
    amount: faker.number.int({ min: 1000, max: 10000 }),
    currency: CURRENCY.BDT,
  };

  const durationDays = faker.number.int({ min: 1, max: 14 });
  const nextDeparture = faker.date.soon({ days: 30 });
  
  const ratings = {
    average: faker.number.float({ min: 3, max: 5, fractionDigits: 1 }),
    count: faker.number.int({ min: 0, max: 300 }),
  };

  const createdAt = faker.date.past();
  const updatedAt = faker.date.recent();
  const publishedAt = status === TOUR_STATUS.ACTIVE ? faker.date.recent() : undefined;

  // Calculate computed fields
  const isUpcoming = faker.datatype.boolean();
  const isExpired = !isUpcoming && faker.datatype.boolean();
  const occupancyPercentage = faker.number.int({ min: 0, max: 100 });

  // Generate optional active discount
  const hasActiveDiscount = faker.datatype.boolean();
  const activeDiscountValue = hasActiveDiscount 
    ? faker.number.int({ min: 5, max: 30 })
    : undefined;

  return {
    id: faker.database.mongodbObjectId(),
    title: faker.lorem.words(3),
    slug: faker.helpers.slugify(faker.lorem.words(3)),
    status: status,
    summary: faker.lorem.sentences(2),
    heroImage: faker.image.url(),

    // Basic info
    tourType: tourType,
    division: division,
    district: district,
    difficulty: difficulty,

    // Pricing
    basePrice: basePrice,
    hasActiveDiscount: hasActiveDiscount,
    activeDiscountValue: activeDiscountValue,

    // Schedule
    duration: {
      days: durationDays,
      nights: durationDays > 1 ? durationDays - 1 : undefined,
    },
    nextDeparture: nextDeparture.toISOString(),

    // Stats
    ratings: ratings,
    wishlistCount: faker.number.int({ min: 0, max: 1000 }),
    viewCount: faker.number.int({ min: 100, max: 10000 }),
    likeCount: faker.number.int({ min: 10, max: 5000 }),
    shareCount: faker.number.int({ min: 5, max: 2000 }),

    // Moderation
    moderationStatus: moderationStatus,
    featured: faker.datatype.boolean(),

    // System
    companyId: companyId,
    authorId: faker.database.mongodbObjectId(),
    publishedAt: publishedAt?.toISOString(),
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),

    // Computed fields
    isUpcoming: isUpcoming,
    isExpired: isExpired,
    occupancyPercentage: occupancyPercentage,
  };
}

// --- Helper: get nested value from object by key path ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getNestedValue(obj: any, path: string) {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

// --- Handler ---
export async function GET(
  req: NextRequest,
  { params }: { params: { companyId: string } }
) {
  const { searchParams } = new URL(req.url);
  const { companyId } = await params;

  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 10);
  const sortParam = (searchParams.get("sort") as SortableTourKeys) || "createdAt";
  const order = (searchParams.get("order") as "asc" | "desc") || "desc";
  const search = searchParams.get("search")?.toLowerCase() || "";

  // Generate mock tours
  let tours = Array.from({ length: 200 }, () => generateFakeTour(companyId));

  // Filter by search
  if (search) {
    tours = tours.filter((t) => t.title.toLowerCase().includes(search));
  }

  // Sort
  tours.sort((a, b) => {
    const aVal = getNestedValue(a, sortParam);
    const bVal = getNestedValue(b, sortParam);

    // Handle undefined values
    if (aVal === undefined && bVal === undefined) return 0;
    if (aVal === undefined) return order === "asc" ? -1 : 1;
    if (bVal === undefined) return order === "asc" ? 1 : -1;

    // Compare based on type
    if (typeof aVal === "string" && typeof bVal === "string") {
      return order === "asc" 
        ? aVal.localeCompare(bVal) 
        : bVal.localeCompare(aVal);
    }
    if (typeof aVal === "number" && typeof bVal === "number") {
      return order === "asc" ? aVal - bVal : bVal - aVal;
    }
    if (aVal instanceof Date && bVal instanceof Date) {
      return order === "asc" 
        ? aVal.getTime() - bVal.getTime() 
        : bVal.getTime() - aVal.getTime();
    }
    // For ISO strings
    if (typeof aVal === "string" && typeof bVal === "string") {
      const aDate = new Date(aVal);
      const bDate = new Date(bVal);
      if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
        return order === "asc" 
          ? aDate.getTime() - bDate.getTime() 
          : bDate.getTime() - aDate.getTime();
      }
    }
    return 0;
  });

  // Paginate
  const total = tours.length;
  const pages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const pagedTours = tours.slice(start, start + limit);

  // Response
  return NextResponse.json({
    companyId: companyId,
    data: {
      docs: pagedTours,
      total,
      page,
      pages,
    },
  });
}