// src/config/get-redis-client.upstash.ts
import { Redis } from "@upstash/redis";

let redisStore: Redis | null = null;

const getRedisClient = (): Redis => {
    if (!redisStore) {
        redisStore = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL!,
            token: process.env.UPSTASH_REDIS_REST_TOKEN!,
        });

        console.log("Upstash Redis initialized");
    }

    return redisStore;
};

export default getRedisClient;