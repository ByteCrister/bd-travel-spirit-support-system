// /types/chatMessage.types.ts

import { ModerationStatusType } from "@/constants/chatmessage.const";
import { USER_ROLE } from "@/constants/user.const";

/**
 * =========================
 * CORE TYPES
 * =========================
 */

/** Minimal user reference for chat context (used in messages) */
export interface IUserRef {
    _id: string;
    name: string;
    avatar?: string;
    role: USER_ROLE;
}

/** Chat message entity (frontend-safe, no mongoose Document) */
export interface ChatMessage {
    _id: string;
    sender: IUserRef | string;   // populated or just ID
    receiver: IUserRef | string; // populated or just ID
    message: string;
    timestamp: string;           // ISO string for frontend
    isDraft: boolean;
    isRead: boolean;
    isDelivered: boolean;
    isEdited: boolean;
    isDeletedBySender: boolean;
    isDeletedByReceiver: boolean;
    moderationStatus: ModerationStatusType;
    createdAt: string;
    updatedAt: string;
}

/**
 * =========================
 * DTOs (Data Transfer Objects)
 * =========================
 */

/** Create a new message */
export interface CreateChatMessageDTO {
    receiver: string;   // userId
    message: string;
    isDraft?: boolean;
}

/** Update an existing message */
export interface UpdateChatMessageDTO {
    message?: string;
    isDraft?: boolean;
    isRead?: boolean;
    isDelivered?: boolean;
    isEdited?: boolean;
    isDeletedBySender?: boolean;
    isDeletedByReceiver?: boolean;
    moderationStatus?: ModerationStatusType;
}

/** Query filters for listing messages */
export interface ChatMessageQuery {
    sender?: string;
    receiver?: string;
    isRead?: boolean;
    isDelivered?: boolean;
    moderationStatus?: ModerationStatusType;
    dateFrom?: string;
    dateTo?: string;
    search?: string; // full-text search
    page?: number;
    limit?: number;
    sortBy?: "timestamp" | "createdAt" | "updatedAt";
    sortOrder?: "asc" | "desc";
}

/**
 * =========================
 * API RESPONSE TYPES
 * =========================
 */

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
    errors?: Record<string, string>;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
// DTO for conversation queries
export interface ConversationQuery {
    sender: string; // one participant
    receiver: string; // the other participant
    page?: number;
    limit?: number;
    sortBy?: "timestamp" | "createdAt" | "updatedAt";
    sortOrder?: "asc" | "desc";
}

/** Query for user list (conversation index) */
export interface UserListQuery {
    adminId: string;            // the admin/support user whose sidebar we show
    search?: string;            // filter users by name/email/phone/etc. (backend-defined)
    page?: number;
    limit?: number;
    sortBy?: "lastMessageAt" | "unreadCount" | "name";
    sortOrder?: "asc" | "desc";
}

/** One row for the conversation sidebar */
export interface UserConversationSummary {
    user: IUserRef;             // other participant
    lastMessage?: ChatMessage;  // optional if no messages yet
    lastMessageAt?: string;     // ISO to sort efficiently without parsing lastMessage
    unreadCount: number;        // unread for admin from that user
}

/** Paginated result for user list */
export type UserListPaginated = PaginatedResponse<UserConversationSummary>;
/** Response type */
export type UserListResponse = ApiResponse<UserListPaginated>;

// Response type for a conversation (paginated list of messages)
export type ConversationResponse = ApiResponse<PaginatedResponse<ChatMessage>>;
export type ChatMessageResponse = ApiResponse<ChatMessage>;
export type ChatMessageListResponse = ApiResponse<PaginatedResponse<ChatMessage>>;
export type ChatMessageMutationResponse = ApiResponse<ChatMessage>;

/**
 * =========================
 * STATISTICS / DASHBOARD TYPES
 * =========================
 */

export interface ChatMessageStats {
    totalMessages: number;
    totalDrafts: number;
    totalDelivered: number;
    totalRead: number;
    totalFlagged: number;
    totalRemoved: number;
    totalClean: number;
    unreadByUser?: Record<string, number>; // userId -> count
}

export type ChatMessageStatsResponse = ApiResponse<ChatMessageStats>;

/**
 * =========================
 * SOCKET / REALTIME EVENTS
 * =========================
 */

export interface ChatMessageEvent {
    type: "created" | "updated" | "deleted" | "read" | "delivered";
    payload: ChatMessage;
}
