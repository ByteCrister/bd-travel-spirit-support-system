import mongoose from "mongoose";
import {
    BOOKING_PAYMENT_STATUS,
    BOOKING_STATUS,
} from "@/constants/tour-booking.const";
import { TOUR_STATUS, CURRENCY } from "@/constants/tour.const";
import {
    PAYMENT_OWNER_TYPE,
    PAYMENT_PURPOSE,
} from "@/constants/payment.const";
import { USER_ROLE } from "@/constants/user.const";
import { withTransaction } from "@/lib/helpers/withTransaction";
import {
    convertBdtToUsd,
    usdToStripeCents,
} from "@/lib/exchange-rate/convert-bdt-to-usd";
import { recordSettlementTransaction } from "@/lib/payments/stripe-charge.service";
import BookingModel from "@/models/tours/booking.model";
import TourModel, { ITour } from "@/models/tours/tour.model";
import TourAnalyticsModel from "@/models/tours/tour-analytics.model";
import GuideModel from "@/models/guide/guide.model";
import StripePaymentAccountModel from "@/models/payments/payment-account.model";
import UserModel from "@/models/user.model";

const ADMIN_COMMISSION_RATE = parseFloat(process.env.ADMIN_COMMISSION_RATE!);
const GUIDE_SHARE_RATE = parseFloat(process.env.GUIDE_SHARE_RATE!);
const SETTLEMENT_GRACE_MS = 24 * 60 * 60 * 1000;

export type TourSettlementResult = {
    eligible: number;
    settled: number;
    skipped: number;
    failed: number;
    errors: string[];
};

function getTourEndDate(tour: ITour): Date | null {
    const endDates: number[] = [];

    if (tour.departure?.date) {
        const durationDays = tour.duration?.days ?? 1;
        endDates.push(new Date(tour.departure.date).getTime() + durationDays * 24 * 60 * 60 * 1000);
    }

    if (tour.operatingWindow?.endDate) {
        endDates.push(new Date(tour.operatingWindow.endDate).getTime());
    }

    if (!endDates.length) {
        return null;
    }

    return new Date(Math.max(...endDates));
}

function isTourEndedMoreThanOneDayAgo(tour: ITour, referenceDate: Date = new Date()): boolean {
    const endDate = getTourEndDate(tour);
    if (!endDate) return false;

    return referenceDate.getTime() - endDate.getTime() > SETTLEMENT_GRACE_MS;
}

async function findSettlementAccounts(tour: ITour) {
    const adminUsers = await UserModel.find({ role: USER_ROLE.ADMIN }).select("_id").lean();
    if (!adminUsers || adminUsers.length === 0) {
        throw new Error("Admin users not found");
    }
    const adminIds = adminUsers.map((u) => u._id);

    const blockAccount = await StripePaymentAccountModel.findOne({
        ownerType: PAYMENT_OWNER_TYPE.ADMIN,
        ownerId: { $in: adminIds },
        purpose: PAYMENT_PURPOSE.BLOCK_ACCOUNT,
        isActive: true,
        isDeleted: { $ne: true },
    })
        .sort({ isBackup: 1, createdAt: -1 })
        .lean();

    const adminTransactionAccount = await StripePaymentAccountModel.findOne({
        ownerType: PAYMENT_OWNER_TYPE.ADMIN,
        ownerId: { $in: adminIds },
        purpose: PAYMENT_PURPOSE.TRANSACTION_ACCOUNT,
        isActive: true,
        isDeleted: { $ne: true },
    })
        .sort({ isBackup: 1, createdAt: -1 })
        .lean();

    const guide = await GuideModel.findById(tour.companyId).select("owner.user companyName").lean();
    if (!guide?.owner?.user) {
        throw new Error(`Guide not found for tour company ${tour.companyId.toString()}`);
    }

    const guideAccount = await StripePaymentAccountModel.findOne({
        ownerType: PAYMENT_OWNER_TYPE.GUIDE,
        ownerId: guide.owner.user,
        purpose: PAYMENT_PURPOSE.TRANSACTION_ACCOUNT,
        isActive: true,
        isDeleted: { $ne: true },
    })
        .sort({ isBackup: 1, createdAt: -1 })
        .lean();

    if (!blockAccount) {
        throw new Error("Admin block account not found");
    }

    if (!adminTransactionAccount) {
        throw new Error("Admin transaction account not found");
    }

    if (!guideAccount) {
        throw new Error(`Guide transaction account not found for ${guide.companyName}`);
    }

    return {
        blockAccount,
        adminTransactionAccount,
        guideAccount,
        guide,
    };
}

async function getTourBookingStats(
    tourId: mongoose.Types.ObjectId,
    tourCurrency: string
): Promise<{
    totalBookings: number;
    seatsBooked: number;
    totalRevenueBdt: number;
    revenueUsd: number;
}> {
    const bookings = await BookingModel.find({
        tour: tourId,
        deletedAt: null,
        status: { $in: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.COMPLETED] },
        "payment.status": BOOKING_PAYMENT_STATUS.PAID,
    }).lean();

    const totalBookings = bookings.length;
    const seatsBooked = bookings.reduce((sum, booking) => sum + (booking.totalParticipants ?? 0), 0);
    const totalRevenueBdt = bookings.reduce((sum, booking) => sum + (booking.totalPaid ?? 0), 0);

    let revenueUsd = 0;
    if (totalRevenueBdt > 0) {
        if (tourCurrency.toUpperCase() === CURRENCY.USD) {
            revenueUsd = totalRevenueBdt;
        } else if (tourCurrency.toUpperCase() === CURRENCY.BDT) {
            revenueUsd = await convertBdtToUsd(totalRevenueBdt);
        } else {
            throw new Error(`Unsupported tour currency: ${tourCurrency}`);
        }
    }

    return { totalBookings, seatsBooked, totalRevenueBdt, revenueUsd };
}

async function settleTour(tour: ITour): Promise<"settled" | "skipped"> {
    if (tour.status === TOUR_STATUS.COMPLETED && tour.completedAt) {
        return "skipped";
    }

    if (!isTourEndedMoreThanOneDayAgo(tour)) {
        return "skipped";
    }

    const tourId = tour._id as mongoose.Types.ObjectId;
    const stats = await getTourBookingStats(
        tourId,
        tour.basePrice.currency
    );
    const revenueUsd = stats.revenueUsd;

    const adminShareUsd = Number((revenueUsd * Number(ADMIN_COMMISSION_RATE)).toFixed(2));
    const guideShareUsd = Number((revenueUsd * Number(GUIDE_SHARE_RATE)).toFixed(2));
    const adminShareCents = usdToStripeCents(adminShareUsd);
    const guideShareCents = usdToStripeCents(guideShareUsd);

    await withTransaction(async (session) => {
        const accounts = await findSettlementAccounts(tour);

        if (revenueUsd > 0) {
            const settlementBaseRef = `settlement_${tourId.toString()}`;

            await recordSettlementTransaction({
                paymentAccountId: accounts.blockAccount._id as mongoose.Types.ObjectId,
                amountCents: usdToStripeCents(revenueUsd),
                currency: CURRENCY.USD,
                description: `Tour settlement release from block account for tour ${tour.uniqueTourCode}`,
                settlementRef: `${settlementBaseRef}_block_release`,
                session,
            });

            await recordSettlementTransaction({
                paymentAccountId: accounts.adminTransactionAccount._id as mongoose.Types.ObjectId,
                amountCents: adminShareCents,
                currency: CURRENCY.USD,
                description: `Admin commission (15%) for tour ${tour.uniqueTourCode}`,
                settlementRef: `${settlementBaseRef}_admin_commission`,
                session,
            });

            await recordSettlementTransaction({
                paymentAccountId: accounts.guideAccount._id as mongoose.Types.ObjectId,
                amountCents: guideShareCents,
                currency: CURRENCY.USD,
                description: `Guide earnings (85%) for tour ${tour.uniqueTourCode}`,
                settlementRef: `${settlementBaseRef}_guide_earnings`,
                session,
            });
        }

        await TourModel.findByIdAndUpdate(
            tourId,
            {
                $set: {
                    status: TOUR_STATUS.COMPLETED,
                    completedAt: new Date(),
                },
            },
            { session }
        ).exec();

        const seatsTotal = tour.departure?.seatsTotal || 0;
        const occupancyRate = seatsTotal > 0 ? Number((stats.seatsBooked / seatsTotal).toFixed(4)) : 0;

        await TourAnalyticsModel.create(
            [
                {
                    tourId,
                    companyId: tour.companyId,
                    uniqueTourCode: tour.uniqueTourCode,
                    seatsTotal,
                    seatsBooked: stats.seatsBooked,
                    totalBookings: stats.totalBookings,
                    totalRevenue: stats.totalRevenueBdt,
                    occupancyRate,
                    basePrice: tour.basePrice,
                    discounts: tour.discounts,
                    operatingWindow: tour.operatingWindow,
                    departure: tour.departure,
                    viewCount: tour.viewCount || 0,
                    likeCount: tour.likeCount || 0,
                    shareCount: tour.shareCount || 0,
                    reviewCount: tour.ratings?.count || 0,
                    averageRating: tour.ratings?.average || 0,
                },
            ],
            { session }
        );
    });

    console.log(
        `[cron:tour-settlement] Settled tour ${tour.uniqueTourCode} — revenue=$${revenueUsd.toFixed(2)}, admin=$${adminShareUsd.toFixed(2)}, guide=$${guideShareUsd.toFixed(2)}`
    );

    return "settled";
}

/**
 * Settle revenue for active tours that ended more than one day ago.
 */
export async function processTourSettlements(): Promise<TourSettlementResult> {
    const result: TourSettlementResult = {
        eligible: 0,
        settled: 0,
        skipped: 0,
        failed: 0,
        errors: [],
    };

    console.log("[cron:tour-settlement] Starting tour settlement run");

    const activeTours = await TourModel.find({
        status: TOUR_STATUS.ACTIVE,
        deletedAt: null,
    }).lean();

    for (const tour of activeTours) {
        if (!isTourEndedMoreThanOneDayAgo(tour)) {
            continue;
        }

        result.eligible += 1;

        try {
            const status = await settleTour(tour);
            if (status === "settled") result.settled += 1;
            else result.skipped += 1;
        } catch (error) {
            result.failed += 1;
            const message = error instanceof Error ? error.message : "Tour settlement failed";
            result.errors.push(`Tour ${tour.uniqueTourCode}: ${message}`);
            console.error(`[cron:tour-settlement] ${message}`);
        }
    }

    console.log(
        `[cron:tour-settlement] Completed — eligible=${result.eligible}, settled=${result.settled}, skipped=${result.skipped}, failed=${result.failed}`
    );

    return result;
}
