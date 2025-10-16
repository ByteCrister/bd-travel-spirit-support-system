// src/lib/assets/cloudinary.upload.ts
import {
    AssetModel,
    ASSET_TYPE,
    VISIBILITY,
    MODERATION_STATUS,
    STORAGE_PROVIDER,
} from "@/models/asset.model";
import { UploadedAsset } from "@/lib/storage-providers/asset-storage.interface";
import { Types } from "mongoose";

/**
 * Persists a new asset into MongoDB after successful provider upload.
 */
export async function saveUploadedAsset(
    uploaded: UploadedAsset,
    userId: Types.ObjectId,
    visibility: VISIBILITY = VISIBILITY.PRIVATE,
    moderationStatus: MODERATION_STATUS = MODERATION_STATUS.PENDING,
) {
    // Derive asset type from MIME
    const assetType = uploaded.contentType?.startsWith("image/")
        ? ASSET_TYPE.IMAGE
        : uploaded.contentType?.startsWith("video/")
            ? ASSET_TYPE.VIDEO
            : uploaded.contentType?.startsWith("audio/")
                ? ASSET_TYPE.AUDIO
                : uploaded.contentType?.includes("pdf") ||
                    uploaded.contentType?.includes("doc")
                    ? ASSET_TYPE.DOCUMENT
                    : ASSET_TYPE.OTHER;

    const asset = new AssetModel({
        storageProvider: STORAGE_PROVIDER.CLOUDINARY, // or dynamic from config
        objectKey: uploaded.providerId,
        publicUrl: uploaded.url,
        contentType: uploaded.contentType,
        fileSize: uploaded.fileSize,
        checksum: uploaded.checksum, // must be provided by caller if needed
        assetType,
        title: uploaded.fileName,
        uploadedBy: userId,
        visibility,
        moderationStatus,
    });

    return asset.save();
}


// ? ---------------------------------------- How to use ---------------------------------------- 
/** 
 * const provider = getAssetStorageProvider(STORAGE_PROVIDER.CLOUDINARY);
 * const uploaded = await provider.create(base64File, "my-photo.jpg");
 * const savedAsset = await saveUploadedAsset(uploaded, currentUser._id, VISIBILITY.PUBLIC, MODERATION_STATUS.APPROVED);
 */