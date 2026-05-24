import { Queue } from 'bullmq';
import { bullMqRedis } from '../lib/redis';
import { QUEUE_NAME } from './constants';
export const crawlQueue = new Queue(QUEUE_NAME, {
    connection: bullMqRedis,
    defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 1000,
        attempts: 1,
        backoff: {
            type: 'exponential',
            delay: 5000,
        }
    }
});
//# sourceMappingURL=queue.js.map