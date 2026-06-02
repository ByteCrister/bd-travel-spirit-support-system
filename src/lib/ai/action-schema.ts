import { z } from "zod";

export const AiChatActionReplySchema = z.object({
    type: z.literal("reply"),
    message: z.string().min(1),
});

export const AiChatActionClarifySchema = z.object({
    type: z.literal("clarify"),
    questions: z.array(z.string().min(1)).min(1).max(5),
});

export const AiChatQuerySpecSchema = z.object({
    id: z.string().min(1),
    intent: z.unknown(),
});

export const AiChatActionQuerySchema = z.object({
    type: z.literal("query"),
    queries: z.array(AiChatQuerySpecSchema).min(1).max(4),
});

export const AiChatActionSchema = z.discriminatedUnion("type", [
    AiChatActionReplySchema,
    AiChatActionClarifySchema,
    AiChatActionQuerySchema,
]);

export type AiChatAction = z.infer<typeof AiChatActionSchema>;

