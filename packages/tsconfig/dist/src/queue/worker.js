import { Worker } from "bullmq";
import { CONCURRENCY, QUEUE_NAME } from "./constants";
import { bullMqRedis } from "../lib/redis";
import { runAuditJob } from "../crawler/auditJob";
export const crawlWorker = new Worker(QUEUE_NAME, async (job) => {
    await runAuditJob(job);
}, {
    connection: bullMqRedis,
    concurrency: CONCURRENCY,
});
//# sourceMappingURL=worker.js.map