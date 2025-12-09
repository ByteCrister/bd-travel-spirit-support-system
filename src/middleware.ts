import { NextRequest, NextResponse } from "next/server";
import getRedisClient from "./config/get-redis-client.upstash";

const LIMIT = 100;
const WINDOW = 60; // seconds

export async function middleware(req: NextRequest) {
    // const ip =
    //     req.headers.get("x-forwarded-for")?.split(",")[0] ||
    //     "127.0.0.1";

    // const redis = getRedisClient();
    // const key = `ratelimit:${ip}`;

    // const current = await redis.incr(key);

    // if (current === 1) {
    //     await redis.expire(key, WINDOW);
    // }

    // if (current > LIMIT) {
    //     return NextResponse.json(
    //         { error: "Too many requests" },
    //         { status: 429 }
    //     );
    // }

    return NextResponse.next();
}

export const config = {
    matcher: ["/api/:path*"],
};