import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { TravelerDetail } from '@/types/user/traveler.types';
import ConnectDB from '@/config/db';
import { TravelerModel } from '@/models/travelers/traveler.model';
import { resolveMongoId } from '@/lib/helpers/resolveMongoId';
import { withErrorHandler, ApiError, HandlerResult } from '@/lib/helpers/withErrorHandler';
import { withTransaction } from '@/lib/helpers/withTransaction';
import { ACCOUNT_STATUS } from '@/constants/user.const';
import { buildTravelerDto } from '@/lib/build-responses/build-traveler-dto';
import { getUserIdFromSession } from '@/lib/auth/session.auth';

interface Params {
    params: Promise<{ id: string }>;
}

interface SuspendBody {
    reason: string;
    durationDays?: number;
}

async function suspendTraveler(
    req: NextRequest,
    { params }: Params
): Promise<HandlerResult<TravelerDetail>> {
    await ConnectDB();

    const id = resolveMongoId((await params).id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError('Invalid traveler ID', 400);
    }

    const currentUserId = await getUserIdFromSession();
    if (!currentUserId) {
        throw new ApiError('Unauthorized', 401);
    }

    const body: SuspendBody = await req.json();
    if (!body.reason || typeof body.reason !== 'string') {
        throw new ApiError('Reason is required', 400);
    }

    // Perform the suspension update within a transaction
    await withTransaction(async (session) => {
        const traveler = await TravelerModel.findOne({ _id: id, deletedAt: null }).session(session);
        if (!traveler) {
            throw new ApiError('Traveler not found', 404);
        }

        const now = new Date();
        let until: Date;

        if (body.durationDays) {
            until = new Date(now.getTime() + body.durationDays * 24 * 60 * 60 * 1000);
        } else {
            // Indefinite suspension: set a far‑future date (year 2100)
            until = new Date('2100-01-01');
        }

        traveler.suspension = {
            reason: body.reason,
            suspendedBy: new mongoose.Types.ObjectId(currentUserId),
            until,
            createdAt: now,
        };

        traveler.accountStatus = ACCOUNT_STATUS.SUSPENDED;

        await traveler.save({ session });
    });

    // Retrieve the enriched traveler details after the transaction commits
    const updatedDetail = await buildTravelerDto(id);
    if (!updatedDetail) {
        throw new ApiError('Failed to retrieve updated traveler', 500);
    }

    return { data: updatedDetail };
}

export const POST = withErrorHandler(suspendTraveler);