// api/test/create-article-comment
import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import ConnectDB from "@/config/db";
import TravelArticleCommentModel from "@/models/articles/travel-article-comment.model";

// ================================
// TEST CONSTANTS (UPPERCASE)
// ================================
const ARTICLE_ID = new Types.ObjectId("6973394643b7081126640ccc"); // ? main article _id
// const PARENT_ID: Types.ObjectId | null = null; // or new Types.ObjectId("...")
const PARENT_ID: Types.ObjectId | null = new Types.ObjectId("698312200ea11e69018e8815");
// const AUTHOR = new Types.ObjectId("697c77134df80d599997b85d");    //? traveler
const AUTHOR = new Types.ObjectId("6982c9583afd45667a05b55e");    //? traveler

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
            comment = await TravelArticleCommentModel.createReply(
                ARTICLE_ID,
                PARENT_ID,
                {
                    author: AUTHOR,
                    content,
                }
            );
        } else {
            // Create top-level comment
            comment = await TravelArticleCommentModel.create({
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