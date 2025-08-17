import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { getUserModel } from '@/models/UserModel';
import ConnectUserDB from '@/config/ConnectUserDB';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES = '15m';
const REFRESH_EXPIRES = '7d';

export const runtime = 'nodejs';

// Zod schema validation
const RegisterSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['user', 'organizer', 'support-agent']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const db = await ConnectUserDB();

    const body = await request.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: 'Invalid input', errors: parsed.error.format() }, { status: 400 });
    }

    const { name, email, password, role = 'user' } = parsed.data;
    const User = getUserModel(db);

    const normalizedEmail = email.toLowerCase();
    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      return NextResponse.json({ message: 'Email already in use' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      roles: [role],
    });

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

    const isDev = process.env.NODE_ENV !== 'production';
    const cookieOptions = [
      `refreshToken=${refreshToken}`,
      'Path=/',
      'HttpOnly',
      'SameSite=Strict',
      `Max-Age=${7 * 24 * 60 * 60}`,
      ...(isDev ? [] : ['Secure']),
    ].join('; ');

    const res = NextResponse.json({
      message: 'User registered successfully',
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
      },
    }, { status: 201 });

    res.headers.set('Set-Cookie', cookieOptions);

    return res;
  } catch (err) {
    console.error('❌ Registration Error:', err);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
