import { Schema, Document, Types } from "mongoose";
import { defineModel } from "@/lib/helpers/defineModel";

export type ChatMessageRole = "user" | "assistant";

export interface IChatMessage extends Document {
    session: Types.ObjectId;
    role: ChatMessageRole;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IChatSession extends Document {
    user: Types.ObjectId;
    title: string;
    lastMessagePreview?: string;
    lastMessageAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
    {
        session: {
            type: Schema.Types.ObjectId,
            ref: "AIChatSession",
            required: true,
            index: true,
        },
        role: {
            type: String,
            enum: ["user", "assistant"],
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
    },
    { timestamps: true, versionKey: false }
);

ChatMessageSchema.index({ session: 1, _id: -1 });

const ChatSessionSchema = new Schema<IChatSession>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
            default: "New chat",
        },
        lastMessagePreview: {
            type: String,
            trim: true,
            maxlength: 1000,
        },
        lastMessageAt: {
            type: Date,
        },
    },
    { timestamps: true, versionKey: false }
);

ChatSessionSchema.index({ user: 1, updatedAt: -1 });
ChatSessionSchema.index({ user: 1, _id: -1 });

export const AIChatSessionModel = defineModel("AIChatSession", ChatSessionSchema);
export const AIChatMessageModel = defineModel("AIChatMessage", ChatMessageSchema);

/** @deprecated Use AIChatSessionModel */
export default AIChatSessionModel;
