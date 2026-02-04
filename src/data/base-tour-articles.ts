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

export const DEFAULT_TOUR_ARTICLE_3: CreateArticleFormValues = {
    title: "Cox's Bazar: World's Longest Natural Sea Beach",
    banglaTitle: "কক্সবাজার: বিশ্বের দীর্ঘতম প্রাকৃতিক সমুদ্র সৈকত",
    status: ARTICLE_STATUS.PUBLISHED,
    articleType: ARTICLE_TYPE.BEACH_DESTINATION,
    authorBio: "Marine tourism expert with 15 years experience in coastal Bangladesh destinations.",
    summary: "A complete guide to Cox's Bazar's 120km beach, seafood, and nearby attractions like Himchari and Inani Beach.",
    heroImage: null,
    destinations: [
        {
            division: DIVISION.CHATTOGRAM,
            district: DISTRICT.COX_BAZAR,
            area: "Kolatoli Beach",
            description: "Cox's Bazar is famous for its long sandy beach facing the Bay of Bengal, offering sunrise views and beach activities.",
            content: [
                {
                    type: ARTICLE_RICH_TEXT_BLOCK_TYPE.PARAGRAPH,
                    text: "The beach stretches over 120 km, making it the world's longest natural sea beach. Ideal for swimming, surfing, and sunset walks.",
                },
                {
                    type: ARTICLE_RICH_TEXT_BLOCK_TYPE.HEADING,
                    text: "Must-Visit Nearby Spots",
                },
                {
                    type: ARTICLE_RICH_TEXT_BLOCK_TYPE.PARAGRAPH,
                    text: "Himchari National Park, Inani Beach with coral stones, and Ramu Buddhist temples are within easy reach.",
                },
            ],
            highlights: [
                "120 km uninterrupted beach",
                "Fresh seafood and beachside cafes",
                "Himchari Waterfall",
                "Marine Drive scenic road",
            ],
            foodRecommendations: [
                {
                    dishName: "Pomfret Curry",
                    description: "Fresh pomfret fish in spicy curry with rice",
                    bestPlaceToTry: "Sea Pearl Restaurant",
                    approximatePrice: "BDT 450-700",
                    spiceLevel: FOOD_RECO_SPICE_TYPE.MEDIUM,
                },
            ],
            localFestivals: [
                {
                    name: "Beach Festival",
                    description: "Annual festival with cultural programs, sand art, and sports",
                    timeOfYear: "December-January",
                    location: "Kolatoli Beach",
                    significance: "Promotes beach tourism and local culture",
                },
            ],
            localTips: [
                "Swim only in designated safe zones",
                "Bargain for beach souvenir items",
                "Apply sunscreen generously",
                "Visit early morning for peaceful walks",
            ],
            transportOptions: [
                "Direct bus from Dhaka (10-12 hours)",
                "Flight to Cox's Bazar Airport",
                "Local CNG and rickshaws",
            ],
            accommodationTips: [
                "Book beachfront hotels in advance during peak season",
                "Many resorts offer sea-view balconies",
                "Budget guesthouses available near Laboni Point",
            ],
            coordinates: { lat: 21.4272, lng: 92.0058 },
            imageAsset: undefined,
        },
    ],
    categories: [TOUR_CATEGORIES.BEACHES, TOUR_CATEGORIES.NATURE],
    tags: ["cox-bazar", "beach", "seafood", "bay-of-bengal", "himchari"],
    seo: {
        metaTitle: "Cox's Bazar Travel Guide - World's Longest Beach in Bangladesh",
        metaDescription: "Experience the world's longest natural sea beach at Cox's Bazar. Guide to swimming, seafood, Himchari, and beach activities.",
        ogImage: undefined,
    },
    faqs: [
        {
            question: "Is Cox's Bazar safe for swimming?",
            answer: "Yes, but only in designated swimming zones with lifeguards. Avoid monsoon season when currents are strong.",
            category: FAQ_CATEGORY.SAFETY,
        },
        {
            question: "What is the best time to visit?",
            answer: "November to February for pleasant weather. Avoid the rainy season (June-September).",
            category: FAQ_CATEGORY.TRANSPORT,
        },
    ],
    allowComments: true,
};

export const DEFAULT_TOUR_ARTICLE_4: CreateArticleFormValues = {
    title: "Sylhet Division Tour: Tea Gardens & Ratargul Swamp Forest",
    banglaTitle: "সিলেট বিভাগ ভ্রমণ: চা বাগান ও রাতারগুল জলাবন",
    status: ARTICLE_STATUS.PUBLISHED,
    articleType: ARTICLE_TYPE.MULTI_DESTINATION,
    authorBio: "Travel writer specializing in Northeast Bangladesh's ecology and cultural heritage.",
    summary: "Explore Sylhet's iconic tea estates, the only swamp forest in Bangladesh, and spiritual sites like Hazrat Shahjalal's shrine.",
    heroImage: null,
    destinations: [
        {
            division: DIVISION.SYLHET,
            district: DISTRICT.MOULVIBAZAR,
            area: "Sreemangal",
            description: "Known as the tea capital of Bangladesh, Sreemangal offers lush tea gardens, rainforests, and biodiversity.",
            content: [
                {
                    type: ARTICLE_RICH_TEXT_BLOCK_TYPE.PARAGRAPH,
                    text: "Sreemangal is home to numerous tea estates including the famous Finley Tea Garden. The area also has Lawachara National Park and tribal villages.",
                },
            ],
            highlights: [
                "Tea garden tours and tasting",
                "Lawachara National Park",
                "Tribal Khasia community villages",
                "Seven-layer tea at Nilkantha Tea Cabin",
            ],
            foodRecommendations: [
                {
                    dishName: "Seven-layer Tea",
                    description: "Unique tea with seven distinct layers of flavor and color",
                    bestPlaceToTry: "Nilkantha Tea Cabin, Sreemangal",
                    approximatePrice: "BDT 200-300",
                    spiceLevel: FOOD_RECO_SPICE_TYPE.MILD,
                },
            ],
            localFestivals: [
                {
                    name: "Sylhet Tea Festival",
                    description: "Celebration of tea culture with plucking demonstrations and tasting sessions",
                    timeOfYear: "January",
                    location: "Sreemangal",
                    significance: "Promotes Sylhet's tea industry",
                },
            ],
            localTips: [
                "Carry rain gear; Sylhet is one of the wettest regions",
                "Respect tea garden workers and avoid trespassing",
                "Try local pineapples and oranges",
            ],
            transportOptions: [
                "Train from Dhaka to Sreemangal",
                "Local jeeps for garden tours",
                "Cycle rickshaws within town",
            ],
            accommodationTips: [
                "Stay at tea garden bungalows for authentic experience",
                "Eco-resorts available near Lawachara",
            ],
            coordinates: { lat: 24.3065, lng: 91.7296 },
            imageAsset: undefined,
        },
        {
            division: DIVISION.SYLHET,
            district: DISTRICT.MOULVIBAZAR,
            area: "Ratargul Swamp Forest",
            description: "The only freshwater swamp forest in Bangladesh, accessible by boat during monsoon.",
            content: [
                {
                    type: ARTICLE_RICH_TEXT_BLOCK_TYPE.PARAGRAPH,
                    text: "Ratargul is a unique ecosystem submerged under water for half the year. Boat tours allow visitors to glide through flooded forest corridors.",
                },
            ],
            highlights: [
                "Boat tours through submerged forest",
                "Rich birdlife and monkeys",
                "Photography during monsoon (June-October)",
            ],
            foodRecommendations: [],
            localFestivals: [],
            localTips: [
                "Visit during monsoon for best experience",
                "Wear life jackets during boat ride",
                "Carry mosquito repellent",
            ],
            transportOptions: [
                "Boat from Gowainghat",
                "Local guides mandatory",
            ],
            accommodationTips: [
                "Stay in Sylhet city; day trip to Ratargul",
            ],
            coordinates: { lat: 25.1018, lng: 91.9773 },
            imageAsset: undefined,
        },
    ],
    categories: [TOUR_CATEGORIES.NATURE, TOUR_CATEGORIES.CULTURE_HISTORY],
    tags: ["sylhet", "tea-garden", "sreemangal", "ratargul", "swamp-forest"],
    seo: {
        metaTitle: "Sylhet Tour Guide: Tea Estates, Ratargul Swamp Forest & Cultural Sites",
        metaDescription: "Discover Sylhet's tea gardens, Ratargul swamp forest, Hazrat Shahjalal shrine, and natural wonders in Northeast Bangladesh.",
        ogImage: undefined,
    },
    faqs: [
        {
            question: "What is the best season to visit Ratargul?",
            answer: "Monsoon season (June to October) when the forest is flooded and boat access is possible.",
            category: FAQ_CATEGORY.TRANSPORT,
        },
        {
            question: "Are there accommodation options inside tea gardens?",
            answer: "Yes, some tea estates offer bungalow stays with prior booking and permission.",
            category: FAQ_CATEGORY.ACCOMMODATION,
        },
    ],
    allowComments: true,
};

export const DEFAULT_TOUR_ARTICLE_5: CreateArticleFormValues = {
    title: "Dhaka City Guide: Heritage, Food & Modern Life",
    banglaTitle: "ঢাকা শহর গাইড: ঐতিহ্য, খাবার ও আধুনিক জীবন",
    status: ARTICLE_STATUS.PUBLISHED,
    articleType: ARTICLE_TYPE.CITY_GUIDE,
    authorBio: "Dhaka-based cultural historian and food tour guide.",
    summary: "From Mughal-era landmarks to bustling street food, explore the vibrant capital of Bangladesh.",
    heroImage: null,
    destinations: [
        {
            division: DIVISION.DHAKA,
            district: DISTRICT.DHAKA,
            area: "Old Dhaka",
            description: "The historic heart of Dhaka with Mughal and British colonial architecture, vibrant markets, and authentic street food.",
            content: [
                {
                    type: ARTICLE_RICH_TEXT_BLOCK_TYPE.PARAGRAPH,
                    text: "Old Dhaka is a maze of narrow lanes, centuries-old buildings, and bustling bazaars. It's the cultural and culinary soul of the city.",
                },
                {
                    type: ARTICLE_RICH_TEXT_BLOCK_TYPE.HEADING,
                    text: "Key Attractions",
                },
                {
                    type: ARTICLE_RICH_TEXT_BLOCK_TYPE.PARAGRAPH,
                    text: "Lalbagh Fort, Ahsan Manzil, Armenian Church, and Star Mosque showcase Dhaka's diverse heritage.",
                },
            ],
            highlights: [
                "Lalbagh Fort (Mughal fort)",
                "Sadarghat River Port",
                "Shankhari Bazaar",
                "Street food at Chawk Bazaar",
            ],
            foodRecommendations: [
                {
                    dishName: "Haji Biriyani",
                    description: "Famous aromatic biriyani with tender meat and special spices",
                    bestPlaceToTry: "Haji Biriyani, Old Dhaka",
                    approximatePrice: "BDT 300-500",
                    spiceLevel: FOOD_RECO_SPICE_TYPE.MEDIUM,
                },
            ],
            localFestivals: [
                {
                    name: "Dhaka International Film Festival",
                    description: "Annual film festival showcasing local and international cinema",
                    timeOfYear: "January",
                    location: "Various venues in Dhaka",
                    significance: "Cultural exchange through films",
                },
            ],
            localTips: [
                "Use rickshaws in Old Dhaka lanes",
                "Bargain in local markets",
                "Try street food from busy stalls",
                "Carry small change for rickshaws",
            ],
            transportOptions: [
                "CNG auto-rickshaws",
                "Rickshaws for short distances",
                "Ride-sharing services",
            ],
            accommodationTips: [
                "Stay in Gulshan or Banani for modern amenities",
                "Old Dhaka has heritage guesthouses",
            ],
            coordinates: { lat: 23.7099, lng: 90.4071 },
            imageAsset: undefined,
        },
    ],
    categories: [TOUR_CATEGORIES.CITY, TOUR_CATEGORIES.FOOD_DRINK],
    tags: ["dhaka", "old-dhaka", "street-food", "heritage", "bangladesh-capital"],
    seo: {
        metaTitle: "Dhaka City Travel Guide: Heritage Sites, Street Food & Modern Attractions",
        metaDescription: "Explore Dhaka's Old City, Mughal forts, vibrant street food, and modern neighborhoods in this comprehensive city guide.",
        ogImage: undefined,
    },
    faqs: [
        {
            question: "Is Dhaka safe for tourists?",
            answer: "Generally safe, but be cautious in crowded areas and use registered transport. Avoid isolated areas at night.",
            category: FAQ_CATEGORY.SAFETY,
        },
        {
            question: "What is the best way to get around Dhaka?",
            answer: "Rickshaws and CNGs for short distances, ride-sharing apps for longer trips. Traffic can be heavy during peak hours.",
            category: FAQ_CATEGORY.TRANSPORT,
        },
    ],
    allowComments: true,
};

export const DEFAULT_TOUR_ARTICLE_6: CreateArticleFormValues = {
    title: "Saint Martin's Island: Coral Paradise of Bangladesh",
    banglaTitle: "সেন্ট মার্টিন্স দ্বীপ: বাংলাদেশের প্রবাল দ্বীপ",
    status: ARTICLE_STATUS.PUBLISHED,
    articleType: ARTICLE_TYPE.BEACH_DESTINATION,
    authorBio: "Marine biologist and sustainable tourism advocate for Bangladesh's islands.",
    summary: "Discover Bangladesh's only coral island with pristine beaches, blue waters, and marine life.",
    heroImage: null,
    destinations: [
        {
            division: DIVISION.CHATTOGRAM,
            district: DISTRICT.COX_BAZAR,
            area: "Saint Martin's Island",
            description: "A small coral island in the Bay of Bengal known for its clear waters, live corals, and serene environment.",
            content: [
                {
                    type: ARTICLE_RICH_TEXT_BLOCK_TYPE.PARAGRAPH,
                    text: "Saint Martin's is the only coral island in Bangladesh, offering snorkeling, fresh seafood, and stunning sunsets. The island is eco-sensitive and tourism is regulated.",
                },
            ],
            highlights: [
                "Coral reefs and snorkeling",
                "Fresh seafood especially lobster",
                "Chera Dwip (tidal island)",
                "Starry night skies",
            ],
            foodRecommendations: [
                {
                    dishName: "Grilled Lobster",
                    description: "Fresh lobster grilled with local spices and butter",
                    bestPlaceToTry: "Beachside restaurants, Saint Martin's",
                    approximatePrice: "BDT 800-1500",
                    spiceLevel: FOOD_RECO_SPICE_TYPE.MILD,
                },
            ],
            localFestivals: [],
            localTips: [
                "Carry cash; no ATMs on island",
                "Respect coral reefs; avoid touching",
                "Book accommodation in advance during season",
                "Carry sunscreen and hats",
            ],
            transportOptions: [
                "Ferry from Teknaf",
                "Speed boat options available",
            ],
            accommodationTips: [
                "Limited resorts; book early",
                "Eco-cottages available",
                "Homestays with local families",
            ],
            coordinates: { lat: 20.6142, lng: 92.3228 },
            imageAsset: undefined,
        },
    ],
    categories: [TOUR_CATEGORIES.BEACHES, TOUR_CATEGORIES.NATURE],
    tags: ["saint-martin", "coral-island", "snorkeling", "bay-of-bengal", "eco-tourism"],
    seo: {
        metaTitle: "Saint Martin's Island Guide - Coral Reefs & Pristine Beaches in Bangladesh",
        metaDescription: "Visit Bangladesh's only coral island: Saint Martin's. Guide to snorkeling, seafood, Chera Dwip, and sustainable tourism.",
        ogImage: undefined,
    },
    faqs: [
        {
            question: "When is the best time to visit Saint Martin's Island?",
            answer: "November to March. Ferry services are closed during monsoon (April-October) due to rough seas.",
            category: FAQ_CATEGORY.TRANSPORT,
        },
        {
            question: "Are there ATMs on the island?",
            answer: "No, carry sufficient cash from Cox's Bazar or Teknaf.",
            category: FAQ_CATEGORY.FOOD,
        },
    ],
    allowComments: true,
};

export const DEFAULT_TOUR_ARTICLE_7: CreateArticleFormValues = {
    title: "Historical Mosques of Bagerhat: UNESCO World Heritage",
    banglaTitle: "বাগেরহাটের ঐতিহাসিক মসজিদ: ইউনেস্কো বিশ্ব ঐতিহ্য",
    status: ARTICLE_STATUS.PUBLISHED,
    articleType: ARTICLE_TYPE.HISTORICAL_SITE,
    authorBio: "Archaeology researcher specializing in medieval Islamic architecture of Bengal.",
    summary: "Explore the 15th-century mosque city founded by Khan Jahan Ali, a masterpiece of brick architecture.",
    heroImage: null,
    destinations: [
        {
            division: DIVISION.KHULNA,
            district: DISTRICT.BAGERHAT,
            area: "Bagerhat Sadar",
            description: "A medieval city with over 50 Islamic monuments from the 15th century, showcasing unique brick architecture.",
            content: [
                {
                    type: ARTICLE_RICH_TEXT_BLOCK_TYPE.PARAGRAPH,
                    text: "Bagerhat, also known as the Mosque City, was founded by Turkish general Khan Jahan Ali in the 15th century. The site is a UNESCO World Heritage Site.",
                },
            ],
            highlights: [
                "Sixty Dome Mosque (Shat Gombuj Masjid)",
                "Khan Jahan Ali's Tomb",
                "Nine Dome Mosque",
                "Ghora Dighi pond",
            ],
            foodRecommendations: [
                {
                    dishName: "Panta Ilish",
                    description: "Fermented rice with hilsa fish, a traditional Bengali dish",
                    bestPlaceToTry: "Local eateries in Bagerhat",
                    approximatePrice: "BDT 300-500",
                    spiceLevel: FOOD_RECO_SPICE_TYPE.MEDIUM,
                },
            ],
            localFestivals: [
                {
                    name: "Khan Jahan Ali Urs",
                    description: "Annual death anniversary celebration with prayers and fairs",
                    timeOfYear: "October",
                    location: "Khan Jahan Ali Tomb Complex",
                    significance: "Religious and cultural gathering",
                },
            ],
            localTips: [
                "Hire a local guide for historical insights",
                "Wear modest clothing at religious sites",
                "Carry water and sun protection",
            ],
            transportOptions: [
                "Bus from Khulna or Mongla",
                "Local auto-rickshaws",
            ],
            accommodationTips: [
                "Stay in Khulna city; day trip to Bagerhat",
                "Basic guesthouses available in Bagerhat",
            ],
            coordinates: { lat: 22.6666, lng: 89.7619 },
            imageAsset: undefined,
        },
    ],
    categories: [TOUR_CATEGORIES.HERITAGE, TOUR_CATEGORIES.CULTURE_HISTORY],
    tags: ["bagerhat", "unesco", "mosque-city", "khan-jahan-ali", "medieval-architecture"],
    seo: {
        metaTitle: "Bagerhat Mosque City: UNESCO World Heritage Site in Bangladesh",
        metaDescription: "Discover Bagerhat's 15th-century mosques, Khan Jahan Ali's tomb, and medieval Islamic architecture in this UNESCO site guide.",
        ogImage: undefined,
    },
    faqs: [
        {
            question: "Why is Bagerhat called the Mosque City?",
            answer: "Because it contains a concentration of over 50 mosques and Islamic monuments from the 15th century.",
            category: FAQ_CATEGORY.CULTURE,
        },
        {
            question: "Is photography allowed inside mosques?",
            answer: "Yes, but avoid during prayer times and always ask for permission.",
            category: FAQ_CATEGORY.CULTURE,
        },
    ],
    allowComments: true,
};

export const DEFAULT_TOUR_ARTICLE_8: CreateArticleFormValues = {
    title: "Sundarbans Mangrove Forest: Royal Bengal Tiger Habitat",
    banglaTitle: "সুন্দরবন ম্যানগ্রোভ বন: রয়েল বেঙ্গল টাইগারের আবাস",
    status: ARTICLE_STATUS.PUBLISHED,
    articleType: ARTICLE_TYPE.CULTURAL_EXPERIENCE,
    authorBio: "Wildlife conservationist and guide specializing in Sundarbans ecosystem.",
    summary: "Venture into the world's largest mangrove forest, home to the Royal Bengal Tiger and diverse wildlife.",
    heroImage: null,
    destinations: [
        {
            division: DIVISION.KHULNA,
            district: DISTRICT.BAGERHAT,
            area: "Sundarbans East Zone",
            description: "The Sundarbans is a UNESCO World Heritage Site and Ramsar wetland, famous for its mangrove ecosystem and Bengal tigers.",
            content: [
                {
                    type: ARTICLE_RICH_TEXT_BLOCK_TYPE.PARAGRAPH,
                    text: "The Sundarbans spans Bangladesh and India, with the Bangladesh part being the largest mangrove forest globally. It's a critical habitat for tigers, dolphins, and birds.",
                },
            ],
            highlights: [
                "Royal Bengal Tiger sightings",
                "Spotted deer and crocodiles",
                "River dolphins in Passur River",
                "Karamjal Wildlife Sanctuary",
            ],
            foodRecommendations: [
                {
                    dishName: "Bhapa Pitha",
                    description: "Steamed rice cakes with coconut and jaggery, a local sweet",
                    bestPlaceToTry: "Local villages near Sundarbans",
                    approximatePrice: "BDT 50-100",
                    spiceLevel: FOOD_RECO_SPICE_TYPE.MILD,
                },
            ],
            localFestivals: [
                {
                    name: "Sundarbans Day",
                    description: "Awareness programs and cultural events celebrating the mangrove forest",
                    timeOfYear: "February 14",
                    location: "Various spots in Khulna region",
                    significance: "Promotes conservation of Sundarbans",
                },
            ],
            localTips: [
                "Always travel with authorized guides",
                "Carry mosquito nets and repellents",
                "Follow forest department rules strictly",
                "Avoid loud noises to not disturb wildlife",
            ],
            transportOptions: [
                "Motorboat from Mongla or Khulna",
                "Forest department permits required",
            ],
            accommodationTips: [
                "Stay on live-aboard boats for multi-day trips",
                "Forest rest houses at Kotka and Hiron Point",
            ],
            coordinates: { lat: 22.476, lng: 89.584 },
            imageAsset: undefined,
        },
    ],
    categories: [TOUR_CATEGORIES.WILDLIFE, TOUR_CATEGORIES.NATURE],
    tags: ["sundarbans", "mangrove", "bengal-tiger", "wildlife", "unesco"],
    seo: {
        metaTitle: "Sundarbans Travel Guide: Mangrove Forest, Tigers & Wildlife in Bangladesh",
        metaDescription: "Explore the Sundarbans, world's largest mangrove forest, home to Royal Bengal Tigers, dolphins, and rich biodiversity. Complete travel guide.",
        ogImage: undefined,
    },
    faqs: [
        {
            question: "How likely is it to see a Royal Bengal Tiger?",
            answer: "Tiger sightings are rare as they are elusive. However, signs like pugmarks are commonly seen.",
            category: FAQ_CATEGORY.SAFETY,
        },
        {
            question: "What permits are needed?",
            answer: "Forest Department permit and registered guide are mandatory for entry.",
            category: FAQ_CATEGORY.SAFETY,
        },
    ],
    allowComments: true,
};

export const DEFAULT_TOUR_ARTICLE_9: CreateArticleFormValues = {
    title: "Pohela Boishakh Celebration: Bengali New Year Festival",
    banglaTitle: "পহেলা বৈশাখ উদযাপন: বাংলা নববর্ষ উৎসব",
    status: ARTICLE_STATUS.DRAFT,
    articleType: ARTICLE_TYPE.FESTIVAL_GUIDE,
    authorBio: "Cultural anthropologist documenting Bengali festivals and traditions.",
    summary: "Experience the vibrant Bengali New Year celebrations with traditional food, music, and festivities across Bangladesh.",
    heroImage: null,
    destinations: [
        {
            division: DIVISION.DHAKA,
            district: DISTRICT.DHAKA,
            area: "Ramna Park",
            description: "The epicenter of Pohela Boishakh celebrations in Dhaka, featuring the famous Mangal Shobhajatra procession and cultural programs.",
            content: [
                {
                    type: ARTICLE_RICH_TEXT_BLOCK_TYPE.PARAGRAPH,
                    text: "Pohela Boishakh marks the first day of the Bengali calendar. Celebrations include traditional food, music, dance, and colorful processions.",
                },
            ],
            highlights: [
                "Mangal Shobhajatra procession",
                "Traditional attire (saree, panjabi)",
                "Baishakhi fairs across the country",
                "Traditional songs (Rabindra Sangeet)",
            ],
            foodRecommendations: [
                {
                    dishName: "Panta Ilish",
                    description: "Fermented rice with fried hilsa fish, onion, and green chili",
                    bestPlaceToTry: "Home celebrations and restaurants",
                    approximatePrice: "BDT 400-600",
                    spiceLevel: FOOD_RECO_SPICE_TYPE.MEDIUM,
                },
            ],
            localFestivals: [
                {
                    name: "Pohela Boishakh",
                    description: "Bengali New Year celebration with cultural events and traditional food",
                    timeOfYear: "April 14",
                    location: "Nationwide, especially Ramna Park, Dhaka",
                    significance: "Celebrates Bengali culture and new beginnings",
                },
            ],
            localTips: [
                "Wear traditional clothes to blend in",
                "Arrive early for processions to get good views",
                "Carry cash for fairs and food stalls",
            ],
            transportOptions: [
                "Public transport available but crowded",
                "Rickshaws and CNGs",
                "Walking recommended near event areas",
            ],
            accommodationTips: [
                "Book hotels months in advance",
                "Consider staying outside city center",
            ],
            coordinates: { lat: 23.7362, lng: 90.3956 },
            imageAsset: undefined,
        },
    ],
    categories: [TOUR_CATEGORIES.CULTURE_HISTORY],
    tags: ["pohela-boishakh", "bengali-new-year", "festival", "mangal-shobhajatra", "cultural-event"],
    seo: {
        metaTitle: "Pohela Boishakh Guide: Bengali New Year Celebrations in Bangladesh",
        metaDescription: "Join the vibrant Pohela Boishakh celebrations: Mangal Shobhajatra, traditional food, cultural events, and Bengali New Year festivities.",
        ogImage: undefined,
    },
    faqs: [
        {
            question: "What is Mangal Shobhajatra?",
            answer: "A colorful procession held at dawn on Pohela Boishakh, symbolizing unity and positive energy.",
            category: FAQ_CATEGORY.CULTURE,
        },
        {
            question: "Is it safe to attend large gatherings?",
            answer: "Generally safe, but be aware of pickpockets in crowds. Follow local authorities' instructions.",
            category: FAQ_CATEGORY.SAFETY,
        },
    ],
    allowComments: true,
};

export const DEFAULT_TOUR_ARTICLE_10: CreateArticleFormValues = {
    title: "Bangladeshi Street Food: A Culinary Adventure",
    banglaTitle: "বাংলাদেশের স্ট্রিট ফুড: একটি রন্ধনসম্পর্কীয় অ্যাডভেঞ্চার",
    status: ARTICLE_STATUS.PUBLISHED,
    articleType: ARTICLE_TYPE.FOOD_GUIDE,
    authorBio: "Food blogger and culinary tour guide exploring Bangladesh's street food scene.",
    summary: "From fuchka to jhalmuri, explore the vibrant and diverse street food culture across Bangladesh.",
    heroImage: null,
    destinations: [
        {
            division: DIVISION.DHAKA,
            district: DISTRICT.DHAKA,
            area: "Dhanmondi Lake Area",
            description: "A popular spot for street food lovers, offering a variety of snacks from evening until late night.",
            content: [
                {
                    type: ARTICLE_RICH_TEXT_BLOCK_TYPE.PARAGRAPH,
                    text: "Bangladeshi street food is a blend of flavors, textures, and spices. It's affordable, delicious, and an integral part of local life.",
                },
            ],
            highlights: [
                "Fuchka (pani puri) with tangy tamarind water",
                "Jhalmuri (spicy puffed rice)",
                "Chotpoti (spicy chickpea salad)",
                "Grilled corn and chana chaat",
            ],
            foodRecommendations: [
                {
                    dishName: "Fuchka",
                    description: "Crisp hollow puris filled with potato, chickpeas, and spicy tamarind water",
                    bestPlaceToTry: "Dhanmondi Road 27",
                    approximatePrice: "BDT 30-50 per plate",
                    spiceLevel: FOOD_RECO_SPICE_TYPE.SPICY,
                },
            ],
            localFestivals: [],
            localTips: [
                "Choose busy stalls for freshness",
                "Carry hand sanitizer",
                "Start with milder items if sensitive to spice",
            ],
            transportOptions: [
                "Rickshaws or walking",
                "Ride-sharing to food hubs",
            ],
            accommodationTips: [
                "Stay nearby to explore multiple food spots",
            ],
            coordinates: { lat: 23.7465, lng: 90.376 },
            imageAsset: undefined,
        },
    ],
    categories: [TOUR_CATEGORIES.FOOD_DRINK],
    tags: ["street-food", "fuchka", "jhalmuri", "bangladeshi-cuisine", "food-tour"],
    seo: {
        metaTitle: "Bangladeshi Street Food Guide: Must-Try Snacks & Where to Find Them",
        metaDescription: "Discover Bangladesh's vibrant street food: fuchka, jhalmuri, chotpoti, and more. A guide to the best street food spots across the country.",
        ogImage: undefined,
    },
    faqs: [
        {
            question: "Is street food safe for foreigners?",
            answer: "Generally safe if you choose busy, reputable stalls. Avoid raw salads and drink bottled water.",
            category: FAQ_CATEGORY.FOOD,
        },
        {
            question: "What is the average cost of street food?",
            answer: "Very affordable, ranging from BDT 20 to 150 per item.",
            category: FAQ_CATEGORY.FOOD,
        },
    ],
    allowComments: true,
};

export const DEFAULT_TOUR_ARTICLE_11: CreateArticleFormValues = {
    title: "Bangladesh Travel Essentials: Tips for First-Time Visitors",
    banglaTitle: "বাংলাদেশ ভ্রমণ গাইড: প্রথমবার ভ্রমণকারীদের জন্য টিপস",
    status: ARTICLE_STATUS.PUBLISHED,
    articleType: ARTICLE_TYPE.TRAVEL_TIPS,
    authorBio: "Travel consultant with extensive experience in Bangladesh tourism logistics.",
    summary: "Practical advice on visas, transportation, weather, and cultural etiquette for travelers to Bangladesh.",
    heroImage: null,
    destinations: [
        {
            division: DIVISION.DHAKA,
            district: DISTRICT.DHAKA,
            area: "General Travel Tips",
            description: "Essential information for planning a trip to Bangladesh, covering logistics, culture, and safety.",
            content: [
                {
                    type: ARTICLE_RICH_TEXT_BLOCK_TYPE.PARAGRAPH,
                    text: "Bangladesh offers rich culture, nature, and history. Being prepared ensures a smooth and enjoyable journey.",
                },
                {
                    type: ARTICLE_RICH_TEXT_BLOCK_TYPE.HEADING,
                    text: "Key Tips",
                },
                {
                    type: ARTICLE_RICH_TEXT_BLOCK_TYPE.PARAGRAPH,
                    text: "Dress modestly, carry cash, learn basic Bengali phrases, and be flexible with plans due to traffic and weather.",
                },
            ],
            highlights: [
                "Visa on arrival for many nationalities",
                "Affordable domestic transport",
                "Rich hospitality culture",
                "Diverse landscapes from hills to coast",
            ],
            foodRecommendations: [
                {
                    dishName: "Biriyani",
                    description: "Fragrant rice dish with meat, potatoes, and spices",
                    bestPlaceToTry: "Old Dhaka restaurants",
                    approximatePrice: "BDT 300-600",
                    spiceLevel: FOOD_RECO_SPICE_TYPE.MEDIUM,
                },
            ],
            localFestivals: [],
            localTips: [
                "Carry a power bank for frequent load-shedding",
                "Use ride-sharing apps for transparent pricing",
                "Respect prayer times when visiting mosques",
                "Keep small change for rickshaws and tips",
            ],
            transportOptions: [
                "Domestic flights for long distances",
                "Trains for scenic journeys",
                "Buses for inter-city travel",
                "Rickshaws for short distances",
            ],
            accommodationTips: [
                "Book in advance during festivals",
                "Check for generator backup in hotels",
                "Guesthouses offer local experiences",
            ],
            coordinates: { lat: 23.8103, lng: 90.4125 },
            imageAsset: undefined,
        },
    ],
    categories: [TOUR_CATEGORIES.CULTURE_HISTORY],
    tags: ["travel-tips", "bangladesh-guide", "visa", "transport", "culture-etiquette"],
    seo: {
        metaTitle: "Bangladesh Travel Tips: Essential Guide for First-Time Visitors",
        metaDescription: "Plan your Bangladesh trip with essential tips on visas, transport, weather, cultural etiquette, and must-visit destinations.",
        ogImage: undefined,
    },
    faqs: [
        {
            question: "Do I need a visa for Bangladesh?",
            answer: "Most nationalities require a visa. Visa on arrival is available for many countries at major airports.",
            category: FAQ_CATEGORY.TRANSPORT,
        },
        {
            question: "What is the best way to handle money?",
            answer: "Carry cash (BDT) as many places don't accept cards. ATMs are available in cities.",
            category: FAQ_CATEGORY.FOOD,
        },
    ],
    allowComments: true,
};