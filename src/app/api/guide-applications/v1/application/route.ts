// src/app/api/guide-applications/v1/application/route.ts
import { NextRequest } from "next/server";
import { Types } from "mongoose";
import UserModel from "@/models/user.model";
import {
    GUIDE_DOCUMENT_CATEGORY,
    GUIDE_SOCIAL_PLATFORM,
    GUIDE_STATUS,
} from "@/constants/guide.const";
import { Lean } from "@/types/mongoose-lean.types";
import GuideModel, { GuideSocialLink, IGuide, IGuideDocument } from "@/models/guide/guide.model";
import { DocumentFile, FormData, SegmentedDocuments } from "@/types/register-as-guide.types";
import ConnectDB from "@/config/db";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import AssetModel, { IAsset } from "@/models/assets/asset.model";
import { IAssetFile } from "@/models/assets/asset-file.model";

type AssetWithFileLean =
    Omit<IAsset, "file"> & {
        file?: Lean<IAssetFile>;
    } | null;

/** Helpers */
const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const isValidAccessToken = (token: string): boolean => {
    return typeof token === "string" && token.length === 20;
};

function mapCategoryToSegment(category: string): keyof SegmentedDocuments | null {
    switch (category) {
        case GUIDE_DOCUMENT_CATEGORY.GOVERNMENT_ID:
            return "governmentId";
        case GUIDE_DOCUMENT_CATEGORY.BUSINESS_LICENSE:
            return "businessLicense";
        case GUIDE_DOCUMENT_CATEGORY.PROFESSIONAL_PHOTO:
            return "professionalPhoto";
        case GUIDE_DOCUMENT_CATEGORY.CERTIFICATION:
            return "certifications";
        default:
            return null;
    }
}

function buildDocumentFileFromAsset(
    asset: AssetWithFileLean
): DocumentFile {

    const file = asset?.file;

    if (!file) {
        return {
            name: asset?.title || String(asset?._id),
            base64: "",
            uploadedAt: asset?.createdAt
                ? new Date(asset?.createdAt).toISOString()
                : new Date().toISOString(),
            type: "unknown",
            size: 0,
        };
    }

    const base64 = Buffer
        .from(file.publicUrl, "utf-8")
        .toString("base64");

    return {
        name: asset?.title || file?.objectKey || String(asset?._id),
        base64,
        uploadedAt: asset.createdAt
            ? new Date(asset.createdAt).toISOString()
            : new Date().toISOString(),
        type: file.contentType,
        size: file.fileSize,
    };
}


function buildDocumentFileFromGuideDoc(doc: Lean<IGuideDocument>): DocumentFile {
    // Guide documents only have AssetUrl (ObjectId reference), not direct file properties
    // We need to handle this case differently since we can't get file info from just an ObjectId
    return {
        name: "Document from Guide",
        base64: "",
        uploadedAt: doc.uploadedAt ? new Date(doc.uploadedAt).toISOString() : new Date().toISOString(),
        type: "unknown",
        size: 0,
    };
}

/**
 * POST handler for Next.js App Router
 * Example: POST /api/guide-applications?email=foo@bar.com&accessToken=xxxxxxxxxxxxxxxxxxxx
 */
export const POST = withErrorHandler(async (request: NextRequest) => {

    const { email, accessToken } = await request.json();

    if (!email || !isValidEmail(email)) {
        throw new ApiError("Please enter a valid email address", 400)
    }

    if (!accessToken || !isValidAccessToken(accessToken)) {
        throw new ApiError("Invalid access token", 400)
    }

    ConnectDB();

    // Find user by email
    const user = await UserModel.findOne({ email }).lean();
    if (!user) {
        throw new ApiError("User not found", 404)
    }

    // Find guide by accessToken and owner.user === user._id
    const guide = await GuideModel.findOne({
        accessToken,
        "owner.user": user._id as Types.ObjectId,
    }).lean() as Lean<IGuide> | null;

    if (!guide) {
        throw new ApiError("Guide application not found for provided token and email", 404)
    }

    // Only allow search for pending guides
    if (guide.status !== GUIDE_STATUS.PENDING) {
        throw new ApiError("Only pending applications can be fetched", 403)
    }

    // Build base FormData
    const formData: FormData = {
        personalInfo: {
            name: user?.name ?? "",
            email,
            phone: guide.owner?.phone ?? "",
            street: guide.address?.street ?? "",
            zip: guide.address?.zip ?? "",
            city: guide.address?.city ?? "",
            division: guide.address?.division ?? "",
            country: guide.address?.country ?? "Bangladesh",
        },
        companyDetails: {
            companyName: guide.companyName ?? "",
            bio: guide.bio ?? "",
            social: Array.isArray(guide.social) && guide.social.length
                ? (guide.social as Lean<GuideSocialLink>[]).map((s) => ({
                    platform: s.platform as GUIDE_SOCIAL_PLATFORM,
                    url: s.url,
                }))
                : [{ platform: GUIDE_SOCIAL_PLATFORM.FACEBOOK, url: "" }],
        },
        documents: {
            governmentId: [],
            businessLicense: [],
            professionalPhoto: [],
            certifications: [],
        },
    };

    // guide.documents is expected to be an array of IGuideDocument-like objects
    const docs: Lean<IGuideDocument>[] = Array.isArray(guide.documents) ? (guide.documents as Lean<IGuideDocument>[]) : [];

    for (const doc of docs) {
        const segmentKey = mapCategoryToSegment(String(doc.category));
        if (!segmentKey) continue;

        let asset: AssetWithFileLean = null;

        // Guide documents store AssetUrl as ObjectId, not fileUrl
        if (doc.AssetUrl) {
            // AssetUrl is already a Types.ObjectId in the IGuideDocument interface
            asset = await AssetModel.findOne({
                _id: doc.AssetUrl,
                deletedAt: null
            })
                .populate({
                    path: "file",
                    select: "publicUrl contentType fileSize objectKey",
                })
                .lean() as AssetWithFileLean;
        }

        const documentFile: DocumentFile = asset
            ? buildDocumentFileFromAsset(asset)
            : buildDocumentFileFromGuideDoc(doc);

        // Each segment array must contain only one value
        formData.documents[segmentKey] = [documentFile];
    }

    return { data: formData, status: 200 };

})