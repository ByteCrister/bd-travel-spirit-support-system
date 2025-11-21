import type { LandingPageData } from "@/types/join-as-guide.types";

const imageFilenames = [
    "amphitheater-fortaleza-san-felipe-puerta-plata-dominican-republic.jpg",
    "beautiful-nature-landscape-with-black-sandy-beach-ocean.jpg",
    "dreamy-rainbow-countryside.jpg",
    "fishing-boat.jpg",
    "green-trunk-mountains-foggy-mist-scenic.jpg",
    "indian-city-buildings-scene.jpg",
    "life-mexico-landscape-with-lake.jpg",
    "person-traveling-enjoying-their-vacation.jpg",
    "pexels-khanshaheb-9711952.jpg",
    "pexels-rasel69-948437.jpg",
    "pexels-sayeedxchowdhury-33447786.jpg",
    "vertical-aerial-shot-different-boats-parked-edge-shore-near-water.jpg",
];
// Mock loader — replace with real CMS/DB fetch later
export default async function fetchLandingData(): Promise<LandingPageData> {
    const data: LandingPageData = {
        hero: {
            totalGuides: 1000,
            monthlyVisitors: 150000,
            totalDestinations: 50,
            heroCarouselImages: imageFilenames,
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
            socialLinks: [
                { icon: "FiFacebook", name: "Facebook", href: "https://facebook.com/yourpage" },
                { icon: "FiTwitter", name: "Twitter", href: "https://twitter.com/yourpage" },
                { icon: "FiInstagram", name: "Instagram", href: "https://instagram.com/yourpage" },
                { icon: "FiLinkedin", name: "LinkedIn", href: "https://linkedin.com/company/yourpage" },
                { icon: "FiYoutube", name: "YouTube", href: "https://youtube.com/yourchannel" },
            ],
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