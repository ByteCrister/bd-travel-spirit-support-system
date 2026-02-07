// app/api/mock/support/guide-password-reset/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { faker } from '@faker-js/faker';
import {
    PasswordRequestDto,
} from '@/types/guide-forgot-password.types';
import { FORGOT_PASSWORD_STATUS, ForgotPasswordStatus } from '@/constants/guide-forgot-password.const';

// ---------- Shared API envelope (consistent with your other routes) ----------
interface SingleRequestResponse {
    success: boolean;
    data: PasswordRequestDto | null;
    message: string;
}

// --------------------------------------------------
// Mock generator (properly typed)
// --------------------------------------------------
function generateMockRequest(id: string): PasswordRequestDto {
    const createdAt = faker.date.between({
        from: '2024-01-01',
        to: '2024-12-31',
    });

    const statuses: ForgotPasswordStatus[] = [
        FORGOT_PASSWORD_STATUS.PENDING,
        FORGOT_PASSWORD_STATUS.APPROVED,
        FORGOT_PASSWORD_STATUS.REJECTED,
        FORGOT_PASSWORD_STATUS.EXPIRED,
    ];

    const status =
        statuses[Math.floor(Math.random() * statuses.length)];

    const hasReviewer =
        status !== FORGOT_PASSWORD_STATUS.PENDING;

    return {
        id,
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

        reviewer: hasReviewer
            ? {
                reviewedById: faker.string.uuid(),
                reviewerName: faker.person.fullName(),
                reviewerEmail: faker.internet.email(),
                reviewerAvatarUrl:
                    Math.random() > 0.5
                        ? faker.image.avatar()
                        : null,
            }
            : null,
    };
}

// --------------------------------------------------
// GET HANDLER (fully typed)
// --------------------------------------------------
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<SingleRequestResponse>> {
    try {
        // In Next 13/14 app router, params can be async — this is correctly typed
        const { id } = await params;

        if (!id) {
            const badResponse: SingleRequestResponse = {
                success: false,
                data: null,
                message: 'Request ID is required',
            };

            return NextResponse.json(badResponse, { status: 400 });
        }

        // "Lookup" (still mocked, but deterministic for this id)
        const requestFound = generateMockRequest(id);

        const okResponse: SingleRequestResponse = {
            success: true,
            data: requestFound,
            message: 'Request fetched successfully',
        };

        return NextResponse.json(okResponse, {
            status: 200,
            headers: {
                'Cache-Control': 'public, max-age=120',
                ETag: `W/"${faker.string.uuid()}"`, // consistent with your list route
            },
        });
    } catch {
        const errorResponse: SingleRequestResponse = {
            success: false,
            data: null,
            message: 'Failed to fetch request',
        };

        return NextResponse.json(errorResponse, { status: 500 });
    }
}