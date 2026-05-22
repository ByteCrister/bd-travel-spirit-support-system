import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types/common/api.types';
import { generateTravelerDetail } from '@/lib/mocks/traveler.mock';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const id = (await params).id;
    const traveler = generateTravelerDetail(id); // reuse id if you want consistency

    const response: ApiResponse<typeof traveler> = {
        data: traveler,
    };
    return NextResponse.json(response);
}