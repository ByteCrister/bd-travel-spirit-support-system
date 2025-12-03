// types/mongoose-lean.d.types.ts
import { Document, Types } from "mongoose";

/**
 * Convert a Mongoose Document type to a plain JS object type
 * preserving ObjectId and other fields.
 */
export type Lean<T> = {
    [K in keyof T]: T[K] extends Document ? Lean<T[K]> :
    T[K] extends Types.ObjectId ? Types.ObjectId :
    T[K];
};