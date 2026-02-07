// app/api/mock/support/guide-password-reset/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { faker } from '@faker-js/faker';
import {
    PasswordRequestDto,
    PasswordRequestStats,
    PaginatedResponse,
    PasswordRequestFilters,
    SortOrder,
    SortOption,
    PaginationParams,
} from '@/types/guide-forgot-password.types';
import { FORGOT_PASSWORD_STATUS, ForgotPasswordStatus } from '@/constants/guide-forgot-password.const';

// --------------------------------------------------
// MOCK DB
// --------------------------------------------------
const MOCK_DB: PasswordRequestDto[] = [];
const INITIAL_RECORD_COUNT = 87;

// --------------------------------------------------
// INITIALIZE MOCK DATA (UNCHANGED LOGIC)
// --------------------------------------------------
function initializeMockData(): void {
    if (MOCK_DB.length > 0) return;

    const statuses: ForgotPasswordStatus[] = [
        FORGOT_PASSWORD_STATUS.PENDING,
        FORGOT_PASSWORD_STATUS.APPROVED,
        FORGOT_PASSWORD_STATUS.REJECTED,
        FORGOT_PASSWORD_STATUS.EXPIRED,
    ];

    const reviewerNames = [
        'Alex Johnson',
        'Sam Wilson',
        'Taylor Swift',
        'Jamie Lee',
        'Morgan Freeman',
    ];

    for (let i = 0; i < INITIAL_RECORD_COUNT; i++) {
        const createdAt = faker.date.between({
            from: '2024-01-01',
            to: '2024-12-31',
        });

        const status =
            statuses[Math.floor(Math.random() * statuses.length)];

        const hasReviewer =
            status !== FORGOT_PASSWORD_STATUS.PENDING &&
            Math.random() > 0.3;

        const reviewerName = hasReviewer
            ? reviewerNames[
            Math.floor(Math.random() * reviewerNames.length)
            ]
            : null;

        const request: PasswordRequestDto = {
            id: faker.string.uuid(),
            reason: faker.lorem.sentence(),
            status,
            rejectionReason:
                status === FORGOT_PASSWORD_STATUS.REJECTED
                    ? faker.lorem.sentence()
                    : null,
            expiresAt: faker.date.future({ refDate: createdAt }),
            emailSentAt:
                Math.random() > 0.2
                    ? faker.date.soon({ refDate: createdAt })
                    : null,
            createdAt,
            updatedAt: faker.date.between({
                from: createdAt,
                to: new Date(),
            }),

            user: {
                guideId: faker.string.uuid(),
                name: faker.person.fullName(),
                email: faker.internet.email(),
                avatarUrl:
                    Math.random() > 0.7
                        ? faker.image.avatar()
                        : null,
            },

            reviewer: reviewerName
                ? {
                    reviewedById: faker.string.uuid(),
                    reviewerName,
                    reviewerEmail: faker.internet.email({
                        firstName: reviewerName.split(' ')[0],
                    }),
                    reviewerAvatarUrl:
                        Math.random() > 0.5
                            ? faker.image.avatar()
                            : null,
                }
                : null,
        };

        MOCK_DB.push(request);
    }

    MOCK_DB.sort(
        (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
    );
}

// --------------------------------------------------
// HELPER: PARSE QUERY INTO PROPER TYPES
// --------------------------------------------------
function parseFiltersFromRequest(
    request: NextRequest
): {
    pagination: PaginationParams;
    filters: PasswordRequestFilters;
} {
    const sp = request.nextUrl.searchParams;

    const page = Number(sp.get('page') ?? 1);
    const limit = Number(sp.get('limit') ?? 20);

    const search = sp.get('search') ?? '';

    const rawStatus = sp.get('status') ?? 'ALL';

    const status: ForgotPasswordStatus | 'ALL' =
        rawStatus === 'ALL'
            ? 'ALL'
            : (rawStatus as ForgotPasswordStatus);

    const sortBy =
        (sp.get('sortBy') as SortOption['field']) ??
        'createdAt';

    const sortOrder =
        (sp.get('sortOrder') as SortOrder) ?? 'desc';

    const startDate = sp.get('startDate')
        ? new Date(sp.get('startDate')!)
        : null;

    const endDate = sp.get('endDate')
        ? new Date(sp.get('endDate')!)
        : null;

    return {
        pagination: {
            page,
            limit,
            total: 0, // will be filled later
            totalPages: 0,
        },
        filters: {
            search,
            status,
            dateRange: {
                start: startDate,
                end: endDate,
            },
            sortBy: {
                field: sortBy,
                order: sortOrder,
            },
        },
    };
}

// --------------------------------------------------
// GET HANDLER
// --------------------------------------------------
export async function GET(request: NextRequest) {
    initializeMockData();

    const { pagination, filters } =
        parseFiltersFromRequest(request);

    let filteredData: PasswordRequestDto[] = [...MOCK_DB];

    // -------- SEARCH FILTER --------
    if (filters.search) {
        const searchLower =
            filters.search.toLowerCase();

        filteredData = filteredData.filter((item) =>
            item.user.name
                .toLowerCase()
                .includes(searchLower) ||
            item.user.email
                .toLowerCase()
                .includes(searchLower) ||
            item.reason
                .toLowerCase()
                .includes(searchLower) ||
            (!!item.rejectionReason &&
                item.rejectionReason
                    .toLowerCase()
                    .includes(searchLower))
        );
    }

    // -------- STATUS FILTER --------
    if (filters.status !== 'ALL') {
        filteredData = filteredData.filter(
            (item) => item.status === filters.status
        );
    }

    // -------- DATE FILTER --------
    if (filters.dateRange.start) {
        filteredData = filteredData.filter(
            (item) =>
                new Date(item.createdAt) >=
                filters.dateRange.start!
        );
    }

    if (filters.dateRange.end) {
        filteredData = filteredData.filter(
            (item) =>
                new Date(item.createdAt) <=
                filters.dateRange.end!
        );
    }

    // -------- SORT (FULLY TYPED) --------
    filteredData.sort((a, b) => {
        const { field, order } = filters.sortBy;

        let aValue: string | Date;
        let bValue: string | Date;

        switch (field) {
            case 'user.name':
                aValue = a.user.name;
                bValue = b.user.name;
                break;

            case 'user.email':
                aValue = a.user.email;
                bValue = b.user.email;
                break;

            case 'status':
                aValue = a.status;
                bValue = b.status;
                break;

            default:
                aValue = new Date(a[field]);
                bValue = new Date(b[field]);
        }

        if (order === 'asc') {
            return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        }

        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    });

    // -------- PAGINATION (TYPED) --------
    const total = filteredData.length;
    const totalPages = Math.ceil(
        total / pagination.limit
    );

    const startIndex =
        (pagination.page - 1) * pagination.limit;

    const endIndex = Math.min(
        startIndex + pagination.limit,
        total
    );

    const paginatedData = filteredData.slice(
        startIndex,
        endIndex
    );

    pagination.total = total;
    pagination.totalPages = totalPages;

    // -------- STATS (TYPED) --------
    const stats: PasswordRequestStats = {
        total: MOCK_DB.length,
        pending: MOCK_DB.filter(
            (i) =>
                i.status ===
                FORGOT_PASSWORD_STATUS.PENDING
        ).length,
        approved: MOCK_DB.filter(
            (i) =>
                i.status ===
                FORGOT_PASSWORD_STATUS.APPROVED
        ).length,
        rejected: MOCK_DB.filter(
            (i) =>
                i.status ===
                FORGOT_PASSWORD_STATUS.REJECTED
        ).length,
        expired: MOCK_DB.filter(
            (i) =>
                i.status ===
                FORGOT_PASSWORD_STATUS.EXPIRED
        ).length,
        pendingPercentage: Math.round(
            (MOCK_DB.filter(
                (i) =>
                    i.status ===
                    FORGOT_PASSWORD_STATUS.PENDING
            ).length /
                MOCK_DB.length) *
            100
        ),
        approvalRate: Math.round(
            (MOCK_DB.filter(
                (i) =>
                    i.status ===
                    FORGOT_PASSWORD_STATUS.APPROVED
            ).length /
                MOCK_DB.length) *
            100
        ),
        averageResponseTime:
            Math.random() * 24 + 1,
    };

    const response: PaginatedResponse<PasswordRequestDto> =
    {
        data: paginatedData,
        pagination,
        stats,
    };

    const etag = `W/"${faker.string.uuid()}"`;

    return NextResponse.json(
        {
            success: true,
            data: response,
            message:
                'Requests fetched successfully',
        },
        {
            status: 200,
            headers: {
                ETag: etag,
                'Cache-Control':
                    'public, max-age=300',
            },
        }
    );
}