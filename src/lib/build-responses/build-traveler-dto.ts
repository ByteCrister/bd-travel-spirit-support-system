// lib/helpers/getTravelerDetailById.ts
import mongoose, { ClientSession, PipelineStage } from 'mongoose';

import { TravelerModel } from '@/models/travelers/traveler.model';
import { UserModel } from '@/models/user.model';

import { TravelerDetail } from '@/types/user/traveler.types';
import { getCollectionName } from '@/lib/helpers/get-collection-name';
import AssetModel from '@/models/assets/asset.model';
import AssetFileModel from '@/models/assets/asset-file.model';

export async function buildTravelerDto(
    id: string | mongoose.Types.ObjectId,
    session?: ClientSession
): Promise<TravelerDetail | null> {

    const travelerId =
        typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id;

    const pipeline: PipelineStage[] = [
        { $match: { _id: travelerId, deletedAt: null } },

        {
            $lookup: {
                from: getCollectionName(UserModel),
                localField: 'user',
                foreignField: '_id',
                as: 'user',
            },
        },
        { $unwind: '$user' },

        {
            $lookup: {
                from: getCollectionName(AssetModel),
                localField: 'user.avatar',
                foreignField: '_id',
                as: 'user.avatar',
            },
        },
        {
            $unwind: {
                path: '$user.avatar',
                preserveNullAndEmptyArrays: true,
            },
        },

        {
            $lookup: {
                from: getCollectionName(AssetFileModel),
                localField: 'user.avatar.file',
                foreignField: '_id',
                as: 'user.avatar.file',
            },
        },
        {
            $unwind: {
                path: '$user.avatar.file',
                preserveNullAndEmptyArrays: true,
            },
        },

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

                userId: '$user._id',
                email: '$user.email',
                role: '$user.role',

                createdAt: '$user.createdAt',
                updatedAt: '$user.updatedAt',

                avatarUrl: {
                    $ifNull: ['$user.avatar.file.publicUrl', null],
                },

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

    const aggregate = TravelerModel.aggregate(pipeline);

    if (session) {
        aggregate.session(session);
    }

    const result = await aggregate;

    if (!result.length) return null;

    const doc = result[0];

    return {
        ...doc,
        _id: doc._id.toString(),
        userId: doc.userId.toString(),
        createdAt: doc.createdAt?.toISOString(),
        updatedAt: doc.updatedAt?.toISOString(),
        dateOfBirth: doc.dateOfBirth?.toISOString(),
        lastLogin: doc.lastLogin?.toISOString(),
        lockUntil: doc.lockUntil?.toISOString(),
        deletedAt: doc.deletedAt?.toISOString(),

        suspension: doc.suspension
            ? {
                ...doc.suspension,
                suspendedBy: doc.suspension.suspendedBy?.toString(),
                until: doc.suspension.until?.toISOString(),
                createdAt: doc.suspension.createdAt?.toISOString(),
            }
            : undefined,
    };
}