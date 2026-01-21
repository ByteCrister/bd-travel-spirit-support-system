import { decodeId } from '@/utils/helpers/mongodb-id-conversions';
import mongoose from 'mongoose';

/**
 * Resolves an article ID that may be:
 * - a valid MongoDB ObjectId
 * - a custom encoded ID
 *
 * @param rawId URL param value
 * @returns resolved MongoDB ObjectId string
 * @throws Error if invalid
 */
export function resolveMongoId(rawId: string): string {
    const decodedParam = decodeURIComponent(rawId);

    // Case 1: Already a valid MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(decodedParam)) {
        return decodedParam;
    }

    // Case 2: Try decoding custom encoded ID
    const decoded = decodeId(decodedParam);

    if (decoded && mongoose.Types.ObjectId.isValid(decoded)) {
        return decoded;
    }

    // Case 3: Invalid ID
    throw new Error('Invalid article ID');
}