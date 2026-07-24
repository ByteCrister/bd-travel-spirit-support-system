import { NextRequest, NextResponse } from "next/server";
import ConnectDB from "@/config/db";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import TourModel from "@/models/tours/tour.model";
import BookingModel from "@/models/tours/booking.model";
import { TravelerNotificationModel } from "@/models/notifications/traveler-notification.model";
import { NOTIFICATION_PRIORITY, USER_NOTIFICATION_TYPE } from "@/constants/traveler-notification.const";
import { mailer } from "@/config/node-mailer";
import { TOUR_STATUS } from "@/constants/tour.const";
import { BOOKING_STATUS } from "@/constants/tour-booking.const";
import { getBookingReminderHtml } from "@/lib/html/booking-reminder.html";
import { triggerSocketEvent } from "@/socket/triggerSocketEvent";
import { SOCKET_TRIGGERS } from "@/constants/socket.const";

function verifyCronAuth(req: NextRequest) {
    const token = process.env.CRON_API_TOKEN!;
    if (!token) {
        throw new ApiError("Cron API token is not configured", 500);
    }
    const authorization = req.headers.get("authorization");
    if (authorization !== `Bearer ${token}`) {
        throw new ApiError("Unauthorized", 401);
    }
}

export const GET = withErrorHandler(async (req: NextRequest) => {
    verifyCronAuth(req);
    await ConnectDB();

    const now = new Date();

    // Time windows
    const timeWindows = [
        {
            type: "2_DAYS_BEFORE",
            min: new Date(now.getTime() + 47 * 60 * 60 * 1000),
            max: new Date(now.getTime() + 49 * 60 * 60 * 1000),
            subject: "Your tour is coming up in 2 days!",
            isBefore: true
        },
        {
            type: "1_DAY_BEFORE",
            min: new Date(now.getTime() + 23 * 60 * 60 * 1000),
            max: new Date(now.getTime() + 25 * 60 * 60 * 1000),
            subject: "Your tour is tomorrow!",
            isBefore: true
        },
        {
            type: "5_HOURS_BEFORE",
            min: new Date(now.getTime() + 4 * 60 * 60 * 1000),
            max: new Date(now.getTime() + 6 * 60 * 60 * 1000),
            subject: "Your tour starts in 5 hours!",
            isBefore: true
        },
        {
            type: "AFTER_TOUR",
            min: new Date(now.getTime() - 3 * 60 * 60 * 1000), // Up to 3 hours ago
            max: new Date(now.getTime()), // Past
            subject: "Thank you for travelling with us!",
            isBefore: false
        }
    ];

    let notificationsSent = 0;

    // Find all active tours
    const activeTours = await TourModel.find({ status: TOUR_STATUS.ACTIVE, isDeleted: false });

    for (const tour of activeTours) {
        const startDate = tour.departure?.date || tour.operatingWindow?.startDate;

        if (!startDate) continue;

        const durationDays = tour.duration?.days || 0;
        const calculatedEndDate = new Date(startDate);
        calculatedEndDate.setDate(calculatedEndDate.getDate() + durationDays);

        for (const window of timeWindows) {
            let targetDate: Date;
            
            if (window.type === "AFTER_TOUR") {
                targetDate = new Date(calculatedEndDate);
                targetDate.setDate(targetDate.getDate() + 2); // 2 days after tour ends
            } else {
                targetDate = new Date(startDate);
            }

            // Check if targetDate falls within the window min and max
            if (targetDate >= window.min && targetDate <= window.max) {

                // Fetch confirmed bookings for this tour
                const bookings = await BookingModel.find({ tour: tour._id, status: BOOKING_STATUS.CONFIRMED })
                    .populate({
                        path: "traveler",
                        populate: { path: "user", select: "name email" }
                    });

                for (const booking of bookings) {
                    const traveler = booking.traveler as any;
                    if (!traveler || !traveler.user) continue;

                    const user = traveler.user;
                    if (!user.email) continue;

                    // Check if already notified
                    const existingNotification = await TravelerNotificationModel.findOne({
                        recipient: user._id,
                        relatedId: booking._id,
                        "meta.reminderType": window.type
                    });

                    if (existingNotification) continue;

                    // Generate HTML
                    const html = getBookingReminderHtml({
                        userName: user.name || 'Traveler',
                        subject: window.subject,
                        tourTitle: tour.title,
                        departureDate: new Date(startDate).toLocaleString(),
                        isBefore: window.isBefore
                    });

                    // Send email
                    try {
                        await mailer(user.email, window.subject, html);

                        // Save notification
                        const savedNotification = await TravelerNotificationModel.create({
                            recipient: user._id,
                            type: USER_NOTIFICATION_TYPE.BOOKING_REMINDER,
                            priority: NOTIFICATION_PRIORITY.NORMAL,
                            title: window.subject,
                            message: `Tour: ${tour.title}`,
                            relatedModel: "Booking",
                            relatedId: booking._id,
                            isRead: false,
                            deliveredAt: new Date(),
                            meta: { reminderType: window.type }
                        });

                        await triggerSocketEvent({
                            userId: user._id.toString(),
                            type: SOCKET_TRIGGERS.TRAVELER_TOUR_BOOKING_REMINDER,
                            data: savedNotification
                        });

                        notificationsSent++;
                    } catch (err) {
                        console.error(`Failed to send email to ${user.email}`, err);
                    }
                }
            }
        }
    }

    return {
        data: {
            success: true,
            message: "Booking reminders processed",
            notificationsSent
        },
        status: 200
    };
});
