// api/users/companies/v1/[companyId]/[tourId]/faqs
import { NextRequest } from "next/server";
import { FilterQuery, Types } from "mongoose";
import { ApiError, HandlerResult, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { resolveMongoId } from "@/lib/helpers/resolveMongoId";
import { getCollectionName } from "@/lib/helpers/get-collection-name";
import {
    GetTourFaqsResponse,
} from "@/types/tour-detail-faqs.types";
import { TourFAQModel, ITourFAQ } from "@/models/tours/tourFAQ.model";
import UserModel from "@/models/user.model";
import AssetModel from "@/models/assets/asset.model";
import AssetFileModel from "@/models/assets/asset-file.model";
import { ModerationStatus } from "@/constants/tour.const";
import { PipelineStage } from "mongoose";
import { TravelerModel } from "@/models/travellers/traveler.model";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

interface FAQQueryParams {
    page: number;
    limit: number;
    sort?: "order" | "createdAt" | "updatedAt" | "answeredAt" | "likes" | "dislikes";
    order?: "asc" | "desc";
    search?: string;
    status?: ModerationStatus;
}

interface AggregatedUser {
    id: Types.ObjectId;
    name: string;
    avatarUrl?: string;
}

interface AggregatedReportProjected {
    reportedBy: AggregatedUser;
    reason?: string;
    customReason?: string;
    explanation?: string;
    createdAt: Date;
}

interface AggregatedFAQDocProjected {
    _id: Types.ObjectId;
    tour: Types.ObjectId;

    question: string;
    answer?: string;

    status: ModerationStatus;
    order: number;
    isActive: boolean;

    createdAt: Date;
    updatedAt: Date;
    answeredAt?: Date;
    editedAt?: Date;

    likes: number;
    dislikes: number;
    userVote?: "like" | "dislike";

    askedBy: AggregatedUser;
    answeredBy: AggregatedUser | null;
    editedBy: {
        id: Types.ObjectId;
        name: string;
    } | null;

    reports?: AggregatedReportProjected[];
}

interface FacetResult {
    docs: AggregatedFAQDocProjected[];
    total: { count: number }[];
}

/* -------------------------------------------------------------------------- */
/*                              Helper Functions                               */
/* -------------------------------------------------------------------------- */

const buildQuery = (
    tourId: Types.ObjectId,
    params: FAQQueryParams
): FilterQuery<ITourFAQ> => {
    const query: FilterQuery<ITourFAQ> = {
        tour: tourId,
        deletedAt: null,
        isActive: true,
    };

    if (params.status) {
        query.status = params.status;
    }

    if (params.search) {
        const search = params.search.trim();

        const isShortOrCommon =
            search.length < 4 || search.split(/\s+/).some(w => w.length < 4);

        if (isShortOrCommon) {
            query.$or = [
                { question: { $regex: search, $options: "i" } },
                { answer: { $regex: search, $options: "i" } },
            ];
        } else {
            query.$text = { $search: search };
        }
    }

    return query;
};

/* -------------------------------------------------------------------------- */
/*                           FAQ Response Service                              */
/* -------------------------------------------------------------------------- */

export class FAQResponseService {
    static async getTourFAQs(
        tourId: string,
        params: FAQQueryParams
    ): Promise<GetTourFaqsResponse> {

        const tourObjectId = new Types.ObjectId(tourId);

        const page = Math.max(params.page, 1);
        const limit = Math.min(Math.max(params.limit, 1), 100);
        const skip = (page - 1) * limit;

        const sortField = params.sort ?? "order";
        const sortOrder = params.order === "asc" ? 1 : -1;

        const matchStage = buildQuery(tourObjectId, params);

        const sortKey =
            sortField === "likes" ? "likesCount"
                : sortField === "dislikes" ? "dislikesCount"
                    : sortField;

        const pipeline: PipelineStage[] = [
            { $match: matchStage },

            /* Pre-compute like/dislike counts for sorting */
            {
                $addFields: {
                    likesCount: {
                        $size: {
                            $filter: {
                                input: "$likes",
                                as: "l",
                                cond: { $eq: ["$$l.deletedAt", null] },
                            },
                        },
                    },
                    dislikesCount: {
                        $size: {
                            $filter: {
                                input: "$dislikes",
                                as: "d",
                                cond: { $eq: ["$$d.deletedAt", null] },
                            },
                        },
                    },
                },
            },

            {
                $facet: {
                    docs: [
                        { $sort: { [sortKey]: sortOrder } },
                        { $skip: skip },
                        { $limit: limit },

                        /* ---------------- ASKED BY ---------------- */
                        {
                            $lookup: {
                                from: getCollectionName(TravelerModel),
                                localField: "askedBy",
                                foreignField: "_id",
                                as: "askedByTraveler",
                            },
                        },
                        { $unwind: "$askedByTraveler" },
                        {
                            $lookup: {
                                from: getCollectionName(UserModel),
                                localField: "askedByTraveler.user",
                                foreignField: "_id",
                                as: "askedByUser",
                            },
                        },
                        { $unwind: "$askedByUser" },
                        {
                            $lookup: {
                                from: getCollectionName(AssetModel),
                                localField: "askedByUser.avatar",
                                foreignField: "_id",
                                as: "askedByAvatar",
                            },
                        },
                        {
                            $lookup: {
                                from: getCollectionName(AssetFileModel),
                                localField: "askedByAvatar.file",
                                foreignField: "_id",
                                as: "askedByAvatarFile",
                            },
                        },

                        /* ---------------- ANSWERED BY ---------------- */
                        {
                            $lookup: {
                                from: getCollectionName(TravelerModel),
                                localField: "answeredBy",
                                foreignField: "_id",
                                as: "answeredByTraveler",
                            },
                        },
                        { $unwind: { path: "$answeredByTraveler", preserveNullAndEmptyArrays: true } },
                        {
                            $lookup: {
                                from: getCollectionName(UserModel),
                                localField: "answeredByTraveler.user",
                                foreignField: "_id",
                                as: "answeredByUser",
                            },
                        },
                        { $unwind: { path: "$answeredByUser", preserveNullAndEmptyArrays: true } },
                        {
                            $lookup: {
                                from: getCollectionName(AssetModel),
                                localField: "answeredByUser.avatar",
                                foreignField: "_id",
                                as: "answeredByAvatar",
                            },
                        },
                        {
                            $lookup: {
                                from: getCollectionName(AssetFileModel),
                                localField: "answeredByAvatar.file",
                                foreignField: "_id",
                                as: "answeredByAvatarFile",
                            },
                        },

                        /* ---------------- EDITED BY ---------------- */
                        {
                            $lookup: {
                                from: getCollectionName(TravelerModel),
                                localField: "editedBy",
                                foreignField: "_id",
                                as: "editedByTraveler",
                            },
                        },
                        { $unwind: { path: "$editedByTraveler", preserveNullAndEmptyArrays: true } },
                        {
                            $lookup: {
                                from: getCollectionName(UserModel),
                                localField: "editedByTraveler.user",
                                foreignField: "_id",
                                as: "editedByUser",
                            },
                        },
                        { $unwind: { path: "$editedByUser", preserveNullAndEmptyArrays: true } },

                        /* ---------------- REPORTS ---------------- */
                        {
                            $lookup: {
                                from: getCollectionName(TravelerModel),
                                localField: "reports.reportedBy",
                                foreignField: "_id",
                                as: "reportTravelers",
                            },
                        },
                        {
                            $lookup: {
                                from: getCollectionName(UserModel),
                                localField: "reportTravelers.user",
                                foreignField: "_id",
                                as: "reportUsers",
                            },
                        },
                        {
                            $lookup: {
                                from: getCollectionName(AssetModel),
                                localField: "reportUsers.avatar",
                                foreignField: "_id",
                                as: "reportAvatars",
                            },
                        },
                        {
                            $lookup: {
                                from: getCollectionName(AssetFileModel),
                                localField: "reportAvatars.file",
                                foreignField: "_id",
                                as: "reportAvatarFiles",
                            },
                        },

                        /* ---------------- PROJECT ---------------- */
                        {
                            $project: {
                                _id: 1,
                                tour: 1,
                                question: 1,
                                answer: 1,
                                status: 1,
                                order: { $ifNull: ["$order", 0] },
                                isActive: 1,
                                createdAt: 1,
                                updatedAt: 1,
                                answeredAt: 1,
                                editedAt: 1,

                                likes: "$likesCount",
                                dislikes: "$dislikesCount",

                                askedBy: {
                                    id: "$askedByTraveler._id",
                                    name: "$askedByUser.name",
                                    avatarUrl: {
                                        $arrayElemAt: ["$askedByAvatarFile.publicUrl", 0],
                                    },
                                },

                                answeredBy: {
                                    $cond: {
                                        if: { $ifNull: ["$answeredByTraveler._id", false] },
                                        then: {
                                            id: "$answeredByTraveler._id",
                                            name: "$answeredByUser.name",
                                            avatarUrl: {
                                                $arrayElemAt: ["$answeredByAvatarFile.publicUrl", 0],
                                            },
                                        },
                                        else: null,
                                    },
                                },

                                editedBy: {
                                    $cond: {
                                        if: { $ifNull: ["$editedByTraveler._id", false] },
                                        then: {
                                            id: "$editedByTraveler._id",
                                            name: "$editedByUser.name",
                                        },
                                        else: null,
                                    },
                                },

                                reports: {
                                    $map: {
                                        input: "$reports",
                                        as: "report",
                                        in: {
                                            reportedBy: {
                                                $let: {
                                                    vars: {
                                                        traveler: {
                                                            $first: {
                                                                $filter: {
                                                                    input: "$reportTravelers",
                                                                    as: "t",
                                                                    cond: {
                                                                        $eq: ["$$t._id", "$$report.reportedBy"],
                                                                    },
                                                                },
                                                            },
                                                        },
                                                    },
                                                    in: {
                                                        id: "$$traveler._id",
                                                        name: {
                                                            $arrayElemAt: ["$reportUsers.name", 0],
                                                        },
                                                        avatarUrl: {
                                                            $arrayElemAt: ["$reportAvatarFiles.publicUrl", 0],
                                                        },
                                                    },
                                                },
                                            },
                                            reason: "$$report.reason",
                                            customReason: "$$report.customReason",
                                            explanation: "$$report.explanation",
                                            createdAt: "$$report.createdAt",
                                        },
                                    },
                                },
                            },
                        },
                    ],
                    total: [{ $count: "count" }],
                },
            },
        ];

        const [result] = await TourFAQModel.aggregate<FacetResult>(pipeline);

        const docs = result?.docs ?? [];
        const total = result?.total?.[0]?.count ?? 0;

        return {
            docs: docs.map((faq) => ({
                id: faq._id.toString(),
                tourId: faq.tour.toString(),
                question: faq.question,
                answer: faq.answer,
                askedBy: {
                    id: faq.askedBy.id.toString(),
                    name: faq.askedBy.name,
                    avatarUrl: faq.askedBy.avatarUrl,
                },
                answeredBy: faq.answeredBy
                    ? {
                        id: faq.answeredBy.id.toString(),
                        name: faq.answeredBy.name,
                        avatarUrl: faq.answeredBy.avatarUrl,
                    }
                    : undefined,
                status: faq.status,
                order: faq.order,
                isActive: faq.isActive,
                likes: faq.likes,
                dislikes: faq.dislikes,
                userVote: undefined,
                reports: faq.reports?.map(r => ({
                    reportedBy: {
                        id: r.reportedBy.id.toString(),
                        name: r.reportedBy.name,
                        avatarUrl: r.reportedBy.avatarUrl,
                    },
                    reason: r.reason,
                    customReason: r.customReason,
                    explanation: r.explanation,
                    createdAt: r.createdAt.toISOString(),
                })) ?? [],
                createdAt: faq.createdAt.toISOString(),
                updatedAt: faq.updatedAt.toISOString(),
                answeredAt: faq.answeredAt?.toISOString(),
                editedAt: faq.editedAt?.toISOString(),
            })),
            total,
            page,
            pages: Math.ceil(total / limit),
        };
    }
}

/* -------------------------------------------------------------------------- */
/*                                   Handler                                  */
/* -------------------------------------------------------------------------- */

async function getFAQsHandler(
    request: NextRequest,
    { params }: { params: Promise<{ tourId: string }> }
): Promise<HandlerResult<GetTourFaqsResponse>> {

    const tourId = resolveMongoId((await params).tourId);

    if (!Types.ObjectId.isValid(tourId)) {
        throw new ApiError("Invalid tour ID", 400);
    }

    const sp = new URL(request.url).searchParams;

    const queryParams: FAQQueryParams = {
        page: Number(sp.get("page") ?? 1),
        limit: Number(sp.get("limit") ?? 10),
        sort: sp.get("sort") as FAQQueryParams["sort"] ?? "order",
        order: sp.get("order") as "asc" | "desc" ?? "asc",
        search: sp.get("search") ?? undefined,
        status: sp.get("status") as ModerationStatus ?? undefined,
    };

    const data = await FAQResponseService.getTourFAQs(tourId.toString(), queryParams);

    return { data, status: 200 };
}

export const GET = withErrorHandler(getFAQsHandler);