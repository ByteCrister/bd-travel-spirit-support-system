import { NextResponse } from "next/server";
import ConnectDB from "@/config/db";
import { TravelerModel } from "@/models/travelers/traveler.model";

/*
JSON Body Structure for create-traveler API:
{
  "user": "60d5ecb8b392d700153f3a00", // ObjectId of the created user (Required)
  "name": "John Doe", // (Required)
  "avatar": "60d5ecb8b392d700153f3a01", // ObjectId of an Asset (Optional)
  "phone": "+8801700000000", // (Optional)
  "dateOfBirth": "1990-01-01T00:00:00.000Z", // (Optional)
  "address": { // (Optional)
    "house": "House 12",
    "road": "Road 5",
    "area": "Dhanmondi",
    "village": "Village Name",
    "ward": "Ward 1",
    "union": "Union Name",
    "upazila": "Dhanmondi",
    "district": "Dhaka", // Enum from DISTRICT (Required if address is provided)
    "division": "Dhaka", // Enum from DIVISION (Required if address is provided)
    "postOffice": "Dhanmondi Post Office",
    "postalCode": "1209",
    "country": "Bangladesh" // Default
  },
  "location": { // GeoJSON (Optional)
    "type": "Point", // Default "Point"
    "coordinates": [90.3809, 23.7431] // [longitude, latitude]
  },
  "isVerified": false, // Default false
  "accountStatus": "PENDING", // Enum from ACCOUNT_STATUS, default "PENDING"
  "paymentAccount": "60d5ecb8b392d700153f3a02" // ObjectId of StripePaymentAccount (Optional)
}
*/

export async function POST(req: Request) {
    try {
        await ConnectDB();
        const body = await req.json();
        
        const newTraveler = await TravelerModel.create(body);
        
        return NextResponse.json({ success: true, data: newTraveler }, { status: 201 });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
