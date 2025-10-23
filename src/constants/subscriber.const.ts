// constants/subscriber.const.ts

/**
 * Subscriber domain constants and types.
 *
 * These enums define the valid states and sources for a subscriber.
 * They are declared with `as const` so that TypeScript infers literal types,
 * ensuring type‑safety and autocompletion across your codebase.
 *
 * Usage:
 *  - Enforce consistent values in Mongoose schemas (via enum).
 *  - Provide strong typing in DTOs, API contracts, and frontend logic.
 *  - Support analytics, segmentation, and compliance by tracking
 *    subscriber lifecycle and origin.
 */

/**
 * Lifecycle status of a subscriber.
 * - SUBSCRIBED:   Actively opted‑in to receive updates.
 * - UNSUBSCRIBED: Explicitly opted‑out or removed from the mailing list.
 */
export const SUBSCRIBER_STATUS = {
    SUBSCRIBED: "subscribed",
    UNSUBSCRIBED: "unsubscribed",
} as const;

export type SubscriberStatus =
    (typeof SUBSCRIBER_STATUS)[keyof typeof SUBSCRIBER_STATUS];

/**
 * Origin of the subscription event.
 * Tracks where the subscriber came from for attribution and segmentation.
 * - BD_TRAVEL_SPIRIT:         Main BD Travel Spirit site.
 * - BD_TRAVEL_SPIRIT_GUIDE:   Knowledge/guide section.
 * - BD_TRAVEL_SPIRIT_SUPPORT: Support/help interactions.
 * - REFERRAL:                 Partner or referral link.
 * - SOCIAL_MEDIA:             Social media lead forms.
 * - AD_CAMPAIGN:              Paid ad campaigns.
 * - API:                      Programmatic/integration source.
 */
export const SUBSCRIBER_SOURCE = {
    BD_TRAVEL_SPIRIT: "bd_travel_spirit",
    BD_TRAVEL_SPIRIT_GUIDE: "bd_travel_spirit_guide",
    BD_TRAVEL_SPIRIT_SUPPORT: "bd_travel_spirit_support",
    REFERRAL: "referral",
    SOCIAL_MEDIA: "social_media",
    AD_CAMPAIGN: "ad_campaign",
    API: "api",
} as const;

export type SubscriberSource =
    (typeof SUBSCRIBER_SOURCE)[keyof typeof SUBSCRIBER_SOURCE];
