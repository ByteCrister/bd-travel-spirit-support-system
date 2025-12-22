import mongoose, { Schema, Document, Model, Query } from "mongoose";
import {
    CARD_BRAND,
    CardBrand,
    PAYMENT_OWNER_TYPE,
    PAYMENT_PURPOSE,
    PaymentOwnerType,
    PaymentPurpose,
} from "@/constants/payment.const";
import { defineModel } from "@/lib/helpers/defineModel";

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

/* ---------------------------------------------
   Document Interface (DB Shape)
--------------------------------------------- */

export interface IStripePaymentAccount extends Document {
    ownerType: PaymentOwnerType;
    ownerId?: mongoose.Types.ObjectId | null;

    purpose: PaymentPurpose;

    isActive: boolean;
    isBackup: boolean;

    label?: string;

    stripeCustomerId: string;
    stripePaymentMethodId: string;

    card?: {
        brand?: CardBrand;
        last4?: string;
        expMonth?: number;
        expYear?: number;
    };

    isDeleted?: boolean;
    deletedAt?: Date | null;

    createdAt: Date;
    updatedAt: Date;
}

/* ---------------------------------------------
   Model Interface (Statics)
--------------------------------------------- */

export interface IStripePaymentAccountModel
    extends Model<IStripePaymentAccount> {
    softDelete(id: string): Promise<IStripePaymentAccount | null>;
    restore(id: string): Promise<IStripePaymentAccount | null>;
}

/* ---------------------------------------------
   Schema Definition
--------------------------------------------- */

const StripePaymentAccountSchema = new Schema<
    IStripePaymentAccount,
    IStripePaymentAccountModel
>(
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

        purpose: {
            type: String,
            enum: Object.values(PAYMENT_PURPOSE),
            required: true,
            index: true,
        },

        label: { type: String },

        stripeCustomerId: { type: String, required: true },
        stripePaymentMethodId: { type: String, required: true },

        card: {
            type: CardSchema,
            default: undefined,
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
   Stripe-only Validation
--------------------------------------------- */

StripePaymentAccountSchema.pre("validate", function (next) {
    if (!this.stripeCustomerId) {
        return next(
            new Error("stripeCustomerId is required for Stripe payment accounts")
        );
    }

    if (!this.stripePaymentMethodId) {
        return next(
            new Error(
                "stripePaymentMethodId is required for Stripe payment accounts"
            )
        );
    }

    next();
});

/* ---------------------------------------------
   Soft Delete Statics
--------------------------------------------- */

StripePaymentAccountSchema.statics.softDelete = async function (id: string) {
    return this.findByIdAndUpdate(
        id,
        { isDeleted: true, deletedAt: new Date() },
        { new: true }
    );
};

StripePaymentAccountSchema.statics.restore = async function (id: string) {
    return this.findByIdAndUpdate(
        id,
        { isDeleted: false, deletedAt: null },
        { new: true }
    );
};

/* ---------------------------------------------
   Auto-exclude Soft Deleted
--------------------------------------------- */

StripePaymentAccountSchema.pre(/^find/, function (
    this: Query<unknown, IStripePaymentAccount>,
    next
) {
    this.where({ isDeleted: { $ne: true } });
    next();
});

/* ---------------------------------------------
   Indexes
--------------------------------------------- */

StripePaymentAccountSchema.index({
    ownerId: 1,
    purpose: 1,
    isActive: 1,
    isDeleted: 1,
});

StripePaymentAccountSchema.index({
    "stripeMeta.stripePaymentMethodId": 1,
    isDeleted: 1,
});

/* ---------------------------------------------
   Export Model
--------------------------------------------- */


const StripePaymentAccountModel = defineModel("StripePaymentAccount", StripePaymentAccountSchema);

export default StripePaymentAccountModel;