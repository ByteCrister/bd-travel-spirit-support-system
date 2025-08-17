// \src\app\api\me\route.ts
import { getUserFromToken } from '@/utils/helper/getUserFromToken';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const user = await getUserFromToken().catch(() => null);
        if (!user) {
            throw new Error('Invalid or expired token');
        }
        const payload = {
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
        };

        return NextResponse.json(payload, {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (err: unknown) {
        console.error('GET /api/me error →', err);

        const message =
            err instanceof Error ? err.message : 'Unauthorized access';
        return NextResponse.json(
            { error: message },
            { status: 401 }
        );
    }
}