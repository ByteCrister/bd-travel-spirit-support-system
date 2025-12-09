import getRedisClient from "../../config/get-redis-client.upstash";

export async function rateLimit(
    key: string,
    limit = 5,
    window = 60
) {
    const redis = getRedisClient();
    const redisKey = `ratelimit:${key}`;

    const current = await redis.incr(redisKey);

    if (current === 1) {
        await redis.expire(redisKey, window);
    }

    return current <= limit;
}