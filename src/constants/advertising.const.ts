// constants/advertising.const.ts
export enum PLACEMENT {
    LANDING_BANNER = "landing_banner",
    POPUP_MODAL = "popup_modal",
    EMAIL = "email",
    SIDEBAR = "sidebar",
    SPONSORED_LIST = "sponsored_list"
}
export type PlacementType = `${PLACEMENT}`;

export enum AD_STATUS {
    DRAFT = "draft",
    PENDING = "pending",       // pending admin approval / payment
    ACTIVE = "active",
    PAUSED = "paused",
    EXPIRED = "expired",
    CANCELLED = "cancelled",
    REJECTED = "rejected"
}
export type AdStatusType = `${AD_STATUS}`;