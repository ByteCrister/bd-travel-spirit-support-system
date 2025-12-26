// ============================================================
// guide.model.ts
// ------------------------------------------------------------
// Production-grade Guide schema for service providers.
// This model is completely separate from Traveler, with its own
// lifecycle, authentication, and verification process.
// ============================================================

import { Schema, Document, Types, Query, Model } from "mongoose";
import {
    GUIDE_DOCUMENT_CATEGORY,
    GUIDE_SOCIAL_PLATFORM,
    GUIDE_STATUS,
    GuideDocumentCategory,
    GuideSocialPlatform,
    GuideStatus,
} from "@/constants/guide.const";
import { defineModel } from "@/lib/helpers/defineModel";
import mongoose from "mongoose";
import { withTransaction } from "@/lib/helpers/withTransaction";
import generateStrongPassword from "@/utils/helpers/generate-strong-password";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

// ────────────────────────────────────────────────────────────────────────────
// 1. SUB-DOCUMENT INTERFACES
// ────────────────────────────────────────────────────────────────────────────

/** Address information for the guide */
export interface GuideAddress {
    country?: string;
    division?: string;
    city?: string;
    zip?: string;
    street?: string;
}

/** Social media platform link */
export interface GuideSocialLink {
    platform: GuideSocialPlatform;
    url: string;
}

/** Verification document metadata */
export interface IGuideDocument {
    category: GuideDocumentCategory;
    AssetUrl: Types.ObjectId; // on the Asset model this will be used for reference and get publicUrl for the actual url
    uploadedAt?: Date;
}

/** Owner account information */
export interface GuideOwner {
    user: Types.ObjectId;      // Reference to User model for authentication
    phone?: string;            // Contact number
    oauthProvider?: string;    // "google", "facebook", etc.
}

/** Suspension details */
export interface GuideSuspension {
    reason: string;
    suspendedBy: Types.ObjectId;
    until: Date;
    createdAt: Date;
}

// ────────────────────────────────────────────────────────────────────────────
// 2. MAIN DOCUMENT INTERFACE
// ────────────────────────────────────────────────────────────────────────────

export interface IGuide extends Document {
    // ========== CORE IDENTITY ==========
    companyName: string;       // Registered business name
    bio?: string;              // Company description
    logoUrl: Types.ObjectId;   // Company logo reference

    // ========== SOCIAL MEDIA ==========
    social?: GuideSocialLink[];

    // ========== OWNER INFORMATION ==========
    owner: GuideOwner;

    // ========== VERIFICATION ==========
    documents: IGuideDocument[];  // Required verification docs
    address?: GuideAddress;        // Business address

    // ========== STATUS & LIFECYCLE ==========
    status: GuideStatus;           // Current approval status
    reviewedAt?: Date;             // When review was completed
    reviewer?: Types.ObjectId;     // Admin who reviewed
    reviewComment?: string;

    // ========== MODERATION ==========
    suspension?: GuideSuspension;  // Suspension details if applicable
    deletedAt?: Date;              // Soft delete timestamp

    // ========== TIMESTAMPS ==========
    createdAt: Date;
    updatedAt: Date;

    // ========== VIRTUAL PROPERTIES ==========
    isSuspended?: boolean;
    isActive?: boolean;
    isPending?: boolean;
    isApproved?: boolean;

    accessToken: string;
}

// ────────────────────────────────────────────────────────────────────────────
// 3. STATIC METHODS INTERFACE
// ────────────────────────────────────────────────────────────────────────────

export interface GuideModel extends Model<IGuide> {
    // Query Helpers
    findActive(): Query<IGuide[], IGuide>;
    findPending(): Query<IGuide[], IGuide>;
    findApproved(): Query<IGuide[], IGuide>;
    findSuspended(): Query<IGuide[], IGuide>;
    findByUserId(userId: Types.ObjectId): Query<IGuide | null, IGuide>;

    // Business Logic
    approve(
        guideId: Types.ObjectId | string,
        reviewerId: Types.ObjectId,
        data?: Partial<Pick<IGuide, 'reviewedAt' | 'reviewer' | 'reviewComment'>>,
        session?: mongoose.ClientSession,
    ): Promise<IGuide | null>;

    reject(
        guideId: Types.ObjectId | string,
        reviewerId: Types.ObjectId,
        reason?: string,
        session?: mongoose.ClientSession,
    ): Promise<IGuide | null>;

    suspend(
        guideId: Types.ObjectId | string,
        suspendedBy: Types.ObjectId,
        reason: string,
        until: Date,
        session?: mongoose.ClientSession,
    ): Promise<IGuide | null>;

    restore(
        guideId: Types.ObjectId | string,
        session?: mongoose.ClientSession,
    ): Promise<IGuide | null>;

    softDelete(
        guideId: Types.ObjectId | string,
        session?: mongoose.ClientSession,
    ): Promise<IGuide | null>;
}

// ============================================================================
// SCHEMA DEFINITIONS
// ============================================================================

// ────────────────────────────────────────────────────────────────────────────
// 1. SUB-SCHEMAS
// ────────────────────────────────────────────────────────────────────────────

/**
 * Address Schema
 * - Used for business location
 * - Hierarchical: Country → Division → City → Street
 */
const AddressSchema = new Schema<GuideAddress>(
    {
        country: { type: String, trim: true },
        division: { type: String, trim: true },
        city: { type: String, trim: true },
        zip: { type: String, trim: true },
        street: { type: String, trim: true },
    },
    { _id: false, timestamps: false }
);

/**
 * Social Link Schema
 * - Validates URL format
 * - Platform must be from predefined enum
 */
const SocialLinkSchema = new Schema<GuideSocialLink>(
    {
        platform: {
            type: String,
            enum: Object.values(GUIDE_SOCIAL_PLATFORM),
            required: true,
        },
        url: {
            type: String,
            required: true,
            trim: true,
            validate: {
                validator: (url: string) => /^https?:\/\/[^\s$.?#].[^\s]*$/.test(url),
                message: 'Invalid URL format',
            },
        },
    },
    { _id: false, timestamps: false }
);

/**
 * Document Schema
 * - Tracks verification documents
 * - Categories: ID, LICENSE, TAX, etc.
 */
const DocumentSchema = new Schema<IGuideDocument>(
    {
        category: {
            type: String,
            enum: Object.values(GUIDE_DOCUMENT_CATEGORY),
            required: true,
        },
        AssetUrl: {
            type: Schema.Types.ObjectId,
            ref: "Asset",
            required: true,
        },
        uploadedAt: { type: Date, default: Date.now },
    },
    { _id: false, timestamps: false }
);

/**
 * Owner Schema
 * - Links guide to User model for authentication
 * - Validates Bangladeshi phone numbers
 */
const OwnerSchema = new Schema<GuideOwner>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        phone: {
            type: String,
            trim: true,
            validate: {
                validator: (phone: string) => /^(\+8801[3-9]\d{8}|01[3-9]\d{8})$/.test(phone),
                message: 'Invalid Bangladeshi phone number format',
            },
        },
        oauthProvider: {
            type: String,
            trim: true
        },
    },
    { _id: false, timestamps: false }
);

/**
 * Suspension Schema
 * - Tracks moderation actions
 * - Includes duration and reason
 */
const SuspensionSchema = new Schema<GuideSuspension>(
    {
        reason: {
            type: String,
            required: true,
            trim: true,
        },
        suspendedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        until: {
            type: Date,
            required: true,
            validate: {
                validator: (date: Date) => date > new Date(),
                message: 'Suspension end date must be in the future',
            },
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
    },
    { _id: false, timestamps: false }
);

// ────────────────────────────────────────────────────────────────────────────
// 2. MAIN SCHEMA
// ────────────────────────────────────────────────────────────────────────────

const GuideSchema = new Schema<IGuide>(
    {
        // ─────────── CORE IDENTITY ───────────
        companyName: {
            type: String,
            required: [true, 'Company name is required'],
            trim: true,
            minlength: [2, 'Company name must be at least 2 characters'],
            maxlength: [100, 'Company name cannot exceed 100 characters'],
        },
        bio: {
            type: String,
            trim: true,
            maxlength: [500, 'Bio cannot exceed 500 characters'],
        },
        logoUrl: {
            type: Schema.Types.ObjectId,
            ref: "Asset",
            validate: {
                validator: function (this: IGuide, value: Types.ObjectId) {
                    // Logo is required only for approved guides
                    return this.status !== GUIDE_STATUS.APPROVED || !!value;
                },
                message: 'Logo is required for approved guides',
            },
        },

        // ─────────── SOCIAL MEDIA ───────────
        social: {
            type: [SocialLinkSchema],
            default: [],
            validate: {
                validator: (links: GuideSocialLink[]) => links.length <= 5,
                message: 'Cannot have more than 5 social links',
            },
        },

        // ─────────── OWNER ACCOUNT ───────────
        owner: {
            type: OwnerSchema,
            required: [true, 'Owner information is required'],
            validate: {
                validator: function (this: IGuide, value: GuideOwner) {
                    // Owner is required only after approval
                    return this.status !== GUIDE_STATUS.APPROVED || !!value?.user;
                },
                message: 'Owner user reference is required for approved guides',
            },
        },

        // ─────────── VERIFICATION DOCUMENTS ───────────
        documents: {
            type: [DocumentSchema],
            required: [true, 'At least one verification document is required'],
            validate: {
                validator: (docs: IGuideDocument[]) => {
                    if (docs.length === 0) return false;

                    // Check for required document categories
                    const categories = docs.map(doc => doc.category);
                    const hasId = categories.includes(GUIDE_DOCUMENT_CATEGORY.GOVERNMENT_ID);
                    const hasLicense = categories.includes(GUIDE_DOCUMENT_CATEGORY.BUSINESS_LICENSE);

                    return hasId && hasLicense;
                },
                message: 'Must include both identification and license documents',
            },
        },

        // ─────────── BUSINESS ADDRESS ───────────
        address: {
            type: AddressSchema,
            required: [true, 'Business address is required'],
        },

        // ─────────── STATUS & LIFECYCLE ───────────
        status: {
            type: String,
            enum: {
                values: Object.values(GUIDE_STATUS),
                message: 'Invalid status value',
            },
            default: GUIDE_STATUS.PENDING,
            required: true,
        },
        reviewedAt: {
            type: Date
        },
        reviewer: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },

        reviewComment: {
            type: String,
            trim: true,
            maxlength: 500,
        },

        // ─────────── MODERATION ───────────
        suspension: {
            type: SuspensionSchema,
        },
        deletedAt: {
            type: Date
        },

        accessToken: {
            type: String,
            required: true,
            unique: true,
            index: true,
            select: false, // prevent accidental leaks
        },
    },
    {
        // Schema Options
        timestamps: true,
        versionKey: false,
        toJSON: {
            virtuals: true,
            transform: (_doc, ret: Partial<IGuide>) => {
                delete ret.deletedAt;
                return ret;
            },
        },
        toObject: {
            virtuals: true
        },
    }
);

// ============================================================================
// VIRTUAL PROPERTIES
// ============================================================================

/**
 * Whether the guide is currently suspended
 */
GuideSchema.virtual('isSuspended').get(function (this: IGuide) {
    return !!(this.suspension?.until && this.suspension.until > new Date());
});

/**
 * Whether the guide is active (approved & not deleted)
 */
GuideSchema.virtual('isActive').get(function (this: IGuide) {
    return !this.deletedAt && this.status === GUIDE_STATUS.APPROVED;
});

/**
 * Whether the guide is pending review
 */
GuideSchema.virtual('isPending').get(function (this: IGuide) {
    return this.status === GUIDE_STATUS.PENDING;
});

/**
 * Whether the guide is approved
 */
GuideSchema.virtual('isApproved').get(function (this: IGuide) {
    return this.status === GUIDE_STATUS.APPROVED;
});

/**
 * Get full address string
 */
GuideSchema.virtual('fullAddress').get(function (this: IGuide) {
    if (!this.address) return '';

    const parts = [
        this.address.street,
        this.address.city,
        this.address.division,
        this.address.country,
        this.address.zip,
    ].filter(Boolean);

    return parts.join(', ');
});

// ============================================================================
// MIDDLEWARE & HOOKS
// ============================================================================

/**
 * Normalize phone numbers before saving
 */
GuideSchema.pre('save', function (next) {
    if (this.owner?.phone) {
        // Normalize: replace leading 0 with +880
        if (this.owner.phone.startsWith('01')) {
            this.owner.phone = '+88' + this.owner.phone;
        }
    }
    next();
});

/**
 * Auto-set reviewedAt when status changes to APPROVED/REJECTED
 */
GuideSchema.pre('save', function (next) {
    if (
        this.isModified('status') &&
        [GUIDE_STATUS.APPROVED, GUIDE_STATUS.REJECTED].includes(this.status as GUIDE_STATUS) &&
        !this.reviewedAt
    ) {
        this.reviewedAt = new Date();
    }
    next();
});

/**
 * Validate that only approved guides can be active
 */
GuideSchema.pre('save', function (next) {
    if (this.status !== GUIDE_STATUS.APPROVED && this.isActive) {
        next(new Error('Only approved guides can be active'));
        return;
    }
    next();
});

/**
 *  auto save access token, so that user can get there application with email + access token
 */
GuideSchema.pre("save", function (next) {
    if (!this.isNew) return next();

    if (!this.accessToken) {
        this.accessToken = generateStrongPassword(20);
    }

    next();
});


/**
 * Exclude soft-deleted guides from queries by default
 */
GuideSchema.pre<Query<IGuide, IGuide>>(/^find/, function (next) {
    // Only filter if not explicitly querying deleted documents
    if (this.getFilter().deletedAt === undefined) {
        this.where({ deletedAt: null });
    }
    next();
});

// ============================================================================
// STATIC METHODS
// ============================================================================

/**
 * Find all active (approved and not deleted) guides
 */
GuideSchema.statics.findActive = function (): Query<IGuide[], IGuide> {
    return this.find({
        status: GUIDE_STATUS.APPROVED,
        deletedAt: null,
    });
};

/**
 * Find all pending guides
 */
GuideSchema.statics.findPending = function (): Query<IGuide[], IGuide> {
    return this.find({
        status: GUIDE_STATUS.PENDING,
        deletedAt: null,
    });
};

/**
 * Find all approved guides
 */
GuideSchema.statics.findApproved = function (): Query<IGuide[], IGuide> {
    return this.find({
        status: GUIDE_STATUS.APPROVED,
        deletedAt: null,
    });
};

/**
 * Find all suspended guides
 */
GuideSchema.statics.findSuspended = function (): Query<IGuide[], IGuide> {
    return this.find({
        'suspension.until': { $gt: new Date() },
        deletedAt: null,
    });
};

/**
 * Find guide by owner user ID
 */
GuideSchema.statics.findByUserId = function (userId: Types.ObjectId): Query<IGuide | null, IGuide> {
    return this.findOne({
        'owner.user': userId,
        deletedAt: null,
    });
};

/**
 * Approve a guide application
 */
GuideSchema.statics.approve = async function (
    guideId: Types.ObjectId | string,
    reviewerId: Types.ObjectId,
    data?: Partial<Pick<IGuide, 'reviewedAt' | 'reviewer' | 'reviewComment'>>,
    session?: mongoose.ClientSession,
): Promise<IGuide | null> {
    return withTransaction(async (session) => {
        return this.findByIdAndUpdate(
            guideId,
            {
                status: GUIDE_STATUS.APPROVED,
                reviewedAt: data?.reviewedAt || new Date(),
                reviewer: data?.reviewer || reviewerId,
                reviewComment: data?.reviewComment ?? "guide application is accepted by the moderator"
            },
            { new: true, runValidators: true }
        ).session(session);
    }, session)
};

/**
 * Reject a guide application
 */
GuideSchema.statics.reject = async function (
    guideId: Types.ObjectId | string,
    reviewerId: Types.ObjectId,
    reason?: string,
    session?: mongoose.ClientSession,
): Promise<IGuide | null> {
    return withTransaction(async (session) => {
        const updateData = {
            status: GUIDE_STATUS.REJECTED,
            reviewedAt: new Date(),
            reviewer: reviewerId,
            reviewComment: "reject by the moderator",
        };

        if (reason) {
            updateData.reviewComment = reason;
        }

        return this.findByIdAndUpdate(
            guideId,
            updateData,
            { new: true, runValidators: true, session }
        );

    }, session)
};

/**
 * Suspend a guide
 */
GuideSchema.statics.suspend = async function (
    guideId: Types.ObjectId | string,
    suspendedBy: Types.ObjectId,
    reason: string,
    until: Date,
    session?: mongoose.ClientSession,
): Promise<IGuide | null> {
    return withTransaction(async (session) => {
        return this.findByIdAndUpdate(
            guideId,
            {
                suspension: {
                    reason,
                    suspendedBy,
                    until,
                    createdAt: new Date(),
                },
            },
            { new: true, runValidators: true, session }
        );
    }, session)
};

/**
 * Restore a soft-deleted guide
 */
GuideSchema.statics.restore = async function (
    guideId: Types.ObjectId | string,
    session?: mongoose.ClientSession,
): Promise<IGuide | null> {
    return withTransaction(async (session) => {
        return this.findByIdAndUpdate(
            guideId,
            { deletedAt: null },
            { new: true, session }
        );
    }, session)
};

/**
 * Soft delete a guide
 */
GuideSchema.statics.softDelete = async function (
    guideId: Types.ObjectId | string,
    session?: mongoose.ClientSession,
): Promise<IGuide | null> {
    return withTransaction(async (session) => {
        return this.findByIdAndUpdate(
            guideId,
            { deletedAt: new Date() },
            { new: true, session }
        );
    }, session)
};

// ============================================================================
// INDEXES
// ============================================================================

// ────────────────────────────────────────────────────────────────────────────
// 1. SINGLE FIELD INDEXES (High Cardinality)
// ────────────────────────────────────────────────────────────────────────────

// Status filtering (most common query)
GuideSchema.index({ status: 1 });

// Company name search
GuideSchema.index({ companyName: 1 });

// ────────────────────────────────────────────────────────────────────────────
// 2. COMPOUND INDEXES (Query Optimization)
// ────────────────────────────────────────────────────────────────────────────

// Active guides lookup
GuideSchema.index({
    status: 1,
    deletedAt: 1
});

// Suspension status checking
GuideSchema.index({
    'suspension.until': 1,
    deletedAt: 1
});

// Review timeline
GuideSchema.index({
    reviewedAt: -1,
    status: 1
});

// Application date sorting
GuideSchema.index({
    appliedAt: -1,
    status: 1
});

// ────────────────────────────────────────────────────────────────────────────
// 3. GEOGRAPHICAL INDEXES (If location-based queries)
// ────────────────────────────────────────────────────────────────────────────

// Address-based queries
GuideSchema.index({
    'address.country': 1,
    'address.division': 1,
    'address.city': 1
});

// ────────────────────────────────────────────────────────────────────────────
// 4. TEXT SEARCH INDEX (Full-text search)
// ────────────────────────────────────────────────────────────────────────────

GuideSchema.index({
    companyName: 'text',
    bio: 'text',
    'address.city': 'text',
    'address.country': 'text',
}, {
    weights: {
        companyName: 10,
        bio: 5,
        'address.city': 3,
        'address.country': 2,
    },
    default_language: 'english',
});

// ────────────────────────────────────────────────────────────────────────────
// 5. TTL INDEXES (Automatic cleanup)
// ────────────────────────────────────────────────────────────────────────────

// Auto-delete permanently deleted guides after 30 days
GuideSchema.index(
    { deletedAt: 1 },
    {
        expireAfterSeconds: 30 * 24 * 60 * 60, // 30 days
        partialFilterExpression: { deletedAt: { $exists: true } }
    }
);

// Auto-remove expired suspensions
GuideSchema.index(
    { 'suspension.until': 1 },
    {
        expireAfterSeconds: 0,
        partialFilterExpression: {
            'suspension.until': { $exists: true },
            deletedAt: null
        }
    }
);

// ============================================================================
// INSTANCE METHODS
// ============================================================================

/**
 * Check if guide can be approved
 */
GuideSchema.methods.canBeApproved = function (): boolean {
    return this.status === GUIDE_STATUS.PENDING &&
        this.documents.length >= 2 && // At least ID and License
        !!this.address;
};

/**
 * Get all required verification documents
 */
GuideSchema.methods.getRequiredDocuments = function (): GuideDocumentCategory[] {
    return Object.values(GUIDE_DOCUMENT_CATEGORY);
};

/**
 * Get missing required documents
 */
GuideSchema.methods.getMissingDocuments = function (): GuideDocumentCategory[] {
    const submitted: GuideDocumentCategory[] =
        this.documents.map((doc: IGuideDocument) => doc.category);

    return this.getRequiredDocuments().filter(
        (category: GuideDocumentCategory) => !submitted.includes(category)
    );
};

// ============================================================================
// MODEL EXPORT
// ============================================================================

const GuideModel = defineModel<IGuide, GuideModel>("Guide", GuideSchema);

export default GuideModel;