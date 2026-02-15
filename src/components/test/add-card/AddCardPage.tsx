"use client";

import { stripePromise } from "@/config/stripe-client";
import { Elements } from "@stripe/react-stripe-js";
import AddCardForm from "./AddCard";

export default function AddCardPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center p-4">
            <Elements stripe={stripePromise}>
                <AddCardForm />
            </Elements>
        </div>
    );
}