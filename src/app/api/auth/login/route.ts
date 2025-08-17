import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getUserModel } from '@/models/UserModel';
import ConnectUserDB from '@/config/ConnectUserDB';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES = '15m';
const REFRESH_EXPIRES = '7d';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const db = await ConnectUserDB();
    const { email, password } = await request.json();

    const User = getUserModel(db);
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: 'Email not found!' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: 'Password did not matched!' }, { status: 401 });
    }

    const accessToken = jwt.sign(
      { id: user._id, roles: user.roles },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      JWT_SECRET,
      { expiresIn: REFRESH_EXPIRES }
    );

    const res = NextResponse.json({ accessToken }, { status: 200 });

    res.headers.set(
      'Set-Cookie',
      `refreshToken=${refreshToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}`
    );

    return res;
  } catch (err) {
    console.error('❌ Login Error:', err);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
