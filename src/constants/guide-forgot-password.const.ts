// constants/forgot-password.const.ts
export enum FORGOT_PASSWORD_STATUS {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
    EXPIRED = "expired",
};

export type ForgotPasswordStatus = `${FORGOT_PASSWORD_STATUS}`;