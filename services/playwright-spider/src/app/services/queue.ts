import { Queue } from 'bullmq';
import { bullClient } from './redis';
import { bullmq } from '../../config';

export const crawlerQueue = new Queue(
    bullmq.queue,
    {
        connection: bullClient,
        defaultJobOptions: {
            removeOnComplete: 100,
            removeOnFail: 1000,
            attempts: 1,
            backoff: {
                type: 'exponential',
                delay: 5000,
            }
        }
    }
);
