import { Worker } from "bullmq";
import * as Config from "./config";
import { createRunAuditAction } from "./audit/actions/runAudit";
import { auditRepository } from "./app/adapters/redisAuditRepository";
import { publishEvent } from "./app/adapters/redisStreamPublisher";
import { bullClient } from "./app/services/redis";

// import './services/crawlWorker';
// import { startTelemetryLoop, stopTelemetryLoop } from './events/startTelemetryLoop';

// startTelemetryLoop();

// process.on(
//     'SIGTERM',
//     () => {
//         stopTelemetryLoop();
//         process.exit(0);
//     }
// )


new Worker<{ auditId: string }>(
    Config.bullmq.queue,
    async job => {
        await createRunAuditAction(
            auditRepository,
            publishEvent,
            {
                artifactDirectory: Config.crawler.artifactDirectory,
                archiveDirectory: Config.crawler.archiveDirectory,
                secretKey: Config.secretKey
            }
        ).run(job.data.auditId);
    },
    {
        connection: bullClient,
        concurrency: Config.bullmq.concurrency,
    }
)
