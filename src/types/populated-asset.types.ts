// src/types/populated-asset.types.ts
import { IAssetFile } from "@/models/assets/asset-file.model";
import { IAsset } from "@/models/assets/asset.model";
import { HydratedDocument, Types } from "mongoose";

export type PopulatedAssetFile = Pick<IAssetFile, "_id" | "publicUrl">;
export type PopulatedAsset = HydratedDocument<Omit<IAsset, "_id" | "file"> & {
    _id: Types.ObjectId;
    file: PopulatedAssetFile;
}>;