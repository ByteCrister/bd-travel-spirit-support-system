// app/api/site-owner/route.ts
import { NextRequest, NextResponse } from "next/server";
import UserModel from "@/models/user.model";
import OwnerModel from "@/models/owner.model";
import ConnectDB from "@/config/db";
import { getUserIdFromSession } from "@/lib/helpers/get-user";
import mongoose, { Types } from "mongoose";

function getErrorMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    if (typeof err === "string") return err;
    try {
        return JSON.stringify(err);
    } catch {
        return "Internal Server Error";
    }
}

export async function POST(req: NextRequest) {
    try {
        await ConnectDB();

        const body = await req.json();
        const { email, password, role, name } = body;

        if (!email || !password || !role || !name) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Check if user already exists
        const existingUser = await UserModel.findByEmail(email);
        if (existingUser) {
            return NextResponse.json({ error: "Email already in use" }, { status: 409 });
        }

        // Create user
        const newUser = await UserModel.create({ email, password, role });

        // Create owner linked to user
        const newOwner = await OwnerModel.create({ user: newUser._id, name });

        // Populate the user field for response
        const ownerWithUser = await newOwner.populate({
            path: "user",
            select: "email role createdAt updatedAt",
        });

        return NextResponse.json({ owner: ownerWithUser }, { status: 201 });
    } catch (err: unknown) {
        console.log("Error creating site owner:", err);
        const message = getErrorMessage(err) || "Internal Server Error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        await ConnectDB();

        const id = await getUserIdFromSession();
        if (!Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid owner ID" }, { status: 400 });
        }

        const body = await req.json();
        const { name, password } = body;

        if (!name && !password) {
            return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
        }

        // Find the owner
        const owner = await OwnerModel.findById(id);
        if (!owner) {
            return NextResponse.json({ error: "Owner not found" }, { status: 404 });
        }

        // Start a session for transaction
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Update owner name
            if (name) owner.name = name;
            await owner.save({ session });

            // Update user password
            if (password) {
                const user = await UserModel.findById(owner.user).select("+password");
                if (!user) throw new Error("Linked user not found");

                user.password = password; // hashed automatically by UserSchema pre-save hook
                await user.save({ session });
            }

            await session.commitTransaction();
            session.endSession();

            // Return updated owner populated with user fields
            const updatedOwner = await OwnerModel.findById(id).populate({
                path: "user",
                select: "email role createdAt updatedAt",
            });

            return NextResponse.json({ owner: updatedOwner }, { status: 200 });
        } catch (err) {
            await session.abortTransaction();
            session.endSession();
            throw err;
        }
    } catch (err: unknown) {
        console.log("Error updating site owner:", err);
        const message = getErrorMessage(err) || "Internal Server Error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}