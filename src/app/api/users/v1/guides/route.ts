// app/api/users/v1/guides/route.ts
import { NextRequest } from "next/server";
import mongoose, { FilterQuery, Types } from "mongoose";
import ConnectDB from "@/config/db";
import GuideModel, { IGuide } from "@/models/guide/guide.model";
import AssetModel from "@/models/asset.model";
import { GUIDE_DOCUMENT_TYPE, GUIDE_STATUS, GuideDocumentType } from "@/constants/guide.const";
import type { PendingGuideDTO } from "@/types/pendingGuide.types";
import { withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { withTransaction } from "@/lib/helpers/withTransaction";
import { AssetType } from "@/constants/asset.const";
import { PaginatedResponse } from "@/store/guide.store";

/* ------------------------------------------------------------------ */
/* Types (aligned with frontend store)                                 */
/* ------------------------------------------------------------------ */

type LeanGuideWithOwnerEmail = Omit<IGuide, "owner"> & {
    owner?: {
        name?: string;
        phone?: string;
        user?: {
            email?: string;
        };
    };
};

/* ------------------------------------------------------------------ */
/* Utils                                                              */
/* ------------------------------------------------------------------ */

const int = (v: string | null, d: number) => {
    const n = Number(v);
    return Number.isInteger(n) && n > 0 ? n : d;
};

const SORT_BY_MAP: Record<string, mongoose.SortOrder | string> = {
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    reviewedAt: "reviewedAt",
    status: "status",
    companyName: "companyName",
    name: "owner.name",
    appliedAt: "createdAt",
    email: "owner.user.email",
};

type assetUrlMapType = Map<
    string,
    {
        publicUrl?: string;
        assetType?: AssetType;
        title?: string;
    }
>;


/* ------------------------------------------------------------------ */
/* DTO mapper (NO N+1 queries)                                         */
/* ------------------------------------------------------------------ */

function mapGuideToDTO(
    guide: LeanGuideWithOwnerEmail,
    assetUrlMap: assetUrlMapType
): PendingGuideDTO {
    return {
        _id: String(guide._id),

        name: guide.owner?.name ?? guide.companyName,
        email: guide.owner?.user?.email ?? 'Undefined', // not stored on Guide
        phone: guide.owner?.phone,

        avatar: guide.logoUrl
            ? assetUrlMap.get(String(guide.logoUrl))?.publicUrl
            : undefined,

        companyName: guide.companyName,
        bio: guide.bio,

        address: guide.address
            ? {
                street: guide.address.street,
                city: guide.address.city,
                state: guide.address.division,
                country: guide.address.country,
                zip: guide.address.zip,
            }
            : undefined,

        social: guide.social?.length
            ? guide.social.map(s => `${s.platform}:${s.url}`).join(",")
            : undefined,

        documents: guide.documents.map(d => {
            const asset = assetUrlMap.get(String(d.AssetUrl));
            return {
                category: d.category,
                base64Content: asset?.publicUrl ?? "",
                fileType: (asset?.assetType as GuideDocumentType) ?? GUIDE_DOCUMENT_TYPE.IMAGE,
                fileName: asset?.title,
                uploadedAt: d.uploadedAt?.toISOString() ?? "",
            };
        }),

        status: guide.status,
        reviewComment: guide.reviewComment,
        reviewer: guide.reviewer?.toString(),

        appliedAt: guide.createdAt.toISOString(),
        reviewedAt: guide.reviewedAt?.toISOString(),
        createdAt: guide.createdAt.toISOString(),
        updatedAt: guide.updatedAt.toISOString(),
    };
}

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
    const search = searchParams.get("search")?.trim();

    const filter: FilterQuery<IGuide> = {};

    if (status && Object.values(GUIDE_STATUS).includes(status as GUIDE_STATUS)) {
        filter.status = status;
    }

    if (search) {
        filter.$or = [
            { companyName: { $regex: search, $options: "i" } },
            { "owner.name": { $regex: search, $options: "i" } },
            { "owner.user.email": { $regex: search, $options: "i" } },
        ];
    }

    const sortField = SORT_BY_MAP[sortBy] ?? "createdAt";
    const sort = { [sortField]: sortDir } as Record<string, 1 | -1>;

    return withTransaction(async (session) => {
        const skip = (page - 1) * pageSize;

        const [total, guides] = await Promise.all([
            GuideModel.countDocuments(filter).session(session),
            GuideModel.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(pageSize)
                .populate({
                    path: "owner.user",
                    select: "email",
                })
                .session(session)
                .lean<LeanGuideWithOwnerEmail[]>(),
        ]);

        /* ---------------------------------------------------------- */
        /* Resolve ALL assets in one query                            */
        /* ---------------------------------------------------------- */

        const assetIds = new Set<string>();

        for (const g of guides) {
            if (g.logoUrl) assetIds.add(String(g.logoUrl));
            g.documents.forEach(d => assetIds.add(String(d.AssetUrl)));
        }

        const assets = assetIds.size
            ? await AssetModel.find({ _id: { $in: [...assetIds].map(id => new Types.ObjectId(id)) } })
                .select({ publicUrl: 1, assetType: 1, title: 1 })
                .lean()
            : [];

        const assetUrlMap = new Map(
            assets.map(a => [String(a._id), {
                publicUrl: a.publicUrl,
                assetType: a.assetType,
                title: a.title,
            }])
        );

        const data = guides.map(g =>
            mapGuideToDTO(g, assetUrlMap)
        );

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
        }
    });
});