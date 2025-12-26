// app/api/site-owner/route.ts
import { NextRequest, NextResponse } from "next/server";
import UserModel from "@/models/user.model";
import ConnectDB from "@/config/db";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import { Types } from "mongoose";

function getErrorMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    if (typeof err === "string") return err;
    try {
        return JSON.stringify(err);
    } catch {
        return "Internal Server Error";
    }
}

/**
 * CREATE SITE OWNER (USER)
 */
export async function POST(req: NextRequest) {
    try {
        await ConnectDB();

        const body = await req.json();
        const { name, email, password, role } = body;

        if (!name || !email || !password || !role) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Check existing user
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { error: "Email already in use" },
                { status: 409 }
            );
        }

        // Create user
        const user = await UserModel.create({
            name,
            email,
            password,
            role,
        });

        // Return safe response (no password)
        return NextResponse.json(
            {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                },
            },
            { status: 201 }
        );
    } catch (err: unknown) {
        console.error("Error creating site owner:", err);
        return NextResponse.json(
            { error: getErrorMessage(err) },
            { status: 500 }
        );
    }
}

/**
 * UPDATE SITE OWNER (USER)
 */
export async function PATCH(req: NextRequest) {
    try {
        await ConnectDB();

        const userId = await getUserIdFromSession();
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        if (!Types.ObjectId.isValid(userId)) {
            return NextResponse.json(
                { error: "Invalid user ID" },
                { status: 400 }
            );
        }

        const body = await req.json();
        const { name, password } = body;

        if (!name && !password) {
            return NextResponse.json(
                { error: "Nothing to update" },
                { status: 400 }
            );
        }

        // Fetch user (include password only if needed)
        const user = await UserModel.findById(userId).select(
            password ? "+password" : ""
        );

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        if (name) user.name = name;
        if (password) user.password = password; // hashed by pre-save hook

        await user.save();

        return NextResponse.json(
            {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                },
            },
            { status: 200 }
        );
    } catch (err: unknown) {
        console.error("Error updating site owner:", err);
        return NextResponse.json(
            { error: getErrorMessage(err) },
            { status: 500 }
        );
    }
}