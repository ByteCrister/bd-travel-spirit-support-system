// api/test/create-article-comment
import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import ConnectDB from "@/config/db";
import { TravelCommentModel } from "@/models/articles/travel-article-comment.model";

// ================================
// TEST CONSTANTS (UPPERCASE)
// ================================
const ARTICLE_ID = new Types.ObjectId("6973394643b7081126640ccc"); // ? main article _id
const PARENT_ID: Types.ObjectId | null = null; // or new Types.ObjectId("...")
const AUTHOR = new Types.ObjectId("697c77134df80d599997b85d");    //? traveler

// ================================
// POST: Create comment (TEST)
// ================================
export async function POST(req: NextRequest) {
    try {
        await ConnectDB();

        const body = await req.json();
        const { content } = body;

        if (!content || typeof content !== "string") {
            return NextResponse.json(
                { message: "Content is required" },
                { status: 400 }
            );
        }

        // -----------------------------
        // Create root comment or reply
        // -----------------------------
        let comment;

        if (PARENT_ID) {
            // Create reply
            comment = await TravelCommentModel.createReply(
                ARTICLE_ID,
                PARENT_ID,
                {
                    author: AUTHOR,
                    content,
                }
            );
        } else {
            // Create top-level comment
            comment = await TravelCommentModel.create({
                articleId: ARTICLE_ID,
                parentId: null,
                author: AUTHOR,
                content,
            });
        }

        return NextResponse.json(
            {
                message: "Comment created successfully",
                data: comment,
            },
            { status: 201 }
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error("Create comment error:", error);

        return NextResponse.json(
            {
                message: "Failed to create comment",
                error: error.message,
            },
            { status: 500 }
        );
    }
}