import type { LandingPageData } from "@/types/guide/join-as-guide.types";
import type { IGuideBannerSetting } from "@/models/site-settings/guideBanner.model";
import type { ISocialLinkSetting } from "@/models/site-settings/socialLink.model";
import GuideBannerSetting from "@/models/site-settings/guideBanner.model";
import SocialLinkSetting from "@/models/site-settings/socialLink.model";
import { AssetModel, IAsset } from "@/models/assets/asset.model";
import AssetFileModel, { IAssetFile } from "@/models/assets/asset-file.model";
import ConnectDB from "@/config/db";

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
 * - All other static data remains as in the original mock.
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

    // Static data (unchanged from original mock)
    const data: LandingPageData = {
        hero: {
            totalGuides: 1000,
            monthlyVisitors: 150000,
            totalDestinations: 50,
            heroCarouselImages,
        },

        whyPartner: {
            monthlyVisitors: 150000,
            bookingProcessed: 24000,
            activeGuides: 1000,
        },

        testimonials: {
            testimonials: [
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
            ],
            averageRating: 4.7,
            satisfactionRage: 92,
            happyGuides: 980,
        },

        footer: {
            socialLinks,
            stats: {
                active_guides: 1000,
                destinations: 50,
                average_rating: 4.9,
                secure_payment: 100,
                global_research_countries: 50,
            },
        },
    };

    return data;
}