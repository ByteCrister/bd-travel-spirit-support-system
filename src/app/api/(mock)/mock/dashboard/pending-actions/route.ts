// app/api/mock/dashboard/pending-actions/route.ts
import { NextResponse } from 'next/server';
import { generateMockPendingActions, successResponse } from '@/lib/mocks/dashboard.mock';

export async function GET() {
    await new Promise(resolve => setTimeout(resolve, 500));

    const actions = generateMockPendingActions(15);

    return NextResponse.json(successResponse(actions));
}