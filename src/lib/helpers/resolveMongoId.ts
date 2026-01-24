import { decodeId } from '@/utils/helpers/mongodb-id-conversions';
import { Types } from 'mongoose';

/**
 * Resolves an article ID that may be:
 * - a valid MongoDB ObjectId
 * - a custom encoded ID
 *
 * @param rawId URL param value
 * @returns resolved MongoDB ObjectId string
 * @throws Error if invalid
 */
export function resolveMongoId(rawId: string): Types.ObjectId {
    const decodedParam = decodeURIComponent(rawId);

    // Case 1: Already a valid MongoDB ObjectId
    if (Types.ObjectId.isValid(decodedParam)) {
        return new Types.ObjectId(decodedParam);
    }

    // Case 2: Try decoding custom encoded ID
    const decoded = decodeId(decodedParam);

    if (decoded && Types.ObjectId.isValid(decoded)) {
        return new Types.ObjectId(decoded);
    }

    // Case 3: Invalid ID
    throw new Error('Invalid article ID');
}