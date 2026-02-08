// src/types/populated-asset.types.ts

import { Types } from "mongoose";

export type PopulatedAssetFileLean = {
    _id: Types.ObjectId;
    publicUrl: string;
};

export type PopulatedAssetLean = {
    _id: Types.ObjectId;
    file?: PopulatedAssetFileLean;
};