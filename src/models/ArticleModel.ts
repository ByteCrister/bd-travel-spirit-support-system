// models/Article.ts

import { Schema, Types, Document, Connection } from 'mongoose';

/**
 * Represents a rich-text article powered by Tiptap's ProseMirror JSON format.
 */
export interface IArticle extends Document {
    title: string;                       // Human-readable title
    slug: string;                        // URL slug (unique, lowercase)
    author: Types.ObjectId;              // Reference to author
    status: 'draft' | 'published' | 'archived';
    summary: string;                     // SEO/preview description
    tags: string[];                       // For search/discovery
    categories: string[];                 // For grouping/filtering
    coverImage?: string;                  // Social/SEO cover image
    isFeatured?: boolean;                 // Spotlighted content
    publishedAt?: Date;                   // When it went live
    content: Record<string, unknown>;     // Full Tiptap JSON document
    viewCount?: number;                   // Engagement metric
    likeCount?: number;                   // Engagement metric
    allowComments?: boolean;              // Commenting toggle
    createdAt: Date;
    updatedAt: Date;
}

const ArticleSchema = new Schema<IArticle>(
    {
        title: { type: String, required: true, trim: true },
        slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
        author: { type: Schema.Types.ObjectId, ref: 'users', required: true },
        status: {
            type: String,
            enum: ['draft', 'published', 'archived'],
            default: 'draft',
            index: true,
        },
        summary: { type: String, default: '', trim: true },
        tags: [{ type: String, index: true }],
        categories: [{ type: String, index: true }],
        coverImage: { type: String, default: '' },
        isFeatured: { type: Boolean, default: false, index: true },
        publishedAt: { type: Date, index: true },
        content: {
            type: Schema.Types.Mixed, // Holds Tiptap JSON
            required: true,
            validate: {
                validator: (value: unknown) => typeof value === 'object' && value !== null && (value as { type?: string }).type === 'doc',
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

/**
 * Returns the Article model from the provided connection.
 * Prevents recompilation during dev hot reload.
 */
export const getArticleModel = (db: Connection) =>
    db.models.Article || db.model<IArticle>('Article', ArticleSchema);
