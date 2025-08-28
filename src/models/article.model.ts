// models/article.model.ts
import { model, models } from 'mongoose';
import { Schema, Types, Document } from 'mongoose';

/**
 * Enum representing the possible publication states of an article.
 */
export enum ArticleStatus {
    DRAFT = 'draft',         // Article is being written or edited
    PUBLISHED = 'published', // Article is live and visible to readers
    ARCHIVED = 'archived',   // Article is no longer actively displayed
}

/**
 * Enum representing allowed tags for articles.
 * Adjust this list to match your platform's taxonomy.
 */
export enum ArticleTag {
    TECHNOLOGY = 'technology',
    BUSINESS = 'business',
    EDUCATION = 'education',
    HEALTH = 'health',
    TRAVEL = 'travel',
    LIFESTYLE = 'lifestyle',
    SCIENCE = 'science',
    ENTERTAINMENT = 'entertainment',
}

/**
 * Enum representing allowed categories for articles.
 * Categories are usually broader groupings than tags.
 */
export enum ArticleCategory {
    NEWS = 'news',
    TUTORIAL = 'tutorial',
    OPINION = 'opinion',
    REVIEW = 'review',
    CASE_STUDY = 'case_study',
    INTERVIEW = 'interview',
}

export interface IArticle extends Document {
    title: string;
    slug: string;
    author: Types.ObjectId;
    status: ArticleStatus;
    summary: string;
    tags: ArticleTag[];
    categories: ArticleCategory[];
    coverImage?: string;
    isFeatured?: boolean;
    publishedAt?: Date;
    content: Record<string, unknown>;
    viewCount?: number;
    likeCount?: number;
    allowComments?: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ArticleSchema = new Schema<IArticle>(
    {
        title: { type: String, required: true, trim: true },
        slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
        author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        status: {
            type: String,
            enum: Object.values(ArticleStatus),
            default: ArticleStatus.DRAFT,
            index: true,
        },
        summary: { type: String, default: '', trim: true },
        tags: [
            {
                type: String,
                enum: Object.values(ArticleTag),
                index: true,
            },
        ],
        categories: [
            {
                type: String,
                enum: Object.values(ArticleCategory),
                index: true,
            },
        ],
        coverImage: { type: String, default: '' },
        isFeatured: { type: Boolean, default: false, index: true },
        publishedAt: { type: Date, index: true },
        content: {
            type: Schema.Types.Mixed,
            required: true,
            validate: {
                validator: (value: unknown) =>
                    typeof value === 'object' &&
                    value !== null &&
                    (value as { type?: string }).type === 'doc',
                message: 'Invalid Tiptap document structure',
            },
        },
        viewCount: { type: Number, default: 0 },
        likeCount: { type: Number, default: 0 },
        allowComments: { type: Boolean, default: true },
    },
    { timestamps: true }
);

// Index for finding featured/published quickly
ArticleSchema.index({ isFeatured: 1, status: 1 });

export const ArticleModel = models.Article || model<IArticle>('Article', ArticleSchema);
