import { ARTICLE_RICH_TEXT_BLOCK_TYPE, ARTICLE_STATUS, ARTICLE_TYPE, FAQ_CATEGORY, FOOD_RECO_SPICE_TYPE } from "@/constants/article.const";
import { DISTRICT, DIVISION, TOUR_CATEGORIES } from "@/constants/tour.const";
import { CreateArticleFormValues } from "@/utils/validators/article.create.validator";

export const DEFAULT_TOUR_ARTICLE: CreateArticleFormValues = {
    title: '',
    banglaTitle: '',
    status: ARTICLE_STATUS.DRAFT,
    articleType: ARTICLE_TYPE.SINGLE_DESTINATION,
    authorBio: '',
    summary: '',
    heroImage: '',
    destinations: [
        {
            division: DIVISION.DHAKA,
            district: DISTRICT.DHAKA,
            area: '',
            description: '',
            content: [
                {
                    type: ARTICLE_RICH_TEXT_BLOCK_TYPE.PARAGRAPH,
                    text: '',
                },
            ],
            highlights: [''],
            foodRecommendations: [
                {
                    dishName: '',
                    description: '',
                    bestPlaceToTry: '',
                    approximatePrice: '',
                    spiceLevel: null,
                },
            ],
            localFestivals: [
                {
                    name: '',
                    description: '',
                    timeOfYear: '',
                    location: '',
                    significance: '',
                },
            ],
            localTips: [''],
            transportOptions: [''],
            accommodationTips: [''],
            coordinates: {
                lat: 0,
                lng: 0,
            },
            imageAsset: {
                title: '',
                assetId: '',
                url: '',
            },
        },
    ],

    categories: [],
    tags: [],
    seo: {
        metaTitle: '',
        metaDescription: '',
        ogImage: null,
    },
    faqs: [],
    allowComments: true,
};

export const DEFAULT_TOUR_ARTICLE_1: CreateArticleFormValues = {
    title: "The Ultimate Guide to Cox's Bazar: World's Longest Natural Sea Beach",
    banglaTitle: "কক্সবাজার: বিশ্বের দীর্ঘতম প্রাকৃতিক সমুদ্র সৈকতের চূড়ান্ত গাইড",
    // slug: "ultimate-guide-coxs-bazar-worlds-longest-natural-sea-beach",
    status: ARTICLE_STATUS.DRAFT,
    articleType: ARTICLE_TYPE.BEACH_DESTINATION,
    authorBio: "A passionate travel writer with 5 years of experience exploring Bangladesh's hidden gems and popular destinations.",
    summary: "Discover everything you need to know about visiting Cox's Bazar, from pristine beaches and local cuisine to accommodation tips and cultural experiences.",
    heroImage: null,
    destinations: [
        {
            division: DIVISION.DHAKA,
            district: DISTRICT.DHAKA,
            area: "Kolatali Point",
            description: "Cox's Bazar is famous for its 120 km long uninterrupted natural sandy beach, the world's longest. The area combines natural beauty with cultural diversity.",
            content: [
                {
                    type: ARTICLE_RICH_TEXT_BLOCK_TYPE.PARAGRAPH,
                    text: "Cox's Bazar offers more than just beaches. The serene ambiance, friendly locals, and delicious seafood make it a must-visit destination in Bangladesh.",
                },
                {
                    type: ARTICLE_RICH_TEXT_BLOCK_TYPE.HEADING,
                    text: "Best Time to Visit",
                },
                {
                    type: ARTICLE_RICH_TEXT_BLOCK_TYPE.PARAGRAPH,
                    text: "The ideal time is from November to February when the weather is pleasant with minimal rainfall.",
                },
            ],
            highlights: [
                "120 km long uninterrupted sandy beach",
                "Stunning sunrise and sunset views",
                "Fresh seafood and local cuisine",
                "Nearby attractions like Himchori and Inani Beach",
            ],
            foodRecommendations: [
                {
                    dishName: "Prawn Malai Curry",
                    description: "A creamy coconut-based prawn curry cooked with local spices",
                    bestPlaceToTry: "Mermaid Café at Kolatali Point",
                    approximatePrice: "BDT 450-600",
                    spiceLevel: FOOD_RECO_SPICE_TYPE.SPICY,
                },
                {
                    dishName: "Rupchanda Fry",
                    description: "Fresh pomfret fish marinated in turmeric and spices, deep-fried to perfection",
                    bestPlaceToTry: "Beachside stalls near Laboni Point",
                    approximatePrice: "BDT 300-400 per piece",
                    spiceLevel: FOOD_RECO_SPICE_TYPE.MILD,
                },
            ],
            localFestivals: [
                {
                    name: "Cox's Bazar Beach Festival",
                    description: "Annual cultural festival celebrating the beach with music, dance, and food stalls",
                    timeOfYear: "December",
                    location: "Kolatali Beach",
                    significance: "Promotes local tourism and cultural exchange",
                },
            ],
            localTips: [
                "Bargain politely when shopping at local markets",
                "Avoid swimming after sunset for safety",
                "Carry cash as some remote areas don't accept cards",
                "Respect local customs and dress modestly",
            ],
            transportOptions: [
                "Bus from Dhaka (8-10 hours)",
                "Flight from Dhaka to Cox's Bazar Airport (1 hour)",
                "Local CNG/autorickshaw for short distances",
            ],
            accommodationTips: [
                "Book hotels in advance during peak season (Nov-Feb)",
                "Beachfront hotels offer better views but are pricier",
                "Guesthouses near Kolatali are budget-friendly",
                "Check for AC availability if visiting in summer",
            ],
            coordinates: { lat: 21.4272, lng: 92.0058 },
            imageAsset: undefined,
        },
    ],
    categories: [TOUR_CATEGORIES.BEACHES, TOUR_CATEGORIES.FOOD_DRINK, TOUR_CATEGORIES.NATURE],
    tags: ["beach", "coxs-bazar", "bangladesh-tourism", "seafood", "budget-travel"],
    seo: {
        metaTitle: "Cox's Bazar Travel Guide - World's Longest Beach in Bangladesh",
        metaDescription: "Complete travel guide to Cox's Bazar: best time to visit, local food, accommodation tips, and must-see attractions at the world's longest natural sea beach.",
        ogImage: undefined,
    },
    faqs: [
        {
            question: "What is the best way to reach Cox's Bazar from Dhaka?",
            answer: "You can take an 8-10 hour bus ride or a 1-hour flight from Dhaka to Cox's Bazar Airport. Flights are faster but more expensive.",
            category: FAQ_CATEGORY.TRANSPORT,
        },
        {
            question: "Is Cox's Bazar safe for solo female travelers?",
            answer: "Yes, Cox's Bazar is generally safe for solo female travelers. Stick to well-lit areas at night, dress modestly, and avoid isolated beaches after dark.",
            category: FAQ_CATEGORY.SAFETY,
        },
        {
            question: "What are the must-try local dishes?",
            answer: "Don't miss Prawn Malai Curry, Rupchanda Fry, and fresh coconut water. Beachside seafood stalls offer the most authentic experience.",
            category: FAQ_CATEGORY.FOOD,
        },
    ],
    allowComments: true,
};

export const DEFAULT_TOUR_ARTICLE_2: CreateArticleFormValues = {
    title: "Exploring the Mystical Hills of Bandarban: A Complete Travel Guide",
    banglaTitle: "বান্দরবানের রহস্যময় পাহাড়: একটি সম্পূর্ণ ভ্রমণ গাইড",
    // slug: "exploring-bandarban-hills-complete-travel-guide",
    status: ARTICLE_STATUS.DRAFT,
    articleType: ARTICLE_TYPE.HILL_STATION,
    authorBio: "Adventure enthusiast specializing in offbeat destinations and trekking in Bangladesh's Chittagong Hill Tracts.",
    summary: "Your comprehensive guide to Bandarban's hill tracts, indigenous culture, trekking routes, and breathtaking natural wonders.",
    heroImage: null,
    destinations: [
        {
            division: DIVISION.CHATTOGRAM,
            district: DISTRICT.BANDARBAN,
            area: "Nilgiri Hills",
            description: "Bandarban is part of the Chittagong Hill Tracts, known for its lush green hills, indigenous communities, and diverse flora and fauna.",
            content: [
                {
                    type: ARTICLE_RICH_TEXT_BLOCK_TYPE.PARAGRAPH,
                    text: "Bandarban offers an escape into nature with its misty hills, waterfalls, and rich tribal culture. It's a paradise for trekkers and nature lovers.",
                },
                {
                    type: ARTICLE_RICH_TEXT_BLOCK_TYPE.HEADING,
                    text: "Top Trekking Routes",
                },
                {
                    type: ARTICLE_RICH_TEXT_BLOCK_TYPE.PARAGRAPH,
                    text: "The trek to Keokradong (883m) and Tahjindong (Bijoy) are popular among adventurers. Always hire a local guide for safety.",
                },
            ],
            highlights: [
                "Nilgiri Hills at 2000 feet",
                "Boga Lake - a mysterious natural lake",
                "Indigenous Marma and Tripura villages",
                "Golden Temple (Buddha Dhatu Jadi)",
            ],
            foodRecommendations: [
                {
                    dishName: "Bamboo Chicken",
                    description: "Chicken cooked inside bamboo with local herbs and spices",
                    bestPlaceToTry: "Local tribal restaurants in Bandarban town",
                    approximatePrice: "BDT 350-500",
                    spiceLevel: FOOD_RECO_SPICE_TYPE.SPICY,
                },
            ],
            localFestivals: [
                {
                    name: "Wangala Festival",
                    description: "Harvest festival of the Garo tribe with traditional dance and music",
                    timeOfYear: "November",
                    location: "Various villages in Bandarban",
                    significance: "Thanksgiving for a good harvest",
                },
            ],
            localTips: [
                "Obtain necessary permits for restricted areas",
                "Hire local guides for trekking",
                "Respect tribal customs and seek permission before photography",
                "Carry warm clothes as nights can be chilly",
            ],
            transportOptions: [
                "Bus from Chittagong (3-4 hours)",
                "4WD vehicles for hill roads",
                "Local jeeps for remote areas",
            ],
            accommodationTips: [
                "Stay at hill resorts for best views",
                "Eco-resorts available near Boga Lake",
                "Book during weekdays to avoid crowds",
            ],
            coordinates: { lat: 22.195, lng: 92.219 },
            imageAsset: undefined,
        },
    ],
    categories: [TOUR_CATEGORIES.FOOD_DRINK, TOUR_CATEGORIES.NATURE, TOUR_CATEGORIES.NATURE],
    tags: ["bandarban", "hill-station", "trekking", "tribal-culture", "bangladesh-hills"],
    seo: {
        metaTitle: "Bandarban Travel Guide - Hills, Tribes and Adventure in Bangladesh",
        metaDescription: "Discover Bandarban's trekking trails, indigenous culture, waterfalls and hill stations in the Chittagong Hill Tracts of Bangladesh.",
        ogImage: undefined,
    },
    faqs: [
        {
            question: "Do I need special permission to visit Bandarban?",
            answer: "Yes, foreign tourists need a permit from the DC office in Bandarban. Bangladeshi nationals need permission for certain restricted areas.",
            category: FAQ_CATEGORY.SAFETY,
        },
        {
            question: "What is the best time for trekking in Bandarban?",
            answer: "October to March is ideal, as the weather is dry and cool. Avoid the monsoon season (June-September) due to heavy rains and landslides.",
            category: FAQ_CATEGORY.CULTURE,
        },
    ],
    allowComments: true,
};