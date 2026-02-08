// utils/api/email-verification.api.ts

import { ApiResponse } from "@/types/common/api.types";
import api from "../axios";
import { extractErrorMessage } from "../axios/extract-error-message";

interface ResponseTypes {
    success: boolean;
    message: string
}

export class EmailVerificationService {
    private readonly email: string;

    // Store API endpoints in the class
    private readonly API_URL = '/auth/token/v1';

    constructor(email: string) {
        this.email = email.trim().toLowerCase();
    }

    /**
     * Send verification email to the user
     */
    async sendVerificationEmail(): Promise<ResponseTypes> {
        try {
            const response = await api.post<ApiResponse<ResponseTypes>>(this.API_URL, {
                email: this.email
            });

            return {
                success: true,
                message: response.data?.data?.message ?? 'Verification email sent successfully'
            };
        } catch (error: unknown) {
            return {
                success: false,
                message: extractErrorMessage(error) ?? 'Failed to send verification email'
            };
        }
    }

    /**
     * Verify the token entered by user
     */
    async verifyToken(token: string): Promise<ResponseTypes> {
        try {
            const response = await api.patch<ApiResponse<ResponseTypes>>(this.API_URL, {
                email: this.email,
                token: token.trim()
            });

            return {
                success: true,
                message: response.data.data?.message ?? 'Email verified successfully',
            };
        } catch (error: unknown) {
            return {
                success: false,
                message: extractErrorMessage(error) ?? 'Invalid verification token'
            };
        }
    }
}
