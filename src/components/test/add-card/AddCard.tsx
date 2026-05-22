"use client";

import { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { showToast } from "@/components/global/showToast";
import { extractErrorMessage } from "@/utils/axios/extract-error-message";
import api from "@/utils/axios";
import { ApiResponse } from "@/types/common/api.types";
import { CreditCard, Lock, Shield } from "lucide-react";

const CUSTOMER_ID = "cus_Tz30hQhVgV7rfI";
// const CLIENT_SECRET = "seti_1T14wwH2cwHOTOAbqcuRvTKs_secret_Tz33JH64K9PsWgoBLb6IvJ2mchZjIrr";

export default function AddCardForm() {
    const stripe = useStripe();
    const elements = useElements();

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            showToast.error("Stripe is not initialized");
            return;
        }

        setLoading(true);

        try {
            // 1. Get SetupIntent client secret from your backend
            const { data } = await api.post<ApiResponse<{ clientSecret: string }>>(
                "/test/stripe/create-setup-intent",
                {
                    customerId: CUSTOMER_ID,
                }
            );
            if (!(data && data.data && data.data.clientSecret))
                throw new Error("Invalid response from server: missing clientSecret");

            const clientSecret = data?.data?.clientSecret;

            // const clientSecret = CLIENT_SECRET;

            // 2. Confirm the card setup
            const result = await stripe.confirmCardSetup(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement)!,
                },
            });

            // Log the full result object (card info, setup intent, etc.)
            console.log("Card setup result:", result);

            if (result.error) {
                showToast.error(result.error.message || "Card setup failed");
                return;
            }

            // Success
            showToast.success("Card added successfully");
        } catch (error) {
            const message = extractErrorMessage(error);
            showToast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-lg mx-auto shadow-2xl border-slate-200/60 bg-white/95 backdrop-blur-sm">
            <CardHeader className="space-y-3 pb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20">
                        <CreditCard className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <CardTitle className="text-2xl font-semibold text-slate-800">
                            Add Payment Method
                        </CardTitle>
                        <CardDescription className="text-slate-500 mt-1">
                            Securely save your card for future transactions
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Card Input Section */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-slate-500" />
                            Card Information
                        </label>
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl opacity-0 group-hover:opacity-10 transition duration-300 blur"></div>
                            <div className="relative p-4 border-2 border-slate-200 rounded-xl bg-white hover:border-blue-300 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all duration-200">
                                <CardElement
                                    options={{
                                        style: {
                                            base: {
                                                fontSize: "16px",
                                                color: "#1e293b",
                                                fontFamily: "system-ui, -apple-system, sans-serif",
                                                fontSmoothing: "antialiased",
                                                "::placeholder": {
                                                    color: "#94a3b8",
                                                },
                                            },
                                            invalid: {
                                                color: "#ef4444",
                                                iconColor: "#ef4444",
                                            },
                                        },
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Security Badge */}
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="p-2 rounded-lg bg-emerald-100">
                            <Shield className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-slate-700">
                                Secure payment processing
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Your card details are encrypted and secure
                            </p>
                        </div>
                        <Lock className="h-4 w-4 text-slate-400" />
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        disabled={!stripe || loading}
                        className="w-full h-12 text-base font-medium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="none"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                                Adding card…
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Add Card
                            </span>
                        )}
                    </Button>
                </form>

                {/* Footer Text */}
                <p className="text-xs text-center text-slate-500 pt-2">
                    By adding a card, you agree to our terms of service and privacy policy
                </p>
            </CardContent>
        </Card>
    );
}