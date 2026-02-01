// api/users/companies/v1/[companyId]/[tourId]/reports
import { NextRequest } from "next/server";
import { FilterQuery, Types } from "mongoose";
import {
    TourReportsResponseDTO,
    TourReportListItemDTO,
} from "@/types/tour-detail-report.types";
import { ReportStatus, ReportPriority, ReportReason } from "@/constants/report.const";
import { ApiError, HandlerResult, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { getCollectionName } from "@/lib/helpers/get-collection-name";
import { resolveMongoId } from "@/lib/helpers/resolveMongoId";
import { IReport, ReportModel } from "@/models/tours/report.model";
import UserModel from "@/models/user.model";
import AssetModel from "@/models/assets/asset.model";
import AssetFileModel from "@/models/assets/asset-file.model";
import TourModel from "@/models/tours/tour.model";
import { TravelerModel } from "@/models/travellers/traveler.model";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

interface ReportQueryParams {
    page: number;
    limit: number;
    sort?: string;
    order?: "asc" | "desc";
    search?: string;
    status?: ReportStatus;
    priority?: ReportPriority;
    reason?: string;
    includeDeleted?: boolean;
    onlyDeleted?: boolean;
}

interface AggregatedReportRow {
    _id: Types.ObjectId;

    reporterId: Types.ObjectId;
    reporterName: string;
    reporterAvatarUrl?: string;

    tourId: Types.ObjectId;
    tourTitle: string;

    reason: ReportReason;
    message: string;
    messageExcerpt: string;

    status: ReportStatus;
    priority: ReportPriority;
    reopenedCount: number;
    tags: string[];

    evidenceCount: number;

    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
}

/* -------------------------------------------------------------------------- */
/*                              Helper Functions                               */
/* -------------------------------------------------------------------------- */

const buildMatchStage = (
    tourId: string,
    params: ReportQueryParams
): FilterQuery<IReport> => {
    const match: FilterQuery<IReport> = {
        tour: new Types.ObjectId(tourId),
    };

    if (params.onlyDeleted) {
        match.deletedAt = { $ne: null };
    } else if (!params.includeDeleted) {
        match.deletedAt = null;
    }

    if (params.status) match.status = params.status;
    if (params.priority) match.priority = params.priority;
    if (params.reason) match.reason = params.reason;

    if (params.search) {
        match.$or = [
            { message: { $regex: params.search, $options: "i" } },
            { resolutionNotes: { $regex: params.search, $options: "i" } },
            { rejectionNotes: { $regex: params.search, $options: "i" } },
        ];
    }

    return match;
};

/* -------------------------------------------------------------------------- */
/*                           Report Response Service                           */
/* -------------------------------------------------------------------------- */

export class ReportResponseService {

    /* -------------------------- MAIN REPORT LIST --------------------------- */
    static async getTourReports(
        tourId: string,
        params: ReportQueryParams
    ): Promise<TourReportsResponseDTO> {
        const skip = (params.page - 1) * params.limit;

        const aggregation = await ReportModel.aggregate([
            { $match: buildMatchStage(tourId, params) },

            {
                $facet: {
                    docs: [
                        { $sort: { [params.sort ?? "createdAt"]: params.order === "asc" ? 1 : -1 } },
                        { $skip: skip },
                        { $limit: params.limit },

                        /* ------------------------- REPORTER ------------------------- */
                        {
                            $lookup: {
                                from: getCollectionName(TravelerModel),
                                localField: "reporter",
                                foreignField: "_id",
                                as: "traveler",
                            },
                        },
                        { $unwind: "$traveler" },

                        {
                            $lookup: {
                                from: getCollectionName(UserModel),
                                localField: "traveler.user",
                                foreignField: "_id",
                                as: "user",
                            },
                        },
                        { $unwind: "$user" },

                        {
                            $lookup: {
                                from: getCollectionName(AssetModel),
                                localField: "user.avatar",
                                foreignField: "_id",
                                as: "avatar",
                            },
                        },
                        { $unwind: { path: "$avatar", preserveNullAndEmptyArrays: true } },

                        {
                            $lookup: {
                                from: getCollectionName(AssetFileModel),
                                localField: "avatar.file",
                                foreignField: "_id",
                                as: "avatarFile",
                            },
                        },
                        { $unwind: { path: "$avatarFile", preserveNullAndEmptyArrays: true } },

                        /* --------------------------- TOUR --------------------------- */
                        {
                            $lookup: {
                                from: getCollectionName(TourModel),
                                localField: "tour",
                                foreignField: "_id",
                                as: "tourInfo",
                            },
                        },
                        { $unwind: "$tourInfo" },

                        /* -------------------------- PROJECT ------------------------- */
                        {
                            $project: {
                                _id: 1,
                                reporterId: "$traveler._id",
                                reporterName: "$user.name",
                                reporterAvatarUrl: "$avatarFile.publicUrl",

                                tourId: "$tourInfo._id",
                                tourTitle: "$tourInfo.title",

                                reason: 1,
                                message: 1,
                                status: 1,
                                priority: 1,
                                reopenedCount: 1,
                                tags: 1,

                                evidenceCount: {
                                    $add: [
                                        { $size: { $ifNull: ["$evidenceImages", []] } },
                                        { $size: { $ifNull: ["$evidenceLinks", []] } },
                                    ],
                                },

                                messageExcerpt: {
                                    $cond: {
                                        if: { $gt: [{ $strLenCP: "$message" }, 100] },
                                        then: {
                                            $concat: [
                                                { $substrCP: ["$message", 0, 100] },
                                                "...",
                                            ],
                                        },
                                        else: "$message",
                                    },
                                },

                                createdAt: 1,
                                updatedAt: 1,
                                deletedAt: 1,
                            },
                        },
                    ],
                    total: [{ $count: "count" }],
                },
            },
        ]);

        const facet = aggregation[0];
        const rows = facet.docs as AggregatedReportRow[];
        const total = facet.total[0]?.count ?? 0;

        const docs: TourReportListItemDTO[] = rows.map(r => ({
            id: r._id.toString(),
            reporterId: r.reporterId.toString(),
            reporterName: r.reporterName,
            reporterAvatarUrl: r.reporterAvatarUrl,
            tourId: r.tourId.toString(),
            tourTitle: r.tourTitle,
            reason: r.reason,
            messageExcerpt: r.messageExcerpt,
            status: r.status,
            priority: r.priority,
            reopenedCount: r.reopenedCount,
            createdAt: r.createdAt.toISOString(),
            updatedAt: r.updatedAt.toISOString(),
            lastActivityAt: r.updatedAt.toISOString(),
            flags: r.tags ?? [],
            evidenceCount: r.evidenceCount,
        }));

        return {
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

async function getReportsHandler(
    request: NextRequest,
    { params }: { params: Promise<{ tourId: string }> }
): Promise<HandlerResult<TourReportsResponseDTO>> {
    const tourId = resolveMongoId((await params).tourId);

    if (!Types.ObjectId.isValid(tourId)) {
        throw new ApiError("Invalid tour ID", 400);
    }

    const sp = new URL(request.url).searchParams;

    const queryParams: ReportQueryParams = {
        page: Number(sp.get("page") ?? 1),
        limit: Number(sp.get("limit") ?? 10),
        sort: sp.get("sort") ?? "createdAt",
        order: (sp.get("order") as "asc" | "desc") ?? "desc",
        search: sp.get("search") ?? undefined,
        status: sp.get("status") as ReportStatus ?? undefined,
        priority: sp.get("priority") as ReportPriority ?? undefined,
        reason: sp.get("reason") ?? undefined,
        includeDeleted: sp.get("includeDeleted") === "true",
        onlyDeleted: sp.get("onlyDeleted") === "true",
    };

    const data = await ReportResponseService.getTourReports(tourId.toString(), queryParams);

    return { data, status: 200 };
}

export const GET = withErrorHandler(getReportsHandler);