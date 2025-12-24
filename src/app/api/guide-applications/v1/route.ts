// app/api/guide-applications/v1/route.ts
import { NextRequest } from "next/server";
import mongoose, { Types } from "mongoose";

import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { withTransaction } from "@/lib/helpers/withTransaction";
import { AssetModel } from "@/models/asset.model";
import UserModel from "@/models/user.model";
import { getDocumentStorageProvider } from "@/lib/storage-providers";
import { STORAGE_PROVIDER, VISIBILITY } from "@/constants/asset.const";
import { GUIDE_DOCUMENT_CATEGORY, GUIDE_STATUS } from "@/constants/guide.const";
import { ASSET_TYPE } from "@/constants/asset.const";
import GuideModel from "@/models/guide/guide.model";
import { USER_ROLE } from "@/constants/user.const";
import { mailer } from "@/config/node-mailer";
import applicationSuccess from "@/utils/html/application-success.html";
import { DocumentFile, FormData, SegmentedDocuments } from "@/types/register-as-guide.types";
import ConnectDB from "@/config/db";

const DISALLOWED_ROLES: USER_ROLE[] = [
    USER_ROLE.TRAVELER,
    USER_ROLE.SUPPORT,
    USER_ROLE.ASSISTANT,
    USER_ROLE.ADMIN,
];

const ROLE_FRIENDLY_MESSAGE: Partial<Record<USER_ROLE, string>> = {
    [USER_ROLE.TRAVELER]: "A Traveler account already exists for this email.",
    [USER_ROLE.SUPPORT]: "This email is registered to a Support account and cannot be used to apply as a guide.",
    [USER_ROLE.ASSISTANT]: "This email belongs to an Assistant account and cannot be used to apply as a guide.",
    [USER_ROLE.ADMIN]: "This email belongs to an Admin account and cannot be used to apply as a guide.",
};

// Validation function
function validateFormData(body: FormData): body is FormData {
    if (!body) {
        throw new ApiError("Missing request body", 400);
    }

    const { personalInfo, companyDetails, documents } = body as FormData;

    if (!personalInfo?.email) {
        throw new ApiError("Email is required", 400);
    }

    if (!personalInfo?.name) {
        throw new ApiError("Name is required", 400);
    }

    if (!companyDetails?.companyName) {
        throw new ApiError("Company name is required", 400);
    }

    if (!documents) {
        throw new ApiError("Documents are required", 400);
    }

    // Require at least government ID and business license
    const hasGovernmentId = (documents.governmentId?.length ?? 0) > 0;
    const hasBusinessLicense = (documents.businessLicense?.length ?? 0) > 0;

    if (!hasGovernmentId || !hasBusinessLicense) {
        throw new ApiError("Both government ID and business license are required", 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(personalInfo.email)) {
        throw new ApiError("Invalid email format", 400);
    }

    return true;
}

// Document category mapping
const DOC_CATEGORY_MAP: Record<string, string> = {
    governmentId: GUIDE_DOCUMENT_CATEGORY.GOVERNMENT_ID,
    businessLicense: GUIDE_DOCUMENT_CATEGORY.BUSINESS_LICENSE,
    professionalPhoto: GUIDE_DOCUMENT_CATEGORY.PROFESSIONAL_PHOTO,
    certifications: GUIDE_DOCUMENT_CATEGORY.CERTIFICATION,
};

// Helper function to upload documents and create assets
async function uploadDocumentsAndCreateAssets(
    documents: SegmentedDocuments,
    session: mongoose.ClientSession
): Promise<{ category: string; assetId: Types.ObjectId }[]> {
    const storage = getDocumentStorageProvider(STORAGE_PROVIDER.CLOUDINARY);
    const uploadedAssets: { category: string; assetId: Types.ObjectId }[] = [];

    const segments = Object.keys(documents || {}) as (keyof SegmentedDocuments)[];

    for (const segment of segments) {
        const files = documents[segment] as DocumentFile[] | undefined;
        if (!files || files.length === 0) continue;

        for (const file of files) {
            try {
                // Upload to Cloudinary
                const uploaded = await storage.create(file.base64);

                // Create Asset record
                const assetDoc = await AssetModel.create(
                    [
                        {
                            storageProvider: STORAGE_PROVIDER.CLOUDINARY,
                            objectKey: uploaded.providerId,
                            publicUrl: uploaded.url,
                            contentType: uploaded.contentType || file.type || "application/octet-stream",
                            fileSize: uploaded.fileSize || file.size || 0,
                            checksum: uploaded.checksum || "",
                            assetType: ASSET_TYPE.DOCUMENT,
                            title: file.name || uploaded.fileName || "",
                            description: "",
                            tags: [],
                            visibility: VISIBILITY.PRIVATE,
                            deletedAt: null,
                        },
                    ],
                    { session }
                ).then((docs) => docs[0]);

                uploadedAssets.push({
                    category: DOC_CATEGORY_MAP[segment] || segment,
                    assetId: assetDoc._id as Types.ObjectId,
                });
            } catch (error: unknown) {
                let errorMessage = "";
                if (error instanceof Error) {
                    errorMessage = error.message;
                } else if (typeof error === "string") {
                    errorMessage = error;
                } else {
                    errorMessage = JSON.stringify(error);
                }
                throw new ApiError(`Failed to upload document: ${file.name}: ${errorMessage}`, 500);
            }
        }
    }

    return uploadedAssets;
}

// Main handler function
async function handlePostRequest(req: NextRequest) {
    const body = await req.json();

    // Validate form data
    validateFormData(body);
    const form: FormData = body;

    // Use withTransaction for proper session management
    const result = await withTransaction(async (session) => {

        await ConnectDB();

        // 1) Check if a user exists with this email
        const email = form.personalInfo.email.toLowerCase().trim();
        const existingUser = await UserModel.findOne({ email }).session(session);

        if (existingUser) {
            // Check if user is a traveler (has traveler role or default role)
            // Role conflict using enum array
            if (DISALLOWED_ROLES.includes(existingUser.role as USER_ROLE)) {
                const roleMessage = ROLE_FRIENDLY_MESSAGE[existingUser.role] ?? "An account already exists with this email.";
                throw new ApiError(`${roleMessage} If you believe this is an error, please contact support.`, 409);
            }
        }
        // User exists but is not a traveler - check if they're banned or suspended
        // Note: isBanned and isSuspended fields don't exist in your UserModel
        // If you have these fields, add them to your UserModel interface

        // 2) Create or get user (guide applicant)
        let user = existingUser;
        if (!user) {
            // Create new user with GUIDE_APPLICANT role
            user = await UserModel.create(
                [
                    {
                        email,
                        name: form.personalInfo.name,
                        phone: form.personalInfo.phone,
                        role: USER_ROLE.GUIDE,
                        // Note: Your UserModel requires password, but guide applicants might not have one
                        // You need to handle this differently - either make password optional or generate a random one
                        password: "temporary_password_123!", // TEMPORARY - you need a better solution
                    },
                ],
                { session }
            ).then((docs) => docs[0]);
        }
        if (!user) {
            throw new ApiError("Failed to create or retrieve user", 500);
        }

        // 3) Check existing guide application for this user
        const existingGuide = await GuideModel.findOne({ "owner.user": user._id }).session(session);

        if (existingGuide) {
            // Check if guide is banned (suspended indefinitely)
            if (existingGuide.isSuspended || existingGuide.suspension) {
                // Check if suspension is permanent or temporary
                const isSuspended = existingGuide.isSuspended ||
                    (existingGuide.suspension && existingGuide.suspension.until > new Date());

                if (isSuspended) {
                    throw new ApiError("Your guide account is currently suspended", 403);
                }
            }

            // Check guide status
            switch (existingGuide.status) {
                case GUIDE_STATUS.PENDING:
                    throw new ApiError("A guide application is already pending for this user", 409);
                case GUIDE_STATUS.APPROVED:
                    throw new ApiError("User is already an approved guide", 409);
                case GUIDE_STATUS.REJECTED:
                    // Allow re-application if previously rejected
                    // We'll update the existing rejected application
                    break;
            }
        }

        // 4) Upload documents and create assets
        const uploadedAssets = await uploadDocumentsAndCreateAssets(form.documents, session);

        // 5) Build Guide.documents array
        const guideDocuments = uploadedAssets.map((uploadedAsset) => ({
            category: uploadedAsset.category,
            AssetUrl: uploadedAsset.assetId,
            uploadedAt: new Date(),
        }));

        // 6) Find professional photo for logo
        const professionalPhotoAsset = uploadedAssets.find(
            (a) => a.category === GUIDE_DOCUMENT_CATEGORY.PROFESSIONAL_PHOTO
        );
        const logoAssetId = professionalPhotoAsset ? professionalPhotoAsset.assetId : undefined;

        // 7) Build social links with validation
        const socialLinks = (form.companyDetails.social || [])
            .filter((s) => s.platform && s.url)
            .map((s) => ({
                platform: s.platform,
                url: s.url,
            }));

        // 8) Prepare guide payload
        const guidePayload = {
            companyName: form.companyDetails.companyName,
            bio: form.companyDetails.bio || "",
            logoUrl: logoAssetId,
            social: socialLinks,
            owner: {
                user: user._id,
                name: form.personalInfo.name,
                phone: form.personalInfo.phone,
            },
            documents: guideDocuments,
            address: {
                country: form.personalInfo.country || "Bangladesh",
                division: form.personalInfo.division || "",
                city: form.personalInfo.city || "",
                zip: form.personalInfo.zip || "",
                street: form.personalInfo.street || "",
            },
            status: GUIDE_STATUS.PENDING as const,
            deletedAt: null,
        };

        // 9) Create or update guide
        let createdGuide;

        if (existingGuide && existingGuide.status === GUIDE_STATUS.REJECTED) {
            // Update existing rejected application
            createdGuide = await GuideModel.findByIdAndUpdate(
                existingGuide._id,
                { $set: guidePayload },
                { new: true, session, runValidators: true }
            );
        } else {
            // Create new guide application
            createdGuide = await GuideModel.create([guidePayload], { session }).then((docs) => docs[0]);
        }

        if (!createdGuide) {
            throw new ApiError("Failed to create or update guide application", 500);
        }

        return {
            message: "Guide application submitted successfully",
            guide: {
                id: createdGuide._id,
                status: createdGuide.status,
                companyName: createdGuide.companyName,
                owner: {
                    user: createdGuide.owner.user,
                    name: createdGuide.owner.name,
                    email: user.email,
                },
                accessToken: createdGuide.accessToken,
                appliedAt: createdGuide.createdAt,
            },
        };
    });

    await mailer(result.guide.owner.email, "Join As Guide Application", applicationSuccess(result.guide.owner.email, result.guide.accessToken))

    return result;
}

// Export the POST handler wrapped with error handler
export const POST = withErrorHandler(async (req: NextRequest) => {
    const result = await handlePostRequest(req);
    return { data: result, status: 201 };
});