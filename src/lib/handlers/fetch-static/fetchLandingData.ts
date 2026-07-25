import type { LandingPageData } from "@/types/guide/join-as-guide.types";
import type { IGuideBannerSetting } from "@/models/site-settings/guideBanner.model";
import type { ISocialLinkSetting } from "@/models/site-settings/socialLink.model";
import GuideBannerSetting from "@/models/site-settings/guideBanner.model";
import SocialLinkSetting from "@/models/site-settings/socialLink.model";
import { AssetModel, IAsset } from "@/models/assets/asset.model";
import AssetFileModel, { IAssetFile } from "@/models/assets/asset-file.model";
import ConnectDB from "@/config/db";

import GuideModel from "@/models/guide/guide.model";
import TourModel from "@/models/tours/tour.model";
import BookingModel from "@/models/tours/booking.model";
import { ReviewModel } from "@/models/tours/review.model";
import { TravelerModel } from "@/models/travelers/traveler.model";
import { GUIDE_STATUS } from "@/constants/guide.const";
import { TOUR_STATUS } from "@/constants/tour.const";
import { BOOKING_STATUS } from "@/constants/tour-booking.const";

/**
 * Type representing a GuideBannerSetting document after populating:
 * - asset (with its file sub-document populated)
 */
type PopulatedBanner = Omit<IGuideBannerSetting, "asset"> & {
    asset: (Omit<IAsset, "file"> & {
        file: IAssetFile;
    }) | null;
};

/**
 * Fetches landing page data from the database.
 * - Hero carousel images are fetched from GuideBannerSetting (active, not deleted, ordered by `order`).
 * - Footer social links are fetched from SocialLinkSetting (active, not deleted, ordered by `order`).
 * - Statistical data is aggregated from Guide, Tour, Booking, Review, and Traveler models.
 */
export default async function fetchLandingData(): Promise<LandingPageData> {

    await ConnectDB();

    // Fetch active banners with their associated Asset and AssetFile to get public URLs
    const banners = (await GuideBannerSetting.find({
        active: true,
        deleteAt: null,
    })
        .sort({ order: 1 })
        .populate({
            path: "asset",
            model: AssetModel, // explicit model reference
            match: { deletedAt: null },
            populate: {
                path: "file",
                model: AssetFileModel, // explicit model reference
            },
        })
        .lean()) as unknown as PopulatedBanner[];

    // Extract public URLs from banners, filtering out any where asset or file is missing
    const heroCarouselImages = banners
        .map((banner) => banner.asset?.file?.publicUrl)
        .filter((url): url is string => Boolean(url));

    // Fetch active social links, sorted by order
    const socialLinksDocs = (await SocialLinkSetting.find({
        active: true,
        deleteAt: null,
    })
        .sort({ order: 1 })
        .lean()) as unknown as ISocialLinkSetting[];

    // Map to the expected footer.socialLinks format
    const socialLinks = socialLinksDocs.map((link) => ({
        icon: link.icon,
        name: link.label || link.key,
        href: link.url,
    }));

    // --- AGGREGATE DYNAMIC STATS ---
    
    // 1. Guides Count
    const activeGuidesCount = await GuideModel.countDocuments({ status: GUIDE_STATUS.APPROVED, deletedAt: null });
    const activeGuides = activeGuidesCount > 0 ? activeGuidesCount : 1000; // Fallback if DB is empty
    
    // 2. Destinations Count (unique districts)
    const distinctDistricts = await TourModel.distinct('district', { deletedAt: null });
    const totalDestinations = distinctDistricts.length > 0 ? distinctDistricts.length : 50;

    // 3. Bookings and Visitors
    const confirmedBookingsCount = await BookingModel.countDocuments({ status: BOOKING_STATUS.CONFIRMED, deletedAt: null });
    const bookingProcessed = confirmedBookingsCount > 0 ? confirmedBookingsCount : 24000;
    
    const visitorsAgg = await BookingModel.aggregate([
        { $match: { status: BOOKING_STATUS.CONFIRMED, deletedAt: null } },
        { $group: { _id: null, total: { $sum: "$totalParticipants" } } }
    ]);
    const monthlyVisitors = visitorsAgg[0]?.total || 150000; 

    // 4. Testimonials and Ratings
    const avgRatingAgg = await ReviewModel.aggregate([
        { $match: { isApproved: true, deletedAt: null } },
        { 
            $group: { 
                _id: null, 
                avgRating: { $avg: "$rating" }, 
                totalCount: { $sum: 1 }, 
                happyCount: { $sum: { $cond: [{ $gte: ["$rating", 4] }, 1, 0] } } 
            } 
        }
    ]);
    
    let averageRating = 4.7;
    let satisfactionRage = 92;
    if (avgRatingAgg.length > 0) {
        averageRating = Number(avgRatingAgg[0].avgRating.toFixed(1));
        const totalReviews = avgRatingAgg[0].totalCount;
        const happyReviews = avgRatingAgg[0].happyCount;
        satisfactionRage = totalReviews > 0 ? Math.round((happyReviews / totalReviews) * 100) : 92;
    }

    const happyGuidesDistinct = await TourModel.distinct('companyId', { 'ratings.average': { $gte: 4 }, deletedAt: null });
    const happyGuides = happyGuidesDistinct.length > 0 ? happyGuidesDistinct.length : 980;

    // Fetch dynamic testimonials (latest 3 5-star reviews)
    const recentReviews = await ReviewModel.find({ isApproved: true, rating: 5, deletedAt: null })
        .sort({ createdAt: -1 })
        .limit(3)
        .populate('user', 'firstName lastName address')
        .populate('tour', 'tourType')
        .lean();
    
    let testimonials = recentReviews.map((r: any) => ({
        id: r._id.toString(),
        name: r.user ? `${r.user.firstName || ''} ${r.user.lastName || ''}`.trim() || 'Happy Traveler' : 'Happy Traveler',
        location: r.user?.address?.city ? `${r.user.address.city}, ${r.user.address.country || 'Bangladesh'}` : 'Bangladesh',
        role: r.tour?.tourType ? `${r.tour.tourType} Traveler` : 'Traveler',
        quote: r.comment || "Amazing experience, highly recommended!",
        rating: r.rating || 5,
    }));

    if (testimonials.length === 0) {
        testimonials = [
            {
                id: "t2",
                name: "Ayesha Rahman",
                location: "Dhaka, Bangladesh",
                role: "Cultural Heritage Guide",
                quote: "BD Travel Spirit transformed my business completely. I went from 2-3 bookings per month to 15+ bookings. The platform's reach and professional tools helped me connect with travelers from 20+ countries.",
                rating: 5,
            },
            {
                id: "t3",
                name: "Rahim Hassan",
                location: "Cox's Bazar, Bangladesh",
                role: "Adventure Tour Guide",
                quote: "The booking management system is incredibly intuitive. I can handle multiple tours simultaneously, communicate with guests seamlessly, and the payout process is lightning fast. Highly recommended!",
                rating: 5,
            },
            {
                id: "t4",
                name: "Nadia Ahmed",
                location: "Sylhet, Bangladesh",
                role: "Tea Garden Specialist",
                quote: "Their marketing support is exceptional. My niche tea-garden tours were discovered by the perfect audience. The featured placement and social media promotion increased my bookings by 300% in just 6 months.",
                rating: 5,
            },
        ];
    }

    // 5. Global research countries
    const distinctCountries = await TravelerModel.distinct('address.country', { deletedAt: null });
    const global_research_countries = distinctCountries.length > 0 ? distinctCountries.length : 50;

    // Dynamic data
    const data: LandingPageData = {
        hero: {
            totalGuides: activeGuides,
            monthlyVisitors,
            totalDestinations,
            heroCarouselImages,
        },

        whyPartner: {
            monthlyVisitors,
            bookingProcessed,
            activeGuides,
        },

        testimonials: {
            testimonials,
            averageRating,
            satisfactionRage,
            happyGuides,
        },

        footer: {
            socialLinks,
            stats: {
                active_guides: activeGuides,
                destinations: totalDestinations,
                average_rating: averageRating,
                secure_payment: 100, // Kept static
                global_research_countries,
            },
        },
    };

    return data;
}