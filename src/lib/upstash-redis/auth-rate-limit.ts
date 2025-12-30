import getRedisClient from "../../config/get-redis-client.upstash";

/**
 * Rate-limit authentication attempts for a given identifier using Redis.
 *
 * Uses Redis INCR to count attempts and EXPIRE to set a sliding window TTL
 * when the counter is first created. Returns `true` if the attempt is allowed
 * (count is within the limit), otherwise `false`.
 *
 * @param params.identifier - Unique identifier for the requester (e.g., email or IP).
 *                            Should be normalized (trimmed, lowercased) by the caller
 *                            if you want consistent keys across variants.
 * @param params.limit - Maximum allowed attempts within the window. Defaults to 5.
 * @param params.window - Time window in seconds for the limit TTL. Defaults to 60 seconds.
 * @returns `true` when the current attempt is within the allowed limit; `false` otherwise.
 */
export async function authRateLimit({
    identifier,
    limit = 5,
    window = 60,
}: {
    identifier: string;      // Unique key for rate limiting; prefer normalized values
    limit?: number;          // Max attempts allowed in the window (integer)
    window?: number;         // Window length in seconds (integer)
}) {
    const redis = getRedisClient();

    // Redis key namespace for auth rate limiting to avoid collisions
    const key = `auth:limit:${identifier}`;

    // Atomically increment the counter for this key
    const count = await redis.incr(key);

    // If this is the first increment, set the TTL so the counter resets after `window` seconds
    if (count === 1) {
        await redis.expire(key, window);
    }

    // Allowed if the current count is less than or equal to the configured limit
    return count <= limit;
}