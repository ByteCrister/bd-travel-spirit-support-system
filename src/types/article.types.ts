/**
 * travelArticle.dto.ts
 *
 * Data Transfer Object (DTO) types for Travel Articles.
 * These mirror the backend schema but are:
 *  - Free of Mongoose-specific types
 *  - Using ISO date strings for dates
 *  - Author expanded for display purposes
 * 
 * Use these in your Next.js client for:
 *  - Type-safe API responses
 *  - Type-safe create/update requests
 */

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
 * Structured attraction inside an article
 */
export interface AttractionDTO {
    title: string;
    description: string;
    bestFor?: string;
    insiderTip?: string;
    address?: string;
    openingHours?: string;
    images: string[]; // URLs
    coordinates?: { lat: number; lng: number };
}

/**
 * FAQ entry for the article
 */
export interface FAQDTO {
    question: string;
    answer: string;
}

/**
 * TipTap JSON document type
 * This is intentionally loose to allow any TipTap node/mark types.
 * You can replace `any` with a stricter type if you have a fixed schema.
 */
export interface TipTapDocDTO {
    type: 'doc';
    content?: Array<Record<string, unknown>>;
    [key: string]: unknown;
}

/**
 * SEO metadata for the article
 */
export interface SEODataDTO {
    metaTitle: string;
    metaDescription: string;
    ogImage?: string;
}

/**
 * Query info for fetching related activities dynamically
 */
export interface RelatedActivitiesQueryDTO {
    provider: string;
    query: string;
    maxResults?: number;
}

/**
 * Author info returned with the article
 */
export interface AuthorDTO {
    _id: string;
    name: string;
    avatar?: string;
}

/**
 * Main Travel Article DTO
 * Shape of the data returned by the API to the client
 */
export interface TravelArticleDTO {
    _id: string;
    title: string;
    slug: string;
    status: ArticleStatus;
    author: AuthorDTO;
    authorBio?: string;
    summary: string;
    heroImage: string;
    heroVideo?: string;
    destination: { city: string; country: string; region?: string };
    categories?: TravelCategory[];
    tags?: string[];
    publishedAt?: string; // ISO date string
    readingTime?: number;
    seo: SEODataDTO;
    attractions?: AttractionDTO[];
    content: TipTapDocDTO;
    relatedActivitiesQuery?: RelatedActivitiesQueryDTO;
    faqs?: FAQDTO[];
    viewCount: number;
    likeCount: number;
    shareCount: number;
    allowComments: boolean;
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
}

/**
 * DTO for creating a new travel article
 * Sent from client → server
 * Author is passed as `authorId` instead of full object
 */
export interface CreateTravelArticleDTO
    extends Omit<
        TravelArticleDTO,
        '_id' | 'author' | 'viewCount' | 'likeCount' | 'shareCount' | 'createdAt' | 'updatedAt'
    > {
    authorId: string;
}

/**
 * DTO for updating an existing travel article
 * Sent from client → server
 * All fields optional except `_id`
 */
export interface UpdateTravelArticleDTO
    extends Partial<CreateTravelArticleDTO> {
    _id: string;
}
