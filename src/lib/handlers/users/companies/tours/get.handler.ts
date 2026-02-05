// api/users/companies/v1/tours
import { NextRequest } from "next/server";
import { Types, FilterQuery } from "mongoose";
import TourModel, { IDestinationBlock, ITour, IAttraction } from "@/models/tours/tour.model";
import ConnectDB from "@/config/db";
import AssetFileModel from '@/models/assets/asset-file.model';
import { PopulatedAssetLean } from '@/types/populated-asset.types';
import AssetModel from "@/models/assets/asset.model";
import { TOUR_STATUS } from "@/constants/tour.const";
import { sanitizeSearch } from "@/lib/helpers/sanitize-search";

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
 * GET api/operations/tours/v1
 * Fetch paginated & filtered tours
 */
const GetTourListHandler = async (req: NextRequest) => {
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

    const boolFilter = (key: string) => {
        const value = searchParams.get(key);
        if (value === "true") filter[key] = true;
        if (value === "false") filter[key] = false;
    };

    /* ---------------- Status Filter ---------------- */
    const statusParam = searchParams.get("status");
    if (statusParam) {
        const statuses = statusParam.split(",");

        // Check if "archived" is in the status list
        const hasArchived = statuses.includes(TOUR_STATUS.ARCHIVED);

        if (hasArchived) {
            // Remove "archived" from the status array
            const otherStatuses = statuses.filter(s => s !== TOUR_STATUS.ARCHIVED);

            // Create OR condition for archived vs non-archived
            filter.$or = [
                // Non-archived tours: match status AND not deleted
                {
                    status: { $in: otherStatuses },
                    deletedAt: { $exists: false }
                },
                // Archived tours: must have deletedAt set
                {
                    status: TOUR_STATUS.ARCHIVED, // or whatever status archived tours have
                    deletedAt: { $exists: true }
                }
            ];

            // Remove the default deletedAt filter since we're handling it in $or
            delete filter.deletedAt;

        } else {
            // No archived status, use normal filtering
            filter.status = { $in: statuses };
        }
    }

    arrayFilter("division");
    arrayFilter("district");
    arrayFilter("tourType");
    arrayFilter("difficulty");
    arrayFilter("audience");
    arrayFilter("categories");
    arrayFilter("status");
    arrayFilter("moderationStatus");
    arrayFilter("tags");

    boolFilter("featured");
    boolFilter("guideIncluded");
    boolFilter("transportIncluded");

    /* ---------------- Search ---------------- */
    const search = sanitizeSearch(searchParams.get("search"));
    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: "i" } },
            { summary: { $regex: search, $options: "i" } },
            { tags: { $regex: search, $options: "i" } },
        ];
    }

    /* ---------------- Price ---------------- */
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    if (minPrice || maxPrice) {
        filter["basePrice.amount"] = {};
        if (minPrice) filter["basePrice.amount"].$gte = Number(minPrice);
        if (maxPrice) filter["basePrice.amount"].$lte = Number(maxPrice);
    }

    const currency = searchParams.get("currency");
    if (currency) filter["basePrice.currency"] = currency;

    /* ---------------- Date Range ---------------- */
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (startDate || endDate) {
        filter.departures = {
            $elemMatch: {
                ...(startDate && { date: { $gte: new Date(startDate) } }),
                ...(endDate && { date: { $lte: new Date(endDate) } }),
            },
        };
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
                options: { lean: true } // optional
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
            docs: mappedDocs,
            total,
            page,
            pages: Math.ceil(total / limit),
        },
    }
};

export default GetTourListHandler;