// app/api/support/v1/tours/route.ts
import { NextRequest } from "next/server";
import { Types, FilterQuery } from "mongoose";
import TourModel, { IDestinationBlock, ITour, IAttraction } from "@/models/tours/tour.model";
import ConnectDB from "@/config/db";
import AssetFileModel from '@/models/assets/asset-file.model';
import AssetModel from '@/models/assets/asset.model';
import { PopulatedAssetLean } from '@/types/populated-asset.types';
import { withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { MODERATION_STATUS } from "@/constants/tour.const";

type ObjectId = Types.ObjectId;

type IDestinationBlockLean =
    Omit<IDestinationBlock, "attractions" | "images"> & {
        attractions: (Omit<IAttraction, "images"> & {
            images: PopulatedAssetLean[];
        })[];
        images: PopulatedAssetLean[];
    };

type TourLeanPopulated =
    Omit<ITour,
        | "heroImage"
        | "gallery"
        | "destinations"
    > & {
        _id: ObjectId;
        heroImage: PopulatedAssetLean | null;
        gallery: PopulatedAssetLean[];
        destinations: IDestinationBlockLean[]
    };

/**
 * GET api/support/v1/tours
 * Fetch paginated & filtered tours for support/approval dashboard
 */
export const GET = withErrorHandler(async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);

    /* ---------------- Pagination ---------------- */
    const page = Math.max(Number(searchParams.get("page")) || 1, 1);
    const limit = Math.min(Number(searchParams.get("limit")) || 10, 100);
    const skip = (page - 1) * limit;

    /* ---------------- Sorting ---------------- */
    const sortField = searchParams.get("sort") || "createdAt";
    const order = searchParams.get("order") === "asc" ? 1 : -1;

    const sort: Record<string, 1 | -1> = {
        [sortField]: order,
    };

    /* ---------------- Filters ---------------- */
    const filter: FilterQuery<ITour> = {
        deletedAt: { $exists: false },
    };

    const arrayFilter = (key: string) => {
        const value = searchParams.get(key);
        if (value) filter[key] = { $in: value.split(",") };
    };

    arrayFilter("division");
    arrayFilter("district");
    arrayFilter("tourType");
    arrayFilter("difficulty");
    arrayFilter("status");
    arrayFilter("moderationStatus");

    /* ---------------- Search ---------------- */
    const search = searchParams.get("search");
    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: "i" } },
            { summary: { $regex: search, $options: "i" } },
            { tags: { $regex: search, $options: "i" } },
            { slug: { $regex: search, $options: "i" } },
        ];
    }

    await ConnectDB();

    /* ---------------- Query ---------------- */
    const [rawDocs, total] = await Promise.all([
        TourModel.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate({
                path: "heroImage",
                select: "file deletedAt",
                model: AssetModel,
                populate: { path: "file", select: "publicUrl", model: AssetFileModel },
                options: { lean: true }
            })
            .populate({
                path: "gallery",
                select: "file deletedAt",
                model: AssetModel,
                populate: { path: "file", select: "publicUrl", model: AssetFileModel },
            })
            .populate({
                path: "destinations.images",
                select: "file deletedAt",
                model: AssetModel,
                populate: { path: "file", select: "publicUrl", model: AssetFileModel },
            })
            .populate({
                path: "destinations.attractions.images",
                select: "file deletedAt",
                model: AssetModel,
                populate: { path: "file", select: "publicUrl", model: AssetFileModel },
            })
            .lean(),
        TourModel.countDocuments(filter),
    ]);

    const docs = rawDocs as unknown as TourLeanPopulated[];

    /* ---------------- Calculate Statistics ---------------- */
    // Get count for each moderation status
    const statsAggregation = await TourModel.aggregate([
        { $match: { deletedAt: { $exists: false } } },
        {
            $group: {
                _id: "$moderationStatus",
                count: { $sum: 1 }
            }
        }
    ]);

    // Convert aggregation results to stats object
    const statsMap = new Map(
        statsAggregation.map(item => [item._id, item.count])
    );

    const stats = {
        pending: statsMap.get(MODERATION_STATUS.PENDING) || 0,
        approved: statsMap.get(MODERATION_STATUS.APPROVED) || 0,
        rejected: statsMap.get(MODERATION_STATUS.DENIED) || 0,
        suspended: statsMap.get(MODERATION_STATUS.SUSPENDED) || 0,
        total: total
    };

    /* ---------------- Map to TourListItemDTO ---------------- */
    const mappedDocs = docs.map((t) => {
        const nextDeparture = t.departures
            ?.map((d) => new Date(d.date))
            .filter((d: Date) => d > new Date())
            .sort((a: Date, b: Date) => +a - +b)[0];

        const totalSeats =
            t.departures?.reduce((sum, d) => sum + d.seatsTotal, 0) || 0;
        const bookedSeats =
            t.departures?.reduce(
                (sum, d) => sum + d.seatsBooked,
                0
            ) || 0;

        return {
            id: String(t._id),
            title: t.title,
            slug: t.slug,
            status: t.status,
            summary: t.summary,
            heroImage: t.heroImage?.file?.publicUrl ?? undefined,

            tourType: t.tourType,
            division: t.division,
            district: t.district,
            difficulty: t.difficulty,

            basePrice: t.basePrice,

            hasActiveDiscount: Array.isArray(t.discounts) && t.discounts.length > 0,
            activeDiscountValue: t.discounts?.[0]?.value,

            duration: t.duration,
            nextDeparture: nextDeparture?.toISOString(),

            ratings: t.ratings,
            wishlistCount: t.wishlistCount,
            viewCount: t.viewCount,
            likeCount: t.likeCount,
            shareCount: t.shareCount,

            moderationStatus: t.moderationStatus,
            featured: t.featured,

            companyId: String(t.companyId),
            authorId: String(t.authorId),
            publishedAt: t.publishedAt,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt,

            occupancyPercentage:
                totalSeats > 0 ? Math.round((bookedSeats / totalSeats) * 100) : 0,
        };
    });

    return {
        status: 200,
        data: {
            tours: mappedDocs,
            total: total,
            page: page,
            limit: limit,
            totalPages: Math.ceil(total / limit),
            stats: stats
        }
    };
});