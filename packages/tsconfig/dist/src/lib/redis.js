import Redis from "ioredis";
const config = {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    maxRetriesPerRequest: null
};
export const redis = new Redis(config);
export const bullMqRedis = new Redis(config);
//# sourceMappingURL=redis.js.map