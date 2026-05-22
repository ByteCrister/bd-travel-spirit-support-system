import { NextRequest, NextResponse } from 'next/server';
import {
    TravelerListResponse,
    TravelerListItem,
    TravelerDetail,
} from '@/types/user/traveler.types';
import { ApiResponse } from '@/types/common/api.types';
import { generateTravelerDetail } from '@/lib/mocks/traveler.mock';
import { ACCOUNT_STATUS } from '@/constants/user.const';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;

    // 1. Extract filter parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const accountStatus = searchParams.getAll('accountStatus[]').length
        ? searchParams.getAll('accountStatus[]')
        : searchParams.get('accountStatus')?.split(',').filter(Boolean) || [];
    const isVerified = searchParams.has('isVerified')
        ? searchParams.get('isVerified') === 'true'
        : undefined;
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

    // 2. Generate full traveler details (200 items)
    const allTravelerDetails: TravelerDetail[] = Array.from({ length: 200 }, () =>
        generateTravelerDetail()
    );

    // 3. Compute global statistics from the full details
    const stats = {
        totalTravelers: allTravelerDetails.length,
        activeCount: allTravelerDetails.filter(
            (d) => d.accountStatus === ACCOUNT_STATUS.ACTIVE
        ).length,
        suspendedCount: allTravelerDetails.filter(
            (d) => d.accountStatus === ACCOUNT_STATUS.SUSPENDED
        ).length,
        lockedCount: allTravelerDetails.filter((d) => d.isLocked === true).length,
        verifiedCount: allTravelerDetails.filter((d) => d.isVerified === true).length,
        unverifiedCount: allTravelerDetails.filter((d) => d.isVerified === false).length,
        deletedCount: allTravelerDetails.filter((d) => d.deletedAt).length,
    };

    // 4. Map details to list items (only fields needed for the table)
    const allListItems: TravelerListItem[] = allTravelerDetails.map((d) => ({
        _id: d._id,
        userId: d._id, // in the mock, the traveler's _id doubles as userId
        name: d.name,
        email: d.email,
        role: d.role,
        accountStatus: d.accountStatus,
        isVerified: d.isVerified,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
        avatarUrl: d.avatarUrl,
        phone: d.phone,
    }));

    // 5. Apply filters
    const filtered = allListItems.filter((t) => {
        if (
            search &&
            !t.name.toLowerCase().includes(search.toLowerCase()) &&
            !t.email.toLowerCase().includes(search.toLowerCase())
        ) {
            return false;
        }
        if (accountStatus.length > 0 && !accountStatus.includes(t.accountStatus)) return false;
        if (isVerified !== undefined && t.isVerified !== isVerified) return false;
        return true;
    });

    // 6. Apply sorting
    filtered.sort((a, b) => {
        const aVal = a[sortBy as keyof typeof a];
        const bVal = b[sortBy as keyof typeof b];
        if (typeof aVal === 'string' && typeof bVal === 'string') {
            return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        // Fallback to date comparison for createdAt/updatedAt
        return sortOrder === 'asc'
            ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // 7. Paginate
    const total = filtered.length;
    const start = (page - 1) * limit;
    const paginatedData = filtered.slice(start, start + limit);

    // 8. Build the final response
    const response: ApiResponse<TravelerListResponse> = {
        data: {
            data: paginatedData,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            stats,
        },
    };

    return NextResponse.json(response);
}