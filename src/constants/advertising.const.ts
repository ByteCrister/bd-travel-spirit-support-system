// types/advertising.const.ts
import { Types } from "mongoose";

export enum PLACEMENT {
    LandingBanner = "landing_banner",
    PopupModal = "popup_modal",
    Email = "email",
    Sidebar = "sidebar",
    SponsoredList = "sponsored_list"
}
export type PlacementType = `${PLACEMENT}`;

export enum AD_STATUS {
    Draft = "draft",
    Pending = "pending",       // pending admin approval / payment
    Active = "active",
    Paused = "paused",
    Expired = "expired",
    Cancelled = "cancelled",
    Rejected = "rejected"
}
export type AdStatusType = `${AD_STATUS}`;

export type ObjectId = Types.ObjectId;
