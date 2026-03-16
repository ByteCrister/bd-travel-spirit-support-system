import { NextRequest } from 'next/server';
import mongoose from 'mongoose';

import { TravelerModel } from '@/models/travelers/traveler.model';
import { UserModel } from '@/models/user.model';
import { AssetModel } from '@/models/assets/asset.model';
import AssetFileModel from '@/models/assets/asset-file.model';
import ConnectDB from '@/config/db';
import { getCollectionName } from '@/lib/helpers/get-collection-name';
import { resolveMongoId } from '@/lib/helpers/resolveMongoId';
import { withErrorHandler, ApiError, HandlerResult } from '@/lib/helpers/withErrorHandler';

import { TravelerDetail } from '@/types/user/traveler.types';

interface Params {
    params: Promise<{ id: string }>;
}

async function handleGet(req: NextRequest, { params }: Params): Promise<HandlerResult<TravelerDetail>> {
    await ConnectDB();

    const id = resolveMongoId((await params).id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError('Invalid traveler ID', 400);
    }

    // Aggregation pipeline to fetch traveler with all required fields
    const pipeline = [
        // Match traveler by _id and exclude soft-deleted
        {
            $match: {
                _id: new mongoose.Types.ObjectId(id),
                deletedAt: null,
            },
        },

        // Lookup user
        {
            $lookup: {
                from: getCollectionName(UserModel),
                localField: 'user',
                foreignField: '_id',
                as: 'user',
            },
        },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: false } },

        // Lookup avatar asset from user.avatar
        {
            $lookup: {
                from: getCollectionName(AssetModel),
                localField: 'user.avatar',
                foreignField: '_id',
                as: 'user.avatar',
            },
        },
        { $unwind: { path: '$user.avatar', preserveNullAndEmptyArrays: true } },

        // Lookup asset file from user.avatar.file
        {
            $lookup: {
                from: getCollectionName(AssetFileModel),
                localField: 'user.avatar.file',
                foreignField: '_id',
                as: 'user.avatar.file',
            },
        },
        { $unwind: { path: '$user.avatar.file', preserveNullAndEmptyArrays: true } },

        // Project to TravelerDetail shape
        {
            $project: {
                _id: 1,
                name: 1,
                phone: 1,
                address: 1,
                dateOfBirth: 1,
                location: 1,
                isVerified: 1,
                accountStatus: 1,
                loginAttempts: 1,
                lastLogin: 1,
                lockUntil: 1,
                suspension: 1,
                deletedAt: 1,

                // User fields
                userId: '$user._id',
                email: '$user.email',
                role: '$user.role',
                createdAt: '$user.createdAt',
                updatedAt: '$user.updatedAt',

                // Avatar URL
                avatarUrl: {
                    $ifNull: ['$user.avatar.file.publicUrl', null],
                },

                // Virtuals computed from data
                isLocked: {
                    $and: [
                        { $ne: ['$lockUntil', null] },
                        { $gt: ['$lockUntil', new Date()] },
                    ],
                },
                isSuspended: {
                    $and: [
                        { $ne: ['$suspension.until', null] },
                        { $gt: ['$suspension.until', new Date()] },
                    ],
                },
                isActive: {
                    $and: [
                        { $eq: ['$deletedAt', null] },
                        { $eq: ['$accountStatus', 'active'] },
                    ],
                },
            },
        },
    ];

    const result = await TravelerModel.aggregate(pipeline);

    if (!result.length) {
        throw new ApiError('Traveler not found', 404);
    }

    const travelerDoc = result[0];

    // Convert dates to ISO strings as expected by the type
    const travelerDetail: TravelerDetail = {
        ...travelerDoc,
        _id: travelerDoc._id.toString(),
        userId: travelerDoc.userId.toString(),
        createdAt: travelerDoc.createdAt?.toISOString(),
        updatedAt: travelerDoc.updatedAt?.toISOString(),
        dateOfBirth: travelerDoc.dateOfBirth?.toISOString(),
        lastLogin: travelerDoc.lastLogin?.toISOString(),
        lockUntil: travelerDoc.lockUntil?.toISOString(),
        deletedAt: travelerDoc.deletedAt?.toISOString(),
        suspension: travelerDoc.suspension
            ? {
                ...travelerDoc.suspension,
                suspendedBy: travelerDoc.suspension.suspendedBy?.toString(),
                until: travelerDoc.suspension.until?.toISOString(),
                createdAt: travelerDoc.suspension.createdAt?.toISOString(),
            }
            : undefined,
    };

    return { data: travelerDetail };
}

export const GET = withErrorHandler(handleGet);