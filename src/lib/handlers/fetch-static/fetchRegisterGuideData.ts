import ConnectDB from "@/config/db";
import GuideModel from "@/models/guide/guide.model";
import BookingModel from "@/models/tours/booking.model";
import { ReviewModel } from "@/models/tours/review.model";
import TourModel from "@/models/tours/tour.model";
import { GUIDE_STATUS } from "@/constants/guide.const";
import { BOOKING_STATUS } from "@/constants/tour-booking.const";

export interface RegisterGuideStats {
    registeredGuides: string;
    happyTravellers: string;
    averageRating: string;
    nationwideReach: string;
}

export default async function fetchRegisterGuideData(): Promise<RegisterGuideStats> {
    await ConnectDB();

    // 1. Registered Guides
    const activeGuidesCount = await GuideModel.countDocuments({ status: GUIDE_STATUS.APPROVED, deletedAt: null });
    const registeredGuides = activeGuidesCount > 0 ? `${activeGuidesCount}+` : "10,000+";

    // 2. Happy Travellers (Total Participants from Confirmed Bookings)
    const visitorsAgg = await BookingModel.aggregate([
        { $match: { status: BOOKING_STATUS.CONFIRMED, deletedAt: null } },
        { $group: { _id: null, total: { $sum: "$totalParticipants" } } }
    ]);
    const totalParticipants = visitorsAgg[0]?.total || 0;
    const happyTravellers = totalParticipants > 0 ? `${totalParticipants}+` : "50,000+";

    // 3. Average Rating
    const avgRatingAgg = await ReviewModel.aggregate([
        { $match: { isApproved: true, deletedAt: null } },
        { 
            $group: { 
                _id: null, 
                avgRating: { $avg: "$rating" }
            } 
        }
    ]);
    const avgRatingValue = avgRatingAgg[0]?.avgRating;
    const averageRating = avgRatingValue ? `${Number(avgRatingValue).toFixed(1)}★` : "4.9★";

    // 4. Nationwide Reach (Distinct Divisions or Districts)
    const distinctDivisions = await TourModel.distinct('division', { deletedAt: null });
    const divisionsCount = distinctDivisions.length;
    const nationwideReach = divisionsCount > 0 ? `${divisionsCount} Divisions` : "8 Divisions";

    return {
        registeredGuides,
        happyTravellers,
        averageRating,
        nationwideReach,
    };
}
