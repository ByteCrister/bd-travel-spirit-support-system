import {
    SUBSCRIBER_SOURCE,
    SUBSCRIBER_STATUS,
    SubscriberSource,
    SubscriberStatus,
} from "@/constants/subscriber.const";
import { Schema, model, models, Document } from "mongoose";

/**
 * ISubscriber:
 *   Mongoose document interface for the Subscriber collection.
 *
 * Fields:
 *   - email:   Unique identifier for the subscriber. Validated and normalized.
 *   - createdAt / updatedAt: Managed automatically by Mongoose timestamps.
 *   - status:  Lifecycle state of the subscriber (subscribed/unsubscribed).
 *   - source:  Origin of the subscription event (website, referral, campaign, etc.).
 *
 * Purpose:
 *   This model stores newsletter or marketing subscribers, separate from
 *   registered user accounts. It supports analytics, segmentation, and
 *   compliance by tracking both lifecycle status and subscription source.
 */
export interface ISubscriber extends Document {
    email: string;
    createdAt: Date;
    updatedAt: Date;
    status: SubscriberStatus;
    source: SubscriberSource;
}

/**
 * Subscriber Schema:
 *   Defines the structure and constraints for subscriber documents.
 *
 * Notes:
 *   - Email is unique, lowercased, trimmed, and regex‑validated.
 *   - Status is restricted to SUBSCRIBER_STATUS enum values.
 *   - Source is restricted to SUBSCRIBER_SOURCE enum values.
 *   - Timestamps option automatically manages createdAt/updatedAt.
 *   - An explicit unique index is created on email for fast lookups
 *     and to prevent duplicates.
 */
const subscriberSchema = new Schema<ISubscriber>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
        },
        status: {
            type: String,
            enum: Object.values(SUBSCRIBER_STATUS),
            default: SUBSCRIBER_STATUS.SUBSCRIBED,
        },
        source: {
            type: String,
            enum: Object.values(SUBSCRIBER_SOURCE),
            default: SUBSCRIBER_SOURCE.BD_TRAVEL_SPIRIT,
        },
    },
    { timestamps: true }
);

// Ensure email uniqueness at the database level
subscriberSchema.index({ email: 1 }, { unique: true });

export default models.Subscriber ||
    model<ISubscriber>("Subscriber", subscriberSchema);
