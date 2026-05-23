import { Worker } from "bullmq";
import { CONCURRENCY, QUEUE_NAME } from "./constants";
import { bullMqRedis } from "../lib/redis";
import type { JobPayload } from "../crawler/auditJob";
import { runAuditJob } from "../crawler/auditJob";

export const crawlWorker = new Worker<JobPayload>(
    QUEUE_NAME,
    async job => {
        await runAuditJob(job);
    },
    {
        connection: bullMqRedis,
        concurrency: CONCURRENCY,
    }
)
