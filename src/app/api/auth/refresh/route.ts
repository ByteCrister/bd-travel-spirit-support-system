// src/app/api/auth/refresh/route.ts
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import ConnectUserDB from '@/config/ConnectUserDB';
import { getUserModel } from '@/models/UserModel';

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    // 1. Connect to MongoDB
    const db = await ConnectUserDB();

    // 2. Read refresh token from cookies
    const refreshToken = request.cookies.get('refreshToken')?.value
    if (!refreshToken) {
      return NextResponse.json(
        { message: 'No token provided' },
        { status: 401 }
      )
    }

    // 3. Verify & lookup user
    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET!) as {
      id: string
    }

    const UserModel = getUserModel(db);
    const user = await UserModel.findById(payload.id)
    if (!user) throw new Error('User not found')

    // 4. Generate new tokens
    const newAccessToken = user.generateAccessToken()
    const newRefreshToken = user.generateRefreshToken()

    // 5. Send response + updated cookie
    const res = NextResponse.json(
      { accessToken: newAccessToken },
      { status: 200 }
    )
    res.headers.set(
      'Set-Cookie',
      `refreshToken=${newRefreshToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}`
    )
    return res

  } catch (err) {
    console.error('❌ Refresh Token Error:', err)
    return NextResponse.json(
      { message: 'Invalid or expired token' },
      { status: 403 }
    )
  }
}