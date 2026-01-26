// src/app/api/guide-applications/v1/route.ts
export const runtime = 'nodejs';
export const maxDuration = 300;
export const bodySizeLimit = '10mb';

import { NextRequest } from "next/server";
import mongoose, { Types } from "mongoose";

import ConnectDB from "@/config/db";
import { ApiError } from "@/lib/helpers/withErrorHandler";
import { withTransaction } from "@/lib/helpers/withTransaction";

import UserModel from "@/models/user.model";
import GuideModel, { IGuideDocument } from "@/models/guide/guide.model";

import { mailer } from "@/config/node-mailer";
import applicationSuccess from "@/lib/html/application-success.html";
import generateStrongPassword from "@/utils/helpers/generate-strong-password";

import { GUIDE_DOCUMENT_CATEGORY, GUIDE_STATUS } from "@/constants/guide.const";
import { USER_ROLE } from "@/constants/user.const";

import {
    FormData,
    SegmentedDocuments,
    DocumentFile,
} from "@/types/register-as-guide.types";
import { cleanupAssets } from "@/lib/cloudinary/delete.cloudinary";
import { uploadAssets } from "@/lib/cloudinary/upload.cloudinary";

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
        throw new ApiError("Government ID and Business License are required", 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(personalInfo.email)) {
        throw new ApiError("Invalid email format", 400);
    }
}

/* -------------------------------------------------------------------------- */
/*                       DOCUMENT UPLOAD & ASSET CREATION                      */
/* -------------------------------------------------------------------------- */

async function uploadDocuments(
    documents: SegmentedDocuments,
    session: mongoose.ClientSession
): Promise<{ category: GUIDE_DOCUMENT_CATEGORY; assetId: Types.ObjectId }[]> {

    const assets: {
        category: GUIDE_DOCUMENT_CATEGORY;
        assetId: Types.ObjectId;
    }[] = [];

    for (const [segment, files] of Object.entries(documents || {})) {
        if (!files?.length) continue;

        for (const file of files as DocumentFile[]) {

            // First await the uploadAssets promise
            const uploadedIds = await uploadAssets([{ base64: file.base64, name: file.name }], session);


            const assetId = uploadedIds[0]; // now this is safe
            if (!assetId) {
                throw new ApiError("Failed to create asset", 500);
            }

            assets.push({
                category: DOC_CATEGORY_MAP[segment],
                assetId
            });
        }
    }

    return assets;
}

/* -------------------------------------------------------------------------- */
/*                              MAIN POST HANDLER                              */
/* -------------------------------------------------------------------------- */

export default async function GuideAppPostHandler(req: NextRequest) {
    const body = await req.json();
    validateFormData(body);

    const form = body as FormData;
    const email = form.personalInfo.email.toLowerCase().trim();

    let plainPasswordForMail: string | null = null;

    await ConnectDB();

    const result = await withTransaction(async (session) => {
        /* ---------------------------------------------------------------------- */
        /* STEP 1: USER LOOKUP + ROLE CONFLICT CHECK                                */
        /* ---------------------------------------------------------------------- */

        let user = await UserModel.findOne({ email })
            .select("+password")
            .session(session);

        if (user && DISALLOWED_ROLES.includes(user.role as USER_ROLE)) {
            throw new ApiError(
                ROLE_FRIENDLY_MESSAGE[user.role] ?? "Account exists with this email.",
                409
            );
        }

        /* ---------------------------------------------------------------------- */
        /* STEP 2: CREATE USER IF NOT EXISTS                                        */
        /* ---------------------------------------------------------------------- */

        if (!user) {
            plainPasswordForMail = generateStrongPassword(10);

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
            ).then((d) => d[0]);
        }

        if (!user) {
            throw new ApiError("User creation failed", 500);
        }

        /* ---------------------------------------------------------------------- */
        /* STEP 3: CHECK EXISTING GUIDE APPLICATION                                 */
        /* ---------------------------------------------------------------------- */

        const existingGuide = await GuideModel.findOne({
            "owner.user": user._id,
        })
            .select("+accessToken")
            .session(session);

        if (existingGuide?.status === GUIDE_STATUS.PENDING) {
            throw new ApiError("Guide application already pending", 409);
        }

        if (existingGuide?.status === GUIDE_STATUS.APPROVED) {
            throw new ApiError("User is already an approved guide", 409);
        }

        /* STEP 3.1: CLEAN OLD ASSETS IF REJECTED */

        if (existingGuide?.status === GUIDE_STATUS.REJECTED) {
            const assetIds = existingGuide.documents.map((d: IGuideDocument) => d.AssetUrl);
            await cleanupAssets(assetIds, session);
        }

        /* ---------------------------------------------------------------------- */
        /* STEP 4: UPLOAD DOCUMENTS                                                 */
        /* ---------------------------------------------------------------------- */

        const uploadedAssets = await uploadDocuments(form.documents, session);

        const documents = uploadedAssets.map((a) => ({
            category: a.category,
            AssetUrl: a.assetId,
            uploadedAt: new Date(),
        }));

        const logo =
            uploadedAssets.find(
                (a) => a.category === GUIDE_DOCUMENT_CATEGORY.PROFESSIONAL_PHOTO
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
            accessToken: existingGuide?.accessToken ?? generateStrongPassword(20),
        };

        /* ---------------------------------------------------------------------- */
        /* STEP 6: CREATE OR UPDATE GUIDE                                           */
        /* ---------------------------------------------------------------------- */

        const guide =
            existingGuide?.status === GUIDE_STATUS.REJECTED
                ? await GuideModel.findByIdAndUpdate(
                    existingGuide._id,
                    { $set: guidePayload },
                    { new: true, session, select: "+accessToken" }
                )
                : await GuideModel.create([guidePayload], { session }).then(
                    (d) => d[0]
                );

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
            plainPasswordForMail ??
            "You'r current password will be your next temporary password."
        )
    );

    return {
        data: {
            message: "Guide application submitted successfully",
            guideId: result.guide._id,
            status: result.guide.status,
        },
        status: 201,
    };
}