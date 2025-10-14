// /validators/article.create.yup.ts
import * as Yup from 'yup';
import {
    ARTICLE_STATUS,
    ARTICLE_TYPE,
} from '@/constants/article.const';
import { TRAVEL_TYPE } from '@/constants/tour.const';

const richTextBlockSchema = Yup.object({
    type: Yup.string()
        .oneOf(['paragraph', 'link', 'heading'])
        .required(),
    text: Yup.string().nullable(),
    href: Yup.string().url().nullable(),
});

const activitySchema = Yup.object({
    title: Yup.string().required('Activity title is required'),
    url: Yup.string().url().nullable(),
    provider: Yup.string().nullable(),
    duration: Yup.string().nullable(),
    price: Yup.string().nullable(),
    rating: Yup.number().min(0).max(5).nullable(),
});

const attractionSchema = Yup.object({
    title: Yup.string().required('Attraction title is required'),
    description: Yup.string().required('Attraction description is required'),
    bestFor: Yup.string().nullable(),
    insiderTip: Yup.string().nullable(),
    address: Yup.string().nullable(),
    openingHours: Yup.string().nullable(),
    images: Yup.array().of(Yup.string().url()).default([]),
    coordinates: Yup.object({
        lat: Yup.number().required(),
        lng: Yup.number().required(),
    }).nullable(),
});

const destinationSchema = Yup.object({
    city: Yup.string().required('City is required'),
    country: Yup.string().required('Country is required'),
    region: Yup.string().nullable(),
    description: Yup.string().required('Description is required'),
    content: Yup.array().of(richTextBlockSchema).default([]),
    highlights: Yup.array().of(Yup.string()).default([]),
    attractions: Yup.array().of(attractionSchema).default([]),
    activities: Yup.array().of(activitySchema).default([]),
    images: Yup.array().of(Yup.string().url()).default([]),
});

export const createArticleSchema = Yup.object().shape({
    title: Yup.string()
        .min(5, 'Title must be at least 5 characters')
        .required('Title is required'),
    slug: Yup.string()
        .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be kebab-case')
        .required('Slug is required'),
    status: Yup.mixed<ARTICLE_STATUS>()
        .oneOf(Object.values(ARTICLE_STATUS))
        .required('Status is required'),
    articleType: Yup.mixed<ARTICLE_TYPE>()
        .oneOf(Object.values(ARTICLE_TYPE))
        .required('Article type is required'),
    authorBio: Yup.string().default(''),
    summary: Yup.string()
        .min(10, 'Summary must be at least 10 characters')
        .max(300, 'Summary must be under 300 characters')
        .required('Summary is required'),
    heroImage: Yup.string().url().nullable(),
    destinations: Yup.array().of(destinationSchema).default([]),
    categories: Yup.array()
        .of(Yup.mixed<TRAVEL_TYPE>().oneOf(Object.values(TRAVEL_TYPE)))
        .default([]),
    tags: Yup.array().of(Yup.string()).default([]),
    seo: Yup.object({
        metaTitle: Yup.string().min(5).required('Meta title is required'),
        metaDescription: Yup.string()
            .min(10)
            .required('Meta description is required'),
        ogImage: Yup.string().url().nullable(),
    }).nullable(),
    faqs: Yup.array().of(
        Yup.object({
            question: Yup.string().min(5).required('Question is required'),
            answer: Yup.string().min(5).required('Answer is required'),
        })
    ).default([]),
    allowComments: Yup.boolean().default(true),
}).test(
    'destinations-required',
    'At least one destination is required for destination articles',
    (val) => {
        if (
            val?.articleType === ARTICLE_TYPE.SINGLE_DESTINATION ||
            val?.articleType === ARTICLE_TYPE.MULTI_DESTINATION
        ) {
            return Array.isArray(val?.destinations) && val.destinations.length > 0;
        }
        return true;
    }
);

export type CreateArticleFormValues = Yup.InferType<typeof createArticleSchema>;
