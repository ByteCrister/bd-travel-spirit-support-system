import mongoose, { Schema, Document, Model, Query } from "mongoose";
import {
    CARD_BRAND,
    CardBrand,
    PAYMENT_OWNER_TYPE,
    PAYMENT_PROVIDER,
    PAYMENT_PURPOSE,
    PaymentOwnerType,
    PaymentPurpose,
} from "@/constants/payment.const";

/* ---------------------------------------------
   Embedded Sub Schemas
--------------------------------------------- */

const CardSchema = new Schema(
    {
        brand: {
            type: String,
            enum: Object.values(CARD_BRAND),
            default: CARD_BRAND.UNKNOWN,
        },
        last4: { type: String, minlength: 4, maxlength: 4 },
        expMonth: { type: Number, min: 1, max: 12 },
        expYear: { type: Number },
    },
    { _id: false }
);

const ProviderMetaSchema = new Schema(
    {
        provider: {
            type: String,
            enum: Object.values(PAYMENT_PROVIDER),
            required: true,
        },
        meta: {
            type: Schema.Types.Mixed, // Stripe / bank specific payload
            default: {},
        },
    },
    { _id: false }
);

/* ---------------------------------------------
   Document Interface (DB Shape)
--------------------------------------------- */

export interface IPaymentAccount extends Document {
    ownerType: PaymentOwnerType;
    ownerId?: mongoose.Types.ObjectId | null;

    provider: PAYMENT_PROVIDER.STRIPE;
    purpose: PaymentPurpose;

    isActive: boolean;
    isBackup: boolean;

    label?: string;

    card?: {
        brand?: CardBrand;
        last4?: string;
        expMonth?: number;
        expYear?: number;
    };

    providerMeta?: {
        provider: PAYMENT_PROVIDER.STRIPE;
        meta: {
            stripeCustomerId?: string;
            stripePaymentMethodId?: string;
            card?: {
                brand?: CardBrand;
                last4?: string;
                expMonth?: number;
                expYear?: number;
            };
        };
    };

    isDeleted?: boolean;
    deletedAt?: Date | null;

    createdAt: Date;
    updatedAt: Date;
}

/* ---------------------------------------------
   Model Interface (Statics)
--------------------------------------------- */

export interface IPaymentAccountModel extends Model<IPaymentAccount> {
    softDelete(id: string): Promise<IPaymentAccount | null>;
    restore(id: string): Promise<IPaymentAccount | null>;
}

/* ---------------------------------------------
   Schema Definition
--------------------------------------------- */

const PaymentAccountSchema = new Schema<IPaymentAccount, IPaymentAccountModel>(
    {
        ownerType: {
            type: String,
            enum: Object.values(PAYMENT_OWNER_TYPE),
            required: true,
            index: true,
        },

        ownerId: {
            type: Schema.Types.ObjectId,
            index: true,
            default: null,
        },

        provider: {
            type: String,
            enum: Object.values(PAYMENT_PROVIDER),
            required: true,
            default: PAYMENT_PROVIDER.STRIPE,
            index: true,
        },

        purpose: {
            type: String,
            enum: Object.values(PAYMENT_PURPOSE),
            required: true,
            index: true,
        },

        label: {
            type: String,
        },

        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },

        isBackup: {
            type: Boolean,
            default: false,
        },

        card: {
            type: CardSchema,
            default: undefined,
        },

        providerMeta: {
            type: ProviderMetaSchema,
            default: undefined,
        },

        // Soft delete
        isDeleted: {
            type: Boolean,
            default: false,
            index: true,
        },

        deletedAt: {
            type: Date,
            default: null,
            index: true,
        },
    },
    { timestamps: true }
);

/* ---------------------------------------------
   Stripe-only Validation (Matches Your Route)
--------------------------------------------- */

PaymentAccountSchema.pre("validate", function (next) {
    if (this.provider === PAYMENT_PROVIDER.STRIPE) {
        const meta = this.providerMeta?.meta;

        if (!meta?.stripeCustomerId) {
            return next(new Error("stripeCustomerId is required for Stripe provider"));
        }

        if (!meta?.stripePaymentMethodId) {
            return next(
                new Error("stripePaymentMethodId is required for Stripe provider")
            );
        }
    }

    next();
});

/* ---------------------------------------------
   Soft Delete Statics
--------------------------------------------- */

PaymentAccountSchema.statics.softDelete = async function (id: string) {
    return this.findByIdAndUpdate(
        id,
        { isDeleted: true, deletedAt: new Date() },
        { new: true }
    );
};

PaymentAccountSchema.statics.restore = async function (id: string) {
    return this.findByIdAndUpdate(
        id,
        { isDeleted: false, deletedAt: null },
        { new: true }
    );
};

/* ---------------------------------------------
   Auto-exclude Soft Deleted
--------------------------------------------- */

PaymentAccountSchema.pre(/^find/, function (
    this: Query<unknown, IPaymentAccount>,
    next
) {
    this.where({ isDeleted: { $ne: true } });
    next();
});

/* ---------------------------------------------
   Indexes
--------------------------------------------- */

PaymentAccountSchema.index({
    ownerId: 1,
    purpose: 1,
    isActive: 1,
    isDeleted: 1,
});

PaymentAccountSchema.index({
    "providerMeta.meta.stripePaymentMethodId": 1,
    isDeleted: 1,
});

/* ---------------------------------------------
   Export Model
--------------------------------------------- */

export default (mongoose.models.PaymentAccount as IPaymentAccountModel) ||
    mongoose.model<IPaymentAccount, IPaymentAccountModel>(
        "PaymentAccount",
        PaymentAccountSchema
    );