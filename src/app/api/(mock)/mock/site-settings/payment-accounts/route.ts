// api/mock/site-settings/payment-accounts/route.ts
import { paginateAccounts } from "@/lib/mocks/payment-accounts.mock";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    // Simulate network delay (optional)
    await new Promise((resolve) => setTimeout(resolve, 500));

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") ?? "5", 10);

    const pageData = paginateAccounts(page, pageSize);

    return NextResponse.json({
        success: true,
        data: pageData,
        error: null,
    });
}