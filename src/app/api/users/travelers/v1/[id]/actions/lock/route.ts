import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { TravelerDetail } from '@/types/user/traveler.types';
import ConnectDB from '@/config/db';
import { TravelerModel } from '@/models/travelers/traveler.model';
import { resolveMongoId } from '@/lib/helpers/resolveMongoId';
import { withErrorHandler, ApiError, HandlerResult } from '@/lib/helpers/withErrorHandler';
import { withTransaction } from '@/lib/helpers/withTransaction';
import { buildTravelerDto } from '@/lib/build-responses/build-traveler-dto';

interface Params {
    params: Promise<{ id: string }>;
}

// // Interface kept for consistency (body not used)
// interface LockBody {
//     reason?: string;
// }

async function lockTraveler(
    req: NextRequest,
    { params }: Params
): Promise<HandlerResult<TravelerDetail>> {
    await ConnectDB();

    const id = resolveMongoId((await params).id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError('Invalid traveler ID', 400);
    }

    await withTransaction(async (session) => {
        const traveler = await TravelerModel.findOne({ _id: id, deletedAt: null }).session(session);
        if (!traveler) {
            throw new ApiError('Traveler not found', 404);
        }

        const lockDurationMs = 24 * 60 * 60 * 1000;
        traveler.lockUntil = new Date(Date.now() + lockDurationMs);

        await traveler.save({ session });
    });

    const updatedDetail = await buildTravelerDto(id);
    if (!updatedDetail) {
        throw new ApiError('Failed to retrieve updated traveler', 500);
    }

    return { data: updatedDetail };
}

export const POST = withErrorHandler(lockTraveler);