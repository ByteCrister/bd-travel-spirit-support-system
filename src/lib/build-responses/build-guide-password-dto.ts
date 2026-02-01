import mongoose, { ClientSession, PipelineStage } from "mongoose";
import { FORGOT_PASSWORD_STATUS, ForgotPasswordStatus } from "@/constants/guide-forgot-password.const";
import { PasswordRequestDto } from "@/types/guide-forgot-password.types";
import { ApiError } from "../helpers/withErrorHandler";
import GuideForgotPasswordModel from "@/models/guide/guide-forgot-password.model";

/**
 * Strongly typed aggregation row
 */
interface AggregatedRequestRow {
    _id: mongoose.Types.ObjectId;
    guideId: mongoose.Types.ObjectId;
    reason: string;
    status: ForgotPasswordStatus;
    rejectionReason?: string | null;
    expiresAt: Date;
    emailSentAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;

    user: {
        _id: mongoose.Types.ObjectId;
        name: string;
        email: string;
        avatarUrl: string | null;
    };

    reviewer?: {
        _id: mongoose.Types.ObjectId;
        name: string;
        email: string;
        avatarUrl: string | null;
    } | null;
}

/**
 * Build PasswordRequestDto using PURE aggregation (no extra queries)
 */
export async function buildGuidePasswordDto(
    id: string,
    session?: ClientSession
): Promise<PasswordRequestDto> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError("Invalid request ID format", 400);
    }

    const objectId = new mongoose.Types.ObjectId(id);

    const pipeline: PipelineStage[] = [
        { $match: { _id: objectId } },

        // GUIDE -> OWNER USER
        {
            $lookup: {
                from: "guides",
                localField: "guideId",
                foreignField: "_id",
                as: "guide",
            },
        },
        { $unwind: "$guide" },

        {
            $lookup: {
                from: "users",
                localField: "guide.owner.user",
                foreignField: "_id",
                as: "user",
            },
        },
        { $unwind: "$user" },

        // OWNER AVATAR CHAIN
        {
            $lookup: {
                from: "assets",
                localField: "user.avatar",
                foreignField: "_id",
                as: "userAsset",
            },
        },
        {
            $unwind: {
                path: "$userAsset",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: "assetfiles",
                localField: "userAsset.file",
                foreignField: "_id",
                as: "userAssetFile",
            },
        },
        {
            $unwind: {
                path: "$userAssetFile",
                preserveNullAndEmptyArrays: true,
            },
        },

        // REVIEWER LOOKUP
        {
            $lookup: {
                from: "users",
                localField: "reviewedBy",
                foreignField: "_id",
                as: "reviewer",
            },
        },
        {
            $unwind: {
                path: "$reviewer",
                preserveNullAndEmptyArrays: true,
            },
        },

        // REVIEWER AVATAR CHAIN
        {
            $lookup: {
                from: "assets",
                localField: "reviewer.avatar",
                foreignField: "_id",
                as: "reviewerAsset",
            },
        },
        {
            $unwind: {
                path: "$reviewerAsset",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: "assetfiles",
                localField: "reviewerAsset.file",
                foreignField: "_id",
                as: "reviewerAssetFile",
            },
        },
        {
            $unwind: {
                path: "$reviewerAssetFile",
                preserveNullAndEmptyArrays: true,
            },
        },

        // FINAL SHAPE
        {
            $project: {
                _id: 1,
                guideId: 1,
                reason: 1,
                status: 1,
                rejectionReason: { $ifNull: ["$rejectionReason", null] },
                expiresAt: 1,
                emailSentAt: { $ifNull: ["$emailSentAt", null] },
                createdAt: 1,
                updatedAt: 1,

                user: {
                    _id: "$user._id",
                    name: "$user.name",
                    email: "$user.email",
                    avatarUrl: {
                        $ifNull: ["$userAssetFile.publicUrl", null],
                    },
                },

                reviewer: {
                    $cond: {
                        if: { $ifNull: ["$reviewedBy", false] },
                        then: {
                            _id: "$reviewer._id",
                            name: "$reviewer.name",
                            email: "$reviewer.email",
                            avatarUrl: {
                                $ifNull: ["$reviewerAssetFile.publicUrl", null],
                            },
                        },
                        else: null,
                    },
                },
            },
        },
    ];

    const results: AggregatedRequestRow[] =
        await GuideForgotPasswordModel.aggregate(pipeline).session(
            session ?? null
        );

    if (!results || results.length === 0) {
        throw new ApiError("Password reset request not found", 404);
    }

    const r = results[0];

    const isExpired =
        new Date(r.expiresAt) < new Date() &&
        ![
            FORGOT_PASSWORD_STATUS.APPROVED,
            FORGOT_PASSWORD_STATUS.REJECTED,
            FORGOT_PASSWORD_STATUS.EXPIRED,
        ].includes(r.status as FORGOT_PASSWORD_STATUS);

    const finalStatus = isExpired
        ? FORGOT_PASSWORD_STATUS.EXPIRED
        : r.status;

    return {
        id: r._id.toString(),
        user: {
            guideId: r.guideId.toString(),
            name: r.user.name,
            email: r.user.email,
            avatarUrl: r.user.avatarUrl,
        },
        reviewer: r.reviewer
            ? {
                reviewedById: r.reviewer._id.toString(),
                reviewerName: r.reviewer.name,
                reviewerEmail: r.reviewer.email,
                reviewerAvatarUrl: r.reviewer.avatarUrl,
            }
            : null,
        reason: r.reason,
        status: finalStatus,
        rejectionReason: r.rejectionReason ?? null,
        expiresAt: r.expiresAt.toISOString(),
        emailSentAt: r.emailSentAt?.toISOString() || null,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
    };
}