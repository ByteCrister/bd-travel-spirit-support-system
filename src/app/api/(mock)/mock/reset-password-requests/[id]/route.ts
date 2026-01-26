import { ensureDataset, MOCK_DB } from "@/lib/mocks/reset-password-requests.mock";
import { NextResponse } from "next/server";

ensureDataset();

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const id = (await params).id;
    const found = MOCK_DB.find((d) => d._id === id);
    if (!found) {
        return new NextResponse(JSON.stringify({ message: "Not found" }), { status: 404, headers: { "content-type": "application/json" } });
    }

    return NextResponse.json({ data: found });
}
