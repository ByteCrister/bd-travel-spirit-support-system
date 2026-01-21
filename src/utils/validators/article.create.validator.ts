// /validators/article.create.yup.ts
import * as Yup from 'yup';
import {
    ARTICLE_STATUS,
    ARTICLE_TYPE,
    ARTICLE_RICH_TEXT_BLOCK_TYPE,
    FAQ_CATEGORY,
    FOOD_RECO_SPICE_TYPE,
    ArticleRichTextBlockType,
    FoodRecoSpiceType,
    ArticleType,
} from '@/constants/article.const';
import { TOUR_CATEGORIES, DIVISION, DISTRICT, Division, District, TourCategories } from '@/constants/tour.const';

const richTextBlockSchema = Yup.object({
    type: Yup.mixed<ArticleRichTextBlockType>()
        .oneOf(Object.values(ARTICLE_RICH_TEXT_BLOCK_TYPE))
        .required('Rich text block type is required'),
    text: Yup.string().when('type', {
        is: (type: string) => type !== 'link',
        then: (schema) => schema.required('Text is required for non-link blocks'),
        otherwise: (schema) => schema.nullable(),
    }),
    href: Yup.string().when('type', {
        is: 'link',
        then: (schema) => schema.url('Valid URL required for link blocks').required('Href is required for link blocks'),
        otherwise: (schema) => schema.nullable(),
    }),
});

const foodRecommendationSchema = Yup.object({
    dishName: Yup.string().required('Dish name is required'),
    description: Yup.string().required('Description is required'),
    bestPlaceToTry: Yup.string().nullable(),
    approximatePrice: Yup.string().nullable(),
    spiceLevel: Yup.mixed<FoodRecoSpiceType>()
        .oneOf(Object.values(FOOD_RECO_SPICE_TYPE))
        .nullable(),
});

const localFestivalSchema = Yup.object({
    name: Yup.string().required('Festival name is required'),
    description: Yup.string().required('Description is required'),
    timeOfYear: Yup.string().required('Time of year is required'),
    location: Yup.string().required('Location is required'),
    significance: Yup.string().nullable(),
});

const destinationBlockSchema = Yup.object({
    division: Yup.mixed<Division>()
        .oneOf(Object.values(DIVISION))
        .required('Division is required'),
    district: Yup.mixed<District>()
        .oneOf(Object.values(DISTRICT))
        .required('District is required'),
    area: Yup.string().nullable(),
    description: Yup.string().required('Description is required'),
    content: Yup.array().of(richTextBlockSchema).required('Content is required'),
    highlights: Yup.array().of(Yup.string().trim()).required('Highlights are required'),
    foodRecommendations: Yup.array().of(foodRecommendationSchema).required('Food recommendations are required'),
    localFestivals: Yup.array().of(localFestivalSchema).required('Local festivals are required'),
    localTips: Yup.array().of(Yup.string().trim()).required('Local tips are required'),
    transportOptions: Yup.array().of(Yup.string().trim()).required('Transport options are required'),
    accommodationTips: Yup.array().of(Yup.string().trim()).required('Accommodation tips are required'),
    coordinates: Yup.object({
        lat: Yup.number().required(),
        lng: Yup.number().required(),
    }).required('Coordinates are required'),
    imageAsset: Yup.object({
        title: Yup.string().required('Image title is required'),
        assetId: Yup.string().required('Asset ID is required'),
        url: Yup.string().required('Url is required'),
    })
        .optional(),
});

const faqSchema = Yup.object({
    question: Yup.string().required('Question is required'),
    answer: Yup.string().required('Answer is required'),
    category: Yup.string()
        .oneOf(Object.values(FAQ_CATEGORY))
        .nullable(),
});

export const createArticleSchema = Yup.object().shape({
    title: Yup.string()
        .min(5, 'Title must be at least 5 characters')
        .required('Title is required'),
    banglaTitle: Yup.string()
        .min(5, 'Bangla title must be at least 5 characters')
        .required('Bangla title is required'),
    status: Yup.mixed<ARTICLE_STATUS>()
        .oneOf(Object.values(ARTICLE_STATUS))
        .required('Status is required'),
    articleType: Yup.mixed<ArticleType>()
        .oneOf(Object.values(ARTICLE_TYPE))
        .required('Article type is required'),
    authorBio: Yup.string().nullable(),
    summary: Yup.string()
        .min(10, 'Summary must be at least 10 characters')
        .max(300, 'Summary must be under 300 characters')
        .required('Summary is required'),
    heroImage: Yup.string().nullable(),
    destinations: Yup.array().of(destinationBlockSchema).min(1, 'At least one content block is required').required(),
    categories: Yup.array()
        .of(
            Yup.mixed<TourCategories>().oneOf(
                Object.values(TOUR_CATEGORIES) as TourCategories[]
            )
        )
        .min(1, 'At least one category is required')
        .required('Categories are required'),
    tags: Yup.array().of(Yup.string().trim()).required('Tags is required'),
    seo: Yup.object({
        metaTitle: Yup.string().min(5).required('Meta title is required'),
        metaDescription: Yup.string()
            .min(10)
            .required('Meta description is required'),
        ogImage: Yup.string().nullable(),
    }).required(),
    faqs: Yup.array().of(faqSchema).required('FAQs are required'),
    allowComments: Yup.boolean().default(true),
}).test(
    'destinations-required',
    'At least one destination is required for destination articles',
    (val) => {
        if (
            val?.articleType === ARTICLE_TYPE.SINGLE_DESTINATION ||
            val?.articleType === ARTICLE_TYPE.MULTI_DESTINATION ||
            val?.articleType === ARTICLE_TYPE.CITY_GUIDE ||
            val?.articleType === ARTICLE_TYPE.HILL_STATION ||
            val?.articleType === ARTICLE_TYPE.BEACH_DESTINATION ||
            val?.articleType === ARTICLE_TYPE.HISTORICAL_SITE
        ) {
            return Array.isArray(val?.destinations) && val.destinations.length > 0;
        }
        return true;
    }
).test(
    'author-bio-required-for-guest',
    'Author bio is required when author is a guest',
    (val) => {
        // Assuming guest authors need bio, adjust logic based on your requirements
        // This is a placeholder - you might want to check if author is not a registered user
        if (val?.authorBio === undefined || val?.authorBio === '') {
            return true; // Adjust based on your logic
        }
        return true;
    }
);

export type CreateArticleFormValues = Yup.InferType<typeof createArticleSchema>;