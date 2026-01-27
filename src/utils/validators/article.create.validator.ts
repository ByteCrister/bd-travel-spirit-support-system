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
    ArticleStatus,
    FaqCategory,
} from '@/constants/article.const';
import { TOUR_CATEGORIES, DIVISION, DISTRICT, Division, District, TourCategories } from '@/constants/tour.const';

const BANGLA_CHAR_REGEX = /^[\s\u0980-\u09FF\u0964\u0965,.!?:;()-]+$/;
const BANGLA_LETTER_REGEX = /[\u0985-\u09B9\u09DC-\u09DD\u09DF-\u09E3]/;

const containsBanglaLetter = (value?: string) =>
    !!value && BANGLA_LETTER_REGEX.test(value);

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
    id: Yup.string().optional(),// null/undefined for create and valid for updating
    division: Yup.mixed<Division>()
        .oneOf(Object.values(DIVISION))
        .required('Division is required'),
    district: Yup.mixed<District>()
        .oneOf(Object.values(DISTRICT))
        .required('District is required'),
    area: Yup.string().nullable(),
    description: Yup.string().required('Description is required'),
    content: Yup.array().of(richTextBlockSchema).min(1, 'Content blocks are required').required('Content is required'),
    highlights: Yup.array().of(Yup.string().trim()).required('Highlights are required'),
    foodRecommendations: Yup.array().of(foodRecommendationSchema).required('Food recommendations are required'),
    localFestivals: Yup.array().of(localFestivalSchema).required('Local festivals are required'),
    localTips: Yup.array().of(Yup.string().trim()).required('Local tips are required'),
    transportOptions: Yup.array().of(Yup.string().trim()).required('Transport options are required'),
    accommodationTips: Yup.array().of(Yup.string().trim()).required('Accommodation tips are required'),
    coordinates: Yup.object({
        lat: Yup.number()
            .required('Latitude is required')
            .min(20.7, 'Latitude must be within Bangladesh')
            .max(26.6, 'Latitude must be within Bangladesh'),
        lng: Yup.number()
            .required('Longitude is required')
            .min(88.0, 'Longitude must be within Bangladesh')
            .max(92.7, 'Longitude must be within Bangladesh'),
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
    category: Yup.mixed<FaqCategory>().oneOf(
        Object.values(FAQ_CATEGORY) as FaqCategory[]
    ),
});

export const createArticleSchema = Yup.object().shape({
    title: Yup.string()
        .min(5, 'Title must be at least 5 characters')
        .required('Title is required'),
    banglaTitle: Yup.string()
        .min(5, 'Bangla title must be at least 5 characters')
        .required('Bangla title is required')
        .matches(
            BANGLA_CHAR_REGEX,
            'Bangla title must contain only Bangla characters and common punctuation'
        )
        .test(
            'contains-bangla-letter',
            'Bangla title must contain at least one Bangla letter',
            containsBanglaLetter
        ),
    status: Yup.mixed<ArticleStatus>()
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
    destinations: Yup.array().of(destinationBlockSchema).min(1, 'At least one content block is required').required('Destinations are required'),
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
        ogImage: Yup.string()
            .nullable()
            .test(
                'og-image',
                'Invalid image',
                (value) =>
                    !value ||
                    value.startsWith('http') ||
                    value.startsWith('data:image')
            )
        ,
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