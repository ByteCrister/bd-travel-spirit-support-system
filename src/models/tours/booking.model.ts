import { Schema, Types, Document, Model, ClientSession, Query } from "mongoose";
import { defineModel } from "@/lib/helpers/defineModel";
import {
    PAYMENT_METHOD,
    PaymentMethod,
    TOUR_DISCOUNT_TYPE,
    TOUR_DISCOUNT,
    TourDiscountType,
    TourDiscount,
} from "@/constants/tour.const";

import {
    BOOKING_PAYMENT_STATUS,
    BOOKING_STATUS,
    BookingPaymentStatus,
    BookingStatus,
} from "@/constants/tour-booking.const";

import { ITour } from "./tour.model";

/* ===============================
   Extend QueryOptions
=============================== */

declare module "mongoose" {
    interface QueryOptions {
        includeDeleted?: boolean;
    }
}

/* ===============================
   INTERFACES
=============================== */

export interface IAppliedDiscount {
    type: TourDiscountType;
    discount: TourDiscount;
    value: number;
}

export interface IPayment {
    method: PaymentMethod;
    transactionId?: string;
    status: BookingPaymentStatus;
    paidAt?: Date;
}

export interface ICancellation {
    cancelledAt: Date;
    reason: string;
    cancelledBy: Types.ObjectId;
    refundAmount?: number;
    refundStatus?: BookingPaymentStatus;
}

export interface IBooking extends Document {
    bookingReference: string;

    uniqueTourCode: string;

    traveler: Types.ObjectId;
    tour: Types.ObjectId | ITour;

    totalParticipants: number;

    discounts: IAppliedDiscount[];
    totalPaid: number;

    payment: IPayment;

    status: BookingStatus;

    expiresAt?: Date;

    cancellation?: ICancellation;

    bookedAt: Date;

    createdAt: Date;
    updatedAt: Date;

    deletedAt?: Date;
}

/* ===============================
   OPTIONS
=============================== */

export interface CreateBookingOptions {
    session?: ClientSession;
}

export interface ConfirmBookingOptions {
    session?: ClientSession;
    paymentDetails?: Partial<IPayment>;
}

export interface CancelBookingOptions {
    session?: ClientSession;
    cancelledBy: Types.ObjectId;
    reason: string;
    refundAmount?: number;
    refundStatus?: BookingPaymentStatus;
}

export interface SoftDeleteOptions {
    session?: ClientSession;
}

/* ===============================
   MODEL INTERFACE
=============================== */

export interface IBookingModel extends Model<IBooking> {
    createBooking(
        travelerId: Types.ObjectId,
        tourId: Types.ObjectId,
        data: {
            totalParticipants: number;
            discounts?: IAppliedDiscount[];
            totalPaid: number;
        },
        options?: CreateBookingOptions
    ): Promise<IBooking>;

    confirmBooking(
        bookingId: Types.ObjectId,
        options?: ConfirmBookingOptions
    ): Promise<IBooking | null>;

    cancelBooking(
        bookingId: Types.ObjectId,
        options: CancelBookingOptions
    ): Promise<IBooking | null>;

    softDeleteById(
        id: Types.ObjectId,
        options?: SoftDeleteOptions
    ): Promise<IBooking | null>;

    restoreById(
        id: Types.ObjectId,
        session?: ClientSession
    ): Promise<IBooking | null>;

    findByTraveler(
        travelerId: Types.ObjectId,
        includeDeleted?: boolean
    ): Promise<IBooking[]>;

    findByTour(
        tourId: Types.ObjectId,
        includeDeleted?: boolean
    ): Promise<IBooking[]>;
}

/* ===============================
   SCHEMA
=============================== */

const BookingSchema = new Schema<IBooking>(
    {
        bookingReference: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        uniqueTourCode: {
            type: String,
            required: true,
            trim: true,
        },

        traveler: {
            type: Schema.Types.ObjectId,
            ref: "Traveler",
            required: true,
            index: true,
        },

        tour: {
            type: Schema.Types.ObjectId,
            ref: "Tour",
            required: true,
            index: true,
        },

        totalParticipants: {
            type: Number,
            required: true,
            min: 1,
        },

        discounts: [
            {
                type: {
                    type: String,
                    enum: Object.values(TOUR_DISCOUNT_TYPE),
                },
                discount: {
                    type: String,
                    enum: Object.values(TOUR_DISCOUNT),
                },
                value: {
                    type: Number,
                    required: true,
                    min: 0,
                },
            },
        ],

        totalPaid: {
            type: Number,
            required: true,
            min: 0,
        },

        payment: {
            method: {
                type: String,
                enum: Object.values(PAYMENT_METHOD),
                required: true,
            },
            transactionId: {
                type: String,
                trim: true,
            },
            status: {
                type: String,
                enum: Object.values(BOOKING_PAYMENT_STATUS),
                default: BOOKING_PAYMENT_STATUS.PENDING,
            },
            paidAt: Date,
        },

        status: {
            type: String,
            enum: Object.values(BOOKING_STATUS),
            default: BOOKING_STATUS.PENDING,
            index: true,
        },

        expiresAt: {
            type: Date,
            index: true,
        },

        cancellation: {
            cancelledAt: Date,
            reason: { type: String, trim: true },
            cancelledBy: { type: Schema.Types.ObjectId, ref: "User" },
            refundAmount: { type: Number, min: 0 },
            refundStatus: {
                type: String,
                enum: Object.values(BOOKING_PAYMENT_STATUS),
            },
        },

        bookedAt: {
            type: Date,
            default: Date.now,
            index: true,
        },

        deletedAt: {
            type: Date,
            index: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

/* ===============================
   INDEXES
=============================== */

BookingSchema.index({ traveler: 1, status: 1 });
BookingSchema.index({ "payment.status": 1 });
BookingSchema.index({ createdAt: -1 });

/* ===============================
   MIDDLEWARE
=============================== */

BookingSchema.pre<Query<IBooking, IBooking>>(/^find/, function (next) {
    if (!this.getOptions().includeDeleted) {
        this.where({ deletedAt: null });
    }
    next();
});

/* ===============================
   STATIC METHODS
=============================== */

BookingSchema.statics.createBooking = async function (
    travelerId: Types.ObjectId,
    tourId: Types.ObjectId,
    data: {
        totalParticipants: number;
        discounts?: IAppliedDiscount[];
        totalPaid: number;
    },
    options?: CreateBookingOptions
): Promise<IBooking> {

    const session = options?.session;

    const query = (this.db.model("Tour") as Model<ITour>).findOne({
        _id: tourId,
        deletedAt: null,
    });

    if (session) query.session(session);

    const tour = await query;

    if (!tour) {
        throw new Error("Tour or departure not found");
    }

    const availableSeats = 10;

    if (availableSeats < data.totalParticipants) {
        throw new Error(`Not enough seats. Available: ${availableSeats}`);
    }

    const countQuery = this.countDocuments();

    if (session) countQuery.session(session);

    const count = await countQuery;

    const bookingReference = `BKG${String(count + 1).padStart(6, "0")}`;

    const booking = new this({
        bookingReference,
        traveler: travelerId,
        tour: tourId,
        totalParticipants: data.totalParticipants,
        discounts: data.discounts ?? [],
        totalPaid: data.totalPaid,
        payment: {
            method: PAYMENT_METHOD.CASH,
            status: BOOKING_PAYMENT_STATUS.PENDING,
        },
        status: BOOKING_STATUS.PENDING,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        bookedAt: new Date(),
    });

    await booking.save({ session });

    return booking;
};

BookingSchema.statics.confirmBooking = async function (
    bookingId: Types.ObjectId,
    options?: ConfirmBookingOptions
): Promise<IBooking | null> {

    const session = options?.session;

    const query = this.findById(bookingId);

    if (session) query.session(session);

    const booking = await query;

    if (!booking) {
        throw new Error("Booking not found");
    }

    if (booking.status !== BOOKING_STATUS.PENDING) {
        throw new Error(`Cannot confirm booking with status: ${booking.status}`);
    }

    if (options?.paymentDetails) {
        booking.payment = {
            ...booking.payment,
            ...options.paymentDetails,
            status: BOOKING_PAYMENT_STATUS.PAID,
            paidAt: new Date(),
        };
    }

    booking.status = BOOKING_STATUS.CONFIRMED;
    booking.expiresAt = undefined;

    await booking.save({ session });

    return booking;
};

BookingSchema.statics.cancelBooking = async function (
    bookingId: Types.ObjectId,
    options: CancelBookingOptions
): Promise<IBooking | null> {

    const session = options?.session;

    const query = this.findById(bookingId);

    if (session) query.session(session);

    const booking = await query;

    if (!booking) {
        throw new Error("Booking not found");
    }

    if (
        booking.status === BOOKING_STATUS.CANCELLED ||
        booking.status === BOOKING_STATUS.REFUNDED
    ) {
        throw new Error(`Booking already ${booking.status}`);
    }

    booking.status = BOOKING_STATUS.CANCELLED;

    booking.cancellation = {
        cancelledAt: new Date(),
        reason: options.reason,
        cancelledBy: options.cancelledBy,
        refundAmount: options.refundAmount,
        refundStatus: options.refundStatus,
    };

    await booking.save({ session });

    return booking;
};

BookingSchema.statics.softDeleteById = async function (
    id: Types.ObjectId,
    options?: SoftDeleteOptions
): Promise<IBooking | null> {

    const session = options?.session;

    const query = this.findById(id);

    if (session) query.session(session);

    const booking = await query;

    if (!booking) {
        throw new Error("Booking not found");
    }

    if (booking.deletedAt) {
        return booking;
    }

    booking.deletedAt = new Date();

    await booking.save({ session });

    return booking;
};

BookingSchema.statics.restoreById = async function (
    id: Types.ObjectId,
    session?: ClientSession
): Promise<IBooking | null> {

    const query = this.findById(id);

    if (session) query.session(session);

    const booking = await query;

    if (!booking) {
        throw new Error("Booking not found");
    }

    if (!booking.deletedAt) {
        throw new Error("Booking is not deleted");
    }

    booking.deletedAt = undefined;

    await booking.save({ session });

    return booking;
};

BookingSchema.statics.findByTraveler = async function (
    travelerId: Types.ObjectId,
    includeDeleted = false
): Promise<IBooking[]> {

    const query = this.find({ traveler: travelerId });

    if (!includeDeleted) {
        query.where({ deletedAt: null });
    }

    return query.sort({ bookedAt: -1 });
};

BookingSchema.statics.findByTour = async function (
    tourId: Types.ObjectId,
    includeDeleted = false
): Promise<IBooking[]> {

    const query = this.find({ tour: tourId });

    if (!includeDeleted) {
        query.where({ deletedAt: null });
    }

    return query.sort({ bookedAt: -1 });
};

/* ===============================
   MODEL EXPORT
=============================== */

const BookingModel = defineModel<IBooking, IBookingModel>(
    "Booking",
    BookingSchema
);

export default BookingModel;