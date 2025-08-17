// src/app/api/auth/logout/route.ts
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST() {
    try {
        // Clear the HttpOnly refresh token cookie
        const res = new NextResponse(null, { status: 204 })
        res.headers.set(
            'Set-Cookie',
            [
                // Expire the cookie immediately
                'refreshToken=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0',
            ].join('; ')
        )
        return res
    } catch (err) {
        console.error('❌ Logout Error:', err)
        return NextResponse.json(
            { message: 'Logout failed' },
            { status: 500 }
        )
    }
}
