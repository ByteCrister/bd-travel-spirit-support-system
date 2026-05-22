// app/api/payment-accounts/[id]/route.ts
import { findAccountById } from "@/lib/mocks/payment-accounts.mock";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const account = findAccountById((await params).id);

    if (!account) {
        return NextResponse.json(
            {
                success: false,
                data: null,
                error: "Payment account not found",
            },
            { status: 404 }
        );
    }

    return NextResponse.json({
        success: true,
        data: account,
        error: null,
    });
}