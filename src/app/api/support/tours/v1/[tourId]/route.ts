// app/api/support/tours/[tourId]/route.ts
import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import ConnectDB from '@/config/db';
import { ApiError, withErrorHandler } from '@/lib/helpers/withErrorHandler';
import { withTransaction } from '@/lib/helpers/withTransaction';
import { buildTourDetailDTO } from '@/lib/build-responses/build-tour-details';
import { resolveMongoId } from '@/lib/helpers/resolveMongoId';

/**
 * GET Full Tour details 
 */
export const GET = withErrorHandler(async (
    request: NextRequest,
    { params }: { params: Promise<{ tourId: string }> }
) => {
    const tourId = resolveMongoId((await params).tourId);

    if (!tourId) {
        throw new ApiError("Invalid tour ID", 400);
    }

    if (!mongoose.Types.ObjectId.isValid(tourId)) {
        throw new ApiError("Invalid tour ID format", 400);
    }

    await ConnectDB();

    const tourDetail = await withTransaction(async (session) => {
        return await buildTourDetailDTO(new mongoose.Types.ObjectId(tourId), session);
    });

    if (!tourDetail) {
        throw new ApiError("Tour not found", 404);
    }

    return { data: tourDetail, status: 200 };
});