import getRedisClient from "../../config/get-redis-client.upstash";

export const redisCache = {
  get: async (key: string): Promise<string | null> => {
    const redis = getRedisClient();
    return redis.get(key);
  },

  set: async (key: string, value: string, ttlSeconds = 300) => {
    const redis = getRedisClient();
    return redis.set(key, value, { ex: ttlSeconds });
  },

  del: async (key: string) => {
    const redis = getRedisClient();
    return redis.del(key);
  },
};