// api/users/companies/v1/[companyId]/[tourId]/reviews
import { NextRequest } from "next/server";
import { FilterQuery, Types } from "mongoose";
import {
    ReviewListItemDTO,
    ReviewSummaryDTO,
    TourReviewsResponseDTO,
} from "@/types/tour/tour-detail-review.type";
import { TravelType } from "@/constants/tour.const";
import EmployeeModel from "@/models/employees/employees.model";
import AssetModel from "@/models/assets/asset.model";
import { ReviewModel, IReview, IReviewReply } from "@/models/tours/review.model";
import { ApiError, HandlerResult, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { getCollectionName } from "@/lib/helpers/get-collection-name";
import UserModel from "@/models/user.model";
import AssetFileModel from "@/models/assets/asset-file.model";
import { resolveMongoId } from "@/lib/helpers/resolveMongoId";
import { TravelerModel } from "@/models/travellers/traveler.model";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

interface ReviewQueryParams {
    page: number;
    limit: number;
    sort?: string;
    order?: "asc" | "desc";
    search?: string;
    rating?: 1 | 2 | 3 | 4 | 5;
    approvedOnly?: boolean;
}

interface PopulatedUser {
    id: string;
    name: string;
    avatar?: string;
}

type AggregatedReplies = Pick<IReviewReply,
    "_id" |
    "message" |
    "isApproved" |
    "createdAt" |
    "deletedAt" |
    "updatedAt"> & {
        employee: PopulatedUser,
    }

type AggregatedReviewDoc = Pick<IReview,
    "tour" |
    "rating" |
    "title" |
    "comment" |
    "tripType" |
    "travelDate" |
    "isApproved" |
    "helpfulCount" |
    "createdAt"> & {
        _id: Types.ObjectId;
        user: PopulatedUser;
        replies: AggregatedReplies[],
        images: string[]
    }


/* -------------------------------------------------------------------------- */
/*                              Helper Functions                               */
/* -------------------------------------------------------------------------- */

const buildQuery = (
    tourId: string,
    params: ReviewQueryParams
): FilterQuery<IReview> => {
    const query: FilterQuery<IReview> = {
        tour: new Types.ObjectId(tourId),
        deletedAt: null,
    };

    if (params.rating) {
        query.rating = params.rating;
    }

    if (params.search) {
        query.$or = [
            { title: { $regex: params.search, $options: "i" } },
            { comment: { $regex: params.search, $options: "i" } },
        ];
    }

    // Add isApproved handling
    if (params.approvedOnly) {
        // Assuming there's a way to verify reviews
        // If you have an isVerified field in your model, use it
        // If not, you might need to adjust this logic
        query.isApproved = true; // Or whatever field indicates verification
    }

    return query;
};

/* -------------------------------------------------------------------------- */
/*                           Review Response Service                           */
/* -------------------------------------------------------------------------- */

export class ReviewResponseService {
    /* ---------------------------- Summary (FAST) ---------------------------- */
    static async getReviewSummary(
        tourId: string,
        rating?: ReviewQueryParams["rating"]
    ): Promise<ReviewSummaryDTO> {
        const match: FilterQuery<IReview> = {
            tour: new Types.ObjectId(tourId),
            deletedAt: null,
        };

        if (rating) {
            match.rating = rating;
        }

        const result = await ReviewModel.aggregate([
            { $match: match },
            {
                $group: {
                    _id: "$rating",
                    count: { $sum: 1 },
                    avgRating: { $avg: "$rating" },
                },
            },
        ]);

        const breakdown: Record<1 | 2 | 3 | 4 | 5, number> = {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
        };

        let total = 0;
        let sum = 0;

        result.forEach((r) => {
            const ratingKey = r._id as 1 | 2 | 3 | 4 | 5;
            breakdown[ratingKey] = r.count;
            total += r.count;
            sum += r.avgRating * r.count;
        });

        return {
            totalReviews: total,
            averageRating: total ? Number((sum / total).toFixed(1)) : 0,
            isApproved: 0,
            ratingBreakdown: breakdown,
        };
    }

    /* ------------------------- Main Reviews Endpoint ------------------------- */
    static async getTourReviews(
        companyId: string,
        tourId: string,
        params: ReviewQueryParams
    ): Promise<TourReviewsResponseDTO> {

        const skip = (params.page - 1) * params.limit;

        // console.log(`\nSkip: ${skip},  Query: ${JSON.stringify(query, null, 2)}`);

        // const reviewsTest = await ReviewModel.find(query)
        //     .skip(skip)
        //     .limit(params.limit)
        //     .sort({ [params.sort ?? "createdAt"]: params.order === "asc" ? 1 : -1 })
        //     .lean();

        // console.log('\nFound reviews (basic):', reviewsTest.length);
        // console.log('\nReview IDs:', reviewsTest.map(r => r._id));

        const aggregation = await ReviewModel.aggregate([
            /* ------------------------------ MATCH ------------------------------ */
            {
                $match: buildQuery(tourId, params),
            },

            /* ============================== FACET ============================== */
            {
                $facet: {
                    /* -------------------------- REVIEWS --------------------------- */
                    docs: [
                        { $sort: { [params.sort ?? "createdAt"]: params.order === "asc" ? 1 : -1 } },
                        { $skip: skip },
                        { $limit: params.limit },
                        /* ========================= TRAVELER USER ========================== */
                        {
                            $lookup: {
                                from: getCollectionName(TravelerModel),
                                localField: "user",
                                foreignField: "_id",
                                as: "traveler",
                            },
                        },
                        { $unwind: "$traveler" },

                        /* ------------------------------ User ------------------------------- */
                        {
                            $lookup: {
                                from: getCollectionName(UserModel),
                                localField: "traveler.user",
                                foreignField: "_id",
                                as: "reviewUser",
                            },
                        },
                        { $unwind: "$reviewUser" },

                        /* ----------------------------- Avatar ------------------------------ */
                        {
                            $lookup: {
                                from: getCollectionName(AssetModel),
                                localField: "reviewUser.avatar",
                                foreignField: "_id",
                                as: "avatar",
                            },
                        },
                        {
                            $lookup: {
                                from: getCollectionName(AssetFileModel),
                                localField: "avatar.file",
                                foreignField: "_id",
                                as: "avatarFile",
                            },
                        },

                        /* =========================== REPLIES =============================== */
                        {
                            $lookup: {
                                from: getCollectionName(EmployeeModel),
                                localField: "replies.employee",
                                foreignField: "_id",
                                as: "replyEmployees",
                            },
                        },
                        {
                            $lookup: {
                                from: getCollectionName(UserModel),
                                localField: "replyEmployees.user",
                                foreignField: "_id",
                                as: "replyUsers",
                            },
                        },
                        {
                            $lookup: {
                                from: getCollectionName(AssetModel),
                                localField: "replyUsers.avatar",
                                foreignField: "_id",
                                as: "replyAvatars",
                            },
                        },
                        {
                            $lookup: {
                                from: getCollectionName(AssetFileModel),
                                localField: "replyAvatars.file",
                                foreignField: "_id",
                                as: "replyAvatarFiles",
                            },
                        },

                        /* ========================= REVIEW IMAGES ========================== */
                        {
                            $lookup: {
                                from: getCollectionName(AssetModel),
                                localField: "images",
                                foreignField: "_id",
                                as: "reviewImages",
                            },
                        },
                        {
                            $lookup: {
                                from: getCollectionName(AssetFileModel),
                                localField: "reviewImages.file",
                                foreignField: "_id",
                                as: "reviewImageFiles",
                            },
                        },


                        /* ============================ PROJECT ============================== */
                        {
                            $project: {
                                _id: 1,
                                tour: 1,
                                rating: 1,
                                title: 1,
                                comment: 1,
                                tripType: 1,
                                travelDate: 1,
                                helpfulCount: 1,
                                isApproved: {
                                    $cond: {
                                        if: { $ifNull: ["$approvedAt", false] },
                                        then: true,
                                        else: false,
                                    },
                                },
                                createdAt: 1,

                                user: {
                                    id: "$traveler._id",
                                    name: "$reviewUser.name",
                                    avatar: {
                                        $arrayElemAt: ["$avatarFile.publicUrl", 0],
                                    },
                                },

                                images: {
                                    $map: {
                                        input: "$reviewImageFiles",
                                        as: "img",
                                        in: "$$img.publicUrl",
                                    },
                                },

                                replies: {
                                    $map: {
                                        input: {
                                            $filter: {
                                                input: "$replies",
                                                as: "r",
                                                cond: { $eq: ["$$r.deletedAt", null] },
                                            },
                                        },
                                        as: "r",
                                        in: {
                                            id: "$$r._id",
                                            message: "$$r.message",
                                            isApproved: "$$r.isApproved",
                                            createdAt: "$$r.createdAt",
                                            updatedAt: "$$r.updatedAt",
                                            employee: {
                                                name: {
                                                    $arrayElemAt: ["$replyUsers.name", 0],
                                                },
                                                avatar: {
                                                    $arrayElemAt: ["$replyAvatarFiles.publicUrl", 0],
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    ],

                    /* -------------------------- SUMMARY --------------------------- */
                    summary: [
                        {
                            $group: {
                                _id: null,
                                totalReviews: { $sum: 1 },

                                isApproved: {
                                    $sum: {
                                        $cond: [{ $eq: ["$isApproved", true] }, 1, 0],
                                    },
                                },

                                averageRating: {
                                    $avg: {
                                        $cond: [
                                            { $eq: ["$isApproved", true] },
                                            "$rating",
                                            null,
                                        ],
                                    },
                                },

                                ratingBreakdown: {
                                    $push: "$rating",
                                },
                            },
                        },
                        {
                            $project: {
                                _id: 0,
                                totalReviews: 1,
                                isApproved: 1,
                                averageRating: { $round: ["$averageRating", 1] },

                                ratingBreakdown: {
                                    1: {
                                        $size: {
                                            $filter: {
                                                input: "$ratingBreakdown",
                                                as: "r",
                                                cond: { $eq: ["$$r", 1] },
                                            },
                                        },
                                    },
                                    2: {
                                        $size: {
                                            $filter: {
                                                input: "$ratingBreakdown",
                                                as: "r",
                                                cond: { $eq: ["$$r", 2] },
                                            },
                                        },
                                    },
                                    3: {
                                        $size: {
                                            $filter: {
                                                input: "$ratingBreakdown",
                                                as: "r",
                                                cond: { $eq: ["$$r", 3] },
                                            },
                                        },
                                    },
                                    4: {
                                        $size: {
                                            $filter: {
                                                input: "$ratingBreakdown",
                                                as: "r",
                                                cond: { $eq: ["$$r", 4] },
                                            },
                                        },
                                    },
                                    5: {
                                        $size: {
                                            $filter: {
                                                input: "$ratingBreakdown",
                                                as: "r",
                                                cond: { $eq: ["$$r", 5] },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    ],

                    /* --------------------------- TOTAL ----------------------------- */
                    total: [{ $count: "count" }],
                },
            },
        ]);

        const facet = aggregation[0];

        const reviews = facet.docs as AggregatedReviewDoc[];

        const summary: ReviewSummaryDTO = facet.summary[0] ?? {
            totalReviews: 0,
            averageRating: 0,
            isApproved: 0,
            ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        };

        const total = facet.total[0]?.count ?? 0;


        // /* ----------------------------- Build DTOs ----------------------------- */

        const docs: ReviewListItemDTO[] = reviews.map(review => ({
            id: review._id.toString(),
            tourId: review.tour.toString(),
            user: {
                id: review.user.id.toString(),
                name: review.user.name,
                avatar: review.user.avatar
            },
            rating: review.rating,
            title: review.title,
            comment: review.comment,
            images: review.images,
            tripType: review.tripType as TravelType | undefined,
            travelDate: review.travelDate?.toISOString(),
            isApproved: review.isApproved,
            helpfulCount: review.helpfulCount ?? 0,
            createdAt: review.createdAt.toISOString(),
            replies: (review.replies ?? []).map((item) => ({
                id: item._id.toString(),
                employee: {
                    id: item.employee.id.toString(),
                    name: item.employee.name,
                    avatar: item.employee.avatar
                },
                message: item.message,
                isApproved: item.isApproved,
                createdAt: item.createdAt.toISOString(),
                updatedAt: item.updatedAt.toISOString(),
                deletedAt: item.deletedAt?.toISOString()
            })),
        }));

        return {
            companyId,
            tourId,
            summary: {
                totalReviews: summary.totalReviews,
                averageRating: summary.averageRating,
                isApproved: summary.isApproved,
                ratingBreakdown: summary.ratingBreakdown,
            },
            docs,
            total,
            page: params.page,
            pages: Math.ceil(total / params.limit),
        };

    }
}

/* -------------------------------------------------------------------------- */
/*                                   Handler                                  */
/* -------------------------------------------------------------------------- */

async function getReviewsHandler(
    request: NextRequest,
    { params }: { params: Promise<{ companyId: string, tourId: string }> }
): Promise<HandlerResult<TourReviewsResponseDTO>> {

    const tourId = resolveMongoId((await params).tourId);
    const companyId = resolveMongoId((await params).companyId);

    if (!Types.ObjectId.isValid(tourId)) {
        throw new ApiError("Invalid tour ID", 400);
    }
    if (!Types.ObjectId.isValid(companyId)) {
        throw new ApiError("Invalid tour ID", 400);
    }

    const sp = new URL(request.url).searchParams;

    const queryParams: ReviewQueryParams = {
        page: Number(sp.get("page") ?? 1),
        limit: Number(sp.get("limit") ?? 10),
        sort: sp.get("sort") ?? undefined,
        order: (sp.get("order") as "asc" | "desc") ?? "desc",
        search: sp.get("search") ?? undefined,
        rating: sp.get("rating")
            ? (Number(sp.get("rating")) as 1 | 2 | 3 | 4 | 5)
            : undefined,
        approvedOnly: sp.get("approvedOnly") === "true",
    };

    const data = await ReviewResponseService.getTourReviews(companyId.toString(), tourId.toString(), queryParams);

    return { data, status: 200 };
}

export const GET = withErrorHandler(getReviewsHandler);