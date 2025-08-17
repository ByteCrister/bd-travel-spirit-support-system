import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { IUser, getUserModel } from '@/models/UserModel'; 
import ConnectUserDB from '@/config/ConnectUserDB';

export interface JwtPayload {
    id: string;
    iat: number;
    exp: number;
}

export async function getUserFromToken(): Promise<IUser> {
    try {
        const db = await ConnectUserDB();

        const token = (await cookies()).get('refreshToken')?.value;
        if (!token) throw new Error('Missing refresh token');

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

        const User = getUserModel(db); 
        const user = await User.findById(decoded.id).select('name email avatar _id');

        if (!user) throw new Error('User not found');

        return user;
    } catch (err) {
        console.error('❌ getUserFromToken error:', err);
        throw new Error('Authentication failed');
    }
}