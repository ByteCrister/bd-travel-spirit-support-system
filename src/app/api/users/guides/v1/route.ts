// app/api/users/v1/guides/route.ts

import { NextRequest } from "next/server";
import { FilterQuery, Types, PipelineStage } from "mongoose";
import ConnectDB from "@/config/db";
import GuideModel, { IGuide } from "@/models/guide/guide.model";
import { GUIDE_DOCUMENT_TYPE, GUIDE_STATUS, GuideDocumentCategory, GuideDocumentType } from "@/constants/guide.const";
import type { PendingGuideDTO } from "@/types/guide/pendingGuide.types";
import { withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { withTransaction } from "@/lib/helpers/withTransaction";
import { PaginatedResponse } from "@/store/guide/guide.store";
import { sanitizeSearch } from "@/lib/helpers/sanitize-search";
import UserModel from "@/models/user.model";
import { AssetType } from "@/constants/asset.const";
import { getCollectionName } from "@/lib/helpers/get-collection-name";
import AssetModel from "@/models/assets/asset.model";
import AssetFileModel from "@/models/assets/asset-file.model";

export interface AggregatedAssetFile {
    _id: Types.ObjectId;
    publicUrl?: string | null;
}

export interface AggregatedAsset {
    _id: Types.ObjectId;
    title?: string | null;
    assetType?: AssetType;
    file?: Types.ObjectId;
}

export interface AggregatedDocument {
    category: string;
    AssetUrl: Types.ObjectId;
    assetType?: GuideDocumentType;
    uploadedAt?: Date | null;
}

export interface AggregatedAddress {
    street?: string;
    city?: string;
    division?: string;
    country?: string;
    zip?: string;
}

export interface AggregatedSocial {
    platform: string;
    url: string;
}

export interface AggregatedSuspension {
    until?: Date | null;
    reason?: string | null;
}

/**
 * This represents ONE guide AFTER aggregation
 */
export interface AggregatedGuide {
    _id: Types.ObjectId;

    // computed fields from $project
    name: string;
    email: string;
    phone?: string;

    avatar?: string | null; // logoFile.publicUrl

    companyName: string;
    bio?: string | null;
    address?: AggregatedAddress | null;
    social?: AggregatedSocial[] | null;

    documents: Array<{
        category: GuideDocumentCategory;
        base64Content?: AggregatedAssetFile | null; // matched file object
        fileType?: AssetType;
        fileName?: string | null; // matched asset object
        uploadedAt?: Date | null;
    }>;

    status: GUIDE_STATUS;
    reviewComment?: string | null;
    reviewer?: Types.ObjectId | null;

    suspension?: AggregatedSuspension | null;

    appliedAt: Date;
    reviewedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

/* ------------------------------------------------------------------ */
/* Utils                                                              */
/* ------------------------------------------------------------------ */

const int = (v: string | null, d: number) => {
    const n = Number(v);
    return Number.isInteger(n) && n > 0 ? n : d;
};

const SORT_BY_MAP: Record<string, string> = {
    name: "name",
    email: "email",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    reviewedAt: "reviewedAt",
    status: "status",
    companyName: "companyName",
    appliedAt: "createdAt",
};

/* ------------------------------------------------------------------ */
/* GET Handler                                                        */
/* ------------------------------------------------------------------ */

export const GET = withErrorHandler(async (req: NextRequest) => {
    await ConnectDB();

    const { searchParams } = new URL(req.url);

    const page = int(searchParams.get("page"), 1);
    const pageSize = int(searchParams.get("pageSize"), 20);
    const sortBy = searchParams.get("sortBy") ?? "createdAt";
    const sortDir = searchParams.get("sortDir") === "asc" ? 1 : -1;
    const status = searchParams.get("status");

    const rawSearch = decodeURIComponent(searchParams.get("search") ?? "");
    const search = sanitizeSearch(rawSearch);

    const filter: FilterQuery<IGuide> = {};

    if (status && Object.values(GUIDE_STATUS).includes(status as GUIDE_STATUS)) {
        filter.status = status;
    }

    return withTransaction(async (session) => {
        let userIds: Types.ObjectId[] = [];

        if (search) {
            const users = await UserModel.find(
                {
                    $or: [
                        { name: { $regex: search, $options: "i" } },
                        { email: { $regex: search, $options: "i" } },
                    ],
                },
                { _id: 1 }
            )
                .lean()
                .session(session);

            userIds = users.map((u) => u._id as Types.ObjectId);

            filter.$or = [
                { companyName: { $regex: search, $options: "i" } },
                ...(userIds.length ? [{ "owner.user": { $in: userIds } }] : []),
            ];
        }

        const sortField = SORT_BY_MAP[sortBy] ?? "createdAt";

        const skip = (page - 1) * pageSize;

        const pipeline: PipelineStage[] = [
            { $match: filter },

            {
                $lookup: {
                    from: getCollectionName(UserModel),
                    localField: "owner.user",
                    foreignField: "_id",
                    as: "ownerUser",
                },
            },

            {
                $lookup: {
                    from: getCollectionName(AssetModel),
                    localField: "logoUrl",
                    foreignField: "_id",
                    as: "logoAsset",
                },
            },

            {
                $lookup: {
                    from: getCollectionName(AssetModel),
                    localField: "documents.AssetUrl",
                    foreignField: "_id",
                    as: "documentAssets",
                },
            },

            {
                $lookup: {
                    from: getCollectionName(AssetFileModel),
                    localField: "logoAsset.file",
                    foreignField: "_id",
                    as: "logoFile",
                },
            },

            {
                $lookup: {
                    from: getCollectionName(AssetFileModel),
                    localField: "documentAssets.file",
                    foreignField: "_id",
                    as: "documentFiles",
                },
            },

            {
                $addFields: {
                    ownerUser: { $arrayElemAt: ["$ownerUser", 0] },
                    logoAsset: { $arrayElemAt: ["$logoAsset", 0] },
                    logoFile: { $arrayElemAt: ["$logoFile", 0] },
                    name: {
                        $ifNull: ["$ownerUser.name", "$companyName"],
                    },
                    email: {
                        $ifNull: ["$ownerUser.email", "Undefined"],
                    },
                },
            },

            {
                $addFields: {
                    name: {
                        $ifNull: ["$ownerUser.name", "$companyName"],
                    },
                    email: {
                        $ifNull: ["$ownerUser.email", "Undefined"],
                    },
                },
            },

            {
                $project: {
                    _id: 1,
                    name: {
                        $ifNull: ["$ownerUser.name", "$companyName"],
                    },
                    email: {
                        $ifNull: ["$ownerUser.email", "Undefined"],
                    },
                    phone: "$owner.phone",
                    avatar: "$logoFile.publicUrl",
                    companyName: 1,
                    bio: 1,
                    address: 1,
                    social: 1,
                    documents: {
                        $map: {
                            input: "$documents",
                            as: "doc",
                            in: {
                                category: "$$doc.category",

                                base64Content: {
                                    $let: {
                                        vars: {
                                            matchedAsset: {
                                                $arrayElemAt: [
                                                    {
                                                        $filter: {
                                                            input: "$documentAssets",
                                                            as: "a",
                                                            cond: { $eq: ["$$a._id", "$$doc.AssetUrl"] },
                                                        },
                                                    },
                                                    0,
                                                ],
                                            },
                                        },
                                        in: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: "$documentFiles",
                                                        as: "f",
                                                        cond: {
                                                            $eq: ["$$f._id", "$$matchedAsset.file"],
                                                        },
                                                    },
                                                },
                                                0,
                                            ],
                                        },
                                    },
                                },


                                fileType: "$$doc.assetType",

                                fileName: {
                                    $arrayElemAt: [
                                        {
                                            $map: {
                                                input: {
                                                    $filter: {
                                                        input: "$documentAssets",
                                                        as: "a",
                                                        cond: { $eq: ["$$a._id", "$$doc.AssetUrl"] },
                                                    },
                                                },
                                                as: "asset",
                                                in: "$$asset.title",   //  only title now
                                            },
                                        },
                                        0,
                                    ],
                                },

                                uploadedAt: "$$doc.uploadedAt",
                            },
                        },
                    },

                    status: 1,
                    reviewComment: 1,
                    reviewer: 1,
                    "suspension.until": 1,
                    "suspension.reason": 1,
                    appliedAt: "$createdAt",
                    reviewedAt: 1,
                    createdAt: 1,
                    updatedAt: 1,
                },
            },

            { $sort: { [sortField]: sortDir } },
            { $skip: skip },
            { $limit: pageSize },
        ];

        const [total, guides] = await Promise.all([
            GuideModel.countDocuments(filter).session(session),
            GuideModel.aggregate<AggregatedGuide>(pipeline).session(session),
        ]);


        const data: PendingGuideDTO[] = guides.map((g) => ({
            _id: String(g._id),
            name: g.name,
            email: g.email,
            phone: g.phone,
            avatar: g.avatar ?? undefined,
            companyName: g.companyName,
            bio: g.bio ?? '-',
            address: g.address
                ? {
                    street: g.address.street,
                    city: g.address.city,
                    state: g.address.division,
                    country: g.address.country,
                    zip: g.address.zip,
                }
                : undefined,
            social: g.social?.length
                ? g.social.map((s) => `${s.platform}:${s.url}`).join(",")
                : undefined,
            documents: g.documents.map((d) => ({
                category: d.category,
                base64Content: d.base64Content?.publicUrl ?? "",
                fileType: d.fileType as GuideDocumentType ?? GUIDE_DOCUMENT_TYPE.IMAGE,
                fileName: d.fileName ?? '-',
                uploadedAt: d.uploadedAt?.toISOString() ?? "",
            })),
            status: g.status,
            reviewComment: g.reviewComment ?? "",
            reviewer: g.reviewer ? String(g.reviewer) : undefined,
            suspendedUntil: g.suspension?.until?.toISOString(),
            suspensionReason: g.suspension?.reason ?? "",
            appliedAt: g.appliedAt.toISOString(),
            reviewedAt: g.reviewedAt?.toISOString(),
            createdAt: g.createdAt.toISOString(),
            updatedAt: g.updatedAt.toISOString(),
        }));


        return {
            data: {
                data,
                total,
                page,
                pageSize,
                hasPrev: page > 1,
                hasNext: skip + data.length < total,
            } satisfies PaginatedResponse<PendingGuideDTO>,
            status: 200,
        };
    });
});