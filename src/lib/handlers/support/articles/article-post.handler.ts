// api/support/articles/v1/route.ts
import { NextRequest } from 'next/server';
import { Types } from 'mongoose';

import {
    CreateArticleInput
} from '@/types/article.types';

import { ARTICLE_STATUS } from '@/constants/article.const';
import { ApiError } from '@/lib/helpers/withErrorHandler';
import { withTransaction } from '@/lib/helpers/withTransaction';
import { TravelArticleModel } from '@/models/articles/travel-article.model';
import { getUserIdFromSession } from '@/lib/auth/session.auth';
import { validateUpdatedYupSchema } from '@/utils/validators/common/update-updated-yup-schema';
import { createArticleSchema } from '@/utils/validators/article.create.validator';
import { uploadAssets } from '@/lib/cloudinary/upload.cloudinary';
import { buildTourArticleDto } from '@/lib/build-responses/build-tour-article-dt';
import { ASSET_TYPE } from '@/constants/asset.const';
import ConnectDB from '@/config/db';
import { SlugService } from '@/lib/helpers/slug-services';
import VERIFY_USER_ROLE from '@/lib/auth/verify-user-role';

// Helper function to validate and prepare image assets
function prepareImageAssets(formData: CreateArticleInput) {
    const assetsToUpload: Array<{
        base64: string;
        name: string;
        assetType?: string;
    }> = [];

    // Process hero image if present
    if (formData.heroImage) {
        assetsToUpload.push({
            base64: formData.heroImage,
            name: `hero-${formData.title.slice(0, 20)}`,
            assetType: ASSET_TYPE.IMAGE,
        });
    }

    // Process destination images
    formData.destinations.forEach((destination, index) => {
        if (destination.imageAsset?.url) {
            assetsToUpload.push({
                base64: destination.imageAsset.url,
                name: `destination-${index}-${destination.area || destination.district}`,
                assetType: ASSET_TYPE.IMAGE,
            });
        }
    });

    // Process OG image if present
    if (formData.seo.ogImage) {
        assetsToUpload.push({
            base64: formData.seo.ogImage,
            name: `og-${formData.title.slice(0, 20)}`,
            assetType: ASSET_TYPE.IMAGE,
        });
    }

    return assetsToUpload;
}

// Helper function to calculate reading time
function calculateReadingTime(article: CreateArticleInput): number {
    const wordsPerMinute = 200;
    let totalWords = 0;

    totalWords += article.title.split(" ").length;
    totalWords += article.summary.split(" ").length;

    article.destinations?.forEach((destination) => {
        totalWords += destination.description.split(" ").length;
        destination.content?.forEach((block) => {
            if (block.text) totalWords += block.text.split(" ").length;
        });
        destination.foodRecommendations?.forEach((food) => {
            totalWords += food.description.split(" ").length;
        });
        destination.localFestivals?.forEach((festival) => {
            totalWords += festival.description.split(" ").length;
        });
    });

    return Math.ceil(totalWords / wordsPerMinute);
}

// Helper function to calculate word count
function calculateWordCount(article: CreateArticleInput): number {
    let wordCount = 0;

    wordCount += article.title.split(" ").length;
    wordCount += article.summary.split(" ").length;

    article.destinations?.forEach((destination) => {
        wordCount += destination.description.split(" ").length;
        destination.content?.forEach((block) => {
            if (block.text) wordCount += block.text.split(" ").length;
        });
        destination.foodRecommendations?.forEach((food) => {
            wordCount += food.description.split(" ").length;
        });
        destination.localFestivals?.forEach((festival) => {
            wordCount += festival.description.split(" ").length;
        });
    });

    return wordCount;
}

/**
 * POST for creating new article
 */
export default async function ArticlePostHandler(request: NextRequest) {
    // 1. Authentication check
    const currentUserId = await getUserIdFromSession();
    if (!currentUserId) {
        throw new ApiError("Unauthorized", 401);
    }

    // 2. Parse and validate request body
    const body: CreateArticleInput = await request.json();
    const validatedData = validateUpdatedYupSchema<CreateArticleInput>(
        createArticleSchema,
        body
    );

    await ConnectDB();

    // Check if user has 'support' role
    await VERIFY_USER_ROLE.SUPPORT(currentUserId);

    // 3. Process in transaction
    const article = await withTransaction(async (session) => {
        // 4. Prepare and upload image assets
        const assetsToUpload = prepareImageAssets(validatedData);
        let uploadedAssetIds: Types.ObjectId[] = [];

        if (assetsToUpload.length > 0) {
            uploadedAssetIds = await uploadAssets(assetsToUpload, session);
        }

        // 5. Map uploaded asset IDs to their respective positions
        let assetIndex = 0;
        let heroImageAssetId: Types.ObjectId | undefined;
        const destinationAssetIds: Array<Types.ObjectId | undefined> = [];
        let ogImageAssetId: Types.ObjectId | undefined;

        // Map hero image
        if (validatedData.heroImage && uploadedAssetIds[assetIndex]) {
            heroImageAssetId = uploadedAssetIds[assetIndex];
            assetIndex++;
        }

        // Map destination images
        validatedData.destinations.forEach((destination) => {
            if (destination.imageAsset?.url && uploadedAssetIds[assetIndex]) {
                destinationAssetIds.push(uploadedAssetIds[assetIndex]);
                assetIndex++;
            } else {
                destinationAssetIds.push(undefined);
            }
        });

        // Map OG image
        if (validatedData.seo.ogImage && uploadedAssetIds[assetIndex]) {
            ogImageAssetId = uploadedAssetIds[assetIndex];
        }

        // Generate unique slug (optimized)
        const slug = await SlugService.generateUniqueSlug(validatedData.title);

        // 6. Prepare article data with uploaded asset IDs
        const articleData = {
            ...validatedData,
            slug,
            author: new Types.ObjectId(currentUserId), // Use currentUserId from authentication
            heroImage: heroImageAssetId,
            destinations: validatedData.destinations.map((dest, index) => {
                const assetId = destinationAssetIds[index];

                if (!dest.imageAsset || !assetId) {
                    return {
                        ...dest,
                        imageAsset: undefined,
                    };
                }

                return {
                    ...dest,
                    imageAsset: {
                        title: dest.imageAsset.title,
                        assetId,
                    },
                };
            }),
            seo: {
                ...validatedData.seo,
                ogImage: ogImageAssetId,
            },
            publishedAt: validatedData.status === ARTICLE_STATUS.PUBLISHED ? new Date() : undefined,
            readingTime: calculateReadingTime(validatedData),
            wordCount: calculateWordCount(validatedData),
        };

        // 7. Create article in database
        const article = await TravelArticleModel.create([articleData], {
            session,
        });


        // 8. Check for duplicate slug error
        if (article.length === 0) {
            throw new ApiError("Failed to create article", 500);
        }

        const dto = await buildTourArticleDto(article[0]._id, false, session);

        if (!dto) {
            throw new ApiError("Failed to fetch article DTO", 500);
        }

        return dto;
    });

    return {
        data: { article, success: true, message: "Article created successfully" },
        status: 201,
    };
}