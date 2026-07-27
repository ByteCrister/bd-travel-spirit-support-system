import { NextResponse } from "next/server";
import ConnectDB from "@/config/db";
import UserModel from "@/models/user.model";
import { USER_ROLE } from "@/constants/user.const";

/*
JSON Body Structure for create-user API:
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "Password123!"
}
Note: Role is automatically assigned as "traveler".
*/

export async function POST(req: Request) {
    try {
        await ConnectDB();
        const body = await req.json();
        
        // Ensure the role is set to traveler for this specific route
        const userData = {
            ...body,
            role: USER_ROLE?.TRAVELER || "traveler"
        };

        const newUser = await UserModel.create(userData);
        
        return NextResponse.json({ success: true, data: newUser }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
