import { NextRequest } from 'next/server';
import mongoose, { PipelineStage } from 'mongoose';
import { TravelerCancellation, PaginatedResponse } from '@/types/user/traveler.types';
import ConnectDB from '@/config/db';
import { TravelerModel } from '@/models/travelers/traveler.model';
import BookingModel from '@/models/tours/booking.model';
import TourModel from '@/models/tours/tour.model';
import { BOOKING_STATUS, BookingPaymentStatus, BookingStatus } from '@/constants/tour-booking.const';
import { getCollectionName } from '@/lib/helpers/get-collection-name';
import { resolveMongoId } from '@/lib/helpers/resolveMongoId';
import { withErrorHandler, ApiError, HandlerResult } from '@/lib/helpers/withErrorHandler';

interface Params {
    params: Promise<{ id: string }>;
}

interface CancellationAggregationResult {
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

async function getTravelerCancellations(
    req: NextRequest,
    { params }: Params
): Promise<HandlerResult<PaginatedResponse<TravelerCancellation>>> {
    await ConnectDB();

    const id = resolveMongoId((await params).id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError('Invalid traveler ID', 400);
    }

    const travelerExists = await TravelerModel.exists({ _id: id, deletedAt: null });
    if (!travelerExists) {
        throw new ApiError('Traveler not found', 404);
    }

    const searchParams = req.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
    const skip = (page - 1) * limit;

    const pipeline: PipelineStage[] = [
        {
            $match: {
                traveler: new mongoose.Types.ObjectId(id),
                status: BOOKING_STATUS.CANCELLED,
                deletedAt: null,
            },
        },
        { $sort: { bookedAt: -1 as const } },
        {
            $facet: {
                metadata: [{ $count: 'total' }],
                data: [
                    { $skip: skip },
                    { $limit: limit },
                    {
                        $lookup: {
                            from: getCollectionName(TourModel),
                            localField: 'tour',
                            foreignField: '_id',
                            as: 'tour',
                        },
                    },
                    { $unwind: '$tour' },
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
    const data = (result[0]?.data || []) as CancellationAggregationResult[];

    const cancellations: TravelerCancellation[] = data.map((item) => ({
        _id: item._id.toString(),
        bookingReference: item.bookingReference,
        tour: {
            _id: item.tour._id.toString(),
            title: item.tour.title,
            uniqueTourCode: item.tour.uniqueTourCode,
        },
        totalParticipants: item.totalParticipants,
        totalPaid: item.totalPaid,
        status: item.status,
        paymentStatus: item.paymentStatus,
        bookedAt: item.bookedAt.toISOString(),
        cancellation: item.cancellation
            ? {
                cancelledAt: item.cancellation.cancelledAt?.toISOString(),
                reason: item.cancellation.reason,
                refundAmount: item.cancellation.refundAmount,
            }
            : undefined,
    }));

    const responseData: PaginatedResponse<TravelerCancellation> = {
        data: cancellations,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };

    return { data: responseData };
}

export const GET = withErrorHandler(getTravelerCancellations);