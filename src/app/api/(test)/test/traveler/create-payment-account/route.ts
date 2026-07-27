import { NextResponse } from "next/server";
import ConnectDB from "@/config/db";
import StripePaymentAccountModel from "@/models/payments/payment-account.model";
import UserModel from "@/models/user.model";
import { TravelerModel } from "@/models/travelers/traveler.model";
import { USER_ROLE } from "@/constants/user.const";
import { PAYMENT_OWNER_TYPE } from "@/constants/payment.const";

/*
JSON Body Structure for create-payment-account API:
{
  "ownerType": "traveler", // Must be traveler
  "ownerId": "697c77134df80d599997b85d", // ObjectId of the User
  "purpose": "transaction_account",
  "stripeCustomerId": "cus_123456789",
  "stripePaymentMethodId": "pm_123456789",
  "label": "My Personal Card",
  "card": {
    "brand": "visa",
    "last4": "4242",
    "expMonth": 12,
    "expYear": 2025
  }
}
*/

export async function POST(req: Request) {
    try {
        await ConnectDB();
        const body = await req.json();

        // 1. Verify the User exists and has the traveler role
        const user = await UserModel.findById(body.ownerId);
        if (!user) {
            return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
        }

        if (user.role !== USER_ROLE.TRAVELER) {
            return NextResponse.json({ success: false, error: "User is not a traveler" }, { status: 403 });
        }

        // 2. Verify the Traveler profile exists
        const traveler = await TravelerModel.findOne({ user: user._id });
        if (!traveler) {
            return NextResponse.json({ success: false, error: "Traveler profile not found" }, { status: 404 });
        }

        // 3. Force ownerType to be traveler
        const paymentData = {
            ...body,
            ownerType: PAYMENT_OWNER_TYPE.TRAVELER
        };

        // 4. Create the payment account
        const newPaymentAccount = await StripePaymentAccountModel.create(paymentData);

        // 5. Update the Traveler document with the new payment account ID
        traveler.paymentAccount = newPaymentAccount._id;
        await traveler.save();

        return NextResponse.json({ success: true, data: newPaymentAccount }, { status: 201 });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
