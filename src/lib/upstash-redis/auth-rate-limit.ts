import getRedisClient from "../../config/get-redis-client.upstash";

export async function authRateLimit({
    identifier,
    limit = 5,
    window = 60,
}: {
    identifier: string;      // email or IP
    limit?: number;
    window?: number;
}) {
    const redis = getRedisClient();
    const key = `auth:limit:${identifier}`;

    const count = await redis.incr(key);
    if (count === 1) {
        await redis.expire(key, window);
    }

    return count <= limit;
}