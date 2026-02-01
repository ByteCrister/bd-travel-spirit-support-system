// app/api/support/guide-password-requests/v1/[id]/route.ts

import { NextRequest } from 'next/server';
import mongoose from 'mongoose';

import { withErrorHandler, ApiError } from '@/lib/helpers/withErrorHandler';
import ConnectDB from '@/config/db';
import { resolveMongoId } from '@/lib/helpers/resolveMongoId';
import GuideForgotPasswordModel from '@/models/guide/guide-forgot-password.model';
import { buildGuidePasswordDto } from '@/lib/build-responses/build-guide-password-dto';

interface RouteParams {
    params: Promise<{
        id: string;
    }>;
}


/* ------------------------------------------------------------------
   MAIN HANDLER
-------------------------------------------------------------------*/

async function getRequestByIdHandler(
    request: NextRequest,
    { params }: RouteParams
) {

    await ConnectDB();

    const id = resolveMongoId((await params).id);

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError('Invalid request ID format', 400);
    }

    const objectId = new mongoose.Types.ObjectId(id);

    // Quick existence + expiry check (cheap query)
    const requestExists = await GuideForgotPasswordModel.findById(objectId)
        .select('_id guideId status expiresAt')
        .lean();

    if (!requestExists) {
        throw new ApiError('Password reset request not found', 404);
    }

    const responseDto = await buildGuidePasswordDto(id.toString());

    return {
        data: responseDto,
        status: 200
    };
}

/* ------------------------------------------------------------------
   EXPORT
-------------------------------------------------------------------*/

export const GET = withErrorHandler(getRequestByIdHandler);