// api/users/companies/v1/[companyId]/tours/[tourId]/bookings/route.ts
import { NextRequest } from "next/server";
import { Types } from "mongoose";
import { withErrorHandler, ApiError } from "@/lib/helpers/withErrorHandler";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import { UserModel, IUser } from "@/models/user.model";
import { TravelerModel, ITraveler } from "@/models/travelers/traveler.model";
import TourModel from "@/models/tours/tour.model";
import BookingModel from "@/models/tours/booking.model";
import { BookingListItemDTO, TourBookingsResponseDTO } from "@/types/tour/tour-detail-booking.types";
import ConnectDB from "@/config/db";
import { sanitizeSearch } from "@/lib/helpers/sanitize-search";
import type { FilterQuery } from "mongoose";
import { resolveMongoId } from "@/lib/helpers/resolveMongoId";

// ====================== Pagination Params ======================
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

// Allowed sort fields (map from URL param to actual DB field)
const SORT_FIELD_MAP: Record<string, string> = {
    bookingTime: "bookedAt",
    createdAt: "createdAt",
    totalPaid: "totalPaid",
    totalParticipants: "totalParticipants",
    status: "status",
};

// ====================== Helper Types for Populated Data ======================
interface PopulatedAssetFile {
    publicUrl?: string;
}

interface PopulatedAsset {
    file?: PopulatedAssetFile;
}

interface PopulatedUser extends Omit<IUser, "avatar"> {
    _id: Types.ObjectId;
    avatar?: PopulatedAsset;
}

interface PopulatedTraveler extends Omit<ITraveler, "user"> {
    user?: PopulatedUser;
}

interface PopulatedBooking {
    _id: Types.ObjectId;
    bookedAt?: Date;
    createdAt: Date;
    totalParticipants: number;
    totalPaid: number;
    traveler: PopulatedTraveler;
}

// ====================== Handler Function ======================
async function getTourBookingsHandler(
    req: NextRequest,
    { params }: { params: Promise<{ tourId: string }> }
): Promise<{ data: TourBookingsResponseDTO }> {
    // 1. Extract and validate tourId
    const tourId = resolveMongoId((await params).tourId);

    if (!Types.ObjectId.isValid(tourId)) {
        throw new ApiError("Invalid tour ID", 400);
    }

    // 2. Get current user ID from session
    const userId = await getUserIdFromSession();
    if (!userId) {
        throw new ApiError("Unauthorized", 401);
    }

    await ConnectDB();

    // 3. Fetch the tour and check ownership (soft-deleted tours are excluded)
    const tour = await TourModel.findById(tourId).select("authorId").lean();
    if (!tour) {
        throw new ApiError("Tour not found", 404);
    }

    // Check if the logged-in user is the tour author
    // if (tour.authorId.toString() !== userId) {
    //     throw new ApiError(
    //         "Forbidden: You are not allowed to view these bookings",
    //         403
    //     );
    // }

    // 4. Parse pagination and sorting
    const searchParams = req.nextUrl.searchParams;
    const page = Math.max(
        1,
        parseInt(searchParams.get("page") ?? String(DEFAULT_PAGE), 10)
    );
    const limit = Math.min(
        MAX_LIMIT,
        Math.max(1, parseInt(searchParams.get("limit") ?? String(DEFAULT_LIMIT), 10))
    );
    const sortFieldRaw = searchParams.get("sort") ?? "bookingTime";
    const order = searchParams.get("order") === "asc" ? "asc" : "desc";
    const search = sanitizeSearch(searchParams.get("search"));

    const sortField = SORT_FIELD_MAP[sortFieldRaw] ?? "bookedAt";
    const sortDirection = order === "asc" ? 1 : -1;
    const skip = (page - 1) * limit;

    // 5. Build filter for bookings (only this tour, exclude soft-deleted automatically)
    const filter: FilterQuery<typeof BookingModel> = {
        tour: new Types.ObjectId(tourId),
    };

    if (search) {
        const regex = new RegExp(search, "i");
        const matchingUsers = await UserModel.find({
            $or: [{ name: regex }, { email: regex }],
        })
            .select("_id")
            .lean();

        const userIds = matchingUsers.map((u) => u._id);
        if (userIds.length === 0) {
            return {
                data: {
                    docs: [],
                    total: 0,
                    page,
                    pages: 0,
                },
            };
        }

        const matchingTravelers = await TravelerModel.find({
            user: { $in: userIds },
        })
            .select("_id")
            .lean();

        const travelerIds = matchingTravelers.map((t: { _id: Types.ObjectId }) => t._id);
        if (travelerIds.length === 0) {
            return {
                data: {
                    docs: [],
                    total: 0,
                    page,
                    pages: 0,
                },
            };
        }

        filter.traveler = { $in: travelerIds };
    }

    // 6. Count total bookings
    const total = await BookingModel.countDocuments(filter);

    // 7. Fetch bookings with nested population to get user avatar
    const bookings = (await BookingModel.find(filter)
        .sort({ [sortField]: sortDirection })
        .skip(skip)
        .limit(limit)
        .populate<PopulatedBooking>({
            path: "traveler",
            select: "user",
            populate: {
                path: "user",
                select: "name email avatar",
                populate: {
                    path: "avatar",
                    select: "file",
                    populate: {
                        path: "file",
                        select: "publicUrl",
                    },
                },
            },
        })
        .lean()) as PopulatedBooking[];

    // 8. Transform to DTO
    const docs: BookingListItemDTO[] = bookings.map((booking) => {
        const user = booking.traveler?.user;
        let avatarUrl: string | undefined;
        if (user?.avatar?.file?.publicUrl) {
            avatarUrl = user.avatar.file.publicUrl;
        }

        return {
            _id: booking._id.toString(),
            user: {
                _id: user?._id?.toString() ?? "",
                name: user?.name ?? "",
                email: user?.email ?? "",
                avatarUrl,
            },
            bookingTime: booking.bookedAt
                ? booking.bookedAt.toISOString()
                : booking.createdAt.toISOString(),
            totalParticipants: booking.totalParticipants,
            totalPaid: booking.totalPaid,
        };
    });

    const pages = Math.ceil(total / limit);
    return {
        data: {
            docs,
            total,
            page,
            pages,
        },
    };
}

// ====================== Exported GET with Error Handler ======================
export const GET = withErrorHandler(getTourBookingsHandler);