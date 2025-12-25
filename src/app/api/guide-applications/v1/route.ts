import { NextRequest } from "next/server";
import mongoose, { Types } from "mongoose";

import ConnectDB from "@/config/db";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { withTransaction } from "@/lib/helpers/withTransaction";

import UserModel from "@/models/user.model";
import GuideModel, { IGuideDocument } from "@/models/guide/guide.model";
import { AssetModel } from "@/models/asset.model";

import { mailer } from "@/config/node-mailer";
import applicationSuccess from "@/utils/html/application-success.html";
import generateStrongPassword from "@/utils/helpers/generate-strong-password";

import { getDocumentStorageProvider } from "@/lib/storage-providers";
import { STORAGE_PROVIDER, VISIBILITY, ASSET_TYPE } from "@/constants/asset.const";
import { GUIDE_DOCUMENT_CATEGORY, GUIDE_STATUS } from "@/constants/guide.const";
import { USER_ROLE } from "@/constants/user.const";

import {
    FormData,
    SegmentedDocuments,
    DocumentFile,
} from "@/types/register-as-guide.types";
import { base64ToBuffer, sha256 } from "@/lib/helpers/convert";

/**
 * 
Rejected Guide
   ↓
Delete old assets (Cloudinary + soft delete DB)
   ↓
Upload new documents
   ↓
Create new AssetModel records
   ↓
Replace guide.documents array
   ↓
Reset status → PENDING
 */

/* -------------------------------------------------------------------------- */
/*                               CONFIG & MAPS                                */
/* -------------------------------------------------------------------------- */

const DISALLOWED_ROLES: USER_ROLE[] = [
    USER_ROLE.TRAVELER,
    USER_ROLE.SUPPORT,
    USER_ROLE.ASSISTANT,
    USER_ROLE.ADMIN,
];

const ROLE_FRIENDLY_MESSAGE: Partial<Record<USER_ROLE, string>> = {
    [USER_ROLE.TRAVELER]: "A Traveler account already exists for this email.",
    [USER_ROLE.SUPPORT]: "This email belongs to a Support account.",
    [USER_ROLE.ASSISTANT]: "This email belongs to an Assistant account.",
    [USER_ROLE.ADMIN]: "This email belongs to an Admin account.",
};

const DOC_CATEGORY_MAP: Record<string, GUIDE_DOCUMENT_CATEGORY> = {
    governmentId: GUIDE_DOCUMENT_CATEGORY.GOVERNMENT_ID,
    businessLicense: GUIDE_DOCUMENT_CATEGORY.BUSINESS_LICENSE,
    professionalPhoto: GUIDE_DOCUMENT_CATEGORY.PROFESSIONAL_PHOTO,
    certifications: GUIDE_DOCUMENT_CATEGORY.CERTIFICATION,
};

/* -------------------------------------------------------------------------- */
/*                              VALIDATION LAYER                               */
/* -------------------------------------------------------------------------- */

function validateFormData(body: unknown): asserts body is FormData {
    if (!body) throw new ApiError("Missing request body", 400);

    const { personalInfo, companyDetails, documents } = body as FormData;

    if (!personalInfo?.email) throw new ApiError("Email is required", 400);
    if (!personalInfo?.name) throw new ApiError("Name is required", 400);
    if (!companyDetails?.companyName)
        throw new ApiError("Company name is required", 400);

    const hasGovId = (documents?.governmentId?.length ?? 0) > 0;
    const hasBiz = (documents?.businessLicense?.length ?? 0) > 0;

    if (!hasGovId || !hasBiz) {
        throw new ApiError(
            "Government ID and Business License are required",
            400
        );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(personalInfo.email)) {
        throw new ApiError("Invalid email format", 400);
    }
}

function assertValidDataUrl(base64: string): string {
    if (typeof base64 !== "string") {
        throw new ApiError("Invalid file format", 400);
    }

    const match = base64.match(
        /^data:([\w.+-\/]+);base64,([A-Za-z0-9+/=]+)$/
    );

    if (!match) {
        throw new ApiError("Malformed base64 data URL", 400);
    }

    const [, mimeType, data] = match;

    // Allow all images, PDF, and DOCX
    const isImage = mimeType.startsWith("image/");
    const isPdf = mimeType === "application/pdf";
    const isDocx =
        mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    if (!isImage && !isPdf && !isDocx) {
        throw new ApiError("Unsupported file type", 400);
    }

    // Basic base64 sanity check
    if (data.length < 10) {
        throw new ApiError("Invalid base64 payload", 400);
    }

    // Return normalized data URL (Cloudinary safe)
    return `data:${mimeType};base64,${data}`;
}

/* -------------------------------------------------------------------------- */
/*                       DOCUMENT UPLOAD & ASSET CREATION                      */
/* -------------------------------------------------------------------------- */

async function uploadDocuments(
    documents: SegmentedDocuments,
    session: mongoose.ClientSession
): Promise<{ category: GUIDE_DOCUMENT_CATEGORY; assetId: Types.ObjectId }[]> {
    const storage = getDocumentStorageProvider(STORAGE_PROVIDER.CLOUDINARY);
    const assets: { category: GUIDE_DOCUMENT_CATEGORY; assetId: Types.ObjectId }[] = [];

    for (const [segment, files] of Object.entries(documents || {})) {
        if (!files?.length) continue;

        for (const file of files as DocumentFile[]) {
            // 1 Validate and normalize base64
            const dataUrl = assertValidDataUrl(file.base64);

            // 2 Compute checksum BEFORE sending to Cloudinary
            const buffer = base64ToBuffer(dataUrl);
            const checksum = sha256(buffer);

            // 3 Upload to Cloudinary
            const uploaded = await storage.create(dataUrl);

            // 4 Save in AssetModel with checksum
            const asset = await AssetModel.create(
                [
                    {
                        storageProvider: STORAGE_PROVIDER.CLOUDINARY,
                        objectKey: uploaded.providerId,
                        publicUrl: uploaded.url,
                        contentType: uploaded.contentType ?? file.type,
                        fileSize: uploaded.fileSize ?? file.size,
                        checksum,
                        assetType: ASSET_TYPE.DOCUMENT,
                        title: file.name,
                        visibility: VISIBILITY.PRIVATE,
                    },
                ],
                { session }
            ).then(d => d[0]);

            if (!asset?._id) {
                throw new ApiError("Failed to create asset", 500);
            }

            assets.push({
                category: DOC_CATEGORY_MAP[segment],
                assetId: asset._id as Types.ObjectId,
            });
        }
    }

    return assets;
}

async function cleanupGuideAssets(
    guide: typeof GuideModel.prototype,
    session: mongoose.ClientSession
) {
    if (!guide.documents?.length) return;

    // 1. Load assets
    const assetIds = guide.documents.map((d: IGuideDocument) => d.AssetUrl);

    const assets = await AssetModel.find({
        _id: { $in: assetIds },
        deletedAt: null,
    }).session(session);

    const storage = getDocumentStorageProvider(STORAGE_PROVIDER.CLOUDINARY);

    // 2. Delete from Cloudinary (outside DB concerns)
    for (const asset of assets) {
        try {
            await storage.delete(asset.objectKey);
        } catch (err) {
            // Log but do not crash — Cloudinary delete should be idempotent
            console.error("Cloudinary delete failed:", asset.objectKey, err);
        }
    }

    // 3. Soft-delete in DB (transaction-safe)
    await AssetModel.softDeleteMany({
        _id: { $in: assetIds },
    });
    //! ------------ I will put cron actions to delete asset document permanently --------------
}


/* -------------------------------------------------------------------------- */
/*                              MAIN POST HANDLER                              */
/* -------------------------------------------------------------------------- */

async function handlePost(req: NextRequest) {
    const body = await req.json();
    validateFormData(body);

    const form = body as FormData;
    const email = form.personalInfo.email.toLowerCase().trim();

    let plainPasswordForMail: string | null = null;

    const result = await withTransaction(async (session) => {
        /* ---------------------------------------------------------------------- */
        /* STEP 1: USER LOOKUP + ROLE CONFLICT CHECK                                */
        /* ---------------------------------------------------------------------- */

        let user = await UserModel.findOne({ email }).select("+password").session(session);

        if (user && DISALLOWED_ROLES.includes(user.role as USER_ROLE)) {
            throw new ApiError(
                ROLE_FRIENDLY_MESSAGE[user.role] ??
                "Account exists with this email.",
                409
            );
        }

        /* ---------------------------------------------------------------------- */
        /* STEP 2: CREATE USER IF NOT EXISTS                                        */
        /* ---------------------------------------------------------------------- */

        if (!user) {
            plainPasswordForMail = generateStrongPassword(12);

            user = await UserModel.create(
                [
                    {
                        email,
                        name: form.personalInfo.name,
                        role: USER_ROLE.GUIDE,
                        password: plainPasswordForMail, // hashed by model hook
                    },
                ],
                { session }
            ).then(d => d[0]);
        } else {
            plainPasswordForMail = user.password
        }

        if (!user) {
            throw new ApiError("User creation failed", 500);
        }

        /* ---------------------------------------------------------------------- */
        /* STEP 3: CHECK EXISTING GUIDE APPLICATION                                 */
        /* ---------------------------------------------------------------------- */

        const existingGuide = await GuideModel.findOne({
            "owner.user": user._id,
        }).session(session);

        if (existingGuide?.status === GUIDE_STATUS.PENDING) {
            throw new ApiError("Guide application already pending", 409);
        }

        if (existingGuide?.status === GUIDE_STATUS.APPROVED) {
            throw new ApiError("User is already an approved guide", 409);
        }

        /* STEP 3.1: CLEAN OLD ASSETS IF REJECTED */

        if (existingGuide?.status === GUIDE_STATUS.REJECTED) {
            await cleanupGuideAssets(existingGuide, session);
        }

        /* ---------------------------------------------------------------------- */
        /* STEP 4: UPLOAD DOCUMENTS                                                 */
        /* ---------------------------------------------------------------------- */

        const uploadedAssets = await uploadDocuments(form.documents, session);

        const documents = uploadedAssets.map(a => ({
            category: a.category,
            AssetUrl: a.assetId,
            uploadedAt: new Date(),
        }));

        const logo =
            uploadedAssets.find(
                a => a.category === GUIDE_DOCUMENT_CATEGORY.PROFESSIONAL_PHOTO
            )?.assetId ?? undefined;

        /* ---------------------------------------------------------------------- */
        /* STEP 5: BUILD GUIDE PAYLOAD                                              */
        /* ---------------------------------------------------------------------- */

        const guidePayload = {
            companyName: form.companyDetails.companyName,
            bio: form.companyDetails.bio ?? "",
            logoUrl: logo,
            documents,
            owner: {
                user: user._id,
                name: form.personalInfo.name,
                phone: form.personalInfo.phone,
            },
            address: {
                country: "Bangladesh",
                division: form.personalInfo.division,
                city: form.personalInfo.city,
                zip: form.personalInfo.zip,
                street: form.personalInfo.street,
            },
            status: GUIDE_STATUS.PENDING,
            accessToken: existingGuide?.accessToken || generateStrongPassword(20),
        };

        /* ---------------------------------------------------------------------- */
        /* STEP 6: CREATE OR UPDATE GUIDE                                           */
        /* ---------------------------------------------------------------------- */

        const guide =
            existingGuide?.status === GUIDE_STATUS.REJECTED
                ? await GuideModel.findByIdAndUpdate(
                    existingGuide._id,
                    { $set: guidePayload },
                    { new: true, session }
                )
                : await GuideModel.create([guidePayload], { session }).then(d => d[0]);

        if (!user) {
            throw new ApiError("Invariant violation: user missing", 500);
        }

        if (!guide) {
            throw new ApiError("Invariant violation: guide missing", 500);
        }

        return {
            guide,
            user,
        };
    });

    /* ------------------------------------------------------------------------ */
    /* STEP 7: SEND EMAIL (OUTSIDE TRANSACTION)                                  */
    /* ------------------------------------------------------------------------ */

    await mailer(
        result.user.email,
        plainPasswordForMail
            ? "Your Guide Account Credentials"
            : "Guide Application Submitted",
        applicationSuccess(
            result.user.email,
            result.guide.accessToken,
            plainPasswordForMail ?? "You'r current password will be your next temporary password."
        )
    );

    return {
        message: "Guide application submitted successfully",
        guideId: result.guide._id,
        status: result.guide.status,
    };
}

/* -------------------------------------------------------------------------- */
/*                                   EXPORT                                   */
/* -------------------------------------------------------------------------- */

export const POST = withErrorHandler(async (req: NextRequest) => {
    await ConnectDB();
    return { data: await handlePost(req), status: 201 };
});