// api/articles/v1/[articleId]/route.ts (PUT handler)
import { NextRequest } from "next/server";
import { Types } from "mongoose";
import { IncomingDocument, resolveDocuments } from "@/lib/cloudinary/resolve.cloudinary";
import { ASSET_TYPE } from "@/constants/asset.const";
import {
    UpdateArticleInput,
    DestinationBlock,
    CreateArticleInput
} from "@/types/article.types";
import { validateUpdatedYupSchema } from "@/utils/validators/common/update-updated-yup-schema";
import { createArticleSchema } from "@/utils/validators/article.create.validator";
import { TravelArticleModel, IDestinationBlock } from "@/models/articles/travel-article.model";
import { ApiError } from "@/lib/helpers/withErrorHandler";
import { withTransaction } from "@/lib/helpers/withTransaction";
import { buildTourArticleDto } from "@/lib/build-responses/build-tour-article-dt";
import { resolveMongoId } from "@/lib/helpers/resolveMongoId";
import ConnectDB from "@/config/db";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import VERIFY_USER_ROLE from "@/lib/auth/verify-user-role";

// Types for update operations
type UpdateData = Partial<Omit<CreateArticleInput, 'heroImage' | 'seo' | 'destinations'>> & {
    updatedAt: Date;
    heroImage?: Types.ObjectId | null;
    seo?: {
        metaTitle: string;
        metaDescription: string;
        ogImage?: string | Types.ObjectId | null;
    };
    destinations?: (Omit<IDestinationBlock, '_id' | 'imageAsset'> & {
        _id: Types.ObjectId;
        imageAsset?: {
            title: string;
            assetId: Types.ObjectId;
        } | null;
    })[];
};

// Helper function for safe type assignment
function safeAssign<T extends object, K extends keyof T>(
    target: T,
    key: K,
    value: T[K] | undefined | null
): void {
    if (value !== undefined) {
        target[key] = value as T[K];
    }
}

type FieldMapping = {
    field: string;
    destinationIndex?: number;
    destinationId?: string;
    isArray?: boolean;
};

export default async function ArticlePutHandler(request: NextRequest, { params }: { params: Promise<{ articleId: string }> }) {
    const articleId = resolveMongoId((await params).articleId);

    if (!Types.ObjectId.isValid(articleId)) {
        throw new ApiError("Invalid article ID format", 400);
    }

    const currentUserId = await getUserIdFromSession();
    if (!currentUserId) {
        throw new ApiError("Unauthorized", 401);
    }

    // Parse and validate request body
    const body: UpdateArticleInput = await request.json();

    // Validate against Yup schema
    const validatedData = validateUpdatedYupSchema<Omit<UpdateArticleInput, 'id'>>(
        createArticleSchema,
        body
    );

    await ConnectDB();

    // Check if user has 'support' role
    await VERIFY_USER_ROLE.SUPPORT(currentUserId);

    // Use withTransaction to handle the entire update in a single transaction
    const article = await withTransaction(async (session) => {
        // Find existing article with populated image references
        const existingArticle = await TravelArticleModel.findOne(
            { _id: articleId, deleted: false },
            null,
            { session }
        );

        if (!existingArticle) {
            throw new ApiError("Article not found", 404);
        }

        // Prepare collections for resolveDocuments
        const incomingDocs: IncomingDocument[] = [];
        const existingRefs: { type: string; asset: Types.ObjectId }[] = [];

        // Map to track which incoming type corresponds to which field
        const fieldMapping = new Map<string, FieldMapping>();

        // 1. Handle heroImage
        if (validatedData.heroImage !== undefined) {
            const type = `hero_${articleId}`;

            if (validatedData.heroImage === null) {
                // Mark for removal - will be handled by cleanup if no longer referenced
                if (existingArticle.heroImage) {
                    existingRefs.push({
                        type,
                        asset: existingArticle.heroImage as Types.ObjectId
                    });
                }
            } else if (typeof validatedData.heroImage === 'string') {
                // Add to incoming for resolution
                incomingDocs.push({
                    type,
                    url: validatedData.heroImage
                });

                if (existingArticle.heroImage) {
                    existingRefs.push({
                        type,
                        asset: existingArticle.heroImage as Types.ObjectId
                    });
                }
            }

            fieldMapping.set(type, { field: 'heroImage' });
        }
        // Note: Don't add to existingRefs if heroImage is not being changed

        // 2. Handle ogImage
        if (validatedData.seo?.ogImage !== undefined) {
            const type = `og_${articleId}`;

            if (validatedData.seo.ogImage === null) {
                // Mark for removal
                if (existingArticle.seo?.ogImage) {
                    existingRefs.push({
                        type,
                        asset: new Types.ObjectId(existingArticle.seo.ogImage)
                    });
                }
            } else if (typeof validatedData.seo.ogImage === 'string') {
                incomingDocs.push({
                    type,
                    url: validatedData.seo.ogImage
                });

                if (existingArticle.seo?.ogImage) {
                    existingRefs.push({
                        type,
                        asset: new Types.ObjectId(existingArticle.seo.ogImage)
                    });
                }
            }

            fieldMapping.set(type, { field: 'seo.ogImage' });
        }
        // Note: Don't add to existingRefs if ogImage is not being changed

        // 3. Handle destination imageAssets
        const destinationUpdates: DestinationBlock[] = [];
        const existingDestinations = existingArticle.destinations || [];

        // Create a map of existing destination IDs for tracking removals
        const existingDestMap = new Map<string, typeof existingDestinations[0]>();
        existingDestinations.forEach(dest => {
            existingDestMap.set(dest._id.toString(), dest);
        });

        // Track which destination IDs are in the incoming request
        const incomingDestIds = new Set<string>();

        if (validatedData.destinations !== undefined) {
            // Process incoming destinations
            for (let i = 0; i < validatedData.destinations.length; i++) {
                const dest = validatedData.destinations[i];
                const destId = dest.id || new Types.ObjectId().toString();
                incomingDestIds.add(destId);
                const existingDest = existingDestMap.get(destId);

                // Handle destination imageAsset
                if (dest.imageAsset !== undefined) {
                    const type = `dest_${destId}`;

                    if (dest.imageAsset === null) {
                        // Mark for removal
                        if (existingDest?.imageAsset?.assetId) {
                            existingRefs.push({
                                type,
                                asset: existingDest.imageAsset.assetId as Types.ObjectId
                            });
                        }
                        // Add to destinationUpdates with null imageAsset
                        destinationUpdates.push(dest);
                    } else if (dest.imageAsset.url) {
                        // Process imageAsset URL
                        incomingDocs.push({
                            type,
                            url: dest.imageAsset.url
                        });

                        if (existingDest?.imageAsset?.assetId) {
                            existingRefs.push({
                                type,
                                asset: existingDest.imageAsset.assetId as Types.ObjectId
                            });
                        }

                        fieldMapping.set(type, {
                            field: 'imageAsset',
                            destinationIndex: i,
                            destinationId: destId
                        });

                        destinationUpdates.push(dest);
                    }
                } else {
                    // No imageAsset change, keep the destination as is
                    destinationUpdates.push(dest);
                    // Do NOT mark existing imageAsset for cleanup - we're keeping it
                }
            }

            // Mark assets of removed destinations for cleanup
            for (const existingDest of existingDestinations) {
                const existingDestId = existingDest._id.toString();
                if (!incomingDestIds.has(existingDestId) && existingDest.imageAsset?.assetId) {
                    existingRefs.push({
                        type: `dest_${existingDestId}`,
                        asset: existingDest.imageAsset.assetId as Types.ObjectId
                    });
                }
            }
        } else {
            // If destinations is undefined, keep all existing destinations
            // No destinations should be marked for cleanup
            // We need to convert existing destinations to the DestinationBlock format
            existingDestinations.forEach(dest => {
                destinationUpdates.push({
                    id: dest._id.toString(),
                    division: dest.division,
                    district: dest.district,
                    area: dest.area,
                    description: dest.description,
                    content: dest.content,
                    highlights: dest.highlights || [],
                    foodRecommendations: dest.foodRecommendations || [],
                    localFestivals: dest.localFestivals || [],
                    localTips: dest.localTips || [],
                    transportOptions: dest.transportOptions || [],
                    accommodationTips: dest.accommodationTips || [],
                    coordinates: dest.coordinates || { lat: 0, lng: 0 },
                    // Keep existing image asset if it exists
                    imageAsset: dest.imageAsset ? {
                        title: dest.imageAsset.title,
                        assetId: dest.imageAsset.assetId.toString(),
                        url: "" // Will be populated by buildTourArticleDto
                    } : undefined
                });
            });
        }

        // 4. Batch resolve all images at once if we have incoming docs
        let resolvedAssets: { type: string; asset: Types.ObjectId }[] = [];
        if (incomingDocs.length > 0) {
            resolvedAssets = await resolveDocuments(
                incomingDocs,
                existingRefs,
                ASSET_TYPE.IMAGE,
                session
            );
        }

        // 5. Build update object with resolved asset IDs
        const updateData: UpdateData = {
            updatedAt: new Date()
        };

        // Apply all validated fields except those we're handling specially
        safeAssign(updateData, 'title', validatedData.title);
        safeAssign(updateData, 'banglaTitle', validatedData.banglaTitle);
        safeAssign(updateData, 'status', validatedData.status);
        safeAssign(updateData, 'articleType', validatedData.articleType);
        safeAssign(updateData, 'authorBio', validatedData.authorBio);
        safeAssign(updateData, 'summary', validatedData.summary);
        safeAssign(updateData, 'categories', validatedData.categories);
        safeAssign(updateData, 'tags', validatedData.tags);
        safeAssign(updateData, 'faqs', validatedData.faqs);
        safeAssign(updateData, 'allowComments', validatedData.allowComments);

        // Set heroImage from resolved assets
        const heroAsset = resolvedAssets.find(ra => ra.type.startsWith('hero_'));
        if (validatedData.heroImage !== undefined) {
            updateData.heroImage = validatedData.heroImage === null
                ? null
                : (heroAsset?.asset || existingArticle.heroImage);
        }
        // If heroImage is undefined, don't set it in updateData

        // Set seo.ogImage from resolved assets
        const ogAsset = resolvedAssets.find(ra => ra.type.startsWith('og_'));
        if (validatedData.seo?.ogImage !== undefined) {
            updateData.seo = {
                ...validatedData.seo,
                ogImage: validatedData.seo.ogImage === null
                    ? null
                    : (ogAsset?.asset?.toString() || existingArticle.seo?.ogImage)
            };
        } else if (validatedData.seo) {
            // If other SEO fields are updated but not ogImage
            updateData.seo = {
                metaTitle: validatedData.seo.metaTitle,
                metaDescription: validatedData.seo.metaDescription,
                ogImage: existingArticle.seo?.ogImage
            };
        }

        // Set destinations with resolved imageAssets
        if (validatedData.destinations !== undefined) {
            updateData.destinations = destinationUpdates.map((dest) => {
                const destId = dest.id || new Types.ObjectId().toString();
                const destAsset = resolvedAssets.find(ra => ra.type === `dest_${destId}`);
                const existingDest = existingDestMap.get(destId);

                const destinationObj: Omit<IDestinationBlock, '_id' | 'imageAsset'> & {
                    _id: Types.ObjectId;
                    imageAsset?: {
                        title: string;
                        assetId: Types.ObjectId;
                    } | null;
                } = {
                    division: dest.division,
                    district: dest.district,
                    area: dest.area,
                    description: dest.description,
                    content: dest.content,
                    highlights: dest.highlights || [],
                    foodRecommendations: dest.foodRecommendations || [],
                    localFestivals: dest.localFestivals || [],
                    localTips: dest.localTips || [],
                    transportOptions: dest.transportOptions || [],
                    accommodationTips: dest.accommodationTips || [],
                    coordinates: dest.coordinates || { lat: 0, lng: 0 },
                    _id: dest.id ? new Types.ObjectId(dest.id) : new Types.ObjectId(destId)
                };

                // Handle imageAsset
                if (dest.imageAsset !== undefined) {
                    if (dest.imageAsset === null) {
                        // Explicitly set to null to remove
                        destinationObj.imageAsset = null;
                    } else if (destAsset) {
                        // Update with new asset from resolvedAssets
                        destinationObj.imageAsset = {
                            title: dest.imageAsset.title || `Destination Image`,
                            assetId: destAsset.asset
                        };
                    } else if (dest.imageAsset.url && !destAsset) {
                        // This shouldn't happen if resolveDocuments worked correctly
                        throw new ApiError(`Failed to resolve image for destination ${destId}`, 500);
                    }
                } else if (dest.id && existingDest?.imageAsset) {
                    // Keep existing imageAsset if not specified in update
                    destinationObj.imageAsset = {
                        title: existingDest.imageAsset.title,
                        assetId: existingDest.imageAsset.assetId as Types.ObjectId
                    };
                }
                // If no imageAsset and no existing image, leave it undefined

                return destinationObj;
            });
        }
        // If destinations is undefined, don't set it in updateData

        // 6. Update article with the prepared data
        const updatedArticle = await TravelArticleModel.findByIdAndUpdate(
            articleId,
            { $set: updateData },
            { new: true, session }
        );

        if (!updatedArticle) {
            throw new ApiError("Failed to update article", 500);
        }

        const dto = await buildTourArticleDto(updatedArticle._id, false, session);

        if (!dto) {
            throw new ApiError("Failed to fetch article DTO", 500);
        }

        return dto;
    });

    return {
        data: { article, success: true, message: "Article updated successfully" },
        status: 200,
    };
}