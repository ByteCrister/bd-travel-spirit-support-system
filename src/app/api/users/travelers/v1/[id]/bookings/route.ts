import { NextRequest } from 'next/server';
import mongoose, { PipelineStage } from 'mongoose';

import { TravelerBooking, PaginatedResponse } from '@/types/user/traveler.types';
import ConnectDB from '@/config/db';
import { TravelerModel } from '@/models/travelers/traveler.model';
import BookingModel from '@/models/tours/booking.model';
import { getCollectionName } from '@/lib/helpers/get-collection-name';
import TourModel from '@/models/tours/tour.model';
import { resolveMongoId } from '@/lib/helpers/resolveMongoId';
import { withErrorHandler, ApiError, HandlerResult } from '@/lib/helpers/withErrorHandler';
import { BookingPaymentStatus, BookingStatus } from '@/constants/tour-booking.const';

interface Params {
    params: Promise<{ id: string }>;
}

// Type for the aggregation result after $project
interface BookingAggregationResult {
    _id: mongoose.Types.ObjectId;
    bookingReference: string;
    tour: {
        _id: mongoose.Types.ObjectId;
        title: string;
        uniqueTourCode: string;
    };
    totalParticipants: number;
    totalPaid: number;
    status: BookingStatus;
    paymentStatus: BookingPaymentStatus;
    bookedAt: Date;
    cancellation?: {
        cancelledAt?: Date;
        reason?: string;
        refundAmount?: number;
    };
}

async function handleGet(req: NextRequest, { params }: Params): Promise<HandlerResult<PaginatedResponse<TravelerBooking>>> {
    await ConnectDB();

    const id = resolveMongoId((await params).id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError('Invalid traveler ID', 400);
    }

    // Check if traveler exists and is not soft-deleted
    const travelerExists = await TravelerModel.exists({ _id: id, deletedAt: null });
    if (!travelerExists) {
        throw new ApiError('Traveler not found', 404);
    }

    // Parse pagination
    const searchParams = req.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
    const skip = (page - 1) * limit;

    // Aggregation pipeline with explicit PipelineStage typing
    const pipeline: PipelineStage[] = [
        // Match bookings for this traveler, not soft-deleted
        {
            $match: {
                traveler: new mongoose.Types.ObjectId(id),
                deletedAt: null,
            },
        },
        // Sort by bookedAt descending (most recent first)
        { $sort: { bookedAt: -1 as const } }, // Use as const to ensure literal -1
        // Pagination facet
        {
            $facet: {
                metadata: [{ $count: 'total' }],
                data: [
                    { $skip: skip },
                    { $limit: limit },
                    // Lookup tour details
                    {
                        $lookup: {
                            from: getCollectionName(TourModel),
                            localField: 'tour',
                            foreignField: '_id',
                            as: 'tour',
                        },
                    },
                    { $unwind: '$tour' },
                    // Project to TravelerBooking shape
                    {
                        $project: {
                            _id: 1,
                            bookingReference: 1,
                            'tour._id': 1,
                            'tour.title': 1,
                            'tour.uniqueTourCode': 1,
                            totalParticipants: 1,
                            totalPaid: 1,
                            status: 1,
                            paymentStatus: '$payment.status',
                            bookedAt: 1,
                            cancellation: {
                                cancelledAt: 1,
                                reason: 1,
                                refundAmount: 1,
                            },
                        },
                    },
                ],
            },
        },
    ];

    const result = await BookingModel.aggregate(pipeline);
    const metadata = result[0]?.metadata?.[0];
    const total = metadata?.total || 0;
    const data = (result[0]?.data || []) as BookingAggregationResult[];

    // Convert dates to ISO strings as expected by TravelerBooking
    const bookings: TravelerBooking[] = data.map((booking) => {
        const cancellation = booking.cancellation
            ? {
                reason: booking.cancellation.reason,
                refundAmount: booking.cancellation.refundAmount,
                ...(booking.cancellation.cancelledAt && {
                    cancelledAt: booking.cancellation.cancelledAt.toISOString(),
                }),
            }
            : undefined;

        return {
            _id: booking._id.toString(),
            bookingReference: booking.bookingReference,
            tour: {
                _id: booking.tour._id.toString(),
                title: booking.tour.title,
                uniqueTourCode: booking.tour.uniqueTourCode,
            },
            totalParticipants: booking.totalParticipants,
            totalPaid: booking.totalPaid,
            status: booking.status,
            paymentStatus: booking.paymentStatus,
            bookedAt: booking.bookedAt.toISOString(),
            cancellation,
        };
    });

    const responseData: PaginatedResponse<TravelerBooking> = {
        data: bookings,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };

    return { data: responseData };
}

export const GET = withErrorHandler(handleGet);