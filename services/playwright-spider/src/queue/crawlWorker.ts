import { Worker } from "bullmq";
import { CONCURRENCY, QUEUE_NAME } from "./constants";
import { bullMqRedis } from "../lib/redis";
import type { JobPayload } from "../crawler/auditJob";
import { runAuditJob } from "../crawler/auditJob";
import { publishEvent } from "../events/publishEvent";
import { publishQueuePositions } from "../events/publishQueuePositions";

export const crawlWorker = new Worker<JobPayload>(
    QUEUE_NAME,
    async job => {
        await publishEvent({
            type: 'audit.started',
            payload: {
                crawlId: job?.id
            }
        });
        await publishQueuePositions();
        await runAuditJob(job);
    },
    {
        connection: bullMqRedis,
        concurrency: CONCURRENCY,
    }
)

crawlWorker.on('completed', async job => {
    await publishEvent({
        type: 'audit.completed',
        payload: {
            crawlId: job?.id
        }
    });
    await publishQueuePositions();
});

crawlWorker.on('failed', async (job, error) => {
    await publishEvent({
        type: 'audit.failed',
        payload: {
            crawlId: job?.id,
            error: error.message
        }
    });
    await publishQueuePositions();
});
