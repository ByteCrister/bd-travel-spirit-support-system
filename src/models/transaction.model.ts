// models/transaction.model.ts
import { defineModel } from "@/lib/helpers/defineModel";
import mongoose, { Schema, Document } from "mongoose";

export type TransactionStatus = "pending" | "succeeded" | "failed";

export interface ITransaction extends Document {
  paymentAccountId: mongoose.Types.ObjectId; // link to StripePaymentAccount
  stripePaymentIntentId: string;              // Stripe PaymentIntent ID
  amount: number;
  currency: string;
  status: TransactionStatus;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    paymentAccountId: {
      type: Schema.Types.ObjectId,
      ref: "StripePaymentAccount",
      required: true,
      index: true,
    },
    stripePaymentIntentId: {
      type: String,
      required: true,
      unique: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "succeeded", "failed"],
      default: "pending",
    },
    description: { type: String },
  },
  { timestamps: true }
);

export const TransactionModel = defineModel("Transaction", TransactionSchema);