import {
    SUBSCRIBER_SOURCE,
    SUBSCRIBER_STATUS,
    SubscriberSource,
    SubscriberStatus,
} from "@/constants/subscriber.const";
import { Schema, model, models, Document } from "mongoose";

export interface ISubscriber extends Document {
    email: string;
    createdAt: Date;
    updatedAt: Date;
    status: SubscriberStatus;
    source: SubscriberSource;
}

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
