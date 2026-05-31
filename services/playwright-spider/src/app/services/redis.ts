import { redis as config } from '../../config';
import Redis from "ioredis"

export const streamClient = new Redis(config);

export const cacheClient = new Redis({
    ...config,
    retryStrategy: (times) => Math.min(times * 50, 2000),
});

export const bullClient = new Redis({
    ...config,
    maxRetriesPerRequest: null,
    enableReadyCheck: false
});
