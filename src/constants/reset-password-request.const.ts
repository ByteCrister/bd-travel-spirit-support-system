// constants/reset-password-request.const.ts

export const REQUEST_STATUS = {
    PENDING: "pending",
    DENIED: "denied",
    FULFILLED: "fulfilled",
} as const;

export type RequestStatus = (typeof REQUEST_STATUS)[keyof typeof REQUEST_STATUS];