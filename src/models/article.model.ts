// models/travelArticle.model.ts
import { model, models, Schema, Types, Document } from 'mongoose';

/**
 * Enum for article publication status
 */
export enum ArticleStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published',
    ARCHIVED = 'archived',
}

/**
 * Enum for high-level travel categories
 */
export enum TravelCategory {
    DESTINATION_GUIDE = 'destination_guide',
    BEACHES = 'beaches',
    FOOD_DRINK = 'food_drink',
    CULTURE_HISTORY = 'culture_history',
    ADVENTURE = 'adventure',
    FAMILY = 'family',
    ROMANTIC = 'romantic',
}

/**
 * Interface for structured attractions (optional)
 */
interface IAttraction {
    title: string;
    description: string;
    bestFor?: string;
    insiderTip?: string;
    address?: string;
    openingHours?: string;
    images: string[];
    coordinates?: { lat: number; lng: number };
}

/**
 * Interface for FAQs
 */
interface IFAQ {
    question: string;
    answer: string;
}

/**
 * Interface for TipTap JSON document
 * (You can expand this as needed to match your TipTap schema)
 */
interface ITipTapDoc {
    type: 'doc';
    content?: Array<Record<string, unknown>>;
    [key: string]: unknown;
}

/**
 * Main travel article interface
 */
export interface ITravelArticle extends Document {
    title: string;
    slug: string;
    status: ArticleStatus;
    author: Types.ObjectId;
    authorBio?: string;
    summary: string;
    heroImage: string;
    heroVideo?: string;
    destination: {
        city: string;
        country: string;
        region?: string;
    };
    categories?: TravelCategory[];
    tags?: string[];
    publishedAt?: Date;
    readingTime?: number;
    seo: { metaTitle: string; metaDescription: string; ogImage?: string };
    attractions?: IAttraction[];
    /**
     * TipTap JSON document
     * This stores the entire rich-text content of the article
     * exactly as TipTap outputs it.
     */
    content: ITipTapDoc;
    /**
     * Optional query info for fetching related activities dynamically
     */
    relatedActivitiesQuery?: {
        provider: string;
        query: string;
        maxResults?: number;
    };
    faqs?: IFAQ[];
    viewCount: number;
    likeCount: number;
    shareCount: number;
    allowComments: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const TravelArticleSchema = new Schema<ITravelArticle>(
    {
        title: { type: String, required: true, trim: true },
        slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
        status: {
            type: String,
            enum: Object.values(ArticleStatus),
            default: ArticleStatus.DRAFT,
            index: true,
        },
        author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        authorBio: { type: String, trim: true },
        summary: { type: String, required: true, trim: true },
        heroImage: { type: String, required: true },
        heroVideo: { type: String },
        destination: {
            city: { type: String, required: true, trim: true },
            country: { type: String, required: true, trim: true },
            region: { type: String, trim: true },
        },
        categories: [{ type: String, enum: Object.values(TravelCategory), index: true }],
        tags: [{ type: String, trim: true, index: true }],
        publishedAt: { type: Date, index: true },
        readingTime: { type: Number, default: 0 },
        seo: {
            metaTitle: { type: String, trim: true },
            metaDescription: { type: String, trim: true },
            ogImage: { type: String, trim: true },
        },
        attractions: [
            {
                title: { type: String, required: true, trim: true },
                description: { type: String, required: true },
                bestFor: { type: String, trim: true },
                insiderTip: { type: String, trim: true },
                address: { type: String, trim: true },
                openingHours: { type: String, trim: true },
                images: [{ type: String, required: true }],
                coordinates: { lat: Number, lng: Number },
            },
        ],
        content: {
            type: Schema.Types.Mixed,
            required: true,
            validate: {
                validator: (value: unknown) =>
                    typeof value === 'object' &&
                    value !== null &&
                    (value as { type?: string }).type === 'doc',
                message: 'Invalid TipTap document structure',
            },
        },
        relatedActivitiesQuery: {
            provider: String,
            query: String,
            maxResults: Number,
        },
        faqs: [{ question: { type: String }, answer: { type: String } }],
        viewCount: { type: Number, default: 0 },
        likeCount: { type: Number, default: 0 },
        shareCount: { type: Number, default: 0 },
        allowComments: { type: Boolean, default: true },
    },
    { timestamps: true }
);

TravelArticleSchema.index({ status: 1, publishedAt: -1 });

export const TravelArticleModel =
    models.TravelArticle || model<ITravelArticle>('TravelArticle', TravelArticleSchema);
